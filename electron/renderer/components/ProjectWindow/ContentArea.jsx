import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import VscodeIcon from "../shared/VscodeIcon.jsx";
import useSettings from "../shared/useSettings.jsx";

// ── SVG icons ─────────────────────────────────────────────────────────────────
const IcoFolder = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.086a1.5 1.5 0 0 1 1.06.44L7.56 3.5H13.5A1.5 1.5 0 0 1 15 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z"/>
  </svg>
);
const IcoFile = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5.5L9.5 0H4Zm5.5 1.5v3A1.5 1.5 0 0 0 11 6h3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5Z"/>
  </svg>
);
const IcoEye = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8ZM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8Z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/>
  </svg>
);

const IconBtn = ({ title, active, onClick, children }) => (
  <button className={`pw-bar-btn${active ? " pw-bar-btn--active" : ""}`} title={title} onClick={onClick} aria-pressed={active}>
    {children}
  </button>
);

// ── Breadcrumb + search + filter bar ─────────────────────────────────────────
const Bar = ({ rootPath, currentPath, onNavigate, query, onQuery, showFolders, onToggleFolders, showFiles, onToggleFiles, itemCount, selectedCount }) => {
  const crumbs = [];
  if (rootPath && currentPath) {
    const rootName = rootPath.split(/[\\/]/).filter(Boolean).pop();
    const relative = currentPath.slice(rootPath.length).replace(/^[\\/]/, "");
    const segs = relative ? relative.split(/[\\/]/) : [];
    crumbs.push({ label: rootName, path: rootPath });
    let b = rootPath;
    for (const s of segs) { b = b + "/" + s; crumbs.push({ label: s, path: b }); }
  }

  // Eye button label: show selected count if any, else total
  const eyeLabel = selectedCount > 0 ? `${selectedCount} selected` : itemCount != null ? `${itemCount} items` : "";

  return (
    <div className="pw-bar">
      <div className="pw-bar__crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={c.path}>
            {i > 0 && <span className="pw-breadcrumb__sep">›</span>}
            <span
              className={`pw-breadcrumb__item${i === crumbs.length - 1 ? " pw-breadcrumb__item--active" : ""}`}
              onClick={() => i < crumbs.length - 1 && onNavigate(c.path)}
              title={c.path}
            >{c.label}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="pw-bar__actions">
        <div className="pw-bar__search">
          <svg className="pw-bar__search-ico" width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.868-3.833zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
          </svg>
          <input className="pw-bar__search-input" type="text" placeholder="Search" value={query} onChange={(e) => onQuery(e.target.value)} spellCheck={false}/>
          {query && <button className="pw-bar__search-clear" onClick={() => onQuery("")}>×</button>}
        </div>
        <div className="pw-bar__divider"/>
        <IconBtn title="Toggle folders" active={!showFolders} onClick={onToggleFolders}><IcoFolder/></IconBtn>
        <IconBtn title="Toggle files"   active={!showFiles}   onClick={onToggleFiles}><IcoFile/></IconBtn>
        {/* Eye shows item / selection count */}
        <div className="pw-bar-count" title={eyeLabel}>
          <IcoEye/>
          {eyeLabel && <span className="pw-bar-count__label">{selectedCount > 0 ? selectedCount : itemCount}</span>}
        </div>
      </div>
    </div>
  );
};

