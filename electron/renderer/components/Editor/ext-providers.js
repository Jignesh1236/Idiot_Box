// Extension-host provider bridge — connects Monaco's provider registries to
// providers registered by installed VS Code extensions (running in the Node
// extension host) over the extHost:* IPC channels.
//
// - The main process announces provider registrations/disposals over
//   "extHost:event" ({ type: "provider" }); each registration gets one set of
//   Monaco provider registrations here.
// - Provider calls go back to the host via extProviderRequest(providerId,
//   method, params) with plain JSON params; results are converted to Monaco
//   native types.
// - Diagnostics, status bar items, output, workspace actions and host state
//   from the event stream are forwarded to the UI (custom window events +
//   IMarkerService).

import { getService, ILanguageFeaturesService, IMarkerService } from "@codingame/monaco-vscode-api";
import { MarkerSeverity } from "@codingame/monaco-vscode-api/vscode/vs/platform/markers/common/markers";
import {
  CompletionItemKind,
  CompletionItemInsertTextRule,
} from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages";
import { Range } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/core/range";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import * as monaco from "@codingame/monaco-vscode-api/monaco";
import { registerModelPath, unregisterModelPath, clearDiagnostics } from "./lsp-providers.js";
import { isVirtualUri } from "./embedded/virtual-document.js";

let api = null;
let lfs = null;
let markerService = null;
let unsub = null;

const active = new Map(); // providerId -> { kind, disposables: [] }
const hostCommandDisposables = new Map(); // commandId -> Disposable (Monaco command registry)

export { registerModelPath, unregisterModelPath, clearDiagnostics };

export const initExtProviders = () => {
  if (api) return api;
  api = window.electronAPI;
  if (!api || !api.onExtEvent) return null;
  unsub?.();
  unsub = api.onExtEvent(handleEvent);
  Promise.all([getService(ILanguageFeaturesService), getService(IMarkerService)])
    .then(([f, m]) => { lfs = f; markerService = m; })
    .catch(() => {});
  return api;
};

export const disposeExtProviders = () => {
  unsub?.();
  unsub = null;
  for (const [, rec] of active) disposeAll(rec.disposables);
  active.clear();
};

const disposeAll = (arr) => {
  for (const d of arr) { try { d.dispose(); } catch {} }
  arr.length = 0;
};

// ── Event stream ─────────────────────────────────────────────────────────────
const handleEvent = (ev) => {
  if (!ev || !ev.type) return;
  if (ev.type === "provider") {
    if (ev.action === "register") registerProvider(ev);
    else if (ev.action === "dispose") disposeProvider(ev.id);
  } else if (ev.type === "diagnostics") {
    applyDiagnostics(ev);
  } else if (ev.type === "statusbar") {
    window.dispatchEvent(new CustomEvent("ext-statusbar", { detail: ev.item }));
  } else if (ev.type === "output" || ev.type === "outputShow" || ev.type === "outputHide" || ev.type === "outputDispose") {
    window.dispatchEvent(new CustomEvent("ext-output", { detail: ev }));
  } else if (ev.type === "webview") {
    window.dispatchEvent(new CustomEvent("ext-webview", { detail: ev }));
  } else if (ev.type === "treeview") {
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: ev }));
  } else if (ev.type === "error") {
    window.dispatchEvent(new CustomEvent("ext-error", { detail: ev }));
  } else if (ev.type === "workspace") {
    if (ev.action === "open") {
      window.dispatchEvent(new CustomEvent("open-file-in-editor", { detail: { path: ev.path } }));
    } else if (ev.action === "applyEdit") {
      const path = ev.edits && ev.edits.length ? uriToPath(ev.edits[0].uri) : null;
      window.dispatchEvent(new CustomEvent("editor:applyEdits", { detail: { path, edits: ev.edits || [] } }));
    }
  } else if (ev.type === "ext-activation" || ev.type === "ext-deactivated" || ev.type === "hostState" || ev.type === "command" || ev.type === "config") {
    if (ev.type === "command") handleHostCommand(ev);
    window.dispatchEvent(new CustomEvent("ext-host", { detail: ev }));
  }
};

