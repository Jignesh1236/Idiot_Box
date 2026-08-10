// Extension host — runs inside a Node utilityProcess forked by the main
// process. Installed extensions' `activate()` / `deactivate()` code executes
// HERE (in Node), not in the renderer. The `vscode` module they require is the
// shim (vscode-shim.cjs); everything that needs the editor app crosses the
// process boundary over parentPort as JSON messages:
//
//   host -> main : { t:"req", id, ns, m, a }   (expects { t:"resp", id, ok, r })
//                  { t:"notify", ns, m, a }    (fire & forget)
//   main -> host : same envelope with ns:"system" for host-internal commands
//                  (boot, activate, deactivate, unload, invokeProvider,
//                  execCommand, docEvent, configChanged, workspaceFolders,
//                  fsWatcher, extensionsChanged, dispose)
"use strict";

const path = require("path");
const fs = require("fs");
const Module = require("module");
const parentPort = process.parentPort;

// ── Console forwarding (utility-process stderr is not reliably inherited) ────
const consoleFmt = (v) => {
  if (v instanceof Error) return (v.stack || v.message || String(v));
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};
for (const m of ["log", "info", "warn", "error"]) {
  const orig = console[m];
  console[m] = (...args) => {
    try { orig(...args); } catch {}
    try { rpcNotify("console", m, { text: args.map(consoleFmt).join(" ") }); } catch {}
  };
}
const { hostApi, getVscodeApi } = require("./vscode-shim.cjs");

// ── Transport ────────────────────────────────────────────────────────────────
const pending = new Map(); // id -> { resolve, reject }
let seq = 0;

const post = (obj) => {
  try { parentPort.postMessage(obj); } catch { /* host is going away */ }
};

const rpc = (ns, m, a) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    post({ t: "req", id, ns, m, a });
  });

const rpcNotify = (ns, m, a) => post({ t: "notify", ns, m, a });

hostApi.setRpc(rpc);
hostApi.setRpcNotify(rpcNotify);

// ── 'vscode' module interception ─────────────────────────────────────────────
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "vscode") return getVscodeApi();
  return origLoad.apply(this, arguments);
};

// ── Extension state ──────────────────────────────────────────────────────────
// states: "inactive" | "activating" | "active" | "failed" | "deactivated"
const states = new Map(); // id -> { rec, state, promise, exports, error }

function resolveMainEntry(extDir, main) {
  const p = path.join(extDir, String(main || ""));
  if (fs.existsSync(p)) return p;
  const withJs = p + ".js";
  return fs.existsSync(withJs) ? withJs : p;
}

function syncRecordsFrom(list) {
  states.clear();
  for (const e of list || []) {
    states.set(e.id, {
      rec: { id: e.id, dir: e.dir, packageJSON: e.packageJSON, isActive: false, exports: undefined },
      state: "inactive",
      promise: null,
      exports: undefined,
      error: null,
    });
  }
  hostApi.syncExtensionRecords(list || []);
}

function pushRecords() {
  hostApi.syncExtensionRecords([...states.values()].map((s) => s.rec));
}

function doActivate(st) {
  const rec = st.rec;
  st.state = "activating";
  st.error = null;
  hostApi.setCurrentActivatingExtKey(rec.id);
  const run = Promise.resolve().then(() => {
    const entryPath = resolveMainEntry(rec.dir, rec.packageJSON && rec.packageJSON.main);
    if (!entryPath || !fs.existsSync(entryPath)) {
      throw new Error(`Activation entry "${rec.packageJSON && rec.packageJSON.main}" not found`);
    }
    const loaded = require(entryPath);
    const activateFn = typeof loaded === "function" ? loaded : loaded && loaded.activate;
    if (typeof activateFn !== "function") {
      throw new Error("Extension does not export an activate() function");
    }
    return activateFn.call(loaded, hostApi.createExtensionContext(rec.id, rec.dir, rec.packageJSON), getVscodeApi());
  });
  let timer = null;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(
      () => rej(Object.assign(new Error("Activation timed out after 60s"), { code: "ACTIVATE_TIMEOUT" })),
      60000
    );
  });
  const p = Promise.race([run, timeout]).finally(() => clearTimeout(timer));
  st.promise = p;
  return p.then(
    (exports) => {
      st.state = "active";
      st.exports = exports === undefined ? {} : exports;
      st.rec.isActive = true;
      st.rec.exports = st.exports;
      st.promise = null;
      pushRecords();
      flushPendingDocEvents();
      rpcNotify("extensions", "activated", { id: rec.id });
      return st.exports;
    },
    (err) => {
      st.state = "failed";
      console.error("[extHost] activation failed:", err && err.stack ? err.stack : err);
      st.error = ((err && err.stack) || (err && err.message) || String(err)).split("\n").slice(0, 4).join(" | ");
      st.rec.isActive = false;
      st.promise = null;
      pushRecords();
      rpcNotify("extensions", "activationFailed", { id: rec.id, error: st.error });
      throw err;
    }
  );
}

