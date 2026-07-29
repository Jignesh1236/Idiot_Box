import React, { useState, useCallback, useEffect, useRef } from "react";

const TEXT_EXTS = [".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".py", ".xml", ".yaml", ".yml", ".ini", ".cfg", ".log", ".sh", ".bat", ".ps1", ".sql", ".rb", ".php", ".c", ".cpp", ".h", ".hpp", ".java", ".rs", ".go", ".toml"];
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
const VIDEO_EXTS = [".mp4", ".webm", ".avi", ".mov", ".mkv", ".wmv", ".flv"];

const ext = (p) => { try { return p.slice(p.lastIndexOf(".")).toLowerCase(); } catch { return ""; } };
const fileName = (p) => { try { return p.split(/[\\/]/).pop(); } catch { return p; } };

const Panel1 = () => {
  const [filePath, setFilePath] = useState(null);
  const [content, setContent] = useState(null);
  const [type, setType] = useState(null);
  const [error, setError] = useState(null);
  const dropRef = useRef(null);

  const openFile = useCallback(async (fp) => {
    setError(null);
    setContent(null);
    setType(null);
    const e = ext(fp);
    if (IMAGE_EXTS.includes(e)) {
      const data = await window.electronAPI.readFileAsDataUrl(fp);
      if (data) { setContent(data); setType("image"); setFilePath(fp); }
      else setError("Failed to load image");
    } else if (VIDEO_EXTS.includes(e)) {
      const data = await window.electronAPI.readFileAsDataUrl(fp);
      if (data) { setContent(data); setType("video"); setFilePath(fp); }
      else setError("Failed to load video");
    } else if (TEXT_EXTS.includes(e)) {
      const text = await window.electronAPI.readTextFile(fp);
      if (text !== null) { setContent(text); setType("text"); setFilePath(fp); }
      else setError("Failed to read file");
    } else {
      setError(`Unsupported file type: ${e}`);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { openFile(e.detail.path); };
    window.addEventListener("media-viewer:open", handler);
    return () => window.removeEventListener("media-viewer:open", handler);
  }, [openFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (!file) return;
    const path = window.electronAPI.getPathForFile(file);
    if (path) openFile(path);
  }, [openFile]);

  const handlePaste = useCallback((e) => {
    const text = (e.clipboardData || window.clipboardData)?.getData("text");
    if (text && /^[a-zA-Z]:[\\/]/.test(text)) openFile(text);
  }, [openFile]);

  return (
    <div className="panel" ref={dropRef}
      onDragOver={handleDragOver} onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
    >
      {!filePath && !error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#555", fontSize: 13, flexDirection: "column", gap: 8 }}>
          <svg width="32" height="32" viewBox="0 0 16 16" fill="#444">
            <path d="M2 2h5l2 2h5v9H2V2z"/>
          </svg>
          <span>Drop files here or right-click a file → Open in Media Viewer</span>
        </div>
      )}

      {filePath && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", flexShrink: 0, fontSize: 12, color: "#999" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#888" style={{ cursor: "pointer" }}
            onClick={() => { setFilePath(null); setContent(null); setType(null); setError(null); }}
            title="Close"
          >
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} title={filePath}>{fileName(filePath)}</span>
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}>
        {error && <div style={{ color: "#f44747", fontSize: 13 }}>{error}</div>}

        {type === "image" && content && (
          <img src={content} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="" />
        )}

        {type === "video" && content && (
          <video controls style={{ maxWidth: "100%", maxHeight: "100%" }} src={content} />
        )}

        {type === "text" && content !== null && (
          <pre style={{ margin: 0, padding: 12, color: "#c8c8c8", fontSize: 12, fontFamily: 'Consolas, "Courier New", monospace', whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%", height: "100%" }}>
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Panel1;