// ── Host command bridge ───────────────────────────────────────────────────────
// Host-registered commands (vscode.commands.registerCommand) are mirrored into
// Monaco's command registry so that code action commands, completion commands
// etc. can be executed from the UI; execution routes back to the extension
// host over extHostRunCommand.
const handleHostCommand = (ev) => {
  if (!monaco?.CommandsRegistry?.registerCommand) return;
  if (ev.action === "register") {
    if (hostCommandDisposables.has(ev.id)) return;
    try {
      const d = monaco.CommandsRegistry.registerCommand(ev.id, (...args) =>
        window.electronAPI
          .extHostRunCommand(ev.id, args)
          .then((r) => (r && r.success ? r.result : undefined))
          .catch(() => undefined)
      );
      if (d && typeof d.dispose === "function") hostCommandDisposables.set(ev.id, d);
      else hostCommandDisposables.set(ev.id, { dispose() {} });
    } catch {}
  } else if (ev.action === "unregister") {
    const d = hostCommandDisposables.get(ev.id);
    if (d) { try { d.dispose(); } catch {} hostCommandDisposables.delete(ev.id); }
  }
};

// ── Provider registration ────────────────────────────────────────────────────
const toMonacoSelector = (sel) => {
  if (!sel) return { scheme: "file" };
  if (typeof sel === "string") return sel;
  if (Array.isArray(sel)) return sel.map(toMonacoSelector);
  const out = {};
  if (sel.language) out.language = sel.language;
  if (sel.scheme) out.scheme = sel.scheme;
  if (sel.pattern) out.pattern = sel.pattern;
  return out;
};

const registerProvider = (ev) => {
  if (!lfs) return;
  if (active.has(ev.id)) return;
  const disposables = [];
  const sel = toMonacoSelector(ev.selector);
  const provider = makeProvider(ev);
  const register = lfsRegister[ev.kind];
  if (register) {
    try {
      const d = register(lfs, sel, provider);
      disposables.push(d);
      active.set(ev.id, { kind: ev.kind, disposables });
    } catch (err) {
      console.error("[extHost] provider registration failed:", ev.kind, err);
    }
  }
};

const disposeProvider = (id) => {
  const rec = active.get(id);
  if (!rec) return;
  disposeAll(rec.disposables);
  active.delete(id);
};

const lfsRegister = {
  completion: (lfs2, sel, p) => lfs2.completionProvider.register(sel, p),
  hover: (lfs2, sel, p) => lfs2.hoverProvider.register(sel, p),
  definition: (lfs2, sel, p) => lfs2.definitionProvider.register(sel, p),
  typeDefinition: (lfs2, sel, p) => lfs2.typeDefinitionProvider.register(sel, p),
  implementation: (lfs2, sel, p) => lfs2.implementationProvider.register(sel, p),
  references: (lfs2, sel, p) => lfs2.referenceProvider.register(sel, p),
  documentSymbol: (lfs2, sel, p) => lfs2.documentSymbolProvider.register(sel, p),
  // NOTE: Monaco (monaco-editor language features) has no workspaceSymbol
  // registry — workspace symbols are a contributed service, not an
  // ILanguageFeaturesService registry. "workspaceSymbol" registrations are
  // therefore skipped here (they were never registrable in the first place).
  signatureHelp: (lfs2, sel, p) => lfs2.signatureHelpProvider.register(sel, p),
  rename: (lfs2, sel, p) => lfs2.renameProvider.register(sel, p),
  formatting: (lfs2, sel, p) => lfs2.documentFormattingEditProvider.register(sel, p),
  rangeFormatting: (lfs2, sel, p) => lfs2.documentRangeFormattingEditProvider.register(sel, p),
  codeAction: (lfs2, sel, p) => lfs2.codeActionProvider.register(sel, p),
  codeLens: (lfs2, sel, p) => lfs2.codeLensProvider.register(sel, p),
  documentHighlight: (lfs2, sel, p) => lfs2.documentHighlightProvider.register(sel, p),
  documentLink: (lfs2, sel, p) => lfs2.documentLinkProvider.register(sel, p),
};

