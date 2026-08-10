// vscode API shim — runs inside the extension host process (utilityProcess).
//
// Extensions `require("vscode")` and receive the module exported here. Pure
// value classes (Uri, Position, Range, ...) are implemented locally; anything
// that needs the editor app (commands, providers, diagnostics, output,
// settings, filesystem) is routed to the main process through the `rpc`
// function supplied by the host entry point. Everything crossing the process
// boundary is plain JSON: vscode objects are converted by toPlain()/toVscode().
"use strict";

const path = require("path");

// ── RPC plumbing (injected by extension-host.cjs) ────────────────────────────
let rpc = null;        // async (ns, method, args) => result
let rpcNotify = null;  // (ns, method, args) fire & forget
let bootEnv = { appRoot: "", appName: "ppoo", version: "1.94.0", language: "en", uriScheme: "vscode", machineId: "unknown", sessionId: "unknown", shell: "", userDataPath: "" };

const pathJoin = (...parts) => {
  const sep = process.platform === "win32" ? "\\" : "/";
  return parts
    .filter((p) => p !== undefined && p !== null && String(p) !== "")
    .map((p, i) => String(p).replace(/[\\/]+$/, ""))
    .join(sep);
};
const setRpc = (fn) => { rpc = fn; };
const setRpcNotify = (fn) => { rpcNotify = fn; };
const setBootEnv = (env) => { if (env) bootEnv = { ...bootEnv, ...env }; };

const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
const isWin = process.platform === "win32";

// ── Uri ──────────────────────────────────────────────────────────────────────
class Uri {
  constructor(scheme, authority, p, query, fragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = p;
    this.query = query;
    this.fragment = fragment;
    this._fsPath = undefined;
  }
  static file(p) {
    let s = String(p || "").replace(/\\/g, "/");
    if (isWin && /^[A-Za-z]:/.test(s)) s = "/" + s;
    s = s.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\?/g, "%3F").replace(/ /g, "%20");
    return new Uri("file", "", s, "", "");
  }
  static parse(str) {
    const s = String(str || "");
    const m = s.match(/^([a-z][a-z0-9+.-]*):(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i);
    if (!m) throw new Error(`Uri.parse: invalid uri: ${s}`);
    return new Uri(m[1].toLowerCase(), m[2] || "", m[3] || "", m[4] || "", m[5] || "");
  }
  static from(components) {
    if (!components) throw new Error("Uri.from: missing components");
    if (components.fsPath !== undefined) return Uri.file(components.fsPath);
    return new Uri(components.scheme, components.authority || "", components.path || "", components.query || "", components.fragment || "");
  }
  static joinPath(uri, ...parts) {
    const joined = path.posix.join(uri.path, ...parts.map((x) => String(x)));
    return new Uri(uri.scheme, uri.authority, joined, uri.query, uri.fragment);
  }
  get fsPath() {
    if (this._fsPath !== undefined) return this._fsPath;
    if (this.scheme !== "file") return (this._fsPath = "");
    let out = safeDecode(this.path);
    if (isWin) {
      out = out.replace(/\//g, "\\");
      if (out.startsWith("\\\\")) return (this._fsPath = out); // UNC path
      if (out.startsWith("\\") && /^[A-Za-z]:/.test(out.slice(1))) out = out.slice(1); // /C:/… -> C:\…
    }
    return (this._fsPath = out);
  }
  with(change) {
    return new Uri(change.scheme ?? this.scheme, change.authority ?? this.authority, change.path ?? this.path, change.query ?? this.query, change.fragment ?? this.fragment);
  }
  toString(skipEncoding) {
    const enc = (s) => (skipEncoding ? s : s.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\?/g, "%3F"));
    let s = `${this.scheme}:`;
    if (this.authority) s += `//${this.authority}`;
    s += this.path || "";
    if (this.query) s += `?${enc(this.query)}`;
    if (this.fragment) s += `#${enc(this.fragment)}`;
    return s;
  }
}

// ── Position / Range / Selection ─────────────────────────────────────────────
class Position {
  constructor(line, character) {
    if (typeof line !== "number" || typeof character !== "number" || line < 0 || character < 0) {
      throw new Error("Invalid position: line and character must be non-negative integers");
    }
    this.line = Math.floor(line);
    this.character = Math.floor(character);
  }
  isBefore(other) { return this.line < other.line || (this.line === other.line && this.character < other.character); }
  isBeforeOrEqual(other) { return this.compareTo(other) <= 0; }
  isAfter(other) { return this.line > other.line || (this.line === other.line && this.character > other.character); }
  isAfterOrEqual(other) { return this.compareTo(other) >= 0; }
  isEqual(other) { return this.line === other.line && this.character === other.character; }
  compareTo(other) { return this.line === other.line ? this.character - other.character : this.line - other.line; }
  translate(deltaLine, deltaCharacter) {
    if (deltaLine === undefined) return new Position(this.line, this.character + deltaCharacter);
    if (deltaLine && typeof deltaLine === "object") {
      return new Position(this.line + (deltaLine.lineDelta || 0), this.character + (deltaLine.characterDelta || 0));
    }
    return new Position(this.line + deltaLine, this.character + (deltaCharacter || 0));
  }
  with(change) {
    if (change === undefined) return this;
    if (typeof change === "number") return new Position(this.line, change);
    return new Position(change.line ?? this.line, change.character ?? this.character);
  }
}

class Range {
  constructor(startLine, startCharacter, endLine, endCharacter) {
    if (typeof startLine === "object") {
      this.start = startLine;
      this.end = startCharacter;
    } else {
      this.start = new Position(startLine, startCharacter);
      this.end = new Position(endLine, endCharacter);
    }
  }
  get isEmpty() { return this.start.isEqual(this.end); }
  get isSingleLine() { return this.start.line === this.end.line; }
  contains(p) {
    if (p instanceof Position) return this.start.isBeforeOrEqual(p) && this.end.isAfterOrEqual(p);
    return this.start.isBeforeOrEqual(p.start) && this.end.isAfterOrEqual(p.end);
  }
  isEqual(other) { return other && this.start.isEqual(other.start) && this.end.isEqual(other.end); }
  intersection(other) {
    const start = this.start.isAfter(other.start) ? this.start : other.start;
    const end = this.end.isBefore(other.end) ? this.end : other.end;
    if (start.isAfter(end)) return undefined;
    return new Range(start, end);
  }
  union(other) {
    const start = this.start.isBefore(other.start) ? this.start : other.start;
    const end = this.end.isAfter(other.end) ? this.end : other.end;
    return new Range(start, end);
  }
  with(change) {
    const start = change.start !== undefined ? (change.start instanceof Position ? change.start : new Position(change.start.line, change.start.character)) : this.start;
    const end = change.end !== undefined ? (change.end instanceof Position ? change.end : new Position(change.end.line, change.end.character)) : this.end;
    return new Range(start, end);
  }
}

class Selection extends Range {
  constructor(anchorLine, anchorCharacter, activeLine, activeCharacter) {
    if (typeof anchorLine === "object") {
      super(anchorLine.anchor, anchorLine.active);
      this.anchor = anchorLine.anchor;
      this.active = anchorLine.active;
    } else {
      super(anchorLine, anchorCharacter, activeLine, activeCharacter);
      this.anchor = new Position(anchorLine, anchorCharacter);
      this.active = new Position(activeLine, activeCharacter);
    }
  }
  get isReversed() { return this.anchor.compareTo(this.active) > 0; }
}

// ── Disposable / Emitter / Cancellation ──────────────────────────────────────
class Disposable {
  constructor(callOnDispose) { this._cb = callOnDispose; this._isDisposed = false; }
  dispose() {
    if (this._isDisposed) return;
    this._isDisposed = true;
    const cb = this._cb;
    this._cb = undefined;
    if (cb) { try { cb(); } catch {} }
  }
  get isDisposed() { return this._isDisposed; }
  static from(...list) {
    const arr = list.filter(Boolean);
    if (arr.length === 1) return arr[0];
    return new Disposable(() => { for (const d of arr) { try { d.dispose(); } catch {} } });
  }
  static to(value) { return value; }
}

class Emitter {
  constructor(options) { this._listeners = new Set(); }
  get event() {
    return (listener, thisArgs, disposables) => {
      const handler = { listener, thisArgs };
      this._listeners.add(handler);
      if (disposables) disposables.push(new Disposable(() => this._listeners.delete(handler)));
      return new Disposable(() => this._listeners.delete(handler));
    };
  }
  fire(event) {
    for (const h of [...this._listeners]) {
      try { h.listener.call(h.thisArgs, event); } catch (err) { console.error("[vscode] emitter listener error:", err); }
    }
  }
  dispose() { this._listeners.clear(); }
}
const EventEmitter = Emitter;

const Event = (listener) => new Disposable(() => {});
const NOOP = () => {};

class CancellationTokenSource {
  constructor() {
    this._token = Object.freeze({ isCancellationRequested: false, onCancellationRequested: NOOP });
  }
  get token() { return this._token; }
  cancel() {}
  dispose() {}
}

// ── LSP-style value types ────────────────────────────────────────────────────
class Location {
  constructor(uri, rangeOrPosition) {
    this.uri = uri instanceof Uri ? uri : Uri.parse(String(uri));
    this.range = rangeOrPosition instanceof Range
      ? rangeOrPosition
      : rangeOrPosition instanceof Position ? new Range(rangeOrPosition, rangeOrPosition) : rangeOrPosition;
  }
}

const DiagnosticSeverity = Object.freeze({ Error: 0, Warning: 1, Information: 2, Hint: 3 });
const DiagnosticTag = Object.freeze({ Unnecessary: 1, Deprecated: 2 });

