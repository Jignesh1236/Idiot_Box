// Extension host manager (main process).
//
// Owns the Node utilityProcess that runs installed extensions' activate()/
// deactivate() code, routes the shim's RPC namespaces to app facilities
// (dialogs, clipboard, fs, settings, broadcast to renderers) and keeps the
// per-extension activation state machine (inactive / activating / active /
// failed / deactivated) with a 90s idle auto-deactivate and a serialized
// activation queue (capacity 1).
//
// Renderer contract (channel "extHost:event"):
//   hostState, ext-activation, ext-deactivated, command, output, statusbar,
//   diagnostics, provider, workspace, config
// Renderer IPC (registered here):
//   extHost:state, extHost:commands, extHost:runCommand, extHost:output,
//   extHost:providerRequest

"use strict";

const { utilityProcess, clipboard, shell, dialog, BrowserWindow, app } = require("electron");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");

const HOST_ENTRY = path.join(__dirname, "../host/extension-host.cjs");
const AUTO_DEACTIVATE_MS = 90 * 1000;
const BUCKET_DRAIN_MS = 250;
const CHANNEL_CAP = 5000;
const CONSOLE_RING_CAP = 500;

const toLongPath = (p) => {
  const s = String(p || "");
  if (s.startsWith("\\\\?\\")) return s;
  if (s.startsWith("\\\\")) return "\\\\?\\UNC\\" + s.slice(2);
  return /^[A-Za-z]:/.test(s) ? "\\\\?\\" + s : s;
};

const LANG_EXT_MAP = {
  ".yaml": "yaml", ".yml": "yaml", ".json": "json", ".js": "javascript", ".jsx": "javascriptreact",
  ".mjs": "javascript", ".cjs": "javascript", ".ts": "typescript", ".tsx": "typescriptreact",
  ".py": "python", ".md": "markdown", ".xml": "xml", ".html": "html", ".htm": "html", ".css": "css",
  ".java": "java", ".c": "c", ".h": "c", ".cpp": "cpp", ".hpp": "cpp", ".cs": "csharp",
  ".go": "go", ".rs": "rust", ".php": "php", ".rb": "ruby", ".sh": "shell", ".ps1": "powershell",
  ".sql": "sql", ".toml": "toml", ".ini": "ini", ".cfg": "ini", ".txt": "plaintext",
};

const BUILTIN_LANGUAGES = ["plaintext", "yaml", "json", "javascript", "typescript", "javascriptreact", "typescriptreact", "python", "markdown", "xml", "html", "css", "less", "scss", "java", "c", "cpp", "csharp", "go", "rust", "php", "ruby", "shell", "powershell", "sql", "toml", "ini", "dockerfile", "gitignore"];

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
  return re.test(f);
}

class ExtHostManager {
  constructor({ readVsxMeta, getActiveFolder, getSettings, broadcast, compatVersion, onDocSaved }) {
    this.readVsxMeta = readVsxMeta || (() => []);
    this.getActiveFolder = getActiveFolder || (() => null);
    this.getSettings = getSettings || (() => ({}));
    this.broadcast = broadcast || (() => {});
    this.compatVersion = compatVersion || [1, 94, 0];
    this.onDocSaved = onDocSaved || (() => {});

    this.child = null;
    this.running = false;
    this.pending = new Map();      // id -> { resolve, reject }
    this.seq = 0;
    this.docs = new Map();         // path -> { path, uri, languageId, text, version }
    this.records = new Map();      // extId -> { id, state, activationError, enginesNote, activatedAt, lastActivity }
    this.channels = new Map();     // key -> { key, extKey, name, lines, seq }
    this.consoleRing = [];
    this.statusItems = new Map();  // id -> item state
    this.webviewPanels = new Map(); // panelId -> { panelId, extKey, viewType, title, options, resolved }
    this.webviewViews = new Map();  // viewType -> { viewType, extKey }
    this.treeViews = new Map();     // viewId -> { viewId, extKey, title, created }
    this.providers = new Map();    // providerId -> { id, extKey, kind, selector, triggerCharacters, metadata }
    this.commands = new Map();     // commandId -> extKey
    this.diagOwners = new Set();   // diag owner keys ("<extKey>|<name>") with markers published by the host
    this.watchers = new Map();     // watcherId -> chokidar watcher
    this.deactivateTimers = new Map();
    this.activationQueue = Promise.resolve();
    this.bucket = [];
    this.bucketTimer = null;
    this.startupTimer = null;
    this.configOverrides = {};
  }

  // ── Process lifecycle ──────────────────────────────────────────────────────
  start() {
    if (this.child && !this.child.killed) return;
    try {
      this.child = utilityProcess.fork(HOST_ENTRY, [], { stdio: "inherit" });
    } catch (err) {
      this.broadcast({ type: "hostState", state: "error", error: `Failed to start extension host: ${err.message}` });
      return;
    }
    this.child.on("message", (msg) => this.onHostMessage(msg));
    this.child.on("exit", (code) => {
      this.running = false;
      for (const [, p] of this.pending) {
        p.reject(Object.assign(new Error("Extension host exited"), { code: "HOST_EXIT" }));
      }
      this.pending.clear();
      this.broadcast({ type: "hostState", state: "stopped", code });
    });
  }

