import React, { useState, useEffect, useMemo } from "react";

// ─── EditorPage ───────────────────────────────────────────────────────────────
// Lets the user pick a default file editor from detected installed applications.
// ─────────────────────────────────────────────────────────────────────────────

const EditorPage = ({ settings, onSave }) => {
  const [editors,  setEditors]  = useState([]);
  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState(settings.defaultEditor ?? "system");
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    window.electronAPI.listEditors().then(setEditors);
  }, []);

  // Sync when parent settings change (e.g. on first load)
  useEffect(() => {
    setSelected(settings.defaultEditor ?? "system");
  }, [settings.defaultEditor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return editors;
    return editors.filter((e) => e.label.toLowerCase().includes(q));
  }, [editors, query]);

  const handleSave = async () => {
    await onSave({ defaultEditor: selected });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="sw-row">
        <span className="sw-row__label">Default File Editor</span>
        <span className="sw-row__desc">
          Application used when opening files from the Project Explorer.
          Green dot means detected on this system.
        </span>

        <input
          className="sw-search"
          type="text"
          placeholder="Search editors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
        />

        <div className="sw-editor-list" role="listbox" aria-label="Editor list">
          {filtered.map((ed) => {
            const isSelected = selected === ed.id;
            return (
              <div
                key={ed.id}
                className={[
                  "sw-editor-item",
                  isSelected            ? "sw-editor-item--selected"   : "",
                  !ed.available         ? "sw-editor-item--unavailable" : "",
                ].filter(Boolean).join(" ")}
                role="option"
                aria-selected={isSelected}
                onClick={() => ed.available !== false && setSelected(ed.id)}
              >
                <span className={[
                  "sw-editor-item__dot",
                  isSelected    ? "sw-editor-item__dot--selected"  : "",
                  ed.available  ? "sw-editor-item__dot--available" : "",
                ].filter(Boolean).join(" ")} />
                <span className="sw-editor-item__label">{ed.label}</span>
                {ed.available && !isSelected && (
                  <span className="sw-editor-item__badge">installed</span>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "10px 12px", color: "#555", fontSize: 11, fontStyle: "italic" }}>
              No editors match
            </div>
          )}
        </div>
      </div>

      <button className="sw-save-btn" onClick={handleSave}>
        Save
      </button>
      {saved && <span className="sw-saved-hint">Saved</span>}
    </div>
  );
};

export default EditorPage;
