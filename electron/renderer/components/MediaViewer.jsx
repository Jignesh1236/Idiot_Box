import React, { useState, useCallback, useEffect, useRef } from "react";
import { resolveInternalDraggedPaths } from "./shared/dragDrop.js";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico",
                    ".avif", ".tiff", ".tif", ".apng", ".jfif", ".pjpeg", ".pjp"];
// Chromium-native video formats
const VIDEO_EXTS_SUPPORTED   = [".mp4", ".webm", ".ogg"];
const VIDEO_EXTS_UNSUPPORTED = [".avi", ".mov", ".mkv", ".wmv", ".flv", ".m4v", ".3gp", ".ts", ".mts"];
const VIDEO_EXTS             = [...VIDEO_EXTS_SUPPORTED, ...VIDEO_EXTS_UNSUPPORTED];
// Chromium-native audio formats
const AUDIO_EXTS = [".mp3", ".wav", ".flac", ".aac", ".m4a", ".opus", ".oga", ".weba"];
const TEXT_EXTS  = [
  ".txt", ".md", ".mdx", ".rst", ".json", ".jsonc", ".js", ".jsx", ".mjs", ".cjs",
  ".ts", ".tsx", ".html", ".htm", ".css", ".scss", ".sass", ".less",
  ".py", ".xml", ".yaml", ".yml", ".ini", ".cfg", ".log", ".sh", ".bash", ".zsh",
  ".bat", ".ps1", ".sql", ".rb", ".php", ".c", ".cpp", ".cc", ".h", ".hpp", ".hh",
  ".java", ".rs", ".go", ".toml", ".lock", ".env", ".gitignore", ".editorconfig",
  ".cs", ".swift", ".kt", ".dart", ".r", ".lua", ".pl", ".ex", ".exs", ".erl",
];

const ext      = (p) => { try { return p.slice(p.lastIndexOf(".")).toLowerCase(); } catch { return ""; } };
const fileName = (p) => { try { return p.split(/[\\/]/).pop(); } catch { return p; } };

// Convert a filesystem path to a file:// URL
const toFileUrl = (p) => {
  if (!p) return null;
  const normalized = p.replace(/\\/g, "/");
  return "file:///" + (normalized.startsWith("/") ? normalized.slice(1) : normalized);
};

// ── Icon components ────────────────────────────────────────────────────────────
const AudioIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="#2a2a3a" stroke="#5a5a8a" strokeWidth="1"/>
    <path d="M9 8v8l7-4-7-4z" fill="#7a7acc"/>
    <circle cx="12" cy="12" r="9.5" stroke="#5a5a8a" strokeWidth="1" fill="none"/>
  </svg>
);

