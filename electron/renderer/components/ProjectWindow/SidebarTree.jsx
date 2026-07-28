import React, { useState, useEffect, useCallback, useRef } from "react";
import VscodeIcon from "../shared/VscodeIcon.jsx";
import { useInputDialog } from "../shared/InputDialog.jsx";

const ArrowSvg = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
    <path d="M2 1l4 3-4 3V1z"/>
  </svg>
);

// ── TreeRow ───────────────────────────────────────────────────────────────────
const TreeRow = ({
  label, iconEl, depth, hasChildren, isOpen, isSelected, isDropTarget,
  onClick, onDoubleClick, onArrowClick, onDragOver, onDragLeave, onDrop, onContextMenu,
}) => (
  <div
    className={[
      "pw-tree-row",
      isSelected   ? "pw-tree-row--selected"    : "",
      isDropTarget ? "pw-tree-row--drop-target" : "",
    ].filter(Boolean).join(" ")}
    style={{ paddingLeft: `${6 + depth * 14}px` }}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onContextMenu={onContextMenu}
    role="treeitem"
    aria-expanded={hasChildren ? isOpen : undefined}
    aria-selected={isSelected}
  >
    <span
      className={`pw-tree-row__arrow${hasChildren
        ? (isOpen ? " pw-tree-row__arrow--open" : "")
        : " pw-tree-row__arrow--hidden"}`}
      onClick={hasChildren ? (e) => { e.stopPropagation(); onArrowClick(); } : undefined}
      aria-hidden="true"
    >
      <ArrowSvg />
    </span>
    <span className="pw-tree-row__icon" aria-hidden="true">{iconEl}</span>
    <span className="pw-tree-row__label" title={label}>{label}</span>
  </div>
);

