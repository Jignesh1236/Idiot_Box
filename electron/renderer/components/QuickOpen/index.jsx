// QuickOpen — Ctrl+P fuzzy file finder
import React, { useState, useEffect, useRef } from "react";

const QuickOpen = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchFiles = async (q) => {
    const root = window.__currentProjectPath;
    if (!root) { setFiles([]); return; }
    setLoading(true);
    try {
      const res = await window.electronAPI.findFiles(root, q, 80);
      setFiles(Array.isArray(res) ? res : []);
      setIdx(0);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFiles(query), query ? 120 : 80);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  useEffect(() => {
    const show = () => {
      setQuery("");
      setFiles([]);
      setIdx(0);
      setOpen(true);
      // Preload all files for empty query
      fetchFiles("");
    };
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "p") {
        // Don't trigger if inside input/textarea where Ctrl+P is not expected
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") {
          // Still allow in editor? For now, always handle
        }
        e.preventDefault();
        e.stopPropagation();
        show();
      }
    };
    const unsub = window.electronAPI.onMenuEvent ? window.electronAPI.onMenuEvent("menu:find", () => {}) : () => {};
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("quickopen:open", show);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("quickopen:open", show);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const openFile = (item) => {
    setOpen(false);
    if (!item?.path) return;
    window.dispatchEvent(new CustomEvent("open-file-in-editor", { detail: { path: item.path } }));
  };

  if (!open) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 950 }} onClick={() => setOpen(false)} />
      <div
        style={{
          position: "fixed", top: "12%", left: "50%", transform: "translateX(-50%)",
          width: 640, maxWidth: "90vw", zIndex: 951,
          background: "#252526", border: "1px solid #3a3a3a", borderRadius: 6,
          boxShadow: "0 12px 48px rgba(0,0,0,0.65)", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#1e1e1e", borderBottom: "1px solid #3a3a3a" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2H9L12 5V13H4V2Z" stroke="#888" strokeWidth="1.2" /><path d="M9 2V5H12" stroke="#888" strokeWidth="1.2" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, files.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); openFile(files[idx]); }
              else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
            }}
            placeholder="Type file name… (Ctrl+P)"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#dddddd", fontSize: 13, outline: "none",
            }}
          />
          {loading && <span style={{ fontSize: 11, color: "#666" }}>…</span>}
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {!window.__currentProjectPath && (
            <div style={{ padding: 16, fontSize: 12, color: "#666", textAlign: "center" }}>Open a project first</div>
          )}
          {window.__currentProjectPath && files.length === 0 && !loading && (
            <div style={{ padding: 16, fontSize: 12, color: "#666", textAlign: "center" }}>{query ? "No files match" : "No files found"}</div>
          )}
          {files.map((item, i) => (
            <div
              key={item.path}
              onClick={() => openFile(item)}
              onMouseEnter={() => setIdx(i)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 12px",
                cursor: "pointer", fontSize: 12.5,
                background: i === idx ? "#094771" : "transparent", color: i === idx ? "#ffffff" : "#cccccc",
                borderBottom: "1px solid #2d2d2d",
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: i === idx ? "#bbbbbb" : "#777", marginLeft: 8 }}>{item.rel}</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: "4px 12px", fontSize: 10, color: "#666", borderTop: "1px solid #2d2d2d", display: "flex", justifyContent: "space-between" }}>
          <span>↑↓ Navigate • Enter Open • Esc Close</span>
          <span>{files.length} files</span>
        </div>
      </div>
    </>
  );
};

export default QuickOpen;