// ── Params (Monaco -> host) ──────────────────────────────────────────────────
const toDoc = (model) => ({
  uri: model.uri.toString(),
  languageId: model.getLanguageId(),
  text: model.getValue(),
  version: model.getVersionId(),
});
const toPos = (pos) => ({ line: pos.lineNumber - 1, character: pos.column - 1 });
const toRange = (r) => ({
  start: { line: r.startLineNumber - 1, character: r.startColumn - 1 },
  end: { line: r.endLineNumber - 1, character: r.endColumn - 1 },
});

const request = (providerId, method, params) => {
  if (!window.electronAPI.extProviderRequest) return Promise.resolve(undefined);
  return window.electronAPI.extProviderRequest(providerId, method, params).catch((err) => {
    console.warn("[extHost] provider request failed:", method, err?.message || err);
    return undefined;
  });
};

// ── Results (host -> Monaco) ─────────────────────────────────────────────────
const toMonacoRange = (r) => new Range(r.start.line + 1, r.start.character + 1, r.end.line + 1, r.end.character + 1);

const KIND_MAP = {
  0: CompletionItemKind.Text,
  1: CompletionItemKind.Method,
  2: CompletionItemKind.Function,
  3: CompletionItemKind.Constructor,
  4: CompletionItemKind.Field,
  5: CompletionItemKind.Variable,
  6: CompletionItemKind.Class,
  7: CompletionItemKind.Interface,
  8: CompletionItemKind.Module,
  9: CompletionItemKind.Property,
  10: CompletionItemKind.Unit,
  11: CompletionItemKind.Value,
  12: CompletionItemKind.Enum,
  13: CompletionItemKind.Keyword,
  14: CompletionItemKind.Snippet,
  15: CompletionItemKind.Color,
  16: CompletionItemKind.File,
  17: CompletionItemKind.Reference,
  18: CompletionItemKind.Folder,
  19: CompletionItemKind.EnumMember,
  20: CompletionItemKind.Constant,
  21: CompletionItemKind.Struct,
  22: CompletionItemKind.Event,
  23: CompletionItemKind.Operator,
  24: CompletionItemKind.TypeParameter,
};

const toDocValue = (d) => {
  if (!d) return undefined;
  if (typeof d === "string") return { value: d };
  if (d.value !== undefined) return { value: String(d.value) };
  return { value: JSON.stringify(d) };
};

const toCompletion = (i) => {
  const item = {
    label: i.label || "",
    kind: KIND_MAP[i.kind] ?? CompletionItemKind.Text,
    detail: i.detail,
    documentation: toDocValue(i.documentation),
    sortText: i.sortText,
    filterText: i.filterText,
    preselect: !!i.preselect,
    tags: i.tags,
  };
  if (i.textEdit) {
    item.insertText = i.textEdit.newText;
    item.range = toMonacoRange(i.textEdit.range);
  } else if (i.insertText !== undefined) {
    item.insertText = i.insertText;
  }
  if (i.insertTextFormat === 2) item.insertTextRules = CompletionItemInsertTextRule.InsertAsSnippet;
  if (i.additionalTextEdits?.length) {
    item.additionalTextEdits = i.additionalTextEdits.map((e) => ({ range: toMonacoRange(e.range), text: e.newText }));
  }
  if (i.command) item.command = { id: i.command.id, title: i.command.title };
  return item;
};

