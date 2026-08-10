// Preload for extension webviews (guest side). Runs inside the <webview>
// with contextIsolation and no node access; exposes the minimal VS Code
// webview messaging surface. All host communication goes through sendToHost.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vscode", {
  postMessage: (message) => {
    try { ipcRenderer.sendToHost("vscode:webview:message", message); } catch {}
  },
  onMessage: (callback) => {
    if (typeof callback !== "function") return () => {};
    const handler = (_e, message) => {
      try { callback(message); } catch {}
    };
    ipcRenderer.on("vscode:webview:message", handler);
    return () => ipcRenderer.removeListener("vscode:webview:message", handler);
  },
});
