// Terminal Panel — Flexlayout integrated standalone terminal component
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

let nextTerminalId = 1;

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
.term-xterm { padding: 4px 6px; box-sizing: border-box; background: #1e1e1e; height: 100%; width: 100%; }
.term-xterm .xterm { pointer-events: auto; }
.term-xterm .xterm-viewport { pointer-events: auto; }
.xterm-screen { background: transparent !important; }
`;

const TERMINAL_PANEL_CSS = `
.term-panel { display:flex; flex-direction:column; height:100%; width:100%; background:#1e1e1e; position:relative; overflow:hidden; }
.term-content { flex:1; position:relative; overflow:hidden; z-index:1; background:#1e1e1e; display:flex; flex-direction:column; min-height:0; }
.term-empty { display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted); font-size:13px; background:var(--bg-surface); }
.term-status { display:flex; align-items:center; gap:6px; padding:3px 10px; background:var(--bg-raised); border-top:1px solid var(--border); font-size:11px; color:var(--text-muted); flex-shrink:0; user-select:none; }
.term-status-icon { flex-shrink:0; }
.term-status-path { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
.term-status-actions { display:flex; align-items:center; gap:4px; }
.term-status-btn { background:transparent; border:none; color:#888; cursor:pointer; padding:2px 4px; border-radius:2px; font-size:11px; }
.term-status-btn:hover { background:#333; color:#fff; }
`;

const TerminalStyle = () => <style>{XTERM_CUSTOM_CSS}{TERMINAL_PANEL_CSS}</style>;

const TerminalPanel = ({ nodeId, config }) => {
  const elRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const tabIdRef = useRef(null);
  
  const [initError, setInitError] = useState(null);
  const [cwd, setCwd] = useState(null);

  // Generate unique tabId per terminal instance
  if (!tabIdRef.current) {
    const safeNodeId = nodeId ? String(nodeId).replace(/[^a-zA-Z0-9_]/g, "_") : `term_${nextTerminalId++}`;
    tabIdRef.current = `term_${safeNodeId}`;
  }
  const tabId = tabIdRef.current;

  // ── Context menu (Right Click anywhere inside terminal) ────────────────────
  const handleContextMenu = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const term = termRef.current;
    let selText = term?.getSelection() || "";
    if (!selText) {
      try {
        const ds = document.getSelection()?.toString();
        if (ds) selText = ds;
      } catch {}
    }
    const hasSelection = !!selText;

    const result = await window.electronAPI.showTerminalContextMenu(hasSelection);
    if (!result) return;

    switch (result.action) {
      case "copy":
        if (selText) {
          try { window.electronAPI.clipboardWrite(selText); }
          catch { try { navigator.clipboard.writeText(selText); } catch {} }
        }
        break;
      case "paste": {
        const text = window.electronAPI.clipboardRead();
        if (text) window.electronAPI.writeToTerminal(tabId, text);
        break;
      }
      case "addPanel":
        window.dispatchEvent(new CustomEvent("add-terminal-panel", { detail: { nodeId, location: "CENTER" } }));
        break;
      case "splitRight":
        window.dispatchEvent(new CustomEvent("add-terminal-panel", { detail: { nodeId, location: "RIGHT" } }));
        break;
      case "splitDown":
        window.dispatchEvent(new CustomEvent("add-terminal-panel", { detail: { nodeId, location: "BOTTOM" } }));
        break;
      case "clear":
        term?.clear();
        window.electronAPI.writeToTerminal(tabId, "\x1bc");
        break;
      case "restart":
        window.electronAPI.openTerminal(tabId, cwdRef.current ?? cwd, true); // force restart
        break;
      case "close":
        window.dispatchEvent(new CustomEvent("close-flex-tab", { detail: { nodeId } }));
        break;
    }
  }, [tabId, cwd, nodeId]);

  // cwdRef keeps latest cwd accessible inside effects without re-triggering them
  const cwdRef = useRef(cwd);
  useEffect(() => { cwdRef.current = cwd; }, [cwd]);

  // ── Initialize Project Working Directory ──────────────────────────────────
  useEffect(() => {
    window.electronAPI.getProjectPath().then((p) => {
      if (p) setCwd(p);
    });
  }, []);

  // ── Initialize xterm + PTY ────────────────────────────────────────────────
  // Depends ONLY on tabId — cwd change should NOT kill/restart the terminal.
  // Project open/close events handle cd-ing via a separate effect below.
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
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          allowTransparency: true,
          theme: {
            background: "#1e1e1e",
            foreground: "#c8c8c8",
            cursor: "#c8c8c8",
            cursorAccent: "#1e1e1e",
            selectionBackground: "#2c4f6e",
            selectionInactiveBackground: "#264f78",
            black: "#000000", red: "#f44747", green: "#4ec9b0", yellow: "#dcdcaa",
            blue: "#569cd6", magenta: "#c586c0", cyan: "#9cdcfe", white: "#d4d4d4",
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
        fitRef.current = fit;

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

        // Use cwdRef so we read the latest value without adding cwd to deps
        await window.electronAPI.openTerminal(tabId, cwdRef.current);
      } catch (err) {
        if (!disposed) setInitError(err?.message || String(err));
      }
    })();

    return () => {
      disposed = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      window.electronAPI.closeTerminal(tabId);
      if (term) { try { term.dispose(); } catch {} }
      termRef.current = null;
      fitRef.current = null;
      if (ro && el) ro.disconnect();
    };
  }, [tabId]); // ← cwd removed: tab switch / cwd update will NOT kill the PTY

  // ── Listen for shell output / exit ────────────────────────────────────────
  useEffect(() => {
    const unsubData = window.electronAPI.onTerminalData(({ tabId: tId, data }) => {
      if (tId === tabId && termRef.current) {
        try { termRef.current.write(data); } catch {}
      }
    });

    const unsubExit = window.electronAPI.onTerminalExit(({ tabId: tId, code }) => {
      if (tId === tabId && termRef.current) {
        try { termRef.current.write(`\x1b[33m\r\n[Process exited with code ${code}]\x1b[0m\r\n`); } catch {}
      }
    });

    return () => { unsubData(); unsubExit(); };
  }, [tabId]);

  // ── Listen for "Open in Terminal" from file explorer ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      const dir = e.detail?.dir;
      if (dir) {
        setCwd(dir);
        // Send cd command instead of restarting PTY
        const cdCmd = process.platform === "win32"
          ? `cd /d "${dir}"\r`
          : `cd "${dir}"\r`;
        window.electronAPI.writeToTerminal(tabId, cdCmd);
      }
    };
    window.addEventListener("open-terminal", handler);
    return () => window.removeEventListener("open-terminal", handler);
  }, [tabId]);

  // ── Menu events (Open/Close Project) ──────────────────────────────────────
  // We only cd into the new directory — we do NOT kill/restart the PTY.
  // This preserves running processes when switching tabs or opening a project.
  useEffect(() => {
    const cdTo = (p) => {
      if (!p) return;
      setCwd(p);
      // Send a cd command to the running shell instead of restarting it
      const cdCmd = process.platform === "win32"
        ? `cd /d "${p}"\r`
        : `cd "${p}"\r`;
      window.electronAPI.writeToTerminal(tabId, cdCmd);
    };

    const u1 = window.electronAPI.onMenuEvent("menu:openProject", (p) => { if (p) cdTo(p); });
    const u2 = window.electronAPI.onMenuEvent("menu:newProject",  (p) => { if (p) cdTo(p); });
    const u3 = window.electronAPI.onMenuEvent("menu:closeProject", () => { setCwd(null); });

    return () => { u1(); u2(); u3(); };
  }, [tabId]);

  const dirName = cwd ? cwd.replace(/[\\/]$/, "").split(/[\\/]/).pop() || cwd : "Terminal";

  return (
    <div className="term-panel">
      <TerminalStyle />

      <div className="term-content" onContextMenu={handleContextMenu}>
        {initError ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#f44747", fontSize: 12, padding: 20, textAlign: "center" }}>
            Terminal init error: {initError}
          </div>
        ) : (
          <div ref={elRef} className="term-xterm" style={{ flex: 1, minHeight: 0, overflow: "hidden" }} />
        )}
      </div>

      <div className="term-status">
        <svg className="term-status-icon" width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="#777" strokeWidth="1.2" fill="none" />
          <path d="M5 7L7 9L5 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7L11 9L9 11" stroke="#777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="term-status-path">{dirName}</span>

        <div className="term-status-actions">
          <button
            className="term-status-btn"
            title="Split Right"
            onClick={() => window.dispatchEvent(new CustomEvent("add-terminal-panel", { detail: { nodeId, location: "RIGHT" } }))}
          >
            ⧉ Right
          </button>
          <button
            className="term-status-btn"
            title="Split Down"
            onClick={() => window.dispatchEvent(new CustomEvent("add-terminal-panel", { detail: { nodeId, location: "BOTTOM" } }))}
          >
            ⧉ Down
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
