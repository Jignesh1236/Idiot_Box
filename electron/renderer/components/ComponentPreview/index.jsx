import React, { useState, useEffect, useRef, useCallback } from "react";

// Error Boundary to catch runtime errors inside previewed user components
class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Preview Runtime Error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 16,
          background: "#2a1717",
          border: "1px solid #732222",
          borderRadius: 6,
          color: "#f44747",
          fontSize: 12,
          fontFamily: "Consolas, monospace",
          maxWidth: 600,
          margin: 16,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Runtime Error in Component</div>
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {this.state.error?.message || String(this.state.error)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Built-in sample component shown with temp data ──────────────────────────
const SAMPLE_TEMP_DATA = [
  { id: 1, name: "Alice Kumar", role: "UI Designer",    status: "Active",  color: "#4ec9b0" },
  { id: 2, name: "Bob Sharma",  role: "Full-stack Dev", status: "Active",  color: "#569cd6" },
  { id: 3, name: "Charlie Rao", role: "Project Lead",   status: "Away",    color: "#dcdcaa" },
  { id: 4, name: "Diana Singh", role: "QA Engineer",    status: "Offline", color: "#c586c0" },
];

const SampleComponent = () => {
  const total = SAMPLE_TEMP_DATA.length;
  const active = SAMPLE_TEMP_DATA.filter((d) => d.status === "Active").length;
  return (
    <div style={{ width: 420, background: "#252526", border: "1px solid #333", borderRadius: 8, padding: 20, color: "#d4d4d4", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Team Overview</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Sample component rendered with temp data</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#1e1e1e", border: "1px solid #333", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#4ec9b0" }}>{total}</div>
          <div style={{ fontSize: 11, color: "#888" }}>Total members</div>
        </div>
        <div style={{ flex: 1, background: "#1e1e1e", border: "1px solid #333", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#569cd6" }}>{active}</div>
          <div style={{ fontSize: 11, color: "#888" }}>Active now</div>
        </div>
      </div>
      {SAMPLE_TEMP_DATA.map((d) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderBottom: "1px solid #2d2d2d" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#111", flexShrink: 0 }}>
            {d.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{d.role}</div>
          </div>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: d.status === "Active" ? "rgba(78,201,176,.15)" : d.status === "Away" ? "rgba(220,220,170,.15)" : "rgba(197,134,192,.15)", color: d.status === "Active" ? "#4ec9b0" : d.status === "Away" ? "#dcdcaa" : "#c586c0", border: `1px solid ${d.color}33` }}>{d.status}</span>
        </div>
      ))}
    </div>
  );
};

const ComponentPreview = ({ nodeId, config }) => {
  const [filePath, setFilePath] = useState(config?.filePath || null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [bgMode, setBgMode] = useState("dark"); // "dark" | "light" | "grid"
  const [zoom, setZoom] = useState(1.0);
  const [transpileError, setTranspileError] = useState(null);
  const [ComponentToRender, setComponentToRender] = useState(null);
  const [lastUpdateKey, setLastUpdateKey] = useState(0);
  const [sampleMode, setSampleMode] = useState(false);

  // ── Find all .jsx / .tsx files in current project ─────────────────────────
  const scanProjectFiles = useCallback(async (dir) => {
    if (!dir) return [];
    try {
      const entries = await window.electronAPI.readDirAll(dir);
      let results = [];
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
        if (entry.isDir) {
          const sub = await scanProjectFiles(entry.path);
          results = results.concat(sub);
        } else if (/\.(jsx|tsx)$/i.test(entry.name)) {
          results.push(entry.path);
        }
      }
      return results;
    } catch {
      return [];
    }
  }, []);

  const refreshFileList = useCallback(async () => {
    const root = window.__currentProjectPath;
    if (root) {
      const files = await scanProjectFiles(root);
      setProjectFiles(files);
      if (!filePath && files.length > 0) {
        setFilePath(files[0]);
      }
    } else {
      setProjectFiles([]);
    }
  }, [scanProjectFiles, filePath]);

  useEffect(() => {
    refreshFileList();
  }, [refreshFileList]);

  // Listen for project open/close events
  useEffect(() => {
    const onOpen = () => refreshFileList();
    const onClose = () => { setSampleMode(false); setFilePath(null); setProjectFiles([]); setComponentToRender(null); };
    window.addEventListener("project:opened", onOpen);
    window.addEventListener("project:closed", onClose);
    return () => {
      window.removeEventListener("project:opened", onOpen);
      window.removeEventListener("project:closed", onClose);
    };
  }, [refreshFileList]);

  // Listen for file changes / active editor file
  useEffect(() => {
    const onOpenFile = (e) => {
      const path = e.detail?.path || e.detail?.filePath;
      if (path && /\.(jsx|tsx)$/i.test(path)) {
        setSampleMode(false);
        setFilePath(path);
      }
    };
    window.addEventListener("open-file-in-editor", onOpenFile);
    return () => window.removeEventListener("open-file-in-editor", onOpenFile);
  }, []);

  // ── Helper to resolve relative file paths ─────────────────────────────────
  const resolvePath = (baseFile, relativePath) => {
    if (!baseFile || !relativePath) return null;
    const parts = baseFile.replace(/\\/g, "/").split("/");
    parts.pop(); // remove base filename, keeping directory
    const relParts = relativePath.replace(/\\/g, "/").split("/");
    for (const p of relParts) {
      if (p === "." || p === "") continue;
      if (p === "..") { parts.pop(); }
      else { parts.push(p); }
    }
    return parts.join("/");
  };

  // ── Helper to inject CSS into document.head ──────────────────────────────
  const injectPreviewCss = (cssKey, cssContent) => {
    if (!cssKey) return;
    const styleId = `preview-css-${cssKey.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      el.setAttribute("data-preview-css", cssKey);
      document.head.appendChild(el);
    }
    el.textContent = cssContent || "";
  };

  // ── Scan and inject associated CSS files ──────────────────────────────────
  const loadAssociatedCss = useCallback(async (targetFilePath, sourceCode) => {
    if (!targetFilePath) return;

    // 1. Direct CSS import matches in source code: import "./styles.css" / require("./app.css")
    const cssImportRegex = /(?:import|require)\s*\(?['"]([^'"]+\.(?:css|scss|less|pcss))['"]\)?/gi;
    let match;
    while ((match = cssImportRegex.exec(sourceCode)) !== null) {
      const relCssPath = match[1];
      const fullCssPath = resolvePath(targetFilePath, relCssPath);
      if (fullCssPath) {
        try {
          const cssContent = await window.electronAPI.readTextFile(fullCssPath);
          if (cssContent !== null) {
            injectPreviewCss(fullCssPath, cssContent);
          }
        } catch {}
      }
    }

    // 2. Sibling CSS file with same name (e.g. App.jsx -> App.css)
    const sameNameCss = targetFilePath.replace(/\.(jsx|tsx)$/i, ".css");
    if (sameNameCss !== targetFilePath) {
      try {
        const cssContent = await window.electronAPI.readTextFile(sameNameCss);
        if (cssContent !== null) {
          injectPreviewCss(sameNameCss, cssContent);
        }
      } catch {}
    }

    // 3. Common project CSS files in same directory or project root
    const dirParts = targetFilePath.replace(/\\/g, "/").split("/");
    dirParts.pop();
    const dirPath = dirParts.join("/");
    const commonNames = ["index.css", "style.css", "styles.css", "App.css", "global.css", "main.css"];
    for (const name of commonNames) {
      const commonPath = `${dirPath}/${name}`;
      try {
        const cssContent = await window.electronAPI.readTextFile(commonPath);
        if (cssContent !== null) {
          injectPreviewCss(commonPath, cssContent);
        }
      } catch {}
    }
  }, []);

  // ── Transpile & Load Component ────────────────────────────────────────────
  const loadAndTranspile = useCallback(async (path) => {
    if (!path) return;
    setTranspileError(null);

    const source = await window.electronAPI.readTextFile(path);
    if (source === null) {
      setTranspileError(`Could not read file: ${path.split(/[\\/]/).pop()}`);
      setComponentToRender(null);
      return;
    }

    // Load all imported and associated CSS styles
    await loadAssociatedCss(path, source);

    // Wrap snippet if plain JSX element
    let codeToTranspile = source;
    if (!/export\s+default|function|const|class/i.test(source) && /^\s*</.test(source.trim())) {
      codeToTranspile = `export default function PreviewSnippet() { return (\n${source}\n); }`;
    }

    const res = await window.electronAPI.transpileJsx(codeToTranspile);
    if (!res?.success) {
      setTranspileError(res?.error || "Transpilation failed");
      setComponentToRender(null);
      return;
    }

    try {
      const exportsObj = {};
      const moduleObj = { exports: exportsObj };

      const customRequire = (name) => {
        if (name === "react") return React;
        if (name === "react-dom") return React;
        if (/\.(css|scss|less|pcss)$/i.test(name)) {
          const fullCssPath = resolvePath(path, name);
          if (fullCssPath) {
            window.electronAPI.readTextFile(fullCssPath).then((cssContent) => {
              if (cssContent !== null) injectPreviewCss(fullCssPath, cssContent);
            }).catch(() => {});
          }
          return {};
        }
        return {};
      };

      const runner = new Function(
        'React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer', 'useContext', 'useId',
        'require', 'exports', 'module',
        `${res.code};\nconst exp = module.exports.default || exports.default || module.exports;\nif (typeof exp === 'function' || (exp && typeof exp === 'object')) return exp;\nreturn (typeof App !== 'undefined' ? App : null) || (typeof Component !== 'undefined' ? Component : null);`
      );

      const evaluated = runner(
        React, React.useState, React.useEffect, React.useRef, React.useCallback, React.useMemo, React.useReducer, React.useContext, React.useId,
        customRequire, exportsObj, moduleObj
      );

      if (!evaluated) {
        setTranspileError("No default export or React component found in file");
        setComponentToRender(null);
      } else {
        setComponentToRender(() => evaluated);
        setLastUpdateKey((k) => k + 1);
      }
    } catch (err) {
      setTranspileError(err?.message || String(err));
      setComponentToRender(null);
    }
  }, [loadAssociatedCss]);

  useEffect(() => {
    if (filePath) {
      loadAndTranspile(filePath);
    }
  }, [filePath, loadAndTranspile]);

  // Watch for filesystem changes to auto-update live preview
  useEffect(() => {
    const root = window.__currentProjectPath;
    if (!root) return;
    const unsub = window.electronAPI.onFsChange(() => {
      if (filePath) loadAndTranspile(filePath);
    });
    return () => unsub();
  }, [filePath, loadAndTranspile]);

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : "No file selected";

  const getCanvasBg = () => {
    if (bgMode === "light") return "#ffffff";
    if (bgMode === "grid") return "repeating-conic-gradient(#252526 0% 25%, #1e1e1e 0% 50%) 50% / 16px 16px";
    return "#1e1e1e";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "#181818", position: "relative", overflow: "hidden" }}>
      {/* ── Header Toolbar ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 10px", background: "#252526", borderBottom: "1px solid #2d2d2d", fontSize: 12, color: "#ccc", flexShrink: 0, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, color: "#4ec9b0", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 2.5L1.5 8L4 13.5M12 2.5L14.5 8L12 13.5M9.5 2L6.5 14" stroke="#4ec9b0" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Preview:
          </span>

          {/* File selector dropdown */}
          <select
            value={filePath || ""}
            onChange={(e) => { setSampleMode(false); setFilePath(e.target.value || null); }}
            style={{
              background: "#1e1e1e",
              color: "#d0d0d0",
              border: "1px solid #3c3c3c",
              borderRadius: 3,
              fontSize: 11,
              padding: "2px 6px",
              outline: "none",
              cursor: "pointer",
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {projectFiles.length === 0 ? (
              <option value="">{filePath ? fileName : "No JSX files found"}</option>
            ) : (
              projectFiles.map((p) => (
                <option key={p} value={p}>
                  {p.split(/[\\/]/).pop()} ({p.replace(/.*[\\/]([^\\/]+[\\/][^\\/]+)$/, "$1")})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Sample Component Button */}
          <button
            onClick={() => setSampleMode(true)}
            title="Show sample component with temp data"
            style={{ background: sampleMode ? "#2d2d2d" : "transparent", border: "none", color: sampleMode ? "#4ec9b0" : "#aaa", cursor: "pointer", padding: "2px 8px", fontSize: 11, borderRadius: 3 }}
          >
            Sample
          </button>

          {/* Background Mode Toggle */}
          <div style={{ display: "flex", background: "#1e1e1e", borderRadius: 3, border: "1px solid #333", padding: 1 }}>
            <button
              onClick={() => setBgMode("dark")}
              title="Dark Background"
              style={{ background: bgMode === "dark" ? "#333" : "transparent", color: bgMode === "dark" ? "#fff" : "#777", border: "none", borderRadius: 2, padding: "2px 6px", fontSize: 10, cursor: "pointer" }}
            >
              Dark
            </button>
            <button
              onClick={() => setBgMode("light")}
              title="Light Background"
              style={{ background: bgMode === "light" ? "#333" : "transparent", color: bgMode === "light" ? "#fff" : "#777", border: "none", borderRadius: 2, padding: "2px 6px", fontSize: 10, cursor: "pointer" }}
            >
              Light
            </button>
            <button
              onClick={() => setBgMode("grid")}
              title="Grid Background"
              style={{ background: bgMode === "grid" ? "#333" : "transparent", color: bgMode === "grid" ? "#fff" : "#777", border: "none", borderRadius: 2, padding: "2px 6px", fontSize: 10, cursor: "pointer" }}
            >
              Grid
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { if (filePath) loadAndTranspile(filePath); }}
            title="Reload Preview"
            style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: "2px 4px", fontSize: 12 }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── Main Preview Canvas ────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: getCanvasBg(),
          padding: 20,
          position: "relative",
        }}
      >
        {sampleMode ? (
          <PreviewErrorBoundary resetKey={lastUpdateKey}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.1s ease" }}>
              <SampleComponent />
            </div>
          </PreviewErrorBoundary>
        ) : transpileError ? (
          <div style={{ padding: 16, background: "#2a1717", border: "1px solid #732222", borderRadius: 6, color: "#f44747", fontSize: 12, fontFamily: "Consolas, monospace", maxWidth: 600, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>JSX Transpilation Error</div>
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{transpileError}</div>
          </div>
        ) : !filePath ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#666", fontSize: 13 }}>
            <svg width="40" height="40" viewBox="0 0 16 16" fill="none">
              <path d="M4 2.5L1.5 8L4 13.5M12 2.5L14.5 8L12 13.5M9.5 2L6.5 14" stroke="#3c3c3c" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>Select a .jsx or .tsx file to render live preview</span>
          </div>
        ) : ComponentToRender ? (
          <PreviewErrorBoundary resetKey={lastUpdateKey}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.1s ease" }}>
              {React.isValidElement(ComponentToRender) ? ComponentToRender : <ComponentToRender />}
            </div>
          </PreviewErrorBoundary>
        ) : (
          <div style={{ color: "#777", fontSize: 12 }}>Loading preview…</div>
        )}
      </div>
    </div>
  );
};

export default ComponentPreview;
