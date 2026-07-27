import React, { useState, useEffect, useCallback } from "react";
import VscodeIcon from "../shared/VscodeIcon.jsx";

const INDENT_PX = 14;

const ArrowSvg = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
    <path d="M2 1l4 3-4 3V1z"/>
  </svg>
);

// ─── Inline rename input ──────────────────────────────────────────────────────
const RenameInput = ({ initialValue, onCommit, onCancel }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = React.useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => { const v = value.trim(); if (v && v !== initialValue) onCommit(v); else onCancel(); };

  return (
    <input
      ref={inputRef}
      className="pe-node__rename-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter")  commit();
        if (e.key === "Escape") onCancel();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

// ─── FolderNode ───────────────────────────────────────────────────────────────
const FolderNode = ({
  entry, depth,
  selectedPaths, expandedSet, childCache, clipboard,
  onSelect, onMultiSelect, onRangeSelect,
  onToggle, onContextMenu, loadChildren,
  onRenameCommit,
  renamingPath, flatList,
}) => {
  const isExpanded = expandedSet.has(entry.path);
  const isSelected = selectedPaths.has(entry.path);
  const isCut      = clipboard?.mode === "cut" && clipboard.paths.includes(entry.path);
  const isRenaming = renamingPath === entry.path;
  const [loading,  setLoading] = useState(false);
  const children  = childCache.get(entry.path) ?? null;
  const hasLoaded = childCache.has(entry.path);

  useEffect(() => {
    if (isExpanded && !hasLoaded) {
      setLoading(true);
      loadChildren(entry.path).finally(() => setLoading(false));
    }
  }, [isExpanded, hasLoaded, entry.path, loadChildren]);

  const handleArrow = useCallback((e) => {
    e.stopPropagation();
    onToggle(entry.path);
  }, [entry.path, onToggle]);

  const handleClick = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) { onMultiSelect(entry.path); return; }
    if (e.shiftKey)             { onRangeSelect(entry.path, flatList ?? []); return; }
    onSelect(entry.path);
  }, [entry.path, onSelect, onMultiSelect, onRangeSelect, flatList]);

  const handleDblClick = useCallback((e) => {
    e.stopPropagation();
    onToggle(entry.path);
  }, [entry.path, onToggle]);

  const handleCtxMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(entry.path);
  }, [entry.path, onContextMenu]);

  const mightHaveChildren = !hasLoaded || (children && children.length > 0);

  return (
    <div className="pe-node" role="treeitem" aria-expanded={isExpanded} aria-selected={isSelected}>
      <div
        className={[
          "pe-node__row",
          isSelected ? "pe-node__row--selected" : "",
          isCut      ? "pe-node__row--cut"      : "",
        ].filter(Boolean).join(" ")}
        style={{ paddingLeft: `${8 + depth * INDENT_PX}px` }}
        onClick={handleClick}
        onDoubleClick={handleDblClick}
        onContextMenu={handleCtxMenu}
        tabIndex={-1}
      >
        <span
          className={`pe-node__arrow${mightHaveChildren ? (isExpanded ? " pe-node__arrow--open" : "") : " pe-node__arrow--hidden"}`}
          onClick={mightHaveChildren ? handleArrow : undefined}
          aria-hidden="true"
        >
          <ArrowSvg />
        </span>

        <span className="pe-node__icon" aria-hidden="true">
          <VscodeIcon name={entry.name} isDir={true} isOpen={isExpanded} size={16} />
        </span>

        {isRenaming ? (
          <RenameInput
            initialValue={entry.name}
            onCommit={(newName) => onRenameCommit(entry.path, newName)}
            onCancel={() => onRenameCommit(null, null)}
          />
        ) : (
          <span className="pe-node__label" title={entry.name}>{entry.name}</span>
        )}

        {loading && <span className="pe-node__spinner" aria-label="Loading">...</span>}
      </div>

      {isExpanded && hasLoaded && children && children.length > 0 && (
        <div className="pe-node__children">
          {children.map((child) => (
            <FolderNode
              key={child.path}
              entry={child}
              depth={depth + 1}
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
              onRenameCommit={onRenameCommit}
              renamingPath={renamingPath}
              flatList={flatList}
            />
          ))}
        </div>
      )}

      {isExpanded && hasLoaded && children && children.length === 0 && (
        <div className="pe-node__empty" style={{ paddingLeft: `${8 + (depth + 1) * INDENT_PX}px` }}>
          empty
        </div>
      )}
    </div>
  );
};

export default FolderNode;
