// LSP provider adapter — bridges Monaco's provider registries to the
// main-process language server manager over the lsp:* IPC channels.
//
// - Providers are registered per language when a server announces itself
//   (serverStatus event) and disposed when it stops.
// - Editor models are mapped to file paths via registerModelPath (called by
//   the editor panel when it creates/disposes a model).
// - Diagnostics arrive from main and are published through IMarkerService.
// - Capability-driven: a provider is only registered when the server actually
//   reports the capability in its initialize response.

import { getService, ILanguageFeaturesService, IMarkerService } from "@codingame/monaco-vscode-api";
import { MarkerSeverity } from "@codingame/monaco-vscode-api/vscode/vs/platform/markers/common/markers";
import {
  CompletionItemKind,
  CompletionItemInsertTextRule,
} from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages";
import { Range } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/core/range";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";

const DIAG_OWNER = "lsp";

let lfs = null;
let markerService = null;
let api = null;
let unsub = null;
const modelPaths = new Map(); // model uri string -> file path
const modelUris = new Map();  // file path -> model uri string
const served = new Map();     // languageId -> { extKey, disposables: [] }
const active = new Map();     // extKey -> { name, version, languages, capabilities }

export const registerModelPath = (modelUri, filePath) => {
  modelPaths.set(modelUri, filePath);
  modelUris.set(filePath, modelUri);
};
export const unregisterModelPath = (modelUri, filePath) => {
  modelPaths.delete(modelUri);
  modelUris.delete(filePath);
};

export const clearDiagnostics = (modelUri) => {
  if (!markerService || !modelUri) return;
  try { markerService.changeOne(DIAG_OWNER, URI.parse(modelUri), []); } catch {}
};

export const initLspProviders = () => {
  if (api) return api;
  api = window.electronAPI;
  if (!api || !api.onLspEvent) return null;
  unsub?.();
  unsub = api.onLspEvent(handleEvent);
  Promise.all([getService(ILanguageFeaturesService), getService(IMarkerService)])
    .then(([f, m]) => { lfs = f; markerService = m; })
    .catch(() => {});
  return api;
};

const disposeAll = (arr) => {
  for (const d of arr) { try { d.dispose(); } catch {} }
  arr.length = 0;
};

const handleEvent = (ev) => {
  if (!ev || !ev.type) return;
  if (ev.type === "serverStatus") {
    if (ev.running) {
      active.set(ev.extKey, ev);
      for (const lang of ev.languages || []) bindLanguage(lang, ev.extKey);
    } else {
      active.delete(ev.extKey);
      for (const lang of ev.languages || []) unbindLanguage(lang, ev.extKey);
    }
  } else if (ev.type === "diagnostics") {
    applyDiagnostics(ev);
  } else if (ev.type === "log") {
    console.info("[lsp]", ev.message);
  } else if (ev.type === "error") {
    console.warn("[lsp]", ev.error);
  }
};

const bindLanguage = (languageId, extKey) => {
  // TEMP: yaml is served by the real VS Code extension host (redhat.vscode-yaml)
  // since the real-host integration; skip the legacy LSP bridge for it to avoid
  // duplicate diagnostics. Remove together with the legacy layer (Phase C).
  if (languageId === "yaml") return;
  const cur = served.get(languageId);
  if (cur && cur.extKey === extKey) return;
  if (cur) disposeAll(cur.disposables);
  const disposables = [];
  const caps = active.get(extKey)?.capabilities || {};
  registerProviders(languageId, caps, disposables);
  served.set(languageId, { extKey, disposables });
};

const unbindLanguage = (languageId, extKey) => {
  const cur = served.get(languageId);
  if (!cur || cur.extKey !== extKey) return;
  disposeAll(cur.disposables);
  served.delete(languageId);
  for (const [k, s] of active) {
    if (k === extKey) continue;
    if ((s.languages || []).includes(languageId)) { bindLanguage(languageId, k); break; }
  }
};

