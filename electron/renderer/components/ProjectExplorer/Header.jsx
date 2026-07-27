import React, { useState, useRef, useEffect } from "react";

// SVG folder icon — no emojis
const FolderSvg = () => (
  <svg className="pe-header__icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.086a1.5 1.5 0 0 1 1.06.44L7.56 3.5H13.5A1.5 1.5 0 0 1 15 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" fill="#c8a84b" opacity="0.85"/>
  </svg>
);

const Header = ({ projectName, onRefresh }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="pe-header">
      <span className="pe-header__title">
        <FolderSvg />
        <span className="pe-header__name" title={projectName}>{projectName}</span>
      </span>

      <span className="pe-header__actions">
        <button className="pe-icon-btn" title="Refresh" onClick={onRefresh} aria-label="Refresh">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M13.65 2.35A8 8 0 1 0 15 8h-1.5A6.5 6.5 0 1 1 8 1.5a6.46 6.46 0 0 1 4.59 1.91L10 6h5V1l-1.35 1.35z"/>
          </svg>
        </button>

        <div className="pe-menu-wrap" ref={menuRef}>
          <button
            className="pe-icon-btn"
            title="More options"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="More options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <circle cx="8" cy="2.5" r="1.5"/>
              <circle cx="8" cy="8"   r="1.5"/>
              <circle cx="8" cy="13.5" r="1.5"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="pe-dropdown" role="menu">
              <div className="pe-dropdown__empty">No actions yet</div>
            </div>
          )}
        </div>
      </span>
    </div>
  );
};

export default Header;