// ── Recursive folder node ─────────────────────────────────────────────────────
const FolderNode = ({
  entry, depth, selectedPath, expandedSet, childCache,
  onSelect, onToggle, loadChildren, onDrop,
  dropTarget, setDropTarget, onContextMenu,
  showHidden,
}) => {
  const isOpen     = expandedSet.has(entry.path);
  const isSelected = selectedPath === entry.path;
  const raw        = childCache.get(entry.path) ?? null;
  const children   = raw ? (showHidden ? raw : raw.filter((c) => !c.name.startsWith("."))) : null;
  const hasLoaded  = childCache.has(entry.path);
  const [loading, setLoading] = useState(false);
  const expandTimerRef = useRef(null);
  const expandHoverRef = useRef(null);

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      setLoading(true);
      loadChildren(entry.path).finally(() => setLoading(false));
    }
  }, [isOpen, hasLoaded, entry.path, loadChildren]);

  const hasChildren = !hasLoaded || (raw && raw.length > 0);

  const handleDragOver  = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; setDropTarget(entry.path);
    if (expandHoverRef.current !== entry.path) {
      expandHoverRef.current = entry.path;
      if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
      expandTimerRef.current = setTimeout(() => {
        if (!isOpen) onToggle(entry.path);
      }, 2000);
    }
  }, [entry.path, setDropTarget, isOpen, onToggle]);
  const handleDragLeave = useCallback((e) => {
    e.stopPropagation(); setDropTarget((p) => p === entry.path ? null : p);
    if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
    expandHoverRef.current = null;
  }, [entry.path, setDropTarget]);
  const handleDrop      = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
    expandHoverRef.current = null;
    try { const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths")); if (paths?.length) onDrop(entry.path, paths); } catch {}
  }, [entry.path, onDrop, setDropTarget]);
  const handleCtxMenu   = useCallback((e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(entry.path); }, [entry.path, onContextMenu]);

  return (
    <>
      <TreeRow
        label={entry.name}
        iconEl={<VscodeIcon name={entry.name} isDir={true} isOpen={isOpen} size={16} />}
        depth={depth}
        hasChildren={hasChildren}
        isOpen={isOpen}
        isSelected={isSelected}
        isDropTarget={dropTarget === entry.path}
        onClick={() => onSelect(entry.path)}
        onDoubleClick={() => onToggle(entry.path)}
        onArrowClick={() => onToggle(entry.path)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={handleCtxMenu}
      />
      {isOpen && hasLoaded && children && children.map((child) => (
        <FolderNode
          key={child.path}
          entry={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          expandedSet={expandedSet}
          childCache={childCache}
          onSelect={onSelect}
          onToggle={onToggle}
          loadChildren={loadChildren}
          onDrop={onDrop}
          dropTarget={dropTarget}
          setDropTarget={setDropTarget}
          onContextMenu={onContextMenu}
        />
      ))}
      {isOpen && loading && (
        <div style={{ paddingLeft: `${6 + (depth + 1) * 14 + 14}px`, color: "#555", fontSize: 11, height: 20, lineHeight: "20px" }}>...</div>
      )}
    </>
  );
};

// ── SidebarTree root ──────────────────────────────────────────────────────────
const SidebarTree = ({
  rootPath, selectedPath, expandedSet, childCache,
  onSelect, onToggle, loadChildren, onDrop,
  clipboard, invalidateCache,
  showHidden,
}) => {
  const [rootChildren, setRootChildren] = useState(null);
  const [dropTarget,   setDropTarget]   = useState(null);
  // Bump this to force a re-fetch of rootChildren after mutations
  const [localRefresh, setLocalRefresh] = useState(0);
  const { dialog: inputDialog, ask }    = useInputDialog();

  // Helper: find a rootPath that can host .trash (top-most ancestor of folderPath)
  const findTrashRoot = useCallback((folderPath) => {
    // Use the project rootPath if folderPath is inside it, else parent
    if (rootPath && folderPath.startsWith(rootPath)) return rootPath;
    const parent = folderPath.replace(/[\\/][^\\/]+$/, "") || folderPath;
    return parent;
  }, [rootPath]);

  // Reload root children whenever rootPath changes OR a mutation triggers localRefresh
  useEffect(() => {
    if (!rootPath) { setRootChildren(null); return; }
    // Always re-read from IPC (bypass in-component cache) so mutations are visible
    window.electronAPI.readDir(rootPath).then(setRootChildren);
  }, [rootPath, localRefresh]);

  // Also reload when childCache for rootPath is invalidated (chokidar trigger)
  useEffect(() => {
    if (!rootPath || childCache.has(rootPath)) return;
    window.electronAPI.readDir(rootPath).then(setRootChildren);
  }, [rootPath, childCache]);

  const rootName = rootPath ? rootPath.split(/[\\/]/).filter(Boolean).pop() : "";

  // ── Root row drag handlers ────────────────────────────────────────────────
  const handleRootDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(rootPath); };
  const handleRootDragLeave = ()  => setDropTarget((p) => p === rootPath ? null : p);
  const handleRootDrop      = (e) => {
    e.preventDefault(); setDropTarget(null);
    try { const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths")); if (paths?.length) onDrop(rootPath, paths); } catch {}
  };

  // ── Context menu for any sidebar folder ───────────────────────────────────
  const handleContextMenu = useCallback(async (folderPath) => {
    if (folderPath !== selectedPath) onSelect(folderPath);
    const parentDir = folderPath.replace(/[\\/][^\\/]+$/, "") || folderPath;
    const result = await window.electronAPI.showContextMenu(
      "folder", [folderPath], clipboard?.paths ?? null
    );
    if (!result) return;

    const refresh = () => {
      invalidateCache(folderPath);
      invalidateCache(parentDir);
      setLocalRefresh((k) => k + 1);
    };

    switch (result.action) {
      case "newFolder": {
        try {
          const created = await window.electronAPI.newFolder(folderPath, "New Folder");
          if (created) {
            invalidateCache(folderPath);
            setLocalRefresh((k) => k + 1);
            onSelect(folderPath);
          }
        } catch (err) { await window.electronAPI.showAlert(`Cannot create folder:\n${err.message}`); }
        break;
      }
      case "newFile": {
        try {
          const created = await window.electronAPI.newFile(folderPath, "New File.txt");
          if (created) {
            invalidateCache(folderPath);
            setLocalRefresh((k) => k + 1);
            onSelect(folderPath);
          }
        } catch (err) { await window.electronAPI.showAlert(`Cannot create file:\n${err.message}`); }
        break;
      }
      case "rename": {
        const oldName = folderPath.replace(/.*[\\/]/, "");
        const n = await ask("Rename to:", oldName);
        if (n && n !== oldName) {
          try {
            await window.electronAPI.rename(folderPath, n);
            invalidateCache(parentDir);
            setLocalRefresh((k) => k + 1);
          } catch (err) { await window.electronAPI.showAlert(`Cannot rename:\n${err.message}`); }
        }
        break;
      }
      case "delete": {
        const name = folderPath.replace(/.*[\\/]/, "");
        const ok = await window.electronAPI.confirmDialog(`Move "${name}" to Trash?`);
        if (ok) {
          try {
            await window.electronAPI.trashItem(folderPath, findTrashRoot(folderPath));
            invalidateCache(parentDir);
            setLocalRefresh((k) => k + 1);
          } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
        }
        break;
      }
      case "duplicate": {
        try {
          await window.electronAPI.duplicate(folderPath);
          invalidateCache(parentDir);
          setLocalRefresh((k) => k + 1);
        } catch (err) { await window.electronAPI.showAlert(`Cannot duplicate:\n${err.message}`); }
        break;
      }
      case "copy":     break;
      case "reveal":   window.electronAPI.revealInExplorer(folderPath); break;
      case "copyPath": navigator.clipboard.writeText(folderPath); break;
      case "openInTerminal": {
        window.dispatchEvent(new CustomEvent("open-terminal", { detail: { dir: folderPath } }));
        break;
      }
      case "refresh":  refresh(); break;
    }
  }, [selectedPath, onSelect, clipboard, invalidateCache]);

  // ── Blank area context menu (right-click empty space) ─────────────────────
  const handleBlankContext = useCallback(async (e) => {
    if (!rootPath) return;
    const result = await window.electronAPI.showContextMenu(
      "none", [], clipboard?.paths ?? null
    );
    if (!result) return;

    const refresh = () => {
      invalidateCache(rootPath);
      setLocalRefresh((k) => k + 1);
    };

    switch (result.action) {
      case "newFolder": {
        try {
          await window.electronAPI.newFolder(rootPath, "New Folder");
          refresh();
        } catch (err) { await window.electronAPI.showAlert(`Cannot create folder:\n${err.message}`); }
        break;
      }
      case "newFile": {
        try {
          await window.electronAPI.newFile(rootPath, "New File.txt");
          refresh();
        } catch (err) { await window.electronAPI.showAlert(`Cannot create file:\n${err.message}`); }
        break;
      }
      case "paste": {
        if (!clipboard?.paths?.length) break;
        const failed = [];
        for (const src of clipboard.paths) {
          if (clipboard.mode === "copy") {
            try { await window.electronAPI.copyItem(src, rootPath); }
            catch (err) { failed.push(src.split(/[\\/]/).pop()); }
          } else {
            try { await window.electronAPI.moveItem(src, rootPath); }
            catch (err) { failed.push(src.split(/[\\/]/).pop()); }
          }
        }
        if (failed.length) await window.electronAPI.showAlert(`Cannot paste:\n${failed.join(", ")}`);
        refresh();
        break;
      }
      case "reveal":
        window.electronAPI.revealInExplorer(rootPath);
        break;
      case "refresh":
        refresh();
        break;
    }
  }, [rootPath, clipboard, invalidateCache]);

  return (
    <>
      {inputDialog}
      <div className="pw-sidebar__scroll" role="tree" aria-label="Project tree"
        onContextMenu={handleBlankContext}>
      {rootPath && (
        <>
          <div className="pw-section">
            <span className="pw-section__label">Assets</span>
          </div>
          <TreeRow
            label={rootName}
            iconEl={<VscodeIcon name={rootName} isDir={true} isOpen={expandedSet.has(rootPath)} size={16} />}
            depth={0}
            hasChildren={rootChildren === null || (rootChildren && rootChildren.length > 0)}
            isOpen={expandedSet.has(rootPath)}
            isSelected={selectedPath === rootPath}
            isDropTarget={dropTarget === rootPath}
            onClick={() => onSelect(rootPath)}
            onDoubleClick={() => onToggle(rootPath)}
            onArrowClick={() => onToggle(rootPath)}
            onDragOver={handleRootDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleRootDrop}
            onContextMenu={() => handleContextMenu(rootPath)}
          />
          {expandedSet.has(rootPath) && rootChildren && rootChildren
            .filter((c) => showHidden || !c.name.startsWith("."))
            .map((entry) => (
            <FolderNode
              key={entry.path}
              entry={entry}
              depth={1}
              selectedPath={selectedPath}
              expandedSet={expandedSet}
              childCache={childCache}
              onSelect={onSelect}
              onToggle={onToggle}
              loadChildren={loadChildren}
              onDrop={onDrop}
              dropTarget={dropTarget}
              setDropTarget={setDropTarget}
              onContextMenu={handleContextMenu}
              showHidden={showHidden}
            />
          ))}
        </>
      )}
    </div>
    </>
  );
};

export default SidebarTree;