const toLocation = (l) => (l && l.uri && l.range ? { uri: URI.parse(l.uri), range: toMonacoRange(l.range) } : null);

const toSymbol = (s) => ({
  name: s.name || "",
  detail: s.detail,
  kind: s.kind ?? 0,
  tags: s.tags,
  range: toMonacoRange(s.range || s.location?.range),
  selectionRange: toMonacoRange(s.selectionRange || s.location?.range || s.range),
  children: (s.children || []).map(toSymbol),
});

const toMarker = (d) => ({
  severity: d.severity === 1 ? MarkerSeverity.Warning : d.severity === 2 ? MarkerSeverity.Info : d.severity === 3 ? MarkerSeverity.Hint : MarkerSeverity.Error,
  message: d.message || "Diagnostic",
  startLineNumber: (d.range?.start?.line ?? 0) + 1,
  startColumn: (d.range?.start?.character ?? 0) + 1,
  endLineNumber: (d.range?.end?.line ?? 0) + 1,
  endColumn: Math.max((d.range?.end?.character ?? 0) + 1, (d.range?.start?.character ?? 0) + 1),
  source: d.source || undefined,
  code: d.code ?? undefined,
});

const toEdits = (we) => {
  const out = [];
  for (const [uri, changes] of Object.entries((we && we.changes) || {})) {
    for (const e of changes || []) out.push({ resource: URI.parse(uri), textEdit: { range: toMonacoRange(e.range), text: e.newText } });
  }
  for (const dc of (we && we.documentChanges) || []) {
    const uri = dc.textDocument?.uri;
    if (!uri) continue;
    for (const e of dc.edits || []) out.push({ resource: URI.parse(uri), textEdit: { range: toMonacoRange(e.range), text: e.newText } });
  }
  return out;
};

