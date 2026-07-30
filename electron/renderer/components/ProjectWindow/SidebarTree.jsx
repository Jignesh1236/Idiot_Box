import React, { useState, useEffect, useCallback, useRef } from "react";
import VscodeIcon from "../shared/VscodeIcon.jsx";
import { useInputDialog } from "../shared/InputDialog.jsx";
import { PreviewIcon } from "./ContentArea.jsx";

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
  showHidden, showFolders, showFiles, showPreview,
  onFileClick, onFileDblClick, onFileCtxMenu,
  onExternalDrop,
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
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect = e.dataTransfer.types?.includes("Files") ? "copy" : "move";
    setDropTarget(entry.path);
    if (expandHoverRef.current !== entry.path) {
      expandHoverRef.current = entry.path;
      if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
      expandTimerRef.current = setTimeout(() => {
        if (!isOpen) onToggle(entry.path);
      }, 800);
    }
  }, [entry.path, setDropTarget, isOpen, onToggle]);
  const handleDragLeave = useCallback((e) => {
    e.stopPropagation(); setDropTarget((p) => p === entry.path ? null : p);
    if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
    expandHoverRef.current = null;
  }, [entry.path, setDropTarget]);
  const handleDrop      = useCallback(async (e) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (expandTimerRef.current) { clearTimeout(expandTimerRef.current); expandTimerRef.current = null; }
    expandHoverRef.current = null;
    // Internal native drag (from startDrag) fallback
    if (window.__ppooDragPaths?.length) {
      const paths = window.__ppooDragPaths; window.__ppooDragPaths = null;
      onDrop(entry.path, paths); return;
    }
    if (await onExternalDrop?.(e, entry.path)) return;
    try { const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths")); if (paths?.length) onDrop(entry.path, paths); } catch {}
  }, [entry.path, onDrop, setDropTarget, onExternalDrop]);
  const handleCtxMenu   = useCallback((e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(entry.path, e.shiftKey); }, [entry.path, onContextMenu]);

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
      {isOpen && hasLoaded && children && children
        .filter((c) => c.isDir ? showFolders : showFiles)
        .map((child) => child.isDir ? (
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
          showHidden={showHidden}
          showFolders={showFolders}
          showFiles={showFiles}
          showPreview={showPreview}
          onFileClick={onFileClick}
          onFileDblClick={onFileDblClick}
          onFileCtxMenu={onFileCtxMenu}
          onExternalDrop={onExternalDrop}
        />
      ) : (
        <TreeRow
          key={child.path}
          label={child.name}
          iconEl={<PreviewIcon entry={child} showPreview={showPreview} size={16} />}
          depth={depth + 1}
          hasChildren={false}
          isOpen={false}
          isSelected={selectedPath === child.path}
          isDropTarget={false}
          onClick={() => onFileClick?.(child.path)}
          onDoubleClick={() => onFileDblClick?.(child.path)}
          onArrowClick={() => {}}
          onDragOver={() => {}}
          onDragLeave={() => {}}
          onDrop={() => {}}
          onContextMenu={(e) => onFileCtxMenu?.(e, child.path)}
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
  showHidden, showFolders, showFiles, showPreview,
  onFileSelect, pushUndo,
}) => {
  const [rootChildren, setRootChildren] = useState(null);
  const [dropTarget,   setDropTarget]   = useState(null);
  // Bump this to force a re-fetch of rootChildren after mutations
  const [localRefresh, setLocalRefresh] = useState(0);
  const [pinned,       setPinned]       = useState([]);
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
    window.electronAPI.readDirAll(rootPath).then(setRootChildren);
  }, [rootPath, localRefresh]);

  // Also reload when childCache for rootPath is invalidated (chokidar trigger)
  useEffect(() => {
    if (!rootPath || childCache.has(rootPath)) return;
    window.electronAPI.readDirAll(rootPath).then(setRootChildren);
  }, [rootPath, childCache]);

  const rootName = rootPath ? rootPath.split(/[\\/]/).filter(Boolean).pop() : "";

  const handleExternalDrop = useCallback(async (e, targetDir) => {
    // Internal native drag (from our app) should use move, not copy
    if (window.__ppooDragPaths?.length) return false;
    const dt = e.dataTransfer;
    if (!dt) return false;
    const hasFiles = dt.types?.includes("Files");
    if (!hasFiles) return false;
    const getPath = window.electronAPI.getPathForFile;
    if (!getPath) return false;
    const paths = [];
    const items = dt.items;
    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          try {
            const f = items[i].getAsFile();
            if (f) {
              const p = getPath(f);
              if (p) paths.push(p);
            }
          } catch {}
        }
      }
    }
    if (!paths.length) {
      const files = dt.files;
      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          try {
            const p = getPath(files[i]);
            if (p) paths.push(p);
          } catch {}
        }
      }
    }
    if (!paths.length) return false;
    const failed = [];
    let copied = false;
    for (const src of paths) {
      try {
        await window.electronAPI.copyItem(src, targetDir);
        copied = true;
      } catch { failed.push(src.split(/[\\/]/).pop()); }
    }
    if (failed.length) await window.electronAPI.showAlert(`Cannot import:\n${failed.join(", ")}`);
    if (copied) { invalidateCache(targetDir); setLocalRefresh((k) => k + 1); }
    return true;
  }, [invalidateCache]);

  // ── Root row drag handlers ────────────────────────────────────────────────
  const handleRootDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = e.dataTransfer.types?.includes("Files") ? "copy" : "move"; setDropTarget(rootPath); };
  const handleRootDragLeave = ()  => setDropTarget((p) => p === rootPath ? null : p);
  const handleRootDrop      = async (e) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    // Internal native drag (from startDrag) fallback
    if (window.__ppooDragPaths?.length) {
      const paths = window.__ppooDragPaths; window.__ppooDragPaths = null;
      onDrop(rootPath, paths); return;
    }
    // External files
    if (await handleExternalDrop(e, rootPath)) return;
    // Internal drag
    try { const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths")); if (paths?.length) onDrop(rootPath, paths); } catch {}
  };

  // ── Blank-area (sidebar empty space) drop handlers ────────────────────────
  const handleSidebarDragOver = useCallback((e) => {
    if (!rootPath) return;
    if (!e.dataTransfer.types?.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, [rootPath]);

  const handleSidebarDrop = useCallback(async (e) => {
    if (!rootPath) return;
    e.preventDefault();
    e.stopPropagation();
    await handleExternalDrop(e, rootPath);
  }, [rootPath, handleExternalDrop]);

  // ── Pin config ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rootPath) { setPinned([]); return; }
    window.electronAPI.readPinConfig(rootPath).then(setPinned);
    const handler = () => window.electronAPI.readPinConfig(rootPath).then(setPinned);
    window.addEventListener("pin-changed", handler);
    return () => window.removeEventListener("pin-changed", handler);
  }, [rootPath]);

  const handlePinToggle = useCallback(async (folderName) => {
    if (!rootPath) return;
    let next;
    if (pinned.includes(folderName)) next = pinned.filter((n) => n !== folderName);
    else                              next = [...pinned, folderName];
    setPinned(next);
    await window.electronAPI.writePinConfig(rootPath, next);
    window.dispatchEvent(new CustomEvent("pin-changed"));
  }, [rootPath, pinned]);

  // ── Context menu for any sidebar folder ───────────────────────────────────
  const handleContextMenu = useCallback(async (folderPath, shiftKey = false) => {
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
            const newPath = await window.electronAPI.rename(folderPath, n);
            if (pushUndo) pushUndo({ type: "rename", oldPath: folderPath, oldName, newPath: newPath || parentDir + (parentDir.includes("\\") ? "\\" : "/") + n, newName: n, parentDir });
            invalidateCache(parentDir);
            setLocalRefresh((k) => k + 1);
          } catch (err) { await window.electronAPI.showAlert(`Cannot rename:\n${err.message}`); }
        }
        break;
      }
      case "delete": {
        const name = folderPath.replace(/.*[\\/]/, "");
        if (shiftKey) {
          const ok = await window.electronAPI.confirmDialog(`Permanently delete "${name}"?`);
          if (ok) {
            try {
              await window.electronAPI.deleteItem(folderPath);
              invalidateCache(parentDir);
              setLocalRefresh((k) => k + 1);
            } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
          }
        } else {
          const ok = await window.electronAPI.confirmDialog(`Move "${name}" to Trash?`);
          if (ok) {
            try {
              const result = await window.electronAPI.trashItem(folderPath, findTrashRoot(folderPath));
              if (pushUndo && result?.trashId) pushUndo({ type: "delete", trashIds: [{ from: folderPath, trashId: result.trashId }], parentDir, rootPath: findTrashRoot(folderPath) });
              invalidateCache(parentDir);
              setLocalRefresh((k) => k + 1);
            } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
          }
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
      case "pinToSidebar": {
        const relPath = folderPath.length > rootPath.length
          ? folderPath.slice(rootPath.length + 1)
          : folderPath.replace(/.*[\\/]/, "");
        handlePinToggle(relPath);
        break;
      }
      case "refresh":  refresh(); break;
    }
  }, [selectedPath, onSelect, clipboard, invalidateCache, handlePinToggle]);

  // ── File handlers ────────────────────────────────────────────────────────
  const handleFileClick = useCallback((filePath) => {
    onFileSelect?.(filePath);
  }, [onFileSelect]);

  const handleFileDoubleClick = useCallback(async (filePath) => {
    await window.electronAPI.openFile(filePath, "system");
  }, []);

  const handleFileContextMenu = useCallback(async (e, filePath) => {
    e.preventDefault();
    e.stopPropagation();
    const shiftKey = e.shiftKey;
    if (filePath !== selectedPath) onSelect(filePath);
    const parentDir = filePath.replace(/[\\/][^\\/]+$/, "") || filePath;
    const result = await window.electronAPI.showContextMenu(
      "file", [filePath], clipboard?.paths ?? null
    );
    if (!result) return;
    switch (result.action) {
      case "open":
        await window.electronAPI.openFile(filePath, "system");
        break;
      case "openWithSystem":
        await window.electronAPI.openFile(filePath, "system");
        break;
      case "openInMediaViewer":
        window.dispatchEvent(new CustomEvent("media-viewer:open", { detail: { path: filePath } }));
        break;
      case "openInTerminal": {
        window.dispatchEvent(new CustomEvent("open-terminal", { detail: { dir: parentDir } }));
        break;
      }
      case "rename": {
        const oldName = filePath.replace(/.*[\\/]/, "");
        const n = await ask("Rename to:", oldName);
        if (n && n !== oldName) {
          try {
            const newPath = await window.electronAPI.rename(filePath, n);
            if (pushUndo) pushUndo({ type: "rename", oldPath: filePath, oldName, newPath: newPath || parentDir + (parentDir.includes("\\") ? "\\" : "/") + n, newName: n, parentDir });
            invalidateCache(parentDir);
            setLocalRefresh((k) => k + 1);
          } catch (err) { await window.electronAPI.showAlert(`Cannot rename:\n${err.message}`); }
        }
        break;
      }
      case "delete": {
        const name = filePath.replace(/.*[\\/]/, "");
        if (shiftKey) {
          const ok = await window.electronAPI.confirmDialog(`Permanently delete "${name}"?`);
          if (ok) {
            try {
              await window.electronAPI.deleteItem(filePath);
              invalidateCache(parentDir);
              setLocalRefresh((k) => k + 1);
            } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
          }
        } else {
          const ok = await window.electronAPI.confirmDialog(`Move "${name}" to Trash?`);
          if (ok) {
            try {
              const result = await window.electronAPI.trashItem(filePath, findTrashRoot(filePath));
              if (pushUndo && result?.trashId) pushUndo({ type: "delete", trashIds: [{ from: filePath, trashId: result.trashId }], parentDir, rootPath: findTrashRoot(filePath) });
              invalidateCache(parentDir);
              setLocalRefresh((k) => k + 1);
            } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
          }
        }
        break;
      }
      case "duplicate": {
        try {
          await window.electronAPI.duplicate(filePath);
          invalidateCache(parentDir);
          setLocalRefresh((k) => k + 1);
        } catch (err) { await window.electronAPI.showAlert(`Cannot duplicate:\n${err.message}`); }
        break;
      }
      case "reveal":
        window.electronAPI.revealInExplorer(filePath);
        break;
      case "copyPath":
        navigator.clipboard.writeText(filePath);
        break;
      case "refresh": {
        invalidateCache(parentDir);
        setLocalRefresh((k) => k + 1);
        break;
      }
      default: {
        if (result.action.startsWith("openWithEditor:")) {
          const editorId = result.action.slice("openWithEditor:".length);
          await window.electronAPI.openFile(filePath, editorId);
        }
        break;
      }
    }
  }, [selectedPath, onSelect, clipboard, invalidateCache, findTrashRoot]);

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
        onContextMenu={handleBlankContext}
        onDragOver={handleSidebarDragOver}
        onDrop={handleSidebarDrop}>
      {rootPath && (
        <>
          {pinned.length > 0 && (
            <>
              <div className="pw-section">
                <span className="pw-section__label">Pinned</span>
              </div>
              {pinned.map((name) => {
                const sep = rootPath.includes("\\") ? "\\" : "/";
                const fullPath = rootPath + sep + name;
                const folderName = name.split(/[\\/]/).pop();
                return (
                  <TreeRow
                    key={name}
                    label={folderName}
                    iconEl={<VscodeIcon name={folderName} isDir={true} size={16} />}
                    depth={0}
                    hasChildren={false}
                    isOpen={false}
                    isSelected={selectedPath === fullPath}
                    isDropTarget={false}
                    onClick={() => onSelect(fullPath)}
                    onDoubleClick={() => onToggle(fullPath)}
                    onArrowClick={() => {}}
                    onDragOver={() => {}}
                    onDragLeave={() => {}}
                    onDrop={() => {}}
                    onContextMenu={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (fullPath !== selectedPath) onSelect(fullPath);
                      const parentDir = fullPath.replace(/[\\/][^\\/]+$/, "") || fullPath;
                      const result = await window.electronAPI.showContextMenu("pinned", [fullPath], clipboard?.paths ?? null);
                      if (!result) return;
                      switch (result.action) {
                        case "newFolder": {
                          try {
                            const created = await window.electronAPI.newFolder(fullPath, "New Folder");
                            if (created) { invalidateCache(fullPath); setLocalRefresh((k) => k + 1); onSelect(fullPath); }
                          } catch (err) { await window.electronAPI.showAlert(`Cannot create folder:\n${err.message}`); }
                          break;
                        }
                        case "newFile": {
                          try {
                            const created = await window.electronAPI.newFile(fullPath, "New File.txt");
                            if (created) { invalidateCache(fullPath); setLocalRefresh((k) => k + 1); onSelect(fullPath); }
                          } catch (err) { await window.electronAPI.showAlert(`Cannot create file:\n${err.message}`); }
                          break;
                        }
                        case "openInTerminal": {
                          window.dispatchEvent(new CustomEvent("open-terminal", { detail: { dir: fullPath } }));
                          break;
                        }
                        case "pinToSidebar": handlePinToggle(name); break;
                        case "rename": {
                          const oldName = fullPath.replace(/.*[\\/]/, "");
                          const n = await ask("Rename to:", oldName);
                          if (n && n !== oldName) {
                            try {
                              await window.electronAPI.rename(fullPath, n);
                              invalidateCache(parentDir);
                              setLocalRefresh((k) => k + 1);
                            } catch (err) { await window.electronAPI.showAlert(`Cannot rename:\n${err.message}`); }
                          }
                          break;
                        }
                        case "delete": {
                          const dname = fullPath.replace(/.*[\\/]/, "");
                          const ok = await window.electronAPI.confirmDialog(`Move "${dname}" to Trash?`);
                          if (ok) {
                            try {
                              await window.electronAPI.trashItem(fullPath, rootPath);
                              invalidateCache(parentDir);
                              setLocalRefresh((k) => k + 1);
                            } catch (err) { await window.electronAPI.showAlert(`Cannot delete:\n${err.message}`); }
                          }
                          break;
                        }
                        case "duplicate": {
                          try {
                            await window.electronAPI.duplicate(fullPath);
                            invalidateCache(parentDir);
                            setLocalRefresh((k) => k + 1);
                          } catch (err) { await window.electronAPI.showAlert(`Cannot duplicate:\n${err.message}`); }
                          break;
                        }
                        case "copy": break;
                        case "cut": break;
                        case "paste": {
                          if (!clipboard?.paths?.length) break;
                          for (const src of clipboard.paths) {
                            if (clipboard.mode === "copy") await window.electronAPI.copyItem(src, fullPath);
                            else await window.electronAPI.moveItem(src, fullPath);
                          }
                          invalidateCache(fullPath);
                          setLocalRefresh((k) => k + 1);
                          break;
                        }
                        case "reveal": window.electronAPI.revealInExplorer(fullPath); break;
                        case "copyPath": navigator.clipboard.writeText(fullPath); break;
                        case "refresh": {
                          invalidateCache(fullPath);
                          invalidateCache(parentDir);
                          setLocalRefresh((k) => k + 1);
                          break;
                        }
                      }
                    }}
                  />
                );
              })}
            </>
          )}
          <div className="pw-section">
            <span className="pw-section__label">Files</span>
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
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); handleContextMenu(rootPath, e.shiftKey); }}
          />
          {expandedSet.has(rootPath) && rootChildren && rootChildren
            .filter((c) => showHidden || !c.name.startsWith("."))
            .filter((c) => c.isDir ? showFolders : showFiles)
            .map((entry) => entry.isDir ? (
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
              showFolders={showFolders}
              showFiles={showFiles}
              showPreview={showPreview}
              onFileClick={handleFileClick}
              onFileDblClick={handleFileDoubleClick}
              onFileCtxMenu={handleFileContextMenu}
              onExternalDrop={handleExternalDrop}
            />
          ) : (
            <TreeRow
              key={entry.path}
              label={entry.name}
              iconEl={<PreviewIcon entry={entry} showPreview={showPreview} size={16} />}
              depth={1}
              hasChildren={false}
              isOpen={false}
              isSelected={selectedPath === entry.path}
              isDropTarget={false}
              onClick={() => handleFileClick(entry.path)}
              onDoubleClick={() => handleFileDoubleClick(entry.path)}
              onArrowClick={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDrop={() => {}}
              onContextMenu={(e) => handleFileContextMenu(e, entry.path)}
            />
          ))}
        </>
      )}
    </div>
    </>
  );
};

export default SidebarTree;