class Diagnostic {
  constructor(range, message, severity) {
    this.range = range instanceof Range ? range : new Range(range, range);
    this.message = String(message || "");
    this.severity = severity ?? DiagnosticSeverity.Error;
    this.source = undefined;
    this.code = undefined;
    this.relatedInformation = undefined;
    this.tags = undefined;
  }
}

class DiagnosticRelatedInformation {
  constructor(location, message) {
    this.location = location;
    this.message = String(message || "");
  }
}

class TextEdit {
  constructor(range, newText) { this.range = range; this.newText = newText; }
  static replace(range, newText) { return new TextEdit(range, newText); }
  static insert(position, newText) { return new TextEdit(new Range(position, position), newText); }
  static delete(range) { return new TextEdit(range, ""); }
}

class WorkspaceEdit {
  constructor() {
    this._changes = new Map();
    this._documentChanges = [];
  }
  get size() {
    let n = this._changes.size;
    for (const d of this._documentChanges) n += (d.edits || []).length;
    return n;
  }
  _key(uri) { return uri instanceof Uri ? uri.toString() : String(uri); }
  get(uri) {
    const k = this._key(uri);
    if (this._changes.has(k)) return [...this._changes.get(k)];
    const dc = this._documentChanges.find((d) => d.textDocument.uri === k);
    return dc ? [...dc.edits] : undefined;
  }
  has(uri) {
    const k = this._key(uri);
    return this._changes.has(k) || this._documentChanges.some((d) => d.textDocument.uri === k);
  }
  set(uri, edits) {
    const k = this._key(uri);
    this._changes.set(k, (edits || []).filter(Boolean));
    this._documentChanges = this._documentChanges.filter((d) => d.textDocument.uri !== k);
  }
  replace(uri, range, newText) { this.set(uri, [...(this.get(uri) || []), TextEdit.replace(range, newText)]); }
  insert(uri, position, newText) { this.set(uri, [...(this.get(uri) || []), TextEdit.insert(position, newText)]); }
  delete(uri, range) { this.set(uri, [...(this.get(uri) || []), TextEdit.delete(range)]); }
  entries() {
    const out = [];
    for (const [uri, edits] of this._changes) out.push([Uri.parse(uri), edits]);
    for (const d of this._documentChanges) out.push([Uri.parse(d.textDocument.uri), d.edits]);
    return out;
  }
}

class SnippetString {
  constructor(value) { this.value = value || ""; }
  appendText(str) { this.value += str; return this; }
  appendTabstop(n) { this.value += "$" + (n ?? 0); return this; }
  appendPlaceholder(value, n) {
    const idx = n ?? 0;
    if (typeof value === "string") this.value += `\${${idx}:${value}}`;
    else this.value += `\${${idx}:placeholder}`;
    return this;
  }
  appendVariable(name, defaultValue) {
    this.value += `\${${name}${defaultValue !== undefined ? `:${defaultValue}` : ""}}`;
    return this;
  }
}

class MarkdownString {
  constructor(value) {
    this.value = value || "";
    this.isTrusted = false;
    this.supportThemeIcons = false;
    this.supportHtml = false;
  }
  static isMarkdownString(v) { return v instanceof MarkdownString || (v && typeof v === "object" && typeof v.value === "string"); }
  appendText(value) { this.value += value; return this; }
  appendMarkdown(value) { this.value += value; return this; }
  appendCodeblock(code, language) { this.value += `\n\`\`\`${language || ""}\n${code}\n\`\`\`\n`; return this; }
}

// ── Completion / Hover / CodeAction / Symbols ────────────────────────────────
const CompletionItemKind = Object.freeze({
  Text: 0, Method: 1, Function: 2, Constructor: 3, Field: 4, Variable: 5, Class: 6,
  Interface: 7, Module: 8, Property: 9, Unit: 10, Value: 11, Enum: 12, Keyword: 13,
  Snippet: 14, Color: 15, File: 16, Reference: 17, Folder: 18, EnumMember: 19,
  Constant: 20, Struct: 21, Event: 22, Operator: 23, TypeParameter: 24,
});
const CompletionItemTag = Object.freeze({ Deprecated: 1 });

class CompletionItem {
  constructor(label, kind) {
    this.label = label;
    this.kind = kind ?? CompletionItemKind.Text;
    this.detail = undefined;
    this.documentation = undefined;
    this.sortText = undefined;
    this.filterText = undefined;
    this.insertText = undefined;
    this.insertTextFormat = undefined;
    this.textEdit = undefined;
    this.additionalTextEdits = undefined;
    this.command = undefined;
    this.preselect = undefined;
    this.tags = undefined;
    this.range = undefined;
  }
}

class CompletionList {
  constructor(items = [], isIncomplete = false) {
    this.items = items;
    this.isIncomplete = isIncomplete;
  }
}

class Hover {
  constructor(contents, range) {
    this.contents = Array.isArray(contents) ? contents : [contents];
    this.range = range;
  }
}

class CodeActionKind {
  constructor(value) { this.value = value; }
  static get Empty() { return new CodeActionKind(""); }
  static get QuickFix() { return new CodeActionKind("quickfix"); }
  static get Refactor() { return new CodeActionKind("refactor"); }
  static get RefactorExtract() { return new CodeActionKind("refactor.extract"); }
  static get RefactorInline() { return new CodeActionKind("refactor.inline"); }
  static get RefactorRewrite() { return new CodeActionKind("refactor.rewrite"); }
  static get Source() { return new CodeActionKind("source"); }
  static get SourceOrganizeImports() { return new CodeActionKind("source.organizeImports"); }
  static get SourceFixAll() { return new CodeActionKind("source.fixAll"); }
  append(parts) { return new CodeActionKind(this.value ? `${this.value}.${parts}` : parts); }
  contains(other) { return other instanceof CodeActionKind && (this.value === other.value || other.value.startsWith(this.value + ".")); }
  intersects(other) { return this.contains(other) || other.contains(this); }
}

class CodeAction {
  constructor(title, kind) {
    this.title = title;
    this.kind = kind;
    this.diagnostics = undefined;
    this.edit = undefined;
    this.command = undefined;
    this.isPreferred = undefined;
    this.disabled = undefined;
  }
  static is(v) { return v instanceof CodeAction || (v && typeof v === "object" && typeof v.title === "string"); }
}

class CodeActionList {
  constructor(actions, dispose) {
    this._actions = actions;
    this._dispose = dispose;
  }
  get actions() { return this._actions; }
  dispose() { if (this._dispose) this._dispose(); }
}

class CodeLens {
  constructor(range, command) { this.range = range; this.command = command; }
  get isResolved() { return !!this.command; }
}

class DocumentSymbol {
  constructor(name, detail, kind, range, selectionRange) {
    this.name = name;
    this.detail = detail;
    this.kind = kind;
    this.range = range;
    this.selectionRange = selectionRange;
    this.children = [];
    this.tags = [];
  }
}

class SymbolInformation {
  constructor(name, kind, range, uri, containerName) {
    this.name = name;
    this.kind = kind;
    this.location = uri instanceof Uri ? new Location(uri, range) : uri;
    this.containerName = containerName || "";
    this.tags = [];
  }
}

const SymbolKind = Object.freeze({
  File: 0, Module: 1, Namespace: 2, Package: 3, Class: 4, Method: 5, Property: 6,
  Field: 7, Constructor: 8, Enum: 9, Interface: 10, Function: 11, Variable: 12,
  Constant: 13, String: 14, Number: 15, Boolean: 16, Array: 17, Object: 18,
  Key: 19, Null: 20, EnumMember: 21, Struct: 22, Event: 23, Operator: 24, TypeParameter: 25,
});
const SymbolTag = Object.freeze({ Deprecated: 1 });

class SignatureHelp {
  constructor() { this.signatures = []; this.activeSignature = 0; this.activeParameter = 0; }
}
class SignatureInformation {
  constructor(label, documentation) {
    this.label = label;
    this.documentation = documentation;
    this.parameters = [];
    this.activeParameter = undefined;
  }
}
class ParameterInformation {
  constructor(label, documentation) {
    this.label = label;
    this.documentation = documentation;
  }
}
class DocumentHighlight {
  constructor(range, kind) { this.range = range; this.kind = kind ?? DocumentHighlightKind.Text; }
}
const DocumentHighlightKind = Object.freeze({ Text: 0, Read: 1, Write: 2 });

const FileSystemError = class FileSystemError extends Error {
  constructor(messageOrUri, code) {
    super(typeof messageOrUri === "string" ? messageOrUri : (messageOrUri ? String(messageOrUri) : ""));
    this.name = "FileSystemError";
    this.code = code || "Unknown";
  }
  static FileNotFound(m) { return new FileSystemError(m, "FileNotFound"); }
  static FileExists(m) { return new FileSystemError(m, "FileExists"); }
  static NoPermissions(m) { return new FileSystemError(m, "NoPermissions"); }
  static IsFile(m) { return new FileSystemError(m, "IsFile"); }
  static IsDirectory(m) { return new FileSystemError(m, "IsDirectory"); }
  static NotModified(m) { return new FileSystemError(m, "NotModified"); }
  static Unknown(m) { return new FileSystemError(m, "Unknown"); }
};

// ── TextDocument facade ──────────────────────────────────────────────────────
class DocumentLink {
  constructor(range, target) {
    this.range = range;
    this.target = target;
    this.tooltip = undefined;
  }
}

class CallHierarchyItem {
  constructor(kind, name, detail, uri, range, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail;
    this.uri = uri;
    this.range = range;
    this.selectionRange = selectionRange;
  }
}

