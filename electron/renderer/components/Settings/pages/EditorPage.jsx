import React, { useEffect } from "react";

// ─── EditorPage ───────────────────────────────────────────────────────────────
// Editor-specific settings: Minimap and Word Wrap.
// Removing "Choose Editor" per requirements.
// ─────────────────────────────────────────────────────────────────────────────

const EditorPage = ({ settings, onSave }) => {
  const minimap  = settings.minimap  !== false; // default true
  const wordWrap = settings.wordWrap !== false; // default true ("on")

  const toggle = async (key, currentVal) => {
    await onSave({ [key]: !currentVal });
    // Notify all open editor panels to pick up the new setting
    window.opener?.dispatchEvent(new CustomEvent("editor:settings-changed", { detail: { [key]: !currentVal } }));
    try {
      // Also broadcast via BroadcastChannel so both windows get it
      const bc = new BroadcastChannel("editor-settings");
      bc.postMessage({ [key]: !currentVal });
      bc.close();
    } catch {}
  };

  return (
    <div>
      {/* ── Minimap ──────────────────────────────────────────────────────── */}
      <div className="sw-row">
        <span className="sw-row__label">Minimap</span>
        <span className="sw-row__desc">
          Show the minimap scrollbar overview on the right side of the editor.
        </span>
        <label className="sw-toggle-row">
          <span className="sw-toggle-label">{minimap ? "Enabled" : "Disabled"}</span>
          <button
            className={`sw-toggle-btn${minimap ? " sw-toggle-btn--on" : ""}`}
            onClick={() => toggle("minimap", minimap)}
            aria-checked={minimap}
            role="switch"
            aria-label="Toggle minimap"
          >
            <span className="sw-toggle-thumb" />
          </button>
        </label>
      </div>

      {/* ── Word Wrap ─────────────────────────────────────────────────────── */}
      <div className="sw-row">
        <span className="sw-row__label">Word Wrap</span>
        <span className="sw-row__desc">
          Wrap long lines in the editor instead of scrolling horizontally.
        </span>
        <label className="sw-toggle-row">
          <span className="sw-toggle-label">{wordWrap ? "Enabled" : "Disabled"}</span>
          <button
            className={`sw-toggle-btn${wordWrap ? " sw-toggle-btn--on" : ""}`}
            onClick={() => toggle("wordWrap", wordWrap)}
            aria-checked={wordWrap}
            role="switch"
            aria-label="Toggle word wrap"
          >
            <span className="sw-toggle-thumb" />
          </button>
        </label>
      </div>
    </div>
  );
};

export default EditorPage;