  boot() {
    const entries = this.enabledEntries();
    for (const e of entries) {
      const rec = this.recFor(this.extId(e));
      rec.enginesNote = this.enginesNoteFor(e);
      if (rec.state === "inactive" || rec.state === "failed") rec.activationError = null;
    }
    const folders = [];
    const folder = this.getActiveFolder();
    if (folder) folders.push({ index: 0, name: path.basename(folder), path: folder });
    this.sendReq("system", "boot", {
      extensions: entries.map((e) => ({ id: this.extId(e), dir: e.dir, packageJSON: e.manifest })),
      config: { ...(this.getSettings() || {}), ...this.configOverrides },
      docs: [...this.docs.values()].map((d) => ({ uri: d.uri, languageId: d.languageId, text: d.text, version: d.version })),
      folders,
      env: {
        appName: "ppoo",
        appRoot: process.cwd(),
        userDataPath: app.getPath("userData"),
        language: (typeof app.getLocale === "function" ? app.getLocale() : "en") || "en",
        uriScheme: "vscode",
        machineId: "unknown",
        sessionId: `session-${process.pid}`,
        shell: process.env.SHELL || (process.platform === "win32" ? "cmd.exe" : ""),
        version: this.compatVersion.join("."),
      },
    }).then(() => {
      this.running = true;
      this.broadcast({ type: "hostState", state: "running" });
    }).catch((err) => {
      this.broadcast({ type: "hostState", state: "error", error: (err && err.message) || String(err) });
    });
  }

  dispose() {
    clearTimeout(this.bucketTimer);
    clearTimeout(this.startupTimer);
    for (const t of this.deactivateTimers.values()) clearTimeout(t);
    this.deactivateTimers.clear();
    for (const w of this.watchers.values()) { try { w.close(); } catch {} }
    this.watchers.clear();
    if (this.child && !this.child.killed) {
      try { this.sendRaw({ t: "notify", ns: "system", m: "dispose", a: {} }); } catch {}
      setTimeout(() => {
        try { if (this.child && !this.child.killed) this.child.kill(); } catch {}
      }, 500);
    }
    this.child = null;
  }

  // ── Host <-> main messaging ────────────────────────────────────────────────
  sendRaw(obj) {
    try { if (this.child && !this.child.killed) this.child.postMessage(obj); } catch {}
  }

