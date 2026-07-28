// Terminal Panel — custom multi-tab terminal with side tab bar
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const ACCENTS = [
  "#569cd6", "#ce9178", "#6a9955", "#dcdcaa",
  "#c586c0", "#d16969", "#4ec9b0", "#e5c07b",
];

// ─── Custom xterm CSS overrides (injected once) ────────────────────────────
const XTERM_CUSTOM_CSS = `
.xterm { height: 100%; padding: 0 6px; background: #1e1e1e; }
.xterm-viewport { scrollbar-width: thin; }
.xterm-viewport::-webkit-scrollbar { width: 6px; }
.xterm-viewport::-webkit-scrollbar-track { background: transparent; }
.xterm-viewport::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
.xterm-viewport::-webkit-scrollbar-thumb:hover { background: #555; }
.xterm-cursor { outline: none !important; }
.xterm-cursor-block { background: #d4d4d4 !important; opacity: 0.9; }
.xterm-cursor-blink { animation: xterm-cursor-blink 1s step-end infinite; }
@keyframes xterm-cursor-blink { 50% { opacity: 0; } }
.xterm-selection div { background: #264f78 !important; opacity: 0.5; }
.xterm-rows { font-variant-ligatures: none; letter-spacing: 0.2px; }
`;

// ─── Inline <style> component ──────────────────────────────────────────────
const XtermStyle = () => <style>{XTERM_CUSTOM_CSS}</style>;

// ─── TabContent — owns one xterm.js instance + shell ────────────────────────
const TabContent = ({ tabId, cwd, writersRef }) => {
  const elRef = useRef(null);
  const [initError, setInitError] = useState(null);
  const dirName = cwd ? cwd.replace(/[\\/]$/, "").split(/[\\/]/).pop() || cwd : "";

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
          if (fit && term) {
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
      delete writersRef.current[tabId];
      window.electronAPI.closeTerminal(tabId);
      if (term) term.dispose();
      if (ro && el) ro.disconnect();
    };
  }, [tabId, cwd]);

  if (initError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#f44747", fontSize: 12, padding: 20, textAlign: "center" }}>
        Terminal init error: {initError}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={elRef} style={{ flex: 1, minHeight: 0 }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "3px 10px", background: "#252525",
        borderTop: "1px solid #333",
        fontSize: 11, color: "#666", flexShrink: 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="#777" strokeWidth="1.2" fill="none" />
          <path d="M5 7L7 9L5 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7L11 9L9 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {dirName}
        </span>
      </div>
    </div>
  );
};

// ─── Context menu styling ───────────────────────────────────────────────────
const MENU_STYLE = {
  padding: "5px 16px", cursor: "pointer", fontSize: 12, color: "#c8c8c8",
  whiteSpace: "nowrap", transition: "background 0.08s",
};
const MENU_SEP = { height: 1, background: "#3c3c3c", margin: "4px 0" };

// ─── Main TerminalPanel ─────────────────────────────────────────────────────
const TerminalPanel = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
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

  const closeTab = useCallback((tabId) => {
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
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const execAction = useCallback(async (action) => {
    if (!contextMenu) return;
    const { tabId } = contextMenu;
    setContextMenu(null);

    switch (action) {
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
        return;
      }
      case "close":
        delete writersRef.current[tabId];
        try { await window.electronAPI.closeTerminal(tabId); } catch {}
        closeTab(tabId);
        break;
    }
  }, [contextMenu, closeTab, startRename]);

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
      for (const id of Object.keys(writersRef.current)) {
        window.electronAPI.closeTerminal(id);
      }
      writersRef.current = {};
      setTabs([]);
      setActiveTabId(null);
    });

    return () => { u1(); u2(); u3(); };
  }, [createTab]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "row", height: "100%",
      background: "#1e1e1e",
    }}>
      <XtermStyle />

      {/* ── Terminal content area ─────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", zIndex: 1 }}>
        {!projectOpen ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: "#666", fontSize: 13, fontStyle: "italic",
          }}>
            Open a project to use the terminal
          </div>
        ) : tabs.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 14,
          }}>
            <div style={{ color: "#666", fontSize: 13 }}>No open terminals</div>
            <button
              onClick={() => createTab()}
              style={{
                background: "#2d2d2d", color: "#c8c8c8",
                border: "1px solid #3c3c3c", borderRadius: 3,
                padding: "6px 20px", cursor: "pointer", fontSize: 12,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#383838"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#2d2d2d"}
            >
              + Create Terminal
            </button>
          </div>
        ) : (
          tabs.map((tab) => (
            <div key={tab.id} style={{
              position: "absolute", inset: 0, zIndex: 2,
              display: tab.id === activeTabId ? "block" : "none",
            }}>
              <TabContent tabId={tab.id} cwd={tab.cwd} writersRef={writersRef} />
            </div>
          ))
        )}
      </div>

      {/* ── Side tab bar (right side, like VS Code) ───────────────── */}
      {projectOpen && (
        <div style={{
          width: 110, flexShrink: 0, zIndex: 3,
          background: "#252525",
          borderLeft: "1px solid #333",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}>
          {tabs.map((tab, i) => {
            const active = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                data-term-tab=""
                onClick={() => setActiveTabId(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 8px", cursor: "pointer",
                  borderLeft: `3px solid ${active ? ACCENTS[i % ACCENTS.length] : "transparent"}`,
                  background: active ? "#1e1e1e" : "transparent",
                  color: active ? "#d4d4d4" : "#999",
                  fontSize: 12, userSelect: "none",
                  transition: "background 0.08s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#2a2a2a"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
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
                    style={{
                      flex: 1, minWidth: 0, fontSize: 12,
                      background: "#1a1a1a", border: "1px solid #5a9fd4",
                      borderRadius: 2, color: "#d4d4d4", padding: "1px 4px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRename(tab.id, tab.name);
                    }}
                    style={{
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", cursor: "pointer",
                    }}
                  >
                    {tab.name}
                  </span>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); window.electronAPI.closeTerminal(tab.id); closeTab(tab.id); }}
                  className="term-side-close"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 16, height: 16, borderRadius: 3, cursor: "pointer",
                    fontSize: 10, lineHeight: "16px", flexShrink: 0,
                    color: "#999",
                  }}
                >
                  ✕
                </span>
              </div>
            );
          })}

          <div
            onClick={() => createTab()}
            title="New Terminal"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "8px 0", cursor: "pointer",
              color: "#999", fontSize: 18, lineHeight: 1,
              transition: "background 0.08s, color 0.08s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "#d4d4d4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#999"; }}
          >
            +
          </div>
        </div>
      )}

      {/* ── Context menu ──────────────────────────────────────────── */}
      {contextMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}
          onClick={closeContextMenu}
        >
          <div
            style={{
              position: "absolute",
              left: contextMenu.x, top: contextMenu.y,
              background: "#2d2d2d", border: "1px solid #444",
              borderRadius: 6, padding: "4px 0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
              minWidth: 150,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={MENU_STYLE}
              onClick={() => execAction("kill")}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3a3a3a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Kill Terminal
            </div>
            <div style={MENU_STYLE}
              onClick={() => execAction("restart")}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3a3a3a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Restart
            </div>
            <div style={MENU_SEP} />
            <div style={MENU_STYLE}
              onClick={() => execAction("rename")}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3a3a3a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Rename Tab
            </div>
            <div style={MENU_SEP} />
            <div style={MENU_STYLE}
              onClick={() => execAction("close")}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3a3a3a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Close Tab
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;
