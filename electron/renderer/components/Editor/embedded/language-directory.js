// Provider directory — tracks which real language services are available for
// which languages, sourced from the two live provider channels:
//
//   1. LSP servers        (main-process LSP manager, "serverStatus" events)
//   2. Extension host     (real VS Code extensions, "provider" register events)
//
// The embedded language router queries this directory at dispatch time to
// decide which provider(s) to call for an embedded region's language (e.g. a
// `<style>` block wants the css/scss/less providers, a `<script>` block wants
// the javascript/typescript providers). Providers are never "matched by regex
// collection" here — this is a live capability registry driven by actual
// provider registrations.

const lspServers = new Map();   // languageId -> { extKey, capabilities }
const extProviders = new Map(); // providerId -> { kind, languageId | null }
let unsubLsp = null;
let unsubExt = null;

export const initLanguageDirectory = () => {
  if (unsubLsp || !window?.electronAPI) return;
  unsubLsp = window.electronAPI.onLspEvent(handleLspEvent);
  unsubExt = window.electronAPI.onExtEvent(handleExtEvent);
};

export const disposeLanguageDirectory = () => {
  unsubLsp?.();
  unsubLsp = null;
  unsubExt?.();
  unsubExt = null;
  lspServers.clear();
  extProviders.clear();
};

// ── Event ingestion ───────────────────────────────────────────────────────────
const handleLspEvent = (ev) => {
  if (!ev || ev.type !== "serverStatus") return;
  if (ev.running) {
    for (const lang of ev.languages || []) {
      lspServers.set(lang, { extKey: ev.extKey, capabilities: ev.capabilities || {} });
    }
  } else {
    for (const lang of ev.languages || []) {
      const cur = lspServers.get(lang);
      if (cur && cur.extKey === ev.extKey) lspServers.delete(lang);
    }
  }
};

const langOfSelector = (sel) => {
  if (!sel) return null;
  if (typeof sel === "string") return sel;
  if (Array.isArray(sel)) {
    for (const s of sel) {
      const l = langOfSelector(s);
      if (l) return l;
    }
    return null;
  }
  return sel.language || null;
};

const handleExtEvent = (ev) => {
  if (!ev || ev.type !== "provider") return;
  if (ev.action === "register") {
    if (extProviders.has(ev.id)) return;
    extProviders.set(ev.id, { kind: ev.kind, languageId: langOfSelector(ev.selector) });
  } else if (ev.action === "dispose") {
    extProviders.delete(ev.id);
  }
};

// ── Queries ───────────────────────────────────────────────────────────────────
// Extension-host provider ids registered for a language + feature kind.
export const getExtProviderIds = (languageId, kind) => {
  const out = [];
  for (const [id, rec] of extProviders) {
    if (rec.kind === kind && rec.languageId === languageId) out.push(id);
  }
  return out;
};

// Any extension-host provider ids for the language (any kind) — used by the
// router to skip work when a region has no real providers.
export const hasExtProvidersFor = (languageId) => {
  for (const [, rec] of extProviders) if (rec.languageId === languageId) return true;
  return false;
};

// LSP capabilities for a language (server capabilities from initialize), or
// null when no server claims the language.
export const getLspCaps = (languageId) => {
  const s = lspServers.get(languageId);
  return s ? s.capabilities : null;
};

export const hasLspServerFor = (languageId) => lspServers.has(languageId);

// Debug/introspection: snapshot of the whole directory.
export const snapshotDirectory = () => ({
  lsp: Object.fromEntries(lspServers),
  ext: Object.fromEntries(extProviders),
});