function activate(id) {
  const st = states.get(id);
  if (!st) return Promise.resolve(undefined);
  if (st.state === "active") return Promise.resolve(st.exports);
  if (st.state === "activating" && st.promise) return st.promise;
  if (st.state === "failed" && !st.promise) return doActivate(st); // retry allowed
  return doActivate(st);
}

function deactivate(id) {
  const st = states.get(id);
  if (!st || st.state !== "active") return;
  const exports = st.exports;
  st.state = "deactivated";
  st.rec.isActive = false;
  st.exports = undefined;
  if (exports && typeof exports.deactivate === "function") {
    try { exports.deactivate(); } catch (err) { console.error("[extHost] deactivate error:", err); }
  }
  pushRecords();
  rpcNotify("extensions", "deactivated", { id });
}

function unload(id) {
  const st = states.get(id);
  if (!st) return;
  deactivate(id);
  const entryPath = resolveMainEntry(st.rec.dir, st.rec.packageJSON && st.rec.packageJSON.main);
  states.delete(id);
  if (entryPath) {
    try { delete require.cache[require.resolve(entryPath)]; } catch {}
  }
  for (const [pid] of hostApi.providers) {
    if (pid.startsWith(`prov-${id}-`)) hostApi.providers.delete(pid);
  }
  for (const [cid] of hostApi.commandHandlers) {
    if (cid.startsWith(`${id}.`)) { hostApi.commandHandlers.delete(cid); hostApi.commandThis.delete(cid); }
  }
  for (const [key] of hostApi.diagCollections) {
    if (key.startsWith(`${id}|`)) hostApi.diagCollections.delete(key);
  }
  hostApi.purgeExtension(id);
  pushRecords();
}

// ── Provider / command invocation ────────────────────────────────────────────
const api = () => getVscodeApi();

function docFacade(d) {
  const uriStr = d && d.uri ? String(d.uri) : "";
  const u = api().Uri.parse(uriStr);
  const key = u.toString();
  const f = hostApi.getFacade(key);
  const text = d && d.text !== undefined ? String(d.text) : f ? f.getText() : "";
  if (f && d && d.text === undefined) return f;
  return new (api().TextDocument)({
    uri: key,
    languageId: (d && d.languageId) || (f ? f.languageId : "plaintext"),
    text,
    version: (d && d.version) || (f ? f.version : 1),
  });
}

const toRangeArg = (p) => new (api().Range)(new (api().Position)(p.start.line, p.start.character), new (api().Position)(p.end.line, p.end.character));

