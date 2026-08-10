// Disk-backed FileSystemProvider for the real VS Code Extension Host.
// Implements the standard VS Code IFileSystemProvider contract over the
// app's existing Electron IPC (fs:*) so the real file service, scanner and
// workspace.fs can read/write the actual opened folder and installed
// extensions. Registered for the `vscode-file` scheme (vscode-file://vscode-app)
// and as an overlay on the `file` scheme.
import { Event, Emitter } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import {
  FileType,
  FileChangeType,
  FileSystemProviderCapabilities,
  FileSystemProviderErrorCode,
  createFileSystemProviderError,
} from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files";

const api = window.electronAPI;

const NOT_FOUND = () => createFileSystemProviderError("File not found", FileSystemProviderErrorCode.FileNotFound);
const FORBIDDEN = () => createFileSystemProviderError("Forbidden", FileSystemProviderErrorCode.NoPermissions);

// Resolve the real OS path for a file:/vscode-file:/vscode-userdata: URI.
function toFsPath(uri) {
  if (uri.scheme === "vscode-userdata") {
    const p = decodeURIComponent(uri.path);
    const i = p.indexOf("/User/");
    if (i >= 0) return p.slice(i + 6);
    return p;
  }
  return uri.fsPath;
}

export class DiskFileSystemProvider {
  constructor(getRoots) {
    this._getRoots = getRoots;
    this.capabilities =
      FileSystemProviderCapabilities.FileReadWrite |
      FileSystemProviderCapabilities.PathCaseSensitive;
    this.onDidChangeCapabilities = Event.None;
    this._onDidChangeFile = new Emitter();
    this.onDidChangeFile = this._onDidChangeFile.event;
    this._watchCount = 0;
    this._watched = new Set();
    api.onFsChange?.((dir) => this._handleRootChange(dir));
  }

  _isAllowed(fsPath) {
    const roots = this._getRoots() || [];
    const p = String(fsPath).replace(/[\\/]+$/, "").toLowerCase();
    for (const root of roots) {
      if (!root) continue;
      const r = String(root).replace(/[\\/]+$/, "").toLowerCase();
      if (p === r || p.startsWith(r + "\\") || p.startsWith(r + "/")) return true;
    }
    return false;
  }

  _handleRootChange(dir) {
    if (!dir || !this._watched.size) return;
    const dirUri = URI.file(dir);
    const changes = [];
    for (const watchedUri of this._watched) {
      const wPath = watchedUri.fsPath.replace(/[\\/]+$/, "").toLowerCase();
      const dPath = String(dir).replace(/[\\/]+$/, "").toLowerCase();
      if (dPath === wPath || dPath.startsWith(wPath + "\\") || dPath.startsWith(wPath + "/")) {
        changes.push({ resource: dirUri, type: FileChangeType.CHANGED });
      }
    }
    if (changes.length) this._onDidChangeFile.fire(changes);
  }

  async readFile(uri) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) {
      console.warn("[diskfs:readFile] FORBIDDEN", uri.toString(), "->", fsPath);
      throw FORBIDDEN();
    }
    const res = await api.vscodeFsReadFile(fsPath);
    if (!res || !res.success) console.warn("[diskfs:readFile] FAIL", uri.toString(), "->", fsPath, "res:", res);
    if (!res || !res.success) throw NOT_FOUND();
    const bin = atob(res.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async writeFile(uri, content) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) throw FORBIDDEN();
    let base64;
    try {
      const bin = String.fromCharCode(...content);
      base64 = btoa(bin);
    } catch {
      const bin = Array.from(content, (b) => String.fromCharCode(b)).join("");
      base64 = btoa(bin);
    }
    const res = await api.vscodeFsWriteFile(fsPath, base64);
    if (!res || !res.success) throw createFileSystemProviderError(res?.error || "Unable to write file", FileSystemProviderErrorCode.Unknown);
  }

  async stat(uri) {
    const fsPath = toFsPath(uri);
    const allow = this._isAllowed(fsPath);
    if (!allow) console.warn("[diskfs:stat] FORBIDDEN", uri.toString(), "->", fsPath, "roots:", this._getRoots());
    if (!this._isAllowed(fsPath)) throw FORBIDDEN();
    const res = await api.stat(fsPath);
    if (!res || !res.exists) console.warn("[diskfs:stat] NOT_FOUND", uri.toString(), "->", fsPath, "res:", res);
    if (!res || !res.exists) throw NOT_FOUND();
    const type = res.isDir ? FileType.Directory : FileType.File;
    return {
      resource: uri,
      name: String(fsPath).split(/[\\/]/).pop(),
      type,
      size: res.size ?? 0,
      mtime: res.mtime ? new Date(res.mtime).getTime() : 0,
      ctime: res.birthtime ? new Date(res.birthtime).getTime() : 0,
      isDirectory: res.isDir,
      isFile: !res.isDir,
      isSymbolicLink: false,
    };
  }

  async readDirectory(uri) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) throw FORBIDDEN();
    const entries = await api.readDirAll(fsPath);
    if (!entries) throw NOT_FOUND();
    return entries.map((e) => [e.name, e.isDir ? FileType.Directory : FileType.File]);
  }

  async mkdir(uri) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) throw FORBIDDEN();
    const res = await api.vscodeFsMkdir(fsPath);
    if (!res || !res.success) throw createFileSystemProviderError(res?.error || "Unable to create directory", FileSystemProviderErrorCode.Unknown);
  }

  async delete(uri) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) throw FORBIDDEN();
    await api.deleteItem(fsPath);
  }

  async rename(from, to) {
    const fromPath = toFsPath(from);
    const toPath = toFsPath(to);
    if (!this._isAllowed(fromPath) || !this._isAllowed(toPath)) throw FORBIDDEN();
    const res = await api.vscodeFsRename(fromPath, toPath);
    if (!res || !res.success) throw createFileSystemProviderError(res?.error || "Unable to rename", FileSystemProviderErrorCode.Unknown);
  }

  watch(uri) {
    const fsPath = toFsPath(uri);
    if (!this._isAllowed(fsPath)) return { dispose() {} };
    if (this._watchCount === 0 && api.watchDir) {
      api.watchDir(this._getRoots()[0]);
    }
    this._watchCount++;
    this._watched.add(uri);
    return { dispose: () => this._unwatch(uri) };
  }

  _unwatch(uri) {
    this._watched.delete(uri);
    this._watchCount = Math.max(0, this._watchCount - 1);
    if (this._watchCount === 0 && api.unwatchDir) {
      api.unwatchDir(this._getRoots()[0]);
    }
  }
}
