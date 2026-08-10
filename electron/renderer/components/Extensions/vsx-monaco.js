// Runtime activation of installed VS Code extensions inside Monaco.
//
// The editor's Monaco services (textmate grammars, language configuration,
// snippets, themes) are driven by the extension host from
// @codingame/monaco-vscode-api. Extensions installed via the Open VSX
// marketplace are registered at runtime with `registerExtension(manifest,
// undefined, { system: false })` plus one `registerFileUrl(...)` per
// contribution file, mirroring how the bundled default-extension packages do
// it at build time.
//
// Security note: the renderer has no fs access — file contents come from the
// main process as base64 over IPC and are converted into blob: URLs here.
import { registerExtension } from "@codingame/monaco-vscode-api/extensions";

const registry = new Map(); // entry.dir -> { registerFileUrl, whenReady, dispose }
let running = false;

function base64ToBlobUrl(base64, mime) {
  try {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime || "text/plain" }));
  } catch {
    return null;
  }
}

async function registerEntry(entry) {
  if (!entry || !entry.enabled) return;
  if (registry.has(entry.dir)) return; // already registered
  const manifest = entry.manifest;
  if (!manifest || !Array.isArray(entry.filesMap) || !entry.filesMap.length) return;

  const files = [];
  for (const f of entry.filesMap) {
    try {
      const r = await window.electronAPI.vsxReadExtFile(entry.id, f.relPath);
      if (!r || !r.success || !r.base64) continue;
      const url = base64ToBlobUrl(r.base64, f.mime);
      if (!url) continue;
      files.push({ relPath: f.relPath, url, mime: f.mime, size: r.size ?? f.size });
    } catch { /* skip unreadable file */ }
  }
  if (!files.length) return;

  try {
    const result = registerExtension(manifest, undefined, { system: false });
    for (const f of files) {
      result.registerFileUrl(f.relPath, f.url, { mimeType: f.mime, size: f.size });
    }
    registry.set(entry.dir, result);
    if (result.whenReady && typeof result.whenReady.catch === "function") {
      result.whenReady.catch(() => {});
    }
  } catch (err) {
    console.error("[vsx] registerExtension failed:", err);
  }
}

async function activateVsx() {
  if (running) return;
  running = true;
  try {
    let list = [];
    try { list = await window.electronAPI.vsxListInstalled(); } catch {}
    const enabled = (Array.isArray(list) ? list : []).filter((e) => e && e.enabled && e.dir);
    const dirs = new Set(enabled.map((e) => e.dir));
    for (const [dir, result] of registry) {
      if (!dirs.has(dir)) {
        try { if (typeof result.dispose === "function") result.dispose(); } catch {}
        registry.delete(dir);
      }
    }
    for (const e of enabled) await registerEntry(e);
  } catch (err) {
    console.error("[vsx] activation failed:", err);
  } finally {
    running = false;
  }
}

window.addEventListener("vsx:changed", activateVsx);
window.addEventListener("vsx:activate", activateVsx);

export { activateVsx };
