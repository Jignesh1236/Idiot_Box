// Unified Port Manager — Single panel for Port Scanner + Port Manager
import React, { useEffect, useState, useRef, useCallback } from "react";

const PortManager = () => {
  const [ports, setPorts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [manualPort, setManualPort] = useState("");
  const [busyPort, setBusyPort] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [onlyProject, setOnlyProject] = useState(true); // default ON as requested
  const [projectPath, setProjectPath] = useState(window.__currentProjectPath || null);
  const ref = useRef(null);

  useEffect(() => {
    const onOpen = (e) => setProjectPath(e.detail?.path || window.__currentProjectPath || null);
    const onClose = () => setProjectPath(null);
    window.addEventListener("project:opened", onOpen);
    window.addEventListener("project:closed", onClose);
    // also listen for direct changes
    const iv = setInterval(() => {
      const cur = window.__currentProjectPath || null;
      setProjectPath((prev) => (prev !== cur ? cur : prev));
    }, 1000);
    return () => {
      window.removeEventListener("project:opened", onOpen);
      window.removeEventListener("project:closed", onClose);
      clearInterval(iv);
    };
  }, []);

  const normalizePorts = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((p) => (typeof p === "number" ? { port: p, pid: null, name: "", cwd: "", cmdline: "" } : p)).slice(0, 30);
  };

  const filteredPorts = (() => {
    if (!onlyProject || !projectPath) return ports;
    const proj = projectPath.replace(/\\/g, "/").toLowerCase();
    const projBase = proj.split("/").pop() || "";
    return ports.filter((entry) => {
      const p = typeof entry === "number" ? { port: entry, cwd: "", cmdline: "", name: "" } : entry;
      const cwd = (p.cwd || "").replace(/\\/g, "/").toLowerCase();
      const cmd = (p.cmdline || "").replace(/\\/g, "/").toLowerCase();
      const name = (p.name || "").toLowerCase();
      if (cwd && cwd.includes(proj)) return true;
      if (cmd && cmd.includes(proj)) return true;
      // Fallback: check if cwd/cmd contains project folder name (e.g., "my-app")
      if (projBase && projBase.length > 2) {
        if (cwd && cwd.includes(projBase)) return true;
        if (cmd && cmd.includes(projBase)) return true;
      }
      // If we have no cwd/cmd info, hide it when filter is ON (since we can't verify)
      // But keep it if name matches common dev servers (node, vite, next)
      if (!cwd && !cmd) {
        // For ports found via connect (no pid), we can't filter, so show only if we can't determine?
        // To avoid hiding everything, show if port is in common range and we have no info — but user wants strict
        return false;
      }
      return false;
    });
  })();

  const scanPorts = useCallback(async () => {
    setScanning(true);
    try {
      const result = await window.electronAPI.scanPorts();
      setPorts(normalizePorts(result));
    } catch (e) {
      console.error("scanPorts failed", e);
      setPorts([]);
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    scanPorts();
    const interval = setInterval(scanPorts, 15000);
    return () => clearInterval(interval);
  }, [scanPorts]);

  const openInBrowser = useCallback((url) => {
    window.dispatchEvent(new CustomEvent("add-browser-panel", { detail: { url, config: { type: "browser", title: url.replace(/^https?:\/\//, ""), url } } }));
  }, []);

  const copyUrl = useCallback((url) => {
    try { window.electronAPI.clipboardWrite(url); } catch { try { navigator.clipboard.writeText(url); } catch {} }
  }, []);

  const handleKill = useCallback(async (port) => {
    if (!window.confirm(`Kill process on port ${port}?`)) return;
    setBusyPort(port);
    setActionMsg(null);
    try {
      const res = await window.electronAPI.killPort(port);
      if (res?.ok) {
        setActionMsg(`Killed PID ${res.pid} on :${port}`);
        setTimeout(scanPorts, 800);
      } else {
        setActionMsg(res?.error || `Failed to kill :${port}`);
      }
    } catch (e) {
      setActionMsg(String(e.message || e));
    } finally {
      setBusyPort(null);
      setTimeout(() => setActionMsg(null), 3500);
    }
  }, [scanPorts]);

  const handleRestart = useCallback(async (port) => {
    setBusyPort(port);
    setActionMsg(null);
    try {
      const res = await window.electronAPI.restartPort(port);
      if (res?.ok) {
        setActionMsg(`Killed PID ${res.pid} on :${port} — restart manually`);
        setTimeout(scanPorts, 1000);
      } else {
        setActionMsg(res?.error || `Failed on :${port}`);
      }
    } catch (e) {
      setActionMsg(String(e.message || e));
    } finally {
      setBusyPort(null);
      setTimeout(() => setActionMsg(null), 3500);
    }
  }, [scanPorts]);

  return (
    <div ref={ref} style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#1e1e1e", color: "#cccccc", fontFamily: "sans-serif",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderBottom: "1px solid #2d2d2d",
        background: "#252526", flexShrink: 0, gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#569cd6" strokeWidth="1.2" fill="none" />
            <path d="M6 8H10M8 6V10" stroke="#569cd6" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0", whiteSpace: "nowrap" }}>Port Manager</span>
          <span style={{ fontSize: 10, color: "#888", background: "#2d2d2d", padding: "1px 6px", borderRadius: 3, flexShrink: 0 }}>{filteredPorts.length}/{ports.length}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: onlyProject ? "#4ec9b0" : "#888", cursor: "pointer", userSelect: "none" }} title="Show only ports from this project (based on cwd/cmdline)">
            <input type="checkbox" checked={onlyProject} onChange={(e) => setOnlyProject(e.target.checked)} style={{ accentColor: "#0e639c", width: 12, height: 12 }} />
            This project
          </label>
          <button
            onClick={scanPorts}
            disabled={scanning}
            style={{
              background: scanning ? "#2d2d2d" : "#0e639c", border: "none", color: scanning ? "#888" : "#fff",
              padding: "4px 10px", borderRadius: 3, cursor: scanning ? "default" : "pointer", fontSize: 11, opacity: scanning ? 0.6 : 1,
            }}
            title="Scan for running ports"
          >
            {scanning ? "Scanning…" : "Scan"}
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ margin: "0 8px", padding: "6px 8px", background: "#2d2d2d", border: "1px solid #3a3a3a", borderRadius: 3, fontSize: 11, color: actionMsg.startsWith("Killed") ? "#4ec9b0" : "#f44747" }}>
          {actionMsg}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {scanning && filteredPorts.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#666", fontSize: 12 }}>
            Scanning for ports...
          </div>
        )}

        {!scanning && filteredPorts.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#666", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>∅</div>
            {onlyProject && projectPath ? "No ports for this project" : "No ports running"}<br />
            <span style={{ fontSize: 11 }}>{onlyProject && projectPath ? `Filter is ON — showing only ${projectPath.split(/[\\/]/).pop()} ports` : "Start a dev server (vite, next, etc.) and click Scan"}</span>
            {onlyProject && ports.length > filteredPorts.length && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => setOnlyProject(false)} style={{ background: "none", border: "1px solid #3a3a3a", color: "#569cd6", padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 11 }}>
                  Show all ({ports.length})
                </button>
              </div>
            )}
          </div>
        )}

        {filteredPorts.map((entry) => {
          const port = typeof entry === "number" ? entry : entry.port;
          const pid = typeof entry === "object" ? entry.pid : null;
          const name = typeof entry === "object" ? entry.name : "";
          const url = `http://localhost:${port}`;
          const busy = busyPort === port;
          return (
            <div
              key={port}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
                margin: "4px 0", background: "#252526", border: "1px solid #2d2d2d", borderRadius: 4,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ec9b0", flexShrink: 0, boxShadow: "0 0 6px rgba(78,201,176,0.4)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Consolas, monospace", fontSize: 12, color: "#d4d4d4" }}>{url}</div>
                {(pid || name) ? <div style={{ fontSize: 10, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name ? `${name} ` : ""}{pid ? `PID ${pid}` : ""}</div> : null}
              </div>
              <button
                onClick={() => copyUrl(url)}
                style={{ background: "none", border: "1px solid transparent", color: "#888", cursor: "pointer", fontSize: 11, padding: "2px 6px", borderRadius: 3 }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#3c3c3c"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                title="Copy URL"
              >
                Copy
              </button>
              <button
                onClick={() => openInBrowser(url)}
                style={{ background: "#0e639c", border: "none", color: "#fff", cursor: "pointer", fontSize: 11, padding: "3px 8px", borderRadius: 3 }}
                title="Open in Browser panel"
              >
                Open
              </button>
              <button
                onClick={() => handleKill(port)}
                disabled={busy}
                style={{ background: busy ? "#3a3a3a" : "#5a1d1d", border: "none", color: busy ? "#888" : "#ff7b72", cursor: busy ? "default" : "pointer", fontSize: 11, padding: "3px 8px", borderRadius: 3, opacity: busy ? 0.6 : 1 }}
                title="Kill process on this port"
              >
                Kill
              </button>
              <button
                onClick={() => handleRestart(port)}
                disabled={busy}
                style={{ background: busy ? "#3a3a3a" : "#2d2d2d", border: "1px solid #3a3a3a", color: busy ? "#888" : "#d4d4d4", cursor: busy ? "default" : "pointer", fontSize: 11, padding: "3px 8px", borderRadius: 3, opacity: busy ? 0.6 : 1 }}
                title="Restart (kill) — start again manually"
              >
                Restart
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderTop: "1px solid #2d2d2d", background: "#252526" }}>
        <input
          value={manualPort}
          onChange={(e) => setManualPort(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={(e) => { if (e.key === "Enter" && manualPort) { openInBrowser(`http://localhost:${manualPort}`); setManualPort(""); } }}
          placeholder="Port (e.g. 5173)"
          style={{ flex: 1, background: "#1e1e1e", border: "1px solid #3a3a3a", color: "#ccc", padding: "5px 8px", borderRadius: 3, fontSize: 11, outline: "none" }}
        />
        <button
          onClick={() => { if (manualPort) { openInBrowser(`http://localhost:${manualPort}`); setManualPort(""); } }}
          disabled={!manualPort}
          style={{ background: manualPort ? "#0e639c" : "#2d2d2d", border: "none", color: manualPort ? "#fff" : "#666", padding: "5px 12px", borderRadius: 3, cursor: manualPort ? "pointer" : "default", fontSize: 11, opacity: manualPort ? 1 : 0.6 }}
        >
          Go
        </button>
      </div>

      <div style={{ padding: "6px 12px", fontSize: 10, color: "#666", borderTop: "1px solid #2d2d2d", background: "#1e1e1e", display: "flex", justifyContent: "space-between" }}>
        <span>Auto-refresh every 15s • {onlyProject ? "This project" : "All ports"}</span>
        <span>{filteredPorts.length > 0 ? `${filteredPorts.length}${onlyProject && ports.length !== filteredPorts.length ? `/${ports.length}` : ""} active` : "Idle"}</span>
      </div>
    </div>
  );
};

export default PortManager;