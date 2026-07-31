// Terminal Panel — custom multi-tab terminal with side tab bar
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const ACCENTS = [
  "#569cd6", "#ce9178", "#6a9955", "#dcdcaa",
  "#c586c0", "#d16969", "#4ec9b0", "#e5c07b",
  "#f44747", "#6796e6", "#89d185", "#cca700",
  "#b392f0", "#79b8ff", "#f97583", "#56b4e9",
];

// ─── Custom xterm CSS overrides (injected once) ────────────────────────────
const XTERM_CUSTOM_CSS = `
.xterm { height: 100%; padding: 0 !important; background: transparent !important; }
.xterm-viewport { scrollbar-width: thin; background: transparent !important; }
.xterm-viewport::-webkit-scrollbar { width: 6px; }
.xterm-viewport::-webkit-scrollbar-track { background: transparent; }
.xterm-viewport::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }
.xterm-viewport::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-hover); }
.xterm-cursor { outline: none !important; }
.xterm-cursor-block { background: var(--text-highlight) !important; opacity: 0.9; }
.xterm-cursor-blink { animation: xterm-cursor-blink 1s step-end infinite; }
@keyframes xterm-cursor-blink { 50% { opacity: 0; } }
.xterm-selection div { background: var(--selection) !important; opacity: 0.5; }
.xterm-rows { font-variant-ligatures: none; letter-spacing: 0.2px; }
.term-xterm { padding: 4px 6px; box-sizing: border-box; background: #1e1e1e; }
.term-xterm .xterm { pointer-events: auto; }
.term-xterm .xterm-viewport { pointer-events: auto; }
.xterm-screen { background: transparent !important; }
`;

// ─── Terminal panel CSS ═══════════════════════════════════════════════════
const TERMINAL_PANEL_CSS = `
.term-panel { display:flex; flex-direction:row; height:100%; background:#1e1e1e; }
.term-content { flex:1; position:relative; overflow:hidden; z-index:1; background:#1e1e1e; }
.term-empty { display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted); font-size:13px; background:var(--bg-surface); }
.term-empty-center { flex-direction:column; gap:14px; }
.term-empty-btn { background:var(--bg-active); color:var(--text-primary); border:1px solid #3c3c3c; border-radius:4px; padding:6px 20px; cursor:pointer; font-size:12px; }
.term-empty-btn:hover { background:#383838; }
.term-pane { position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; background:#1e1e1e; }
.term-status { display:flex; align-items:center; gap:6px; padding:3px 10px; background:var(--bg-raised); border-top:1px solid var(--border); font-size:11px; color:var(--text-muted); flex-shrink:0; }
.term-status-icon { flex-shrink:0; }
.term-status-path { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* ── Side tab bar ─────────────────────────────────────── */
.term-tabs { width:120px; flex-shrink:0; z-index:3; background:var(--bg-raised); border-left:1px solid var(--border); display:flex; flex-direction:column; overflow-y:auto; }
.term-tab { display:flex; align-items:center; gap:4px; padding:6px 6px 6px 8px; cursor:pointer; font-size:12px; user-select:none; transition:background 0.08s; }
.term-tab:hover { background:var(--bg-hover); }
.term-tab--active { background:var(--bg-surface); }
.term-tab-icon { flex-shrink:0; }
.term-tab-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }
.term-tab-input { flex:1; min-width:0; font-size:12px; background:var(--bg-header); border:1px solid var(--accent-light); border-radius:2px; color:var(--text-highlight); padding:1px 4px; outline:none; }
.term-tab-close { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:3px; cursor:pointer; font-size:10px; line-height:16px; flex-shrink:0; color:var(--text-secondary); visibility:hidden; }
.term-tab:hover .term-tab-close { visibility:visible; }
.term-tab-close:hover { background:var(--scrollbar); color:var(--text-highlight); }
.term-tab-add { display:flex; align-items:center; justify-content:center; padding:8px 0; cursor:pointer; color:var(--text-secondary); font-size:18px; line-height:1; transition:background 0.08s,color 0.08s; }
.term-tab-add:hover { background:var(--bg-hover); color:var(--text-highlight); }
`;

const TerminalStyle = () => <style>{XTERM_CUSTOM_CSS}{TERMINAL_PANEL_CSS}</style>;

// ─── TabContent — owns one xterm.js instance + shell ────────────────────────
// FIX: receives `isActive` prop so it can call fit() when becoming visible
const TabContent = ({ tabId, cwd, writersRef, isActive }) => {
  const elRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const [initError, setInitError] = useState(null);
  const dirName = cwd ? cwd.replace(/[\\/]$/, "").split(/[\\/]/).pop() || cwd : "";

  const handleContextMenu = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const term = termRef.current;
    let selText = term?.getSelection() || "";
    // fallback: try DOM selection in case xterm's API returns empty
    if (!selText) { try { const ds = document.getSelection()?.toString(); if (ds) selText = ds; } catch {} }
    const hasSelection = !!selText;
    const result = await window.electronAPI.showTerminalContextMenu(hasSelection);
    if (!result) return;
    switch (result.action) {
      case "copy": {
        if (selText) {
          try { window.electronAPI.clipboardWrite(selText); }
          catch { try { navigator.clipboard.writeText(selText); } catch {} }
        }
        break;
      }
      case "paste": {
        const text = window.electronAPI.clipboardRead();
        if (text) window.electronAPI.writeToTerminal(tabId, text);
        break;
      }
      case "kill": window.electronAPI.closeTerminal(tabId); break;
      case "restart": window.electronAPI.openTerminal(tabId, cwd); break;
    }
  }, [tabId, cwd]);

  // ── Initialize xterm + pty shell ──────────────────────────────────────────
  useEffect(() => {
    let term;
    let fit;
    let ro;
    let el;
    let rafId;
    let disposed = false;

    (async () => {
      try {
        term = new Terminal({
          cursorBlink: true,
          cursorStyle: "block",
          fontSize:   13,
          fontFamily: 'Consolas, "Courier New", monospace',
          allowTransparency: true,
          theme: {
            background: "#1e1e1e",
            foreground: "#c8c8c8",
            cursor:     "#c8c8c8",
            cursorAccent: "#1e1e1e",
            selectionBackground: "#2c4f6e",
            selectionInactiveBackground: "#264f78",
            black: "#000000", red: "#f44747", green: "#4ec9b0", yellow: "#dcdcaa",
            blue:  "#569cd6", magenta: "#c586c0", cyan: "#9cdcfe", white: "#d4d4d4",
            brightBlack: "#444", brightRed: "#f44747", brightGreen: "#4ec9b0",
            brightYellow: "#dcdcaa", brightBlue: "#569cd6", brightMagenta: "#c586c0",
            brightCyan: "#9cdcfe", brightWhite: "#e0e0e0",
          },
        });

        fit = new FitAddon();
        term.loadAddon(fit);

        el = elRef.current;
        if (el) {
          el.innerHTML = "";
          term.open(el);
        }

        term.onData((data) => {
          window.electronAPI.writeToTerminal(tabId, data);
        });

        termRef.current = term;
        fitRef.current  = fit;

        writersRef.current[tabId] = (data) => term.write(data);

        ro = new ResizeObserver(() => {
          if (fit && term) {
            try {
              fit.fit();
              if (term.cols > 0 && term.rows > 0) {
                window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
              }
            } catch {}
          }
        });
        if (el) ro.observe(el);

        rafId = requestAnimationFrame(() => {
          if (!disposed && fit && term) {
            try {
              fit.fit();
              if (term.cols > 0 && term.rows > 0) {
                window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
              }
            } catch {}
          }
        });

        await window.electronAPI.openTerminal(tabId, cwd);
      } catch (err) {
        if (!disposed) setInitError(err?.message || String(err));
      }
    })();

    return () => {
      disposed = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      // FIX: explicitly remove writer before dispose so no stale writes occur
      delete writersRef.current[tabId];
      window.electronAPI.closeTerminal(tabId);
      if (term) { try { term.dispose(); } catch {} }
      termRef.current = null;
      fitRef.current  = null;
      if (ro && el) ro.disconnect();
    };
  }, [tabId, cwd]);

  // FIX: when this tab becomes active (visible), re-fit the terminal
  // The tab was hidden with display:none, so ResizeObserver didn't fire.
  useEffect(() => {
    if (!isActive) return;
    // Use a small RAF so the DOM has time to become visible first
    const id = requestAnimationFrame(() => {
      const fit  = fitRef.current;
      const term = termRef.current;
      if (fit && term) {
        try {
          fit.fit();
          if (term.cols > 0 && term.rows > 0) {
            window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
          }
        } catch {}
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isActive, tabId]);

  if (initError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#f44747", fontSize: 12, padding: 20, textAlign: "center" }}>
        Terminal init error: {initError}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#1e1e1e" }}>
      <div ref={elRef} className="term-xterm"
        style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
        onContextMenu={handleContextMenu}
      />
      <div className="term-status">
        <svg className="term-status-icon" width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="#777" strokeWidth="1.2" fill="none" />
          <path d="M5 7L7 9L5 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7L11 9L9 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="term-status-path">{dirName}</span>
      </div>
    </div>
  );
};

// ─── Main TerminalPanel ─────────────────────────────────────────────────────
const TerminalPanel = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [renamingTabId, setRenamingTabId] = useState(null);
  const renameRef = useRef(null);
  const nextId    = useRef(1);
  const projPath  = useRef(null);
  const writersRef = useRef({});
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const activeRef = useRef(activeTabId);
  activeRef.current = activeTabId;

  // ── Central dispatcher: shell output → xterm ──────────────────────────
  useEffect(() => {
    const unsub = window.electronAPI.onTerminalData(({ tabId, data }) => {
      const w = writersRef.current[tabId];
      if (w) try { w(data); } catch {}
    });
    return unsub;
  }, []);

  // ── Central dispatcher: shell exit → xterm message ────────────────────
  useEffect(() => {
    const unsub = window.electronAPI.onTerminalExit(({ tabId, code }) => {
      const w = writersRef.current[tabId];
      if (w) {
        try { w(`\x1b[33m\r\n[Process exited with code ${code}]\x1b[0m\r\n`); } catch {}
      }
    });
    return unsub;
  }, []);

  // ── Tab management ────────────────────────────────────────────────────
  const createTab = useCallback((cwd) => {
    const dir = cwd || projPath.current;
    if (!dir) return;
    const num = nextId.current++;
    const id   = `term_${num}`;
    const explicitCwd = cwd !== undefined;
    const name = explicitCwd
      ? dir.replace(/[\\/]$/, "").split(/[\\/]/).pop() || `Terminal ${num}`
      : `Terminal ${num}`;
    setTabs((prev) => [...prev, { id, name, cwd: dir }]);
    setActiveTabId(id);
  }, []);

  // FIX: clean up writersRef when closing a tab so no stale writes
  const closeTab = useCallback((tabId) => {
    delete writersRef.current[tabId];
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      const next = prev.filter((t) => t.id !== tabId);
      if (activeRef.current === tabId) {
        setActiveTabId(next[Math.min(idx, next.length - 1)]?.id || null);
      }
      return next;
    });
  }, []);

  // ── Inline rename ────────────────────────────────────────────────────
  const startRename = useCallback((tabId, currentName) => {
    setRenamingTabId(tabId);
    requestAnimationFrame(() => {
      if (renameRef.current) {
        renameRef.current.value = currentName;
        renameRef.current.select();
      }
    });
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingTabId || !renameRef.current) return;
    const newName = renameRef.current.value.trim() || `Terminal ${renamingTabId.replace("term_", "")}`;
    setTabs((prev) => prev.map((t) => t.id === renamingTabId ? { ...t, name: newName } : t));
    setRenamingTabId(null);
  }, [renamingTabId]);

  const cancelRename = useCallback(() => {
    setRenamingTabId(null);
  }, []);

  // ── Context menu ──────────────────────────────────────────────────────
  const handleTabContextMenu = useCallback(async (e, tabId) => {
    e.preventDefault();
    const result = await window.electronAPI.showTerminalTabContextMenu();
    if (!result) return;
    switch (result.action) {
      case "kill":
        try { await window.electronAPI.closeTerminal(tabId); } catch {}
        break;
      case "restart": {
        const t = tabsRef.current.find((x) => x.id === tabId);
        if (t) { try { await window.electronAPI.openTerminal(tabId, t.cwd); } catch {} }
        break;
      }
      case "rename": {
        const tab = tabsRef.current.find((t) => t.id === tabId);
        startRename(tabId, tab?.name || "");
        break;
      }
      case "close":
        try { await window.electronAPI.closeTerminal(tabId); } catch {}
        closeTab(tabId);
        break;
    }
  }, [closeTab, startRename]);

  // ── Listen for "Open in Terminal" from file explorer ──────────────────
  useEffect(() => {
    const handler = (e) => {
      const dir = e.detail.dir;
      if (dir) {
        projPath.current = dir;
        setProjectOpen(true);
        createTab(dir);
        window.dispatchEvent(new CustomEvent("focus-terminal-tab"));
      }
    };
    window.addEventListener("open-terminal", handler);
    return () => window.removeEventListener("open-terminal", handler);
  }, [createTab]);

  // ── Project lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.getProjectPath().then((p) => {
      if (p) { projPath.current = p; setProjectOpen(true); createTab(); }
    });

    const u1 = window.electronAPI.onMenuEvent("menu:openProject", (p) => {
      if (p) { projPath.current = p; setProjectOpen(true); createTab(); }
    });
    const u2 = window.electronAPI.onMenuEvent("menu:newProject", (p) => {
      if (p) { projPath.current = p; setProjectOpen(true); createTab(); }
    });
    const u3 = window.electronAPI.onMenuEvent("menu:closeProject", () => {
      projPath.current = null;
      setProjectOpen(false);
      // FIX: close all pty processes before clearing tabs
      for (const id of Object.keys(writersRef.current)) {
        try { window.electronAPI.closeTerminal(id); } catch {}
      }
      writersRef.current = {};
      setTabs([]);
      setActiveTabId(null);
    });

    return () => { u1(); u2(); u3(); };
  }, [createTab]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="term-panel">
      <TerminalStyle />

      {/* ── Terminal content area ─────────────────────────────────── */}
      <div className="term-content">
        {!projectOpen ? (
          <div className="term-empty">
            Open a project to use the terminal
          </div>
        ) : tabs.length === 0 ? (
          <div className="term-empty term-empty-center">
            <div className="term-empty">No open terminals</div>
            <button
              onClick={() => createTab()}
              className="term-empty-btn"
            >
              + Create Terminal
            </button>
          </div>
        ) : (
          tabs.map((tab) => (
            <div key={tab.id} className="term-pane"
              style={{ display: tab.id === activeTabId ? "block" : "none" }}
            >
              {/* FIX: pass isActive so TabContent can fit() when becoming visible */}
              <TabContent
                tabId={tab.id}
                cwd={tab.cwd}
                writersRef={writersRef}
                isActive={tab.id === activeTabId}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Side tab bar (right side, like VS Code) ───────────────── */}
      {projectOpen && (
        <div className="term-tabs">
          {tabs.map((tab, i) => {
            const active = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                data-term-tab=""
                onClick={() => setActiveTabId(tab.id)}
                onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                className={"term-tab" + (active ? " term-tab--active" : "")}
                style={{ borderLeft: `3px solid ${active ? ACCENTS[i % ACCENTS.length] : "transparent"}` }}
              >
                <svg className="term-tab-icon" width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="1" stroke={active ? "#aaa" : "#666"} strokeWidth="1.2" fill="none" />
                  <path d="M5 7L7 9L5 11" stroke={active ? "#aaa" : "#666"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7L11 9L9 11" stroke={active ? "#aaa" : "#666"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {renamingTabId === tab.id ? (
                  <input
                    ref={renameRef}
                    defaultValue={tab.name}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") cancelRename();
                      e.stopPropagation();
                    }}
                    onBlur={commitRename}
                    onClick={(e) => e.stopPropagation()}
                    className="term-tab-input"
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRename(tab.id, tab.name);
                    }}
                    className="term-tab-name"
                  >
                    {tab.name}
                  </span>
                )}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    // FIX: tell pty to close, then clean up tab + writers
                    try { window.electronAPI.closeTerminal(tab.id); } catch {}
                    closeTab(tab.id);
                  }}
                  className="term-tab-close"
                >
                  ✕
                </span>
              </div>
            );
          })}

          <div
            onClick={() => window.dispatchEvent(new CustomEvent("add-terminal-panel"))}
            title="New Terminal Panel"
            className="term-tab-add"
          >
            +
          </div>
        </div>
      )}

    </div>
  );
};

export default TerminalPanel;
