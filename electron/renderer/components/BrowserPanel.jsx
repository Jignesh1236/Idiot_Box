import React, { useState, useRef, useCallback, useEffect } from "react";
import { Actions } from "flexlayout-react";

const LOCK_ICON = "M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 6V5a2 2 0 1 1 4 0v2H6z";
const UNLOCK_ICON = "M8 1a4 4 0 0 1 4 4v1h-1V5a3 3 0 0 0-5.7-1.37l-.78-.62A4 4 0 0 1 8 1zm-5.65.09l12 14-.7.6L1.65 1.7zM6 7.49l-1.82.01a1 1 0 0 0-.18 0v3.85L2.35 9.7l-.7.6L4 13.2V14a1 1 0 0 0 1 1h6.15l-1-1H5v-4.5l1.85.01zm4.56-.57A1 1 0 0 1 12 7.5V8h1a1 1 0 0 1 1 1v3.15l-1-1V9h-1.44z";
const LOCAL_ICON = "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-1 12.93A6 6 0 0 1 2 8c0-.33.03-.66.07-1H4v1h2v1H5v1h1v2l1 1zm5.1-3.83A4.9 4.9 0 0 0 13 8c0-2.5-1.83-4.55-4.2-4.96L9 4v1H7V4h-.44l3.55 5.1zm-9.4.14A5 5 0 0 1 2 8c0 1.72.87 3.23 2.2 4.14l.83-1.04z";
const PUZZLE_ICON = "M12.5 2A2.5 2.5 0 0 0 10 4.5c0 .28.05.55.14.8L8.8 6.65a2.77 2.77 0 0 0-.8-.15H6.5v1.5h1.5c.77 0 1.5.28 2.07.86l.79.79-.79.79a2.78 2.78 0 0 0-.85 2.01v1.5h1.5v-1.5c0-.28.05-.55.14-.8l1.35-1.35c.24.09.51.14.79.14a2.5 2.5 0 0 0 0-5zM3 5.5A1.5 1.5 0 0 1 4.5 4H6V2H4.5a3.5 3.5 0 0 0-3.5 3.5V7h2V5.5zM1 8v4.5A3.5 3.5 0 0 0 4.5 16H7v-2H4.5A1.5 1.5 0 0 1 3 12.5V8H1z";
const PLUS_ICON = "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm1 8H7v2h1V9h2V8H8V6H7v2H5v1h2v2h1V9z";

let extIdCounter = 1;
const newExtId = () => "ext_" + Date.now() + "_" + (extIdCounter++);