const providerArgs = {
  completion: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken, p.context ? hostApi.toVscode(p.context) : undefined],
  hover: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  definition: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  typeDefinition: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  implementation: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  references: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), p.context ? hostApi.toVscode(p.context) : undefined],
  documentSymbol: (p) => [docFacade(p.document), api().CancellationToken],
  workspaceSymbol: (p) => [p.query || "", api().CancellationToken],
  signatureHelp: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken, p.context ? hostApi.toVscode(p.context) : undefined],
  rename: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), p.newName],
  prepareRename: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  formatting: (p) => [docFacade(p.document), p.options ? hostApi.toVscode(p.options) : undefined, api().CancellationToken],
  rangeFormatting: (p) => [docFacade(p.document), toRangeArg(p), p.options ? hostApi.toVscode(p.options) : undefined, api().CancellationToken],
  codeAction: (p) => [docFacade(p.document), toRangeArg(p), p.context ? hostApi.toVscode(p.context) : undefined, api().CancellationToken],
  codeLens: (p) => [docFacade(p.document), api().CancellationToken],
  documentHighlight: (p) => [docFacade(p.document), new (api().Position)(p.position.line, p.position.character), api().CancellationToken],
  documentLink: (p) => [docFacade(p.document), api().CancellationToken],
};

function invokeProvider(providerId, method, args) {
  const entry = hostApi.providers.get(providerId);
  if (!entry) throw Object.assign(new Error(`Provider ${providerId} not found`), { code: "NOT_FOUND" });
  const provider = entry.provider;
  const fn = provider[method];
  if (typeof fn !== "function") throw Object.assign(new Error(`Provider ${providerId} has no ${method}()`), { code: "NOT_FOUND" });
  const kind = entry.kind;
  const build = providerArgs[kind];
  const params = hostApi.toVscode(args || {});
  const callArgs = build ? build(params) : [params];
  return Promise.resolve(fn.apply(provider, callArgs)).then((result) => hostApi.toPlain(result));
}

function execCommand(id, args) {
  const handler = hostApi.commandHandlers.get(id);
  if (typeof handler !== "function") {
    throw Object.assign(new Error(`Command '${id}' is not registered by any extension`), { code: "NOT_FOUND" });
  }
  const thisArg = hostApi.commandThis.get(id);
  const converted = hostApi.toVscode(Array.isArray(args) ? args : []);
  return Promise.resolve(handler.apply(thisArg, converted)).then((r) => hostApi.toPlain(r));
}

// ── Document events from main ────────────────────────────────────────────────
// Doc events for a language with a pending onLanguage activation are recorded
// without firing; when that extension finishes activating the events are
// replayed in order (open, then changes/saves), so the extension's own
// onDidOpenTextDocument/onDidChangeTextDocument/onDidSaveTextDocument
// listeners still see them (VS Code style event replay).
const pendingDocEvents = [];

function languageAwaitingActivation(lang) {
  return [...states.values()].some((s) => {
    if (s.state === "active") return false;
    const evts = (s.rec.packageJSON && s.rec.packageJSON.activationEvents) || [];
    return evts.some((ev) => ev === "*" || ev === "onLanguage:" + lang || ev.startsWith("workspaceContains:"));
  });
}

function handleDocOpen(a) {
  const msg = { uri: a.uri, languageId: a.languageId, text: a.text, version: a.version, closed: false };
  if (languageAwaitingActivation(a.languageId || "plaintext")) {
    hostApi.updateDocument(msg, { suppressFire: true });
    pendingDocEvents.push({ op: "open", msg });
  } else {
    hostApi.updateDocument(msg);
  }
}

function docEvent(a) {
  if (a.kind === "save") {
    if (languageAwaitingActivation(a.languageId || "plaintext")) {
      pendingDocEvents.push({ op: "save", uri: a.uri, languageId: a.languageId });
    } else {
      hostApi.fireSave(a.uri, a.languageId);
    }
  } else if (a.kind === "close" || a.closed) {
    hostApi.updateDocument({ uri: a.uri, languageId: a.languageId, text: "", version: a.version, closed: true });
  } else if (a.kind === "change") {
    const msg = { uri: a.uri, languageId: a.languageId, text: a.text, version: a.version, closed: false };
    if (languageAwaitingActivation(a.languageId || "plaintext")) {
      hostApi.updateDocument(msg, { suppressFire: true });
      pendingDocEvents.push({ op: "open", msg });
    } else {
      hostApi.updateDocument(msg);
    }
  } else {
    handleDocOpen(a);
  }
  return { ok: true };
}

