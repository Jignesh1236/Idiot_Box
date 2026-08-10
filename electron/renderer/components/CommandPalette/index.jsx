// Command Palette — Ctrl+Shift+P / F1 overlay. Lists:
//   - commands registered by running extensions (extHostCommands)
//   - commands contributed via package.json "contributes.commands"
//   - registered webview/tree views (from ext-panels viewRegistry)
//   - extension output channels
// Executing a command routes through the extension host (with onCommand
// activation fallback); views open as dockable FlexLayout panels.
import React, { useState, useEffect, useRef } from "react";
import { openView, viewRegistry } from "../../ext-panels.js";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const show = () => {
      setQuery("");
      setIdx(0);
      setOpen(true);
    };
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        show();
      } else if (e.key === "F1" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        show();
      }
    };
    const unsub = window.electronAPI.onMenuEvent("menu:commandPalette", show);
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", show);
      unsub();
    };
  }, []);

  const refresh = async () => {
    const list = [];
    try {
      const cmds = await window.electronAPI.extHostCommands();
      for (const id of cmds || []) list.push({ kind: "command", id, title: id, extKey: "" });
    } catch {}
    try {
      const inst = await window.electronAPI.vsxListInstalled();
      for (const e of inst || []) {
        const contributes = e.manifest && e.manifest.contributes;
        if (!contributes) continue;
        for (const cmd of Array.isArray(contributes.commands) ? contributes.commands : []) {
          if (cmd && cmd.command) {
            list.push({ kind: "command", id: cmd.command, title: cmd.title || cmd.command, extKey: e.id });
          }
        }
      }
    } catch {}
    for (const [key, v] of viewRegistry) {
      list.push({
        kind: "view", key,
        title: `${v.kind === "tree" ? "Tree View" : "Webview View"}: ${v.title}`,
        extKey: v.extKey,
      });
    }
    try {
      const s = await window.electronAPI.extHostState();
      for (const ch of (s && s.channels) || []) {
        list.push({ kind: "output", key: ch.key, title: `Output: ${ch.name}`, extKey: ch.extKey });
      }
    } catch {}
    list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    setItems(list);
  };

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const run = (item) => {
    setOpen(false);
    if (!item) return;
    if (item.kind === "command") {
      window.electronAPI.extHostRunCommand(item.id, []).catch(() => {});
    } else if (item.kind === "view") {
      openView(item.key);
    } else if (item.kind === "output") {
      window.dispatchEvent(new CustomEvent("ext-output:show", { detail: { key: item.key } }));
    }
  };

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((i) => String(i.title).toLowerCase().includes(q) || String(i.id || "").toLowerCase().includes(q))
    : items;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 900 }} onClick={() => setOpen(false)} />
      <div
        style={{
          position: "fixed", top: "12%", left: "50%", transform: "translateX(-50%)",
          width: 560, maxWidth: "90vw", zIndex: 901,
          background: "#252526", border: "1px solid #3a3a3a", borderRadius: 6,
          boxShadow: "0 12px 48px rgba(0,0,0,0.65)", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); run(filtered[idx]); }
            else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
          }}
          placeholder="Type a command, view or channel…"
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 12px",
            background: "#1e1e1e", border: "none", borderBottom: "1px solid #3a3a3a",
            color: "#dddddd", fontSize: 13, outline: "none",
          }}
        />
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: "#666", textAlign: "center" }}>No matching entries.</div>
          )}
          {filtered.map((item, i) => (
            <div
              key={`${item.kind}:${item.id || item.key}`}
              onClick={() => run(item)}
              onMouseEnter={() => setIdx(i)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                cursor: "pointer", fontSize: 12.5,
                background: i === idx ? "#094771" : "transparent", color: i === idx ? "#ffffff" : "#cccccc",
              }}
            >
              <span style={{
                fontSize: 9.5, padding: "1px 6px", borderRadius: 8, flexShrink: 0,
                background: i === idx ? "rgba(255,255,255,0.18)" : "#3a3a3a",
                color: i === idx ? "#ffffff" : "#999999", textTransform: "uppercase", letterSpacing: 0.4,
              }}>
                {item.kind}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                {item.title}
              </span>
              {item.extKey ? (
                <span style={{ fontSize: 10.5, color: i === idx ? "rgba(255,255,255,0.7)" : "#6a6a6a", flexShrink: 0 }}>{item.extKey}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