class TextDocument {
  constructor(snapshot) {
    this._uri = snapshot.uri instanceof Uri ? snapshot.uri : Uri.parse(snapshot.uri);
    this._languageId = snapshot.languageId || "plaintext";
    this._version = snapshot.version || 1;
    this._text = snapshot.text || "";
    this._closed = !!snapshot.closed;
  }
  get uri() { return this._uri; }
  get fileName() { return this._uri.fsPath; }
  get languageId() { return this._languageId; }
  get version() { return this._version; }
  get isDirty() { return false; }
  get isClosed() { return this._closed; }
  get isUntitled() { return this._uri.scheme !== "file"; }
  get isText() { return true; }
  get lineCount() { return this._text.split("\n").length; }
  get eol() { return 1; }
  getText(range) {
    if (!range) return this._text;
    const lines = this._text.split("\n");
    if (range.start.line === range.end.line) {
      const line = lines[range.start.line] || "";
      return line.slice(range.start.character, range.end.character);
    }
    const parts = [];
    for (let i = range.start.line; i <= range.end.line; i++) {
      const line = lines[i] || "";
      if (i === range.start.line) parts.push(line.slice(range.start.character));
      else if (i === range.end.line) parts.push(line.slice(0, range.end.character));
      else parts.push(line);
    }
    return parts.join("\n");
  }
  lineAt(posOrLine) {
    const line = typeof posOrLine === "number" ? posOrLine : posOrLine.line;
    const lines = this._text.split("\n");
    const text = lines[line] || "";
    const ws = text.search(/\S/);
    return {
      lineNumber: line,
      text,
      range: new Range(line, 0, line, text.length),
      firstNonWhitespaceCharacterIndex: ws < 0 ? text.length : ws,
    };
  }
  offsetAt(pos) {
    const lines = this._text.split("\n");
    let off = 0;
    for (let i = 0; i < pos.line; i++) off += lines[i].length + 1;
    return off + Math.min(pos.character, (lines[pos.line] || "").length);
  }
  positionAt(offset) {
    let line = 0, col = 0;
    for (let i = 0; i < offset && i < this._text.length; i++) {
      if (this._text[i] === "\n") { line++; col = 0; } else col++;
    }
    return new Position(line, col);
  }
  getWordRangeAtPosition(pos, regex) {
    const line = this.lineAt(pos).text;
    const re = regex || /[A-Za-z0-9_]+/g;
    let m;
    while ((m = re.exec(line))) {
      if (pos.character >= m.index && pos.character <= m.index + m[0].length) {
        return new Range(pos.line, m.index, pos.line, m.index + m[0].length);
      }
    }
    return undefined;
  }
  validateRange(range) {
    const lineCount = this.lineCount;
    const start = new Position(Math.max(0, Math.min(range.start.line, lineCount - 1)), Math.max(0, range.start.character));
    const end = new Position(Math.max(0, Math.min(range.end.line, lineCount - 1)), Math.max(0, range.end.character));
    return new Range(start, end);
  }
  validatePosition(pos) {
    const lineCount = this.lineCount;
    return new Position(Math.max(0, Math.min(pos.line, lineCount - 1)), Math.max(0, pos.character));
  }
  save() { return rpc("doc", "save", { uri: this._uri.toString() }).then((r) => !!r); }
}

// ── OutputChannel / StatusBarItem facades ────────────────────────────────────
class OutputChannel {
  constructor(name, extKey) {
    this.name = name;
    this._extKey = extKey;
  }
  get isShown() { return false; }
  append(value) { rpcNotify("output", "append", { extKey: this._extKey, name: this.name, text: String(value ?? "") }); }
  appendLine(value) { this.append(String(value ?? "") + "\n"); }
  replace(value) { rpcNotify("output", "replace", { extKey: this._extKey, name: this.name, text: String(value ?? "") }); }
  clear() { rpcNotify("output", "clear", { extKey: this._extKey, name: this.name }); }
  show() { rpcNotify("output", "show", { extKey: this._extKey, name: this.name }); }
  hide() { rpcNotify("output", "hide", { extKey: this._extKey, name: this.name }); }
  dispose() { rpcNotify("output", "dispose", { extKey: this._extKey, name: this.name }); }
}

const StatusBarAlignment = Object.freeze({ Left: 1, Right: 2 });

const ExtensionMode = Object.freeze({ Production: 1, Development: 2, Test: 3 });

class EnvironmentVariableCollection {
  constructor() {
    this._map = new Map();
    this.persistent = true;
  }
  get size() { return this._map.size; }
  get(variable) { return this._map.get(variable); }
  forEach(callback) { this._map.forEach((v, k) => callback(v, k, this)); }
  append(variable, value) { this._map.set(variable, { value: String(value ?? ""), type: 1 }); }
  prepend(variable, value) { this._map.set(variable, { value: String(value ?? ""), type: 2 }); }
  replace(variable, value) { this._map.set(variable, { value: String(value ?? ""), type: 3 }); }
  delete(variable) { this._map.delete(variable); }
  clear() { this._map.clear(); }
}

class Memento {
  constructor(extId, scope, defaultValue) {
    this._extId = extId;
    this._scope = scope; // "workspace" | "global"
    this._cache = new Map();
    this._loaded = false;
    this._defaultValue = defaultValue === undefined ? {} : defaultValue;
  }
  async _load() {
    if (this._loaded) return;
    this._loaded = true;
    try {
      const data = await rpc("workspace", "storage", { extId: this._extId, scope: this._scope, op: "get" });
      this._cache = new Map(Object.entries(data || {}));
    } catch { this._cache = new Map(); }
  }
  get(key, defaultValue) {
    if (!this._loaded) return this._cache.has(key) ? this._cache.get(key) : (defaultValue !== undefined ? defaultValue : undefined);
    return this._cache.has(key) ? this._cache.get(key) : (defaultValue !== undefined ? defaultValue : undefined);
  }
  keys() { return [...this._cache.keys()]; }
  setKeysForSync() { /* no-op: sync across machines is not supported */ }
  async update(key, value) {
    this._cache.set(key, value);
    try {
      await rpc("workspace", "storage", { extId: this._extId, scope: this._scope, op: "set", key, value });
    } catch { /* persistence best-effort */ }
  }
}

class ExtensionContext {
  constructor(extId, dir, packageJSON) {
    this._extId = extId;
    this._dir = dir;
    this.subscriptions = [];
    const view = { id: extId, dir, packageJSON, isActive: true };
    this.extension = {
      id: extId,
      extensionUri: Uri.file(dir),
      extensionPath: dir,
      isActive: true,
      packageJSON,
      extensionKind: [1],
      exports: undefined,
      activate: () => rpc("extensions", "ensureActivated", { id: extId }).then(() => undefined),
    };
    this.extensionUri = Uri.file(dir);
    this.extensionPath = dir;
    this.logUri = Uri.file(dir);
    const base = bootEnv.userDataPath ? pathJoin(bootEnv.userDataPath, "ext-host-data", extId) : dir;
    this.storageUri = Uri.file(base);
    this.globalStorageUri = Uri.file(base);
    this.environmentVariableCollection = new EnvironmentVariableCollection();
    this.extensionMode = ExtensionMode.Production;
    this.workspaceState = new Memento(extId, "workspace");
    this.globalState = new Memento(extId, "global");
  }
  asAbsolutePath(rel) { return pathJoin(this._dir, String(rel || "")); }
}

class StatusBarItem {
  constructor(id, extKey) {
    this._id = id;
    this._extKey = extKey;
    this._alignment = StatusBarAlignment.Left;
    this._priority = 0;
    this._visible = false;
    this._text = "";
    this._tooltip = undefined;
    this._command = undefined;
    this._color = undefined;
    this._backgroundColor = undefined;
    this._accessibilityInformation = undefined;
  }
  get id() { return this._id; }
  get alignment() { return this._alignment; }
  get priority() { return this._priority; }
  get text() { return this._text; }
  set text(v) { this._text = String(v ?? ""); this._push(); }
  get tooltip() { return this._tooltip; }
  set tooltip(v) { this._tooltip = v; this._push(); }
  get command() { return this._command; }
  set command(v) { this._command = v; this._push(); }
  get color() { return this._color; }
  set color(v) { this._color = v; this._push(); }
  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(v) { this._backgroundColor = v; this._push(); }
  get accessibilityInformation() { return this._accessibilityInformation; }
  set accessibilityInformation(v) { this._accessibilityInformation = v; this._push(); }
  show() { this._visible = true; this._push(); }
  hide() { this._visible = false; this._push(); }
  dispose() { this._visible = false; rpcNotify("statusbar", "dispose", { id: this._id, extKey: this._extKey }); }
  _push() {
    rpcNotify("statusbar", "update", {
      id: this._id, extKey: this._extKey, text: this._text || "", tooltip: this._tooltip,
      command: this._command, color: this._color, backgroundColor: this._backgroundColor,
      alignment: this._alignment, priority: this._priority, visible: this._visible,
    });
  }
}

// ── Module-scope registries ──────────────────────────────────────────────────
let currentActivatingExtKey = "";
let configCache = {};
const configDefaults = {}; // dotted key -> default value, from extension contributes.configuration
const hostDocs = new Map(); // uri -> { snapshot, facade }
const watcherRegistrations = new Map();
const contentProviders = new Map(); // scheme -> TextDocumentContentProvider
const commandHandlers = new Map();
const commandThis = new Map();
const providers = new Map();
const extRecords = new Map();
const extensionsChangedEmitter = new Emitter();
const diagCollections = new Map();
let fsWatcherSeq = 0;
let statusBarSeq = 0;
let webviewSeq = 0;
let workspaceFoldersValue = null;
let api = null;

