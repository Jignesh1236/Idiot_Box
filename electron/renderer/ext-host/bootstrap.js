// Extension Host bootstrap: prepares the REAL VS Code extension environment
// before the monaco-vscode-api services initialize.
//   - registers the disk-backed FileSystemProvider (vscode-file + file overlay)
//   - installs the direct worker transport for the web worker host
//   - Phase B: registers the REAL Node/Desktop Extension Host
//     (setLocalExtensionHost) and registers main-entry (Node/Desktop)
//     extensions for the LocalProcess host via the api's registerExtension
//   - builds the workbench construction options: workspace + installed
//     web extensions (additionalBuiltinExtensions) from the app's vsix store
// Side-effect first: registers IStatusbarService (footer-backed adapter) so
// MainThreadStatusBar / IExtensionStatusBarItemService resolve when the
// extension host connects.
import "./status-bar.js";
import { FooterStatusbarService, FooterExtensionStatusBarItemService } from "./status-bar.js";
import { registerCustomProvider, registerFileSystemOverlay } from "@codingame/monaco-vscode-files-service-override";
import { Event, Emitter } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { newWriteableStream } from "@codingame/monaco-vscode-api/vscode/vs/base/common/stream";
import { Schemas } from "@codingame/monaco-vscode-api/vscode/vs/base/common/network";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import {
  FileSystemProviderCapabilities,
  FileSystemProviderErrorCode,
  createFileSystemProviderError,
} from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files";
import { getService } from "@codingame/monaco-vscode-api";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import getExtensionsServiceOverride, { setLocalExtensionHost } from "@codingame/monaco-vscode-extensions-service-override";
import { registerExtension, ExtensionHostKind } from "@codingame/monaco-vscode-api/extensions";
import { DiskFileSystemProvider } from "./disk-fs-provider.js";
import { installWebWorkerHostTransport } from "./host-overrides.js";
import { NodeLocalProcessExtensionHost, setNodeExtHostMap } from "./node-local-host.js";
import "./diag-customers.js";

const api = window.electronAPI;

let projectPath = null;
let extensionDirs = [];
let localProcessExtensions = [];

// Phase B classification:
//   - extensions with a `main` entry but NO `browser` entry are Node/Desktop
//     extensions -> REAL Node/Desktop Extension Host (LocalProcess)
//   - PHASE_B_FORCED_IDS: extensions that are also web-compatible but must run
//     on the real Node host (e.g. redhat.vscode-yaml, whose language server
//     only works from the Node host)
// Everything else keeps using the Phase A WebWorker host. An extension is
// registered for exactly ONE host (never both).
const PHASE_B_FORCED_IDS = new Set(["redhat.vscode-yaml"]);
const extIdOf = (e) => `${String(e.publisher || "").toLowerCase()}.${String(e.name || "").toLowerCase()}`;

async function loadWorkspaceAndExtensions() {
  try {
    projectPath = (await api.getProjectPath?.()) || null;
  } catch {
    projectPath = null;
  }
  try {
    const installed = (await api.vsxListInstalled?.()) || [];
    localProcessExtensions = installed.filter(
      (e) =>
        e.enabled !== false &&
        e.dir &&
        e.manifest &&
        ((e.manifest.main && !e.manifest.browser) || PHASE_B_FORCED_IDS.has(extIdOf(e)))
    );
    extensionDirs = installed
      .filter((e) => e.enabled !== false && e.dir && !localProcessExtensions.includes(e))
      .map((e) => e.dir);
  } catch {
    extensionDirs = [];
    localProcessExtensions = [];
  }
}

const roots = () => [projectPath, ...extensionDirs].filter(Boolean);

// additionalBuiltinExtensions entries: { id } | URI components. Installed
// extensions are passed as file: URI components; the real scanner reads
// <location>/package.json through the file service (disk provider above).
function toUriComponents(dir) {
  try {
    const u = URI.file(dir);
    return { scheme: u.scheme, authority: u.authority, path: u.path };
  } catch {
    return null;
  }
}

