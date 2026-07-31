import React, { useState, useRef, useCallback, useEffect } from "react";
import { Actions } from "flexlayout-react";

const LOCK_ICON   = "M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 6V5a2 2 0 1 1 4 0v2H6z";
const UNLOCK_ICON = "M8 1a4 4 0 0 1 4 4v1h-1V5a3 3 0 0 0-5.7-1.37l-.78-.62A4 4 0 0 1 8 1zm-5.65.09l12 14-.7.6L1.65 1.7zM6 7.49l-1.82.01a1 1 0 0 0-.18 0v3.85L2.35 9.7l-.7.6L4 13.2V14a1 1 0 0 0 1 1h6.15l-1-1H5v-4.5l1.85.01zm4.56-.57A1 1 0 0 1 12 7.5V8h1a1 1 0 0 1 1 1v3.15l-1-1V9h-1.44z";
const LOCAL_ICON  = "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-1 12.93A6 6 0 0 1 2 8c0-.33.03-.66.07-1H4v1h2v1H5v1h1v2l1 1zm5.1-3.83A4.9 4.9 0 0 0 13 8c0-2.5-1.83-4.55-4.2-4.96L9 4v1H7V4h-.44l3.55 5.1zm-9.4.14A5 5 0 0 1 2 8c0 1.72.87 3.23 2.2 4.14l.83-1.04z";
const PUZZLE_ICON = "M12.5 2A2.5 2.5 0 0 0 10 4.5c0 .28.05.55.14.8L8.8 6.65a2.77 2.77 0 0 0-.8-.15H6.5v1.5h1.5c.77 0 1.5.28 2.07.86l.79.79-.79.79a2.78 2.78 0 0 0-.85 2.01v1.5h1.5v-1.5c0-.28.05-.55.14-.8l1.35-1.35c.24.09.51.14.79.14a2.5 2.5 0 0 0 0-5zM3 5.5A1.5 1.5 0 0 1 4.5 4H6V2H4.5a3.5 3.5 0 0 0-3.5 3.5V7h2V5.5zM1 8v4.5A3.5 3.5 0 0 0 4.5 16H7v-2H4.5A1.5 1.5 0 0 1 3 12.5V8H1z";

