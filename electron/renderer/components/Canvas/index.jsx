import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";

const CARD_W = 280;
const CARD_H = 200;
const CARD_GAP = 16;
const GROUP_PAD = 16;
const GROUP_HEADER = 34;
const GROUP_GAP = 30;
const NESTED_GAP = 20;
const MAX_COLS = 4;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const DOT_SIZE = 24;

const KIND_META = {
  page:      { label: "Page",      color: "#4ec9b0" },
  component: { label: "Component", color: "#569cd6" },
  view:      { label: "View",      color: "#dcdcaa" },
  widget:    { label: "Widget",    color: "#c586c0" },
  feature:   { label: "Feature",   color: "#ce9178" },
  module:    { label: "Module",    color: "#9cdcfe" },
};

const kindOf = (relPath) => {
  const p = relPath.toLowerCase();
  if (p.includes("pages")) return "page";
  if (p.includes("components")) return "component";
  if (p.includes("views")) return "view";
  if (p.includes("widgets")) return "widget";
  if (p.includes("features")) return "feature";
  return "module";
};

const kindMeta = (relPath) => KIND_META[kindOf(relPath)];

const FW_LABEL = { react: "React", next: "Next.js", vue: "Vue", svelte: "Svelte", solid: "Solid", preact: "Preact", angular: "Angular", unknown: "Unknown" };

const countNested = (node) => node.groups.reduce((acc, g) => acc + g.children.length + countNested(g), 0);

// ── Auto layout engine: folder tree → world-space rects ──────────────────────
function layoutGroup(node, originX, originY, out, parentRel) {
  out.parent.set(node.relPath, parentRel);
  let y = originY + GROUP_HEADER + GROUP_PAD;
  let contentW = 240;
  const cardCount = node.children.length;
  const cols = cardCount ? Math.min(MAX_COLS, Math.max(1, Math.ceil(Math.sqrt(cardCount)))) : 1;
  const rows = cardCount ? Math.ceil(cardCount / cols) : 0;
  const gridW = cols ? cols * CARD_W + (cols - 1) * CARD_GAP : 0;
  contentW = Math.max(contentW, gridW);
  node.children.forEach((c, i) => {
    out.cards.set(c.relPath, {
      x: originX + GROUP_PAD + (i % cols) * (CARD_W + CARD_GAP),
      y: y + Math.floor(i / cols) * (CARD_H + CARD_GAP),
      w: CARD_W,
      h: CARD_H,
      file: c,
      owner: node.relPath,
    });
  });
  if (rows) y += rows * (CARD_H + CARD_GAP) - CARD_GAP;
  for (const g of node.groups) {
    if (!g.children.length && !g.groups.length) continue;
    y += NESTED_GAP;
    const child = layoutGroup(g, originX + GROUP_PAD, y, out, node.relPath);
    y += child.h;
    contentW = Math.max(contentW, child.w);
  }
  const w = contentW + GROUP_PAD * 2;
  const h = y - originY + GROUP_PAD;
  out.groups.set(node.relPath, { x: originX, y: originY, w, h });
  return { w, h };
}

