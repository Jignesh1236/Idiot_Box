// ExtPanel — dockable FlexLayout panel hosting extension UI:
//   - kind "webview" / "webviewView": a secure <webview> running the
//     extension's html with a minimal vscode webview bridge (no node access)
//   - kind "tree": a TreeView rendered from the extension's TreeDataProvider
//
// Panels are opened by ext-panels.js (registry) when the extension creates
// them; content/state flows over the "ext-webview" / "ext-treeview" events.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { panels } from "../../ext-panels.js";

// ── CSP + data-URL helpers ───────────────────────────────────────────────────
const DEFAULT_CSP =
  "default-src 'none'; img-src extweb: data:; style-src 'unsafe-inline' extweb:; " +
  "font-src extweb: data:; script-src 'unsafe-inline' extweb:; " +
  "connect-src extweb: http: https: ws: wss:";

const injectCsp = (html) => {
  let out = String(html || "");
  if (!/content-security-policy/i.test(out)) {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${DEFAULT_CSP}">`;
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${meta}`);
    if (out === String(html || "") && !/<head/i.test(out)) out = `<head>${meta}</head>\n${out}`;
  }
  out = out.replace(/%CSP%/g, DEFAULT_CSP);
  return out;
};

const htmlDataUrl = (html) => "data:text/html;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(injectCsp(html))));

const uriToStr = (u) => {
  if (!u || typeof u !== "object") return String(u || "");
  let s = `${u.scheme || "file"}:`;
  if (u.authority) s += `//${u.authority}`;
  s += u.path || "";
  if (u.query) s += `?${u.query}`;
  if (u.fragment) s += `#${u.fragment}`;
  return s;
};

// ── TreeView ─────────────────────────────────────────────────────────────────
const FOLDER_SVG = "M1.5 2h4.1l1.2 1.5h7.7A1.5 1.5 0 0 1 16 5v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-10A1.5 1.5 0 0 1 1.5 2Z";
const FILE_SVG = "M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5.5L9.5 0H4Zm5.5 1.5v3A1.5 1.5 0 0 0 11 6h3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5Z";

const elemKey = (el) => (el === null || el === undefined ? "__root__" : JSON.stringify(el));

const TreeList = ({ viewId }) => {
  const [rows, setRows] = useState(null); // [{ key, element, item, depth, expanded, children: [keys]|"loading" }]
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const rowsRef = useRef(new Map());
  const fetchingRef = useRef(new Map());

  const setRowsBoth = (fn) => {
    setRows((prev) => {
      const next = fn(prev);
      rowsRef.current = new Map(next.map((r) => [r.key, r]));
      return next;
    });
  };

  const loadLevel = useCallback(async (parentKey, depth, autoExpand) => {
    const parent = parentKey === "__root__" ? null : rowsRef.current.get(parentKey);
    const element = parent ? parent.element : null;
    if (fetchingRef.current.has(parentKey)) return;
    fetchingRef.current.set(parentKey, true);
    try {
      const res = await window.electronAPI.extTreeChildren(viewId, element);
      const items = res && res.success && Array.isArray(res.result) ? res.result : [];
      const next = [...rowsRef.current.values()];
      const childKeys = [];
      const childByItem = new Map();
      for (const it of items) {
        if (!it || it.label === undefined || it.label === null) continue;
        const key = `${parentKey}/#${childKeys.length}`;
        childKeys.push(key);
        childByItem.set(elemKey(it), key);
        next.push({ key, element: it, item: it, depth, expanded: it.collapsibleState === 2, children: it.collapsibleState > 0 ? [] : null });
      }
      if (parent) parent.children = childKeys;
      rowsRef.current = new Map(next.map((r) => [r.key, r]));
      setRows(next);
      if (autoExpand) {
        for (const it of items) {
          if (it.collapsibleState === 2) {
            const k = childByItem.get(elemKey(it));
            if (k) {
              const row = rowsRef.current.get(k);
              if (row) { row.expanded = true; loadLevel(k, depth + 1, true); }
            }
          }
        }
      }
    } catch (err) {
      setError((err && err.message) || String(err));
    } finally {
      fetchingRef.current.delete(parentKey);
    }
  }, [viewId]);

  const loadRoot = useCallback(() => {
    setError(null);
    loadLevel("__root__", 0, true);
  }, [loadLevel]);

  useEffect(() => { loadRoot(); }, [loadRoot]);

  const toggle = (row) => {
    if (!row.item || row.item.collapsibleState === 0) return;
    if (row.expanded) {
      setRowsBoth((prev) => {
        const map = new Map(prev.map((r) => [r.key, r]));
        const r = map.get(row.key);
        r.expanded = false;
        return prev.filter((x) => x.key !== row.key || !(x.depth > r.depth && x.key.startsWith(row.key)));
      });
      window.electronAPI.extTreeviewEvent("collapse", viewId, row.element).catch(() => {});
      return;
    }
    window.electronAPI.extTreeviewEvent("expand", viewId, row.element).catch(() => {});
    setRowsBoth((prev) => {
      const map = new Map(prev.map((r) => [r.key, r]));
      const r = map.get(row.key);
      r.expanded = true;
      return prev.map((x) => (x.key === row.key ? r : x));
    });
    loadLevel(row.key, row.depth + 1, false);
  };

  const onRowClick = (row) => {
    setSelected(row.key);
    if (row.item.command && row.item.command.id) {
      window.electronAPI.extHostRunCommand(row.item.command.id, row.item.command.arguments || []).catch(() => {});
    } else if (row.item.collapsibleState > 0) {
      toggle(row);
    }
  };

  // Refresh on "changed" / "create"; reveal-expand on "reveal"
  useEffect(() => {
    const onEv = (e) => {
      const d = e.detail || {};
      if (d.viewId !== viewId) return;
      if (d.action === "changed" || d.action === "create") loadRoot();
      else if (d.action === "reveal" && Array.isArray(d.ancestors) && d.ancestors.length) {
        (async () => {
          // Walk the ancestor chain root -> target, expanding as we go.
          for (const anc of d.ancestors) {
            const key = elemKey(anc);
            const existing = [...rowsRef.current.values()].find((r) => elemKey(r.element) === key);
            if (existing) {
              if (existing.item.collapsibleState > 0 && !existing.expanded) toggle(existing);
            } else {
              // Not loaded yet — expand every loaded parent level then reload.
              loadRoot();
              await new Promise((r) => setTimeout(r, 250));
            }
          }
          const last = d.ancestors[d.ancestors.length - 1];
          const k = elemKey(last);
          const found = [...rowsRef.current.values()].find((r) => elemKey(r.element) === k);
          if (found) setSelected(found.key);
        })();
      }
    };
    window.addEventListener("ext-treeview", onEv);
    return () => window.removeEventListener("ext-treeview", onEv);
  }, [viewId, loadRoot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return <div style={{ padding: 10, fontSize: 11.5, color: "#e8a0a0" }}>Tree view error: {error}</div>;
  }
  if (!rows) {
    return <div style={{ padding: 12, fontSize: 11.5, color: "#888" }}>Loading tree…</div>;
  }
  if (!rows.length) {
    return <div style={{ padding: 12, fontSize: 11.5, color: "#666" }}>(empty)</div>;
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#252526", padding: "4px 0" }}>
      {rows.map((row) => (
        <div
          key={row.key}
          onClick={() => onRowClick(row)}
          onDoubleClick={() => { if (row.item.collapsibleState > 0) toggle(row); }}
          style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer", height: 22,
            paddingLeft: 6 + row.depth * 14, fontSize: 12.5, color: "#cccccc",
            background: selected === row.key ? "#094771" : "transparent", whiteSpace: "nowrap",
          }}
          title={row.item.tooltip || row.item.description || row.item.label}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="#888" style={{ flexShrink: 0, transform: row.expanded ? "rotate(90deg)" : "none", visibility: row.item.collapsibleState > 0 ? "visible" : "hidden" }}>
            <path d="M6 4l5 4-5 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </svg>
          {row.item.iconPath && row.item.iconPath.$kind === "uri" ? (
            <img src={uriToStr(row.item.iconPath)} width={15} height={15} style={{ flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill={row.item.collapsibleState > 0 ? "#7c9fc7" : "#8a8a8a"} style={{ flexShrink: 0 }}>
              <path d={row.item.collapsibleState > 0 ? FOLDER_SVG : FILE_SVG} />
            </svg>
          )}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
            {row.item.label}
            {row.item.description ? <span style={{ color: "#777777", marginLeft: 8 }}>{row.item.description}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── ExtPanel ─────────────────────────────────────────────────────────────────
const ExtPanel = ({ config, nodeId }) => {
  const panelId = config && config.panelId;
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);
  const [preloadPath, setPreloadPath] = useState("");
  const webviewRef = useRef(null);
  const attachedRef = useRef(false);
  const goneRef = useRef(false);

  useEffect(() => {
    if (!panelId) return;
    const rec = panels.get(panelId);
    if (rec && rec.html) setHtml(rec.html);
    if (rec && rec.kind === "webviewView") {
      window.electronAPI.extWebviewResolve(rec.viewType, panelId).catch(() => {});
    }
    window.electronAPI.getWebviewPreloadPath().then(setPreloadPath).catch(() => {});
  }, [panelId]);

  useEffect(() => {
    if (!panelId) return;
    const onWebview = (e) => {
      const d = e.detail || {};
      if (d.panelId !== panelId) return;
      if (d.action === "html") setHtml(d.html || "");
      else if (d.action === "message") {
        try { webviewRef.current && webviewRef.current.send("vscode:webview:message", d.message); } catch {}
      } else if (d.action === "dispose") { goneRef.current = true; setHtml(null); }
    };
    const onError = (e) => {
      const d = e.detail || {};
      if (d && d.error) setError(d.error);
    };
    window.addEventListener("ext-webview", onWebview);
    window.addEventListener("ext-error", onError);
    return () => {
      window.removeEventListener("ext-webview", onWebview);
      window.removeEventListener("ext-error", onError);
    };
  }, [panelId]);

  const attachListenersRef = useRef(null);
  attachListenersRef.current = (wv) => {
    if (attachedRef.current) return;
    attachedRef.current = true;
    wv.addEventListener("did-attach", () => {
      window.electronAPI.extWebviewVisibility(panelId, true).catch(() => {});
    });
    wv.addEventListener("dom-ready", () => {
      window.electronAPI.extWebviewVisibility(panelId, true).catch(() => {});
    });
    wv.addEventListener("ipc-message", (e) => {
      if (e.channel === "vscode:webview:message") {
        window.electronAPI.extWebviewPost(panelId, e.args && e.args[0]).catch(() => {});
      }
    });
    wv.addEventListener("destroyed", () => {
      window.electronAPI.extWebviewVisibility(panelId, false).catch(() => {});
      if (!goneRef.current) window.electronAPI.extWebviewClosed(panelId).catch(() => {});
    });
  };

  const webviewRefCb = useCallback((el) => {
    if (el) { webviewRef.current = el; attachListenersRef.current(el); }
    else {
      attachedRef.current = false;
      if (webviewRef.current) {
        webviewRef.current = null;
        if (!goneRef.current) window.electronAPI.extWebviewClosed(panelId).catch(() => {});
      }
    }
  }, [panelId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (!goneRef.current) window.electronAPI.extWebviewClosed(panelId).catch(() => {});
    };
  }, [panelId]);

  const rec = panelId ? panels.get(panelId) : null;
  const kind = rec ? rec.kind : "webview";

  if (error) {
    return <div style={{ padding: 12, fontSize: 11.5, color: "#e8a0a0", whiteSpace: "pre-wrap" }}>{error}</div>;
  }

  if (kind === "tree") {
    return <TreeList viewId={panelId} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "#1e1e1e" }}>
      {!html ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#666", fontSize: 12 }}>
          Waiting for webview content…
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <webview
            ref={webviewRefCb}
            src={htmlDataUrl(html)}
            preload={preloadPath || undefined}
            webpreferences="contextIsolation=yes,nodeIntegration=no,sandbox=yes"
            style={{ position: "absolute", inset: 0, display: "flex" }}
          />
        </div>
      )}
    </div>
  );
};

export default ExtPanel;
