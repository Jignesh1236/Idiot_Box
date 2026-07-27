import React, { useState, useEffect, useCallback, useRef } from "react";
import SidebarTree from "./SidebarTree.jsx";
import ContentArea from "./ContentArea.jsx";
import StatusBar   from "./StatusBar.jsx";
import "./project-window.css";

const SIDEBAR_MIN     = 120;
const SIDEBAR_MAX     = 400;
const SIDEBAR_DEFAULT = 180;

const ProjectWindow = () => {
  const [rootPath,      setRootPath]      = useState(null);
  const [currentPath,   setCurrentPath]   = useState(null);
  const [selectedPath,  setSelectedPath]  = useState(null);
  const [selectedItems, setSelectedItems] = useState(() => new Set());
  const [expandedSet,   setExpandedSet]   = useState(() => new Set());
  const [childCache,    setChildCache]    = useState(() => new Map());
  const [itemCount,     setItemCount]     = useState(null);
  const [sidebarWidth,  setSidebarWidth]  = useState(SIDEBAR_DEFAULT);
  const [clipboard,     setClipboard]     = useState(null);
  const [refreshToken,  setRefreshToken]  = useState(0);
  const draggingRef = useRef(false);
  const startXRef   = useRef(0);
  const startWRef   = useRef(SIDEBAR_DEFAULT);

  // ── Sidebar resize ───────────────────────────────────────────────────────
  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current   = e.clientX;
    startWRef.current   = sidebarWidth;
    const onMove = (ev) => {
      if (!draggingRef.current) return;
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWRef.current + (ev.clientX - startXRef.current))));
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [sidebarWidth]);

  // ── Cache ────────────────────────────────────────────────────────────────
  const loadChildren = useCallback(async (folderPath) => {
    if (childCache.has(folderPath)) return childCache.get(folderPath);
    const entries = await window.electronAPI.readDir(folderPath);
    setChildCache((prev) => new Map(prev).set(folderPath, entries));
    return entries;
  }, [childCache]);

  const invalidateCache = useCallback((dirPath) => {
    setChildCache((prev) => { const n = new Map(prev); n.delete(dirPath); return n; });
  }, []);

  // ── Chokidar watcher ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!rootPath) return;
    window.electronAPI.watchDir(rootPath);
    const unsub = window.electronAPI.onFsChange((affectedDir) => {
      invalidateCache(affectedDir);
      // If the currently-viewed folder is the one that changed, bump the token
      // so ContentArea re-fetches even though currentPath string didn't change
      setCurrentPath((p) => {
        if (p === affectedDir) setRefreshToken((t) => t + 1);
        return p;
      });
    });
    return () => { unsub(); window.electronAPI.unwatchDir(rootPath); };
  }, [rootPath, invalidateCache]);

  // ── Project open / close ─────────────────────────────────────────────────
  const openProject = useCallback((folderPath) => {
    setRootPath(folderPath);
    setCurrentPath(folderPath);
    setSelectedPath(folderPath);
    setSelectedItems(new Set());
    setExpandedSet(new Set([folderPath]));
    setChildCache(new Map());
    setItemCount(null);
    setClipboard(null);
    setRefreshToken(0);
  }, []);

  const closeProject = useCallback(() => {
    setRootPath(null); setCurrentPath(null); setSelectedPath(null);
    setSelectedItems(new Set()); setExpandedSet(new Set());
    setChildCache(new Map()); setItemCount(null); setClipboard(null);
  }, []);

  useEffect(() => {
    const u1 = window.electronAPI.onMenuEvent("menu:openProject",  openProject);
    const u2 = window.electronAPI.onMenuEvent("menu:newProject",   openProject);
    const u3 = window.electronAPI.onMenuEvent("menu:closeProject", closeProject);
    const u4 = window.electronAPI.onMenuEvent("menu:saveProject",  () => {});
    return () => { u1(); u2(); u3(); u4(); };
  }, [openProject, closeProject]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSidebarSelect = useCallback((folderPath) => {
    setSelectedPath(folderPath); setCurrentPath(folderPath); setSelectedItems(new Set());
  }, []);

  const handleToggle = useCallback((folderPath) => {
    setExpandedSet((prev) => { const n = new Set(prev); n.has(folderPath) ? n.delete(folderPath) : n.add(folderPath); return n; });
  }, []);

  const handleNavigate = useCallback((folderPath) => {
    setCurrentPath(folderPath); setSelectedPath(folderPath); setSelectedItems(new Set());
  }, []);

  const handleSetSelectedItems = useCallback((nextSet) => setSelectedItems(nextSet), []);
  const handleItemsLoaded      = useCallback((count)   => setItemCount(count),       []);

  const handleSidebarDrop = useCallback(async (targetFolderPath, draggedPaths) => {
    for (const src of draggedPaths) {
      if (src === targetFolderPath) continue;
      await window.electronAPI.moveItem(src, targetFolderPath);
    }
    setSelectedItems(new Set());
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!rootPath) {
    return (
      <div className="pw-root">
        <div className="pw-empty">
          <svg className="pw-empty__svg" width="40" height="40" viewBox="0 0 16 16" fill="none">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.086a1.5 1.5 0 0 1 1.06.44L7.56 3.5H13.5A1.5 1.5 0 0 1 15 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" fill="#c8a84b"/>
          </svg>
          <span>No project open</span>
          <span style={{ fontSize: 11, color: "#444" }}>File → Open Project</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pw-root">
      <div className="pw-body">
        <div className="pw-sidebar" style={{ width: sidebarWidth, minWidth: SIDEBAR_MIN, maxWidth: SIDEBAR_MAX }}>
          <SidebarTree
            rootPath={rootPath}
            selectedPath={selectedPath}
            expandedSet={expandedSet}
            childCache={childCache}
            clipboard={clipboard}
            onSelect={handleSidebarSelect}
            onToggle={handleToggle}
            loadChildren={loadChildren}
            invalidateCache={invalidateCache}
            onDrop={handleSidebarDrop}
          />
          <div className="pw-sidebar__resize" onMouseDown={onResizeStart} />
        </div>

        <ContentArea
          rootPath={rootPath}
          currentPath={currentPath}
          refreshToken={refreshToken}
          selectedItems={selectedItems}
          onSetSelectedItems={handleSetSelectedItems}
          onNavigate={handleNavigate}
          onItemsLoaded={handleItemsLoaded}
          itemCount={itemCount}
          clipboard={clipboard}
          onClipboardChange={setClipboard}
          invalidateCache={invalidateCache}
        />
      </div>
      <StatusBar
        selectedCount={selectedItems.size}
        selectedPath={selectedItems.size === 1 ? [...selectedItems][0] : currentPath}
        itemCount={itemCount}
      />
    </div>
  );
};

export default ProjectWindow;
