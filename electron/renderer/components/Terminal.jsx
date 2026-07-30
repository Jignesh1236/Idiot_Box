// Terminal Panel — multi-tab terminal with right-side tab rail
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

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const XTERM_CUSTOM_CSS = `
.xterm { height: 100%; padding: 0; background: transparent; }
.xterm-screen,
.xterm-viewport,
.xterm-scroll-area,
.xterm-helper-textarea { background: transparent !important; }
.xterm-viewport { scrollbar-width: thin; }
.xterm-viewport::-webkit-scrollbar { width: 6px; }
.xterm-viewport::-webkit-scrollbar-track { background: transparent; }
.xterm-viewport::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }
.xterm-viewport::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-hover); }
.xterm-cursor-block { opacity: 0.9; }
.xterm-selection div { background: var(--selection) !important; opacity: 0.5; }
.xterm-rows { font-variant-ligatures: none; letter-spacing: 0.2px; }
`;

const TERMINAL_PANEL_CSS = `
/* ── Panel shell ───────────────────────────────────────────────────── */
.term-panel {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: var(--bg-surface);
  overflow: hidden;
}

/* ── Vertical right tab rail ───────────────────────────────────────── */
.term-tabs {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
  background: var(--bg-raised);
  border-left: 1px solid var(--border);
  overflow-y: auto;
  overflow-x: hidden;
  width: 46px;
  min-width: 46px;
  scrollbar-width: none;
}
.term-tabs::-webkit-scrollbar { display: none; }

/* ── Individual tab ─────────────────────────────────────────────────── */
.term-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 4px;
  min-height: 92px;
  cursor: pointer;
  font-size: 11.5px;
  user-select: none;
  border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent;
  flex-shrink: 0;
  transition: background 0.08s;
  color: var(--text-secondary);
  box-sizing: border-box;
}
.term-tab:hover { background: var(--bg-hover); }
.term-tab--active {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.term-tab-icon { flex-shrink: 0; opacity: 0.55; }
.term-tab--active .term-tab-icon { opacity: 1; }

.term-tab-name {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  max-height: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
.term-tab-input {
  width: 24px;
  min-width: 24px;
  min-height: 72px;
  font-size: 11.5px;
  background: var(--bg-header);
  border: 1px solid var(--accent-light);
  border-radius: 2px;
  color: var(--text-highlight);
  padding: 6px 2px;
  outline: none;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
}

.term-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  flex-shrink: 0;
  color: var(--text-secondary);
  visibility: hidden;
  flex-shrink: 0;
}
.term-tab:hover .term-tab-close,
.term-tab--active .term-tab-close { visibility: visible; }
.term-tab-close:hover { background: #505050; color: #e0e0e0; }

/* ── Add-new-tab button at the end of tab bar ───────────────────────── */
.term-tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: auto;
  transition: background 0.08s, color 0.08s;
  border-top: 1px solid var(--border);
}
.term-tab-add:hover { background: var(--bg-hover); color: var(--text-highlight); }

/* ── Terminal content area ──────────────────────────────────────────── */
.term-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  background: var(--bg-surface);
}
.term-pane {
  position: absolute;
  inset: 0;
}
.term-pane-inner {
  position: absolute;
  inset: 0;
  padding: 8px 10px 8px 8px;
  background: var(--bg-surface);
}
.term-xterm-host {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-surface);
  border-radius: 6px;
}

/* ── Empty / no-project states ─────────────────────────────────────── */
.term-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 13px;
  flex-direction: column;
  gap: 14px;
  text-align: center;
  padding: 0 20px;
}
.term-new-btn {
  background: var(--bg-active);
  color: var(--text-primary);
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 6px 20px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 4px;
}
.term-new-btn:hover { background: #383838; }
`;

const TerminalStyle = () => (
  <style>{XTERM_CUSTOM_CSS}{TERMINAL_PANEL_CSS}</style>
);