function computeLayout(roots, manual) {
  const out = { cards: new Map(), groups: new Map(), parent: new Map(), total: { w: 0, h: 0 } };
  let y = 0;
  for (const root of roots || []) {
    const { w, h } = layoutGroup(root, 0, y, out, null);
    y += h + GROUP_GAP;
    out.total.w = Math.max(out.total.w, w);
  }
  out.total.h = Math.max(0, y - GROUP_GAP);

  // Shift auto-placed cards by the combined delta of all manual (dragged) ancestor groups
  const deltas = new Map();
  for (const [rel, g] of out.groups) {
    const m = manual.groups?.[rel];
    deltas.set(rel, m ? { dx: m.x - g.x, dy: m.y - g.y } : { dx: 0, dy: 0 });
  }
  for (const [rel, c] of out.cards) {
    const m = manual.cards?.[rel];
    if (m) {
      c.x = m.x ?? c.x; c.y = m.y ?? c.y;
      c.w = m.w ?? CARD_W; c.h = m.h ?? CARD_H;
      continue;
    }
    let node = c.owner, dx = 0, dy = 0;
    while (node) {
      const d = deltas.get(node);
      if (d) { dx += d.dx; dy += d.dy; }
      node = out.parent.get(node);
    }
    c.x += dx; c.y += dy;
  }
  // Manual group rects (dragged / resized) win over auto
  for (const [rel, g] of out.groups) {
    const m = manual.groups?.[rel];
    if (m) {
      g.x = m.x; g.y = m.y;
      if (m.w) g.w = m.w;
      if (m.h) g.h = m.h;
    }
  }
  // Groups hug their cards: resize to contain them, but never move the frame
  // (dragging a child must not drag the parent). Manually placed/resized
  // groups keep full control.
  const bounds = new Map();
  for (const [rel, c] of out.cards) {
    const b = bounds.get(c.owner) || { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    b.minX = Math.min(b.minX, c.x); b.minY = Math.min(b.minY, c.y);
    b.maxX = Math.max(b.maxX, c.x + c.w); b.maxY = Math.max(b.maxY, c.y + c.h);
    bounds.set(c.owner, b);
  }
  for (const [rel, g] of out.groups) {
    const m = manual.groups?.[rel];
    if (m) continue;
    const b = bounds.get(rel);
    if (!b || !isFinite(b.minX)) continue;
    g.w = Math.max(g.w, b.maxX - g.x + GROUP_PAD);
    g.h = Math.max(g.h, b.maxY - g.y + GROUP_PAD);
  }
  return out;
}

// ── Per-card live preview (shadow DOM + transpileJsx) ────────────────────────
class CardErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error) { console.error("Canvas Card Preview Error:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 10, background: "#2a1717", border: "1px solid #732222", borderRadius: 4, color: "#f44747", fontSize: 11, fontFamily: "Consolas, monospace", lineHeight: 1.4, wordBreak: "break-all" }}>
          {this.state.error?.message || String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

const resolvePath = (baseFile, relativePath) => {
  if (!baseFile || !relativePath) return null;
  const parts = baseFile.replace(/\\/g, "/").split("/");
  parts.pop();
  const relParts = relativePath.replace(/\\/g, "/").split("/");
  for (const p of relParts) {
    if (p === "." || p === "") continue;
    if (p === "..") parts.pop();
    else parts.push(p);
  }
  return parts.join("/");
};

function CardPreview({ file, liveSourcesRef, onLive }) {
  const hostRef = useRef(null);
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [comp, setComp] = useState(null);
  const [html, setHtml] = useState(null);
  const [nat, setNat] = useState(null);
  const [fit, setFit] = useState(null);

  const isHtml = /\.html$/i.test(file.name);

  const injectCss = useCallback((cssKey, cssContent) => {
    const host = hostRef.current;
    if (!host || !host.shadowRoot || !cssKey) return;
    const stylesHost = host.__stylesHost;
    if (!stylesHost) return;
    const styleId = `cv-css-${cssKey.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    let el = stylesHost.querySelector(`#${styleId}`);
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      stylesHost.appendChild(el);
    }
    el.textContent = cssContent || "";
  }, []);

  const loadAssociatedCss = useCallback(async (path, source) => {
    const cssImportRegex = /(?:import|require)\s*\(?['"]([^'"]+\.(?:css|scss|less|pcss))['"\)]/gi;
    let match;
    while ((match = cssImportRegex.exec(source)) !== null) {
      const fullCssPath = resolvePath(path, match[1]);
      if (fullCssPath) {
        try {
          const cssContent = await window.electronAPI.readTextFile(fullCssPath);
          if (cssContent !== null) injectCss(fullCssPath, cssContent);
        } catch {}
      }
    }
    const sameNameCss = path.replace(/\.(jsx|tsx|js|ts|vue|svelte)$/i, ".css");
    if (sameNameCss !== path) {
      try {
        const cssContent = await window.electronAPI.readTextFile(sameNameCss);
        if (cssContent !== null) injectCss(sameNameCss, cssContent);
      } catch {}
    }
  }, [injectCss]);

  const load = useCallback(async (sourceOverride) => {
    const host = hostRef.current;
    if (!host || !host.shadowRoot) return;
    setError(null);
    setStatus("loading");
    setComp(null);
    setHtml(null);
    setNat(null);
    let source = sourceOverride;
    if (source == null) source = liveSourcesRef.current.get(file.absPath);
    if (source == null) source = await window.electronAPI.readTextFile(file.absPath);
    if (source === null) {
      setStatus("error");
      setError(`Could not read ${file.name}`);
      return;
    }
    if (isHtml) {
      setHtml(source);
      setStatus("ready");
      return;
    }
    await loadAssociatedCss(file.absPath, source);
    let codeToTranspile = source;
    if (!/export\s+default|function|const|class/i.test(source) && /^\s*</.test(source.trim())) {
      codeToTranspile = `export default function PreviewSnippet() { return (\n${source}\n); }`;
    }
    const res = await window.electronAPI.transpileJsx(codeToTranspile);
    if (!res?.success) {
      setStatus("error");
      setError(res?.error || "Transpilation failed");
      return;
    }
    try {
      const exportsObj = {};
      const moduleObj = { exports: exportsObj };
      const customRequire = (name) => (name === "react" || name === "react-dom") ? React : {};
      const runner = new Function(
        "React", "useState", "useEffect", "useRef", "useCallback", "useMemo", "useReducer", "useContext", "useId",
        "require", "exports", "module",
        `${res.code};\nconst exp = module.exports.default || exports.default || module.exports;\nif (typeof exp === 'function' || (exp && typeof exp === 'object')) return exp;\nreturn (typeof App !== 'undefined' ? App : null) || (typeof Component !== 'undefined' ? Component : null);`
      );
      const evaluated = runner(
        React, React.useState, React.useEffect, React.useRef, React.useCallback, React.useMemo, React.useReducer, React.useContext, React.useId,
        customRequire, exportsObj, moduleObj
      );
      if (!evaluated) {
        setStatus("error");
        setError("No default export or component found");
        return;
      }
      setComp(evaluated);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err?.message || String(err));
    }
  }, [file.absPath, file.name, liveSourcesRef, loadAssociatedCss, isHtml]);

  // Render into the shadow DOM: fit-to-card scaling for components, iframe for HTML
  const renderShadow = useCallback(() => {
    const host = hostRef.current;
    if (!host || !host.shadowRoot) return;
    if (!host.__root) host.__root = ReactDOM.createRoot(host.__mount);
    const scale = nat && fit ? Math.min(1, fit.w / nat.w, fit.h / nat.h) : 1;
    host.__root.render(
      <CardErrorBoundary>
        <div ref={rootRef} style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
          {isHtml ? (
            <iframe
              srcDoc={html || ""}
              sandbox="allow-scripts allow-same-origin"
              style={{ width: "100%", height: "100%", border: 0, background: "#fff", display: "block" }}
            />
          ) : comp ? (
            nat ? (
              <div style={{ width: nat.w * scale, height: nat.h * scale, overflow: "hidden" }}>
                <div style={{ width: nat.w, height: nat.h, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                  {React.isValidElement(comp) ? comp : React.createElement(comp)}
                </div>
              </div>
            ) : (
              <div ref={measureRef} style={{ display: "inline-block", minWidth: "100%", minHeight: "100%" }}>
                {React.isValidElement(comp) ? comp : React.createElement(comp)}
              </div>
            )
          ) : (
            <div style={{ color: "#666", fontSize: 11 }}>…</div>
          )}
        </div>
      </CardErrorBoundary>
    );
  }, [comp, html, nat, fit, isHtml]);

  useEffect(() => { renderShadow(); }, [renderShadow]);

  // Measure natural size of the rendered component (once, at scale 1)
  useEffect(() => {
    if (!comp || isHtml || nat) return;
    const raf = requestAnimationFrame(() => {
      const el = measureRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setNat({ w: Math.max(1, Math.ceil(r.width)), h: Math.max(1, Math.ceil(r.height)) });
    });
    return () => cancelAnimationFrame(raf);
  }, [comp, isHtml, nat, renderShadow]);

  // Track container size so the fit scale follows card resizes
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFit({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setFit({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [renderShadow, isHtml]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;
    const sr = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.minHeight = "100%";
    mount.style.boxSizing = "border-box";
    sr.appendChild(mount);
    const stylesHost = document.createElement("div");
    stylesHost.style.display = "none";
    sr.appendChild(stylesHost);
    host.__mount = mount;
    host.__stylesHost = stylesHost;
    load();
    return () => {
      try { host.__root?.unmount(); } catch {}
      host.__root = null;
    };
  }, [load]);

  useEffect(() => {
    const schedule = (fn) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fn, 300);
    };
    const onSourceChanged = (e) => {
      const { path, code } = e.detail || {};
      if (path !== file.absPath || typeof code !== "string") return;
      liveSourcesRef.current.set(path, code);
      onLive(true);
      schedule(() => load(code));
    };
    window.addEventListener("component:sourceChanged", onSourceChanged);
    const unsub = window.electronAPI.onFsChange(() => {
      if (!liveSourcesRef.current.has(file.absPath)) {
        onLive(true);
        schedule(() => load());
      }
    });
    return () => {
      window.removeEventListener("component:sourceChanged", onSourceChanged);
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [file.absPath, load, liveSourcesRef, onLive]);

  const isError = status === "error" || !!error;
  return (
    <div style={{ width: "100%", height: "100%", background: "#141414", borderRadius: 5, overflow: "hidden", position: "relative" }}>
      <div ref={hostRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 11, pointerEvents: "none" }}>
          Loading preview…
        </div>
      )}
      {isError && (
        <div style={{ position: "absolute", inset: 0, overflow: "auto", padding: 10, background: "#2a1717", color: "#f44747", fontSize: 11, fontFamily: "Consolas, monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Main Canvas panel ────────────────────────────────────────────────────────
const CanvasPanel = ({ nodeId, config }) => {
  const [scan, setScan] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState({ cards: {}, groups: {} });
  const [view, setView] = useState({ x: 60, y: 40, z: 1 });
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  const [query, setQuery] = useState("");
  const [livePaths, setLivePaths] = useState(new Set());

  const viewportRef = useRef(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const manualRef = useRef(manual);
  manualRef.current = manual;
  const liveSourcesRef = useRef(new Map());
  const saveTimerRef = useRef(null);
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const spaceRef = useRef(false);
  const fittedRef = useRef(false);
  const livePathsRef = useRef(livePaths);
  livePathsRef.current = livePaths;

  const rootPath = window.__currentProjectPath || null;

  const setLiveState = useCallback((relPath, on) => {
    setLivePaths((prev) => {
      const next = new Set(prev);
      if (on) next.add(relPath);
      else next.delete(relPath);
      return next;
    });
  }, []);
  const onCardLive = useCallback((relPath) => (on) => setLiveState(relPath, on), [setLiveState]);

  const refreshScan = useCallback(async () => {
    const root = window.__currentProjectPath;
    if (!root) { setScan(null); return; }
    setScanning(true);
    const data = await window.electronAPI.scanCanvas(root);
    if (data) setScan(data);
    setScanning(false);
  }, []);

  const persistLayout = useCallback((data) => {
    if (!window.__currentProjectPath) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const payload = { version: 2, cards: data?.cards || {}, groups: data?.groups || {} };
    saveTimerRef.current = setTimeout(() => {
      window.electronAPI.saveCanvasLayout(window.__currentProjectPath, payload).catch(() => {});
    }, 400);
  }, []);

  useEffect(() => {
    if (!window.__currentProjectPath) return;
    window.electronAPI.loadCanvasLayout(window.__currentProjectPath).then((data) => {
      setManual({ cards: data?.cards || {}, groups: data?.groups || {} });
    }).catch(() => {});
  }, [rootPath]);

  useEffect(() => { refreshScan(); }, [refreshScan]);

  useEffect(() => {
    const onOpen = () => refreshScan();
    const onClose = () => { setScan(null); setManual({ cards: {} }); };
    window.addEventListener("project:opened", onOpen);
    window.addEventListener("project:closed", onClose);
    return () => {
      window.removeEventListener("project:opened", onOpen);
      window.removeEventListener("project:closed", onClose);
    };
  }, [refreshScan]);

  useEffect(() => {
    let timer = null;
    const unsub = window.electronAPI.onFsChange(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(refreshScan, 2000);
    });
    return () => { unsub(); if (timer) clearTimeout(timer); };
  }, [refreshScan]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setVw(el.clientWidth);
      setVh(el.clientHeight);
    });
    ro.observe(el);
    setVw(el.clientWidth);
    setVh(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Flatten the folder tree: only the direct parent folder of previewable files
  // becomes a group (no nested sub-folder frames).
  const flatGroups = useMemo(() => {
    const out = [];
    const walk = (node) => {
      if (node.children.length) out.push(node);
      node.groups.forEach(walk);
    };
    (scan?.roots || []).forEach(walk);
    return out;
  }, [scan]);

  const layout = useMemo(() => computeLayout(flatGroups, manual), [flatGroups, manual]);

  const scanRootsByRel = useMemo(() => {
    const m = new Map();
    const walk = (n) => { m.set(n.relPath, n); n.groups.forEach(walk); };
    (scan?.roots || []).forEach(walk);
    return m;
  }, [scan]);

  // All card/group relPaths inside a folder subtree (used so moving a parent
  // group moves every child — manually placed ones included).
  const collectSubtree = useCallback((rel) => {
    const cards = [], groups = [];
    const walk = (node) => {
      node.children.forEach((c) => cards.push(c.relPath));
      node.groups.forEach((g) => { groups.push(g.relPath); walk(g); });
    };
    const root = scanRootsByRel.get(rel);
    if (root) walk(root);
    return { cards, groups };
  }, [scanRootsByRel]);

  const visibleCards = useMemo(() => {
    const set = new Set();
    const { x, y, z } = view;
    const wx0 = -x / z - 400;
    const wy0 = -y / z - 400;
    const ww = vw / z + 800;
    const wh = vh / z + 800;
    for (const [rel, c] of layout.cards) {
      if (c.x + c.w >= wx0 && c.x <= wx0 + ww && c.y + c.h >= wy0 && c.y <= wy0 + wh) set.add(rel);
    }
    return set;
  }, [view, vw, vh, layout]);

  const visibleGroups = useMemo(() => {
    const set = new Set();
    const { x, y, z } = view;
    const wx0 = -x / z - 200;
    const wy0 = -y / z - 200;
    const ww = vw / z + 400;
    const wh = vh / z + 400;
    for (const [rel, g] of layout.groups) {
      if (g.x + g.w >= wx0 && g.x <= wx0 + ww && g.y + g.h >= wy0 && g.y <= wy0 + wh) set.add(rel);
    }
    return set;
  }, [view, vw, vh, layout]);

  const zoomAt = useCallback((cx, cy, factor) => {
    setView((v) => {
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.z * factor));
      const wx = (cx - v.x) / v.z;
      const wy = (cy - v.y) / v.z;
      return { x: cx - wx * nz, y: cy - wy * nz, z: nz };
    });
  }, []);

  const fitView = useCallback(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of layout.cards.values()) {
      minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.w); maxY = Math.max(maxY, c.y + c.h);
    }
    if (!isFinite(minX)) { setView({ x: 60, y: 40, z: 1 }); return; }
    const pad = 60;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const bw = maxX - minX, bh = maxY - minY;
    const z = Math.min(1.2, Math.max(MIN_ZOOM, Math.min(vw / bw, vh / bh)));
    setView({ x: -minX * z, y: -minY * z, z });
  }, [layout, vw, vh]);

  useEffect(() => {
    if (scan && vw > 0 && vh > 0 && !fittedRef.current) {
      fittedRef.current = true;
      const t = setTimeout(fitView, 60);
      return () => clearTimeout(t);
    }
  }, [scan, vw, vh, fitView]);

  // Native wheel (non-passive so preventDefault works) for pan/zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onNativeWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0016));
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", onNativeWheel);
  }, [zoomAt]);

  // Space key toggles pan mode
  useEffect(() => {
    const down = (e) => { if (e.code === "Space" && !e.repeat && e.target === document.body) { spaceRef.current = true; e.preventDefault(); } };
    const up = (e) => { if (e.code === "Space") spaceRef.current = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const startPan = useCallback((e) => {
    const panAllowed = e.button === 1 || e.button === 2 || (e.button === 0 && (spaceRef.current || e.shiftKey));
    if (!panAllowed) return;
    e.preventDefault();
    panRef.current = { startX: e.clientX, startY: e.clientY, x: viewRef.current.x, y: viewRef.current.y };
    const move = (ev) => {
      const p = panRef.current;
      if (!p) return;
      setView((v) => ({ ...v, x: p.x + (ev.clientX - p.startX), y: p.y + (ev.clientY - p.startY) }));
    };
    const up = () => {
      panRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, []);

  const onCardPointerDown = useCallback((e, rel) => {
    const card = layout.cards.get(rel);
    if (!card) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origX = card.x, origY = card.y;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
      if (!moved) return;
      const dx = (ev.clientX - startX) / viewRef.current.z;
      const dy = (ev.clientY - startY) / viewRef.current.z;
      setManual((m) => ({ ...m, cards: { ...m.cards, [rel]: { ...(m.cards[rel] || {}), x: Math.round(origX + dx), y: Math.round(origY + dy) } } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (moved) {
        persistLayout(manualRef.current);
      } else {
        const f = layout.cards.get(rel);
        if (f) window.dispatchEvent(new CustomEvent("open-file-in-editor", { detail: { filePath: f.file.absPath } }));
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [layout, persistLayout]);

  const onCardResizeStart = useCallback((e, rel) => {
    const card = layout.cards.get(rel);
    if (!card) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origW = card.w, origH = card.h;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 2) moved = true;
      if (!moved) return;
      const nw = Math.round(origW + (ev.clientX - startX) / viewRef.current.z);
      const nh = Math.round(origH + (ev.clientY - startY) / viewRef.current.z);
      setManual((m) => ({ ...m, cards: { ...m.cards, [rel]: { ...(m.cards[rel] || {}), w: Math.min(1200, Math.max(180, nw)), h: Math.min(900, Math.max(140, nh)) } } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (moved) persistLayout(manualRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [layout, persistLayout]);

  const onGroupPointerDown = useCallback((e, rel) => {
    e.preventDefault();
    e.stopPropagation();
    const g = layout.groups.get(rel);
    if (!g) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = g.x, origY = g.y;
    const { cards: subCards, groups: subGroups } = collectSubtree(rel);
    const snapManualCards = {};
    const snapManualGroups = {};
    for (const c of subCards) {
      const m = manualRef.current.cards[c];
      if (m) snapManualCards[c] = { x: m.x, y: m.y };
    }
    for (const gc of subGroups) {
      const m = manualRef.current.groups[gc];
      if (m) snapManualGroups[gc] = { x: m.x, y: m.y };
    }
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
      if (!moved) return;
      const dx = Math.round((ev.clientX - startX) / viewRef.current.z);
      const dy = Math.round((ev.clientY - startY) / viewRef.current.z);
      setManual((m2) => {
        const next = { cards: { ...m2.cards }, groups: { ...m2.groups } };
        next.groups[rel] = { ...(m2.groups[rel] || {}), x: origX + dx, y: origY + dy };
        for (const [c, s] of Object.entries(snapManualCards)) {
          next.cards[c] = { ...(m2.cards[c] || {}), x: s.x + dx, y: s.y + dy };
        }
        for (const [gc, s] of Object.entries(snapManualGroups)) {
          next.groups[gc] = { ...(m2.groups[gc] || {}), x: s.x + dx, y: s.y + dy };
        }
        return next;
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (moved) persistLayout(manualRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [layout, persistLayout, collectSubtree]);

  const onGroupResizeStart = useCallback((e, rel) => {
    e.preventDefault();
    e.stopPropagation();
    const g = layout.groups.get(rel);
    if (!g) return;
    const startX = e.clientX, startY = e.clientY;
    const origW = g.w, origH = g.h;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 2) moved = true;
      if (!moved) return;
      const nw = Math.round(origW + (ev.clientX - startX) / viewRef.current.z);
      const nh = Math.round(origH + (ev.clientY - startY) / viewRef.current.z);
      setManual((m) => ({ ...m, groups: { ...m.groups, [rel]: { ...(m.groups[rel] || {}), w: Math.min(4000, Math.max(220, nw)), h: Math.min(4000, Math.max(90, nh)) } } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (moved) persistLayout(manualRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [layout, persistLayout]);

  const resetLayout = useCallback(() => {
    setManual({ cards: {}, groups: {} });
    if (window.__currentProjectPath) {
      window.electronAPI.saveCanvasLayout(window.__currentProjectPath, { version: 2, cards: {}, groups: {} }).catch(() => {});
    }
  }, []);

  const q = query.trim().toLowerCase();
  const rootName = scan?.root ? scan.root.replace(/[\\/]+$/, "").split(/[\\/]/).pop() : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "#181818", position: "relative", overflow: "hidden" }}>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "#252526", borderBottom: "1px solid #2d2d2d", fontSize: 12, color: "#ccc", flexShrink: 0 }}>
        <span style={{ fontWeight: 600, color: "#4ec9b0", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="#4ec9b0" strokeWidth="1.2" />
            <circle cx="5.5" cy="5.5" r="1.2" fill="#4ec9b0" />
            <circle cx="10.5" cy="5.5" r="1.2" fill="#4ec9b0" />
            <circle cx="5.5" cy="10.5" r="1.2" fill="#4ec9b0" />
            <circle cx="10.5" cy="10.5" r="1.2" fill="#4ec9b0" />
          </svg>
          Canvas
        </span>
        {rootName && <span style={{ color: "#d0d0d0", flexShrink: 0 }}>{rootName}</span>}
        {scan?.framework && (
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: "rgba(78,201,176,.12)", color: "#4ec9b0", border: "1px solid #4ec9b033", flexShrink: 0 }}>
            {FW_LABEL[scan.framework] || scan.framework}
          </span>
        )}
        {scan && (
          <span style={{ color: "#888", fontSize: 11, flexShrink: 0 }}>
            {scan.count} item{scan.count === 1 ? "" : "s"} · {layout.groups.size} group{layout.groups.size === 1 ? "" : "s"}
          </span>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files…"
          style={{ flex: 1, minWidth: 120, maxWidth: 240, background: "#1e1e1e", color: "#d0d0d0", border: "1px solid #3c3c3c", borderRadius: 3, fontSize: 11, padding: "2px 8px", outline: "none" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <button onClick={() => zoomAt(vw / 2, vh / 2, 0.8)} title="Zoom out" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", width: 22, height: 20, fontSize: 12, lineHeight: 1 }}>−</button>
          <span style={{ fontSize: 11, color: "#aaa", minWidth: 38, textAlign: "center" }}>{Math.round(view.z * 100)}%</span>
          <button onClick={() => zoomAt(vw / 2, vh / 2, 1.25)} title="Zoom in" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", width: 22, height: 20, fontSize: 12, lineHeight: 1 }}>+</button>
          <button onClick={fitView} title="Fit all" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", padding: "1px 8px", fontSize: 11 }}>Fit</button>
          <button onClick={() => setView({ x: 60, y: 40, z: 1 })} title="Reset zoom" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", padding: "1px 8px", fontSize: 11 }}>100%</button>
          <button onClick={resetLayout} title="Reset card positions to auto layout" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", padding: "1px 8px", fontSize: 11 }}>Reset Layout</button>
          <button onClick={refreshScan} title="Rescan project" style={{ background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 3, color: "#ccc", cursor: "pointer", padding: "1px 8px", fontSize: 11 }}>⟳ Scan</button>
        </div>
      </div>

      {/* ── Canvas viewport ─────────────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        onPointerDown={startPan}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          flex: 1, overflow: "hidden", position: "relative", cursor: "default", userSelect: "none", touchAction: "none",
          background: "#181818",
          backgroundImage: "radial-gradient(circle, #232323 1px, transparent 1.2px)",
          backgroundSize: `${DOT_SIZE * view.z}px ${DOT_SIZE * view.z}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        <div
          style={{
            position: "absolute", left: 0, top: 0, transformOrigin: "0 0",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
            width: 0, height: 0,
          }}
        >
          {/* Group frames */}
          {[...layout.groups.entries()].map(([rel, g]) => {
            if (!visibleGroups.has(rel)) return null;
            const node = scanRootsByRel.get(rel);
            if (!node) return null;
            const k = kindMeta(rel);
            return (
              <div key={rel} style={{ position: "absolute", left: g.x, top: g.y, width: g.w, height: g.h, border: "1px dashed #333", borderRadius: 10, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }}>
                <div
                  onPointerDown={(e) => onGroupPointerDown(e, rel)}
                  title={`${node.name} — drag to move`}
                  style={{ display: "flex", alignItems: "center", gap: 6, height: GROUP_HEADER, padding: "0 12px", borderBottom: "1px dashed #2b2b2b", color: "#bdbdbd", fontSize: 12, fontWeight: 600, cursor: "grab", pointerEvents: "auto", userSelect: "none" }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.5V12.5H14V4.5H9L7.5 3H2Z" fill="#333" stroke={k.color} strokeWidth="1" />
                  </svg>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
                  <span style={{ color: "#666", fontSize: 10, fontWeight: 400 }}>{node.children.length + countNested(node)}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: k.color, fontWeight: 400, flexShrink: 0 }}>{k.label}</span>
                </div>
                <div
                  onPointerDown={(e) => onGroupResizeStart(e, rel)}
                  title="Drag to resize group"
                  style={{ position: "absolute", right: 0, bottom: 0, width: 18, height: 18, cursor: "nwse-resize", pointerEvents: "auto", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 3 }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M12.5 3.5L3.5 12.5M12.5 8L8 12.5" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}

          {/* Cards */}
          {[...layout.cards.entries()].map(([rel, c]) => {
            if (!visibleCards.has(rel)) return null;
            const dim = q && !rel.toLowerCase().includes(q);
            const live = livePathsRef.current.has(rel);
            const k = kindMeta(rel);
            return (
              <div
                key={rel}
                onPointerDown={(e) => onCardPointerDown(e, rel)}
                title={rel}
                style={{
                  position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h,
                  background: "#1f1f1f", border: `1px solid ${live ? "#4ec9b0" : "#333"}`, borderRadius: 8,
                  boxShadow: "0 4px 14px rgba(0,0,0,.4)", cursor: "pointer",
                  opacity: dim ? 0.22 : 1, display: "flex", flexDirection: "column", overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 8px", background: "#252526", borderBottom: "1px solid #2d2d2d", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke={k.color} strokeWidth="1.2" />
                    <line x1="5" y1="4.5" x2="11" y2="4.5" stroke="#555" strokeWidth="1" />
                    <line x1="5" y1="7" x2="11" y2="7" stroke="#555" strokeWidth="1" />
                    <line x1="5" y1="9.5" x2="8.5" y2="9.5" stroke="#555" strokeWidth="1" />
                  </svg>
                  <span style={{ fontSize: 11.5, color: "#e8e8e8", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.file.name}</span>
                  {live && <span title="Live preview (auto-updating)" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ec9b0", flexShrink: 0, boxShadow: "0 0 6px #4ec9b0" }} />}
                  <span style={{ marginLeft: "auto", fontSize: 9.5, color: k.color, background: `${k.color}1a`, border: `1px solid ${k.color}33`, borderRadius: 8, padding: "0 6px", flexShrink: 0 }}>{k.label}</span>
                </div>
                <div style={{ flex: 1, minHeight: 0, padding: 6 }}>
                  <CardPreview file={c.file} liveSourcesRef={liveSourcesRef} onLive={onCardLive(rel)} />
                </div>
                <div
                  onPointerDown={(e) => onCardResizeStart(e, rel)}
                  title="Drag to resize card"
                  style={{ position: "absolute", right: 0, bottom: 0, width: 20, height: 20, cursor: "nwse-resize", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 4 }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M12.5 3.5L3.5 12.5M12.5 8L8 12.5" stroke="#777" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty states */}
        {!rootPath && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#666", fontSize: 13, background: "rgba(24,24,24,.85)" }}>
            <svg width="46" height="46" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="#3c3c3c" strokeWidth="1.2" />
              <circle cx="5.5" cy="5.5" r="1.2" fill="#3c3c3c" />
              <circle cx="10.5" cy="5.5" r="1.2" fill="#3c3c3c" />
              <circle cx="5.5" cy="10.5" r="1.2" fill="#3c3c3c" />
              <circle cx="10.5" cy="10.5" r="1.2" fill="#3c3c3c" />
            </svg>
            <span>No project open</span>
            <button
              onClick={() => window.electronAPI.openFolder()}
              style={{ background: "#007acc", border: "none", color: "#fff", borderRadius: 4, padding: "6px 16px", fontSize: 12, cursor: "pointer" }}
            >
              Open Project
            </button>
            <span style={{ fontSize: 11, color: "#555" }}>The Canvas maps every page &amp; component of your project</span>
          </div>
        )}
        {rootPath && !scanning && scan && scan.roots.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 13 }}>
            No previewable files found. Looked in: pages/, components/, views/, widgets/, features/, ui/ (src/ first).
          </div>
        )}
        {scanning && (
          <div style={{ position: "absolute", top: 10, right: 10, color: "#888", fontSize: 11, background: "#1e1e1e", border: "1px solid #333", borderRadius: 3, padding: "3px 8px" }}>
            Scanning…
          </div>
        )}
      </div>

      {/* ── Hint bar ───────────────────────────────────────────────────────── */}
      <div style={{ padding: "2px 10px", background: "#1c1c1c", borderTop: "1px solid #2a2a2a", color: "#666", fontSize: 10.5, flexShrink: 0 }}>
        Scroll: pan · Ctrl+Scroll: zoom · Middle-drag/Shift+drag: pan · Drag card/group header: move · Drag corner handle: resize · Click card: open in editor
      </div>
    </div>
  );
};

export default CanvasPanel;