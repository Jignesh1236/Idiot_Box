import React, { useState, useEffect, useRef, useCallback } from "react";
import { viewRegistry, openView } from "../../ext-panels.js";

const API = () => window.electronAPI;

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n || 0));

const accent = "#007acc";

const btn = (bg) => ({
  background: bg,
  color: "#ffffff",
  border: "none",
  borderRadius: 3,
  padding: "4px 12px",
  fontSize: 12,
  cursor: "pointer",
  outline: "none",
  whiteSpace: "nowrap",
});
const ghostBtn = {
  background: "#3a3d41",
  color: "#e8e8e8",
  border: "none",
  borderRadius: 3,
  padding: "4px 12px",
  fontSize: 12,
  cursor: "pointer",
  outline: "none",
  whiteSpace: "nowrap",
};

function ExtIcon({ src, size = 32 }) {
  return src ? (
    <img src={src} width={size} height={size} style={{ borderRadius: 4, objectFit: "contain", flexShrink: 0 }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 4, background: "#2d2d2d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: size / 2, color: "#8a8a8a", fontWeight: 600 }}>◆</div>
  );
}

const ExtensionsPanel = () => {
  const [tab, setTab] = useState("market"); // "market" | "installed"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [installed, setInstalled] = useState([]);
  const [icons, setIcons] = useState({}); // iconUrl -> dataUrl

  const [selected, setSelected] = useState(null); // { kind: "remote"|"installed", ext }
  const [details, setDetails] = useState(null);   // { ext, loading, error }
  const [busy, setBusy] = useState({});           // key -> "installing"|"updating"|"uninstalling"|"toggling"
  const [notice, setNotice] = useState(null);     // { kind: "ok"|"err", text, key }

  // ── Extension host state (commands, output, activation) ──────────────────
  const [hostState, setHostState] = useState(null);
  const [hostError, setHostError] = useState(null);
  const [outputKey, setOutputKey] = useState(null);
  const [outputLines, setOutputLines] = useState(null);
  const outputKeyRef = useRef(null);
  const [views, setViews] = useState([]);

  const debounceRef = useRef(null);
  const installedMap = useRef(new Map());

  const syncViews = useCallback(() => {
    setViews([...viewRegistry.values()]);
  }, []);

  const refreshInstalled = useCallback(async () => {
    try {
      const list = await API().vsxListInstalled();
      const arr = Array.isArray(list) ? list : [];
      setInstalled(arr);
      installedMap.current = new Map(arr.map((e) => [`${(e.publisher || "").toLowerCase()}.${(e.name || "").toLowerCase()}`, e]));
    } catch {
      installedMap.current = new Map();
      setInstalled([]);
    }
  }, []);

  const refreshHost = useCallback(async () => {
    try {
      const s = await API().extHostState();
      setHostState(s);
    } catch { /* host IPC unavailable */ }
  }, []);

  useEffect(() => {
    refreshInstalled();
    refreshHost();
    const unsub = window.electronAPI?.onExtEvent ? window.electronAPI.onExtEvent((ev) => {
      if (!ev || !ev.type) return;
      if (ev.type === "hostState") {
        setHostError(ev.error || null);
        refreshHost();
        refreshInstalled();
      } else if (ev.type === "ext-activation" || ev.type === "ext-deactivated" || ev.type === "command") {
        refreshHost();
        refreshInstalled();
      } else if (ev.type === "output") {
        if (outputKeyRef.current && ev.key === outputKeyRef.current) {
          setOutputLines((prev) => {
            const next = [...(prev || [])];
            for (const line of String(ev.text || "").split("\n")) next.push({ seq: next.length + 1, text: line });
            return next.length > 2000 ? next.slice(-2000) : next;
          });
        }
      } else if (ev.type === "outputShow") {
        viewOutput(ev.key);
      }
    }) : null;
    window.addEventListener("ext-views-changed", syncViews);
    window.addEventListener("ext-output:show", (e) => {
      const key = e.detail && e.detail.key;
      if (key) viewOutput(key);
    });
    return () => { unsub?.(); window.removeEventListener("ext-views-changed", syncViews); if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [refreshInstalled, refreshHost]);

  const notify = (kind, text) => {
    setNotice({ kind, text, key: Date.now() });
  };

  // ── Search (debounced) ──────────────────────────────────────────────────────
  const runSearch = useCallback(async (q) => {
    const qq = (q || "").trim();
    if (!qq) { setResults([]); setTotal(0); setSearching(false); return; }
    setSearching(true);
    setSearchError(null);
    try {
      const r = await API().vsxSearch(qq, 30, 0);
      if (r && r.success) {
        setResults(r.extensions || []);
        setTotal(r.totalSize || 0);
      } else {
        setResults([]);
        setTotal(0);
        setSearchError((r && r.error) || "Search failed");
      }
    } catch (err) {
      setResults([]);
      setTotal(0);
      setSearchError(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  const onQueryChange = (v) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(v), 350);
  };

  // ── Icons (fetched via main process, cached) ────────────────────────────────
  const loadIcon = useCallback(async (iconUrl) => {
    if (!iconUrl || icons[iconUrl]) return;
    try {
      const r = await API().vsxIcon(iconUrl);
      if (r && r.success) setIcons((prev) => ({ ...prev, [iconUrl]: r.dataUrl }));
    } catch { /* icon is optional */ }
  }, [icons]);

  // ── Details ─────────────────────────────────────────────────────────────────
  const openRemote = useCallback(async (ext) => {
    setSelected({ kind: "remote", ext });
    setDetails({ ext: null, loading: true, error: null });
    if (ext.iconUrl) loadIcon(ext.iconUrl);
    try {
      const r = await API().vsxDetails(ext.publisher, ext.name);
      if (r && r.success) {
        setDetails({ ext: { ...r.ext, iconUrl: ext.iconUrl || r.ext.iconUrl }, loading: false, error: null });
      } else {
        setDetails({ ext: null, loading: false, error: (r && r.error) || "Could not load details" });
      }
    } catch (err) {
      setDetails({ ext: null, loading: false, error: err.message || "Could not load details" });
    }
  }, [loadIcon]);

  const openInstalled = useCallback((entry) => {
    setSelected({ kind: "installed", ext: entry });
    setDetails({ ext: entry, loading: false, error: null });
  }, []);

  const keyOf = (publisher, name) => `${(publisher || "").toLowerCase()}.${(name || "").toLowerCase()}`;
  const installedEntryOf = (publisher, name) => installedMap.current.get(keyOf(publisher, name));

  const emitChanged = () => window.dispatchEvent(new CustomEvent("vsx:changed"));

  // ── Actions ─────────────────────────────────────────────────────────────────
  const installRemote = async (publisher, name, version) => {
    const key = `install:${keyOf(publisher, name)}`;
    setBusy((b) => ({ ...b, [key]: "installing" }));
    try {
      const r = await API().vsxInstall(publisher, name, version);
      if (r && r.success) {
        await refreshInstalled();
        emitChanged();
        notify("ok", `Installed ${r.entry.displayName || name} ${r.entry.version}`);
        // If we have details open for this extension, refresh them from the installed copy
        if (selected && selected.kind === "remote" && keyOf(selected.ext.publisher, selected.ext.name) === keyOf(publisher, name)) {
          const installedEntry = installedMap.current.get(key);
          if (installedEntry) setSelected({ kind: "installed", ext: installedEntry });
        }
      } else {
        notify("err", (r && r.error) || "Install failed");
      }
    } catch (err) {
      notify("err", err.message || "Install failed");
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  };

  const installLocal = async () => {
    try {
      const picked = await API().vsxPickVsix();
      if (!picked) return;
      notify("ok", "Installing from VSIX…");
      const r = await API().vsxInstallLocal(picked);
      if (r && r.success) {
        await refreshInstalled();
        emitChanged();
        notify("ok", `Installed ${r.entry.displayName || r.entry.name} ${r.entry.version}`);
        if (r.entry.warnings && r.entry.warnings.length) {
          notify("err", r.entry.warnings.join(" "));
        }
      } else {
        notify("err", (r && r.error) || "Install from VSIX failed");
      }
    } catch (err) {
      notify("err", err.message || "Install from VSIX failed");
    }
  };

  const toggleInstalled = async (entry) => {
    const key = `toggle:${entry.id}`;
    setBusy((b) => ({ ...b, [key]: "toggling" }));
    try {
      const r = await API().vsxToggle(entry.id);
      if (r && r.success) {
        await refreshInstalled();
        emitChanged();
      } else {
        notify("err", (r && r.error) || "Failed to toggle extension");
      }
    } catch (err) {
      notify("err", err.message || "Failed to toggle extension");
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  };

  const uninstallExt = async (entry) => {
    const key = `uninstall:${entry.id}`;
    setBusy((b) => ({ ...b, [key]: "uninstalling" }));
    try {
      const r = await API().vsxUninstall(entry.id);
      if (r && r.success) {
        await refreshInstalled();
        emitChanged();
        notify("ok", `Uninstalled ${entry.displayName || entry.name}`);
        if (selected && selected.kind === "installed" && selected.ext.id === entry.id) {
          setSelected(null);
          setDetails(null);
        }
      } else {
        notify("err", (r && r.error) || "Uninstall failed");
      }
    } catch (err) {
      notify("err", err.message || "Uninstall failed");
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  };

  const updateExt = async (entry) => {
    const key = `update:${entry.id}`;
    setBusy((b) => ({ ...b, [key]: "updating" }));
    try {
      const r = await API().vsxUpdate(entry.id);
      if (r && r.success) {
        await refreshInstalled();
        emitChanged();
        if (r.upToDate) notify("ok", `${entry.displayName || entry.name} is already up to date`);
        else notify("ok", `Updated ${r.entry.displayName || r.entry.name} to ${r.entry.version}`);
        if (selected && selected.kind === "installed" && selected.ext.id === entry.id) {
          setSelected({ kind: "installed", ext: installedMap.current.get(keyOf(r.entry.publisher, r.entry.name)) || r.entry });
        }
      } else {
        notify("err", (r && r.error) || "Update failed");
      }
    } catch (err) {
      notify("err", err.message || "Update failed");
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  };

  // ── Render: search list item ────────────────────────────────────────────────
  const renderSearchItem = (ext) => {
    const inst = installedEntryOf(ext.publisher, ext.name);
    const bkey = `install:${keyOf(ext.publisher, ext.name)}`;
    const installing = busy[bkey] === "installing";
    return (
      <div key={`${ext.publisher}.${ext.name}`}
        onClick={() => openRemote(ext)}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
          cursor: "pointer", borderBottom: "1px solid #2a2a2a",
          background: selected && selected.kind === "remote" && keyOf(selected.ext.publisher, selected.ext.name) === keyOf(ext.publisher, ext.name) ? "#252526" : "transparent",
        }}
        onMouseEnter={(e) => { if (!(selected && selected.kind === "remote" && keyOf(selected.ext.publisher, selected.ext.name) === keyOf(ext.publisher, ext.name))) e.currentTarget.style.background = "#1f1f20"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <ExtIcon src={icons[ext.iconUrl]} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: "#dddddd", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {ext.displayName || ext.name}
          </div>
          <div style={{ fontSize: 11, color: "#888888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {ext.publisher}.{ext.name} · {ext.version}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#666666", textAlign: "right", whiteSpace: "nowrap" }}>
          {fmt(ext.downloadCount)}<span style={{ color: "#4d4d4d" }}> downloads</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); inst ? openInstalled(inst) : installRemote(ext.publisher, ext.name, ext.version); }}
          style={inst ? { ...ghostBtn, background: "#2d3137", cursor: "pointer" } : installing ? { ...ghostBtn, opacity: 0.7, cursor: "wait" } : { ...btn(accent) }}
          disabled={installing}
        >
          {installing ? "Installing…" : inst ? (inst.enabled ? "Installed" : "Disabled") : "Install"}
        </button>
      </div>
    );
  };

  // ── Render: installed list item ─────────────────────────────────────────────
  const renderInstalledItem = (entry) => {
    const tkey = `toggle:${entry.id}`;
    const ukey = `uninstall:${entry.id}`;
    const dkey = `update:${entry.id}`;
    return (
      <div key={entry.id}
        onClick={() => openInstalled(entry)}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
          cursor: "pointer", borderBottom: "1px solid #2a2a2a",
          background: selected && selected.kind === "installed" && selected.ext.id === entry.id ? "#252526" : "transparent",
        }}
      >
        <ExtIcon src={entry.iconDataUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: "#dddddd", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {entry.displayName || entry.name} {!entry.enabled && <span style={{ color: "#8a8a8a", fontWeight: 400 }}>(disabled)</span>}
            {entry.host && entry.host.state !== "inactive" && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 8, color: "#ffffff", fontWeight: 500,
                background: entry.host.state === "active" ? "#1f5c2b" : entry.host.state === "failed" ? "#6b2d2d" : entry.host.state === "activating" ? "#5c4200" : "#3a3d41",
                border: "1px solid rgba(255,255,255,0.15)",
                verticalAlign: "1px",
              }}
                title={entry.host.activationError || entry.host.state}
              >
                {entry.host.state}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#888888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {entry.publisher}.{entry.name} · {entry.version} · {entry.source === "local" ? "from VSIX" : "Open VSX"}
          </div>
        </div>
        {busy[dkey] === "updating" ? <span style={{ fontSize: 11, color: "#9a9a9a" }}>Updating…</span> : (
          <button style={ghostBtn} onClick={(e) => { e.stopPropagation(); updateExt(entry); }}>Update</button>
        )}
        <button style={ghostBtn} onClick={(e) => { e.stopPropagation(); toggleInstalled(entry); }} disabled={busy[tkey] === "toggling"}>
          {busy[tkey] === "toggling" ? "…" : entry.enabled ? "Disable" : "Enable"}
        </button>
        <button
          style={{ ...ghostBtn, background: "#4a2020" }}
          onClick={(e) => { e.stopPropagation(); uninstallExt(entry); }}
          disabled={busy[ukey] === "uninstalling"}
        >
          {busy[ukey] === "uninstalling" ? "…" : "Uninstall"}
        </button>
      </div>
    );
  };

  // ── Render: details (remote) ────────────────────────────────────────────────
  const renderRemoteDetails = () => {
    const ext = details.ext;
    const inst = ext ? installedEntryOf(ext.publisher, ext.name) : null;
    const bkey = ext ? `install:${keyOf(ext.publisher, ext.name)}` : "";
    const installing = busy[bkey] === "installing";
    const iconSrc = ext ? (icons[ext.iconUrl] || ext.iconUrl) : null;

    const link = (href, label) => href ? <a href={href} target="_blank" rel="noreferrer" style={{ color: "#569cd6", fontSize: 11 }}>{label}</a> : null;

    return (
      <div style={{ padding: 16, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <ExtIcon src={iconSrc} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {ext.displayName || ext.name}
            </div>
            <div style={{ fontSize: 11.5, color: "#8a8a8a" }}>{ext.publisher}.{ext.name} · v{ext.version}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {inst ? (
              <button style={ghostBtn} onClick={() => openInstalled(inst)}>Manage</button>
            ) : (
              <button
                style={installing ? { ...btn(accent), opacity: 0.7, cursor: "wait" } : btn(accent)}
                onClick={() => installRemote(ext.publisher, ext.name, ext.version)}
                disabled={installing}
              >
                {installing ? "Installing…" : "Install"}
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: "#cccccc", lineHeight: 1.5, marginBottom: 14 }}>
          {ext.description || "No description provided."}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 11.5, color: "#9a9a9a" }}>
          <span>⬇ {fmt(ext.downloadCount)} downloads</span>
          {ext.averageRating != null && <span>★ {Number(ext.averageRating).toFixed(1)}</span>}
          {ext.license ? <span>License: {typeof ext.license === "string" ? ext.license : "yes"}</span> : null}
          {ext.categories && ext.categories.length ? <span>{ext.categories.join(", ")}</span> : null}
        </div>

        {ext.languages && ext.languages.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Languages</div>
            <div style={{ fontSize: 12, color: "#cccccc" }}>{ext.languages.join(", ")}</div>
          </div>
        ) : null}

        {ext.hasMain ? (
          <div style={{ marginBottom: 14, background: "#1f2b3d", border: "1px solid #2d3f57", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#9cc2e8" }}>
            This extension includes an activation script — it runs in the built-in extension host when the extension activates (on command, language or document activity).
          </div>
        ) : null}

        {ext.engines ? (
          <div style={{ marginBottom: 14, fontSize: 11.5, color: "#9a9a9a" }}>
            engines.vscode: {ext.engines.vscode} — this editor provides ~1.94 API level
          </div>
        ) : null}

        {ext.dependencies && ext.dependencies.length ? (
          <div style={{ marginBottom: 14, background: "#1f2b3d", border: "1px solid #2d3f57", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#9cc2e8" }}>
            Declares extension dependencies: {ext.dependencies.join(", ")} — they are not installed automatically.
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {link(ext.repository, "Repository")}
          {link(ext.homepage, "Homepage")}
          {link(ext.readmeUrl, "Readme")}
        </div>
      </div>
    );
  };

  // ── Render: details (installed) ─────────────────────────────────────────────
  const renderInstalledDetails = () => {
    const entry = details.ext;
    const tkey = `toggle:${entry.id}`;
    const ukey = `uninstall:${entry.id}`;
    const dkey = `update:${entry.id}`;
    return (
      <div style={{ padding: 16, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <ExtIcon src={entry.iconDataUrl} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {entry.displayName || entry.name}
            </div>
            <div style={{ fontSize: 11.5, color: "#8a8a8a" }}>{entry.publisher}.{entry.name} · v{entry.version}</div>
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: "#cccccc", lineHeight: 1.5, marginBottom: 14 }}>
          {entry.description || "No description provided."}
        </div>

        {entry.warnings && entry.warnings.length ? (
          <div style={{ marginBottom: 14 }}>
            {entry.warnings.map((w, i) => (
              <div key={i} style={{ background: "#3d2b00", border: "1px solid #5c4200", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#d8b96a", marginBottom: 6 }}>
                {w}
              </div>
            ))}
          </div>
        ) : null}

        {entry.loadError ? (
          <div style={{ marginBottom: 14, background: "#4a2020", border: "1px solid #6b2d2d", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#e8a0a0" }}>
            {entry.loadError}
          </div>
        ) : null}

        {entry.host && (entry.host.state !== "inactive" || entry.host.enginesNote) ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Extension host</div>
            <div style={{ fontSize: 12, color: entry.host.state === "failed" ? "#e8a0a0" : entry.host.state === "active" ? "#7fc98a" : entry.host.state === "activating" ? "#d8b96a" : "#8a8a8a", marginBottom: entry.host.activationError || entry.host.enginesNote ? 6 : 0 }}>
              State: {entry.host.state}
              {entry.host.activatedAt ? ` · activated ${new Date(entry.host.activatedAt).toLocaleTimeString()}` : ""}
            </div>
            {entry.host.activationError ? (
              <div style={{ background: "#4a2020", border: "1px solid #6b2d2d", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#e8a0a0", marginBottom: 6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {entry.host.activationError}
              </div>
            ) : null}
            {entry.host.enginesNote ? (
              <div style={{ background: "#3d2b00", border: "1px solid #5c4200", borderRadius: 4, padding: "8px 10px", fontSize: 11.5, color: "#d8b96a" }}>
                {entry.host.enginesNote}
              </div>
            ) : null}
          </div>
        ) : null}

        {entry.languages && entry.languages.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Languages</div>
            <div style={{ fontSize: 12, color: "#cccccc" }}>{entry.languages.join(", ")}</div>
          </div>
        ) : null}

        {entry.lsp && entry.lsp.status === "available" ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Language server</div>
            <div style={{ fontSize: 12, color: "#7fc98a" }}>
              {entry.lsp.name} — serves: {entry.lsp.languages.length ? entry.lsp.languages.join(", ") : "all open documents"}
              {entry.lsp.kind === "node" ? " (bundled Node server)" : " (bundled binary)"}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Language server</div>
            <div style={{ fontSize: 12, color: "#8a8a8a" }}>
              No bundled language server detected — grammars, configuration and snippets are active, but LSP features (autocomplete, diagnostics, hover…) are not available for this extension.
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button style={entry.enabled ? ghostBtn : { ...btn(accent) }} onClick={() => toggleInstalled(entry)} disabled={busy[tkey] === "toggling"}>
            {busy[tkey] === "toggling" ? "…" : entry.enabled ? "Disable" : "Enable"}
          </button>
          <button style={ghostBtn} onClick={() => updateExt(entry)} disabled={busy[dkey] === "updating"}>
            {busy[dkey] === "updating" ? "Updating…" : "Check for updates"}
          </button>
          <button style={{ ...ghostBtn, background: "#4a2020" }} onClick={() => uninstallExt(entry)} disabled={busy[ukey] === "uninstalling"}>
            {busy[ukey] === "uninstalling" ? "…" : "Uninstall"}
          </button>
        </div>
      </div>
    );
  };

  const runHostCommand = async (id) => {
    try {
      const r = await API().extHostRunCommand(id, []);
      if (r && !r.success) notify("err", r.error || `Command '${id}' failed`);
    } catch {
      notify("err", "Extension host is not running");
    }
  };

  const viewOutput = async (key) => {
    setOutputKey(key);
    outputKeyRef.current = key;
    try {
      const lines = await API().extHostOutput(key);
      setOutputLines(Array.isArray(lines) ? lines : []);
    } catch {
      setOutputLines([]);
    }
  };

  const renderHostOverview = () => {
    const commands = (hostState && hostState.commands) || [];
    const channels = (hostState && hostState.channels) || [];
    const records = (hostState && hostState.records) || [];
    const running = hostState ? !!hostState.running : null;
    return (
      <div style={{ padding: 16, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginBottom: 6 }}>Extension host</div>
        <div style={{ fontSize: 12, color: hostError ? "#e8a0a0" : running ? "#7fc98a" : running === false ? "#8a8a8a" : "#888888", marginBottom: 12, lineHeight: 1.5 }}>
          {hostError
            ? `Error: ${hostError}`
            : running === null
              ? "Starting…"
              : running
                ? "Running — installed extensions' activation scripts execute here, in a Node.js extension host."
                : "Stopped — enable an installed extension to start it."}
        </div>

        {records.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Loaded extensions</div>
            {records.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 12 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                  background: r.state === "active" ? "#4aa35a" : r.state === "failed" ? "#c75f5f" : r.state === "activating" ? "#c9a14a" : "#777777",
                }} />
                <span style={{ color: "#cccccc" }}>{r.id}</span>
                <span style={{ color: "#777777" }}>({r.state})</span>
                {r.activationError ? <span style={{ color: "#e8a0a0", cursor: "help" }} title={r.activationError}>⚠</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        {commands.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Commands</div>
            {commands.map((id) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                <code style={{ flex: 1, minWidth: 0, fontSize: 11, color: "#9cc2e8", overflowWrap: "anywhere" }}>{id}</code>
                <button style={ghostBtn} onClick={() => runHostCommand(id)} disabled={!running}>Run</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Commands</div>
            <div style={{ fontSize: 12, color: "#777777" }}>No commands registered yet.</div>
          </div>
        )}

        {channels.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Output channels</div>
            {channels.map((ch) => (
              <button
                key={ch.key}
                onClick={() => viewOutput(ch.key)}
                style={{
                  display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                  padding: "3px 0", fontSize: 12, color: outputKey === ch.key ? "#ffffff" : "#9cc2e8", fontFamily: "inherit",
                }}
              >
                {ch.name} <span style={{ color: "#666666" }}>({ch.count} lines)</span>
              </button>
            ))}
            {outputKey && outputLines && (
              <pre style={{
                margin: "8px 0 0", padding: 10, background: "#111111", border: "1px solid #2d2d2d", borderRadius: 4,
                fontSize: 11, color: "#bbbbbb", maxHeight: 240, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.5,
              }}>
                {outputLines.length ? outputLines.map((l) => l.text).join("\n") : "(empty)"}
              </pre>
            )}
          </div>
        ) : null}

        {views.length ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Views</div>
            {views.map((v) => {
              const key = v.kind === "tree" ? `t:${v.viewId}` : `wv:${v.viewType}`;
              const label = v.title || v.viewId || v.viewType;
              return (
                <button
                  key={key}
                  onClick={() => openView(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                    background: "none", border: "none", cursor: "pointer", padding: "3px 0", fontSize: 12,
                    color: "#9cc2e8", fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 8, background: "#3a3a3a", color: "#999", textTransform: "uppercase", flexShrink: 0 }}>
                    {v.kind === "tree" ? "Tree" : "Webview"}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                  <span style={{ color: "#666666", fontSize: 10.5, flexShrink: 0 }}>{v.extKey}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const renderDetails = () => {
    if (!selected || !details) {
      return renderHostOverview();
    }
    if (details.loading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#8a8a8a", fontSize: 12 }}>
          Loading details…
        </div>
      );
    }
    if (details.error) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, padding: 16 }}>
          <div style={{ color: "#e8a0a0", fontSize: 12.5, textAlign: "center" }}>{details.error}</div>
          {selected.kind === "remote" && (
            <button style={btn(accent)} onClick={() => openRemote(selected.ext)}>Retry</button>
          )}
        </div>
      );
    }
    if (details.ext && selected.kind === "remote") return renderRemoteDetails();
    if (details.ext && selected.kind === "installed") return renderInstalledDetails();
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "#1e1e1e", color: "#cccccc", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #2d2d2d", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>Extensions</span>
        <div style={{ display: "flex", gap: 2, background: "#252526", borderRadius: 4, padding: 2 }}>
          {[["market", "Marketplace"], ["installed", `Installed (${installed.length})`]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: tab === id ? "#007acc" : "transparent",
                color: "#ffffff",
                border: "none", borderRadius: 3, padding: "3px 12px", fontSize: 12, cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button style={{ ...ghostBtn, marginLeft: "auto" }} onClick={installLocal} title="Install an extension from a .vsix file">
          Install from VSIX…
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div key={notice.key} style={{
          margin: "8px 12px 0", padding: "8px 12px", borderRadius: 4, fontSize: 12, flexShrink: 0,
          background: notice.kind === "ok" ? "#16351c" : "#3d1c1c",
          border: notice.kind === "ok" ? "1px solid #1f5c2b" : "1px solid #6b2d2d",
          color: notice.kind === "ok" ? "#8fd3a1" : "#e8a0a0",
        }}>
          {notice.text}
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* List column */}
        <div style={{ width: "58%", minWidth: 280, borderRight: "1px solid #2d2d2d", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {tab === "market" && (
            <>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #2d2d2d" }}>
                <input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search Open VSX extensions…"
                  style={{
                    width: "100%", boxSizing: "border-box", background: "#252526", color: "#dddddd",
                    border: "1px solid #3a3a3a", borderRadius: 4, padding: "7px 10px", fontSize: 12.5, outline: "none",
                  }}
                />
                {searchError && <div style={{ marginTop: 6, fontSize: 11.5, color: "#e8a0a0" }}>{searchError}</div>}
              </div>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {searching ? (
                  <div style={{ padding: 20, color: "#8a8a8a", fontSize: 12, textAlign: "center" }}>Searching…</div>
                ) : results.length ? (
                  results.map(renderSearchItem)
                ) : query.trim() ? (
                  <div style={{ padding: 20, color: "#666666", fontSize: 12, textAlign: "center" }}>
                    {total === 0 ? "No extensions found." : ""}
                  </div>
                ) : (
                  <div style={{ padding: 20, color: "#666666", fontSize: 12, textAlign: "center" }}>
                    Search the Open VSX registry for extensions — grammars, themes and language support that load directly into the editor.
                  </div>
                )}
              </div>
            </>
          )}
          {tab === "installed" && (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {installed.length ? (
                installed.map(renderInstalledItem)
              ) : (
                <div style={{ padding: 20, color: "#666666", fontSize: 12, textAlign: "center" }}>
                  No extensions installed yet. Search the marketplace or install from a .vsix file.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details column */}
        <div style={{ flex: 1, minWidth: 220, minHeight: 0 }}>{renderDetails()}</div>
      </div>
    </div>
  );
};

export default ExtensionsPanel;
