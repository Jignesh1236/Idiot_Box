// Extension UI panels registry — the renderer-side state for webview panels,
// webview views and tree views opened by installed extensions.
//
// The extension host shim reports webview/treeview activity to the main
// process, which broadcasts it here via the "extHost:event" channel. This
// module keeps the canonical panel registry, opens/closes FlexLayout tabs
// for each panel and re-dispatches events to the ExtPanel components.
import { Actions, DockLocation } from "flexlayout-react";

// panelId -> { kind: "webview" | "webviewView" | "tree", panelId, extKey, viewType, title, html, visible }
export const panels = new Map();

// "wv:<viewType>" | "t:<viewId>" -> { kind, viewType|viewId, extKey, title, created }
export const viewRegistry = new Map();

const getModel = () => window.__flexModel && window.__flexModel.current;

const findTabsetWith = (node, component) => {
  if (node.getType?.() === "tabset") {
    const kids = node.getChildren?.() || [];
    if (kids.some((c) => c.getType() === "tab" && c.getComponent() === component)) return node;
  }
  const kids = node.getChildren?.() || [];
  for (const c of kids) { const r = findTabsetWith(c, component); if (r) return r; }
  return null;
};

const findTabByPanelId = (node, panelId) => {
  if (node.getType?.() === "tab" && node.getConfig?.()?.panelId === panelId) return node;
  const kids = node.getChildren?.() || [];
  for (const c of kids) { const r = findTabByPanelId(c, panelId); if (r) return r; }
  return null;
};

const safeModel = () => {
  try { return getModel(); } catch { return null; }
};

// Open (or select) a FlexLayout tab hosting the panel.
const openPanel = (panelId, rec) => {
  const m = safeModel();
  if (!m) return;
  const existing = findTabByPanelId(m.getRoot(), panelId);
  if (existing) {
    m.doAction(Actions.selectTab(existing.getId()));
    return;
  }
  let parentId = null;
  if (rec.kind === "webview" || rec.kind === "webviewView") {
    const editorTs = m.getNodeById("editor-tabset") || findTabsetWith(m.getRoot(), "editor");
    if (editorTs) parentId = editorTs.getId();
  } else {
    const sideTs = findTabsetWith(m.getRoot(), "terminal");
    if (sideTs) parentId = sideTs.getId();
  }
  if (!parentId) {
    try { parentId = m.getActiveTabset().getId(); } catch { parentId = null; }
  }
  if (!parentId) parentId = m.getRoot().getId();
  m.doAction(Actions.addNode({
    type: "tab",
    component: "extPanel",
    name: rec.title || rec.viewType || "Extension View",
    enableClose: true,
    id: `ext-panel-${panelId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    config: { panelId },
  }, parentId, DockLocation.CENTER, -1, true));
};

const closePanel = (panelId) => {
  const m = safeModel();
  if (!m) return;
  const tab = findTabByPanelId(m.getRoot(), panelId);
  if (tab) { try { m.doAction(Actions.deleteTab(tab.getId())); } catch {} }
};

export const selectPanel = (panelId) => {
  const m = safeModel();
  if (!m) return;
  const tab = findTabByPanelId(m.getRoot(), panelId);
  if (tab) m.doAction(Actions.selectTab(tab.getId()));
};

// Open a registered view ("wv:<viewType>" | "t:<viewId>").
export const openView = (key) => {
  const v = viewRegistry.get(key);
  if (!v) return;
  if (v.kind === "tree") {
    panels.set(v.viewId, { kind: "tree", panelId: v.viewId, viewId: v.viewId, extKey: v.extKey, title: v.title, refresh: 0 });
    openPanel(v.viewId, panels.get(v.viewId));
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: { action: "create", viewId: v.viewId } }));
    return;
  }
  if (v.kind === "webviewView") {
    const panelId = `${v.viewType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    panels.set(panelId, { kind: "webviewView", panelId, extKey: v.extKey, viewType: v.viewType, title: v.title, html: "" });
    openPanel(panelId, panels.get(panelId));
    window.electronAPI.extWebviewResolve(v.viewType, panelId).catch(() => {});
  }
};

const handleWebview = (ev) => {
  if (ev.action === "create") {
    const p = ev.panel || {};
    panels.set(p.panelId, { kind: "webview", panelId: p.panelId, extKey: p.extKey, viewType: p.viewType, title: p.title, html: "" });
    openPanel(p.panelId, panels.get(p.panelId));
  } else if (ev.action === "html") {
    const rec = panels.get(ev.panelId);
    if (rec) { rec.html = ev.html || ""; }
    window.dispatchEvent(new CustomEvent("ext-webview", { detail: ev }));
  } else if (ev.action === "message") {
    window.dispatchEvent(new CustomEvent("ext-webview", { detail: ev }));
  } else if (ev.action === "reveal") {
    selectPanel(ev.panelId);
    window.dispatchEvent(new CustomEvent("ext-webview", { detail: ev }));
  } else if (ev.action === "dispose") {
    const rec = panels.get(ev.panelId);
    if (rec && rec.kind === "webviewView" && rec.viewType) {
      viewRegistry.delete(`wv:${rec.viewType}`);
      window.dispatchEvent(new CustomEvent("ext-views-changed"));
    }
    panels.delete(ev.panelId);
    closePanel(ev.panelId);
    window.dispatchEvent(new CustomEvent("ext-webview", { detail: ev }));
  } else if (ev.action === "registerView") {
    viewRegistry.set(`wv:${ev.viewType}`, { kind: "webviewView", viewType: ev.viewType, extKey: ev.extKey, title: ev.viewType });
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
  } else if (ev.action === "registerViewDispose") {
    viewRegistry.delete(`wv:${ev.viewType}`);
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
  }
};

const handleTreeview = (ev) => {
  if (ev.action === "register") {
    viewRegistry.set(`t:${ev.viewId}`, { kind: "tree", viewId: ev.viewId, extKey: ev.extKey, title: ev.viewId, created: false });
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
  } else if (ev.action === "unregister") {
    viewRegistry.delete(`t:${ev.viewId}`);
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
  } else if (ev.action === "create") {
    viewRegistry.set(`t:${ev.viewId}`, { kind: "tree", viewId: ev.viewId, extKey: ev.extKey, title: ev.title || ev.viewId, created: true });
    panels.set(ev.viewId, { kind: "tree", panelId: ev.viewId, viewId: ev.viewId, extKey: ev.extKey, title: ev.title || ev.viewId, refresh: 0 });
    openPanel(ev.viewId, panels.get(ev.viewId));
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: { action: "create", viewId: ev.viewId } }));
  } else if (ev.action === "changed") {
    const rec = panels.get(ev.viewId);
    if (rec) rec.refresh = (rec.refresh || 0) + 1;
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: ev }));
  } else if (ev.action === "reveal") {
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: ev }));
  } else if (ev.action === "dispose") {
    viewRegistry.delete(`t:${ev.viewId}`);
    panels.delete(ev.viewId);
    closePanel(ev.viewId);
    window.dispatchEvent(new CustomEvent("ext-views-changed"));
    window.dispatchEvent(new CustomEvent("ext-treeview", { detail: ev }));
  }
};

// Route one "extHost:event" payload into the panel system.
export const handleExtEvent = (ev) => {
  if (!ev || !ev.type) return;
  if (ev.type === "webview") handleWebview(ev);
  else if (ev.type === "treeview") handleTreeview(ev);
};