// ── Provider builders ────────────────────────────────────────────────────────
const makeProvider = (ev) => {
  const id = ev.id;
  switch (ev.kind) {
    case "completion":
      return {
        triggerCharacters: ev.triggerCharacters || [],
        provideCompletionItems: async (model, position, ctx) => {
          const r = await request(id, "provideCompletionItems", {
            document: toDoc(model),
            position: toPos(position),
            context: { triggerKind: ctx?.triggerKind ?? 0, triggerCharacter: ctx?.triggerCharacter },
          });
          return { incomplete: !!r?.isIncomplete, suggestions: (r?.items || []).map(toCompletion) };
        },
      };
    case "hover":
      return {
        provideHover: async (model, position) => {
          const r = await request(id, "provideHover", { document: toDoc(model), position: toPos(position) });
          if (!r || r.contents === undefined) return null;
          const contents = (Array.isArray(r.contents) ? r.contents : [r.contents]).map(toDocValue).filter(Boolean);
          return { contents, range: r.range ? toMonacoRange(r.range) : undefined };
        },
      };
    case "definition":
      return {
        provideDefinition: async (model, position) => {
          const r = await request(id, "provideDefinition", { document: toDoc(model), position: toPos(position) });
          return toLocations(r);
        },
      };
    case "typeDefinition":
      return {
        provideTypeDefinition: async (model, position) => {
          const r = await request(id, "provideTypeDefinition", { document: toDoc(model), position: toPos(position) });
          return toLocations(r);
        },
      };
    case "implementation":
      return {
        provideImplementation: async (model, position) => {
          const r = await request(id, "provideImplementation", { document: toDoc(model), position: toPos(position) });
          return toLocations(r);
        },
      };
    case "references":
      return {
        provideReferences: async (model, position, ctx) => {
          const r = await request(id, "provideReferences", {
            document: toDoc(model),
            position: toPos(position),
            context: { includeDeclaration: ctx?.includeDeclaration ?? true },
          });
          return toLocations(r) || [];
        },
      };
    case "documentSymbol":
      return {
        provideDocumentSymbols: async (model) => {
          const r = await request(id, "provideDocumentSymbols", { document: toDoc(model) });
          if (!Array.isArray(r) || !r.length) return [];
          if (r[0].location && r[0].location.uri) {
            return r.map((s) => ({
              name: s.name || "",
              containerName: s.containerName,
              kind: s.kind ?? 0,
              location: { uri: URI.parse(s.location.uri), range: toMonacoRange(s.location.range) },
            }));
          }
          return r.map(toSymbol);
        },
      };
    case "workspaceSymbol":
      return {
        provideWorkspaceSymbols: async (query) => {
          const r = await request(id, "provideWorkspaceSymbols", { query: query || "" });
          return (r || []).map((s) => ({
            name: s.name || "",
            containerName: s.containerName,
            kind: s.kind ?? 0,
            tags: s.tags,
            location: s.location ? { uri: URI.parse(s.location.uri), range: toMonacoRange(s.location.range) } : null,
          }));
        },
      };
    case "signatureHelp":
      return {
        signatureHelpTriggerCharacters: ev.triggerCharacters || [],
        signatureHelpRetriggerCharacters: [],
        provideSignatureHelp: async (model, position, _token, ctx) => {
          const r = await request(id, "provideSignatureHelp", {
            document: toDoc(model),
            position: toPos(position),
            context: {
              triggerKind: ctx?.triggerKind ?? 1,
              triggerCharacter: ctx?.triggerCharacter,
              isRetrigger: !!ctx?.isRetrigger,
            },
          });
          if (!r) return null;
          return {
            value: {
              signatures: (r.signatures || []).map((s) => ({
                label: s.label || "",
                documentation: toDocValue(s.documentation),
                parameters: (s.parameters || []).map((pa) => ({ label: pa.label, documentation: toDocValue(pa.documentation) })),
                activeParameter: s.activeParameter ?? 0,
              })),
              activeSignature: r.activeSignature ?? 0,
              activeParameter: r.activeParameter ?? 0,
            },
            dispose() {},
          };
        },
      };
    case "rename":
      return {
        resolveRenameLocation: async (model, position) => {
          const r = await request(id, "prepareRename", { document: toDoc(model), position: toPos(position) });
          if (!r) return null;
          const range = r.range ? toMonacoRange(r.range) : r.start ? toMonacoRange(r) : null;
          if (!range) return null;
          return { range, text: r.placeholder !== undefined ? String(r.placeholder) : model.getValueInRange(range) };
        },
        provideRenameEdits: async (model, position, newName) => {
          const r = await request(id, "provideRenameEdits", { document: toDoc(model), position: toPos(position), newName });
          if (!r || !r.edits) return null;
          return { edits: r.edits.map((e) => ({ resource: URI.parse(e.uri), textEdit: { range: toMonacoRange(e.range), text: e.text } })) };
        },
      };
    case "formatting":
      return {
        provideDocumentFormattingEdits: async (model, options) => {
          const r = await request(id, "provideDocumentFormattingEdits", {
            document: toDoc(model),
            options: { tabSize: options.tabSize || 2, insertSpaces: options.insertSpaces ?? true },
          });
          return (r || []).map((e) => ({ range: toMonacoRange(e.range), text: e.newText }));
        },
      };
    case "rangeFormatting":
      return {
        provideDocumentRangeFormattingEdits: async (model, range, options) => {
          const r = await request(id, "provideDocumentRangeFormattingEdits", {
            document: toDoc(model),
            range: toRange(range),
            options: { tabSize: options.tabSize || 2, insertSpaces: options.insertSpaces ?? true },
          });
          return (r || []).map((e) => ({ range: toMonacoRange(e.range), text: e.newText }));
        },
      };
    case "codeAction":
      return {
        provideCodeActions: async (model, range, ctx) => {
          const r = await request(id, "provideCodeActions", {
            document: toDoc(model),
            range: toRange(range),
            context: {
              diagnostics: (ctx?.markers || []).map((m) => ({
                $kind: "diagnostic",
                range: {
                  $kind: "range",
                  start: { $kind: "position", line: m.startLineNumber - 1, character: m.startColumn - 1 },
                  end: { $kind: "position", line: m.endLineNumber - 1, character: Math.max(m.endColumn - 1, m.startColumn - 1) },
                },
                message: m.message || "",
                severity: m.severity === MarkerSeverity.Error ? 0 : m.severity === MarkerSeverity.Warning ? 1 : m.severity === MarkerSeverity.Info ? 2 : 3,
                source: m.source,
                code: m.code,
              })),
              only: ctx?.only,
              trigger: ctx?.trigger ?? 1,
            },
          });
          const actions = (r?.actions || []).map((a) => ({
            title: a.title,
            kind: a.kind,
            diagnostics: (a.diagnostics || []).map(toMarker),
            edit: { edits: toEdits(a.edit) },
            command: a.command ? { id: a.command.id, title: a.command.title } : undefined,
            isPreferred: !!a.isPreferred,
          }));
          return { actions, dispose() {} };
        },
      };
    case "codeLens":
      return {
        provideCodeLenses: async (model) => {
          const r = await request(id, "provideCodeLenses", { document: toDoc(model) });
          return {
            lenses: (r || []).map((l) => ({
              range: toMonacoRange(l.range),
              command: l.command ? { id: l.command.id, title: l.command.title, arguments: l.command.arguments } : undefined,
            })),
            dispose() {},
          };
        },
      };
    case "documentHighlight":
      return {
        provideDocumentHighlights: async (model, position) => {
          const r = await request(id, "provideDocumentHighlights", { document: toDoc(model), position: toPos(position) });
          return (r || []).map((h) => ({ range: toMonacoRange(h.range), kind: h.kind ?? 0 }));
        },
      };
    case "documentLink":
      return {
        provideLinks: async (model) => {
          const r = await request(id, "provideLinks", { document: toDoc(model) });
          return {
            links: (r || []).map((l) => ({ range: toMonacoRange(l.range), url: l.url, tooltip: l.tooltip })),
            dispose() {},
          };
        },
      };
    default:
      return null;
  }
};