const webviewPanels = new Map();       // panelId -> { panelId, extKey, extDir, viewType, title, emitters, disposed, visible, facade }
const webviewViewProviders = new Map(); // viewType -> { provider, extKey, options }
const treeDataProviders = new Map();    // viewId -> { provider, extKey }
const treeViews = new Map();            // viewId -> { viewId, extKey, title, showCollapseAll, emitters }
const unsupportedLogged = new Set();    // "extKey|api" -> logged once

const logUnsupported = (name, err) => {
  const key = `${currentActivatingExtKey}|${name}`;
  if (unsupportedLogged.has(key)) return;
  unsupportedLogged.add(key);
  const msg = (err && err.message) || String(err || "not supported in this editor");
  console.error(`Extension: ${currentActivatingExtKey} API: ${name} Error: ${msg}`);
};

// ── Workspace event emitters (module-level; shared by api + hostApi) ────────
const workspaceEmitters = {
  onDidOpenTextDocument: new Emitter(),
  onDidCloseTextDocument: new Emitter(),
  onDidChangeTextDocument: new Emitter(),
  onDidSaveTextDocument: new Emitter(),
  onDidChangeConfiguration: new Emitter(),
  onDidChangeWorkspaceFolders: new Emitter(),
};

// ── Plain <-> vscode conversion ──────────────────────────────────────────────
const toPlain = (v) => {
  if (v === null || v === undefined || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map((x) => toPlain(x));
  if (v instanceof Error) return { name: v.name || "Error", message: v.message || String(v) };
  if (v instanceof Uri) return { $kind: "uri", scheme: v.scheme, authority: v.authority, path: v.path, query: v.query, fragment: v.fragment };
  if (v instanceof Position) return { $kind: "position", line: v.line, character: v.character };
  if (v instanceof Selection) return { $kind: "selection", anchor: toPlain(v.anchor), active: toPlain(v.active), start: toPlain(v.start), end: toPlain(v.end) };
  if (v instanceof Range) return { $kind: "range", start: toPlain(v.start), end: toPlain(v.end) };
  if (v instanceof Location) return { $kind: "location", uri: toPlain(v.uri), range: toPlain(v.range) };
  if (v instanceof TextEdit) return { $kind: "textEdit", range: toPlain(v.range), newText: v.newText };
  if (v instanceof Diagnostic) return {
    $kind: "diagnostic",
    range: toPlain(v.range),
    message: v.message,
    severity: v.severity,
    code: v.code && typeof v.code === "object" ? { value: v.code.value, target: v.code.target ? toPlain(v.code.target) : undefined } : v.code,
    source: v.source,
    tags: v.tags,
    relatedInformation: v.relatedInformation ? v.relatedInformation.map((ri) => ({ location: toPlain(ri.location), message: ri.message })) : undefined,
  };
  if (v instanceof MarkdownString) return { $kind: "markdown", value: v.value, isTrusted: v.isTrusted, supportThemeIcons: v.supportThemeIcons };
  if (v instanceof CompletionItem) {
    return {
      $kind: "completionItem",
      label: v.label, kind: v.kind, detail: v.detail, documentation: toPlain(v.documentation),
      sortText: v.sortText, filterText: v.filterText, insertText: v.insertText,
      insertTextFormat: v.insertTextFormat, textEdit: toPlain(v.textEdit),
      additionalTextEdits: v.additionalTextEdits ? v.additionalTextEdits.map((e) => toPlain(e)) : undefined,
      preselect: v.preselect, tags: v.tags, range: toPlain(v.range),
    };
  }
  if (v instanceof CompletionList) return { $kind: "completionList", isIncomplete: v.isIncomplete, items: toPlain(v.items) };
  if (v instanceof Hover) return { $kind: "hover", contents: toPlain(v.contents), range: toPlain(v.range) };
  if (v instanceof CodeAction) return {
    $kind: "codeAction",
    title: v.title,
    kind: v.kind && v.kind.value !== undefined ? v.kind.value : undefined,
    diagnostics: v.diagnostics ? v.diagnostics.map((d) => toPlain(d)) : undefined,
    edit: toPlain(v.edit),
    command: v.command ? { id: v.command.id, title: v.command.title, arguments: toPlain(v.command.arguments) } : undefined,
    isPreferred: v.isPreferred,
    disabled: v.disabled,
  };
  if (v instanceof CodeActionList) return { $kind: "codeActionList", actions: toPlain(v._actions || v.actions || []) };
  if (v instanceof CodeLens) return { $kind: "codeLens", range: toPlain(v.range), command: v.command ? { id: v.command.id, title: v.command.title, arguments: toPlain(v.command.arguments) } : undefined };
  if (v instanceof DocumentSymbol) return {
    $kind: "documentSymbol",
    name: v.name, detail: v.detail, kind: v.kind, tags: v.tags,
    range: toPlain(v.range), selectionRange: toPlain(v.selectionRange),
    children: (v.children || []).map((c) => toPlain(c)),
  };
  if (v instanceof SymbolInformation) return { $kind: "symbolInfo", name: v.name, kind: v.kind, tags: v.tags, location: toPlain(v.location), containerName: v.containerName };
  if (v instanceof SignatureHelp) return { $kind: "signatureHelp", signatures: toPlain(v.signatures), activeSignature: v.activeSignature, activeParameter: v.activeParameter };
  if (v instanceof SignatureInformation) return { $kind: "signatureInfo", label: v.label, documentation: toPlain(v.documentation), parameters: toPlain(v.parameters), activeParameter: v.activeParameter };
  if (v instanceof ParameterInformation) return { $kind: "paramInfo", label: v.label, documentation: toPlain(v.documentation) };
  if (v instanceof DocumentHighlight) return { $kind: "documentHighlight", range: toPlain(v.range), kind: v.kind };
  if (v instanceof SnippetString) return { $kind: "snippet", value: v.value };
  if (v instanceof WorkspaceEdit) {
    const changes = {};
    for (const [k, edits] of v._changes) changes[k] = toPlain(edits);
    return { $kind: "workspaceEdit", changes, documentChanges: v._documentChanges.map((dc) => ({ textDocument: toPlain(dc.textDocument), edits: toPlain(dc.edits) })) };
  }
  const out = {};
  for (const k of Object.keys(v)) {
    if (typeof v[k] === "function") continue;
    out[k] = toPlain(v[k]);
  }
  return out;
};

const toVscode = (v) => {
  if (v === null || v === undefined || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map((x) => toVscode(x));
  if (!v.$kind) {
    const out = {};
    for (const k of Object.keys(v)) out[k] = toVscode(v[k]);
    return out;
  }
  switch (v.$kind) {
    case "uri": return Uri.from({ scheme: v.scheme, authority: v.authority, path: v.path, query: v.query, fragment: v.fragment });
    case "position": return new Position(v.line, v.character);
    case "selection": return new Selection(v.anchor, v.active);
    case "range": return new Range(toVscode(v.start), toVscode(v.end));
    case "location": return new Location(toVscode(v.uri), toVscode(v.range));
    case "textEdit": return new TextEdit(toVscode(v.range), v.newText);
    case "markdown": return new MarkdownString(v.value);
    case "diagnostic": return Object.assign(new Diagnostic(toVscode(v.range), v.message, v.severity), {
      source: v.source, code: v.code, tags: v.tags,
      relatedInformation: v.relatedInformation ? v.relatedInformation.map((ri) => new DiagnosticRelatedInformation(toVscode(ri.location), ri.message)) : undefined,
    });
    default: return v;
  }
};

// ── Webview / WebviewPanel / WebviewView / TreeView facades ──────────────────
const ViewColumn = Object.freeze({ Active: 1, Beside: 2, One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9 });
const TreeItemCollapsibleState = Object.freeze({ None: 0, Collapsed: 1, Expanded: 2 });

class TreeItem {
  constructor(label, collapsibleState) {
    this.label = label;
    this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None;
    this.id = undefined;
    this.iconPath = undefined;
    this.description = undefined;
    this.tooltip = undefined;
    this.command = undefined;
    this.contextValue = undefined;
    this.resourceUri = undefined;
  }
}

class WvWebview {
  constructor(rec) {
    this._rec = rec;
    this._panelId = rec.panelId;
    this._extKey = rec.extKey;
    this._extDir = rec.extDir;
    this._html = "";
    this._visible = false;
    this._emitters = rec.emitters;
  }
  get cspSource() { return "extweb:"; }
  get html() { return this._html; }
  set html(v) {
    this._html = String(v ?? "");
    rpcNotify("webview", "html", { panelId: this._panelId, html: this._html });
  }
  get options() { return this._options; }
  set options(v) { this._options = v; }
  get onDidReceiveMessage() { return this._emitters.receive.event; }
  get onDidClickLink() { return this._emitters.click.event; }
  asWebviewUri(uri) {
    try {
      const u = uri instanceof Uri ? uri : Uri.parse(String(uri));
      if (u.scheme !== "file") return u;
      const fsPath = u.fsPath;
      const base = String(this._extDir || "").replace(/[\\/]+$/, "");
      const normalized = fsPath.replace(/[\\/]/g, "/");
      const baseN = base.replace(/\\/g, "/");
      if (!baseN || !normalized.toLowerCase().startsWith(baseN.toLowerCase() + "/")) return u;
      const rel = normalized.slice(baseN.length + 1).split("/").map((s) => encodeURIComponent(s)).join("/");
      return Uri.parse(`extweb://${this._extKey}/${rel}`);
    } catch (err) {
      logUnsupported("Webview.asWebviewUri", err);
      return uri;
    }
  }
  postMessage(message) { rpcNotify("webview", "post", { panelId: this._panelId, message: toPlain(message) }); }
}

class WebviewPanel {
  constructor(rec) {
    this._rec = rec;
    this._disposed = false;
    this.viewType = rec.viewType;
    this.title = rec.title;
    this.iconPath = undefined;
    this._visible = false;
    this._active = false;
    this._column = ViewColumn.Active;
    this.webview = new WvWebview(rec);
    rec.facade = this;
  }
  get active() { return this._visible; }
  get visible() { return this._visible; }
  get viewColumn() { return this._column; }
  get onDidChangeViewState() { return this._rec.emitters.state.event; }
  get onDidDispose() { return this._rec.emitters.disposed.event; }
  reveal() { rpcNotify("webview", "reveal", { panelId: this._rec.panelId }); }
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    rpcNotify("webview", "dispose", { panelId: this._rec.panelId });
  }
}

class WebviewView {
  constructor(rec) {
    this._rec = rec;
    this.viewType = rec.viewType;
    this.title = rec.title || rec.viewType;
    this.description = undefined;
    this._visible = false;
    this.webview = new WvWebview(rec);
    rec.facade = this;
  }
  get visible() { return this._rec.visible; }
  get onDidChangeVisibility() { return this._rec.emitters.visibility.event; }
  get onDidDispose() { return this._rec.emitters.disposed.event; }
  get badge() { return undefined; }
  set badge(v) {}
}

const toPlainTreeItem = (v) => {
  if (!v) return null;
  let icon = undefined;
  if (v.iconPath instanceof Uri) icon = toPlain(v.iconPath);
  else if (v.iconPath && typeof v.iconPath === "object" && (v.iconPath.light || v.iconPath.dark)) {
    icon = { light: toPlain(v.iconPath.light), dark: toPlain(v.iconPath.dark) };
  } else if (v.iconPath && typeof v.iconPath === "object" && v.iconPath.id !== undefined) {
    icon = { $icon: v.iconPath.id, color: v.iconPath.color && typeof v.iconPath.color === "object" ? v.iconPath.color.id : undefined };
  } else if (typeof v.iconPath === "string" || v.iconPath instanceof Uri) {
    icon = v.iconPath instanceof Uri ? toPlain(v.iconPath) : { $icon: v.iconPath };
  }
  return {
    label: typeof v.label === "string" ? v.label : (v.label && v.label.label) || String(v.label ?? ""),
    description: v.description === undefined ? undefined : typeof v.description === "string" ? v.description : String(v.description ?? ""),
    tooltip: typeof v.tooltip === "string" ? v.tooltip : undefined,
    id: v.id,
    contextValue: v.contextValue,
    collapsibleState: v.collapsibleState ?? 0,
    command: v.command ? { id: v.command.id, title: v.command.title, arguments: toPlain(v.command.arguments) } : undefined,
    resourceUri: toPlain(v.resourceUri),
    iconPath: icon,
  };
};

// ── WorkspaceConfiguration ───────────────────────────────────────────────────
function getByPath(obj, dottedKey) {
  if (!obj || typeof obj !== "object") return undefined;
  const v = obj[dottedKey];
  if (v !== undefined) return v;
  const segs = dottedKey.split(".");
  let cur = obj;
  for (let i = 0; i < segs.length; i++) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = cur[segs[i]];
  }
  return cur;
}

