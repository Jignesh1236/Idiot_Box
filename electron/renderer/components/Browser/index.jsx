import React, { useState, useRef, useCallback, useEffect } from "react";
import { Actions, DockLocation } from "flexlayout-react";

// ── SVG icon paths ─────────────────────────────────────────────────────────────
const LOCK_ICON   = "M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 6V5a2 2 0 1 1 4 0v2H6z";
const UNLOCK_ICON = "M8 1a4 4 0 0 1 4 4v1h-1V5a3 3 0 0 0-5.7-1.37l-.78-.62A4 4 0 0 1 8 1zm-5.65.09l12 14-.7.6L1.65 1.7zM6 7.49l-1.82.01a1 1 0 0 0-.18 0v3.85L2.35 9.7l-.7.6L4 13.2V14a1 1 0 0 0 1 1h6.15l-1-1H5v-4.5l1.85.01zm4.56-.57A1 1 0 0 1 12 7.5V8h1a1 1 0 0 1 1 1v3.15l-1-1V9h-1.44z";
const LOCAL_ICON  = "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-1 12.93A6 6 0 0 1 2 8c0-.33.03-.66.07-1H4v1h2v1H5v1h1v2l1 1zm5.1-3.83A4.9 4.9 0 0 0 13 8c0-2.5-1.83-4.55-4.2-4.96L9 4v1H7V4h-.44l3.55 5.1zm-9.4.14A5 5 0 0 1 2 8c0 1.72.87 3.23 2.2 4.14l.83-1.04z";

