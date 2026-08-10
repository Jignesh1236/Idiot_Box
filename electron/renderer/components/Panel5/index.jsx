// Editor panel — VS Code-style single-file editor backed by flexlayout tabs.
// Each open file = one flexlayout tab (component "editor"); this component
// renders exactly ONE file from `config.filePath`. Tab strip, tab closing and
// tab renaming (dirty ● marker) are handled through flexlayout itself.
//
// Minimap and Word Wrap are now controlled via Settings (not toolbar buttons).

// ── Side-effect imports: default VSCode extensions (grammars + themes) MUST be
//    loaded before `initialize()` is called ─────────────────────────────────────
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-markdown-basics-default-extension";
import "@codingame/monaco-vscode-python-default-extension";
import "@codingame/monaco-vscode-yaml-default-extension";
import "@codingame/monaco-vscode-php-default-extension";
import "@codingame/monaco-vscode-rust-default-extension";
import "@codingame/monaco-vscode-go-default-extension";
import "@codingame/monaco-vscode-java-default-extension";
import "@codingame/monaco-vscode-cpp-default-extension";
import "@codingame/monaco-vscode-csharp-default-extension";
import "@codingame/monaco-vscode-ruby-default-extension";
import "@codingame/monaco-vscode-xml-default-extension";
import "@codingame/monaco-vscode-sql-default-extension";
import "@codingame/monaco-vscode-bat-default-extension";
import "@codingame/monaco-vscode-powershell-default-extension";
import "@codingame/monaco-vscode-shellscript-default-extension";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Actions } from "flexlayout-react";
import { initialize, getService, IThemeService, ILanguageService } from "@codingame/monaco-vscode-api";
import { createConfiguredEditor } from "@codingame/monaco-vscode-api/monaco";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import { activateVsx } from "../Extensions/vsx-monaco.js";
import { initLspProviders, registerModelPath, unregisterModelPath, clearDiagnostics } from "../Editor/lsp-providers.js";
import { initExtProviders } from "../Editor/ext-providers.js";
import { initRouter, attachModel, notifyModelChanged } from "../Editor/embedded/router.js";
import { prepareRealExtensionHost, installExtensionFileComposite } from "../../ext-host/bootstrap.js";

// ── Worker setup (bundled separately by esbuild) ───────────────────────────
window.MonacoEnvironment = {
  getWorker: (_moduleId, label) => {
    if (label === "TextMateWorker") return new Worker("./textmate.worker.js");
    return new Worker("./editor.worker.js");
  },
};

