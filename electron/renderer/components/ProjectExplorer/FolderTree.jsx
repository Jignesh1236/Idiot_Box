import React, { useState, useEffect, useRef, useCallback } from "react";
import FolderNode from "./FolderNode.jsx";

// ─── FolderTree ───────────────────────────────────────────────────────────────
// Scroll container, keyboard shortcut host, and rename state owner.
// Passes a flat visible list down to FolderNode for range selection.
// ─────────────────────────────────────────────────────────────────────────────

const FolderTree = ({
  rootPath, selectedPaths, expandedSet, childCache, clipboard,
  onSelect, onMultiSelect, onRangeSelect,
  onToggle, onContextMenu, loadChildren,
  onBack, onForward,
  setClipboard, invalidateCache, setRefreshKey,
}) => {
  const [rootChildren, setRootChildren] = useState(null);
  const [renamingPath, setRenamingPath] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadChildren(rootPath).then(setRootChildren);
  }, [rootPath, loadChildren]);

  // ── Flat visible path list for keyboard nav + range select ─────────────────
  const buildFlatList = useCallback((entries) => {
    if (!entries) return [];
    const list = [];
    for (const e of entries) {
      list.push(e.path);
      if (expandedSet.has(e.path) && childCache.has(e.path)) {
        list.push(...buildFlatList(childCache.get(e.path)));
      }
    }
    return list;
  }, [expandedSet, childCache]);

  const flatList = rootChildren ? buildFlatList(rootChildren) : [];
  const primarySelected = [...selectedPaths][0] ?? null;

  // ── Rename commit ──────────────────────────────────────────────────────────
  const handleRenameCommit = useCallback(async (oldPath, newName) => {
    setRenamingPath(null);
    if (!oldPath || !newName) return;
    const parentDir = oldPath.replace(/[\\/][^\\/]+$/, "") || oldPath;
    await window.electronAPI.rename(oldPath, newName);
    invalidateCache(parentDir);
    setRefreshKey((k) => k + 1);
  }, [invalidateCache, setRefreshKey]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback(async (e) => {
    if (!rootChildren || !flatList.length) return;
    const idx = flatList.indexOf(primarySelected);

    // Navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onSelect(flatList[Math.min(idx + 1, flatList.length - 1)]);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onSelect(flatList[Math.max(idx - 1, 0)]);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (!primarySelected) return;
      if (!expandedSet.has(primarySelected)) { onToggle(primarySelected); return; }
      const ch = childCache.get(primarySelected);
      if (ch?.length) onSelect(ch[0].path);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (!primarySelected) return;
      if (expandedSet.has(primarySelected)) { onToggle(primarySelected); return; }
      const parentIdx = flatList.findIndex((p) => childCache.get(p)?.some((c) => c.path === primarySelected));
      if (parentIdx !== -1) onSelect(flatList[parentIdx]);
      return;
    }
    if (e.key === "Backspace" && !e.ctrlKey) {
      e.preventDefault();
      onBack();
      return;
    }
    if (e.key === "ArrowLeft" && e.altKey) { e.preventDefault(); onBack(); return; }
    if (e.key === "ArrowRight" && e.altKey) { e.preventDefault(); onForward(); return; }

    // Enter / Space — toggle
    if ((e.key === "Enter" || e.key === " ") && !e.ctrlKey) {
      e.preventDefault();
      if (primarySelected) onToggle(primarySelected);
      return;
    }

    // Ctrl+A — select all
    if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const allSet = new Set(flatList);
      // We abuse onRangeSelect by building a full selection externally
      flatList.forEach((p, i) => i === 0 ? onSelect(p) : onMultiSelect(p));
      return;
    }

    // F2 / Enter after selection — rename
    if (e.key === "F2") {
      e.preventDefault();
      if (primarySelected) setRenamingPath(primarySelected);
      return;
    }

    // Delete
    if (e.key === "Delete") {
      e.preventDefault();
      if (!primarySelected) return;
      const name = primarySelected.split(/[\\/]/).pop();
      if (window.confirm(`Delete "${name}"?`)) {
        const parentDir = primarySelected.replace(/[\\/][^\\/]+$/, "") || primarySelected;
        await window.electronAPI.deleteItem(primarySelected, true);
        invalidateCache(parentDir);
        setRefreshKey((k) => k + 1);
      }
      return;
    }

    // Ctrl+C — copy
    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (selectedPaths.size) setClipboard({ paths: [...selectedPaths], mode: "copy" });
      return;
    }
    // Ctrl+X — cut
    if (e.key === "x" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (selectedPaths.size) setClipboard({ paths: [...selectedPaths], mode: "cut" });
      return;
    }
    // Ctrl+V — paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!clipboard || !primarySelected) return;
      for (const src of clipboard.paths) {
        if (clipboard.mode === "copy") await window.electronAPI.copyItem(src, primarySelected);
        else                           await window.electronAPI.moveItem(src, primarySelected);
      }
      if (clipboard.mode === "cut") setClipboard(null);
      invalidateCache(primarySelected);
      setRefreshKey((k) => k + 1);
      return;
    }
    // Ctrl+D — duplicate
    if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!primarySelected) return;
      const parentDir = primarySelected.replace(/[\\/][^\\/]+$/, "") || primarySelected;
      await window.electronAPI.duplicate(primarySelected);
      invalidateCache(parentDir);
      setRefreshKey((k) => k + 1);
      return;
    }
  }, [
    rootChildren, flatList, primarySelected, selectedPaths, expandedSet,
    childCache, clipboard,
    onSelect, onMultiSelect, onToggle, onBack, onForward,
    setClipboard, invalidateCache, setRefreshKey,
  ]);

  if (rootChildren === null) return <div className="pe-loading">Loading...</div>;

  return (
    <div
      className="pe-tree"
      ref={scrollRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="tree"
      aria-label="Project folders"
      aria-multiselectable="true"
    >
      {rootChildren.length === 0 ? (
        <div className="pe-tree__empty">No folders found</div>
      ) : (
        rootChildren.map((entry) => (
          <FolderNode
            key={entry.path}
            entry={entry}
            depth={0}
            selectedPaths={selectedPaths}
            expandedSet={expandedSet}
            childCache={childCache}
            clipboard={clipboard}
            onSelect={onSelect}
            onMultiSelect={onMultiSelect}
            onRangeSelect={onRangeSelect}
            onToggle={onToggle}
            onContextMenu={onContextMenu}
            loadChildren={loadChildren}
            onRenameCommit={handleRenameCommit}
            renamingPath={renamingPath}
            flatList={flatList}
          />
        ))
      )}
    </div>
  );
};

export default FolderTree;
