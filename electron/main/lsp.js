// Language Server Protocol (LSP) layer.
//
// Architecture: Monaco (renderer) ─ IPC ─ LspManager (main) ─ stdio JSON-RPC ─
// language server process (the server binary bundled inside an installed
// extension). The manager owns the server processes, the open-document store
// and the JSON-RPC conversation; the renderer only registers Monaco providers
// that bridge to this manager via the `lsp:*` IPC channels.
//
// Only extensions that ACTUALLY ship a runnable language server are detected
// (see KNOWN_LSP_SERVERS). Grammar-only extensions are intentionally left
// untouched — they never get a server process.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── URI helpers (Windows file paths ↔ LSP URIs) ──────────────────────────────
function pathToUri(p) {
  let s = String(p || "").replace(/\\/g, "/");
  s = s.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\?/g, "%3F").replace(/ /g, "%20");
  return "file:///" + s;
}

// ── JSON-RPC client over the server's stdio ─────────────────────────────────
class LspClient {
  constructor(child, handlers) {
    this.child = child;
    this.handlers = handlers || {};
    this.buf = Buffer.alloc(0);
    this.pending = new Map();
    this.id = 0;
    this.disposed = false;
    child.stdout.on("data", (d) => this._onData(d));
  }

  _onData(d) {
    this.buf = Buffer.concat([this.buf, d]);
    for (;;) {
      const idx = this.buf.indexOf("\r\n\r\n");
      if (idx < 0) break;
      const head = this.buf.slice(0, idx).toString("utf8");
      const m = /Content-Length:\s*(\d+)/i.exec(head);
      if (!m) { this.buf = this.buf.slice(idx + 4); continue; }
      const len = parseInt(m[1], 10);
      const bodyStart = idx + 4;
      if (this.buf.length < bodyStart + len) break;
      const body = this.buf.slice(bodyStart, bodyStart + len).toString("utf8");
      this.buf = this.buf.slice(bodyStart + len);
      try { this._dispatch(JSON.parse(body)); } catch {}
    }
  }

  _dispatch(msg) {
    if (typeof msg.id === "number") {
      const p = this.pending.get(msg.id);
      if (p) {
        this.pending.delete(msg.id);
        clearTimeout(p.timer);
        if (msg.error) p.reject(Object.assign(new Error(msg.error.message || "LSP error"), { code: msg.error.code || "LSP" }));
        else p.resolve(msg.result);
      }
      return;
    }
    if (!msg.method) return;
    const onRequest = this.handlers.onRequest;
    if (msg.id !== undefined && onRequest) {
      let result = null;
      try { result = onRequest(msg.method, msg.params); } catch { result = null; }
      try { this.sendRaw({ jsonrpc: "2.0", id: msg.id, result: result ?? null }); } catch {}
      return;
    }
    try { this.handlers.onNotification?.(msg.method, msg.params); } catch {}
  }