const toLocations = (r) => {
  if (!r) return null;
  const arr = Array.isArray(r) ? r : [r];
  return arr.map(toLocation).filter(Boolean);
};

// ── Diagnostics ──────────────────────────────────────────────────────────────
const applyDiagnostics = (ev) => {
  if (!markerService) return;
  try {
    if (ev.clear) {
      markerService.remove(ev.owner);
      return;
    }
    if (!ev.uri) return;
    // Diagnostics for embedded virtual documents are remapped into the parent
    // model by the embedded language router; do not publish them under the
    // (non-existent) virtual URI.
    if (isVirtualUri(ev.uri)) return;
    markerService.changeOne(ev.owner, URI.parse(ev.uri), (ev.diagnostics || []).map(toMarker));
  } catch {}
};

const uriToPath = (u) => {
  try {
    const uri = URI.parse(u);
    if (uri.scheme !== "file") return null;
    let p = decodeURIComponent(uri.path).replace(/\//g, "\\");
    if (/^\\[A-Za-z]:/.test(p)) p = p.slice(1);
    return p;
  } catch { return null; }
};

// ── Re-exports for the embedded language router ───────────────────────────────
// The router reuses these raw converters (they map host JSON <-> Monaco types)
// and additionally remaps positions/ranges back into the parent model.
export {
  toDoc as _toDoc,
  toPos as _toPos,
  toRange as _toRangeArg,
  toMonacoRange as _toMonacoRange,
  toDocValue as _toDocValue,
  toCompletion as _toCompletion,
  toLocation as _toLocation,
  toLocations as _toLocations,
  toSymbol as _toSymbol,
  toMarker as _toMarker,
  toEdits as _toEdits,
};