// ─── TabContent — owns one xterm.js instance + pty shell ─────────────────────
// FIX: receives `isActive` so it can call fit() when tab becomes visible
const TabContent = ({ tabId, cwd, writersRef, isActive }) => {
  const elRef    = useRef(null);
  const termRef  = useRef(null);
  const fitRef   = useRef(null);
  const [initError, setInitError] = useState(null);

  const handleContextMenu = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const term = termRef.current;
    let selText = term?.getSelection() || "";
    if (!selText) { try { selText = document.getSelection()?.toString() || ""; } catch {} }
    const result = await window.electronAPI.showTerminalContextMenu(!!selText);
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
      case "kill":    window.electronAPI.closeTerminal(tabId);       break;
      case "restart": window.electronAPI.openTerminal(tabId, cwd);  break;
    }
  }, [tabId, cwd]);

  // ── Initialize xterm + pty ────────────────────────────────────────────────
  useEffect(() => {
    let term, fit, ro, el, rafId;
    let disposed = false;

    (async () => {
      try {
        term = new Terminal({
          cursorBlink:       true,
          cursorStyle:       "block",
          fontSize:          13,
          fontFamily:        'Consolas, "Courier New", monospace',
          allowTransparency: true,
          theme: {
            background:                 "#1e1e1e",
            foreground:                 "#c8c8c8",
            cursor:                     "#c8c8c8",
            cursorAccent:               "#1e1e1e",
            selectionBackground:        "#2c4f6e",
            selectionInactiveBackground:"#264f78",
            black:          "#000000", red:     "#f44747",
            green:          "#4ec9b0", yellow:  "#dcdcaa",
            blue:           "#569cd6", magenta: "#c586c0",
            cyan:           "#9cdcfe", white:   "#d4d4d4",
            brightBlack:    "#444",    brightRed:     "#f44747",
            brightGreen:    "#4ec9b0", brightYellow:  "#dcdcaa",
            brightBlue:     "#569cd6", brightMagenta: "#c586c0",
            brightCyan:     "#9cdcfe", brightWhite:   "#e0e0e0",
          },
        });

        fit = new FitAddon();
        term.loadAddon(fit);

        el = elRef.current;
        if (el) { el.innerHTML = ""; term.open(el); }

        term.onData((data) => window.electronAPI.writeToTerminal(tabId, data));

        termRef.current = term;
        fitRef.current  = fit;
        writersRef.current[tabId] = (data) => term.write(data);

        ro = new ResizeObserver(() => {
          if (fit && term) {
            try {
              fit.fit();
              if (term.cols > 0 && term.rows > 0)
                window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
            } catch {}
          }
        });
        if (el) ro.observe(el);

        rafId = requestAnimationFrame(() => {
          if (!disposed && fit && term) {
            try {
              fit.fit();
              if (term.cols > 0 && term.rows > 0)
                window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
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
      // FIX: remove writer before dispose so no stale writes
      delete writersRef.current[tabId];
      window.electronAPI.closeTerminal(tabId);
      if (term) { try { term.dispose(); } catch {} }
      termRef.current = null;
      fitRef.current  = null;
      if (ro && el) ro.disconnect();
    };
  }, [tabId, cwd]); // eslint-disable-line

  // FIX: when tab becomes visible, re-fit (was hidden with display:none)
  useEffect(() => {
    if (!isActive) return;
    const id = requestAnimationFrame(() => {
      const fit  = fitRef.current;
      const term = termRef.current;
      if (fit && term) {
        try {
          fit.fit();
          if (term.cols > 0 && term.rows > 0)
            window.electronAPI.resizeTerminal(tabId, term.cols, term.rows);
        } catch {}
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isActive, tabId]);

  if (initError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", color: "#f44747", fontSize: 12, padding: 20, textAlign: "center" }}>
        Terminal init error: {initError}
      </div>
    );
  }

  return (
    <div
      className="term-pane-inner"
      onContextMenu={handleContextMenu}
    >
      <div
        ref={elRef}
        className="term-xterm-host"
      />
    </div>
  );
};

// ─── Main TerminalPanel ───────────────────────────────────────────────────────
const TerminalPanel = () => {
  const [tabs,         setTabs]         = useState([]);
  const [activeTabId,  setActiveTabId]  = useState(null);
  const [projectOpen,  setProjectOpen]  = useState(false);
  const [renamingTabId, setRenamingTabId] = useState(null);
  const renameRef  = useRef(null);
  const nextId     = useRef(1);
  const projPath   = useRef(null);
  const writersRef = useRef({});
  const tabsRef    = useRef(tabs);
  tabsRef.current  = tabs;
  const activeRef  = useRef(activeTabId);
  activeRef.current = activeTabId;

  // ── Dispatch shell output to xterm instances ──────────────────────────
  useEffect(() => {
    const unsub = window.electronAPI.onTerminalData(({ tabId, data }) => {
      const w = writersRef.current[tabId];
      if (w) try { w(data); } catch {}
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = window.electronAPI.onTerminalExit(({ tabId, code }) => {
      const w = writersRef.current[tabId];
      if (w) try { w(`\x1b[33m\r\n[Process exited with code ${code}]\x1b[0m\r\n`); } catch {}
    });
    return unsub;
  }, []);

  // ── Tab management ────────────────────────────────────────────────────
  const createTab = useCallback((cwd) => {
    const dir = cwd || projPath.current;
    if (!dir) return;
    const num  = nextId.current++;
    const id   = `term_${num}`;
    const name = cwd
      ? dir.replace(/[\\/]$/, "").split(/[\\/]/).pop() || `Terminal ${num}`
      : `Terminal ${num}`;
    setTabs((prev) => [...prev, { id, name, cwd: dir }]);
    setActiveTabId(id);
  }, []);

  // FIX: also clean up writersRef when closing
  const closeTab = useCallback((tabId) => {
    delete writersRef.current[tabId];
    setTabs((prev) => {
      const idx  = prev.findIndex((t) => t.id === tabId);
      const next = prev.filter((t) => t.id !== tabId);
      if (activeRef.current === tabId)
        setActiveTabId(next[Math.min(idx, next.length - 1)]?.id || null);
      return next;
    });
  }, []);

  // ── Inline rename ─────────────────────────────────────────────────────
  const startRename = useCallback((tabId, currentName) => {
    setRenamingTabId(tabId);
    requestAnimationFrame(() => {
      if (renameRef.current) { renameRef.current.value = currentName; renameRef.current.select(); }
    });
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingTabId || !renameRef.current) return;
    const newName = renameRef.current.value.trim() || `Terminal ${renamingTabId.replace("term_", "")}`;
    setTabs((prev) => prev.map((t) => t.id === renamingTabId ? { ...t, name: newName } : t));
    setRenamingTabId(null);
  }, [renamingTabId]);

  const cancelRename = useCallback(() => setRenamingTabId(null), []);

  // ── Tab context menu ──────────────────────────────────────────────────
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

  // ── "Open in Terminal" from file explorer ─────────────────────────────
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
      // FIX: close all ptys before clearing tabs
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

      {/* ── Terminal content area ────────────────────────────────────── */}
      <div className="term-content">
        {!projectOpen ? (
          <div className="term-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="16" rx="2" stroke="#444" strokeWidth="1.2"/>
              <path d="M7 9l3 3-3 3" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15h4" stroke="#444" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>Open a project to use the terminal</span>
          </div>
        ) : tabs.length === 0 ? (
          <div className="term-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="16" rx="2" stroke="#444" strokeWidth="1.2"/>
              <path d="M7 9l3 3-3 3" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15h4" stroke="#444" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>No open terminals</span>
            <button className="term-new-btn" onClick={() => createTab()}>
              + New Terminal
            </button>
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className="term-pane"
              style={{ display: tab.id === activeTabId ? "block" : "none" }}
            >
              {/* FIX: isActive triggers fit() when tab becomes visible */}
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

      {/* ── Right tab rail ───────────────────────────────────────────── */}
      {projectOpen && tabs.length > 0 && (
        <div className="term-tabs">
          {tabs.map((tab, i) => {
            const active = tab.id === activeTabId;
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                className={"term-tab" + (active ? " term-tab--active" : "")}
                style={{ borderLeftColor: active ? accent : "transparent" }}
              >
                <svg className="term-tab-icon" width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2.5" width="12" height="11" rx="1" stroke={active ? accent : "#666"} strokeWidth="1.2" fill="none"/>
                  <path d="M5 7L7 9L5 11" stroke={active ? accent : "#666"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11h3" stroke={active ? accent : "#666"} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>

                {renamingTabId === tab.id ? (
                  <input
                    ref={renameRef}
                    defaultValue={tab.name}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")  commitRename();
                      if (e.key === "Escape") cancelRename();
                      e.stopPropagation();
                    }}
                    onBlur={commitRename}
                    onClick={(e) => e.stopPropagation()}
                    className="term-tab-input"
                  />
                ) : (
                  <span
                    className="term-tab-name"
                    onDoubleClick={(e) => { e.stopPropagation(); startRename(tab.id, tab.name); }}
                  >
                    {tab.name}
                  </span>
                )}

                <span
                  className="term-tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    try { window.electronAPI.closeTerminal(tab.id); } catch {}
                    closeTab(tab.id);
                  }}
                  title="Close terminal"
                >
                  ✕
                </span>
              </div>
            );
          })}

          <div
            className="term-tab-add"
            onClick={() => createTab()}
            title="New Terminal (Ctrl+`)"
          >
            +
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;
