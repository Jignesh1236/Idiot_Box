// Embedded language region detection for HTML-family documents.
//
// The scanner is a small character-stream state machine that recognises HTML
// raw-text elements (<script>, <style>) and, for Vue, <template>. It walks the
// document once and produces LanguageRegion[] entries sorted by start offset.
//
// It is NOT a set of `lastIndexOf("<script")` hacks:
//   - HTML comments are skipped, so <script>/<style> inside comments are ignored.
//   - Tag/attribute scanning is quote-aware, so <script ... "foo>"> parses right.
//   - Malformed input degrades gracefully (unterminated tags -> text; an
//     unterminated block extends to EOF).
//   - Embedded languages are derived from the element's lang/type/language
//     attributes (lang="ts", lang="scss", type="module", ...), never assumed
//     to be plain JavaScript.
//
// The detector is driven by a small config map so additional host formats can
// be added without touching the scanner itself.

// ── Language attribute resolution ─────────────────────────────────────────────

const SCRIPT_LANG = {
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescriptreact",
  js: "javascript",
  jsx: "javascriptreact",
  module: "javascript",
  javascript: "javascript",
  json: "json",
  mjs: "javascript",
  cjs: "javascript",
  node: "javascript",
  "text/typescript": "typescript",
  "text/ts": "typescript",
  "application/typescript": "typescript",
  "text/tsx": "typescriptreact",
  "text/jsx": "javascriptreact",
  "text/javascript": "javascript",
  "application/javascript": "javascript",
  "application/ecmascript": "javascript",
  "text/babel": "javascript",
  "text/ecmascript-6": "javascript",
  "text/coffeescript": "coffeescript",
};

const STYLE_LANG = {
  css: "css",
  scss: "scss",
  less: "less",
  sass: "sass",
  stylus: "stylus",
  styl: "stylus",
  postcss: "postcss",
  pcss: "postcss",
  "text/scss": "scss",
  "text/less": "less",
  "text/x-scss": "scss",
  "text/x-less": "less",
};

function resolveScriptLanguage(value) {
  if (!value) return "javascript";
  const v = String(value).trim().toLowerCase();
  return SCRIPT_LANG[v] || v.replace(/^(text|application)\//, "") || "javascript";
}

function resolveStyleLanguage(value) {
  if (!value) return "css";
  const v = String(value).trim().toLowerCase();
  return STYLE_LANG[v] || v.replace(/^(text|application)\//, "") || "css";
}

// ── Host format config ────────────────────────────────────────────────────────
// key: normalized lowercase file extension. kind: one of "html" | "vue" |
// "svelte". Parent language is the language of the surrounding document.
export const HOST_CONFIG = {
  html: { kind: "html", parentLanguageId: "html" },
  htm: { kind: "html", parentLanguageId: "html" },
  xhtml: { kind: "html", parentLanguageId: "html" },
  php: { kind: "html", parentLanguageId: "php" },
  vue: { kind: "vue", parentLanguageId: "html" },
  svelte: { kind: "svelte", parentLanguageId: "html" },
};

export const isHostExt = (ext) => Object.prototype.hasOwnProperty.call(HOST_CONFIG, String(ext || "").toLowerCase().replace(/^\./, ""));
export const hostConfigForExt = (ext) => HOST_CONFIG[String(ext || "").toLowerCase().replace(/^\./, "")] || null;

// Monaco languageId -> host config (reverse of the file-extension mapping used
// by the editor panel). Used by the router to decide which models are embedded
// language hosts regardless of file extension.
export const hostConfigForLanguage = (languageId) => {
  if (!languageId) return null;
  const id = String(languageId).toLowerCase();
  if (id === "vue") return HOST_CONFIG.vue;
  if (id === "svelte") return HOST_CONFIG.svelte;
  if (id === "php") return HOST_CONFIG.php;
  if (id === "html" || id === "htm") return HOST_CONFIG.html;
  return null;
};

export const isHostLanguage = (languageId) => !!hostConfigForLanguage(languageId);

// ── Line table helpers (pure) ────────────────────────────────────────────────
// Precompute 1-based line start offsets. Binary search maps offset -> line.
export function computeLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c === 13) { if (text.charCodeAt(i + 1) === 10) i++; starts.push(i + 1); }
    else if (c === 10) starts.push(i + 1);
  }
  return starts;
}

