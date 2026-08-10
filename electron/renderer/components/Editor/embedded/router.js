// Embedded language router.
//
// Monaco sees one model per file with a single languageId (e.g. "html").
// Real VS Code extensions / LSP servers, however, register their providers for
// concrete languages (css, javascript, typescript, ...). The router connects
// the two worlds for mixed-language files:
//
//   Monaco model (html)  →  region detection  →  virtual document (css)
//        ↑                                        │
//        └── result mapping (ranges → parent) ←───┴── language providers
//
// Design rules:
//   - The router registers ONE additive provider set per HOST language (html,
//     vue, svelte, php). Its providers answer ONLY when the cursor is inside an
//     embedded region that actually has providers; everywhere else they return
//     null/empty and the existing host-language providers keep working
//     unchanged (no double registration for the host language itself).
//   - Providers are discovered through the language directory (live
//     registrations from the extension host and the LSP manager) — never from
//     regex collection.
//   - Extension-host providers are tried first, LSP servers second; results are
//     merged and every position/range is mapped back into the parent model.

import { getService, ILanguageFeaturesService, IMarkerService } from "@codingame/monaco-vscode-api";
import { Range } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/core/range";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import {
  hostConfigForLanguage,
  detectEmbeddedRegions,
} from "./regions.js";
import {
  VirtualDocument,
  buildVirtualUri,
  virtualPathFor,
  isVirtualUri,
  isVirtualPath,
  parseVirtualPath,
} from "./virtual-document.js";
import {
  initLanguageDirectory,
  getExtProviderIds,
  getLspCaps,
} from "./language-directory.js";
import {
  _toDoc,
  _toLocations,
  _toRange,
  _toCompletionItem,
  _mapSeverity,
} from "../lsp-providers.js";
import {
  _toDocValue,
  _toCompletion,
  _toMonacoRange,
} from "../ext-providers.js";

let lfs = null;
let markerService = null;
let api = null;
let registered = false;

const HOST_LANGS = ["html", "vue", "svelte", "php"];
const EMBEDDED_MARKER_OWNER = "embedded";

const contextsByUri = new Map();  // model uri string  -> RouterModelContext
const contextsByPath = new Map(); // file path         -> RouterModelContext

// ── Model context ─────────────────────────────────────────────────────────────
class RouterModelContext {
  constructor(model, path, config) {
    this.model = model;
    this.path = path;
    this.uri = model.uri.toString();
    this.config = config;
    this.regions = [];
    this.virtualDocs = new Map(); // region index -> VirtualDocument
    this.lastVersion = -1;
    this.disposer = null;
  }

  scan(initial) {
    const text = this.model.getValue();
    const version = this.model.getVersionId();
    if (version === this.lastVersion) return;
    this.lastVersion = version;

    const regions = detectEmbeddedRegions(text, this.uri, this.config);
    this.regions = regions;

    const next = new Map();
    const toSync = []; // { vpath, languageId, text, fresh }
    for (const r of regions) {
      const content = text.slice(r.startOffset, r.endOffset);
      const vpath = virtualPathFor(this.path, r.languageId, r.index);
      let vd = this.virtualDocs.get(r.index);
      if (vd && vd.languageId === r.languageId && vd.startOffset === r.startOffset) {
        if (vd.update(content)) toSync.push({ vpath, languageId: r.languageId, text: content, fresh: false });
      } else {
        vd = new VirtualDocument({
          uri: buildVirtualUri(this.uri, r.languageId, r.index),
          languageId: r.languageId,
          parentModelUri: this.uri,
          parentPath: this.path,
          startOffset: r.startOffset,
          endOffset: r.endOffset,
          text: content,
          index: r.index,
        });
        vd.virtualPath = vpath;
        toSync.push({ vpath, languageId: r.languageId, text: content, fresh: true });
      }
      next.set(r.index, vd);
    }
    // Detached regions are closed on the LSP manager.
    for (const [idx, vd] of this.virtualDocs) {
      if (!next.has(idx)) api?.lspClose(vd.virtualPath).catch(() => {});
    }
    this.virtualDocs = next;

    for (const s of toSync) {
      if (s.fresh) api?.lspOpen(s.vpath, s.languageId, s.text).catch(() => {});
      else api?.lspChange(s.vpath, s.text).catch(() => {});
    }
  }

  regionAt(position) {
    if (!position) return null;
    const off = this.model.getOffsetAt(position);
    for (const r of this.regions) {
      if (off >= r.startOffset && off < r.endOffset) return r;
    }
    return null;
  }

  virtualDoc(region) {
    return region ? this.virtualDocs.get(region.index) || null : null;
  }

  regionByIndex(languageId, index) {
    const r = this.regions.find((x) => x.index === index && x.languageId === languageId);
    return r || null;
  }

  close() {
    try { this.disposer?.dispose(); } catch {}
    for (const vd of this.virtualDocs.values()) api?.lspClose(vd.virtualPath).catch(() => {});
    this.virtualDocs.clear();
    this.regions = [];
    if (markerService) {
      try { markerService.changeOne(EMBEDDED_MARKER_OWNER, this.model.uri, []); } catch {}
    }
  }
}

// ── Lifecycle (called by the editor panel) ───────────────────────────────────
export const attachModel = (model, path) => {
  if (!model || !path) return null;
  const uri = model.uri.toString();
  const existing = contextsByUri.get(uri);
  if (existing) { existing.path = path; return existing; }
  const config = hostConfigForLanguage(model.getLanguageId());
  if (!config) return null;
  const c = new RouterModelContext(model, path, config);
  contextsByUri.set(uri, c);
  contextsByPath.set(path, c);
  try { c.disposer = model.onWillDispose(() => detachModel(c)); } catch {}
  c.scan(true);
  return c;
};

export const detachModel = (arg) => {
  const c = arg && arg.model
    ? arg
    : typeof arg === "string"
      ? contextsByUri.get(arg)
      : null;
  if (!c) return;
  c.close();
  contextsByUri.delete(c.uri);
  contextsByPath.delete(c.path);
};

export const notifyModelChanged = (model) => {
  if (!model) return;
  const c = contextsByUri.get(model.uri.toString());
  if (c) c.scan(false);
};

// ── Region API (spec: getLanguageIdAtPosition / getRegionsForRange) ──────────
export const getLanguageIdAtPosition = (model, position) => {
  if (!model || !position) return null;
  const c = contextsByUri.get(model.uri.toString());
  if (!c) return null;
  c.scan(false);
  const r = c.regionAt(position);
  return r ? r.languageId : c.config.parentLanguageId;
};

export const getRegionsForRange = (model) => {
  if (!model) return [];
  const c = contextsByUri.get(model.uri.toString());
  if (!c) return [];
  c.scan(false);
  return c.regions;
};

// ── Dispatch context ─────────────────────────────────────────────────────────
// Returns { c, vd } when `position` is inside an embedded region that has a
// virtual document; null when the position is host language (the existing
// host providers handle that) or the model is not a host model.
const ctxOf = (model, position) => {
  try {
    if (!model || !position) return null;
    const c = contextsByUri.get(model.uri.toString());
    if (!c) return null;
    c.scan(false);
    const region = c.regionAt(position);
    if (!region) return null;
    if (region.languageId === c.config.parentLanguageId) return null;
    const vd = c.virtualDoc(region);
    if (!vd) return null;
    return { c, vd };
  } catch { return null; }
};

const docFacade = (vd) => ({
  uri: vd.uri,
  languageId: vd.languageId,
  text: vd.text,
  version: vd.version,
});

const extRequest = (id, method, params) => {
  if (!api?.extProviderRequest) return Promise.resolve(undefined);
  return api.extProviderRequest(id, method, params).catch((e) => {
    console.warn("[embedded] ext provider request failed:", method, e?.message || e);
    return undefined;
  });
};

const lspRequest = (vpath, method, params) => {
  if (!api?.lspRequest) return Promise.resolve(undefined);
  return api.lspRequest(vpath, method, params)
    .then((r) => (r && r.success ? r.result : undefined))
    .catch(() => undefined);
};

// ── Result mapping back to the parent model ──────────────────────────────────
const toParentMonacoRange = (c, vd, r) => {
  if (!r) return null;
  let lr;
  if (typeof r.start?.line === "number") {
    lr = r; // LSP-style plain range
  } else {
    lr = {
      start: { line: r.startLineNumber - 1, character: r.startColumn - 1 },
      end: { line: r.endLineNumber - 1, character: r.endColumn - 1 },
    };
  }
  const pr = vd.toParentRangeFromLsp(c.model, lr);
  return new Range(pr.startLineNumber, pr.startColumn, pr.endLineNumber, pr.endColumn);
};

const mapLocations = (c, vd, r) => {
  if (!r) return null;
  const arr = Array.isArray(r) ? r : [r];
  const out = [];
  for (const l of arr) {
    if (!l) continue;
    const lUri = l.uri || l.targetUri;
    const inVirtual = lUri === vd.uri || (lUri && URI.parse(lUri).toString() === vd.uri);
    if (inVirtual) {
      const range = l.targetRange || l.range || l.targetSelectionRange;
      if (!range) continue;
      out.push({
        uri: c.model.uri,
        range: toParentMonacoRange(c, vd, range),
        selectionRange: l.targetSelectionRange ? toParentMonacoRange(c, vd, l.targetSelectionRange) : undefined,
      });
    } else {
      const conv = _toLocations([l]);
      if (conv && conv.length) out.push(conv[0]);
    }
  }
  return out.length ? out : null;
};

const mapCompletion = (c, vd, item) => {
  if (item.range) item.range = toParentMonacoRange(c, vd, item.range);
  if (item.additionalTextEdits) {
    item.additionalTextEdits = item.additionalTextEdits.map((e) => ({
      ...e,
      range: toParentMonacoRange(c, vd, e.range),
    }));
  }
  return item;
};

const mapSymbols = (c, vd, r, isExt) => {
  if (!Array.isArray(r) || !r.length) return [];
  if (r[0].location && r[0].location.range) {
    return r
      .map((s) => ({
        name: s.name || "",
        containerName: s.containerName,
        kind: (s.kind ?? 12) - 1,
        location: mapLocations(c, vd, [s.location])?.[0],
      }))
      .filter((s) => s.location);
  }
  const walk = (s) => ({
    name: s.name || "",
    detail: s.detail,
    kind: isExt ? (s.kind ?? 0) : (s.kind ?? 12) - 1,
    tags: s.tags,
    range: toParentMonacoRange(c, vd, s.range),
    selectionRange: toParentMonacoRange(c, vd, s.selectionRange || s.range),
    children: (s.children || []).map(walk),
  });
  return r.map(walk);
};

const mapEdits = (c, vd, r) =>
  (r || []).map((e) => ({ range: toParentMonacoRange(c, vd, e.range), text: e.newText }));

const mapRenameEdits = (c, vd, r) => {
  const edits = [];
  for (const [uri, changes] of Object.entries((r && r.changes) || {})) {
    const inVirtual = uri === vd.uri || URI.parse(uri).toString() === vd.uri;
    for (const e of changes || []) {
      edits.push({
        resource: inVirtual ? c.model.uri : URI.parse(uri),
        textEdit: { range: inVirtual ? toParentMonacoRange(c, vd, e.range) : _toRange(e.range), text: e.newText },
      });
    }
  }
  for (const dc of (r && r.documentChanges) || []) {
    const uri = dc.textDocument?.uri;
    if (!uri) continue;
    const inVirtual = uri === vd.uri || URI.parse(uri).toString() === vd.uri;
    for (const e of dc.edits || []) {
      edits.push({
        resource: inVirtual ? c.model.uri : URI.parse(uri),
        textEdit: { range: inVirtual ? toParentMonacoRange(c, vd, e.range) : _toRange(e.range), text: e.newText },
      });
    }
  }
  return edits;
};

const mapExtRenameEdits = (c, vd, r) =>
  ((r && r.edits) || []).map((e) => {
    const inVirtual = e.uri === vd.uri || URI.parse(e.uri).toString() === vd.uri;
    return {
      resource: inVirtual ? c.model.uri : URI.parse(e.uri),
      textEdit: { range: inVirtual ? toParentMonacoRange(c, vd, e.range) : _toMonacoRange(e.range), text: e.text },
    };
  });

const mapCodeActions = (c, vd, r, isExt) => {
  const arr = isExt ? (r && r.actions) || [] : r || [];
  return arr
    .filter((a) => a && a.title)
    .map((a) => ({
      title: a.title,
      kind: a.kind,
      diagnostics: (a.diagnostics || []).map((d) => toEmbeddedMarker(c, vd, d)).filter(Boolean),
      edit: a.edit ? { edits: isExt ? mapExtRenameEdits(c, vd, a.edit) : mapRenameEdits(c, vd, a.edit) } : undefined,
      command: a.command ? { id: a.command.id || a.command.command, title: a.command.title } : undefined,
      isPreferred: !!a.isPreferred,
    }));
};