class WorkspaceConfiguration {
  constructor(section) { this._section = section; }
  get(key, defaultValue) {
    if (key === undefined) return configCache && this._section ? (configCache[this._section] ?? {}) : configCache || {};
    const full = this._section ? `${this._section}.${key}` : key;
    const val = getByPath(configCache, full);
    if (val !== undefined) return val;
    const def = getByPath(configDefaults, full);
    if (def !== undefined) return def;
    return defaultValue;
  }
  has(key) {
    const full = this._section ? `${this._section}.${key}` : key;
    if (getByPath(configCache, full) !== undefined) return true;
    return getByPath(configDefaults, full) !== undefined;
  }
  inspect() { return undefined; }
  update(key, value) {
    const full = this._section ? `${this._section}.${key}` : key;
    return rpc("workspace", "updateConfiguration", { key: full, value: toPlain(value) }).then(() => undefined);
  }
  get all() { return configCache && this._section ? (configCache[this._section] ?? {}) : configCache || {}; }
}

// ── Selector matching (language + scheme + pattern) ──────────────────────────
function globMatch(pattern, filePath) {
  const p = String(pattern || "").replace(/\\/g, "/");
  const f = String(filePath || "").replace(/\\/g, "/");
  let re;
  try {
    re = new RegExp("^" + p
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "\u0000")
      .replace(/\*/g, "[^/]*")
      .replace(/\u0000/g, ".*")
      .replace(/\?/g, "[^/]") + "$");
  } catch { return false; }
  return re.test(f) || re.test(f.replace(/^.*\//, ""));
}

function matchSelector(selector, { languageId, uri }) {
  const test = (sel) => {
    if (!sel) return false;
    if (typeof sel === "string") return sel === languageId;
    if (sel.language && sel.language !== languageId) return false;
    if (sel.scheme && sel.scheme !== (uri && uri.scheme)) return false;
    if (sel.pattern) {
      const p = uri ? uri.fsPath || uri.path : "";
      if (!globMatch(sel.pattern, p)) return false;
    }
    return true;
  };
  if (Array.isArray(selector)) return selector.some(test);
  return test(selector);
}

// ── Assembly ─────────────────────────────────────────────────────────────────
const createVscodeApi = () => {
  const commands = {
    registerCommand(id, handler, thisArg) {
      if (typeof handler !== "function") throw new TypeError("handler must be a function");
      rpcNotify("commands", "register", { id: String(id), extKey: currentActivatingExtKey });
      commandHandlers.set(String(id), handler);
      commandThis.set(String(id), thisArg);
      return new Disposable(() => {
        commandHandlers.delete(String(id));
        commandThis.delete(String(id));
        rpcNotify("commands", "unregister", { id: String(id), extKey: currentActivatingExtKey });
      });
    },
    registerTextEditorCommand(id, handler, thisArg) {
      return commands.registerCommand(id, (args) => handler(undefined, undefined, args), thisArg);
    },
    executeCommand(id, ...args) {
      return rpc("commands", "execute", { id: String(id), args: toPlain(args) });
    },
    getCommands(filterInternal) {
      return rpc("commands", "getAll", { filterInternal: !!filterInternal });
    },
  };

  const showMessage = (severity, message, optionsOrItems) => {
    let items = Array.isArray(optionsOrItems) && optionsOrItems.length ? optionsOrItems : null;
    return rpc("window", "showMessage", {
      severity,
      message: String(message ?? ""),
      items: items
        ? items.map((i) =>
            typeof i === "string" ? { title: i } : { title: String(i.title || ""), isCloseAffordance: !!i.isCloseAffordance }
          )
        : [],
    }).then((r) => (items && r !== undefined && r !== null ? items[r] : undefined));
  };

  const workspaceFs = {
    stat(uri) { return rpc("workspace.fs", "stat", { uri: toPlain(uri) }); },
    readFile(uri) {
      return rpc("workspace.fs", "readFile", { uri: toPlain(uri) }).then((b) => {
        if (!b || typeof b !== "object") throw FileSystemError.Unknown(uri);
        if (b.error) throw new FileSystemError(b.error.message || "fs error", b.error.code || "Unknown");
        return Uint8Array.from(Buffer.from(b.base64, "base64"));
      });
    },
    writeFile(uri, content) {
      return rpc("workspace.fs", "writeFile", { uri: toPlain(uri), base64: Buffer.from(content).toString("base64") });
    },
    readDirectory(uri) {
      return rpc("workspace.fs", "readDirectory", { uri: toPlain(uri) }).then((arr) => (arr || []));
    },
    createDirectory(uri) { return rpc("workspace.fs", "createDirectory", { uri: toPlain(uri) }); },
    delete(uri, options) {
      return rpc("workspace.fs", "delete", { uri: toPlain(uri), recursive: options && options.recursive, useTrash: options && options.useTrash });
    },
    rename(oldUri, newUri, options) {
      return rpc("workspace.fs", "rename", { oldUri: toPlain(oldUri), newUri: toPlain(newUri), overwrite: options && options.overwrite });
    },
    copy(source, destination, options) {
      return rpc("workspace.fs", "copy", { source: toPlain(source), destination: toPlain(destination), overwrite: options && options.overwrite });
    },
    isWritableFileSystem(scheme) { return scheme === "file"; },
  };

  const api = {
    // ── env ──────────────────────────────────────────────────────────────────
    env: {
      get appName() { return bootEnv.appName; },
      get appRoot() { return bootEnv.appRoot; },
      get language() { return bootEnv.language || "en"; },
      get uriScheme() { return bootEnv.uriScheme || "vscode"; },
      get machineId() { return bootEnv.machineId; },
      get sessionId() { return bootEnv.sessionId; },
      get uiKind() { return 1; },
      get appHost() { return "desktop"; },
      get shell() { return bootEnv.shell; },
      get remoteName() { return undefined; },
      get isNewAppInstall() { return false; },
      get isTelemetryEnabled() { return false; },
      get isUtf8() { return true; },
      get logLevel() { return 2; },
      clipboard: {
        readText: () => rpc("env", "clipboardRead"),
        writeText: (text) => rpc("env", "clipboardWrite", { text: String(text ?? "") }),
      },
      openExternal(target) {
        const t = target instanceof Uri ? target : Uri.parse(String(target));
        return rpc("env", "openExternal", { uri: toPlain(t) }).then((r) => !!r);
      },
      asExternalUri(target) {
        const t = target instanceof Uri ? target : Uri.parse(String(target));
        return Promise.resolve(t);
      },
    },

    // ── extensions ───────────────────────────────────────────────────────────
    extensions: {
      getExtension(id) {
        const rec = extRecords.get(String(id).toLowerCase());
        if (!rec) return undefined;
        if (!rec.isActive && rec.packageJSON && rec.packageJSON.main) rpcNotify("extensions", "requestActivation", { id: rec.id });
        return makeExtensionView(rec);
      },
      get all() { return [...extRecords.values()].map((r) => makeExtensionView(r)); },
      get onDidChange() { return extensionsChangedEmitter.event; },
    },

    // ── commands ──────────────────────────────────────────────────────────────
    commands,

    // ── window ───────────────────────────────────────────────────────────────
    window: {
      createOutputChannel(name) {
        return new OutputChannel(String(name || "Output"), currentActivatingExtKey);
      },
      createStatusBarItem(alignment, priority) {
        const item = new StatusBarItem(`sb-${++statusBarSeq}-${Math.random().toString(36).slice(2, 7)}`, currentActivatingExtKey);
        item._alignment = alignment ?? StatusBarAlignment.Left;
        item._priority = priority ?? 0;
        return item;
      },
      setStatusBarMessage(message, timeoutOrThenable) {
        const text = String(message ?? "");
        rpcNotify("statusbar", "message", { extKey: currentActivatingExtKey, text });
        if (typeof timeoutOrThenable === "number" && timeoutOrThenable > 0) {
          const t = setTimeout(() => rpcNotify("statusbar", "message", { extKey: currentActivatingExtKey, text: "" }), timeoutOrThenable);
          return new Disposable(() => clearTimeout(t));
        }
        if (timeoutOrThenable && typeof timeoutOrThenable.then === "function") {
          timeoutOrThenable.then(() => rpcNotify("statusbar", "message", { extKey: currentActivatingExtKey, text: "" }));
        }
        return new Disposable(() => {});
      },
      showInformationMessage: (m, ...rest) => showMessage("info", m, rest.length ? rest : undefined),
      showWarningMessage: (m, ...rest) => showMessage("warning", m, rest.length ? rest : undefined),
      showErrorMessage: (m, ...rest) => showMessage("error", m, rest.length ? rest : undefined),
      showQuickPick: () => { logUnsupported("window.showQuickPick"); return Promise.resolve(undefined); },
      showInputBox: () => { logUnsupported("window.showInputBox"); return Promise.resolve(undefined); },
      createWebviewPanel(viewType, title, column, options) {
        const panelId = `wv-${++webviewSeq}-${Math.random().toString(36).slice(2, 7)}`;
        const extKey = currentActivatingExtKey;
        const recEntry = extRecords.get(extKey);
        const rec = {
          panelId,
          extKey,
          extDir: recEntry ? recEntry.extensionPath : bootEnv.appRoot || "",
          viewType: String(viewType || ""),
          title: String(title || "Webview"),
          emitters: { receive: new Emitter(), state: new Emitter(), disposed: new Emitter(), visibility: new Emitter() },
          disposed: false,
          visible: false,
          facade: null,
        };
        webviewPanels.set(panelId, rec);
        rpcNotify("webview", "create", {
          panelId,
          extKey,
          viewType: rec.viewType,
          title: rec.title,
          options: options || undefined,
        });
        return new WebviewPanel(rec);
      },
      registerWebviewViewProvider(viewType, provider, options) {
        if (!provider || typeof provider.resolveWebviewView !== "function") {
          throw new TypeError("registerWebviewViewProvider: provider must implement resolveWebviewView()");
        }
        const key = String(viewType || "");
        webviewViewProviders.set(key, { provider, extKey: currentActivatingExtKey, options });
        rpcNotify("webview", "registerView", { viewType: key, extKey: currentActivatingExtKey });
        return new Disposable(() => {
          webviewViewProviders.delete(key);
          rpcNotify("webview", "registerViewDispose", { viewType: key });
        });
      },
      registerWebviewPanelSerializer(viewType, serializer) {
        logUnsupported("window.registerWebviewPanelSerializer");
        return new Disposable(() => {});
      },
      registerTreeDataProvider(viewId, provider) {
        if (!provider) throw new TypeError("registerTreeDataProvider: provider is required");
        const key = String(viewId || "");
        treeDataProviders.set(key, { provider, extKey: currentActivatingExtKey });
        rpcNotify("treeview", "register", { viewId: key, extKey: currentActivatingExtKey });
        return new Disposable(() => {
          treeDataProviders.delete(key);
          rpcNotify("treeview", "unregister", { viewId: key });
        });
      },
      createTreeView(viewId, options) {
        const key = String(viewId || "");
        const rec = {
          viewId: key,
          extKey: currentActivatingExtKey,
          title: options && options.title ? String(options.title) : key,
          showCollapseAll: !!(options && options.showCollapseAll),
          emitters: { expand: new Emitter(), collapse: new Emitter(), visibility: new Emitter() },
        };
        treeViews.set(key, rec);
        rpcNotify("treeview", "create", { viewId: key, extKey: rec.extKey, title: rec.title, showCollapseAll: rec.showCollapseAll });
        return {
          viewId: key,
          get onDidExpandElement() { return rec.emitters.expand.event; },
          get onDidCollapseElement() { return rec.emitters.collapse.event; },
          get onDidChangeVisibility() { return rec.emitters.visibility.event; },
          get visible() { return rec.visible; },
          reveal(element, options) {
            return rpc("treeview", "reveal", { viewId: key, element: toPlain(element), options: options || undefined }).catch(() => undefined);
          },
          dispose() {
            treeViews.delete(key);
            rpcNotify("treeview", "dispose", { viewId: key });
          },
        };
      },
      showTextDocument(uri) {
        const u = uri instanceof Uri ? uri : Uri.parse(String(uri));
        return rpc("window", "showTextDocument", { uri: toPlain(u) }).then(() => undefined);
      },
      get activeTextEditor() { return undefined; },
      get visibleTextEditors() { return []; },
      get state() { return {}; },
    },

    // ── languages ────────────────────────────────────────────────────────────
    languages: {
      registerCompletionItemProvider(selector, provider, ...triggerChars) {
        return registerProvider("completion", selector, provider, { triggerCharacters: triggerChars });
      },
      registerHoverProvider(selector, provider) { return registerProvider("hover", selector, provider); },
      registerDefinitionProvider(selector, provider) { return registerProvider("definition", selector, provider); },
      registerTypeDefinitionProvider(selector, provider) { return registerProvider("typeDefinition", selector, provider); },
      registerImplementationProvider(selector, provider) { return registerProvider("implementation", selector, provider); },
      registerReferencesProvider(selector, provider) { return registerProvider("references", selector, provider); },
      registerDocumentSymbolProvider(selector, provider) { return registerProvider("documentSymbol", selector, provider); },
      registerWorkspaceSymbolProvider(provider) { return registerProvider("workspaceSymbol", undefined, provider); },
      registerSignatureHelpProvider(selector, provider, ...triggerChars) {
        return registerProvider("signatureHelp", selector, provider, { triggerCharacters: triggerChars });
      },
      registerRenameProvider(selector, provider) { return registerProvider("rename", selector, provider); },
      registerDocumentFormattingEditProvider(selector, provider) { return registerProvider("formatting", selector, provider); },
      registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacters) {
        const triggerChars = [firstTriggerCharacter, ...moreTriggerCharacters].filter((c) => typeof c === "string");
        return registerProvider("onTypeFormatting", selector, provider, { triggerCharacters: triggerChars });
      },
      registerDocumentRangeFormattingEditProvider(selector, provider) { return registerProvider("rangeFormatting", selector, provider); },
      registerCodeActionsProvider(selector, provider, metadata) { return registerProvider("codeAction", selector, provider, { metadata }); },
      registerCodeLensProvider(selector, provider) { return registerProvider("codeLens", selector, provider); },
      registerDocumentHighlightProvider(selector, provider) { return registerProvider("documentHighlight", selector, provider); },
      registerDocumentLinkProvider(selector, provider) { return registerProvider("documentLink", selector, provider); },
      createDiagnosticCollection(name) {
        const fullKey = `${currentActivatingExtKey}|${name || "default"}`;
        diagCollections.set(fullKey, new Map());
        return {
          name: name || "default",
          set(uri, diagnostics) {
            const u = uri.toString ? uri.toString() : String(uri);
            const rec = diagCollections.get(fullKey);
            if (rec) rec.set(u, (diagnostics || []).map((d) => toPlain(d)));
            rpcNotify("languages", "setDiagnostics", { owner: fullKey, uri: toPlain(uri), diagnostics: toPlain(diagnostics || []) });
          },
          delete(uri) {
            const u = uri.toString ? uri.toString() : String(uri);
            const rec = diagCollections.get(fullKey);
            if (rec) rec.delete(u);
            rpcNotify("languages", "setDiagnostics", { owner: fullKey, uri: toPlain(uri), diagnostics: [] });
          },
          clear() {
            diagCollections.set(fullKey, new Map());
            rpcNotify("languages", "clearDiagnostics", { owner: fullKey });
          },
          get(uri) {
            const rec = diagCollections.get(fullKey);
            const u = uri.toString ? uri.toString() : String(uri);
            return rec ? rec.get(u) : undefined;
          },
          forEach(cb, thisArg) {
            const rec = diagCollections.get(fullKey);
            if (rec) for (const [u, d] of rec) cb.call(thisArg, d, Uri.parse(u), d.length ? d[0].severity : undefined);
          },
          has(uri) {
            const rec = diagCollections.get(fullKey);
            const u = uri.toString ? uri.toString() : String(uri);
            return !!rec && rec.has(u);
          },
          dispose() {
            diagCollections.delete(fullKey);
            rpcNotify("languages", "clearDiagnostics", { owner: fullKey });
          },
        };
      },
      getLanguages() { return rpc("languages", "getLanguages"); },
      match(selector, document) {
        return matchSelector(selector, { languageId: document && document.languageId, uri: document && document.uri });
      },
      get onDidChangeDiagnostics() { return new Emitter().event; },
    },

    // ── workspace ────────────────────────────────────────────────────────────
    workspace: {
      workspaceFolders: null,
      rootPath: null,
      get workspaceFile() { return undefined; },
      getWorkspaceFolder() { return undefined; },
      getWorkspaceFolders() { return workspaceFoldersValue && workspaceFoldersValue.length ? workspaceFoldersValue : undefined; },
      fs: workspaceFs,
      getConfiguration(section) { return new WorkspaceConfiguration(section); },
      get onDidOpenTextDocument() { return workspaceEmitters.onDidOpenTextDocument.event; },
      get onDidCloseTextDocument() { return workspaceEmitters.onDidCloseTextDocument.event; },
      get onDidChangeTextDocument() { return workspaceEmitters.onDidChangeTextDocument.event; },
      get onDidSaveTextDocument() { return workspaceEmitters.onDidSaveTextDocument.event; },
      get onDidChangeConfiguration() { return workspaceEmitters.onDidChangeConfiguration.event; },
      get onDidChangeWorkspaceFolders() { return workspaceEmitters.onDidChangeWorkspaceFolders.event; },
      get textDocuments() { return [...hostDocs.values()].map((d) => d.facade); },
      registerTextDocumentContentProvider(scheme, provider) {
        contentProviders.set(scheme, provider);
        return new Disposable(() => contentProviders.delete(scheme));
      },
      openTextDocument(uriOrOptions) {
        if (uriOrOptions && typeof uriOrOptions === "object" && !(uriOrOptions instanceof Uri) && "content" in uriOrOptions) {
          const uri = (uriOrOptions.uri instanceof Uri ? uriOrOptions.uri : Uri.file(uriOrOptions.uri || "untitled")).toString();
          const snapshot = { uri, languageId: uriOrOptions.language || "plaintext", text: uriOrOptions.content || "", version: 1 };
          const facade = new TextDocument(snapshot);
          hostDocs.set(uri, { snapshot, facade });
          return Promise.resolve(facade);
        }
        const u = uriOrOptions instanceof Uri ? uriOrOptions : Uri.parse(String(uriOrOptions));
        const prov = contentProviders.get(u.scheme);
        if (prov) {
          return Promise.resolve(prov.provideTextDocumentContent(u, api.CancellationToken)).then((content) => {
            const snapshot = { uri: u.toString(), languageId: "plaintext", text: content || "", version: 1 };
            const facade = new TextDocument(snapshot);
            hostDocs.set(snapshot.uri, { snapshot, facade });
            return facade;
          });
        }
        return rpc("workspace", "openTextDocument", { uri: toPlain(u) }).then((snapshot) => {
          const s = snapshot || { uri: u.toString(), languageId: "plaintext", text: "", version: 1 };
          const facade = new TextDocument(s);
          hostDocs.set(s.uri, { snapshot: s, facade });
          return facade;
        });
      },
      findFiles(include, exclude, maxResults) {
        return rpc("workspace", "findFiles", {
          include: String(include || ""),
          exclude: exclude ? String(exclude) : undefined,
          maxResults: maxResults ?? undefined,
        }).then((arr) => (arr || []).map((u) => Uri.parse(u)));
      },
      createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        const watcherId = `fs-${++fsWatcherSeq}`;
        const glob = typeof globPattern === "string" ? globPattern : globPattern && globPattern.pattern;
        rpcNotify("workspace", "watch", { watcherId, glob: String(glob || "**/*") });
        const emitters = { create: new Emitter(), change: new Emitter(), delete: new Emitter(), error: new Emitter() };
        watcherRegistrations.set(watcherId, emitters);        return {
          get onDidCreate() { return emitters.create.event; },
          get onDidChange() { return emitters.change.event; },
          get onDidDelete() { return emitters.delete.event; },
          get onDidError() { return emitters.error.event; },
          ignoreCreateEvents: !!ignoreCreateEvents,
          ignoreChangeEvents: !!ignoreChangeEvents,
          ignoreDeleteEvents: !!ignoreDeleteEvents,
          dispose() {
            watcherRegistrations.delete(watcherId);
            rpcNotify("workspace", "unwatch", { watcherId });
            for (const e of Object.values(emitters)) e.dispose();
          },
        };
      },
      applyEdit(edit) {
        if (!(edit instanceof WorkspaceEdit)) return Promise.resolve(false);
        return rpc("workspace", "applyEdit", { edit: toPlain(edit) }).then((r) => !!r);
      },
      asRelativePath(p) {
        try {
          const s = p instanceof Uri ? p.fsPath : String(p);
          return s.replace(/^[A-Za-z]:[\\/]?/, "");
        } catch { return undefined; }
      },
      get isTrusted() { return true; },
    },
  };

  const registerProvider = (kind, selector, provider, extra) => {
    const providerId = `prov-${currentActivatingExtKey}-${++providerSeq.n}-${Math.random().toString(36).slice(2, 6)}`;
    providers.set(providerId, { provider, kind });
    rpcNotify("languages", "registerProvider", {
      id: providerId,
      extKey: currentActivatingExtKey,
      kind,
      selector: selector === undefined ? undefined : JSON.parse(JSON.stringify(selector)),
      triggerCharacters: extra && extra.triggerCharacters,
      metadata: extra && extra.metadata,
    });
    return new Disposable(() => {
      providers.delete(providerId);
      rpcNotify("languages", "disposeProvider", { id: providerId });
    });
  };

  const makeExtensionView = (rec) => ({
    id: rec.id,
    extensionUri: rec.extensionUri,
    extensionPath: rec.extensionPath,
    isActive: rec.isActive,
    packageJSON: rec.packageJSON,
    extensionKind: [1],
    exports: rec.exports,
    activate() {
      if (rec.isActive) return Promise.resolve(rec.exports);
      return rpc("extensions", "ensureActivated", { id: rec.id }).then(() => rec.exports);
    },
  });

  return api;
};

