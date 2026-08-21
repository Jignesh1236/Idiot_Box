// Standalone Port Manager Panel — Shows running development ports with management actions
import React, { useEffect, useState, useRef } from "react";

const PortManager = () => {
  const [ports, setPorts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const ref = useRef(null);

  const scanPorts = () => {
    setScanning(true);
    window.electronAPI.onMenuEvent("panel:addMenu", (result) => {
      setPorts(result || []);
      setScanning(false);
    });
  };

  useEffect(() => {
    scanPorts();
    // Re-scan every 15 seconds
    const interval = setInterval(scanPorts, 15000);
    return () => clearInterval(interval);
  }, []);

  const openInBrowser = (url) => {
    window.electronAPI.openUrl(url);
  };

  return (
    <div ref={ref} style={{
      padding: 8,
      background: "#1e1e1e",
      color: "#cccccc",
      fontFamily: "sans-serif",
      border: "1px solid #3a3a3a",
      borderRadius: 4,
      margin: 4,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #3a3a3a",
      }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>Port Manager</h4>
        <button
          onClick={scanPorts}
          style={{
            background: "none", border: "1px solid #3a3a3a", color: "#888",
            padding: "3px 6px", borderRadius: 3, cursor: "pointer", fontSize: 10,
          }}
          title="Scan for running ports"
        >
          ✓
        </button>
      </div>

      {scanning && (
        <div style={{ textAlign: "center", padding: 10, color: "#666" }}>
          Scanning...
        </div>
      )}

      {!scanning && ports.length === 0 && (
        <div style={{ textAlign: "center", padding: 10, color: "#666" }}>
          No ports running
        </div>
      )}

      <div style={{ marginTop: 6, maxHeight: 200, overflowY: "auto" }}>
        {ports.map((port) => (
          <div
            key={port}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "4px 0",
              margin: "2px 0", borderRadius: 3,
            }}
          >
            <span style={{ flex: 1, fontFamily: "monospace", fontSize: 11, minWidth: 100 }}>
              http://localhost:{port}
            </span>
            <button
              onClick={() => openInBrowser(`http://localhost:${port}`)}
              style={{
                background: "none", border: "none", color: "#0645ad", cursor: "pointer", fontSize: 10,
                padding: 0,
              }}
              title="Open in browser"
            >
              ▶
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 6, fontSize: 10, color: "#666" }}>
        Auto-refresh every 15s
      </div>
    </div>
  );
};

export default PortManager;