const toSig = (r) => ({
  signatures: (r.signatures || []).map((s) => ({
    label: s.label || "",
    documentation: _toDoc(s.documentation),
    parameters: (s.parameters || []).map((pa) => ({ label: pa.label, documentation: _toDoc(pa.documentation) })),
    activeParameter: s.activeParameter ?? 0,
  })),
  activeSignature: r.activeSignature ?? 0,
});

const toEmbeddedMarker = (c, vd, d) => {
  if (!d || !d.range) return null;
  const pr = toParentMonacoRange(c, vd, d.range);
  if (!pr) return null;
  return {
    severity: _mapSeverity(d.severity),
    message: d.message || "Diagnostic",
    startLineNumber: pr.startLineNumber,
    startColumn: pr.startColumn,
    endLineNumber: pr.endLineNumber,
    endColumn: Math.max(pr.endColumn, pr.startColumn),
    source: d.source || undefined,
    code: d.code ?? undefined,
  };
};

// ── Per-kind dispatch ─────────────────────────────────────────────────────────
const runCompletion = async (c, vd, position, ctx) => {
  const pos = vd.toLspPosition(c.model, position);
  const suggestions = [];
  let incomplete = false;
  for (const id of getExtProviderIds(vd.languageId, "completion")) {
    const r = await extRequest(id, "provideCompletionItems", {
      document: docFacade(vd),
      position: pos,
      context: { triggerKind: ctx?.triggerKind ?? 0, triggerCharacter: ctx?.triggerCharacter },
    });
    if (r) {
      incomplete = incomplete || !!r.isIncomplete;
      for (const i of r.items || []) suggestions.push(mapCompletion(c, vd, _toCompletion(i)));
    }
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.completion) {
    const r = await lspRequest(vd.virtualPath, "textDocument/completion", {
      textDocument: {},
      position: pos,
      context: { triggerKind: Math.min(3, Math.max(1, (ctx?.triggerKind ?? 0) + 1)), triggerCharacter: ctx?.triggerCharacter || undefined },
    });
    if (r) {
      incomplete = incomplete || !!r.isIncomplete;
      for (const i of r.items || []) suggestions.push(mapCompletion(c, vd, _toCompletionItem(i)));
    }
  }
  return { incomplete, suggestions };
};

const runHover = async (c, vd, position) => {
  const pos = vd.toLspPosition(c.model, position);
  const contents = [];
  let range;
  for (const id of getExtProviderIds(vd.languageId, "hover")) {
    const r = await extRequest(id, "provideHover", { document: docFacade(vd), position: pos });
    if (r && r.contents !== undefined) {
      for (const part of (Array.isArray(r.contents) ? r.contents : [r.contents])) {
        const dv = _toDocValue(part);
        if (dv) contents.push(dv);
      }
      if (r.range && !range) range = toParentMonacoRange(c, vd, r.range);
    }
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.hover) {
    const r = await lspRequest(vd.virtualPath, "textDocument/hover", { textDocument: {}, position: pos });
    if (r && r.contents !== undefined) {
      for (const part of (Array.isArray(r.contents) ? r.contents : [r.contents])) {
        const dv = _toDoc(part);
        if (dv) contents.push(dv);
      }
      if (r.range && !range) range = toParentMonacoRange(c, vd, r.range);
    }
  }
  if (!contents.length) return null;
  return { contents, range: range || undefined };
};

const runLocations = async (c, vd, position, kind) => {
  const pos = vd.toLspPosition(c.model, position);
  const out = [];
  for (const id of getExtProviderIds(vd.languageId, kind)) {
    const r = await extRequest(id, EXT_METHOD[kind], { document: docFacade(vd), position: pos });
    if (r) { const m = mapLocations(c, vd, r); if (m) out.push(...m); }
  }
  const caps = getLspCaps(vd.languageId);
  if (LSP_METHOD[kind] && caps?.[LSP_CAP[kind]]) {
    const r = await lspRequest(vd.virtualPath, LSP_METHOD[kind], { textDocument: {}, position: pos });
    if (r) { const m = mapLocations(c, vd, r); if (m) out.push(...m); }
  }
  return out.length ? out : null;
};