// ── Host-level plumbing (used by extension-host.cjs) ─────────────────────────
const hostApi = {
  setRpc, setRpcNotify, setBootEnv, toPlain, toVscode,
  Emitter, Disposable,
  get hostDocs() { return hostDocs; },
  get providers() { return providers; },
  getFacade(uri) { const rec = hostDocs.get(uri); return rec ? rec.facade : undefined; },
  get commandHandlers() { return commandHandlers; },
  get commandThis() { return commandThis; },
  get extRecords() { return extRecords; },
  get diagCollections() { return diagCollections; },
  setCurrentActivatingExtKey(k) { currentActivatingExtKey = k; },
  createExtensionContext(extId, dir, packageJSON) {
    return new ExtensionContext(extId, dir, packageJSON);
  },
  setConfig(c) { configCache = c || {}; },
  getConfig() { return configCache; },
  getMatch: matchSelector,
  syncExtensionRecords(list) {
    const ids = new Set(list.map((e) => e.id));
    for (const [id] of extRecords) if (!ids.has(id)) extRecords.delete(id);
    for (const key of Object.keys(configDefaults)) delete configDefaults[key];
    for (const e of list) {
      const contrib = e.packageJSON && e.packageJSON.contributes;
      if (contrib) {
        if (contrib.configurationDefaults && typeof contrib.configurationDefaults === "object") {
          for (const [key, value] of Object.entries(contrib.configurationDefaults)) {
            if (key && value !== undefined && !(key in configDefaults)) configDefaults[key] = value;
          }
        }
        const cfg = contrib.configuration;
        const props = cfg && typeof cfg === "object" ? (cfg.properties || (cfg.global && cfg.global.properties)) : undefined;
        if (props && typeof props === "object") {
          for (const [key, desc] of Object.entries(props)) {
            if (desc && desc.default !== undefined && !(key in configDefaults)) configDefaults[key] = desc.default;
          }
        }
      }
      extRecords.set(e.id, {
        id: e.id,
        extensionPath: e.dir,
        extensionUri: Uri.file(e.dir),
        packageJSON: e.packageJSON,
        isActive: !!e.isActive,
        exports: e.exports,
      });
    }
    extensionsChangedEmitter.fire(undefined);
  },
  syncWorkspaceFolders(folders) {
    workspaceFoldersValue = (folders || []).map((f) => ({
      index: f.index,
      name: f.name,
      uri: Uri.file(f.path),
    }));
    if (!api) return;
    api.workspace.workspaceFolders = workspaceFoldersValue.length ? workspaceFoldersValue : null;
    api.workspace.rootPath = workspaceFoldersValue.length ? workspaceFoldersValue[0].uri.fsPath : null;
    api.workspace.getWorkspaceFolder = (uri) => {
      if (!uri || !workspaceFoldersValue.length) return undefined;
      const p = uri.fsPath;
      let best = undefined;
      for (const f of workspaceFoldersValue) {
        const fp = f.uri.fsPath;
        if (p === fp || p.startsWith(fp.replace(/[\\/]$/, "") + "\\") || p.startsWith(fp.replace(/[\\/]$/, "") + "/")) {
          if (!best || fp.length > best.uri.fsPath.length) best = f;
        }
      }
      return best;
    };
    workspaceEmitters.onDidChangeWorkspaceFolders.fire(undefined);
  },
  updateDocument(msg, opts) {
    const { uri, languageId, text, version, closed } = msg;
    if (closed) {
      const rec = hostDocs.get(uri);
      if (rec) {
        rec.snapshot.closed = true;
        rec.facade._closed = true;
        rec.facade._text = "";
      }
      workspaceEmitters.onDidCloseTextDocument.fire(rec ? rec.facade : new TextDocument({ uri, languageId, text: "", version: 1, closed: true }));
      hostDocs.delete(uri);
      return;
    }
    const existing = hostDocs.get(uri);
    if (existing) {
      existing.snapshot.languageId = languageId || existing.snapshot.languageId;
      existing.snapshot.version = version ?? existing.snapshot.version + 1;
      const oldText = existing.snapshot.text;
      existing.snapshot.text = text;
      existing.facade._text = text;
      existing.facade._version = existing.snapshot.version;
      if (!opts || !opts.suppressFire) {
        const endLine = oldText.split("\n").length - 1;
        const endChar = oldText.length - oldText.lastIndexOf("\n") - 1;
        workspaceEmitters.onDidChangeTextDocument.fire({
          document: existing.facade,
          contentChanges: [{ range: new Range(0, 0, endLine, Math.max(endChar, 0)), rangeLength: oldText.length, text }],
        });
      }
    } else {
      const snapshot = { uri, languageId: languageId || "plaintext", text: text || "", version: version || 1 };
      const facade = new TextDocument(snapshot);
      hostDocs.set(uri, { snapshot, facade });
      if (!opts || !opts.suppressFire) workspaceEmitters.onDidOpenTextDocument.fire(facade);
    }
  },
  fireOpenEvent(uri) {
    const rec = hostDocs.get(uri);
    if (rec) workspaceEmitters.onDidOpenTextDocument.fire(rec.facade);
  },
  fireFsWatcher(ev) {
    const emitters = watcherRegistrations.get(ev.watcherId);
    if (!emitters) return;
    const uri = Uri.file(ev.path);
    if (ev.kind === "create" && !emitters.ignoreCreateEvents) emitters.create.fire(uri);
    if (ev.kind === "change" && !emitters.ignoreChangeEvents) emitters.change.fire(uri);
    if (ev.kind === "delete" && !emitters.ignoreDeleteEvents) emitters.delete.fire(uri);
  },
  fireConfigChanged() {
    workspaceEmitters.onDidChangeConfiguration.fire({ affectsConfiguration: () => true });
  },
  fireSave(uri, languageId) {
    const rec = hostDocs.get(uri);
    workspaceEmitters.onDidSaveTextDocument.fire(rec ? rec.facade : new TextDocument({ uri, languageId, text: "", version: 1 }));
  },
  get workspaceEmitters() { return workspaceEmitters; },
  get webviewPanels() { return webviewPanels; },
  get webviewViewProviders() { return webviewViewProviders; },
  get treeDataProviders() { return treeDataProviders; },
  get treeViews() { return treeViews; },

  // ── Webview / TreeView plumbing (called from the host) ─────────────────────
  fireWebviewEvent(a) {
    const rec = webviewPanels.get(a.panelId);
    if (!rec) return;
    if (a.kind === "message") {
      try { rec.emitters.receive.fire(toVscode(a.message)); } catch (err) { logUnsupported("Webview.onDidReceiveMessage", err); }
    } else if (a.kind === "disposed") {
      if (rec.disposed) return;
      rec.disposed = true;
      webviewPanels.delete(a.panelId);
      try { rec.emitters.disposed.fire(undefined); } catch {}
      rpcNotify("webview", "dispose", { panelId: a.panelId });
    } else if (a.kind === "visibility") {
      rec.visible = !!a.visible;
      try { rec.emitters.state.fire({ visible: rec.visible, active: rec.visible }); rec.emitters.visibility.fire(undefined); } catch {}
    }
  },

  async resolveWebviewView(viewType, panelId) {
    const entry = webviewViewProviders.get(String(viewType || ""));
    if (!entry) throw Object.assign(new Error(`No provider registered for webview view '${viewType}'`), { code: "NOT_FOUND" });
    if (webviewPanels.has(panelId)) throw Object.assign(new Error(`Webview view '${panelId}' is already resolved`), { code: "ALREADY_RESOLVED" });
    const recEntry = extRecords.get(entry.extKey);
    const rec = {
      panelId,
      extKey: entry.extKey,
      extDir: recEntry ? recEntry.extensionPath : bootEnv.appRoot || "",
      viewType: String(viewType || ""),
      title: String(viewType || ""),
      emitters: { receive: new Emitter(), state: new Emitter(), disposed: new Emitter(), visibility: new Emitter() },
      disposed: false,
      visible: false,
      facade: null,
    };
    webviewPanels.set(panelId, rec);
    const facade = new WebviewView(rec);
    await entry.provider.resolveWebviewView(facade, { view: undefined });
    return { ok: true };
  },

  async getTreeChildren(viewId, element) {
    const entry = treeDataProviders.get(String(viewId || ""));
    if (!entry) throw Object.assign(new Error(`No tree data provider registered for view '${viewId}'`), { code: "NOT_FOUND" });
    const provider = entry.provider;
    if (typeof provider.getChildren !== "function") throw new Error(`Tree provider '${viewId}' has no getChildren()`);
    const elem = element === null || element === undefined ? undefined : toVscode(element);
    const items = await provider.getChildren(elem);
    return (items || []).map((t) => toPlainTreeItem(t));
  },

  async treeReveal(viewId, element, options) {
    const entry = treeDataProviders.get(String(viewId || ""));
    if (!entry || element === null || element === undefined) return { ancestors: [] };
    const provider = entry.provider;
    const target = toVscode(element);
    const chain = [target];
    if (typeof provider.getParent === "function") {
      let cur = target;
      let guard = 0;
      while (cur && guard++ < 60) {
        const parent = await provider.getParent(cur);
        if (!parent) break;
        chain.unshift(parent);
        cur = parent;
      }
    }
    return { ancestors: chain.map((t) => toPlainTreeItem(t)), options: options || undefined };
  },

  fireTreeChange(viewId) {
    const entry = treeDataProviders.get(String(viewId || ""));
    if (entry && entry.provider && entry.provider.onDidChangeTreeData) {
      try { entry.provider.onDidChangeTreeData.fire(undefined); } catch (err) { logUnsupported("TreeDataProvider.onDidChangeTreeData", err); }
    }
  },

  fireTreeEvent(a) {
    const rec = treeViews.get(String(a.viewId || ""));
    if (!rec) return;
    if (a.kind === "expand") { try { rec.emitters.expand.fire(toVscode(a.element)); } catch {} }
    else if (a.kind === "collapse") { try { rec.emitters.collapse.fire(toVscode(a.element)); } catch {} }
  },

  purgeExtension(id) {
    for (const [panelId, rec] of webviewPanels) {
      if (rec.extKey === id && !rec.disposed) {
        rec.disposed = true;
        webviewPanels.delete(panelId);
        try { rec.emitters.disposed.fire(undefined); } catch {}
        try { rpcNotify("webview", "dispose", { panelId }); } catch {}
      }
    }
    for (const [viewType, e] of webviewViewProviders) if (e.extKey === id) webviewViewProviders.delete(viewType);
    for (const [viewId, e] of treeDataProviders) if (e.extKey === id) treeDataProviders.delete(viewId);
    for (const [viewId, e] of treeViews) {
      if (e.extKey === id) {
        treeViews.delete(viewId);
        try { rpcNotify("treeview", "dispose", { viewId }); } catch {}
      }
    }
  },
};