const BrowserPanel = (props) => {
  const { nodeId, config } = props || {};
  const initialUrl = config?.url || "https://www.google.com";
  const [url, setUrl] = useState(initialUrl);
  const [inputValue, setInputValue] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const [popupStyle, setPopupStyle] = useState({});
  const [extOpen, setExtOpen] = useState(false);
  const [extAddOpen, setExtAddOpen] = useState(false);
  const [extensions, setExtensions] = useState([]);
  const [newExtName, setNewExtName] = useState("");
  const [newExtType, setNewExtType] = useState("css");
  const [newExtCode, setNewExtCode] = useState("");
  const webviewRef = useRef(null);
  const attachedRef = useRef(false);
  const lockRef = useRef(null);
  const extLoadedRef = useRef(false);

  // Load extensions on mount
  useEffect(() => {
    window.electronAPI.readExtensions().then((ex) => { if (Array.isArray(ex)) setExtensions(ex); });
  }, []);

  // Persist extensions when they change
  const saveExtensions = useCallback((ex) => {
    setExtensions(ex);
    window.electronAPI.writeExtensions(ex);
  }, []);

  let hostname = "";
  let protocol = "";
  try { const u = new URL(url); hostname = u.hostname; protocol = u.protocol; } catch {}

  const isLocal = !hostname || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname.startsWith("192.168.") || hostname.startsWith("10.");
  const isHttps = protocol === "https:";

  const iconPath = isLocal ? LOCAL_ICON : (isHttps ? LOCK_ICON : UNLOCK_ICON);
  const iconColor = isLocal ? "#888" : (isHttps ? "#4ec9b0" : "#e6a23c");

  const goToUrl = useCallback((u) => {
    let fixed = u.trim();
    if (!fixed) return;
    if (/^https?:\/\//i.test(fixed)) {
    } else if (/^[^\s]+\.[^\s]+/.test(fixed) || fixed.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(fixed)) {
      fixed = "https://" + fixed;
    } else {
      fixed = "https://www.google.com/search?q=" + encodeURIComponent(fixed);
    }
    setUrl(fixed);
    setInputValue(fixed);
    setLockOpen(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") goToUrl(inputValue);
  }, [inputValue, goToUrl]);

  // Inject enabled extensions into webview
  const injectExtensions = useCallback((wv) => {
    const currentUrl = wv.getURL();
    const enabled = extensions.filter((ex) => ex.enabled && ex.code.trim());
    for (const ex of enabled) {
      try {
        if (ex.type === "css") wv.insertCSS(ex.code);
        else wv.executeJavaScript(ex.code);
      } catch {}
    }
  }, [extensions]);

  const attachListeners = useCallback((wv) => {
    if (attachedRef.current) return;
    attachedRef.current = true;
    const onStart = () => setIsLoading(true);
    const onStop = () => setIsLoading(false);
    const onNavigate = () => {
      setInputValue(wv.getURL()); setUrl(wv.getURL());
      try { setCanGoBack(wv.canGoBack()); setCanGoForward(wv.canGoForward()); } catch {}
    };
    const onLoaded = () => injectExtensions(wv);
    const onTitle = (e) => {
      const m = window.__flexModel?.current;
      if (m) {
        const tabNode = m.getNodeById(nodeId);
        if (tabNode) {
          const cfg = { ...(tabNode.getConfig() || {}), title: e.title };
          m.doAction(Actions.updateNodeAttributes(nodeId, { config: cfg, name: e.title }));
        }
      }
    };
    const onFavicon = (e) => {
      const favicons = e.favicons;
      if (favicons && favicons.length > 0) {
        const m = window.__flexModel?.current;
        if (m) {
          const tabNode = m.getNodeById(nodeId);
          if (tabNode) {
            const cfg = { ...(tabNode.getConfig() || {}), favicon: favicons[0] };
            m.doAction(Actions.updateNodeAttributes(nodeId, { config: cfg }));
          }
        }
      }
    };
    wv.addEventListener("did-start-loading", onStart);
    wv.addEventListener("did-stop-loading", onStop);
    wv.addEventListener("did-navigate", onNavigate);
    wv.addEventListener("did-navigate-in-page", onNavigate);
    wv.addEventListener("did-finish-load", onLoaded);
    wv.addEventListener("page-title-updated", onTitle);
    wv.addEventListener("page-favicon-updated", onFavicon);
    setIsLoading(false);
  }, [injectExtensions, nodeId]);

  const webviewRefCb = useCallback((el) => {
    if (el) { webviewRef.current = el; attachListeners(el); }
  }, [attachListeners]);

  const handleLockClick = useCallback((e) => {
    e.stopPropagation();
    const next = !lockOpen;
    setLockOpen(next);
    if (next && lockRef.current) {
      const r = lockRef.current.getBoundingClientRect();
      setPopupStyle({ left: Math.max(8, r.left - 10), top: r.bottom + 6 });
    }
  }, [lockOpen]);

  const handleExtToggle = useCallback((id) => {
    saveExtensions(extensions.map((ex) => ex.id === id ? { ...ex, enabled: !ex.enabled } : ex));
  }, [extensions, saveExtensions]);

  const handleExtDelete = useCallback((id) => {
    saveExtensions(extensions.filter((ex) => ex.id !== id));
  }, [extensions, saveExtensions]);

  const handleExtAdd = useCallback(() => {
    const name = newExtName.trim();
    const code = newExtCode.trim();
    if (!name || !code) return;
    saveExtensions([...extensions, {
      id: newExtId(), name, type: newExtType, code,
      enabled: true, addedAt: Date.now(),
    }]);
    setNewExtName(""); setNewExtCode(""); setNewExtType("css");
    setExtAddOpen(false);
  }, [newExtName, newExtType, newExtCode, extensions, saveExtensions]);

  return (
    <div className="browser">
      {!barHidden && (
        <div className="browser__bar">
          <button className="browser__btn" disabled={!canGoBack} onClick={() => webviewRef.current?.goBack()} title="Back">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <button className="browser__btn" disabled={!canGoForward} onClick={() => webviewRef.current?.goForward()} title="Forward">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4"/></svg>
          </button>
          <button className="browser__btn" onClick={() => webviewRef.current?.reload()} title="Refresh">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4M9 1l3 3-3 3M7 15l-3-3 3-3"/>
            </svg>
          </button>
          <div className={`browser__url-wrap${focused ? " browser__url-wrap--focused" : ""}`}>
            {isLoading && <div className="browser__spinner"/>}
            <svg className="browser__lock" ref={lockRef} width="14" height="14" viewBox="0 0 16 16" fill="currentColor"
              onClick={handleLockClick} style={{ color: iconColor }}>
              <path d={iconPath}/>
            </svg>
            <input className="browser__url"
              value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown} spellCheck={false}
              onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); setLockOpen(false); }}
            />
          </div>
          <button className="browser__btn" onClick={() => { setExtOpen((o) => !o); setLockOpen(false); }} title="Extensions"
            style={{ color: extensions.some((e) => e.enabled) ? "#4ec9b0" : "#999" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d={PUZZLE_ICON}/></svg>
          </button>
          <button className="browser__btn" onClick={() => setBarHidden(true)} title="Hide toolbar">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 10l5-5 5 5"/></svg>
          </button>
        </div>
      )}

      {barHidden && (
        <button className="browser__show-btn" onClick={() => setBarHidden(false)} title="Show toolbar">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 6l5 5 5-5"/></svg>
        </button>
      )}

      {lockOpen && (
        <>
          <div className="browser__lock-overlay" onClick={() => setLockOpen(false)} />
          <div className="browser__lock-popup" style={popupStyle} onClick={(e) => e.stopPropagation()}>
            <div className="browser__lock-popup-item">
              <span className="browser__lock-popup-label">Connection</span>
              <span className="browser__lock-popup-value" style={{ color: iconColor }}>
                {isLocal ? "Local" : (isHttps ? "Secure" : "Not secure")} ({isLocal ? hostname : (isHttps ? "HTTPS" : "HTTP")})
              </span>
            </div>
            <div className="browser__lock-popup-item">
              <span className="browser__lock-popup-label">URL</span>
              <span className="browser__lock-popup-value" style={{ wordBreak: "break-all" }}>{url}</span>
            </div>
            {hostname && (
              <div className="browser__lock-popup-item">
                <span className="browser__lock-popup-label">Domain</span>
                <span className="browser__lock-popup-value">{hostname}</span>
              </div>
            )}
          </div>
        </>
      )}

      {extOpen && (
        <>
          <div className="browser__lock-overlay" onClick={() => { setExtOpen(false); setExtAddOpen(false); }} />
          <div className="browser__ext-popup">
            <div className="browser__ext-header">
              <span className="browser__ext-title">Extensions</span>
              <button className="browser__ext-add-btn" onClick={() => setExtAddOpen(true)} title="Add extension">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm1 8H7v2h1V9h2V8H8V6H7v2H5v1h2v2h1V9z"/></svg>
                Add
              </button>
            </div>

            {extAddOpen && (
              <div className="browser__ext-add-form">
                <input className="browser__ext-input" placeholder="Extension name" value={newExtName}
                  onChange={(e) => setNewExtName(e.target.value)} spellCheck={false} />
                <select className="browser__ext-select" value={newExtType} onChange={(e) => setNewExtType(e.target.value)}>
                  <option value="css">CSS</option>
                  <option value="js">JavaScript</option>
                </select>
                <textarea className="browser__ext-textarea" placeholder={newExtType === "css" ? "body { background: #000; }" : "console.log('hello');"}
                  value={newExtCode} onChange={(e) => setNewExtCode(e.target.value)} spellCheck={false} rows={3} />
                <div className="browser__ext-add-actions">
                  <button className="browser__ext-btn browser__ext-btn--primary" onClick={handleExtAdd}>Add</button>
                  <button className="browser__ext-btn" onClick={() => setExtAddOpen(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="browser__ext-list">
              {extensions.length === 0 && (
                <div className="browser__ext-empty">No extensions added yet</div>
              )}
              {extensions.map((ex) => (
                <div key={ex.id} className="browser__ext-item">
                  <label className="browser__ext-toggle">
                    <input type="checkbox" checked={ex.enabled} onChange={() => handleExtToggle(ex.id)} />
                    <span className="browser__ext-toggle-slider" />
                  </label>
                  <div className="browser__ext-info">
                    <div className="browser__ext-name">{ex.name}</div>
                    <div className="browser__ext-type">{ex.type.toUpperCase()}</div>
                  </div>
                  <button className="browser__ext-del" onClick={() => handleExtDelete(ex.id)} title="Delete extension">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M4 4L12 12M12 4L4 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="browser__view-wrap">
        <webview className="browser__view" ref={webviewRefCb} src={url} allowpopups allowfullscreen />
      </div>
    </div>
  );
};

export default BrowserPanel;