const runSymbol = async (c, vd) => {
  const out = [];
  for (const id of getExtProviderIds(vd.languageId, "documentSymbol")) {
    const r = await extRequest(id, "provideDocumentSymbols", { document: docFacade(vd) });
    if (Array.isArray(r)) out.push(...mapSymbols(c, vd, r, true));
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.documentSymbol) {
    const r = await lspRequest(vd.virtualPath, "textDocument/documentSymbol", { textDocument: {} });
    if (Array.isArray(r)) out.push(...mapSymbols(c, vd, r, false));
  }
  return out;
};

const runSignature = async (c, vd, position, ctx) => {
  const pos = vd.toLspPosition(c.model, position);
  for (const id of getExtProviderIds(vd.languageId, "signatureHelp")) {
    const r = await extRequest(id, "provideSignatureHelp", {
      document: docFacade(vd),
      position: pos,
      context: { triggerKind: ctx?.triggerKind ?? 1, triggerCharacter: ctx?.triggerCharacter, isRetrigger: !!ctx?.isRetrigger },
    });
    if (r && (r.signatures || []).length) return { value: toSig(r), dispose() {} };
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.signatureHelp) {
    const r = await lspRequest(vd.virtualPath, "textDocument/signatureHelp", {
      textDocument: {}, position: pos, context: { triggerKind: 1 },
    });
    if (r && (r.signatures || []).length) return { value: toSig(r), dispose() {} };
  }
  return null;
};

const runPrepareRename = async (c, vd, position) => {
  const pos = vd.toLspPosition(c.model, position);
  for (const id of getExtProviderIds(vd.languageId, "rename")) {
    const r = await extRequest(id, "prepareRename", { document: docFacade(vd), position: pos });
    if (r) {
      const range = r.range ? toParentMonacoRange(c, vd, r.range) : r.start ? toParentMonacoRange(c, vd, r) : null;
      if (range) return { range, text: r.placeholder !== undefined ? String(r.placeholder) : c.model.getValueInRange(range) };
    }
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.rename) {
    const r = await lspRequest(vd.virtualPath, "textDocument/prepareRename", { textDocument: {}, position: pos });
    if (r) {
      const range = r.range ? toParentMonacoRange(c, vd, r.range) : r.start ? toParentMonacoRange(c, vd, r) : null;
      if (range) return { range, text: r.placeholder !== undefined ? String(r.placeholder) : c.model.getValueInRange(range) };
    }
  }
  return null;
};

const runRename = async (c, vd, position, newName) => {
  const pos = vd.toLspPosition(c.model, position);
  const edits = [];
  for (const id of getExtProviderIds(vd.languageId, "rename")) {
    const r = await extRequest(id, "provideRenameEdits", { document: docFacade(vd), position: pos, newName });
    if (r && r.edits) edits.push(...mapExtRenameEdits(c, vd, r));
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.rename) {
    const r = await lspRequest(vd.virtualPath, "textDocument/rename", { textDocument: {}, position: pos, newName });
    if (r) edits.push(...mapRenameEdits(c, vd, r));
  }
  if (!edits.length) return null;
  return { edits };
};

const runFormatting = async (c, vd, options) => {
  const opts = { tabSize: options?.tabSize || 2, insertSpaces: options?.insertSpaces ?? true };
  const edits = [];
  for (const id of getExtProviderIds(vd.languageId, "formatting")) {
    const r = await extRequest(id, "provideDocumentFormattingEdits", { document: docFacade(vd), options: opts });
    if (Array.isArray(r)) edits.push(...mapEdits(c, vd, r));
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.formatting) {
    const r = await lspRequest(vd.virtualPath, "textDocument/formatting", { textDocument: {}, options: opts });
    if (Array.isArray(r)) edits.push(...mapEdits(c, vd, r));
  }
  return edits;
};