const FileIcon = ({ color = "#5a9fd4" }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#2a2a2a" stroke={color} strokeWidth="1.2"/>
    <path d="M14 2v6h6" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
    <path d="M8 13h8M8 17h5" stroke={color} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const MediaViewer = () => {
  const [filePath, setFilePath] = useState(null);
  const [content,  setContent]  = useState(null);
  const [type,     setType]     = useState(null);   // "image" | "video" | "audio" | "text" | "unknown"
  const [error,    setError]    = useState(null);
  const dropRef = useRef(null);

  const openFile = useCallback(async (fp) => {
    if (!fp) return;
    setError(null);
    setContent(null);
    setType(null);
    const e = ext(fp);

    // ── Images — use file:// URL directly so there's no size cap and all
    //   formats Chromium can natively decode (PNG, JPEG, GIF, WebP, AVIF,
    //   TIFF, SVG, ICO, APNG, …) just work without a MIME-type allowlist.
    if (IMAGE_EXTS.includes(e)) {
      const url = toFileUrl(fp);
      if (url) {
        setContent(url); setType("image"); setFilePath(fp);
      } else {
        setError(`Could not resolve path: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    // ── Supported video ────────────────────────────────────────────────────
    if (VIDEO_EXTS_SUPPORTED.includes(e)) {
      const url = toFileUrl(fp);
      if (url) {
        setContent(url); setType("video"); setFilePath(fp);
      } else {
        setError(`Could not resolve path: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    // ── Unsupported video — clear message ─────────────────────────────────
    if (VIDEO_EXTS_UNSUPPORTED.includes(e)) {
      setError(`${e.slice(1).toUpperCase()} videos cannot be played here. Convert to MP4 or WebM first.`);
      setFilePath(fp);
      return;
    }

    // ── Audio (file:// URL, no size cap) ──────────────────────────────────
    if (AUDIO_EXTS.includes(e)) {
      const url = toFileUrl(fp);
      if (url) {
        setContent(url); setType("audio"); setFilePath(fp);
      } else {
        setError(`Could not resolve path: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    // ── Text / code ────────────────────────────────────────────────────────
    if (TEXT_EXTS.includes(e)) {
      const text = await window.electronAPI.readTextFile(fp);
      if (text !== null) {
        setContent(text); setType("text"); setFilePath(fp);
      } else {
        setError(`Failed to read file: ${fileName(fp)}`);
        setFilePath(fp);
      }
      return;
    }

    // ── Unknown type — show info card ─────────────────────────────────────
    setType("unknown");
    setContent(null);
    setFilePath(fp);
  }, []);

  // ── External "open in media viewer" event ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => { openFile(e.detail.path); };
    window.addEventListener("media-viewer:open", handler);
    return () => window.removeEventListener("media-viewer:open", handler);
  }, [openFile]);

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  // NOTE: onDragOver / onDrop are on the outermost div so they catch all children.
  // Children must NOT call stopPropagation on drag events (they don't).
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // #region debug-point B:media-viewer-drop
    fetch("http://127.0.0.1:7778/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"media-viewer-drop",runId:"pre-fix",hypothesisId:"B",location:"MediaViewer.jsx:handleDrop",msg:"[DEBUG] Media Viewer drop received",data:{hasWindowPaths:!!window.__ppooDragPaths?.length,types:Array.from(e.dataTransfer?.types||[]),hasCustomPayload:!!e.dataTransfer?.getData("application/ppoo-paths"),hasUriList:!!e.dataTransfer?.getData("text/uri-list"),fileCount:e.dataTransfer?.files?.length||0},ts:Date.now()})}).catch(()=>{});
    // #endregion

    let path = resolveInternalDraggedPaths(e, {
      consumeGlobal: false,
      includeUriList: true,
    })?.[0] ?? null;

    // External files dropped from OS file manager
    if (!path) {
      const files = Array.from(e.dataTransfer.files);
      const file = files[0];
      if (file) {
        path = window.electronAPI.getPathForFile?.(file) ?? null;
      }
    }

    // #region debug-point B:media-viewer-path
    fetch("http://127.0.0.1:7778/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"media-viewer-drop",runId:"pre-fix",hypothesisId:"B",location:"MediaViewer.jsx:handleDrop:path",msg:"[DEBUG] Media Viewer resolved drop path",data:{path,hasJsonType:!!e.dataTransfer.getData("application/ppoo-paths"),hasUriList:!!e.dataTransfer.getData("text/uri-list"),hasWindowPaths:!!window.__ppooDragPaths?.length},ts:Date.now()})}).catch(()=>{});
    // #endregion
    if (path) openFile(path);
  }, [openFile]);

  // ── Paste a file path ────────────────────────────────────────────────────────
  const handlePaste = useCallback((e) => {
    const text = (e.clipboardData || window.clipboardData)?.getData("text");
    if (!text) return;
    if (/^[a-zA-Z]:[\\/]/.test(text) || /^\//.test(text)) {
      openFile(text.trim());
    }
  }, [openFile]);

  const handleClose = useCallback(() => {
    setFilePath(null); setContent(null); setType(null); setError(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="panel"
      ref={dropRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", outline: "none" }}
    >
      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!filePath && !error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#555", fontSize: 13, flexDirection: "column", gap: 10 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="#444" strokeWidth="1.2" fill="none"/>
            <path d="M8 10l3 3 5-5" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ textAlign: "center", lineHeight: 1.5 }}>
            Drop any file here<br/>
            <span style={{ fontSize: 11, color: "#444" }}>or right-click a file → Open in Media Viewer</span>
          </span>
        </div>
      )}

      {/* ── Title bar ────────────────────────────────────────────────────── */}
      {filePath && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", flexShrink: 0, fontSize: 12, color: "#999" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#888" style={{ cursor: "pointer", flexShrink: 0 }}
            onClick={handleClose} title="Close">
            <path d="M4 4l8 8M12 4l-8 8" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} title={filePath}>{fileName(filePath)}</span>
          <span style={{ fontSize: 10, color: "#555", flexShrink: 0 }}>{ext(filePath)}</span>
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}>

        {error && (
          <div style={{ color: "#f44747", fontSize: 13, textAlign: "center", padding: "0 24px", maxWidth: 420, lineHeight: 1.6 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚠</div>
            {error}
          </div>
        )}

        {type === "image" && content && (
          <img
            src={content}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            alt=""
            onError={() => setError(`Failed to render image. The file may be corrupt or use an unsupported color profile.`)}
          />
        )}

        {type === "video" && content && (
          <video
            key={content}
            controls
            autoPlay={false}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            src={content}
            onError={() => setError(`Failed to play video. The file may be corrupted or use an unsupported codec.`)}
          />
        )}

        {type === "audio" && content && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "0 24px", width: "100%", maxWidth: 500 }}>
            <AudioIcon />
            <span style={{ fontSize: 13, color: "#888", textAlign: "center" }}>{fileName(filePath)}</span>
            <audio
              key={content}
              controls
              autoPlay={false}
              style={{ width: "100%" }}
              src={content}
              onError={() => setError(`Failed to play audio. The file may be corrupted or use an unsupported codec.`)}
            />
          </div>
        )}

        {type === "text" && content !== null && (
          <pre style={{
            margin: 0, padding: 12,
            color: "#c8c8c8", fontSize: 12,
            fontFamily: 'Consolas, "Courier New", monospace',
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            width: "100%", height: "100%",
            boxSizing: "border-box", alignSelf: "flex-start",
          }}>
            {content}
          </pre>
        )}

        {type === "unknown" && filePath && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "0 24px", textAlign: "center" }}>
            <FileIcon color="#5a9fd4" />
            <div>
              <div style={{ fontSize: 14, color: "#c8c8c8", marginBottom: 4 }}>{fileName(filePath)}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {ext(filePath) ? `${ext(filePath)} file` : "Unknown file type"}
              </div>
            </div>
            <button
              onClick={() => window.electronAPI.openFile(filePath, "system")}
              style={{
                background: "#1e3a5f", border: "1px solid #2a5a9f",
                color: "#79b8ff", borderRadius: 4,
                padding: "6px 18px", cursor: "pointer", fontSize: 12,
              }}
            >
              Open with System Default
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
