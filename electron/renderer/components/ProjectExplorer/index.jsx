import React, { useState, useCallback, useRef } from "react";
import Header from "./Header.jsx";
import FolderTree from "./FolderTree.jsx";
import "./explorer.css";

// ─── ProjectExplorer ──────────────────────────────────────────────────────────
// Owns ALL state for the folder explorer panel.
//
// State contract:
//   rootPath      — opened root folder path or null
//   selectedPaths — Set<string> of currently highlighted paths (multi-select)
//   expandedSet   — Set<string> of expanded folder paths
//   childCache    — Map<string, entry[]> lazy-loaded children
//   clipboard     — { paths: string[], mode: 'copy'|'cut' } or null
//   history       — { stack: string[][], cursor: number } for back/forward nav
//   refreshKey    — bumped to force FolderTree remount on refresh
// ─────────────────────────────────────────────────────────────────────────────

const ProjectExplorer = () => {
  const [rootPath,      setRootPath]      = useState(null);
  const [selectedPaths, setSelectedPaths] = useState(() => new Set());
  const [expandedSet,   setExpandedSet]   = useState(() => new Set());
  const [childCache,    setChildCache]    = useState(() => new Map());
  const [clipboard,     setClipboard]     = useState(null);
  const [refreshKey,    setRefreshKey]    = useState(0);
  // history of selected-path arrays for back/forward
  const historyRef = useRef({ stack: [], cursor: -1 });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const invalidateCache = useCallback((dirPath) => {
    setChildCache((prev) => {
      const next = new Map(prev);
      next.delete(dirPath);
      return next;
    });
  }, []);

  const pushHistory = useCallback((paths) => {
    const h = historyRef.current;
    const trimmed = h.stack.slice(0, h.cursor + 1);
    trimmed.push(paths);
    historyRef.current = { stack: trimmed, cursor: trimmed.length - 1 };
  }, []);

  // ── Open folder ────────────────────────────────────────────────────────────
  const handleOpenFolder = useCallback(async () => {
    const folderPath = await window.electronAPI.openFolder();
    if (!folderPath) return;
    setRootPath(folderPath);
    setSelectedPaths(new Set());
    setExpandedSet(new Set());
    setChildCache(new Map());
    setClipboard(null);
    setRefreshKey((k) => k + 1);
    historyRef.current = { stack: [], cursor: -1 };
  }, []);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setChildCache(new Map());
    setExpandedSet(new Set());
    setSelectedPaths(new Set());
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Toggle expand ──────────────────────────────────────────────────────────
  const handleToggle = useCallback((folderPath) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      next.has(folderPath) ? next.delete(folderPath) : next.add(folderPath);
      return next;
    });
  }, []);

  // ── Select (single) ────────────────────────────────────────────────────────
  const handleSelect = useCallback((folderPath) => {
    setSelectedPaths(new Set([folderPath]));
    pushHistory([folderPath]);
  }, [pushHistory]);

  // ── Multi-select (Ctrl+Click) ──────────────────────────────────────────────
  const handleMultiSelect = useCallback((folderPath) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      next.has(folderPath) ? next.delete(folderPath) : next.add(folderPath);
      return next;
    });
  }, []);

  // ── Range select (Shift+Click) — uses flat visible list ───────────────────
  const handleRangeSelect = useCallback((folderPath, flatList) => {
    const lastSelected = [...selectedPaths].pop();
    if (!lastSelected || !flatList.length) {
      setSelectedPaths(new Set([folderPath]));
      return;
    }
    const a = flatList.indexOf(lastSelected);
    const b = flatList.indexOf(folderPath);
    if (a === -1 || b === -1) { setSelectedPaths(new Set([folderPath])); return; }
    const [lo, hi] = a < b ? [a, b] : [b, a];
    setSelectedPaths(new Set(flatList.slice(lo, hi + 1)));
  }, [selectedPaths]);

  // ── Lazy load ──────────────────────────────────────────────────────────────
  const loadChildren = useCallback(async (folderPath) => {
    if (childCache.has(folderPath)) return childCache.get(folderPath);
    const entries = await window.electronAPI.readDir(folderPath);
    setChildCache((prev) => new Map(prev).set(folderPath, entries));
    return entries;
  }, [childCache]);

  // ── Context menu ──────────────────────────────────────────────────────────
  const handleContextMenu = useCallback(async (itemPath) => {
    // Ensure right-clicked item is selected
    if (!selectedPaths.has(itemPath)) setSelectedPaths(new Set([itemPath]));

    const clipPath = clipboard?.paths?.[0] ?? null;
    const result = await window.electronAPI.showContextMenu("folder", [itemPath], clipPath ? [clipPath] : null);
    if (!result) return;

    const parentDir = itemPath.replace(/[\\/][^\\/]+$/, "") || itemPath;

    switch (result.action) {
      case "newFolder": {
        const created = await window.electronAPI.newFolder(itemPath, "New Folder");
        if (created) {
          invalidateCache(itemPath);
          if (!expandedSet.has(itemPath)) handleToggle(itemPath);
          else setRefreshKey((k) => k + 1);
        }
        break;
      }
      case "newFile": {
        const created = await window.electronAPI.newFile(itemPath, "New File.txt");
        if (created) { invalidateCache(itemPath); setRefreshKey((k) => k + 1); }
        break;
      }
      case "rename": {
        const newName = window.prompt("Rename to:", itemPath.split(/[\\/]/).pop());
        if (newName && newName.trim()) {
          await window.electronAPI.rename(itemPath, newName.trim());
          invalidateCache(parentDir);
          setRefreshKey((k) => k + 1);
        }
        break;
      }
      case "delete": {
        if (window.confirm(`Delete "${itemPath.split(/[\\/]/).pop()}"?`)) {
          await window.electronAPI.deleteItem(itemPath, true);
          invalidateCache(parentDir);
          setSelectedPaths((p) => { const n = new Set(p); n.delete(itemPath); return n; });
          setRefreshKey((k) => k + 1);
        }
        break;
      }
      case "copy":  setClipboard({ paths: [itemPath], mode: "copy" }); break;
      case "cut":   setClipboard({ paths: [itemPath], mode: "cut"  }); break;
      case "paste": {
        if (!clipboard) break;
        for (const src of clipboard.paths) {
          if (clipboard.mode === "copy") await window.electronAPI.copyItem(src, itemPath);
          else                           await window.electronAPI.moveItem(src, itemPath);
        }
        if (clipboard.mode === "cut") setClipboard(null);
        invalidateCache(itemPath);
        setRefreshKey((k) => k + 1);
        break;
      }
      case "duplicate": {
        await window.electronAPI.duplicate(itemPath);
        invalidateCache(parentDir);
        setRefreshKey((k) => k + 1);
        break;
      }
      case "reveal": window.electronAPI.revealInExplorer(itemPath); break;
      case "copyPath": navigator.clipboard.writeText(itemPath); break;
      case "copyName": navigator.clipboard.writeText(itemPath.split(/[\\/]/).pop()); break;
      case "openInTerminal": window.dispatchEvent(new CustomEvent("open-terminal", { detail: { dir: itemPath } })); break;
      case "refresh": handleRefresh(); break;
    }
  }, [selectedPaths, clipboard, expandedSet, handleToggle, handleRefresh, invalidateCache]);

  // ── Back / Forward history ─────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    const h = historyRef.current;
    if (h.cursor <= 0) return;
    h.cursor--;
    setSelectedPaths(new Set(h.stack[h.cursor]));
  }, []);

  const handleForward = useCallback(() => {
    const h = historyRef.current;
    if (h.cursor >= h.stack.length - 1) return;
    h.cursor++;
    setSelectedPaths(new Set(h.stack[h.cursor]));
  }, []);

  const projectName = rootPath ? rootPath.split(/[\\/]/).filter(Boolean).pop() : null;
  const primarySelected = [...selectedPaths][0] ?? null;

  return (
    <div className="pe-root">
      {!rootPath ? (
        <div className="pe-empty">
          <button className="pe-open-btn" onClick={handleOpenFolder}>
            <svg className="pe-open-btn__svg" width="28" height="28" viewBox="0 0 16 16" fill="none">
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.086a1.5 1.5 0 0 1 1.06.44L7.56 3.5H13.5A1.5 1.5 0 0 1 15 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" fill="#c8a84b"/>
            </svg>
            Open Folder
          </button>
        </div>
      ) : (
        <>
          <Header projectName={projectName} onRefresh={handleRefresh} />
          <FolderTree
            key={refreshKey}
            rootPath={rootPath}
            selectedPaths={selectedPaths}
            expandedSet={expandedSet}
            childCache={childCache}
            clipboard={clipboard}
            onSelect={handleSelect}
            onMultiSelect={handleMultiSelect}
            onRangeSelect={handleRangeSelect}
            onToggle={handleToggle}
            onContextMenu={handleContextMenu}
            onBack={handleBack}
            onForward={handleForward}
            loadChildren={loadChildren}
            setClipboard={setClipboard}
            invalidateCache={invalidateCache}
            setRefreshKey={setRefreshKey}
          />
        </>
      )}
    </div>
  );
};

export default ProjectExplorer;