function flushPendingDocEvents() {
  if (!pendingDocEvents.length) return;
  const batch = pendingDocEvents.splice(0);
  for (const ev of batch) {
    if (ev.op === "save") hostApi.fireSave(ev.uri, ev.languageId);
    else hostApi.updateDocument(ev.msg);
  }
}

// ── System commands (main -> host) ───────────────────────────────────────────
const systemHandlers = {
  boot(a) {
    hostApi.setBootEnv(a.env || {});
    hostApi.setConfig(a.config || {});
    syncRecordsFrom(a.extensions);
    hostApi.syncWorkspaceFolders(a.folders || []);
    for (const d of a.docs || []) {
      handleDocOpen({ uri: d.uri, languageId: d.languageId, text: d.text, version: d.version });
    }
    rpcNotify("extensions", "booted", { ok: true });
    return { ok: true };
  },
  activate(a) {
    return activate(a.id).then(() => ({ ok: true }));
  },
  deactivate(a) {
    deactivate(a.id);
    return { ok: true };
  },
  unload(a) {
    unload(a.id);
    return { ok: true };
  },
  invokeProvider(a) {
    return invokeProvider(a.providerId, a.method, a.args);
  },
  execCommand(a) {
    return execCommand(a.id, a.args);
  },
  docEvent,
  configChanged(a) {
    hostApi.setConfig(a.config || {});
    hostApi.fireConfigChanged();
    return { ok: true };
  },
  workspaceFolders(a) {
    hostApi.syncWorkspaceFolders(a.folders || []);
    return { ok: true };
  },
  fsWatcher(a) {
    hostApi.fireFsWatcher(a);
    return { ok: true };
  },
  webviewEvent(a) {
    hostApi.fireWebviewEvent(a);
    return { ok: true };
  },
  webviewResolve(a) {
    return hostApi.resolveWebviewView(a.viewType, a.panelId).then(() => ({ ok: true }));
  },
  treeChildren(a) {
    return hostApi.getTreeChildren(a.viewId, a.element);
  },
  treeReveal(a) {
    return hostApi.treeReveal(a.viewId, a.element, a.options);
  },
  treeChange(a) {
    hostApi.fireTreeChange(a.viewId);
    return { ok: true };
  },
  treeEvent(a) {
    hostApi.fireTreeEvent(a);
    return { ok: true };
  },
  extensionsChanged(a) {
    syncRecordsFrom(a.extensions);
    return { ok: true };
  },
  dispose() {
    try { process.exit(0); } catch {}
    return { ok: true };
  },
};

// ── Message dispatch ─────────────────────────────────────────────────────────
function dispatchSystem(cmd, a) {
  const fn = systemHandlers[cmd];
  if (!fn) throw new Error(`Unknown system command: ${cmd}`);
  return fn(a || {});
}

function handle(msg) {
  if (!msg || typeof msg !== "object") return;
  if (msg.t === "req") {
    const id = msg.id;
    Promise.resolve()
      .then(() => (msg.ns === "system" ? dispatchSystem(msg.m, msg.a) : dispatchSystem(msg.m, msg.a)))
      .then((r) => post({ t: "resp", id, ok: true, r: r === undefined ? null : r }))
      .catch((err) => post({
        t: "resp", id, ok: false,
        e: { message: (err && err.message) || String(err), code: err && err.code },
      }));
  } else if (msg.t === "notify") {
    try { dispatchSystem(msg.m, msg.a); } catch (err) { console.error("[extHost] notify error:", err); }
  } else if (msg.t === "resp") {
    const p = pending.get(msg.id);
    if (p) {
      pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.r);
      else p.reject(Object.assign(new Error((msg.e && msg.e.message) || "RPC error"), { code: msg.e && msg.e.code }));
    }
  }
}

parentPort.on("message", (e) => handle(e && e.data));
parentPort.on("disconnect", () => { try { process.exit(0); } catch {} });

process.on("uncaughtException", (err) => { try { console.error("[extHost] uncaughtException:", err); } catch {} });
process.on("unhandledRejection", (err) => { try { console.error("[extHost] unhandledRejection:", err); } catch {} });

rpcNotify("extensions", "hostReady", { pid: process.pid });

