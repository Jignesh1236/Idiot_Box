// Log Panel — Displays application logs and output
import React, { useEffect, useState, useRef } from "react";

const LogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize with some sample logs
    const sampleLogs = [
      "📦 App started",
      "🌐 Loading extensions...",
      "✅ Extensions loaded",
      "📁 Project panel ready",
      "⌨️ Terminal panel ready",
    ];
    setLogs(sampleLogs);
  }, []);

  const addLog = (message) => {
    setLogs((prev) => {
      const newLogs = [...prev, message];
      // Keep last 50 logs
      return newLogs.length > 50 ? newLogs.slice(-50) : newLogs;
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] ${input}`);
    setInput("");
    // Auto-scroll to bottom
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear logs on escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setLogs([]);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div style={{
      padding: 12,
      background: "#1e1e1e",
      color: "#cccccc",
      fontFamily: "monospace",
      fontSize: 12,
      overflow: "auto",
      height: "100%",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #3a3a3a",
      }}>
        <span>Log Panel</span>
        <button
          onClick={() => setLogs([])}
          style={{ background: "none", border: "none", color: "#666", fontSize: 11, cursor: "pointer" }}
          title="Clear logs"
        >
          ✕
        </button>
      </div>

      <div style={{ height: "calc(100% - 40px)", overflowY: "auto", marginBottom: 8 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ margin: "4px 0", whiteSpace: "pre-wrap" }}>
            {log}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 8, padding: "4px 0", borderTop: "1px solid #3a3a3a",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Type a command or press ESC to clear"
          style={{
            flex: 1, background: "#252525", border: "none", padding: "6px 8px",
            color: "#cccccc", fontSize: 12, outline: "none",
          }}
        />
        <button onClick={handleSend} style={{ background: "none", border: "none", color: "#0645ad", fontSize: 11, cursor: "pointer" }}>
          Go
        </button>
      </div>
    </div>
  );
};

export default LogPanel;