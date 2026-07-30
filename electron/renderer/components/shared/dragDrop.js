const DRAG_PATHS_KEY = "__ppooDragPaths";
const DRAG_CLEANUP_KEY = "__ppooDragCleanupTimer";

const getWindowObject = () => (typeof window !== "undefined" ? window : null);

const clearCleanupTimer = () => {
  const win = getWindowObject();
  if (!win?.[DRAG_CLEANUP_KEY]) return;
  clearTimeout(win[DRAG_CLEANUP_KEY]);
  win[DRAG_CLEANUP_KEY] = null;
};

const normalizePath = (filePath) => {
  if (!filePath || typeof filePath !== "string") return null;
  return filePath.replace(/\//g, "\\");
};

const parseJsonPaths = (value) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    const paths = parsed.map(normalizePath).filter(Boolean);
    return paths.length ? [...new Set(paths)] : null;
  } catch {
    return null;
  }
};

const fileUrlToPath = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (!/^file:/i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "file:") return null;
    let pathname = decodeURIComponent(url.pathname || "");
    if (/^\/[A-Za-z]:/.test(pathname)) pathname = pathname.slice(1);
    if (url.hostname) pathname = `\\\\${url.hostname}${pathname}`;
    return normalizePath(pathname);
  } catch {
    return null;
  }
};

export const setDraggedPaths = (paths) => {
  const win = getWindowObject();
  if (!win) return null;
  clearCleanupTimer();
  const next = Array.isArray(paths)
    ? [...new Set(paths.map(normalizePath).filter(Boolean))]
    : [];
  win[DRAG_PATHS_KEY] = next.length ? next : null;
  return win[DRAG_PATHS_KEY];
};

export const peekDraggedPaths = () => {
  const win = getWindowObject();
  if (!win) return null;
  const paths = win[DRAG_PATHS_KEY];
  return Array.isArray(paths) && paths.length ? [...paths] : null;
};

export const consumeDraggedPaths = () => {
  const win = getWindowObject();
  if (!win) return null;
  const paths = peekDraggedPaths();
  clearCleanupTimer();
  win[DRAG_PATHS_KEY] = null;
  return paths;
};

export const scheduleDraggedPathsCleanup = (delay = 150) => {
  const win = getWindowObject();
  if (!win) return;
  clearCleanupTimer();
  win[DRAG_CLEANUP_KEY] = setTimeout(() => {
    win[DRAG_PATHS_KEY] = null;
    win[DRAG_CLEANUP_KEY] = null;
  }, delay);
};

export const resolveInternalDraggedPaths = (event, options = {}) => {
  const { consumeGlobal = false, includeUriList = false } = options;
  const dt = event?.dataTransfer;
  if (!dt) return null;

  const customPaths = parseJsonPaths(dt.getData("application/ppoo-paths"));
  if (customPaths?.length) return customPaths;

  if (includeUriList) {
    const uriList = dt.getData("text/uri-list");
    if (uriList) {
      const uriPaths = uriList
        .split(/\r?\n/)
        .map(fileUrlToPath)
        .filter(Boolean);
      if (uriPaths.length) return [...new Set(uriPaths)];
    }
  }

  return consumeGlobal ? consumeDraggedPaths() : peekDraggedPaths();
};

export const hasAnyDraggedPayload = (event) => {
  const types = Array.from(event?.dataTransfer?.types || []);
  return (
    types.includes("Files") ||
    types.includes("application/ppoo-paths") ||
    types.includes("text/uri-list") ||
    !!peekDraggedPaths()?.length
  );
};