const pathForModel = (model) => {
  const uri = model?.uri?.toString?.();
  return uri ? modelPaths.get(uri) ?? null : null;
};

const request = async (path, method, params) => {
  try {
    const r = await api.lspRequest(path, method, params);
    return r?.success ? r.result : undefined;
  } catch { return undefined; }
};

// ── Position / range mapping ─────────────────────────────────────────────────
const toLspPos = (pos) => ({ line: pos.lineNumber - 1, character: pos.column - 1 });
const toLspRange = (range) => ({ start: toLspPos(range.getStartPosition()), end: toLspPos(range.getEndPosition()) });
const toRange = (lr) => new Range(lr.start.line + 1, lr.start.character + 1, lr.end.line + 1, lr.end.character + 1);

// ── Result mapping ────────────────────────────────────────────────────────────
const toDoc = (d) => {
  if (!d) return undefined;
  if (typeof d === "string") return { value: d };
  if (d.value !== undefined) return { value: String(d.value) };
  if (d.language !== undefined) return { value: `\`\`\`${d.language}\n${d.value}\n\`\`\`` };
  return { value: JSON.stringify(d) };
};

const toLocation = (l) => {
  if (!l) return null;
  if (l.targetUri) return { uri: URI.parse(l.targetUri), range: toRange(l.targetRange || l.range), selectionRange: l.targetSelectionRange ? toRange(l.targetSelectionRange) : undefined };
  if (l.uri && l.range) return { uri: URI.parse(l.uri), range: toRange(l.range) };
  return null;
};

const toLocations = (r) => {
  if (!r) return null;
  const arr = Array.isArray(r) ? r : [r];
  return arr.map(toLocation).filter(Boolean);
};

const toWorkspaceEdits = (we) => {
  const edits = [];
  for (const [uri, changes] of Object.entries(we.changes || {})) {
    for (const e of changes || []) edits.push({ resource: URI.parse(uri), textEdit: { range: toRange(e.range), text: e.newText } });
  }
  for (const dc of we.documentChanges || []) {
    const uri = dc.textDocument?.uri;
    if (!uri) continue;
    for (const e of dc.edits || []) edits.push({ resource: URI.parse(uri), textEdit: { range: toRange(e.range), text: e.newText } });
  }
  return edits;
};

const mapSeverity = (s) => (s === 1 ? MarkerSeverity.Error : s === 2 ? MarkerSeverity.Warning : s === 3 ? MarkerSeverity.Info : MarkerSeverity.Hint);

const toMarkerData = (d) => ({
  severity: mapSeverity(d.severity),
  message: d.message || "Diagnostic",
  startLineNumber: (d.range?.start?.line ?? 0) + 1,
  startColumn: (d.range?.start?.character ?? 0) + 1,
  endLineNumber: (d.range?.end?.line ?? 0) + 1,
  endColumn: Math.max((d.range?.end?.character ?? 0) + 1, (d.range?.start?.character ?? 0) + 1),
  source: d.source || undefined,
  code: d.code ?? undefined,
});

const applyDiagnostics = (ev) => {
  if (!markerService || !ev.path) return;
  const modelUri = modelUris.get(ev.path);
  if (!modelUri) return;
  try { markerService.changeOne(DIAG_OWNER, URI.parse(modelUri), (ev.diagnostics || []).map(toMarkerData)); } catch {}
};
const toCompletionItem = (i) => {
  const item = {
    label: i.label || "",
    kind: (i.kind ?? 9) > 0 ? (i.kind ?? 9) - 1 : CompletionItemKind.Property,
    detail: i.detail,
    documentation: toDoc(i.documentation),
    sortText: i.sortText,
    filterText: i.filterText,
    preselect: !!i.preselect,
  };
  if (i.insertTextFormat === 2) item.insertTextRules = CompletionItemInsertTextRule.InsertAsSnippet;
  if (i.textEdit) { item.insertText = i.textEdit.newText; item.range = toRange(i.textEdit.range); }
  else if (i.insertText) item.insertText = i.insertText;
  if (i.additionalTextEdits?.length) {
    item.additionalTextEdits = i.additionalTextEdits.map((e) => ({ range: toRange(e.range), text: e.newText }));
  }
  return item;
};