  sendRaw(obj) {
    const b = Buffer.from(JSON.stringify(obj), "utf8");
    this.child.stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${b.length}\r\n\r\n`, "utf8"), b]));
  }

  sendRequest(method, params, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(Object.assign(new Error(`LSP request timed out: ${method}`), { code: "TIMEOUT" }));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try { this.sendRaw({ jsonrpc: "2.0", id, method, params: params ?? null }); }
      catch (err) { clearTimeout(timer); this.pending.delete(id); reject(err); }
    });
  }

  sendNotification(method, params) {
    this.sendRaw({ jsonrpc: "2.0", method, params: params ?? null });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const [, p] of this.pending) { clearTimeout(p.timer); p.reject(Object.assign(new Error("disposed"), { code: "DISPOSED" })); }
    this.pending.clear();
  }
}

// ── Server launch detection ──────────────────────────────────────────────────
//
// A language server is only started when the installed extension is known to
// bundle one at a predictable location. `kind: "node"` means the server is a
// plain JS file run with Electron's run-as-node mode; `kind: "binary"` is a
// standalone executable.
const KNOWN_LSP_SERVERS = {
  "redhat.vscode-yaml": {
    kind: "node",
    name: "yaml-language-server",
    serverRel: ["dist", "languageserver.js"],
    l10nRel: ["dist", "l10n"],
    args: ["--stdio"],
  },
  "rust-lang.rust-analyzer": {
    kind: "binary",
    name: "rust-analyzer",
    serverRel: process.platform === "win32"
      ? ["artifacts", `rust-analyzer-${process.platform}-${process.arch}.exe`]
      : ["artifacts", `rust-analyzer-${process.platform}-${process.arch}`],
    args: ["--stdio"],
  },
};

function extKeyOf(publisher, name) {
  return `${String(publisher || "").toLowerCase()}.${String(name || "").toLowerCase()}`;
}

function detectLspLaunch(extDir, manifest) {
  const known = KNOWN_LSP_SERVERS[extKeyOf(manifest.publisher, manifest.name)];
  if (!known) return { status: "none" };
  const serverAbs = path.join(extDir, ...known.serverRel);
  if (!fs.existsSync(serverAbs)) return { status: "none" };
  const languages = (manifest.contributes?.languages || []).map((l) => l.id).filter(Boolean);
  const l10nPath = known.l10nRel ? path.join(extDir, ...known.l10nRel) : null;
  return {
    status: "available",
    name: known.name,
    kind: known.kind,
    cmd: serverAbs,
    args: [...known.args],
    languages,
    l10nPath,
    l10nExists: l10nPath ? fs.existsSync(l10nPath) : false,
  };
}

// ── Capability extraction from the initialize response ───────────────────────
function extractCaps(c) {
  return {
    completion: !!c.completionProvider,
    completionTrigger: (c.completionProvider && c.completionProvider.triggerCharacters) || [],
    hover: !!c.hoverProvider,
    definition: !!c.definitionProvider,
    typeDefinition: !!c.typeDefinitionProvider,
    references: !!c.referencesProvider,
    documentSymbol: !!c.documentSymbolProvider,
    signatureHelp: !!c.signatureHelpProvider,
    signatureHelpTrigger: (c.signatureHelpProvider && c.signatureHelpProvider.triggerCharacters) || [],
    rename: !!c.renameProvider,
    formatting: !!c.documentFormattingProvider,
    rangeFormatting: !!c.documentRangeFormattingProvider,
    codeAction: !!c.codeActionProvider,
    workspaceSymbol: !!c.workspaceSymbolProvider,
  };
}

// ── Manager ──────────────────────────────────────────────────────────────────
class LspManager {
  constructor({ readVsxMeta, broadcast }) {
    this.readVsxMeta = readVsxMeta;
    this.broadcast = broadcast || (() => {});
    this.servers = new Map(); // extKey -> server state
    // Optional doc-event hooks (used by the extension host to mirror open /
    // change / close of every editor document). No-op by default.
    this.hooks = { onDocOpen: () => {}, onDocChange: () => {}, onDocClose: () => {} };
  }

  setHooks(hooks) {
    this.hooks = { ...this.hooks, ...(hooks || {}) };
  }

  // Pick the first enabled installed extension with a runnable server that
  // claims the given language id.
  pickServerForLanguage(languageId) {
    if (!languageId) return null;
    for (const entry of this.readVsxMeta() || []) {
      if (!entry.enabled || entry.lsp?.status !== "available") continue;
      if ((entry.lsp.languages || []).includes(languageId)) return entry;
    }
    return null;
  }

  findEntry(key) {
    for (const entry of this.readVsxMeta() || []) {
      if (extKeyOf(entry.publisher, entry.name) === key) return entry;
    }
    return null;
  }

  async ensureServer(key) {
    const existing = this.servers.get(key);
    if (existing && existing.client && !existing.stopped) return existing;
    if (existing && existing.stopped) return null;
    const entry = this.findEntry(key);
    if (!entry || !entry.enabled || entry.lsp?.status !== "available") return null;
    const st = {
      key,
      entry,
      lsp: entry.lsp,
      docs: new Map(), // path -> { path, uri, languageId, text, version, opened }
      client: null,
      child: null,
      caps: null,
      stopped: false,
      restartCount: 0,
      restartTimer: null,
      exitScheduled: false,
    };
    this.servers.set(key, st);
    try {
      await this.launch(st);
    } catch (err) {
      this.servers.delete(key);
      this.broadcast({ type: "error", extKey: key, error: `Failed to start ${entry.lsp.name}: ${err.message}` });
      return null;
    }
    return st;
  }

  async launch(st) {
    const lsp = st.lsp;
    const isNode = lsp.kind === "node";
    const cmd = isNode ? process.execPath : lsp.cmd;
    const args = isNode ? [lsp.cmd, ...lsp.args] : [...lsp.args];
    const env = { ...process.env };
    if (isNode) env.ELECTRON_RUN_AS_NODE = "1";
    const child = spawn(cmd, args, {
      cwd: path.dirname(lsp.cmd),
      env,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    st.child = child;
    st.exitScheduled = false;
    const client = new LspClient(child, {
      onNotification: (m, p) => this.onNotification(st, m, p),
      onRequest: (m, p) => this.onRequest(st, m, p),
    });
    st.client = client;
    child.on("exit", (code, signal) => this.onExit(st, code, signal));
    child.on("error", () => this.onExit(st, -1, null));

    const firstDoc = st.docs.values().next().value;
    const rootPath = firstDoc ? path.dirname(firstDoc.path) : null;
    const res = await client.sendRequest("initialize", {
      processId: null,
      clientInfo: { name: "ppoo-editor", version: "0.1.0" },
      rootUri: rootPath ? pathToUri(rootPath) : null,
      capabilities: {
        textDocument: {
          synchronization: { dynamicRegistration: false, willSave: false, didSave: true },
          completion: { completionItem: { snippetSupport: true } },
          hover: { contentFormat: ["markdown", "plaintext"] },
          signatureHelp: { signatureInformation: { documentationFormat: ["markdown", "plaintext"] } },
          publishDiagnostics: { relatedInformation: true },
        },
        workspace: { workspaceFolders: true },
      },
      workspaceFolders: rootPath ? [{ uri: pathToUri(rootPath), name: "workspace" }] : [],
      initializationOptions: lsp.l10nPath ? { l10nPath: lsp.l10nPath } : null,
    }, 30000);
    st.caps = extractCaps(res?.capabilities || {});
    try { client.sendNotification("initialized"); } catch {}
    st.restartCount = 0;
    this.sendStatus(st, true);
    // (Re)open every tracked document on the fresh server
    for (const doc of st.docs.values()) {
      doc.opened = true;
      try {
        client.sendNotification("textDocument/didOpen", {
          textDocument: { uri: doc.uri, languageId: doc.languageId, version: doc.version, text: doc.text },
        });
      } catch {}
    }
  }

  onExit(st, code, signal) {
    if (st.exitScheduled || st.stopped) { this.servers.delete(st.key); return; }
    st.exitScheduled = true;
    st.child = null;
    st.client = null;
    st.caps = null;
    if (st.docs.size > 0 && st.restartCount < 5) {
      const delay = 1000 * 2 ** st.restartCount;
      st.restartCount++;
      clearTimeout(st.restartTimer);
      st.restartTimer = setTimeout(async () => {
        st.exitScheduled = false;
        if (st.stopped || st.docs.size === 0) return;
        try {
          await this.launch(st);
        } catch (err) {
          st.exitScheduled = false;
          this.onExit(st, -1, null);
        }
      }, delay);
    } else {
      st.stopped = true;
      st.exitScheduled = true;
      clearTimeout(st.restartTimer);
      this.servers.delete(st.key);
      this.clearDocsDiagnostics(st);
      this.sendStatus(st, false);
    }
  }

  async stopServer(st, { quiet = false } = {}) {
    if (!st || st.stopped) return;
    st.stopped = true;
    st.exitScheduled = true;
    clearTimeout(st.restartTimer);
    this.servers.delete(st.key);
    const client = st.client;
    st.client = null;
    if (client) {
      try { await client.sendRequest("shutdown", null, 1500); } catch {}
      try { client.sendNotification("exit"); } catch {}
      client.dispose();
    }
    this.killTree(st.child);
    st.child = null;
    st.caps = null;
    this.clearDocsDiagnostics(st);
    // Always tell the renderer the server is gone, otherwise its LSP-backed
    // providers stay bound to a dead server (quiet only suppresses logging).
    this.sendStatus(st, false);
  }

  // Drop every published diagnostic for the server's documents (used when the
  // server stops for good; the editor would otherwise keep stale markers).
  clearDocsDiagnostics(st) {
    try {
      for (const doc of st.docs.values()) {
        if (doc.path) this.broadcast({ type: "diagnostics", path: doc.path, diagnostics: [] });
      }
    } catch {}
  }

  stopExtension(entry) {
    const st = this.servers.get(extKeyOf(entry?.publisher, entry?.name));
    if (st) this.stopServer(st, { quiet: true }).catch(() => {});
  }

  killTree(child) {
    if (!child || !child.pid || child.exitCode !== null) return;
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
      } else {
        child.kill("SIGTERM");
        setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, 500);
      }
    } catch {}
  }

  onNotification(st, method, params) {
    if (method === "textDocument/publishDiagnostics") {
      const p = params?.uri ? this.docPathForUri(st, params.uri) : null;
      if (p) this.broadcast({ type: "diagnostics", path: p, diagnostics: params.diagnostics || [] });
    } else if (method === "window/logMessage" || method === "window/showMessage") {
      this.broadcast({ type: "log", message: params?.message || params?.type || "" });
    }
  }

  onRequest(st, method, params) {
    if (method === "workspace/configuration") {
      return { items: (params?.items || []).map(() => null) };
    }
    if (method === "workspace/workspaceFolders") return [];
    if (method === "client/registerCapability") return null;
    if (method === "workspace/applyEdit") return { applied: false };
    if (method === "window/showMessageRequest") return null;
    return null;
  }

  docPathForUri(st, uri) {
    for (const doc of st.docs.values()) if (doc.uri === uri) return doc.path;
    return null;
  }

  serverForDoc(path) {
    for (const st of this.servers.values()) {
      if (st.client && st.docs.has(path)) return st;
    }
    return null;
  }

  sendStatus(st, running) {
    this.broadcast({
      type: "serverStatus",
      extKey: st.key,
      name: st.lsp.name,
      version: st.entry.version,
      running,
      languages: st.lsp.languages || [],
      capabilities: st.caps,
      openDocs: st.docs.size,
    });
  }

  // ── Public API (IPC surface) ────────────────────────────────────────────────
  async openDoc({ path: filePath, languageId, text }) {
    try {
      if (!filePath) return { success: true, server: null };
      try { this.hooks.onDocOpen({ path: filePath, languageId, text }); } catch {}
      const entry = this.pickServerForLanguage(languageId);
      if (!entry) return { success: true, server: null };
      const key = extKeyOf(entry.publisher, entry.name);
      let st = this.servers.get(key);
      if (!st || !st.client) {
        st = await this.ensureServer(key);
        if (!st) return { success: true, server: null };
      }
      const existing = st.docs.get(filePath);
      const doc = existing || { path: filePath, uri: pathToUri(filePath), languageId, text, version: 1, opened: false };
      if (existing) { doc.text = text; doc.languageId = languageId; }
      st.docs.set(filePath, doc);
      try {
        if (!existing) {
          st.client.sendNotification("textDocument/didOpen", {
            textDocument: { uri: doc.uri, languageId: doc.languageId, version: doc.version, text: doc.text },
          });
        } else {
          doc.version++;
          st.client.sendNotification("textDocument/didChange", {
            textDocument: { uri: doc.uri, version: doc.version },
            contentChanges: [{ text: doc.text }],
          });
        }
      } catch {}
      return { success: true, server: key };
    } catch (err) {
      return { success: false, error: err.message, code: err.code || "OPEN" };
    }
  }

  async changeDoc({ path: filePath, text }) {
    if (!filePath) return { success: true };
    try { this.hooks.onDocChange({ path: filePath, text }); } catch {}
    const st = this.serverForDoc(filePath);
    if (!st) return { success: true };
    const doc = st.docs.get(filePath);
    if (!doc) return { success: true };
    doc.text = text;
    doc.version++;
    try {
      st.client.sendNotification("textDocument/didChange", {
        textDocument: { uri: doc.uri, version: doc.version },
        contentChanges: [{ text: doc.text }],
      });
    } catch {}
    return { success: true };
  }

  async saveDoc({ path: filePath }) {
    if (!filePath) return { success: true };
    const st = this.serverForDoc(filePath);
    if (!st || !st.client) return { success: true };
    const doc = st.docs.get(filePath);
    if (!doc) return { success: true };
    try {
      st.client.sendNotification("textDocument/didSave", { textDocument: { uri: doc.uri }, text: doc.text });
    } catch {}
    return { success: true };
  }

  async closeDoc({ path: filePath }) {
    if (!filePath) return { success: true };
    try { this.hooks.onDocClose({ path: filePath }); } catch {}
    const st = this.serverForDoc(filePath);    if (!st) return { success: true };
    const doc = st.docs.get(filePath);
    if (doc) {
      st.docs.delete(filePath);
      try { st.client.sendNotification("textDocument/didClose", { textDocument: { uri: doc.uri } }); } catch {}
      this.broadcast({ type: "diagnostics", path: filePath, diagnostics: [] });
    }
    if (st.docs.size === 0) await this.stopServer(st);
    return { success: true };
  }

  async request({ path: filePath, method, params }) {
    try {
      const st = this.serverForDoc(filePath);
      if (!st || !st.client) {
        return { success: false, code: "NO_SERVER", error: "Language server is not running" };
      }
      const doc = st.docs.get(filePath);
      let p = params;
      if (p && typeof p === "object") {
        p = JSON.parse(JSON.stringify(p));
        if (doc) {
          if (!p.textDocument || typeof p.textDocument !== "object") p.textDocument = {};
          if (!p.textDocument.uri) p.textDocument.uri = doc.uri;
        }
      }
      const result = await st.client.sendRequest(method, p ?? null, 60000);
      return { success: true, result };
    } catch (err) {
      return { success: false, error: err.message, code: err.code || "LSP" };
    }
  }

  disposeAll() {
    for (const st of this.servers.values()) {
      st.stopped = true;
      st.exitScheduled = true;
      clearTimeout(st.restartTimer);
      try { st.client?.sendNotification("exit"); } catch {}
      st.client?.dispose();
      this.killTree(st.child);
    }
    this.servers.clear();
  }
}

function registerLspIpc({ ipcMain, readVsxMeta, broadcast }) {
  const manager = new LspManager({ readVsxMeta, broadcast });
  ipcMain.handle("lsp:open", (_e, p) => manager.openDoc(p || {}));
  ipcMain.handle("lsp:change", (_e, p) => manager.changeDoc(p || {}));
  ipcMain.handle("lsp:close", (_e, p) => manager.closeDoc(p || {}));
  ipcMain.handle("lsp:request", (_e, p) => manager.request(p || {}));
  return manager;
}

module.exports = { detectLspLaunch, registerLspIpc, extKeyOf, pathToUri };