// ── VS Code services init (once) ───────────────────────────────────────────
let initPromise;
const ensureEditorReady = () => {
  if (!initPromise) {
    initPromise = prepareRealExtensionHost()
      .then(({ overrides, configuration }) =>
        initialize(
          {
            ...getTextMateServiceOverride(),
            ...getThemeServiceOverride(),
            ...getLanguagesServiceOverride(),
            ...overrides,
          },
          document.body,
          configuration
        )
      )
      .then(async () => {
      try {
        // Composite the custom extension-file provider into the live file
        // service (built-in themes/grammars + Node/Desktop extension files).
        await installExtensionFileComposite();
      } catch (e) {
        console.warn("[Panel5] installExtensionFileComposite failed", e);
      }
      try {
        const themeService = await getService(IThemeService);
        for (let attempt = 0; attempt < 60; attempt++) {
          try {
            themeService.setTheme("Dark+");
            const applied = themeService.getTheme();
            if (applied && applied.id === "Dark+") return;
          } catch {}
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch {}
    });
  }
  return initPromise;
};

const ext = (p) => { try { return p.slice(p.lastIndexOf(".")).toLowerCase(); } catch { return ""; } };
const fileName = (p) => { try { return p.split(/[\\/]/).pop(); } catch { return p; } };

// Resolve the Monaco language for a file. The extension host (builtin default
// extensions + marketplace-installed extensions) is the source of truth: its
// contributions surface in the VS Code language service. When no extension
// claims the file, fall back to the built-in mapping below.
let _languageService = null;
const getLanguageService = async () => {
  if (!_languageService) {
    try { _languageService = await getService(ILanguageService); } catch { _languageService = null; }
  }
  return _languageService;
};

const getMonacoLanguage = async (filePath) => {
  const e = ext(filePath);
  const base = fileName(filePath);
  try {
    const ls = await getLanguageService();
    if (ls) {
      const ids = ls.getRegisteredLanguageIds();
      for (const id of ids) {
        if (ls.getExtensions(id).some((x) => x && x.toLowerCase() === e)) return id;
        if (ls.getFilenames(id).some((f) => f && f.toLowerCase() === base)) return id;
      }
    }
  } catch { /* service unavailable — fall back */ }
  switch (e) {
    case ".js": case ".mjs": case ".cjs": return "javascript";
    case ".jsx": return "javascriptreact";
    case ".ts": return "typescript";
    case ".tsx": return "typescriptreact";
    case ".html": case ".htm": return "html";
    case ".vue": case ".svelte": return "html";
    case ".css": return "css";
    case ".scss": return "scss";
    case ".less": return "less";
    case ".json": case ".jsonc": return "json";
    case ".py": return "python";
    case ".rs": return "rust";
    case ".go": return "go";
    case ".c": case ".h": return "c";
    case ".cpp": case ".hpp": case ".cc": return "cpp";
    case ".cs": return "csharp";
    case ".java": return "java";
    case ".md": return "markdown";
    case ".sql": return "sql";
    case ".sh": case ".bash": return "shellscript";
    case ".yaml": case ".yml": return "yaml";
    case ".xml": case ".xsl": return "xml";
    case ".php": return "php";
    case ".rb": return "ruby";
    case ".bat": case ".cmd": return "bat";
    case ".ps1": return "powershell";
    case ".ini": case ".cfg": case ".toml": return "ini";
    default: return "plaintext";
  }
};

// ── Shared editor state (all editor tabs in the app) ───────────────────────
let activeEditorPath = null;
let autoSaveEnabled  = false;
const baseNames  = new Map();   // filePath -> tab base name
const dirtyFlags = new Map();   // filePath -> dirty boolean

const updateTabName = (nodeId, path) => {
  const m = window.__flexModel?.current;
  if (!m) return;
  const base = baseNames.get(path) || fileName(path) || path;
  const dirty = !!dirtyFlags.get(path);
  try {
    m.doAction(Actions.updateNodeAttributes(nodeId, { name: dirty ? base + " ●" : base }));
  } catch { /* node may be gone */ }
};

const setDirty = (nodeId, path, dirty) => {
  dirtyFlags.set(path, dirty);
  updateTabName(nodeId, path);
};

// ── Read initial editor settings (minimap / wordWrap) ─────────────────────
// Defaults: minimap=true, wordWrap=true
let _cachedEditorSettings = null;
const getEditorSettings = async () => {
  if (!_cachedEditorSettings) {
    try {
      const s = await window.electronAPI.readSettings();
      _cachedEditorSettings = s ?? {};
    } catch {
      _cachedEditorSettings = {};
    }
  }
  return _cachedEditorSettings;
};

// ── BroadcastChannel for live settings updates ────────────────────────────
// Settings window and main window are separate BrowserWindows; we use a
// BroadcastChannel so toggle changes in Settings propagate here instantly.
const settingsListeners = new Set();
try {
  const bc = new BroadcastChannel("editor-settings");
  bc.onmessage = (e) => {
    if (e.data && typeof e.data === "object") {
      // Merge into cached settings
      _cachedEditorSettings = { ...(_cachedEditorSettings ?? {}), ...e.data };
      settingsListeners.forEach((fn) => fn(e.data));
    }
  };
} catch { /* BroadcastChannel unavailable */ }

const EditorPanel = ({ config, nodeId }) => {
  const filePath = config?.filePath || null;

  // ── Project gate: editor is only usable when a project is open ───────────
  const [hasProject, setHasProject] = useState(!!window.__currentProjectPath);

  useEffect(() => {
    // Sync with current state immediately
    setHasProject(!!window.__currentProjectPath);

    const onOpen  = () => setHasProject(true);
    const onClose = () => setHasProject(false);
    window.addEventListener("project:opened",  onOpen);
    window.addEventListener("project:closed",  onClose);
    return () => {
      window.removeEventListener("project:opened",  onOpen);
      window.removeEventListener("project:closed",  onClose);
    };
  }, []);

  const [content,         setContent]         = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [language,        setLanguage]        = useState("plaintext");
  const [statusMsg,       setStatusMsg]       = useState(null);
  const [cursorPos,       setCursorPos]       = useState({ line: 1, col: 1, totalLines: 1 });
  const [ready,           setReady]           = useState(false);
  const [initError,       setInitError]       = useState(null);
  // minimap & wordWrap come from settings, not local toggle buttons
  const [minimap,         setMinimap]         = useState(true);
  const [wordWrap,        setWordWrap]        = useState("on");

  const editorRef   = useRef(null);
  const hostRef     = useRef(null);
  const pathRef     = useRef(filePath);
  const originalRef = useRef("");
const loadedRef   = useRef(false);
const saveTimer   = useRef(null);
const lspTimer    = useRef(null);

  pathRef.current = filePath;

  const flashStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => { setStatusMsg(null); }, 3000);
  };

  // ── Load editor settings on mount ────────────────────────────────────────
  useEffect(() => {
    getEditorSettings().then((s) => {
      setMinimap(s.minimap !== false);
      setWordWrap(s.wordWrap !== false ? "on" : "off");
    });

    // Listen for live changes from the Settings window
    const handler = (patch) => {
      if ("minimap"  in patch) setMinimap(patch.minimap !== false);
      if ("wordWrap" in patch) setWordWrap(patch.wordWrap !== false ? "on" : "off");
    };
    settingsListeners.add(handler);
    return () => settingsListeners.delete(handler);
  }, []);

  // ── Bootstrap VS Code services once ──────────────────────────────────────
  useEffect(() => {
    ensureEditorReady()
      .then(() => {
        setReady(true);
        // Activate marketplace-installed extensions (grammars, config, snippets)
        activateVsx();
        // Bridge Monaco providers to the language server manager
        try { initLspProviders(); } catch { /* LSP unavailable */ }
        // Bridge Monaco providers to the extension host (VS Code extensions)
        try { initExtProviders(); } catch { /* extension host unavailable */ }
        // Route embedded-language regions (html/vue/svelte) to their providers
        try { initRouter(); } catch { /* embedded router unavailable */ }
      })
      .catch((err) => setInitError(err?.message || String(err)));
  }, []);

  // ── Create / swap the configured editor when the file or options change ──
  useEffect(() => {
    if (!ready || !filePath || !hostRef.current) return;
    loadedRef.current = false;
    let cancelled = false;
    let disposed = false;
    let cleanup = () => {
      if (disposed) return;
      disposed = true;
      clearTimeout(saveTimer.current);
      if (lspTimer.current) { clearTimeout(lspTimer.current); lspTimer.current = null; }
      if (lspActive) {
        window.electronAPI.lspClose(filePath).catch(() => {});
        if (lspModelUri) { unregisterModelPath(lspModelUri, filePath); clearDiagnostics(lspModelUri); }
        lspActive = false;
      }
      window.removeEventListener("resize", onWinResize);
      ro?.disconnect();
      contentSub?.dispose();
      cursorSub?.dispose();
      focusSub?.dispose();
      editor?.dispose();
      if (editorRef.current === editor) editorRef.current = null;
    };
    let editor = null, ro = null, contentSub = null, cursorSub = null, focusSub = null, onWinResize = null;
    let lspActive = false, lspModelUri = null;

    (async () => {
      const text = await window.electronAPI.readTextFile(filePath);
      if (cancelled || disposed || !hostRef.current) return;
      if (text === null) {
        flashStatus(`Failed to read file: ${fileName(filePath)}`);
        return;
      }

      loadedRef.current = true;
      baseNames.set(filePath, fileName(filePath));
      dirtyFlags.set(filePath, false);
      updateTabName(nodeId, filePath);

      const lang = await getMonacoLanguage(filePath);
      setContent(text);
      setOriginalContent(text);
      originalRef.current = text;
      setLanguage(lang);
      setCursorPos({ line: 1, col: 1, totalLines: text.split("\n").length });

      const host = hostRef.current;
      host.innerHTML = "";

      try {
        editor = createConfiguredEditor(host, {
          value: text,
          language: lang,
          automaticLayout: true,
          minimap: { enabled: minimap },
          wordWrap: wordWrap,
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          smoothScrolling: true,
          cursorBlink: "smooth",
          renderLineHighlight: "all",
          scrollBeyondLastLine: false,
          tabSize: 2,
        });
      } catch (err) {
        setInitError(err?.message || String(err));
        return;
      }
      if (cancelled || disposed) { editor.dispose(); return; }

      editorRef.current = editor;
      activeEditorPath = filePath;

      // Live sync with component/preview panels: announce the active editor
      // file and push its current source so previews update without a save.
      try {
        window.dispatchEvent(new CustomEvent("editor:fileActivated", { detail: { path: filePath } }));
        window.dispatchEvent(new CustomEvent("component:sourceChanged", { detail: { path: filePath, code: text } }));
      } catch { /* ignore */ }

      // Bridge to the language server: map this model to the file path and
      // open the document in the server that claims the file's language.
      const model = editor.getModel();
      const modelUriStr = model?.uri?.toString?.();
      if (modelUriStr && lang && lang !== "plaintext") {
        lspModelUri = modelUriStr;
        registerModelPath(modelUriStr, filePath);
        lspActive = true;
        // TEMP: yaml is served by the real VS Code extension host; skip the
        // legacy main-process LSP for it (Phase C removes the legacy layer).
        if (lang !== "yaml") {
          window.electronAPI.lspOpen(filePath, lang, text).catch(() => {});
        }
      }
      // Register the model with the embedded language router (mixed-language
      // files: html/vue/svelte). No-op for non-host languages.
      try { attachModel(model, filePath); } catch { /* router unavailable */ }

      const layout = () => {
        try {
          // Pass the host's real size explicitly — using no args keeps Monaco's
          // own (stuck 5x5) size when the editor was created in a hidden tab.
          const rect = host.getBoundingClientRect();
          editor.layout({
            width: Math.max(Math.round(rect.width), 1),
            height: Math.max(Math.round(rect.height), 1),
          });
        } catch { /* noop */ }
      };
      const rafId = requestAnimationFrame(layout);
      const t1 = setTimeout(layout, 120);
      const t2 = setTimeout(layout, 600);
      onWinResize = layout;
      window.addEventListener("resize", onWinResize);
      try {
        ro = new ResizeObserver(layout);
        ro.observe(host);
      } catch { /* ResizeObserver unavailable */ }

      // Self-healing size check: ResizeObserver/rAF can be missed when the tab
      // mounts while hidden (e.g. restored from session) or the page is
      // backgrounded, which leaves monaco stuck at 5x5. Every 500ms compare the
      // host's real size to the editor's and re-layout when they differ.
      let lastW = 0, lastH = 0;
      const sizeCheck = () => {
        try {
          const r = host.getBoundingClientRect();
          const w = Math.max(Math.round(r.width), 1);
          const h = Math.max(Math.round(r.height), 1);
          if (w === lastW && h === lastH) return;
          lastW = w; lastH = h;
          const li = editor.getLayoutInfo();
          if (li.width !== w || li.height !== h) editor.layout({ width: w, height: h });
        } catch { /* noop */ }
      };
      const sizeIv = setInterval(sizeCheck, 500);

      contentSub = editor.onDidChangeModelContent(() => {
        const v = editor.getValue();
        setContent(v);
        const p = pathRef.current;
        if (p) {
          setDirty(nodeId, p, v !== originalRef.current);
          if (autoSaveEnabled) {
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => { doSave(); }, 800);
          }
          if (lspActive) {
            clearTimeout(lspTimer.current);
            lspTimer.current = setTimeout(() => { window.electronAPI.lspChange(p, editor.getValue()).catch(() => {}); }, 300);
          }
          // Re-sync embedded virtual documents with the edited text.
          try { notifyModelChanged(editor.getModel()); } catch { /* router unavailable */ }
          // Live sync: push the in-memory source to component preview panels.
          try {
            window.dispatchEvent(new CustomEvent("component:sourceChanged", { detail: { path: p, code: v } }));
          } catch { /* ignore */ }
        }
      });
      cursorSub = editor.onDidChangeCursorPosition((e) => {
        setCursorPos({
          line: e.position.lineNumber,
          col: e.position.column,
          totalLines: editor.getModel()?.getLineCount() || 1,
        });
      });
      focusSub = editor.onDidFocusEditorText(() => {
        activeEditorPath = pathRef.current;
        try {
          window.dispatchEvent(new CustomEvent("editor:fileActivated", { detail: { path: pathRef.current } }));
        } catch { /* ignore */ }
      });

      const done = (fn) => () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t1);
        clearTimeout(t2);
        clearInterval(sizeIv);
        fn?.();
      };
      const originalCleanup = cleanup;
      cleanup = done(originalCleanup);
    })();

    return () => { cancelled = true; cleanup(); };
  }, [ready, filePath, minimap, wordWrap, nodeId, hasProject]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save / Save As ───────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    const p = pathRef.current;
    if (!p) return;
    if (!loadedRef.current) { flashStatus("Nothing to save — file was not loaded"); return; }
    const text = editorRef.current?.getValue() ?? content;
    const result = await window.electronAPI.writeFileText(p, text);
    if (result?.success) {
      window.electronAPI.extDocSaved(p).catch(() => {});
      originalRef.current = text;
      setOriginalContent(text);
      setDirty(nodeId, p, false);
      flashStatus(`Saved: ${fileName(p)}`);
    } else {
      await window.electronAPI.showAlert(`Failed to save file:\n${result?.error || "Unknown error"}`);
    }
  }, [nodeId, content]);

  const doSaveAs = useCallback(async () => {
    const p = pathRef.current;
    if (!p) return;
    if (!loadedRef.current) { flashStatus("Nothing to save — file was not loaded"); return; }
    const text = editorRef.current?.getValue() ?? content;
    const result = await window.electronAPI.saveFileAs(p, text);
    if (result?.canceled) return;
    if (result?.error) { await window.electronAPI.showAlert(`Save As failed:\n${result.error}`); return; }
    const newPath = result.path;
    window.electronAPI.extDocSaved(newPath).catch(() => {});
    baseNames.delete(p);
    dirtyFlags.delete(p);
    baseNames.set(newPath, fileName(newPath));
    dirtyFlags.set(newPath, false);
    const m = window.__flexModel?.current;
    if (m) {
      try {
        m.doAction(Actions.updateNodeAttributes(nodeId, { name: fileName(newPath), config: { filePath: newPath } }));
      } catch { /* node may be gone */ }
    }
    flashStatus(`Saved as: ${fileName(newPath)}`);
  }, [nodeId, content]);

  // ── File menu commands ───────────────────────────────────────────────────
  useEffect(() => {
    const onCmd = (e) => {
      const cmd = e.detail?.cmd;
      const p = pathRef.current;
      if (!cmd || !p) return;
      const target = e.detail?.path ?? activeEditorPath;
      if (p !== target) return;
      if (cmd === "save") doSave();
      else if (cmd === "saveAs") doSaveAs();
    };
    window.addEventListener("editor:command", onCmd);
    return () => window.removeEventListener("editor:command", onCmd);
  }, [doSave, doSaveAs]);

  // ── AutoSave toggle ──────────────────────────────────────────────────────
  useEffect(() => {
    const onAuto = (e) => { autoSaveEnabled = e.detail?.enabled === true; };
    window.addEventListener("editor:autosave", onAuto);
    return () => window.removeEventListener("editor:autosave", onAuto);
  }, []);

  // ── Extension-host workspace edits (vscode.WorkspaceEdit) ───────────────
  useEffect(() => {
    const onApplyEdits = (e) => {
      const { path: target, edits } = e.detail || {};
      if (!target || !Array.isArray(edits) || !edits.length) return;
      if (pathRef.current !== target) return;
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!model) return;
      const ops = edits
        .map((ed) => ({
          range: ed.range && ed.range.start && ed.range.end
            ? {
                startLineNumber: ed.range.start.line + 1,
                startColumn: ed.range.start.character + 1,
                endLineNumber: ed.range.end.line + 1,
                endColumn: ed.range.end.character + 1,
              }
            : null,
          text: ed.text || "",
        }))
        .filter((op) => op.range);
      if (!ops.length) return;
      try { editor.executeEdits("extension", ops); } catch {}
    };
    window.addEventListener("editor:applyEdits", onApplyEdits);
    return () => window.removeEventListener("editor:applyEdits", onApplyEdits);
  }, []);

  useEffect(() => () => { clearTimeout(saveTimer.current); }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#1e1e1e",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── No project gate ──────────────────────────────────────────────── */}
      {!hasProject ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", flexDirection: "column", gap: 14,
        }}>
          <svg width="52" height="52" viewBox="0 0 16 16" fill="none">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.086a1.5 1.5 0 0 1 1.06.44L7.56 3.5H13.5A1.5 1.5 0 0 1 15 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" fill="#3a3a3a"/>
          </svg>
          <span style={{ color: "#666", fontWeight: 600, fontSize: 13 }}>No project open</span>
          <span style={{ color: "#444", fontSize: 11, textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
            Open a project from the <strong style={{ color: "#555" }}>File</strong> menu or the Project Panel,
            then select a file to edit.
          </span>
          <button
            onClick={() => window.electronAPI.openFolder()}
            style={{
              marginTop: 4,
              height: 30, padding: "0 16px",
              background: "#2d2d2d", border: "1px solid #3c3c3c",
              borderRadius: 3, color: "#bbb",
              fontSize: 12, cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#383838"; e.currentTarget.style.borderColor = "#5a9fd4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.borderColor = "#3c3c3c"; }}
          >
            Open Folder…
          </button>
        </div>
      ) : (
        <>
          {/* ── Editor Canvas ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {!ready ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "#777", fontSize: 13, flexDirection: "column", gap: 12,
              }}>
                <span style={{ color: "#aaa", fontWeight: 500 }}>Initializing VS Code editor…</span>
              </div>
            ) : initError ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "#f44747", fontSize: 13, padding: 20, textAlign: "center",
              }}>
                Editor init error: {initError}
              </div>
            ) : !filePath ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "#555", fontSize: 13, flexDirection: "column", gap: 12,
              }}>
                <svg width="48" height="48" viewBox="0 0 16 16" fill="#333">
                  <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5.5L9.5 0H4Zm5.5 1.5v3A1.5 1.5 0 0 0 11 6h3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5Z"/>
                </svg>
                <span style={{ color: "#777", fontWeight: 500 }}>Editor</span>
                <span style={{ fontSize: 11, color: "#444" }}>
                  Single-click any file in Project Panel to edit
                </span>
              </div>
            ) : (
              <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
            )}
          </div>

          {/* ── Bottom Status Bar ────────────────────────────────────────────── */}
          {filePath && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 10px",
                background: "#007acc",
                color: "#ffffff",
                fontSize: 11,
                height: 22,
                flexShrink: 0,
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span>{statusMsg || `Ln ${cursorPos.line}, Col ${cursorPos.col} (${cursorPos.totalLines} lines)`}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {autoSaveEnabled && <span>AutoSave: On</span>}
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span style={{ textTransform: "uppercase", fontWeight: 600 }}>{language}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditorPanel;