const toDocumentSymbol = (s) => ({
  name: s.name || "",
  detail: s.detail,
  kind: (s.kind ?? 12) > 0 ? (s.kind ?? 12) - 1 : 11,
  tags: s.tags,
  range: toRange(s.range || s.location?.range),
  selectionRange: toRange(s.selectionRange || s.location?.range || s.range),
  children: (s.children || []).map(toDocumentSymbol),
});

// ── Provider registration (capability-driven) ─────────────────────────────────
const registerProviders = (languageId, caps, out) => {
  const sel = { language: languageId };

  if (caps.completion) {
    out.push(lfs.completionProvider.register(sel, {
      triggerCharacters: caps.completionTrigger || [],
      provideCompletionItems: async (model, position, ctx) => {
        const p = pathForModel(model);
        if (!p) return { suggestions: [] };
        const r = await request(p, "textDocument/completion", {
          textDocument: {},
          position: toLspPos(position),
          context: { triggerKind: Math.min(3, Math.max(1, (ctx?.triggerKind ?? 0) + 1)), triggerCharacter: ctx?.triggerCharacter || undefined },
        });
        if (!r) return { suggestions: [] };
        return { incomplete: !!r.isIncomplete, suggestions: (r.items || []).map(toCompletionItem) };
      },
    }));
  }

  if (caps.hover) {
    out.push(lfs.hoverProvider.register(sel, {
      provideHover: async (model, position) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/hover", { textDocument: {}, position: toLspPos(position) });
        if (!r || r.contents === undefined) return null;
        const contents = (Array.isArray(r.contents) ? r.contents : [r.contents]).map(toDoc).filter(Boolean);
        return { contents, range: r.range ? toRange(r.range) : undefined };
      },
    }));
  }

  if (caps.definition) {
    out.push(lfs.definitionProvider.register(sel, {
      provideDefinition: async (model, position) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/definition", { textDocument: {}, position: toLspPos(position) });
        return toLocations(r);
      },
    }));
  }

  if (caps.typeDefinition) {
    out.push(lfs.typeDefinitionProvider.register(sel, {
      provideTypeDefinition: async (model, position) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/typeDefinition", { textDocument: {}, position: toLspPos(position) });
        return toLocations(r);
      },
    }));
  }

  if (caps.references) {
    out.push(lfs.referenceProvider.register(sel, {
      provideReferences: async (model, position, ctx) => {
        const p = pathForModel(model);
        if (!p) return [];
        const r = await request(p, "textDocument/references", {
          textDocument: {},
          position: toLspPos(position),
          context: { includeDeclaration: ctx?.includeDeclaration ?? true },
        });
        return toLocations(r) || [];
      },
    }));
  }

  if (caps.documentSymbol) {
    out.push(lfs.documentSymbolProvider.register(sel, {
      provideDocumentSymbols: async (model) => {
        const p = pathForModel(model);
        if (!p) return [];
        const r = await request(p, "textDocument/documentSymbol", { textDocument: {} });
        if (!Array.isArray(r) || !r.length) return [];
        if (r[0].location) return r.map((s) => ({ name: s.name || "", kind: (s.kind ?? 12) - 1, containerName: s.containerName, location: { uri: URI.parse(s.location.uri), range: toRange(s.location.range) } }));
        return r.map(toDocumentSymbol);
      },
    }));
  }

  if (caps.signatureHelp) {
    out.push(lfs.signatureHelpProvider.register(sel, {
      signatureHelpTriggerCharacters: caps.signatureHelpTrigger || [],
      provideSignatureHelp: async (model, position) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/signatureHelp", { textDocument: {}, position: toLspPos(position), context: { triggerKind: 1 } });
        if (!r) return null;
        const value = {
          signatures: (r.signatures || []).map((s) => ({
            label: s.label || "",
            documentation: toDoc(s.documentation),
            parameters: (s.parameters || []).map((pa) => ({ label: pa.label, documentation: toDoc(pa.documentation) })),
            activeParameter: s.activeParameter ?? 0,
          })),
          activeSignature: r.activeSignature ?? 0,
        };
        return { value, dispose() {} };
      },
    }));
  }

  if (caps.rename) {
    out.push(lfs.renameProvider.register(sel, {
      resolveRenameLocation: async (model, position) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/prepareRename", { textDocument: {}, position: toLspPos(position) });
        if (!r) return null;
        const range = r.range ? toRange(r.range) : r.start ? toRange(r) : null;
        if (!range) return null;
        return { range, text: r.placeholder !== undefined ? String(r.placeholder) : model.getValueInRange(range) };
      },
      provideRenameEdits: async (model, position, newName) => {
        const p = pathForModel(model);
        if (!p) return null;
        const r = await request(p, "textDocument/rename", { textDocument: {}, position: toLspPos(position), newName });
        if (!r) return null;
        return { edits: toWorkspaceEdits(r) };
      },
    }));
  }

  if (caps.formatting) {
    out.push(lfs.documentFormattingEditProvider.register(sel, {
      provideDocumentFormattingEdits: async (model, options) => {
        const p = pathForModel(model);
        if (!p) return [];
        const r = await request(p, "textDocument/formatting", {
          textDocument: {},
          options: { tabSize: options.tabSize || 2, insertSpaces: options.insertSpaces ?? true },
        });
        return (r || []).map((e) => ({ range: toRange(e.range), text: e.newText }));
      },
    }));
  }

  if (caps.rangeFormatting) {
    out.push(lfs.documentRangeFormattingEditProvider.register(sel, {
      provideDocumentRangeFormattingEdits: async (model, range, options) => {
        const p = pathForModel(model);
        if (!p) return [];
        const r = await request(p, "textDocument/rangeFormatting", {
          textDocument: {},
          range: toLspRange(range),
          options: { tabSize: options.tabSize || 2, insertSpaces: options.insertSpaces ?? true },
        });
        return (r || []).map((e) => ({ range: toRange(e.range), text: e.newText }));
      },
    }));
  }

  if (caps.codeAction) {
    out.push(lfs.codeActionProvider.register(sel, {
      provideCodeActions: async (model, range, ctx) => {
        const p = pathForModel(model);
        if (!p) return { actions: [], dispose() {} };
        const r = await request(p, "textDocument/codeAction", {
          textDocument: {},
          range: toLspRange(range),
          context: { diagnostics: (ctx?.markers || []).map((m) => ({ range: { start: { line: m.startLineNumber - 1, character: m.startColumn - 1 }, end: { line: m.endLineNumber - 1, character: m.endColumn - 1 } }, message: m.message })) },
        });
        const actions = (r || [])
          .filter((a) => a.title)
          .map((a) => ({
            title: a.title,
            kind: a.kind,
            diagnostics: (a.diagnostics || []).map(toMarkerData),
            edit: a.edit ? { edits: toWorkspaceEdits(a.edit) } : undefined,
            command: a.command ? { id: a.command.command, title: a.command.title } : undefined,
            isPreferred: !!a.isPreferred,
          }));
        return { actions, dispose() {} };
      },
    }));
  }
};

// ── Re-exports for the embedded language router ───────────────────────────────
// The router reuses these raw converters (they map LSP JSON <-> Monaco types)
// and additionally remaps positions/ranges back into the parent model.
export {
  toLspPos as _toLspPos,
  toLspRange as _toLspRange,
  toRange as _toRange,
  toDoc as _toDoc,
  toLocation as _toLocation,
  toLocations as _toLocations,
  toWorkspaceEdits as _toWorkspaceEdits,
  toCompletionItem as _toCompletionItem,
  toDocumentSymbol as _toDocumentSymbol,
  mapSeverity as _mapSeverity,
  toMarkerData as _toMarkerData,
};