  sendReq(ns, m, a) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      this.pending.set(id, { resolve, reject });
      this.sendRaw({ t: "req", id, ns, m, a });
    });
  }

  sendNotify(ns, m, a) {
    this.sendRaw({ t: "notify", ns, m, a });
  }

  onHostMessage(msg) {
    if (!msg || typeof msg !== "object") return;
    if (msg.t === "resp") {
      const p = this.pending.get(msg.id);
      if (p) {
        this.pending.delete(msg.id);
        if (msg.ok) p.resolve(msg.r);
        else p.reject(Object.assign(new Error((msg.e && msg.e.message) || "Host error"), { code: msg.e && msg.e.code }));
      }
      return;
    }
    if (msg.t === "notify") {
      try { this.handleHostNotify(msg.ns, msg.m, msg.a); } catch (err) { console.error("[extHost] notify error:", err); }
      return;
    }
    if (msg.t === "req") {
      const id = msg.id;
      Promise.resolve()
        .then(() => this.handleHostRequest(msg.ns, msg.m, msg.a))
        .then((r) => this.sendRaw({ t: "resp", id, ok: true, r: r === undefined ? null : r }))
        .catch((err) => this.sendRaw({
          t: "resp", id, ok: false,
          e: { message: (err && err.message) || String(err), code: err && err.code },
        }));
    }
  }

  // ── Notifications from the host (shim fire-and-forget) ─────────────────────
  handleHostNotify(ns, m, a) {
    if (ns === "console") {
      this.channelAppend("__ext-host-console", "__console", "Extension Host", a.text || "");
      return;
    }
    if (ns === "extensions") {
      if (m === "hostReady") { this.boot(); return; }
      if (m === "booted") { this.scheduleStartupActivations(); return; }
      if (m === "activated") {
        const rec = this.recFor(a.id);
        rec.state = "active";
        rec.activationError = null;
        rec.activatedAt = Date.now();
        this.broadcast({ type: "ext-activation", id: a.id, state: "active" });
        this.scheduleAutoDeactivate(a.id);
        return;
      }
      if (m === "activationFailed") {
        const rec = this.recFor(a.id);
        rec.state = "failed";
        rec.activationError = a.error || "Activation failed";
        this.broadcast({ type: "ext-activation", id: a.id, state: "failed", error: rec.activationError });
        return;
      }
      if (m === "deactivated") {
        const rec = this.recFor(a.id);
        rec.state = "deactivated";
        this.broadcast({ type: "ext-deactivated", id: a.id });
        return;
      }
      return;
    }
    if (ns === "commands") {
      if (m === "register") {
        this.commands.set(a.id, a.extKey || "");
        this.broadcast({ type: "command", action: "register", id: a.id, extKey: a.extKey || "" });
      } else if (m === "unregister") {
        this.commands.delete(a.id);
        this.broadcast({ type: "command", action: "unregister", id: a.id });
      }
      return;
    }
    if (ns === "output") {
      const key = `${a.extKey}::${a.name}`;
      if (m === "append") this.channelAppend(key, a.extKey, a.name, a.text);
      else if (m === "replace") { this.channelClear(key); this.channelAppend(key, a.extKey, a.name, a.text); }
      else if (m === "clear") this.channelClear(key);
      else if (m === "show") this.broadcast({ type: "outputShow", key, name: a.name, extKey: a.extKey });
      else if (m === "hide") this.broadcast({ type: "outputHide", key });
      else if (m === "dispose") { this.channels.delete(key); this.broadcast({ type: "outputDispose", key }); }
      return;
    }
    if (ns === "statusbar") {
      if (m === "update") {
        this.statusItems.set(a.id, a);
        this.broadcast({ type: "statusbar", item: a });
      } else if (m === "dispose") {
        this.statusItems.delete(a.id);
        this.broadcast({ type: "statusbar", item: { id: a.id, disposed: true } });
      } else if (m === "message") {
        const id = `msg-${a.extKey}`;
        if (a.text) {
          this.statusItems.set(id, { id, extKey: a.extKey, text: a.text, visible: true });
          this.broadcast({ type: "statusbar", item: { id, extKey: a.extKey, text: a.text, visible: true } });
        } else {
          this.statusItems.delete(id);
          this.broadcast({ type: "statusbar", item: { id, disposed: true } });
        }
      }
      return;
    }
    if (ns === "languages") {
      if (m === "registerProvider") {
        this.providers.set(a.id, a);
        const entry = this.findEntryById(a.extKey);
        this.broadcast({
          type: "provider", action: "register",
          id: a.id, extKey: a.extKey, kind: a.kind,
          selector: a.selector, triggerCharacters: a.triggerCharacters || [],
          metadata: a.metadata || undefined,
          version: entry ? entry.version : undefined,
        });
      } else if (m === "disposeProvider") {
        this.providers.delete(a.id);
        this.broadcast({ type: "provider", action: "dispose", id: a.id });
      } else if (m === "setDiagnostics") {
        if (a.owner) this.diagOwners.add(a.owner);
        this.broadcast({ type: "diagnostics", owner: a.owner, uri: a.uri, diagnostics: a.diagnostics || [] });
      } else if (m === "clearDiagnostics") {
        if (a.owner) this.diagOwners.delete(a.owner);
        this.broadcast({ type: "diagnostics", owner: a.owner, clear: true });
      }
      return;
    }
    if (ns === "webview") {
      if (m === "create") {
        this.webviewPanels.set(a.panelId, { panelId: a.panelId, extKey: a.extKey, viewType: a.viewType, title: a.title, options: a.options, resolved: false });
        this.broadcast({ type: "webview", action: "create", panel: { panelId: a.panelId, extKey: a.extKey, viewType: a.viewType, title: a.title, options: a.options || null } });
      } else if (m === "html") {
        this.broadcast({ type: "webview", action: "html", panelId: a.panelId, html: a.html });
      } else if (m === "post") {
        this.broadcast({ type: "webview", action: "message", panelId: a.panelId, message: a.message });
      } else if (m === "reveal") {
        this.broadcast({ type: "webview", action: "reveal", panelId: a.panelId });
      } else if (m === "dispose") {
        this.webviewPanels.delete(a.panelId);
        this.broadcast({ type: "webview", action: "dispose", panelId: a.panelId });
      } else if (m === "registerView") {
        this.webviewViews.set(a.viewType, { viewType: a.viewType, extKey: a.extKey });
        this.broadcast({ type: "webview", action: "registerView", viewType: a.viewType, extKey: a.extKey });
      } else if (m === "registerViewDispose") {
        this.webviewViews.delete(a.viewType);
        this.broadcast({ type: "webview", action: "registerViewDispose", viewType: a.viewType });
      }
      return;
    }
    if (ns === "treeview") {
      if (m === "register") {
        this.treeViews.set(a.viewId, { viewId: a.viewId, extKey: a.extKey, title: a.viewId, created: false });
        this.broadcast({ type: "treeview", action: "register", viewId: a.viewId, extKey: a.extKey });
      } else if (m === "unregister") {
        const rec = this.treeViews.get(a.viewId);
        if (rec) { this.treeViews.delete(a.viewId); this.broadcast({ type: "treeview", action: "unregister", viewId: a.viewId }); }
      } else if (m === "create") {
        this.treeViews.set(a.viewId, { viewId: a.viewId, extKey: a.extKey, title: a.title, showCollapseAll: a.showCollapseAll, created: true });
        this.broadcast({ type: "treeview", action: "create", viewId: a.viewId, extKey: a.extKey, title: a.title, showCollapseAll: a.showCollapseAll });
      } else if (m === "changed") {
        this.broadcast({ type: "treeview", action: "changed", viewId: a.viewId });
      } else if (m === "dispose") {
        this.treeViews.delete(a.viewId);
        this.broadcast({ type: "treeview", action: "dispose", viewId: a.viewId });
      }
      return;
    }
  }

  // ── Requests from the host (shim rpc) ──────────────────────────────────────
  async handleHostRequest(ns, m, a) {
    switch (ns) {
      case "commands": {
        if (m === "execute") return this.execHostCommand(a.id, a.args);
        if (m === "getAll") return [...this.commands.keys()];
        throw new Error(`commands.${m} not implemented`);
      }
      case "extensions": {
        if (m === "ensureActivated") {
          const entry = this.findEntryById(a.id);
          if (entry) await this.queueActivation(entry);
          return { ok: true };
        }
        throw new Error(`extensions.${m} not implemented`);
      }
      case "window": {
        if (m === "showMessage") return this.showMessageBox(a);
        if (m === "showTextDocument") {
          const p = this.uriToPath(a.uri);
          this.broadcast({ type: "workspace", action: "open", uri: this.uriString(a.uri), path: p });
          return { ok: true };
        }
        throw new Error(`window.${m} not implemented`);
      }
      case "env": {
        if (m === "clipboardRead") return clipboard.readText();
        if (m === "clipboardWrite") { clipboard.writeText(String(a.text || "")); return { ok: true }; }
        if (m === "openExternal") {
          const target = this.uriString(a.uri);
          await shell.openExternal(target);
          return { ok: true };
        }
        throw new Error(`env.${m} not implemented`);
      }
      case "languages": {
        if (m === "getLanguages") return this.languageList();
        throw new Error(`languages.${m} not implemented`);
      }
      case "workspace": {
        if (m === "updateConfiguration") {
          this.configOverrides[a.key] = a.value;
          this.pushConfig();
          return { ok: true };
        }
        if (m === "storage") return this.extensionStorage(a);
        if (m === "openTextDocument") return this.openTextDocument(a.uri);
        if (m === "findFiles") return this.findFiles(a);
        if (m === "watch") return this.watch(a);
        if (m === "unwatch") return this.unwatch(a);
        if (m === "applyEdit") {
          const edits = this.flattenWorkspaceEdit(a.edit);
          this.broadcast({ type: "workspace", action: "applyEdit", edits });
          return { ok: true };
        }
        throw new Error(`workspace.${m} not implemented`);
      }
      case "workspace.fs": {
        return this.fsOp(m, a);
      }
      case "doc": {
        if (m === "save") return this.saveDoc(a.uri);
        throw new Error(`doc.${m} not implemented`);
      }
      case "webview": {
        // Renderer -> extension messages / lifecycle, bridged to the host.
        if (m === "postToView") {
          await this.sendReq("system", "webviewEvent", { panelId: a.panelId, kind: "message", message: a.message });
          return { ok: true };
        }
        if (m === "closed") {
          await this.sendReq("system", "webviewEvent", { panelId: a.panelId, kind: "disposed" });
          return { ok: true };
        }
        if (m === "visibility") {
          await this.sendReq("system", "webviewEvent", { panelId: a.panelId, kind: "visibility", visible: !!a.visible });
          return { ok: true };
        }
        if (m === "resolve") {
          await this.sendReq("system", "webviewResolve", { viewType: a.viewType, panelId: a.panelId });
          const rec = this.webviewPanels.get(a.panelId);
          if (rec) rec.resolved = true;
          return { ok: true };
        }
        throw new Error(`webview.${m} not implemented`);
      }
      case "treeview": {
        if (m === "children") {
          return this.sendReq("system", "treeChildren", { viewId: a.viewId, element: a.element === undefined ? null : a.element });
        }
        if (m === "reveal") {
          const r = await this.sendReq("system", "treeReveal", { viewId: a.viewId, element: a.element === undefined ? null : a.element, options: a.options });
          this.broadcast({ type: "treeview", action: "reveal", viewId: a.viewId, ancestors: r && r.ancestors });
          return r;
        }
        if (m === "event") {
          await this.sendReq("system", "treeEvent", { kind: a.kind, viewId: a.viewId, element: a.element });
          return { ok: true };
        }
        throw new Error(`treeview.${m} not implemented`);
      }
      default:
        throw new Error(`Unknown RPC namespace: ${ns}`);
    }
  }

  // ── RPC implementations ────────────────────────────────────────────────────
  extensionStorage({ extId, scope, op, key, value }) {
    const dir = path.join(app.getPath("userData"), "ext-host-storage");
    const file = path.join(dir, String(extId || "unknown").replace(/[^a-z0-9._-]/gi, "_") + ".json");
    let data = {};
    try { data = JSON.parse(fs.readFileSync(file, "utf8")) || {}; } catch { data = {}; }
    const bucket = (data.workspace && typeof data.workspace === "object" ? data.workspace : {}) ;
    const gbucket = (data.global && typeof data.global === "object" ? data.global : {});
    if (op === "set") {
      const target = scope === "global" ? gbucket : bucket;
      target[key] = value;
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(file, JSON.stringify({ workspace: bucket, global: gbucket }));
      } catch {}
      return { ok: true };
    }
    return scope === "global" ? gbucket : bucket;
  }

  async execHostCommand(id, args) {
    if (this.commands.has(id)) {
      return this.sendReq("system", "execCommand", { id, args: args || [] });
    }
    // Not registered yet — maybe an extension with onCommand: activation
    const entries = this.enabledEntries().filter((e) => {
      const evs = (e.manifest && e.manifest.activationEvents) || [];
      return evs.includes("*") || evs.includes(`onCommand:${id}`);
    });
    for (const e of entries) await this.queueActivation(e);
    if (this.commands.has(id)) return this.sendReq("system", "execCommand", { id, args: args || [] });
    throw Object.assign(new Error(`Command '${id}' not found`), { code: "NOT_FOUND" });
  }

  async showMessageBox(a) {
    const win = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed()) || null;
    const severity = a.severity || "info";
    const type = severity === "error" ? "error" : severity === "warning" ? "warning" : "info";
    const title = severity === "error" ? "Extension error" : severity === "warning" ? "Extension warning" : "Extension message";
    const message = String(a.message || "");
    const items = a.items || [];
    if (!items.length) {
      await dialog.showMessageBox(win, { type, title, message, buttons: ["OK"], defaultId: 0, cancelId: 0, noLink: true });
      return undefined;
    }
    const buttons = items.map((i) => i.title);
    const { response } = await dialog.showMessageBox(win, {
      type, title, message, buttons,
      defaultId: buttons.length - 1,
      cancelId: buttons.length - 1,
      noLink: true,
    });
    return response >= 0 && response < items.length ? response : undefined;
  }

  async openTextDocument(u) {
    const p = this.uriToPath(u);
    if (!p) return { uri: this.uriString(u), languageId: "plaintext", text: "", version: 1 };
    let text = "";
    try { text = fs.readFileSync(toLongPath(p), "utf8"); } catch { text = ""; }
    const rec = this.docs.get(p);
    return {
      uri: this.uriString(u),
      languageId: rec ? rec.languageId : this.guessLanguage(p),
      text,
      version: rec ? rec.version : 1,
    };
  }

  findFiles(a) {
    const folder = this.getActiveFolder();
    if (!folder) return Promise.resolve([]);
    const include = String(a.include || "**/*");
    const exclude = a.exclude ? String(a.exclude) : null;
    const max = Math.min(a.maxResults || 1000, 10000);
    return new Promise((resolve) => {
      const out = [];
      const walk = (dir) => {
        if (out.length >= max) return;
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
          if (out.length >= max) break;
          if (e.name === "node_modules" || e.name === ".git" || e.name === ".trash" || e.name === ".project_config") continue;
          const abs = path.join(dir, e.name);
          if (e.isDirectory()) { walk(abs); continue; }
          if (!e.isFile()) continue;
          const rel = path.relative(folder, abs).replace(/\\/g, "/");
          if (exclude && globMatch(exclude, rel)) continue;
          if (globMatch(include, rel)) out.push(this.pathToUri(abs));
        }
      };
      walk(folder);
      resolve(out.slice(0, max));
    });
  }

  watch(a) {
    const watcherId = a.watcherId;
    const folder = this.getActiveFolder();
    if (!folder) return { ok: false, error: "No workspace folder open" };
    const glob = String(a.glob || "**/*").replace(/^\//, "");
    const w = chokidar.watch(path.join(folder, glob), { ignoreInitial: true });
    w.on("add", (p) => this.sendNotify("system", "fsWatcher", { watcherId, kind: "create", path: p }));
    w.on("change", (p) => this.sendNotify("system", "fsWatcher", { watcherId, kind: "change", path: p }));
    w.on("unlink", (p) => this.sendNotify("system", "fsWatcher", { watcherId, kind: "delete", path: p }));
    w.on("error", () => {});
    this.watchers.set(watcherId, w);
    return { ok: true };
  }

  unwatch(a) {
    const w = this.watchers.get(a.watcherId);
    if (w) { try { w.close(); } catch {} this.watchers.delete(a.watcherId); }
    return { ok: true };
  }

  async fsOp(m, a) {
    const p = this.uriToPath(a.uri);
    const long = toLongPath(p || "");
    switch (m) {
      case "stat": {
        try {
          const s = fs.statSync(long);
          return { type: s.isDirectory() ? 2 : s.isFile() ? 1 : 0, ctime: s.ctimeMs, mtime: s.mtimeMs, size: s.size };
        } catch (err) {
          throw Object.assign(new Error(err.message), { code: err.code === "ENOENT" ? "FileNotFound" : "Unknown" });
        }
      }
      case "readFile": {
        try { return { base64: fs.readFileSync(long).toString("base64") }; }
        catch (err) {
          return { error: { message: err.message, code: err.code === "ENOENT" ? "FileNotFound" : "Unknown" } };
        }
      }
      case "writeFile": {
        try { fs.writeFileSync(long, Buffer.from(a.base64 || "", "base64")); return { ok: true }; }
        catch (err) { throw Object.assign(new Error(err.message), { code: "Unknown" }); }
      }
      case "readDirectory": {
        try {
          return fs.readdirSync(long, { withFileTypes: true }).map((e) => [e.name, e.isDirectory() ? 2 : 1]);
        } catch (err) { throw Object.assign(new Error(err.message), { code: "Unknown" }); }
      }
      case "createDirectory": {
        fs.mkdirSync(long, { recursive: true });
        return { ok: true };
      }
      case "delete": {
        fs.rmSync(long, { recursive: !!a.recursive, force: true });
        return { ok: true };
      }
      case "rename": {
        fs.renameSync(toLongPath(this.uriToPath(a.oldUri) || ""), toLongPath(this.uriToPath(a.newUri) || ""));
        return { ok: true };
      }
      case "copy": {
        const src = toLongPath(this.uriToPath(a.source) || "");
        const dest = toLongPath(this.uriToPath(a.destination) || "");
        const st = fs.statSync(src);
        if (st.isDirectory()) fs.cpSync(src, dest, { recursive: true });
        else fs.copyFileSync(src, dest);
        return { ok: true };
      }
      default:
        throw new Error(`workspace.fs.${m} not implemented`);
    }
  }

  saveDoc(uri) {
    const p = this.uriToPath(uri);
    if (!p) return { ok: false };
    const rec = this.docs.get(p);
    if (!rec) return { ok: false };
    fs.writeFileSync(toLongPath(p), rec.text, "utf8");
    this.sendNotify("system", "docEvent", { kind: "save", uri: rec.uri, languageId: rec.languageId, version: rec.version });
    try { this.onDocSaved(p); } catch {}
    return { ok: true };
  }

  // Editor save notification (renderer -> main), fires onDidSaveTextDocument
  notifyDocSaved(p) {
    const rec = this.docs.get(p);
    if (!rec) return { ok: false };
    this.sendNotify("system", "docEvent", { kind: "save", uri: rec.uri, languageId: rec.languageId, version: rec.version });
    return { ok: true };
  }

  // ── Document hooks (invoked by the LSP layer) ──────────────────────────────
  onDocOpen({ path: p, languageId, text }) {
    if (!p) return;
    const uri = this.pathToUri(p);
    const existing = this.docs.get(p);
    const version = existing ? existing.version + 1 : 1;
    this.docs.set(p, { path: p, uri, languageId, text, version });
    this.sendNotify("system", "docEvent", { kind: existing ? "change" : "open", uri, languageId, text, version });
    this.scheduleActivationActivity(p, languageId);
  }

  onDocChange({ path: p, text }) {
    const rec = this.docs.get(p);
    if (!rec) return;
    rec.text = text;
    rec.version++;
    this.sendNotify("system", "docEvent", { kind: "change", uri: rec.uri, languageId: rec.languageId, text, version: rec.version });
    this.scheduleActivationActivity(p, rec.languageId);
  }

  onDocClose({ path: p }) {
    const rec = this.docs.get(p);
    if (!rec) return;
    this.docs.delete(p);
    this.sendNotify("system", "docEvent", { kind: "close", uri: rec.uri, languageId: rec.languageId, version: rec.version });
  }

  // ── Activation scheduling ──────────────────────────────────────────────────
  scheduleStartupActivations() {
    clearTimeout(this.startupTimer);
    this.startupTimer = setTimeout(() => {
      this.startupTimer = null;
      for (const entry of this.enabledEntries()) {
        const evs = (entry.manifest && entry.manifest.activationEvents) || [];
        if (evs.includes("onStartupFinished") || evs.includes("*")) this.queueActivation(entry);
      }
    }, 1000);
  }

  scheduleActivationActivity(p, languageId) {
    this.bucket.push({ path: p, languageId });
    if (this.bucketTimer) return;
    this.bucketTimer = setTimeout(() => {
      this.bucketTimer = null;
      const items = this.bucket.splice(0);
      for (const it of items) this.activateForActivity(it.path, it.languageId);
    }, BUCKET_DRAIN_MS);
  }

  activateForActivity(p, languageId) {
    const now = Date.now();
    for (const entry of this.enabledEntries()) {
      const id = this.extId(entry);
      // TEMP: redhat.vscode-yaml is served by the real VS Code extension host
      // (web worker) since the real-host integration; skip the legacy host for
      // it to avoid double activation. Removed in Phase C with the old layer.
      if (id === "redhat.vscode-yaml") continue;
      const rec = this.recFor(id);
      rec.lastActivity = now;
      if (rec.state === "active") { this.scheduleAutoDeactivate(id); continue; }
      if (rec.state === "activating") continue;
      const evs = (entry.manifest && entry.manifest.activationEvents) || [];
      if (!evs.length) continue;
      if (evs.includes("*") || evs.includes(`onLanguage:${languageId}`)) this.queueActivation(entry);
    }
  }

  queueActivation(entry) {
    if (!entry) return Promise.resolve();
    const rec = this.recFor(this.extId(entry));
    if (rec.state === "active" || rec.state === "activating") return Promise.resolve();
    this.activationQueue = this.activationQueue.then(() => this.doActivate(entry)).catch(() => {});
    return this.activationQueue;
  }

  async doActivate(entry) {
    const id = this.extId(entry);
    const rec = this.recFor(id);
    if (rec.state === "active" || rec.state === "activating") return;
    rec.state = "activating";
    rec.activationError = null;
    this.broadcast({ type: "ext-activation", id, state: "activating" });
    try {
      await this.sendReq("system", "activate", { id });
    } catch (err) {
      rec.state = "failed";
      rec.activationError = (err && err.message) || String(err);
      this.broadcast({ type: "ext-activation", id, state: "failed", error: rec.activationError });
    }
  }

  scheduleAutoDeactivate(id) {
    clearTimeout(this.deactivateTimers.get(id));
    const rec = this.recFor(id);
    const timer = setTimeout(() => {
      this.deactivateTimers.delete(id);
      if (rec.state !== "active") return;
      if (this.extensionBusy(id)) { this.scheduleAutoDeactivate(id); return; }
      rec.state = "deactivating";
      this.sendReq("system", "deactivate", { id })
        .then(() => {
          rec.state = "deactivated";
          this.broadcast({ type: "ext-deactivated", id });
        })
        .catch(() => {
          if (rec.state === "deactivating") rec.state = "active";
        });
    }, AUTO_DEACTIVATE_MS);
    this.deactivateTimers.set(id, timer);
  }

  extensionBusy(id) {
    for (const [, p] of this.providers) if (p.extKey === id) return true;
    for (const [, extKey] of this.commands) if (extKey === id) return true;
    return false;
  }

  // ── Public API (renderer + index.js wiring) ────────────────────────────────
  enabledEntries() {
    return (this.readVsxMeta() || []).filter((e) => e && e.enabled && e.hasMain && e.manifest && e.dir && fs.existsSync(e.dir));
  }

  findEntryById(id) {
    for (const e of this.readVsxMeta() || []) {
      if (this.extId(e) === id) return e;
    }
    return null;
  }

  extId(e) {
    return `${String(e.publisher || "").toLowerCase()}.${String(e.name || "").toLowerCase()}`;
  }

  recFor(id) {
    let r = this.records.get(id);
    if (!r) {
      r = { id, state: "inactive", activationError: null, enginesNote: null, activatedAt: null, lastActivity: 0 };
      this.records.set(id, r);
    }
    return r;
  }

  enginesNoteFor(entry) {
    const req = entry.engines && entry.engines.vscode;
    if (!req) return null;
    const trimmed = String(req).trim();
    if (!trimmed || /^[*x]$/i.test(trimmed)) return null;
    const m = trimmed.match(/(?:>=|>|<=|<|\^|~)?\s*v?(\d+)\.(\d+)/);
    if (!m) return `engines.vscode ${req} (unparsable range)`;
    const major = parseInt(m[1], 10);
    const minor = parseInt(m[2], 10);
    if (major > this.compatVersion[0] || (major === this.compatVersion[0] && minor > this.compatVersion[1])) {
      return `Requires VS Code ${major}.${minor}+; this editor provides ~${this.compatVersion.join(".")}. Activation is not blocked.`;
    }
    return null;
  }

  // Open documents tracked by the extension host (for re-serving after an
  // extension is re-enabled while files stay open in the editor).
  getOpenDocs() {
    return [...this.docs.values()].map(({ path, languageId, text }) => ({ path, languageId, text }));
  }

  toggle(entry) {
    if (!entry) return;
    if (entry.enabled) {
      const rec = this.recFor(this.extId(entry));
      rec.enginesNote = this.enginesNoteFor(entry);
      const list = this.enabledEntries().map((e) => ({ id: this.extId(e), dir: e.dir, packageJSON: e.manifest }));
      this.sendNotify("system", "extensionsChanged", { extensions: list });
      this.queueActivation(entry);
    } else {
      this.unload(entry);
    }
  }

  unload(entry) {
    const id = this.extId(entry);
    clearTimeout(this.deactivateTimers.get(id));
    this.deactivateTimers.delete(id);
    this.sendNotify("system", "unload", { id });
    // Tear down every Monaco provider registered by this extension and drop
    // its published diagnostics, otherwise they outlive the unload.
    for (const [pid, p] of this.providers) {
      if (p.extKey === id) {
        this.broadcast({ type: "provider", action: "dispose", id: pid });
        this.providers.delete(pid);
      }
    }
    for (const owner of [...this.diagOwners]) {
      if (owner.startsWith(`${id}|`)) {
        this.diagOwners.delete(owner);
        this.broadcast({ type: "diagnostics", owner, clear: true });
      }
    }
    for (const [cid, extKey] of this.commands) {
      if (extKey === id) {
        this.broadcast({ type: "command", action: "unregister", id: cid });
        this.commands.delete(cid);
      }
    }
    for (const [key, ch] of this.channels) if (ch.extKey === id) this.channels.delete(key);
    for (const [pid, rec] of this.webviewPanels) {
      if (rec.extKey === id) {
        this.webviewPanels.delete(pid);
        this.broadcast({ type: "webview", action: "dispose", panelId: pid });
      }
    }
    for (const [vt, rec] of this.webviewViews) {
      if (rec.extKey === id) {
        this.webviewViews.delete(vt);
        this.broadcast({ type: "webview", action: "registerViewDispose", viewType: vt });
      }
    }
    for (const [vid, rec] of this.treeViews) {
      if (rec.extKey === id) {
        this.treeViews.delete(vid);
        this.broadcast({ type: "treeview", action: "dispose", viewId: vid });
      }
    }
    for (const [sid, rec] of this.statusItems) {
      if (rec.extKey === id) {
        this.statusItems.delete(sid);
        this.broadcast({ type: "statusbar", item: { id: sid, disposed: true } });
      }
    }
    const rec = this.records.get(id);
    if (rec) { rec.state = "inactive"; rec.activationError = null; }
    this.broadcast({ type: "ext-deactivated", id, unloaded: true });
  }

  updateWorkspaceFolder(folder) {
    const folders = folder ? [{ index: 0, name: path.basename(folder), path: folder }] : [];
    this.sendNotify("system", "workspaceFolders", { folders });
  }

  pushConfig() {
    const cfg = { ...(this.getSettings() || {}), ...this.configOverrides };
    this.sendNotify("system", "configChanged", { config: cfg });
    this.broadcast({ type: "config", config: cfg });
  }

  overlayEntries(entries) {
    return (entries || []).map((e) => {
      const rec = this.records.get(this.extId(e));
      if (!rec || rec.state === "inactive") return { ...e, host: null };
      return {
        ...e,
        host: {
          state: rec.state,
          activationError: rec.activationError,
          enginesNote: rec.enginesNote,
          activatedAt: rec.activatedAt,
        },
      };
    });
  }

  async execCommand(id, args) {
    try {
      const r = await this.handleHostRequest("commands", "execute", { id, args: args || [] });
      return { success: true, result: r };
    } catch (err) {
      return { success: false, error: (err && err.message) || String(err), code: err && err.code };
    }
  }

  getState() {
    return {
      running: this.running,
      records: [...this.records.values()],
      commands: [...this.commands.keys()],
      channels: [...this.channels.keys()].map((key) => {
        const ch = this.channels.get(key);
        return { key, name: ch.name, extKey: ch.extKey, count: ch.lines.length };
      }),
      webviewPanels: [...this.webviewPanels.values()].map((p) => ({ panelId: p.panelId, extKey: p.extKey, viewType: p.viewType, title: p.title })),
      webviewViews: [...this.webviewViews.values()].map((v) => ({ viewType: v.viewType, extKey: v.extKey })),
      treeViews: [...this.treeViews.values()].map((v) => ({ viewId: v.viewId, extKey: v.extKey, title: v.title, created: v.created })),
      statusItems: [...this.statusItems.values()],
    };
  }

  getOutput(key) {
    const ch = this.channels.get(key);
    return ch ? ch.lines : [];
  }

  // ── Small helpers ──────────────────────────────────────────────────────────
  channelAppend(key, extKey, name, text) {
    let ch = this.channels.get(key);
    if (!ch) { ch = { key, extKey, name, lines: [], seq: 0 }; this.channels.set(key, ch); }
    for (const line of String(text).split("\n")) {
      ch.lines.push({ seq: ++ch.seq, text: line });
      this.consoleRing.push({ t: Date.now(), channel: name, text: line });
    }
    if (ch.lines.length > CHANNEL_CAP) ch.lines.splice(0, ch.lines.length - CHANNEL_CAP);
    if (this.consoleRing.length > CONSOLE_RING_CAP) this.consoleRing.splice(0, this.consoleRing.length - CONSOLE_RING_CAP);
    this.broadcast({ type: "output", key, name, extKey, text });
  }

  channelClear(key) {
    const ch = this.channels.get(key);
    if (ch) ch.lines = [];
    this.broadcast({ type: "output", key, clear: true });
  }

  languageList() {
    const set = new Set(BUILTIN_LANGUAGES);
    for (const e of this.readVsxMeta() || []) {
      for (const l of e.languages || []) set.add(l);
    }
    return [...set];
  }

  guessLanguage(p) {
    const base = path.basename(String(p || "")).toLowerCase();
    if (base === "dockerfile") return "dockerfile";
    return LANG_EXT_MAP[path.extname(base)] || "plaintext";
  }

  pathToUri(p) {
    let s = String(p || "").replace(/\\/g, "/");
    s = s.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\?/g, "%3F").replace(/ /g, "%20");
    if (!s.startsWith("/")) s = "/" + s;
    return "file://" + s;
  }

  uriString(u) {
    if (!u) return "";
    if (typeof u === "string") return u;
    let s = `${u.scheme || "file"}:`;
    if (u.authority) s += `//${u.authority}`;
    s += u.path || "";
    if (u.query) s += `?${u.query}`;
    if (u.fragment) s += `#${u.fragment}`;
    return s;
  }

  uriToPath(u) {
    if (!u) return null;
    let scheme = "file", p = "";
    if (typeof u === "string") {
      const m = u.match(/^([a-z][a-z0-9+.-]*):(?:\/\/([^/?#]*))?([^?#]*)/i);
      if (m) { scheme = m[1].toLowerCase(); p = m[3] || ""; }
    } else {
      scheme = (u.scheme || "file").toLowerCase();
      p = u.path || "";
    }
    if (scheme !== "file") return null;
    let out = p;
    try { out = decodeURIComponent(out); } catch {}
    if (process.platform === "win32") {
      out = out.replace(/\//g, "\\");
      if (out.startsWith("\\") && /^[A-Za-z]:/.test(out.slice(1))) out = out.slice(1);
    }
    return out;
  }

  flattenWorkspaceEdit(edit) {
    const out = [];
    for (const [uri, edits] of Object.entries((edit && edit.changes) || {})) {
      for (const e of edits || []) out.push({ uri, range: e.range, text: e.newText });
    }
    for (const dc of (edit && edit.documentChanges) || []) {
      const uri = dc.textDocument && dc.textDocument.uri;
      if (!uri) continue;
      for (const e of dc.edits || []) out.push({ uri, range: e.range, text: e.newText });
    }
    return out;
  }
}

function registerExtHost({ ipcMain, readVsxMeta, getActiveFolder, getSettings, broadcast, compatVersion, onDocSaved }) {
  const manager = new ExtHostManager({ readVsxMeta, getActiveFolder, getSettings, broadcast, compatVersion, onDocSaved });
  manager.start();

  ipcMain.handle("extHost:state", () => manager.getState());
  ipcMain.handle("extHost:commands", () => [...manager.commands.keys()]);
  ipcMain.handle("extHost:runCommand", (_e, { id, args }) => manager.execCommand(id, args));
  ipcMain.handle("extHost:output", (_e, { key }) => manager.getOutput(key));
  ipcMain.handle("extHost:providerRequest", (_e, { providerId, method, args }) => {
    return manager.sendReq("system", "invokeProvider", { providerId, method, args }).catch((err) => {
      throw err;
    });
  });

  return manager;
}

module.exports = { registerExtHost, ExtHostManager };
