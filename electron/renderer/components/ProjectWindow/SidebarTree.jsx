import React, { useState, useEffect, useCallback } from "react";
import VscodeIcon from "../shared/VscodeIcon.jsx";

const ArrowSvg = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
    <path d="M2 1l4 3-4 3V1z"/>
  </svg>
);

// ── Single tree row — supports drop target ────────────────────────────────────
const TreeRow = ({ label, iconEl, depth, hasChildren, isOpen, isSelected, isDropTarget, onClick, onArrowClick, onDragOver, onDragLeave, onDrop }) => (
  <div
    className={[
      "pw-tree-row",
      isSelected   ? "pw-tree-row--selected"    : "",
      isDropTarget ? "pw-tree-row--drop-target" : "",
    ].filter(Boolean).join(" ")}
    style={{ paddingLeft: `${6 + depth * 14}px` }}
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    role="treeitem"
    aria-expanded={hasChildren ? isOpen : undefined}
    aria-selected={isSelected}
  >
    <span
      className={`pw-tree-row__arrow${hasChildren ? (isOpen ? " pw-tree-row__arrow--open" : "") : " pw-tree-row__arrow--hidden"}`}
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
const FolderNode = ({ entry, depth, selectedPath, expandedSet, childCache, onSelect, onToggle, loadChildren, onDrop, dropTarget, setDropTarget }) => {
  const isOpen     = expandedSet.has(entry.path);
  const isSelected = selectedPath === entry.path;
  const children   = childCache.get(entry.path) ?? null;
  const hasLoaded  = childCache.has(entry.path);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      setLoading(true);
      loadChildren(entry.path).finally(() => setLoading(false));
    }
  }, [isOpen, hasLoaded, entry.path, loadChildren]);

  const hasChildren = !hasLoaded || (children && children.length > 0);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(entry.path);
  }, [entry.path, setDropTarget]);

  const handleDragLeave = useCallback((e) => {
    e.stopPropagation();
    setDropTarget((prev) => prev === entry.path ? null : prev);
  }, [entry.path, setDropTarget]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    try {
      const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths"));
      if (paths?.length) onDrop(entry.path, paths);
    } catch {}
  }, [entry.path, onDrop, setDropTarget]);

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
        onArrowClick={() => onToggle(entry.path)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      {isOpen && hasLoaded && children && children.map((child) => (
        <FolderNode key={child.path} entry={child} depth={depth + 1}
          selectedPath={selectedPath} expandedSet={expandedSet}
          childCache={childCache} onSelect={onSelect} onToggle={onToggle}
          loadChildren={loadChildren} onDrop={onDrop}
          dropTarget={dropTarget} setDropTarget={setDropTarget} />
      ))}
      {isOpen && loading && (
        <div style={{ paddingLeft: `${6 + (depth + 1) * 14 + 14}px`, color: "#555", fontSize: 11, height: 20, lineHeight: "20px" }}>...</div>
      )}
    </>
  );
};

// ── SidebarTree root ──────────────────────────────────────────────────────────
const SidebarTree = ({ rootPath, selectedPath, expandedSet, childCache, onSelect, onToggle, loadChildren, onDrop }) => {
  const [rootChildren, setRootChildren] = useState(null);
  const [dropTarget,   setDropTarget]   = useState(null);

  useEffect(() => {
    if (!rootPath) { setRootChildren(null); return; }
    loadChildren(rootPath).then(setRootChildren);
  }, [rootPath, loadChildren]);

  const rootName = rootPath ? rootPath.split(/[\\/]/).filter(Boolean).pop() : "";

  // Root row drop handlers
  const handleRootDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(rootPath); };
  const handleRootDragLeave = () => setDropTarget((p) => p === rootPath ? null : p);
  const handleRootDrop = (e) => {
    e.preventDefault(); setDropTarget(null);
    try {
      const paths = JSON.parse(e.dataTransfer.getData("application/ppoo-paths"));
      if (paths?.length) onDrop(rootPath, paths);
    } catch {}
  };

  return (
    <div className="pw-sidebar__scroll" role="tree" aria-label="Project tree">
      {rootPath && (
        <>
          <div className="pw-section"><span className="pw-section__label">Assets</span></div>
          <TreeRow
            label={rootName}
            iconEl={<VscodeIcon name={rootName} isDir={true} isOpen={expandedSet.has(rootPath)} size={16} />}
            depth={0}
            hasChildren={rootChildren === null || (rootChildren && rootChildren.length > 0)}
            isOpen={expandedSet.has(rootPath)}
            isSelected={selectedPath === rootPath}
            isDropTarget={dropTarget === rootPath}
            onClick={() => onSelect(rootPath)}
            onArrowClick={() => onToggle(rootPath)}
            onDragOver={handleRootDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleRootDrop}
          />
          {expandedSet.has(rootPath) && rootChildren && rootChildren.map((entry) => (
            <FolderNode key={entry.path} entry={entry} depth={1}
              selectedPath={selectedPath} expandedSet={expandedSet}
              childCache={childCache} onSelect={onSelect} onToggle={onToggle}
              loadChildren={loadChildren} onDrop={onDrop}
              dropTarget={dropTarget} setDropTarget={setDropTarget} />
          ))}
        </>
      )}
    </div>
  );
};

export default SidebarTree;