// ── BrowserPanel ───────────────────────────────────────────────────────────────
const BrowserPanel = (props) => {
  const { nodeId, config } = props || {};
  const initialUrl = config?.url || "https://www.google.com";

  const [navUrl,       setNavUrl]       = useState(initialUrl);
  const [inputValue,   setInputValue]   = useState(initialUrl);
  const [displayUrl,   setDisplayUrl]   = useState(initialUrl);
  const [canGoBack,    setCanGoBack]    = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [focused,      setFocused]      = useState(false);
  const [lockOpen,     setLockOpen]     = useState(false);
  const [barHidden,    setBarHidden]    = useState(false);
  const [popupStyle,   setPopupStyle]   = useState({});

  const webviewRef   = useRef(null);
  const attachedRef  = useRef(false);
  const lockRef      = useRef(null);
  const nodeIdRef    = useRef(nodeId);
  const goToUrlRef   = useRef(null);

  // Keep nodeIdRef current (nodeId itself doesn't change but keep defensive)
  useEffect(() => { nodeIdRef.current = nodeId; }, [nodeId]);

  // ── Security display ────────────────────────────────────────────────────────
  let hostname = "", protocol = "";
  try { const u = new URL(displayUrl); hostname = u.hostname; protocol = u.protocol; } catch {}
  const isLocal  = !hostname || hostname === "localhost" || hostname === "127.0.0.1"
    || hostname === "0.0.0.0" || hostname.startsWith("192.168.") || hostname.startsWith("10.");
  const isHttps  = protocol === "https:";
  const iconPath  = isLocal ? LOCAL_ICON : (isHttps ? LOCK_ICON : UNLOCK_ICON);
  const iconColor = isLocal ? "#888"     : (isHttps ? "#4ec9b0" : "#e6a23c");

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToUrl = useCallback((u) => {
    let fixed = u.trim();
    if (!fixed) return;
    if (/^https?:\/\//i.test(fixed)) {
      // already has scheme
    } else if (fixed.startsWith("localhost") || fixed.startsWith("127.0.0.1") || /^\d+\.\d+\.\d+\.\d+/.test(fixed)) {
      fixed = "http://" + fixed;
    } else if (/^[^\s]+\.[^\s]+/.test(fixed)) {
      fixed = "https://" + fixed;
    } else {
      fixed = "https://www.google.com/search?q=" + encodeURIComponent(fixed);
    }
    setNavUrl(fixed); setInputValue(fixed); setDisplayUrl(fixed); setLockOpen(false);
    if (webviewRef.current) {
      try { webviewRef.current.loadURL(fixed); } catch {}
    }
  }, []);

  goToUrlRef.current = goToUrl;

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") goToUrl(inputValue);
  }, [inputValue, goToUrl]);

  // ── Webview event listeners ──────────────────────────────────────────────────
  const attachListenersRef = useRef(null);
  attachListenersRef.current = (wv) => {
    if (attachedRef.current) return;
    attachedRef.current = true;

    wv.addEventListener("did-start-loading",    () => setIsLoading(true));
    wv.addEventListener("did-stop-loading",     () => setIsLoading(false));
    wv.addEventListener("did-fail-load", (e) => {
      setIsLoading(false);
      if (e.isMainFrame && e.errorCode !== -3) {
        const validatedUrl = wv.getURL() || navUrl;
        if (validatedUrl.startsWith("https://localhost") || validatedUrl.startsWith("https://127.0.0.1")) {
          const httpUrl = validatedUrl.replace("https://", "http://");
          try { wv.loadURL(httpUrl); } catch {}
        }
      }
    });
    wv.addEventListener("did-navigate",         () => {
      const cur = wv.getURL();
      setInputValue(cur); setDisplayUrl(cur);
      try { setCanGoBack(wv.canGoBack()); setCanGoForward(wv.canGoForward()); } catch {}
    });
    wv.addEventListener("did-navigate-in-page", () => {
      const cur = wv.getURL();
      setInputValue(cur); setDisplayUrl(cur);
      try { setCanGoBack(wv.canGoBack()); setCanGoForward(wv.canGoForward()); } catch {}
    });
    wv.addEventListener("page-title-updated", (e) => {
      const nid = nodeIdRef.current;
      const m = window.__flexModel?.current;
      if (m) {
        const tabNode = m.getNodeById(nid);
        if (tabNode) {
          m.doAction(Actions.updateNodeAttributes(nid, {
            config: { ...(tabNode.getConfig() || {}), title: e.title }, name: e.title,
          }));
        }
      }
    });
    wv.addEventListener("page-favicon-updated", (e) => {
      if (e.favicons?.length) {
        const nid = nodeIdRef.current;
        const m = window.__flexModel?.current;
        if (m) {
          const tabNode = m.getNodeById(nid);
          if (tabNode) {
            m.doAction(Actions.updateNodeAttributes(nid, {
              config: { ...(tabNode.getConfig() || {}), favicon: e.favicons[0] },
            }));
          }
        }
      }
    });

    // ── Webview right-click context menu ──────────────────────────────────────
    wv.addEventListener("context-menu", async (e) => {
      e.preventDefault();
      const params = {
        hasSelection: !!(e.params?.selectionText),
        selectionText: e.params?.selectionText || "",
        linkURL:    e.params?.linkURL    || "",
        srcURL:     e.params?.srcURL     || "",
        isEditable: !!e.params?.isEditable,
        pageURL:    wv.getURL(),
        x:          Math.round(e.params?.x || 0),
        y:          Math.round(e.params?.y || 0),
      };
      const result = await window.electronAPI.showBrowserWebviewContextMenu(params);
      if (!result) return;
      const nid = nodeIdRef.current;
      switch (result.action) {
        case "back":        try { wv.goBack();    } catch {} break;
        case "forward":     try { wv.goForward(); } catch {} break;
        case "reload":      wv.reload();     break;
        case "copy":        wv.copy();       break;
        case "paste":       wv.paste();      break;
        case "cut":         wv.cut();        break;
        case "selectAll":   wv.selectAll();  break;
        case "inspect":
          if (typeof result.data?.x === "number" && typeof result.data?.y === "number") {
            try { wv.inspectElement(result.data.x, result.data.y); } catch { wv.openDevTools(); }
          } else {
            wv.openDevTools();
          }
          break;
        case "print":       wv.print?.();    break;
        case "saveAs":      wv.downloadURL?.(wv.getURL()); break;
        case "viewSource":  goToUrlRef.current("view-source:" + (result.data?.url || wv.getURL())); break;
        case "copyLink":    window.electronAPI.clipboardWrite(result.data?.url || ""); break;
        case "copyImageURL":window.electronAPI.clipboardWrite(result.data?.url || ""); break;
        case "openLinkNewTab": {
          const m = window.__flexModel?.current;
          if (m) {
            const tabset = m.getNodeById(nid)?.getParent();
            if (tabset) {
              m.doAction(Actions.addNode({
                type:"tab",component:"panel3",name:"New Tab",enableClose:true,
                config:{ type:"browser",title:"New Tab",url:result.data?.url },
              }, tabset.getId(), DockLocation.CENTER));
            }
          }
          break;
        }
        case "openImageNewTab": {
          const m = window.__flexModel?.current;
          if (m) {
            const tabset = m.getNodeById(nid)?.getParent();
            if (tabset) {
              m.doAction(Actions.addNode({
                type:"tab",component:"panel3",name:"Image",enableClose:true,
                config:{ type:"browser",title:"Image",url:result.data?.url },
              }, tabset.getId(), DockLocation.CENTER));
            }
          }
          break;
        }
        case "searchSelection": {
          goToUrlRef.current("https://www.google.com/search?q=" + encodeURIComponent(result.data?.text || ""));
          break;
        }
        default: break;
      }
    });

    setIsLoading(false);
  };

  // Stable ref-callback — created ONCE so webview never remounts on re-render
  const webviewRefCb = useCallback((el) => {
    if (el) { webviewRef.current = el; attachListenersRef.current(el); }
    else    { attachedRef.current = false; webviewRef.current = null; }
  }, []); // empty deps intentional

  // ── Lock popup ─────────────────────────────────────────────────────────────
  const handleLockClick = useCallback((e) => {
    e.stopPropagation();
    const next = !lockOpen;
    setLockOpen(next);
    if (next && lockRef.current) {
      const r = lockRef.current.getBoundingClientRect();
      setPopupStyle({ left: Math.max(8, r.left - 10), top: r.bottom + 6 });
    }
  }, [lockOpen]);

  // ── Tab right-click ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = async (e) => {
      if (e.detail?.nodeId !== nodeId) return;
      const result = await window.electronAPI.showBrowserTabContextMenu();
      if (!result) return;
      switch (result.action) {
        case "settings":         window.dispatchEvent(new CustomEvent("browser:openSettings")); break;
        case "refresh":          webviewRef.current?.reload(); break;
        default: break;
      }
    };
    window.addEventListener("browser:tabContextMenu", handler);
    return () => window.removeEventListener("browser:tabContextMenu", handler);
  }, [nodeId]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="browser">

      {/* Toolbar */}
      {!barHidden && (
        <div className="browser__bar">
          <button className="browser__btn" disabled={!canGoBack}
            onClick={() => webviewRef.current?.goBack()} title="Back">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <button className="browser__btn" disabled={!canGoForward}
            onClick={() => webviewRef.current?.goForward()} title="Forward">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4"/></svg>
          </button>
          <button className="browser__btn" onClick={() => webviewRef.current?.reload()} title="Refresh">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4M9 1l3 3-3 3M7 15l-3-3 3-3"/>
            </svg>
          </button>

          {/* URL bar */}
          <div className={`browser__url-wrap${focused ? " browser__url-wrap--focused" : ""}`}>
            {isLoading && <div className="browser__spinner" />}
            <svg className="browser__lock" ref={lockRef} width="14" height="14" viewBox="0 0 16 16"
              fill="currentColor" onClick={handleLockClick} style={{ color: iconColor }}>
              <path d={iconPath} />
            </svg>
            <input
              className="browser__url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setLockOpen(false); }}
            />
          </div>

          {/* Inspect Element button */}
          <button
            className="browser__btn"
            onClick={() => {
              if (webviewRef.current) {
                try {
                  if (webviewRef.current.isDevToolsOpened()) {
                    webviewRef.current.closeDevTools();
                  } else {
                    webviewRef.current.openDevTools();
                  }
                } catch {}
              }
            }}
            title="Inspect Element / DevTools"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 9.5L13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
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

      {/* Lock / security popup */}
      {lockOpen && (
        <>
          <div className="browser__lock-overlay" onClick={() => setLockOpen(false)} />
          <div className="browser__lock-popup" style={popupStyle} onClick={(e) => e.stopPropagation()}>
            <div className="browser__lock-popup-item">
              <span className="browser__lock-popup-label">Connection</span>
              <span className="browser__lock-popup-value" style={{ color: iconColor }}>
                {isLocal ? "Local" : isHttps ? "Secure" : "Not secure"}{" "}
                ({isLocal ? (hostname || "local") : isHttps ? "HTTPS" : "HTTP"})
              </span>
            </div>
            <div className="browser__lock-popup-item">
              <span className="browser__lock-popup-label">URL</span>
              <span className="browser__lock-popup-value" style={{ wordBreak:"break-all" }}>{displayUrl}</span>
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

      {/* Webview */}
      <div className="browser__view-wrap">
        <webview
          className="browser__view"
          ref={webviewRefCb}
          src={navUrl}
          allowpopups
          allowfullscreen
        />
      </div>
    </div>
  );
};

export default BrowserPanel;