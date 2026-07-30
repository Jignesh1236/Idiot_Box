import React, { useState, useCallback, useEffect, useRef } from "react";

const TEXT_EXTS  = [".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".py", ".xml", ".yaml", ".yml", ".ini", ".cfg", ".log", ".sh", ".bat", ".ps1", ".sql", ".rb", ".php", ".c", ".cpp", ".h", ".hpp", ".java", ".rs", ".go", ".toml"];
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
// FIX: track which video formats are natively supported by the browser element
const VIDEO_EXTS_SUPPORTED   = [".mp4", ".webm"]; // Chromium can play these
const VIDEO_EXTS_UNSUPPORTED = [".avi", ".mov", ".mkv", ".wmv", ".flv"]; // Chromium cannot
const VIDEO_EXTS             = [...VIDEO_EXTS_SUPPORTED, ...VIDEO_EXTS_UNSUPPORTED];

const ext      = (p) => { try { return p.slice(p.lastIndexOf(".")).toLowerCase(); } catch { return ""; } };
const fileName = (p) => { try { return p.split(/[\\/]/).pop(); } catch { return p; } };

// FIX: convert a file system path to a file:// URL
// Works on Windows (C:\path → file:///C:/path) and Unix (/path → file:///path)
const toFileUrl = (p) => {
  if (!p) return null;
  // Windows: backslashes → forward slashes
  const normalized = p.replace(/\\/g, "/");
  return "file:///" + (normalized.startsWith("/") ? normalized.slice(1) : normalized);
};

const MediaViewer = () => {
  const [filePath, setFilePath] = useState(null);
  const [content,  setContent]  = useState(null);
  const [type,     setType]     = useState(null);
  const [error,    setError]    = useState(null);
  const dropRef = useRef(null);

  const openFile = useCallback(async (fp) => {
    if (!fp) return;
    setError(null);
    setContent(null);
    setType(null);
    const e = ext(fp);

    if (IMAGE_EXTS.includes(e)) {
      const data = await window.electronAPI.readFileAsDataUrl(fp);
      if (data) {
        setContent(data);
        setType("image");
        setFilePath(fp);
      } else {
        setError(`Failed to load image: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    if (VIDEO_EXTS_SUPPORTED.includes(e)) {
      // FIX: use file:// URL directly — avoids the 10 MB data-URL cap
      const fileUrl = toFileUrl(fp);
      if (fileUrl) {
        setContent(fileUrl);
        setType("video");
        setFilePath(fp);
      } else {
        setError(`Could not resolve path: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    if (VIDEO_EXTS_UNSUPPORTED.includes(e)) {
      // FIX: show a clear message instead of "Failed to load video"
      setError(`${e.toUpperCase().slice(1)} videos are not supported. Convert to MP4 or WebM first.`);
      setFilePath(fp);
      return;
    }

    if (TEXT_EXTS.includes(e)) {
      const text = await window.electronAPI.readTextFile(fp);
      if (text !== null) {
        setContent(text);
        setType("text");
        setFilePath(fp);
      } else {
        setError(`Failed to read file: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    setError(`Unsupported file type: ${e || "(no extension)"}`);
    setFilePath(fp);
  }, []);

  useEffect(() => {
    const handler = (e) => { openFile(e.detail.path); };
    window.addEventListener("media-viewer:open", handler);
    return () => window.removeEventListener("media-viewer:open", handler);
  }, [openFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (!file) return;
    // FIX: getPathForFile can return null/undefined — guard before calling openFile
    const path = window.electronAPI.getPathForFile?.(file);
    if (path) openFile(path);
  }, [openFile]);

  const handlePaste = useCallback((e) => {
    const text = (e.clipboardData || window.clipboardData)?.getData("text");
    if (!text) return;
    // FIX: handle both Windows paths (C:\...) and Unix paths (/home/... or /Users/...)
    if (/^[a-zA-Z]:[\\/]/.test(text) || /^\//.test(text)) {
      openFile(text.trim());
    }
  }, [openFile]);

  const handleClose = useCallback(() => {
    setFilePath(null);
    setContent(null);
    setType(null);
    setError(null);
  }, []);

  return (
    <div
      className="panel"
      ref={dropRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
    >
      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!filePath && !error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#555", fontSize: 13, flexDirection: "column", gap: 8 }}>
          <svg width="32" height="32" viewBox="0 0 16 16" fill="#444">
            <path d="M2 2h5l2 2h5v9H2V2z"/>
          </svg>
          <span>Drop files here or right-click a file → Open in Media Viewer</span>
        </div>
      )}

      {/* ── Title bar ───────────────────────────────────────────────── */}
      {filePath && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", flexShrink: 0, fontSize: 12, color: "#999" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#888" style={{ cursor: "pointer", flexShrink: 0 }}
            onClick={handleClose}
            title="Close"
          >
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} title={filePath}>{fileName(filePath)}</span>
        </div>
      )}

      {/* ── Content area ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}>
        {error && (
          <div style={{ color: "#f44747", fontSize: 13, textAlign: "center", padding: "0 20px", maxWidth: 400, lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        {type === "image" && content && (
          <img src={content} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="" />
        )}

        {type === "video" && content && (
          <video
            key={content}
            controls
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            src={content}
            onError={() => setError(`Failed to play video. The file may be corrupted or use an unsupported codec.`)}
          />
        )}

        {type === "text" && content !== null && (
          <pre style={{ margin: 0, padding: 12, color: "#c8c8c8", fontSize: 12, fontFamily: 'Consolas, "Courier New", monospace', whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%", height: "100%", boxSizing: "border-box", alignSelf: "flex-start" }}>
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