// ── Final assembly ───────────────────────────────────────────────────────────
let providerSeq = { n: 0 };
let apiSingleton = null;

const getVscodeApi = () => {
  if (!apiSingleton) {
    api = createVscodeApi();
    apiSingleton = api;
    Object.assign(api, {
      Uri, Position, Range, Selection, Location, Disposable, EventEmitter, Event,
      CancellationTokenSource,
      CancellationToken: Object.freeze({ isCancellationRequested: false, onCancellationRequested: NOOP }),
      Diagnostic, DiagnosticSeverity, DiagnosticTag, DiagnosticRelatedInformation,
      TextEdit, WorkspaceEdit, SnippetString, MarkdownString, CompletionItem, CompletionItemKind,
      CompletionItemTag, CompletionList, Hover, CodeAction, CodeActionKind, CodeActionList, CodeLens,
      DocumentSymbol, SymbolInformation, SymbolKind, SymbolTag, SignatureHelp, SignatureInformation,
      ParameterInformation, DocumentHighlight, DocumentHighlightKind, FileSystemError, TextDocument,
      DocumentLink, CallHierarchyItem,
      StatusBarAlignment, ExtensionMode, ExtensionContext, EnvironmentVariableCollection,
      ViewColumn, TreeItem, TreeItemCollapsibleState, WebviewPanel, WebviewView,
      UIKind: Object.freeze({ Desktop: 1, Web: 2 }),
      ThemeColor: class ThemeColor { constructor(id) { this.id = id; } },
      ThemeIcon: class ThemeIcon { constructor(id, color) { this.id = id; this.color = color; } },
      version: bootEnv.version || "1.94.0",
    });
  }
  return apiSingleton;
};

module.exports = { getVscodeApi, hostApi };