const runRangeFormatting = async (c, vd, range, options) => {
  const opts = { tabSize: options?.tabSize || 2, insertSpaces: options?.insertSpaces ?? true };
  const vr = vd.toLspRangeFromMonaco(c.model, range);
  const edits = [];
  for (const id of getExtProviderIds(vd.languageId, "rangeFormatting")) {
    const r = await extRequest(id, "provideDocumentRangeFormattingEdits", { document: docFacade(vd), range: vr, options: opts });
    if (Array.isArray(r)) edits.push(...mapEdits(c, vd, r));
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.rangeFormatting) {
    const r = await lspRequest(vd.virtualPath, "textDocument/rangeFormatting", { textDocument: {}, range: vr, options: opts });
    if (Array.isArray(r)) edits.push(...mapEdits(c, vd, r));
  }
  return edits;
};

const runCodeAction = async (c, vd, range, ctx) => {
  const vr = vd.toLspRangeFromMonaco(c.model, range);
  const actions = [];
  for (const id of getExtProviderIds(vd.languageId, "codeAction")) {
    const r = await extRequest(id, "provideCodeActions", {
      document: docFacade(vd), range: vr, context: { ...(ctx || {}), diagnostics: [] },
    });
    if (r) actions.push(...mapCodeActions(c, vd, r, true));
  }
  const caps = getLspCaps(vd.languageId);
  if (caps?.codeAction) {
    const r = await lspRequest(vd.virtualPath, "textDocument/codeAction", {
      textDocument: {}, range: vr, context: { diagnostics: [] },
    });
    if (r) actions.push(...mapCodeActions(c, vd, r, false));
  }
  return { actions, dispose() {} };
};

const runCodeLens = async (c, vd) => {
  const lenses = [];
  for (const id of getExtProviderIds(vd.languageId, "codeLens")) {
    const r = await extRequest(id, "provideCodeLenses", { document: docFacade(vd) });
    if (Array.isArray(r)) {
      for (const l of r) {
        lenses.push({
          range: toParentMonacoRange(c, vd, l.range),
          command: l.command ? { id: l.command.id, title: l.command.title, arguments: l.command.arguments } : undefined,
        });
      }
    }
  }
  return { lenses, dispose() {} };
};

const runHighlight = async (c, vd, position) => {
  const pos = vd.toLspPosition(c.model, position);
  const out = [];
  for (const id of getExtProviderIds(vd.languageId, "documentHighlight")) {
    const r = await extRequest(id, "provideDocumentHighlights", { document: docFacade(vd), position: pos });
    if (Array.isArray(r)) for (const h of r) out.push({ range: toParentMonacoRange(c, vd, h.range), kind: h.kind ?? 0 });
  }
  return out;
};

const runLink = async (c, vd) => {
  const links = [];
  for (const id of getExtProviderIds(vd.languageId, "documentLink")) {
    const r = await extRequest(id, "provideLinks", { document: docFacade(vd) });
    if (r) for (const l of r) links.push({ range: toParentMonacoRange(c, vd, l.range), url: l.url, tooltip: l.tooltip });
  }
  return { links, dispose() {} };
};

// ── Provider builders (registered per host language) ─────────────────────────
const P = {
  completion: () => ({
    triggerCharacters: [],
    provideCompletionItems: async (model, position, _tok, ctx) => {
      const k = ctxOf(model, position);
      return k ? runCompletion(k.c, k.vd, position, ctx) : { suggestions: [] };
    },
  }),
  hover: () => ({
    provideHover: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runHover(k.c, k.vd, position) : null;
    },
  }),
  definition: () => ({
    provideDefinition: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runLocations(k.c, k.vd, position, "definition") : null;
    },
  }),
  typeDefinition: () => ({
    provideTypeDefinition: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runLocations(k.c, k.vd, position, "typeDefinition") : null;
    },
  }),
  implementation: () => ({
    provideImplementation: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runLocations(k.c, k.vd, position, "implementation") : null;
    },
  }),
  references: () => ({
    provideReferences: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runLocations(k.c, k.vd, position, "references") || [] : [];
    },
  }),
  documentSymbol: () => ({
    provideDocumentSymbols: async (model) => {
      if (!model) return [];
      const c = contextsByUri.get(model.uri.toString());
      if (!c) return [];
      c.scan(false);
      const out = [];
      for (const region of c.regions) {
        if (region.languageId === c.config.parentLanguageId) continue;
        const vd = c.virtualDoc(region);
        if (!vd) continue;
        out.push(...(await runSymbol(c, vd)));
      }
      return out;
    },
  }),
  signatureHelp: () => ({
    signatureHelpTriggerCharacters: [],
    provideSignatureHelp: async (model, position, _tok, ctx) => {
      const k = ctxOf(model, position);
      return k ? runSignature(k.c, k.vd, position, ctx) : null;
    },
  }),
  rename: () => ({
    resolveRenameLocation: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runPrepareRename(k.c, k.vd, position) : null;
    },
    provideRenameEdits: async (model, position, newName) => {
      const k = ctxOf(model, position);
      return k ? runRename(k.c, k.vd, position, newName) : null;
    },
  }),
  formatting: () => ({
    provideDocumentFormattingEdits: async (model, options) => {
      if (!model) return [];
      const c = contextsByUri.get(model.uri.toString());
      if (!c) return [];
      c.scan(false);
      const out = [];
      for (const region of c.regions) {
        if (region.languageId === c.config.parentLanguageId) continue;
        const vd = c.virtualDoc(region);
        if (!vd) continue;
        out.push(...(await runFormatting(c, vd, options)));
      }
      return out;
    },
  }),
  rangeFormatting: () => ({
    provideDocumentRangeFormattingEdits: async (model, range, options) => {
      const k = ctxOf(model, range && range.getStartPosition());
      return k ? runRangeFormatting(k.c, k.vd, range, options) : [];
    },
  }),
  codeAction: () => ({
    provideCodeActions: async (model, range, ctx) => {
      const k = ctxOf(model, range && range.getStartPosition());
      return k ? runCodeAction(k.c, k.vd, range, ctx) : { actions: [], dispose() {} };
    },
  }),
  codeLens: () => ({
    provideCodeLenses: async (model) => {
      if (!model) return { lenses: [], dispose() {} };
      const c = contextsByUri.get(model.uri.toString());
      if (!c) return { lenses: [], dispose() {} };
      c.scan(false);
      const out = [];
      for (const region of c.regions) {
        if (region.languageId === c.config.parentLanguageId) continue;
        const vd = c.virtualDoc(region);
        if (!vd) continue;
        out.push(...(await runCodeLens(c, vd)).lenses);
      }
      return { lenses: out, dispose() {} };
    },
  }),
  documentHighlight: () => ({
    provideDocumentHighlights: async (model, position) => {
      const k = ctxOf(model, position);
      return k ? runHighlight(k.c, k.vd, position) : [];
    },
  }),
  documentLink: () => ({
    provideLinks: async (model) => {
      if (!model) return { links: [], dispose() {} };
      const c = contextsByUri.get(model.uri.toString());
      if (!c) return { links: [], dispose() {} };
      c.scan(false);
      const out = [];
      for (const region of c.regions) {
        if (region.languageId === c.config.parentLanguageId) continue;
        const vd = c.virtualDoc(region);
        if (!vd) continue;
        out.push(...(await runLink(c, vd)).links);
      }
      return { links: out, dispose() {} };
    },
  }),
};

const EXT_METHOD = {
  definition: "provideDefinition",
  typeDefinition: "provideTypeDefinition",
  implementation: "provideImplementation",
  references: "provideReferences",
};

const LSP_METHOD = {
  definition: "textDocument/definition",
  typeDefinition: "textDocument/typeDefinition",
  references: "textDocument/references",
};

const LSP_CAP = {
  definition: "definition",
  typeDefinition: "typeDefinition",
  references: "references",
};

const REGISTER = {
  completion: (l, s, p) => l.completionProvider.register(s, p),
  hover: (l, s, p) => l.hoverProvider.register(s, p),
  definition: (l, s, p) => l.definitionProvider.register(s, p),
  typeDefinition: (l, s, p) => l.typeDefinitionProvider.register(s, p),
  implementation: (l, s, p) => l.implementationProvider.register(s, p),
  references: (l, s, p) => l.referenceProvider.register(s, p),
  documentSymbol: (l, s, p) => l.documentSymbolProvider.register(s, p),
  signatureHelp: (l, s, p) => l.signatureHelpProvider.register(s, p),
  rename: (l, s, p) => l.renameProvider.register(s, p),
  formatting: (l, s, p) => l.documentFormattingEditProvider.register(s, p),
  rangeFormatting: (l, s, p) => l.documentRangeFormattingEditProvider.register(s, p),
  codeAction: (l, s, p) => l.codeActionProvider.register(s, p),
  codeLens: (l, s, p) => l.codeLensProvider.register(s, p),
  documentHighlight: (l, s, p) => l.documentHighlightProvider.register(s, p),
  documentLink: (l, s, p) => l.documentLinkProvider.register(s, p),
};

