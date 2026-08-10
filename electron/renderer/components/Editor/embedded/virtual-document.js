// Virtual documents for embedded language regions.
//
// A VirtualDocument is the language-service view of one embedded region. It
// holds the region's content plus bidirectional position/offset mapping back
// to the parent Monaco model.
//
//   parent model offset  <->  virtual offset        (shift by region start)
//   parent position      <->  virtual position      (offset math + line tables)
//
// Parent-side position/offset conversion is delegated to the supplied model
// facade (an ITextModel exposes getOffsetAt/getPositionAt); the virtual side
// uses a precomputed line-start table so no Monaco model is created for the
// embedded text.

import { computeLineStarts, lineColAtOffset, offsetAtLineCol } from "./regions.js";

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Accepts both Monaco Range instances (getStartPosition/getEndPosition) and
// plain { startLineNumber, ... } objects.
const rangePos = (r, isStart) => {
  if (!r) return null;
  if (typeof r.getStartPosition === "function") return isStart ? r.getStartPosition() : r.getEndPosition();
  return isStart
    ? { lineNumber: r.startLineNumber, column: r.startColumn }
    : { lineNumber: r.endLineNumber, column: r.endColumn };
};

export class VirtualDocument {
  /**
   * @param {object} opts
   * @param {string} opts.uri           unique virtual URI (language-service id)
   * @param {string} opts.languageId    embedded language id (e.g. "css")
   * @param {string} opts.parentModelUri original model uri (file:///...)
   * @param {string} opts.parentPath     original file path (for LSP keying)
   * @param {number} opts.startOffset    content start offset in parent text
   * @param {number} opts.endOffset      content end offset in parent text
   * @param {string} opts.text           embedded content
   * @param {number} opts.index          region ordinal in the parent
   */
  constructor(opts) {
    this.uri = opts.uri;
    this.languageId = opts.languageId;
    this.parentModelUri = opts.parentModelUri;
    this.parentPath = opts.parentPath;
    this.startOffset = opts.startOffset;
    this.endOffset = opts.endOffset;
    this.text = opts.text;
    this.index = opts.index;
    this.version = 1;
    this._lineStarts = computeLineStarts(this.text);
  }

  update(text) {
    if (text === this.text) return false;
    this.text = text;
    this.version++;
    this._lineStarts = computeLineStarts(this.text);
    return true;
  }

  // ── Offset mapping ─────────────────────────────────────────────────────────
  toVirtualOffset(offset) { return clamp(offset - this.startOffset, 0, this.text.length); }
  toParentOffset(virtualOffset) { return this.startOffset + clamp(virtualOffset, 0, this.text.length); }

  // ── Position mapping (requires parent model facade) ───────────────────────
  // modelFacade: { getOffsetAt(position), getPositionAt(offset) }
  toVirtualPosition(model, parentPos) {
    const off = model.getOffsetAt(parentPos);
    const vOff = this.toVirtualOffset(off);
    const lc = lineColAtOffset(this.text, this._lineStarts, vOff);
    return { lineNumber: lc.line, column: lc.column };
  }

  toParentPosition(model, vPos) {
    const vOff = offsetAtLineCol(this._lineStarts, vPos.lineNumber, vPos.column);
    return model.getPositionAt(this.toParentOffset(vOff));
  }

  toVirtualRange(model, parentRange) {
    const s = this.toVirtualPosition(model, rangePos(parentRange, true));
    const e = this.toVirtualPosition(model, rangePos(parentRange, false));
    return {
      startLineNumber: s.lineNumber,
      startColumn: s.column,
      endLineNumber: e.lineNumber,
      endColumn: e.column,
    };
  }

  toParentRange(model, vRange) {
    return {
      startLineNumber: this.toParentPosition(model, { lineNumber: vRange.startLineNumber, column: vRange.startColumn }).lineNumber,
      startColumn: this.toParentPosition(model, { lineNumber: vRange.startLineNumber, column: vRange.startColumn }).column,
      endLineNumber: this.toParentPosition(model, { lineNumber: vRange.endLineNumber, column: vRange.endColumn }).lineNumber,
      endColumn: this.toParentPosition(model, { lineNumber: vRange.endLineNumber, column: vRange.endColumn }).column,
    };
  }

  // Position inside this virtual doc (for LSP-style {line, character} params)
  toLspPosition(model, parentPos) {
    const v = this.toVirtualPosition(model, parentPos);
    return { line: v.lineNumber - 1, character: v.column - 1 };
  }  // LSP range -> parent Monaco-compatible range object
  toParentRangeFromLsp(model, lr) {
    const v = { startLineNumber: lr.start.line + 1, startColumn: lr.start.character + 1, endLineNumber: lr.end.line + 1, endColumn: lr.end.character + 1 };
    return this.toParentRange(model, v);
  }

  // Monaco range -> LSP range (virtual)
  toLspRangeFromMonaco(model, range) {
    const v = this.toVirtualRange(model, range);
    return { start: { line: v.startLineNumber - 1, character: v.startColumn - 1 }, end: { line: v.endLineNumber - 1, character: v.endColumn - 1 } };
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────
export function buildVirtualUri(parentModelUri, languageId, index) {
  return `${parentModelUri}#__embedded__${encodeURIComponent(languageId)}__${index}`;
}

export function isVirtualUri(uri) {
  return typeof uri === "string" && uri.includes("#__embedded__");
}

export function isVirtualPath(path) {
  return typeof path === "string" && path.includes("#__embedded__");
}

// LSP keying uses a file-path-like string that round-trips through the LSP
// manager's pathToUri. Windows-legal and unambiguous:
export function virtualPathFor(parentPath, languageId, index) {
  const safe = String(languageId).replace(/[^A-Za-z0-9_.-]/g, "_");
  return `${parentPath}#__embedded__${safe}__${index}`;
}

export function parseVirtualPath(path) {
  const m = /^(.*)#__embedded__([^_][^_]*?)__(\d+)$/.exec(String(path));
  if (!m) return null;
  return { parentPath: m[1], languageId: m[2], index: Number(m[3]) };
}
