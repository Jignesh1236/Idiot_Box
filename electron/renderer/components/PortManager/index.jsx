// Unified Port Manager — Single panel for Port Scanner + Port Manager
import React, { useEffect, useState, useRef, useCallback } from "react";

const PortManager = () => {
  const [ports, setPorts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [manualPort, setManualPort] = useState("");
  const ref = useRef(null);

  const scanPorts = useCallback(async () => {
    setScanning(true);
    try {
      const result = await window.electronAPI.scanPorts();
      const list = Array.isArray(result) ? result : [];
      // Filter out obviously non-web ports if list is huge, keep first 20
      setPorts(list.slice(0, 30));
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

  return (
    <div ref={ref} style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#1e1e1e", color: "#cccccc", fontFamily: "sans-serif",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderBottom: "1px solid #2d2d2d",
        background: "#252526", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#569cd6" strokeWidth="1.2" fill="none" />
            <path d="M6 8H10M8 6V10" stroke="#569cd6" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0" }}>Port Manager</span>
          <span style={{ fontSize: 10, color: "#888", background: "#2d2d2d", padding: "1px 6px", borderRadius: 3 }}>{ports.length} running</span>
        </div>
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

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {scanning && ports.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#666", fontSize: 12 }}>
            Scanning for ports...
          </div>
        )}

        {!scanning && ports.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#666", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>∅</div>
            No ports running<br />
            <span style={{ fontSize: 11 }}>Start a dev server (vite, next, etc.) and click Scan</span>
          </div>
        )}

        {ports.map((port) => {
          const url = `http://localhost:${port}`;
          return (
            <div
              key={port}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                margin: "4px 0", background: "#252526", border: "1px solid #2d2d2d", borderRadius: 4,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ec9b0", flexShrink: 0, boxShadow: "0 0 6px rgba(78,201,176,0.4)" }} />
              <span style={{ flex: 1, fontFamily: "Consolas, monospace", fontSize: 12, color: "#d4d4d4" }}>
                {url}
              </span>
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
                style={{ background: "#0e639c", border: "none", color: "#fff", cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 3 }}
                title="Open in Browser panel"
              >
                Open
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
        <span>Auto-refresh every 15s</span>
        <span>{ports.length > 0 ? `${ports.length} active` : "Idle"}</span>
      </div>
    </div>
  );
};

export default PortManager;