export function lineColAtOffset(text, starts, offset) {
  const o = offset < 0 ? 0 : offset > text.length ? text.length : offset;
  let lo = 0, hi = starts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= o) lo = mid + 1;
    else hi = mid - 1;
  }
  const line = hi < 0 ? 0 : hi; // 0-based
  return { line: line + 1, column: o - starts[line] + 1 };
}

export function offsetAtLineCol(starts, line, column) {
  const ln = Math.max(1, line | 0);
  const idx = Math.min(starts.length - 1, ln - 1);
  return starts[idx] + Math.max(1, column | 0) - 1;
}

// ── Region model ─────────────────────────────────────────────────────────────
// Mirrors the shape requested in the spec:
//   languageId, startOffset/endOffset, startLine/startColumn/endLine/endColumn,
//   parentLanguageId, virtualDocumentUri
export const makeRegion = (text, starts, config, tagName, attrs, contentStart, contentEnd, parentUri, index) => {
  const languageId = tagName === "style"
    ? resolveStyleLanguage(getAttr(attrs, "lang") || getAttr(attrs, "type"))
    : tagName === "template"
      ? "html"
      : resolveScriptLanguage(getAttr(attrs, "lang") || getAttr(attrs, "language") || getAttr(attrs, "type"));
  const s = lineColAtOffset(text, starts, contentStart);
  const e = lineColAtOffset(text, starts, contentEnd);
  const safeStart = Math.min(contentStart, contentEnd);
  const safeEnd = Math.max(contentStart, contentEnd);
  return {
    tagName,
    languageId,
    startOffset: safeStart,
    endOffset: safeEnd,
    startLine: s.line,
    startColumn: s.column,
    endLine: e.line,
    endColumn: e.column,
    parentLanguageId: config.parentLanguageId,
    virtualDocumentUri: parentUri,
    index,
  };
};

function getAttr(attrs, name) {
  const l = String(name).toLowerCase();
  for (const a of attrs) {
    if (a && String(a.name).toLowerCase() === l) return a.value === null ? "" : String(a.value);
  }
  return null;
}

// ── The scanner ──────────────────────────────────────────────────────────────
function isTagChar(ch) { return /[A-Za-z0-9\-_:]/.test(ch); }

function parseAttributes(text, from) {
  // Scans attribute text starting just after the tag name. Returns
  // { attrs, nextIndex } where nextIndex points at '>' (or text.length when
  // the tag is malformed/unterminated).
  const attrs = [];
  let k = from;
  const n = text.length;
  let attrName = "";
  let attrVal = null;
  let inQuote = null;
  let pendingVal = false;

  while (k < n) {
    const ch = text[k];
    if (inQuote) {
      if (ch === inQuote) { inQuote = null; }
      else if (attrName) attrVal = (attrVal === null ? "" : attrVal) + ch;
      k++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      if (attrName && !pendingVal) attrVal = attrVal === null ? "" : attrVal;
      k++;
      continue;
    }
    if (ch === ">") break;
    if (ch === "/") { k++; if (text[k] === ">") break; continue; }
    if (ch === "=") {
      pendingVal = true;
      k++;
      while (k < n && /\s/.test(text[k])) k++;
      if (text[k] === '"' || text[k] === "'") { inQuote = text[k]; k++; continue; }
      let vs = "";
      while (k < n && !/[\s>]/.test(text[k])) { vs += text[k]; k++; }
      if (attrName) attrs.push({ name: attrName, value: vs });
      attrName = ""; attrVal = null; pendingVal = false;
      continue;
    }
    if (/\s/.test(ch)) {
      if (attrName) { attrs.push({ name: attrName, value: attrVal }); }
      attrName = ""; attrVal = null; pendingVal = false;
      k++;
      continue;
    }
    if (attrName && !pendingVal) {
      attrs.push({ name: attrName, value: attrVal });
    }
    attrName = "";
    while (k < n && !/[\s=>/]/.test(text[k]) && text[k] !== ">") { attrName += text[k]; k++; }
    attrVal = null; pendingVal = false;
    continue;
  }
  if (attrName) attrs.push({ name: attrName, value: attrVal });
  return { attrs, nextIndex: k };
}