// Phase B: serves the api's extension-file://<id>/... locations from the real
// installed extension folders, so static contributions (grammars, configs,
// snippets) of LocalProcess extensions load through the real file service.
class ExtensionFileSystemProvider {
  constructor(extMap, delegate) {
    this._extMap = extMap;
    this._delegate = delegate;
    this.capabilities = delegate.capabilities;
    this.onDidChangeCapabilities = Event.None;
    this.onDidChangeFile = Event.None;
  }
  has(authority) {
    return Object.prototype.hasOwnProperty.call(this._extMap, authority);
  }
  _toFile(uri) {
    const dir = this._extMap[uri.authority];
    if (!dir) {
      throw createFileSystemProviderError(`Unknown extension authority '${uri.authority}'`, FileSystemProviderErrorCode.FileNotFound);
    }
    const rel = decodeURIComponent(uri.path).replace(/^\/+/, "").replace(/\//g, "\\");
    return URI.file(dir + "\\" + rel);
  }
  readFile(uri) { return this._delegate.readFile(this._toFile(uri)); }
  writeFile(uri, content) { return this._delegate.writeFile(this._toFile(uri), content); }
  stat(uri) { return this._delegate.stat(this._toFile(uri)); }
  readDirectory(uri) { return this._delegate.readDirectory(this._toFile(uri)); }
  mkdir(uri) { return this._delegate.mkdir(this._toFile(uri)); }
  delete(uri) { return this._delegate.delete(this._toFile(uri)); }
  rename(from, to) { return this._delegate.rename(this._toFile(from), this._toFile(to)); }
  watch(uri) { return this._delegate.watch(this._toFile(uri)); }
}

// Serves the `extension-file` scheme from BOTH sources without losing either:
//   - authorities of Node/Desktop (LocalProcess) extensions -> the disk-backed
//     provider (installed extension folders)
//   - everything else (built-in extensions: vscode.theme-defaults,
//     vscode.builtin-textmate, ...) -> the default RegisteredFileSystemProvider
//     that monaco-vscode's files-service-override built at module load and that
//     registerFileUrl()/registerExtensionFile() wrote the built-in themes and
//     grammars into.
// The default provider instance is module-private in the files-service-override,
// so it can only be captured from the LIVE FileService after initialize() (the
// provider map). We then swap this composite in its place, because
// FileService.registerProvider() throws on duplicate schemes.
class CompositeExtensionFileSystemProvider {
  constructor(nodeExtProvider, defaultProvider) {
    this._nodeExt = nodeExtProvider;
    this._default = defaultProvider;
    this.capabilities =
      FileSystemProviderCapabilities.FileReadWrite |
      FileSystemProviderCapabilities.PathCaseSensitive;
    this.onDidChangeCapabilities = Event.None;
    this._onDidChangeFile = new Emitter();
    this.onDidChangeFile = this._onDidChangeFile.event;
    this._subs = [];
    if (nodeExtProvider && nodeExtProvider.onDidChangeFile !== Event.None) {
      this._subs.push(nodeExtProvider.onDidChangeFile((e) => this._onDidChangeFile.fire(e)));
    }
    if (defaultProvider && defaultProvider.onDidChangeFile !== Event.None) {
      this._subs.push(defaultProvider.onDidChangeFile((e) => this._onDidChangeFile.fire(e)));
    }
  }
  _delegateFor(uri) {
    return this._nodeExt && this._nodeExt.has(uri.authority) ? this._nodeExt : this._default;
  }
  readFile(uri) { return this._delegateFor(uri).readFile(uri); }
  writeFile(uri, content, opts) { return this._delegateFor(uri).writeFile(uri, content, opts); }
  stat(uri) { return this._delegateFor(uri).stat(uri); }
  readdir(uri) {
    const d = this._delegateFor(uri);
    return typeof d.readdir === "function" ? d.readdir(uri) : d.readDirectory(uri);
  }
  readFileStream(uri, opts, token) {
    const d = this._delegateFor(uri);
    if (typeof d.readFileStream === "function") return d.readFileStream(uri, opts, token);
    const stream = newWriteableStream((data) =>
      VSBuffer.concat(data.map((x) => VSBuffer.wrap(x))).buffer
    );
    void d.readFile(uri).then(
      (buffer) => stream.end(buffer),
      (err) => {
        stream.error(err);
        stream.end();
      }
    );
    return stream;
  }
  mkdir(uri) { return this._delegateFor(uri).mkdir(uri); }
  delete(uri) { return this._delegateFor(uri).delete(uri); }
  rename(from, to) { return this._delegateFor(from).rename(from, to); }
  watch(uri) { return this._delegateFor(uri).watch(uri); }
}

// Node/Desktop extension authorities and their disk-backed provider, kept at
// module scope so the composite can be built after initialize().
let nodeExtProvider = null;
let nodeExtAuthorities = new Set();

// Post-initialize: replace the live extension-file registration with the
// composite so built-in extension files (themes/grammars) AND Node/Desktop
// extension files resolve through the real file service.
export async function installExtensionFileComposite() {
  if (!nodeExtProvider) return;
  const fileService = await getService(IFileService);
  const existing = fileService.provider?.get("extension-file");
  if (!existing) return;
  fileService.provider.set("extension-file", new CompositeExtensionFileSystemProvider(nodeExtProvider, existing));
}

function buildConstructionOptions() {
  const options = {};
  if (projectPath) {
    options.workspaceProvider = {
      workspace: { folderUri: URI.file(projectPath), id: projectPath },
    };
  }
  const additionalBuiltinExtensions = extensionDirs.map(toUriComponents).filter(Boolean);
  if (additionalBuiltinExtensions.length) {
    options.additionalBuiltinExtensions = additionalBuiltinExtensions;
  }
  return options;
}

let ready = null;

// Call BEFORE monaco-vscode-api initialize(). Returns service overrides to
// spread into initialize(overrides, container, configuration).
export function prepareRealExtensionHost() {
  if (!ready) {
    ready = (async () => {
      installWebWorkerHostTransport();
      await loadWorkspaceAndExtensions();
      // Phase B: register the REAL Node/Desktop Extension Host and route
      // Node/Desktop extensions to it (api's own mechanism).
      setLocalExtensionHost(NodeLocalProcessExtensionHost);
      const nodeExtMap = {};
      for (const e of localProcessExtensions) {
        registerExtension(e.manifest, ExtensionHostKind.LocalProcess, { path: "/extension" });
        nodeExtMap[`${e.manifest.publisher}.${e.manifest.name}`] = e.dir;
      }
      nodeExtAuthorities = new Set(Object.keys(nodeExtMap));
      if (Object.keys(nodeExtMap).length) {
        setNodeExtHostMap(nodeExtMap);
      }
      const diskProvider = new DiskFileSystemProvider(roots);
      registerCustomProvider(Schemas.vscodeFileResource, diskProvider);
      registerFileSystemOverlay(1, diskProvider);
      // The custom extension-file provider is NOT registered here: pre-init
      // registration would replace the default RegisteredFileSystemProvider
      // (which owns the built-in themes/grammars registered by the default
      // extensions) before the FileService is constructed, orphaning it.
      // Instead the disk-backed provider is held back and the composite is
      // installed on the LIVE FileService after initialize() (see
      // installExtensionFileComposite).
      nodeExtProvider = Object.keys(nodeExtMap).length
        ? new ExtensionFileSystemProvider(nodeExtMap, diskProvider)
        : null;
      const footerStatusbar = new FooterStatusbarService();
      const extensionStatusBarItems = new FooterExtensionStatusBarItemService(footerStatusbar);
      return {
        overrides: {
          ...getExtensionsServiceOverride({ enableWorkerExtensionHost: true }),
          statusbarService: footerStatusbar,
          IExtensionStatusBarItemService: extensionStatusBarItems,
        },
        configuration: buildConstructionOptions(),
      };
    })();
  }
  return ready;
}
