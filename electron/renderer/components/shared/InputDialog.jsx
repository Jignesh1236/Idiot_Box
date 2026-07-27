import React, { useState, useEffect, useRef } from "react";

// ── InputDialog ───────────────────────────────────────────────────────────────
// A lightweight modal input that replaces window.prompt (blocked in Electron).
// Usage:
//   const { dialog, ask } = useInputDialog();
//   // in JSX: {dialog}
//   // to show: const value = await ask("Folder name:", "New Folder");
//   // returns the trimmed string, or null if cancelled.
// ─────────────────────────────────────────────────────────────────────────────

export const InputDialog = ({ state }) => {
  const [val, setVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (state.open) {
      setVal(state.defaultValue ?? "");
      // Focus after paint
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [state.open, state.defaultValue]);

  if (!state.open) return null;

  const commit = () => {
    const v = val.trim();
    state.resolve(v || null);
  };
  const cancel = () => state.resolve(null);

  return (
    <div className="id-overlay" onMouseDown={cancel}>
      <div className="id-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="id-label">{state.label}</div>
        <input
          ref={inputRef}
          className="id-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")  { e.preventDefault(); commit(); }
            if (e.key === "Escape") { e.preventDefault(); cancel(); }
          }}
        />
        <div className="id-actions">
          <button className="id-btn id-btn--cancel" onClick={cancel}>Cancel</button>
          <button className="id-btn id-btn--ok"     onClick={commit}>OK</button>
        </div>
      </div>
    </div>
  );
};

export const useInputDialog = () => {
  const [state, setState] = useState({ open: false, label: "", defaultValue: "", resolve: null });

  const ask = (label, defaultValue = "") =>
    new Promise((resolve) => {
      setState({ open: true, label, defaultValue, resolve: (v) => { setState((s) => ({ ...s, open: false })); resolve(v); } });
    });

  const dialog = <InputDialog state={state} />;
  return { dialog, ask };
};