// ── ContentArea ───────────────────────────────────────────────────────────────
const ContentArea = ({
  rootPath, currentPath,
  selectedItems, onSetSelectedItems,
  onNavigate, onItemsLoaded, itemCount,
  invalidateCache,
}) => {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [query,       setQuery]       = useState("");
  const [showFolders, setShowFolders] = useState(true);
  const [showFiles,   setShowFiles]   = useState(true);
  // Rubber band state
  const [band,        setBand]        = useState(null); // {x,y,w,h} in px relative to grid
  const gridRef    = useRef(null);
  const contentRef = useRef(null);
  const bandOrigin = useRef(null);
  const itemRefs   = useRef({});
  const [settings] = useSettings();
  // last single-clicked path for shift-range
  const anchorRef  = useRef(null);

  useEffect(() => {
    if (!currentPath) { setEntries([]); return; }
    setLoading(true);
    window.electronAPI.readDirAll(currentPath)
      .then((data) => { setEntries(data); if (onItemsLoaded) onItemsLoaded(data.length); })
      .finally(() => setLoading(false));
  }, [currentPath]);

  useEffect(() => { setQuery(""); setShowFolders(true); setShowFiles(true); }, [currentPath]);

  const visible = useMemo(() => {
    let r = entries;
    if (!showFolders) r = r.filter((e) => !e.isDir);
    if (!showFiles)   r = r.filter((e) => e.isDir);
    if (query.trim()) { const q = query.trim().toLowerCase(); r = r.filter((e) => e.name.toLowerCase().includes(q)); }
    return r;
  }, [entries, showFolders, showFiles, query]);

  const openFile = useCallback(async (p) => {
    await window.electronAPI.openFile(p, settings.defaultEditor ?? "system");
  }, [settings.defaultEditor]);

  // ── Click selection (single / ctrl / shift) ──────────────────────────────
  const handleItemClick = useCallback((e, entry) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      // toggle
      const next = new Set(selectedItems);
      next.has(entry.path) ? next.delete(entry.path) : next.add(entry.path);
      onSetSelectedItems(next);
    } else if (e.shiftKey && anchorRef.current) {
      // range
      const paths = visible.map((v) => v.path);
      const a = paths.indexOf(anchorRef.current);
      const b = paths.indexOf(entry.path);
      if (a !== -1 && b !== -1) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        onSetSelectedItems(new Set(paths.slice(lo, hi + 1)));
      } else {
        onSetSelectedItems(new Set([entry.path]));
      }
    } else {
      anchorRef.current = entry.path;
      onSetSelectedItems(new Set([entry.path]));
    }
  }, [selectedItems, onSetSelectedItems, visible]);

  // Click on blank grid area — deselect
  const handleGridClick = useCallback((e) => {
    if (e.target === gridRef.current || e.target === contentRef.current) {
      onSetSelectedItems(new Set());
      anchorRef.current = null;
    }
  }, [onSetSelectedItems]);

  // ── Rubber band selection ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    // Only on left click directly on the grid background
    if (e.button !== 0) return;
    if (e.target !== gridRef.current && e.target !== contentRef.current) return;
    e.preventDefault();
    const rect = contentRef.current.getBoundingClientRect();
    const scrollTop = contentRef.current.scrollTop;
    bandOrigin.current = { x: e.clientX - rect.left, y: e.clientY - rect.top + scrollTop };
    if (!e.ctrlKey && !e.metaKey) { onSetSelectedItems(new Set()); anchorRef.current = null; }

    const onMove = (mv) => {
      const cx = mv.clientX - rect.left;
      const cy = mv.clientY - rect.top + contentRef.current.scrollTop;
      const ox = bandOrigin.current.x;
      const oy = bandOrigin.current.y;
      const bx = Math.min(cx, ox), by = Math.min(cy, oy);
      const bw = Math.abs(cx - ox), bh = Math.abs(cy - oy);
      setBand({ x: bx, y: by, w: bw, h: bh });

      // Hit-test each item
      const next = new Set(e.ctrlKey || e.metaKey ? selectedItems : []);
      visible.forEach((entry) => {
        const el = itemRefs.current[entry.path];
        if (!el) return;
        const er = el.getBoundingClientRect();
        const elx = er.left - rect.left;
        const ely = er.top  - rect.top  + contentRef.current.scrollTop;
        const elr = elx + er.width;
        const elb = ely + er.height;
        if (bx < elr && bx + bw > elx && by < elb && by + bh > ely) next.add(entry.path);
        else if (!e.ctrlKey && !e.metaKey) next.delete(entry.path);
      });
      onSetSelectedItems(next);
    };

    const onUp = () => {
      setBand(null);
      bandOrigin.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [visible, selectedItems, onSetSelectedItems]);

  // ── Drag items ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, entry) => {
    // If dragging an unselected item, select it first
    let toDrag = selectedItems.size > 0 && selectedItems.has(entry.path)
      ? [...selectedItems]
      : [entry.path];
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/ppoo-paths", JSON.stringify(toDrag));
  }, [selectedItems]);

  // ── Context menu ─────────────────────────────────────────────────────────
  const handleContextMenu = useCallback(async (e, entry) => {
    e.preventDefault();
    if (!selectedItems.has(entry.path)) {
      onSetSelectedItems(new Set([entry.path]));
      anchorRef.current = entry.path;
    }
    const result = await window.electronAPI.showContextMenu(entry.isDir ? "folder" : "file", entry.path, null);
    if (!result) return;
    switch (result.action) {
      case "open":     if (!entry.isDir) await openFile(entry.path); break;
      case "openWith": await window.electronAPI.openFile(entry.path, "system"); break;
      case "rename": {
        const n = window.prompt("Rename to:", entry.name);
        if (n?.trim()) { await window.electronAPI.rename(entry.path, n.trim()); onNavigate(currentPath); }
        break;
      }
      case "delete": {
        if (window.confirm(`Delete "${entry.name}"?`)) {
          await window.electronAPI.deleteItem(entry.path, true); onNavigate(currentPath);
        }
        break;
      }
      case "duplicate": await window.electronAPI.duplicate(entry.path); onNavigate(currentPath); break;
      case "reveal":    window.electronAPI.revealInExplorer(entry.path); break;
      case "copyPath":  navigator.clipboard.writeText(entry.path); break;
    }
  }, [currentPath, selectedItems, openFile, onSetSelectedItems, onNavigate]);

  return (
    <div className="pw-right">
      <Bar
        rootPath={rootPath} currentPath={currentPath} onNavigate={onNavigate}
        query={query} onQuery={setQuery}
        showFolders={showFolders} onToggleFolders={() => setShowFolders((v) => !v)}
        showFiles={showFiles}    onToggleFiles={() => setShowFiles((v) => !v)}
        itemCount={itemCount}    selectedCount={selectedItems.size}
      />

      <div className="pw-content" ref={contentRef} onMouseDown={handleMouseDown} onClick={handleGridClick}>
        {loading && <div className="pw-content__empty">Loading...</div>}
        {!loading && visible.length === 0 && (
          <div className="pw-content__empty">{query || !showFolders || !showFiles ? "No items match" : "Folder is empty"}</div>
        )}
        {!loading && visible.length > 0 && (
          <div className="pw-grid" ref={gridRef} role="list">
            {visible.map((entry) => (
              <div
                key={entry.path}
                ref={(el) => { if (el) itemRefs.current[entry.path] = el; else delete itemRefs.current[entry.path]; }}
                className={`pw-item${selectedItems.has(entry.path) ? " pw-item--selected" : ""}`}
                role="listitem"
                title={entry.name}
                draggable
                onDragStart={(e) => handleDragStart(e, entry)}
                onClick={(e) => handleItemClick(e, entry)}
                onDoubleClick={() => entry.isDir ? onNavigate(entry.path) : openFile(entry.path)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
              >
                <div className="pw-item__icon-wrap">
                  <VscodeIcon name={entry.name} isDir={entry.isDir} size={48}/>
                </div>
                <span className="pw-item__label">{entry.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rubber band rect */}
        {band && band.w > 4 && band.h > 4 && (
          <div className="pw-rubber-band" style={{ left: band.x, top: band.y, width: band.w, height: band.h }}/>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