// ── Extension Manager Modal ───────────────────────────────────────────────────
const ExtensionManager = ({ onClose }) => {
  const [extensions, setExtensions] = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    window.electronAPI.readExtensions().then((list) => {
      if (Array.isArray(list)) setExtensions(list);
    });
  }, []);

  const handleUpload = async () => {
    setError(null); setUploading(true);
    try {
      const filePath = await window.electronAPI.pickExtensionFile();
      if (!filePath) { setUploading(false); return; }
      const baseName = filePath.replace(/.*[\\/]/, "").replace(/\.(zip|crx)$/i, "");
      const result   = await window.electronAPI.uploadExtension(baseName, filePath);
      if (result?.success) setExtensions((prev) => [...prev, result.entry]);
      else setError(result?.error || "Upload failed");
    } catch (err) { setError(err?.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleToggle = async (id) => {
    const updated = extensions.map((ex) => ex.id === id ? { ...ex, enabled: !ex.enabled } : ex);
    setExtensions(updated);
    await window.electronAPI.writeExtensions(updated);
  };

  const handleDelete = async (id) => {
    await window.electronAPI.deleteExtension(id);
    setExtensions((prev) => prev.filter((ex) => ex.id !== id));
  };

  return (
    <>
      <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.55)" }} onClick={onClose} />
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1001,
        width:480,maxHeight:"70vh",background:"#1e1e1e",border:"1px solid #3a3a3a",borderRadius:6,
        display:"flex",flexDirection:"column",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",overflow:"hidden" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"12px 16px",borderBottom:"1px solid #2d2d2d",background:"#252526",flexShrink:0 }}>
          <span style={{ fontWeight:600,fontSize:13,color:"#d0d0d0" }}>Extension Manager</span>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:18 }} aria-label="Close">×</button>
        </div>
        <div style={{ padding:"12px 16px",borderBottom:"1px solid #2d2d2d",flexShrink:0 }}>
          <p style={{ fontSize:11,color:"#888",marginBottom:8 }}>
            Upload a <strong style={{color:"#bbb"}}>.zip</strong> or <strong style={{color:"#bbb"}}>.crx</strong> extension file.
          </p>
          <button onClick={handleUpload} disabled={uploading}
            style={{ height:30,padding:"0 14px",background:uploading?"#2a2a2a":"#0e639c",
              border:"1px solid "+(uploading?"#3a3a3a":"#1177bb"),borderRadius:3,
              color:uploading?"#666":"#d0d0d0",fontSize:12,cursor:uploading?"default":"pointer",
              display:"inline-flex",alignItems:"center",gap:6 }}>
            {uploading ? "Uploading…" : "Upload Extension (.zip / .crx)"}
          </button>
          {error && <div style={{ marginTop:6,fontSize:11,color:"#f44747" }}>Error: {error}</div>}
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"8px 0" }}>
          {extensions.length === 0
            ? <div style={{ padding:"24px 16px",textAlign:"center",color:"#555",fontSize:12,fontStyle:"italic" }}>No extensions installed.</div>
            : extensions.map((ex) => (
              <div key={ex.id} style={{ display:"flex",alignItems:"center",padding:"8px 16px",gap:12,borderBottom:"1px solid #2a2a2a" }}>
                <button onClick={() => handleToggle(ex.id)} role="switch" aria-checked={ex.enabled}
                  style={{ position:"relative",width:32,height:18,borderRadius:9,border:"none",
                    background:ex.enabled?"#0e639c":"#3a3a3a",cursor:"pointer",flexShrink:0,padding:0,transition:"background 0.15s" }}>
                  <span style={{ position:"absolute",top:3,left:ex.enabled?16:3,width:12,height:12,
                    borderRadius:"50%",background:"#fff",transition:"left 0.15s" }} />
                </button>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,color:"#d0d0d0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{ex.name}</div>
                  <div style={{ fontSize:10,color:"#666",marginTop:2 }}>{ex.file}</div>
                </div>
                <span style={{ fontSize:10,padding:"2px 6px",borderRadius:3,
                  background:ex.enabled?"rgba(14,99,156,0.25)":"rgba(255,255,255,0.05)",
                  color:ex.enabled?"#4ec9b0":"#555",flexShrink:0 }}>
                  {ex.enabled?"enabled":"disabled"}
                </span>
                <button onClick={() => handleDelete(ex.id)} title="Remove"
                  style={{ background:"none",border:"none",color:"#666",cursor:"pointer",padding:4,borderRadius:3,display:"flex",alignItems:"center",flexShrink:0 }}
                  onMouseEnter={(e)=>e.currentTarget.style.color="#f44747"}
                  onMouseLeave={(e)=>e.currentTarget.style.color="#666"}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"/></svg>
                </button>
              </div>
            ))
          }
        </div>
        <div style={{ padding:"10px 16px",borderTop:"1px solid #2d2d2d",background:"#252526",flexShrink:0,display:"flex",justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ height:28,padding:"0 14px",background:"#2d2d2d",
            border:"1px solid #3a3a3a",borderRadius:3,color:"#bbb",fontSize:12,cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </>
  );
};

// ── Extension Dropdown (Chrome-style) ────────────────────────────────────────
const ExtensionDropdown = ({ extensions, onToggle, onManage, onClose, anchorRef }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setStyle({ right: Math.max(4, window.innerWidth - r.right), top: r.bottom + 4 });
    }
  }, [anchorRef]);

  return (
    <>
      <div style={{ position:"fixed",inset:0,zIndex:900 }} onClick={onClose} />
      <div style={{ position:"fixed",zIndex:901,minWidth:260,maxWidth:320,
        background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:6,
        boxShadow:"0 4px 20px rgba(0,0,0,0.5)",overflow:"hidden",...style }}>
        <div style={{ padding:"10px 14px 6px",borderBottom:"1px solid #333",
          fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em" }}>
          Extensions
        </div>
        {extensions.length === 0 ? (
          <div style={{ padding:"16px 14px",color:"#555",fontSize:12,fontStyle:"italic" }}>
            No extensions installed.
          </div>
        ) : (
          <div style={{ maxHeight:320,overflowY:"auto" }}>
            {extensions.map((ex) => (
              <div key={ex.id} style={{ display:"flex",alignItems:"center",
                padding:"8px 14px",gap:10,cursor:"default",
                borderBottom:"1px solid #333",
                background:ex.enabled?"transparent":"rgba(0,0,0,0.15)" }}>
                {/* Extension icon placeholder */}
                <div style={{ width:28,height:28,borderRadius:4,background:"#3a3a3a",
                  flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#888"><path d={PUZZLE_ICON}/></svg>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,color:ex.enabled?"#d0d0d0":"#666",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{ex.name}</div>
                  <div style={{ fontSize:10,color:"#555",marginTop:1 }}>
                    {ex.enabled ? "Active" : "Disabled"}
                  </div>
                </div>
                {/* Toggle pill */}
                <button onClick={() => onToggle(ex.id)} role="switch" aria-checked={ex.enabled}
                  title={ex.enabled?"Disable":"Enable"}
                  style={{ position:"relative",width:32,height:18,borderRadius:9,border:"none",
                    background:ex.enabled?"#0e639c":"#3a3a3a",cursor:"pointer",flexShrink:0,padding:0,transition:"background 0.15s" }}>
                  <span style={{ position:"absolute",top:3,left:ex.enabled?16:3,width:12,height:12,
                    borderRadius:"50%",background:"#fff",transition:"left 0.15s" }} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding:"8px 14px",borderTop:"1px solid #333" }}>
          <button onClick={onManage}
            style={{ width:"100%",height:28,background:"none",border:"1px solid #3a3a3a",
              borderRadius:3,color:"#999",fontSize:11,cursor:"pointer",textAlign:"left",paddingLeft:8 }}
            onMouseEnter={(e)=>{e.currentTarget.style.background="#333";e.currentTarget.style.color="#d0d0d0";}}
            onMouseLeave={(e)=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#999";}}>
            Manage extensions…
          </button>
        </div>
      </div>
    </>
  );
};

// ── BrowserPanel ──────────────────────────────────────────────────────────────
const BrowserPanel = (props) => {
  const { nodeId, config } = props || {};
  const initialUrl = config?.url || "https://www.google.com";

  const [navUrl,        setNavUrl]        = useState(initialUrl);
  const [inputValue,    setInputValue]    = useState(initialUrl);
  const [displayUrl,    setDisplayUrl]    = useState(initialUrl);
  const [canGoBack,     setCanGoBack]     = useState(false);
  const [canGoForward,  setCanGoForward]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [focused,       setFocused]       = useState(false);
  const [lockOpen,      setLockOpen]      = useState(false);
  const [barHidden,     setBarHidden]     = useState(false);
  const [popupStyle,    setPopupStyle]    = useState({});
  const [extMgrOpen,    setExtMgrOpen]    = useState(false);
  const [extDropOpen,   setExtDropOpen]   = useState(false);  // Chrome-style dropdown
  const [extensions,    setExtensions]    = useState([]);

  const webviewRef    = useRef(null);
  const attachedRef   = useRef(false);
  const lockRef       = useRef(null);
  const extBtnRef     = useRef(null);   // anchor for extension dropdown
  const extensionsRef = useRef(extensions);
  useEffect(() => { extensionsRef.current = extensions; }, [extensions]);

  // Load extensions on mount, keep in sync
  useEffect(() => {
    window.electronAPI.readExtensions().then((list) => {
      if (Array.isArray(list)) setExtensions(list);
    });
  }, []);

  // Refresh extension list when manager closes (user may have added/removed)
  const handleExtMgrClose = useCallback(() => {
    setExtMgrOpen(false);
    window.electronAPI.readExtensions().then((list) => {
      if (Array.isArray(list)) setExtensions(list);
    });
  }, []);

  const handleDropdownToggle = useCallback((id) => {
    const updated = extensions.map((ex) => ex.id === id ? { ...ex, enabled: !ex.enabled } : ex);
    setExtensions(updated);
    window.electronAPI.writeExtensions(updated);
  }, [extensions]);

  // ── Security display ──────────────────────────────────────────────────────
  let hostname = "", protocol = "";
  try { const u = new URL(displayUrl); hostname = u.hostname; protocol = u.protocol; } catch {}
  const isLocal = !hostname || hostname === "localhost" || hostname === "127.0.0.1"
    || hostname === "0.0.0.0" || hostname.startsWith("192.168.") || hostname.startsWith("10.");
  const isHttps = protocol === "https:";
  const iconPath  = isLocal ? LOCAL_ICON : (isHttps ? LOCK_ICON : UNLOCK_ICON);
  const iconColor = isLocal ? "#888"     : (isHttps ? "#4ec9b0" : "#e6a23c");

  const hasEnabledExtensions = extensions.some((e) => e.enabled);
  const hasAnyExtension      = extensions.length > 0;

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToUrl = useCallback((u) => {
    let fixed = u.trim();
    if (!fixed) return;
    if (/^https?:\/\//i.test(fixed)) {
      // already has scheme
    } else if (/^[^\s]+\.[^\s]+/.test(fixed) || fixed.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(fixed)) {
      fixed = "https://" + fixed;
    } else {
      fixed = "https://www.google.com/search?q=" + encodeURIComponent(fixed);
    }
    setNavUrl(fixed); setInputValue(fixed); setDisplayUrl(fixed); setLockOpen(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") goToUrl(inputValue);
  }, [inputValue, goToUrl]);

  // ── Webview listeners ─────────────────────────────────────────────────────
  const attachListeners = useCallback((wv) => {
    if (attachedRef.current) return;
    attachedRef.current = true;

    wv.addEventListener("did-start-loading",    () => setIsLoading(true));
    wv.addEventListener("did-stop-loading",     () => setIsLoading(false));
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
      const m = window.__flexModel?.current;
      if (m) {
        const tabNode = m.getNodeById(nodeId);
        if (tabNode) {
          m.doAction(Actions.updateNodeAttributes(nodeId, {
            config: { ...(tabNode.getConfig() || {}), title: e.title }, name: e.title,
          }));
        }
      }
    });
    wv.addEventListener("page-favicon-updated", (e) => {
      if (e.favicons?.length) {
        const m = window.__flexModel?.current;
        if (m) {
          const tabNode = m.getNodeById(nodeId);
          if (tabNode) {
            m.doAction(Actions.updateNodeAttributes(nodeId, {
              config: { ...(tabNode.getConfig() || {}), favicon: e.favicons[0] },
            }));
          }
        }
      }
    });

    // ── Webview right-click context menu ────────────────────────────────────
    wv.addEventListener("context-menu", async (e) => {
      e.preventDefault();
      const params = {
        hasSelection: !!(e.params?.selectionText),
        selectionText: e.params?.selectionText || "",
        linkURL: e.params?.linkURL || "",
        srcURL:  e.params?.srcURL  || "",
        isEditable: !!e.params?.isEditable,
        pageURL: wv.getURL(),
      };
      const result = await window.electronAPI.showBrowserWebviewContextMenu(params);
      if (!result) return;
      switch (result.action) {
        case "back":           try { wv.goBack();    } catch {} break;
        case "forward":        try { wv.goForward(); } catch {} break;
        case "reload":         wv.reload(); break;
        case "copy":           wv.copy();   break;
        case "paste":          wv.paste();  break;
        case "cut":            wv.cut();    break;
        case "selectAll":      wv.selectAll(); break;
        case "inspect":        wv.openDevTools(); break;
        case "print":          wv.print?.(); break;
        case "saveAs":         wv.downloadURL?.(wv.getURL()); break;
        case "viewSource":     goToUrl("view-source:" + (result.data?.url || wv.getURL())); break;
        case "copyLink":       window.electronAPI.clipboardWrite(result.data?.url || ""); break;
        case "copyImageURL":   window.electronAPI.clipboardWrite(result.data?.url || ""); break;
        case "openLinkNewTab": {
          const m = window.__flexModel?.current;
          if (m) {
            const tabset = m.getNodeById(nodeId)?.getParent();
            if (tabset) {
              const url = result.data?.url;
              m.doAction(Actions.addNode({
                type:"tab", component:"panel3", name:"New Tab", enableClose:true,
                config:{ type:"browser", title:"New Tab", url },
              }, tabset.getId(), DockLocation.CENTER));
            }
          }
          break;
        }
        case "openImageNewTab": {
          const m = window.__flexModel?.current;
          if (m) {
            const tabset = m.getNodeById(nodeId)?.getParent();
            if (tabset) {
              const url = result.data?.url;
              m.doAction(Actions.addNode({
                type:"tab", component:"panel3", name:"Image", enableClose:true,
                config:{ type:"browser", title:"Image", url },
              }, tabset.getId(), DockLocation.CENTER));
            }
          }
          break;
        }
        case "searchSelection": {
          const q = encodeURIComponent(result.data?.text || "");
          goToUrl("https://www.google.com/search?q=" + q);
          break;
        }
      }
    });

    setIsLoading(false);
  }, [nodeId, goToUrl]);

  const webviewRefCb = useCallback((el) => {
    if (el) { webviewRef.current = el; attachListeners(el); }
    else    { attachedRef.current = false; webviewRef.current = null; }
  }, [attachListeners]);

  // ── Lock popup ────────────────────────────────────────────────────────────
  const handleLockClick = useCallback((e) => {
    e.stopPropagation();
    const next = !lockOpen;
    setLockOpen(next);
    if (next && lockRef.current) {
      const r = lockRef.current.getBoundingClientRect();
      setPopupStyle({ left: Math.max(8, r.left - 10), top: r.bottom + 6 });
    }
  }, [lockOpen]);

  // ── Tab right-click context menu ─────────────────────────────────────────
  useEffect(() => {
    const handler = async (e) => {
      if (e.detail?.nodeId !== nodeId) return;
      const result = await window.electronAPI.showBrowserTabContextMenu();
      if (!result) return;
      switch (result.action) {
        case "settings":        window.dispatchEvent(new CustomEvent("browser:openSettings")); break;
        case "refresh":         webviewRef.current?.reload(); break;
        case "extensionManager": setExtMgrOpen(true); break;
      }
    };
    window.addEventListener("browser:tabContextMenu", handler);
    return () => window.removeEventListener("browser:tabContextMenu", handler);
  }, [nodeId]);

  return (
    <div className="browser">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
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
            {isLoading && <div className="browser__spinner"/>}
            <svg className="browser__lock" ref={lockRef} width="14" height="14" viewBox="0 0 16 16"
              fill="currentColor" onClick={handleLockClick} style={{ color: iconColor }}>
              <path d={iconPath}/>
            </svg>
            <input className="browser__url" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown} spellCheck={false}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setLockOpen(false); }}
            />
          </div>

          {/* Extension icon — only shown when at least one extension is installed */}
          {hasAnyExtension && (
            <button
              ref={extBtnRef}
              className="browser__btn"
              onClick={() => { setExtDropOpen((o) => !o); setLockOpen(false); }}
              title="Extensions"
              style={{ color: hasEnabledExtensions ? "#4ec9b0" : "#666",
                background: extDropOpen ? "rgba(255,255,255,0.08)" : "transparent" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d={PUZZLE_ICON}/>
              </svg>
            </button>
          )}

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

      {/* ── Lock popup ──────────────────────────────────────────────────── */}
      {lockOpen && (
        <>
          <div className="browser__lock-overlay" onClick={() => setLockOpen(false)} />
          <div className="browser__lock-popup" style={popupStyle} onClick={(e) => e.stopPropagation()}>
            <div className="browser__lock-popup-item">
              <span className="browser__lock-popup-label">Connection</span>
              <span className="browser__lock-popup-value" style={{ color: iconColor }}>
                {isLocal ? "Local" : (isHttps ? "Secure" : "Not secure")}{" "}
                ({isLocal ? (hostname || "local") : (isHttps ? "HTTPS" : "HTTP")})
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

      {/* ── Extension dropdown (Chrome-style) ───────────────────────────── */}
      {extDropOpen && (
        <ExtensionDropdown
          extensions={extensions}
          onToggle={handleDropdownToggle}
          onManage={() => { setExtDropOpen(false); setExtMgrOpen(true); }}
          onClose={() => setExtDropOpen(false)}
          anchorRef={extBtnRef}
        />
      )}

      {/* ── Extension Manager modal ─────────────────────────────────────── */}
      {extMgrOpen && <ExtensionManager onClose={handleExtMgrClose} />}

      {/* ── Webview ──────────────────────────────────────────────────────── */}
      <div className="browser__view-wrap">
        <webview className="browser__view" ref={webviewRefCb} src={navUrl} allowpopups allowfullscreen />
      </div>
    </div>
  );
};

export default BrowserPanel;
