// Git Panel — shows git status, diff, and quick actions
import React, { useEffect, useState, useCallback } from "react";

const GitPanel = () => {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectPath, setProjectPath] = useState(window.__currentProjectPath || null);

  useEffect(() => {
    const onOpen = (e) => setProjectPath(e.detail?.path || window.__currentProjectPath || null);
    const onClose = () => setProjectPath(null);
    window.addEventListener("project:opened", onOpen);
    window.addEventListener("project:closed", onClose);
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

  const refresh = useCallback(async () => {
    if (!projectPath) { setStatus([]); return; }
    setLoading(true);
    try {
      const res = await window.electronAPI.gitStatus(projectPath);
      setStatus(Array.isArray(res) ? res : []);
    } catch {
      setStatus([]);
    } finally {
      setLoading(false);
    }
  }, [projectPath]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  const openFile = (rel) => {
    const full = projectPath ? `${projectPath}/${rel}`.replace(/\\/g, "/").replace(/\/\//g, "/") : rel;
    // On Windows, need to handle path
    const normalized = full.replace(/\//g, "\\");
    window.dispatchEvent(new CustomEvent("open-file-in-editor", { detail: { path: normalized } }));
  };

  const getStatusColor = (s) => {
    if (s.includes("M")) return "#cca700";
    if (s.includes("A")) return "#73c991";
    if (s.includes("D")) return "#f44747";
    if (s.includes("?")) return "#73c991";
    if (s.includes("R")) return "#569cd6";
    return "#888";
  };
  const getStatusLabel = (s) => {
    if (s === "M" || s === " M") return "Modified";
    if (s === "A" || s === " A") return "Added";
    if (s === "D") return "Deleted";
    if (s === "??") return "Untracked";
    if (s === "R") return "Renamed";
    if (s === "MM") return "Modified";
    return s.trim() || "Changed";
  };

  if (!projectPath) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#666", fontSize: 12, flexDirection: "column", gap: 8 }}>
        <span>No project open</span>
        <span style={{ fontSize: 11, color: "#555" }}>Open a git repo to see status</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#1e1e1e", color: "#cccccc", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#252526", borderBottom: "1px solid #2d2d2d", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2H5L7 4.5H13.5A1.5 1.5 0 0 1 15 6V12.5A1.5 1.5 0 0 1 13.5 14H3.5A1.5 1.5 0 0 1 2 12.5V3.5Z" fill="#f14e32" /></svg>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Git</span>
          <span style={{ fontSize: 10, background: status.length ? "#0e639c" : "#2d2d2d", color: status.length ? "#fff" : "#888", padding: "1px 6px", borderRadius: 3 }}>{status.length} changes</span>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{ background: "none", border: "1px solid #3a3a3a", color: "#888", padding: "3px 8px", borderRadius: 3, cursor: loading ? "default" : "pointer", fontSize: 11 }}
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 4 }}>
        {status.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: 24, color: "#666", fontSize: 12 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>✓</div>
            No changes<br />
            <span style={{ fontSize: 11, color: "#555" }}>Working tree clean</span>
          </div>
        )}
        {status.map((item, i) => (
          <div
            key={`${item.rel}:${i}`}
            onClick={() => openFile(item.rel)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
              cursor: "pointer", borderBottom: "1px solid #2d2d2d", fontSize: 12,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2d2e"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            title={item.rel}
          >
            <span style={{
              width: 22, textAlign: "center", fontSize: 11, fontWeight: 700,
              color: getStatusColor(item.status), background: "#2d2d2d", padding: "1px 4px", borderRadius: 2, flexShrink: 0,
            }}>
              {item.status.trim() || "?"}
            </span>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#cccccc" }}>
              {item.rel}
            </span>
            <span style={{ fontSize: 11, color: getStatusColor(item.status), flexShrink: 0 }}>{getStatusLabel(item.status)}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "6px 12px", fontSize: 10, color: "#666", borderTop: "1px solid #2d2d2d", display: "flex", justifyContent: "space-between" }}>
        <span>{projectPath.split(/[\\/]/).pop()}</span>
        <span>{status.length} changes</span>
      </div>
    </div>
  );
};

export default GitPanel;