const KIND_ORDER = [
  "completion", "hover", "definition", "typeDefinition", "implementation",
  "references", "documentSymbol", "signatureHelp", "rename", "formatting",
  "rangeFormatting", "codeAction", "codeLens", "documentHighlight", "documentLink",
];

const disposables = new Map(); // hostLang -> Disposable[]

const registerHostLanguage = (lang) => {
  const sel = { language: lang };
  const ds = [];
  for (const kind of KIND_ORDER) {
    try {
      const d = REGISTER[kind](lfs, sel, P[kind]());
      if (d) ds.push(d);
    } catch (err) {
      console.warn("[embedded] register", lang, kind, err?.message || err);
    }
  }
  disposables.set(lang, ds);
};

// ── Diagnostics (embedded results published against the parent model) ─────────
const toMarkerMap = (c, vd, diagnostics) =>
  (diagnostics || []).map((d) => toEmbeddedMarker(c, vd, d)).filter(Boolean);

const handleLspDiagnostics = (ev) => {
  if (!markerService || !ev || !isVirtualPath(ev.path)) return;
  const parsed = parseVirtualPath(ev.path);
  if (!parsed) return;
  const c = contextsByPath.get(parsed.parentPath);
  if (!c) return;
  const region = c.regionByIndex(parsed.languageId, parsed.index);
  const vd = c.virtualDoc(region);
  if (!vd) return;
  try { markerService.changeOne(EMBEDDED_MARKER_OWNER, c.model.uri, toMarkerMap(c, vd, ev.diagnostics)); } catch {}
};

const parseVirtualUri = (uri) => {
  const m = /^(.*)#__embedded__([^#]+?)__(\d+)$/.exec(String(uri));
  if (!m) return null;
  return { parentModelUri: m[1], languageId: decodeURIComponent(m[2]), index: Number(m[3]) };
};

const handleExtDiagnostics = (ev) => {
  if (!markerService || !ev) return;
  if (ev.clear) {
    try { markerService.remove(EMBEDDED_MARKER_OWNER); } catch {}
    return;
  }
  if (!isVirtualUri(ev.uri)) return;
  const parsed = parseVirtualUri(ev.uri);
  if (!parsed) return;
  const c = contextsByUri.get(parsed.parentModelUri);
  if (!c) return;
  const region = c.regionByIndex(parsed.languageId, parsed.index);
  const vd = c.virtualDoc(region);
  if (!vd) return;
  try { markerService.changeOne(EMBEDDED_MARKER_OWNER, c.model.uri, toMarkerMap(c, vd, ev.diagnostics)); } catch {}
};

// ── Init / dispose ────────────────────────────────────────────────────────────
export const initRouter = async () => {
  initLanguageDirectory();
  if (registered) return;
  try {
    const [f, m] = await Promise.all([getService(ILanguageFeaturesService), getService(IMarkerService)]);
    lfs = f;
    markerService = m;
    api = window.electronAPI;
    for (const lang of HOST_LANGS) registerHostLanguage(lang);
    registered = true;
    // Backfill: models attached before the services resolved were scanned
    // without an IPC channel; re-scan them now so their LSP virtual docs open.
    for (const c of contextsByUri.values()) { c.lastVersion = -1; c.scan(true); }
    api?.onLspEvent(handleLspDiagnostics);
    api?.onExtEvent(handleExtDiagnostics);
  } catch (err) {
    console.warn("[embedded] router init failed:", err?.message || err);
  }
};

export const disposeRouter = () => {
  registered = false;
  for (const [, ds] of disposables) for (const d of ds) { try { d.dispose(); } catch {} }
  disposables.clear();
  for (const c of [...contextsByUri.values()]) c.close();
  contextsByUri.clear();
  contextsByPath.clear();
};

export const snapshotRouter = () => ({
  contexts: [...contextsByUri.values()].map((c) => ({
    uri: c.uri,
    path: c.path,
    language: c.model.getLanguageId(),
    regions: c.regions.map((r) => ({ languageId: r.languageId, startOffset: r.startOffset, endOffset: r.endOffset })),
  })),
});
