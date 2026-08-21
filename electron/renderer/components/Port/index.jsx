// Port Manager Panel — Shows common development ports with one-click access
import React, { useEffect, useState } from "react";

const PortPanel = () => {
  const [ports, setPorts] = useState([]);
  const [scanning, setScanning] = useState(false);

  const scanPorts = async () => {
    setScanning(true);
    try {
      const result = await window.electronAPI.scanPorts();
      setPorts(result || []);
    } catch {
      setPorts([]);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    // Initial scan
    scanPorts();
    // Re-scan every 30 seconds
    const interval = setInterval(scanPorts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: 12,
      background: "#1e1e1e",
      color: "#cccccc",
      fontFamily: "sans-serif",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
        borderBottom: "1px solid #3a3a3a",
        paddingBottom: 8,
      }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>Port Manager</h3>
        <button
          onClick={scanPorts}
          style={{
            background: "none", border: "1px solid #3a3a3a", color: "#888",
            padding: "4px 8px", borderRadius: 3, cursor: "pointer", fontSize: 11,
          }}
          title="Scan for running ports"
        >
          Scan
        </button>
      </div>

      {scanning && (
        <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
          Scanning for ports...
        </div>
      )}

      {!scanning && ports.length === 0 && (
        <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
          No ports running. Click "Scan" to check.
        </div>
      )}

      <div style={{ marginTop: 12, maxHeight: 300, overflowY: "auto" }}>
        {ports.map((port) => (
          <div
            key={port}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "4px 8px",
              margin: "2px 0", background: "#252526", borderRadius: 3,
            }}
          >
            <span style={{ flex: 1, fontFamily: "monospace", fontSize: 12 }}>
              http://localhost:{port}
            </span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("add-browser-panel", { detail: { url: `http://localhost:${port}`, config: { type: "browser", title: `localhost:${port}`, url: `http://localhost:${port}` } } }))}
              style={{
                background: "none", border: "none", color: "#0645ad", cursor: "pointer", fontSize: 11,
                padding: 0,
              }}
              title="Open in browser"
            >
              ▶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortPanel;