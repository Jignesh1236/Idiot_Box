import React, { useState, useRef, useCallback, useEffect } from "react";

const Panel3 = () => {
  const [url, setUrl] = useState("https://www.google.com");
  const [inputValue, setInputValue] = useState("https://www.google.com");
  const webviewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goToUrl = useCallback((u) => {
    let fixed = u.trim();
    if (fixed && !/^https?:\/\//i.test(fixed)) fixed = "https://" + fixed;
    setUrl(fixed);
    setInputValue(fixed);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") goToUrl(inputValue);
  }, [inputValue, goToUrl]);

  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;
    const onStart = () => setIsLoading(true);
    const onStop = () => setIsLoading(false);
    const onNavigate = (e) => { setInputValue(e.url); setUrl(e.url); setCanGoBack(wv.canGoBack()); setCanGoForward(wv.canGoForward()); };
    wv.addEventListener("did-start-loading", onStart);
    wv.addEventListener("did-stop-loading", onStop);
    wv.addEventListener("did-navigate", onNavigate);
    wv.addEventListener("did-navigate-in-page", onNavigate);
    return () => {
      wv.removeEventListener("did-start-loading", onStart);
      wv.removeEventListener("did-stop-loading", onStop);
      wv.removeEventListener("did-navigate", onNavigate);
      wv.removeEventListener("did-navigate-in-page", onNavigate);
    };
  }, [url]);

  return (
    <div className="browser">
      <div className="browser__bar">
        <button className="browser__btn" disabled={!canGoBack} onClick={() => webviewRef.current?.goBack()} title="Back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10 12L6 8l4-4"/></svg>
        </button>
        <button className="browser__btn" disabled={!canGoForward} onClick={() => webviewRef.current?.goForward()} title="Forward">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4"/></svg>
        </button>
        <button className="browser__btn" onClick={() => webviewRef.current?.reload()} title="Refresh">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4M9 1l3 3-3 3M7 15l-3-3 3-3"/></svg>
        </button>
        <div className="browser__url-wrap">
          {isLoading && <div className="browser__spinner"/>}
          <input className="browser__url"
            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} spellCheck={false}
          />
        </div>
        <button className="browser__btn browser__btn--go" onClick={() => goToUrl(inputValue)} title="Go">Go</button>
      </div>
      <div className="browser__view-wrap">
        <webview className="browser__view" ref={webviewRef} src={url} allowpopups allowfullscreen />
      </div>
    </div>
  );
};

export default Panel3;