function findRawTextEnd(text, from, tagName) {
  // HTML raw-text elements close at the FIRST matching closing tag. This is
  // the HTML parsing rule (not a heuristic), so strings/comments inside the
  // script/style body cannot fake a close.
  const close = `</${tagName}`;
  let i = from;
  const n = text.length;
  while (i < n) {
    const idx = text.toLowerCase().indexOf(close, i);
    if (idx < 0) return -1;
    // Ensure it's actually a closing tag boundary (followed by >, space, or /)
    const after = idx + close.length;
    if (after >= n || /[\s>\/]/.test(text[after])) return idx;
    i = idx + 1;
  }
  return -1;
}

/**
 * Detect embedded language regions in an HTML-family document.
 *
 * @param {string} text              full parent document text
 * @param {string} parentUri         synthetic virtual URI prefix for regions
 * @param {object} config            host config from HOST_CONFIG
 * @returns {Array<LanguageRegion>}  regions sorted by startOffset
 */
export function detectEmbeddedRegions(text, parentUri, config) {
  const regions = [];
  if (!config) return regions;
  const n = text.length;
  const starts = computeLineStarts(text);
  const kind = config.kind;
  const embedTemplate = kind === "vue";
  let i = 0;
  let regionIndex = 0;

  while (i < n) {
    const lt = text.indexOf("<", i);
    if (lt < 0) break;
    if (lt + 1 >= n) break;

    // HTML comment: skip entirely (script/style inside comments are NOT regions)
    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      i = end < 0 ? n : end + 3;
      continue;
    }
    // DOCTYPE / processing instruction
    if (text[lt + 1] === "!" || text[lt + 1] === "?") {
      const gt = text.indexOf(">", lt);
      i = gt < 0 ? n : gt + 1;
      continue;
    }
    // Closing tag
    if (text[lt + 1] === "/") {
      const gt = text.indexOf(">", lt);
      i = gt < 0 ? n : gt + 1;
      continue;
    }
    // Not a tag start
    if (!/[A-Za-z]/.test(text[lt + 1])) { i = lt + 1; continue; }

    let j = lt + 1;
    while (j < n && isTagChar(text[j])) j++;
    const tagName = text.slice(lt + 1, j).toLowerCase();
    const { attrs, nextIndex } = parseAttributes(text, j);

    if (text[nextIndex] !== ">") {
      // malformed / unterminated tag -> treat as plain text
      i = lt + 1;
      continue;
    }
    const openEnd = nextIndex + 1;
    const isSelfClosing = /\/\s*>$/.test(text.slice(lt, openEnd));

    const isRaw = tagName === "script" || tagName === "style";
    const isTemplate = tagName === "template" && embedTemplate;
    if ((isRaw || isTemplate) && !isSelfClosing) {
      const closeIdx = findRawTextEnd(text, openEnd, tagName);
      const contentStart = openEnd;
      const contentEnd = closeIdx < 0 ? n : closeIdx;
      const virtualUri = `${parentUri}#__${tagName}__${regionIndex}`;
      regions.push(makeRegion(text, starts, config, tagName, attrs, contentStart, contentEnd, virtualUri, regionIndex));
      regionIndex++;
      if (closeIdx < 0) break; // rest of the document is inside the block
      const gt = text.indexOf(">", closeIdx);
      i = gt < 0 ? n : gt + 1;
      continue;
    }
    i = openEnd;
  }

  return regions;
}
