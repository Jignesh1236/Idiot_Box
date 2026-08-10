// Preload script entry point
const { contextBridge, ipcRenderer, webUtils, clipboard } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ── Native file drag (outgoing to OS/external apps) ────────────────────
  startNativeDrag: (paths) => ipcRenderer.send("drag:startNative", paths),

  // ── Clipboard ─────────────────────────────────────────────────────────────
  clipboardRead:  ()  => clipboard.readText(),
  clipboardWrite: (t) => clipboard.writeText(t),

  // ── Drag & drop (external files) ───────────────────────────────────────────
  getPathForFile: (file) => webUtils.getPathForFile(file),

  // ── Icons ──────────────────────────────────────────────────────────────────
  getVscodeIcon:  (name, isDir, isOpen) => ipcRenderer.invoke("fs:getVscodeIcon", { name, isDir, isOpen: !!isOpen }),
  getIcon:        (filePath) => ipcRenderer.invoke("fs:getIcon", filePath),
  getFilePreview: (filePath) => ipcRenderer.invoke("fs:getFilePreview", filePath),
  readTextFile:   (filePath) => ipcRenderer.invoke("fs:readTextFile", filePath),
  writeFileText:  (filePath, text) => ipcRenderer.invoke("fs:writeFile", { filePath, text }),
  saveFileAs:     (filePath, text) => ipcRenderer.invoke("fs:saveFileAs", { filePath, text }),
  extDocSaved:    (filePath) => ipcRenderer.invoke("ext:docSaved", { filePath }),
  readFileAsDataUrl: (filePath) => ipcRenderer.invoke("fs:readFileAsDataUrl", filePath),
  transpileJsx:   (code) => ipcRenderer.invoke("jsx:transpile", code),
  copyImageToClipboard: (filePath) => ipcRenderer.invoke("media:copyImage", filePath),
  onOpenFileInEditor: (callback) => {
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on("editor:openFile", handler);
    return () => ipcRenderer.removeListener("editor:openFile", handler);
  },

  // ── Directory access ───────────────────────────────────────────────────────
  openFolder:  ()      => ipcRenderer.invoke("dialog:openFolder"),
  readDir:     (dir)   => ipcRenderer.invoke("fs:readDir",    dir),
  readDirAll:  (dir)   => ipcRenderer.invoke("fs:readDirAll", dir),
  stat:        (p)     => ipcRenderer.invoke("fs:stat",       p),

  // ── File operations ────────────────────────────────────────────────────────
  newFolder:        (parentPath, name)          => ipcRenderer.invoke("fs:newFolder",  { parentPath, name }),
  newFile:          (parentPath, name)          => ipcRenderer.invoke("fs:newFile",    { parentPath, name }),
  rename:           (oldPath, newName)          => ipcRenderer.invoke("fs:rename",     { oldPath, newName }),
  deleteItem:       (itemPath)                  => ipcRenderer.invoke("fs:delete",     { itemPath }),
  duplicate:        (itemPath)                  => ipcRenderer.invoke("fs:duplicate",  { itemPath }),
  copyItem:         (srcPath, destDir)          => ipcRenderer.invoke("fs:copyItem",   { srcPath, destDir }),
  moveItem:         (srcPath, destDir)          => ipcRenderer.invoke("fs:moveItem",   { srcPath, destDir }),
  revealInExplorer: (itemPath)                  => ipcRenderer.invoke("fs:revealInExplorer", { itemPath }),
  openFile:         (filePath, editorId)        => ipcRenderer.invoke("fs:openFile",   { filePath, editorId }),
  trashItem:        (itemPath, rootPath)        => ipcRenderer.invoke("fs:trashItem",        { itemPath, rootPath }),
  restoreTrashItem: (trashId, rootPath)         => ipcRenderer.invoke("fs:restoreTrashItem", { trashId, rootPath }),

  // ── Confirm dialog (native OS message box) ────────────────────────────────
  confirmDialog: (message) => ipcRenderer.invoke("dialog:confirm", message),
  showAlert:     (message) => ipcRenderer.invoke("dialog:alert",   message),

  // ── Context menu ──────────────────────────────────────────────────────────
  // type: "none" | "file" | "folder" | "multi" | "pinned" | "breadcrumb"
  showContextMenu: (type, selectedPaths, clipboardPaths) =>
    ipcRenderer.invoke("contextMenu:show", { type, selectedPaths, clipboardPaths }),

  // ── Pin config ──────────────────────────────────────────────────────────────
  readPinConfig:  (rootPath) => ipcRenderer.invoke("fs:readPinConfig", rootPath),
  writePinConfig: (rootPath, data) => ipcRenderer.invoke("fs:writePinConfig", rootPath, data),

  // ── Settings ───────────────────────────────────────────────────────────────
  readSettings:  ()     => ipcRenderer.invoke("settings:read"),
  writeSettings: (data) => ipcRenderer.invoke("settings:write", data),
  listEditors:   ()     => ipcRenderer.invoke("editors:list"),
  openSettingsWindow: () => ipcRenderer.invoke("settings:openWindow"),

  // ── Browser extensions ─────────────────────────────────────────────────────
  readExtensions:    ()                => ipcRenderer.invoke("extensions:read"),
  uploadExtension:   (name, src)       => ipcRenderer.invoke("extensions:upload",      { name, sourcePath: src }),
  loadUnpackedExtension: ()            => ipcRenderer.invoke("extensions:loadUnpacked"),
  deleteExtension:   (id)              => ipcRenderer.invoke("extensions:delete",      { id }),
  toggleExtension:   (id)              => ipcRenderer.invoke("extensions:toggle",      { id }),
  openExtensionPopup:(extId, tabUrl)   => ipcRenderer.invoke("extensions:openPopup",   { extensionId: extId, currentTabUrl: tabUrl }),
  pickExtensionFile: ()                => ipcRenderer.invoke("extensions:pickFile"),
  showBrowserTabContextMenu: ()            => ipcRenderer.invoke("browser:tabContextMenu"),
  showBrowserWebviewContextMenu: (params) => ipcRenderer.invoke("browser:webviewContextMenu", params),

  // ── Filesystem watcher ─────────────────────────────────────────────────────
  watchDir:   (rootPath) => ipcRenderer.invoke("fs:watch",   rootPath),
  unwatchDir: (rootPath) => ipcRenderer.invoke("fs:unwatch", rootPath),
  // Returns unsubscribe function
  onFsChange: (callback) => {
    const handler = (_e, affectedDir) => callback(affectedDir);
    ipcRenderer.on("fs:change", handler);
    return () => ipcRenderer.removeListener("fs:change", handler);
  },

  // ── Menu events ────────────────────────────────────────────────────────────
  onMenuEvent: (channel, callback) => {
    const valid = ["menu:openProject","menu:newProject","menu:saveProject","menu:closeProject","menu:resetLayout","menu:saveFile","menu:saveFileAs","menu:toggleAutoSave","menu:commandPalette"];
    if (!valid.includes(channel)) return () => {};
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  // ── Terminal ──────────────────────────────────────────────────────────────
  getProjectPath:  ()                          => ipcRenderer.invoke("terminal:getProjectPath"),
  openTerminal:    (tabId, cwd, forceRestart)  => ipcRenderer.invoke("terminal:open",  { tabId, cwd, forceRestart: !!forceRestart }),
  writeToTerminal: (tabId, data)   => ipcRenderer.invoke("terminal:write", { tabId, data }),
  resizeTerminal:  (tabId, cols, rows) => ipcRenderer.invoke("terminal:resize", { tabId, cols, rows }),
  closeTerminal:   (tabId)         => ipcRenderer.invoke("terminal:close", { tabId }),
  onTerminalData:  (callback) => {
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on("terminal:data", handler);
    return () => ipcRenderer.removeListener("terminal:data", handler);
  },
  onTerminalExit:  (callback) => {
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on("terminal:exit", handler);
    return () => ipcRenderer.removeListener("terminal:exit", handler);
  },
  showTerminalContextMenu: (hasSelection) => ipcRenderer.invoke("terminal:contextMenu", { hasSelection }),
  showTerminalTabContextMenu: () => ipcRenderer.invoke("terminal:tabContextMenu"),

  // ── Panel Add Menu ──────────────────────────────────────────────────────────
  showPanelAddMenu: () => ipcRenderer.invoke("panel:addMenu"),

  // ── Project config (per-project tab state) ────────────────────────────────
  readProjectTabs:  (rootPath)        => ipcRenderer.invoke("projectConfig:readTabs",  rootPath),
  writeProjectTabs: (rootPath, data)  => ipcRenderer.invoke("projectConfig:writeTabs", rootPath, data),

  // ── Session ─────────────────────────────────────────────────────────────────
  saveSession:   (data) => ipcRenderer.invoke("session:save", data),
  loadSession:   ()     => ipcRenderer.invoke("session:load"),

  // ── VS Code extension marketplace (Open VSX) ───────────────────────────────
  vsxSearch:        (query, size, offset) => ipcRenderer.invoke("vsx:search",  { query, size, offset }),
  vsxDetails:       (publisher, name)     => ipcRenderer.invoke("vsx:details", { publisher, name }),
  vsxIcon:          (url)                 => ipcRenderer.invoke("vsx:icon",    { url }),
  vsxInstall:       (publisher, name, version) => ipcRenderer.invoke("vsx:install", { publisher, name, version }),
  vsxInstallLocal:  (sourcePath)          => ipcRenderer.invoke("vsx:installLocal", { sourcePath }),
  vsxPickVsix:      ()                    => ipcRenderer.invoke("vsx:pickVsix"),
  vsxListInstalled: ()                    => ipcRenderer.invoke("vsx:list"),
  vsxReadExtFile:   (id, relPath)         => ipcRenderer.invoke("vsx:readExtFile", { id, relPath }),
  vsxToggle:        (id)                  => ipcRenderer.invoke("vsx:toggle",   { id }),
  vsxUninstall:     (id)                  => ipcRenderer.invoke("vsx:uninstall", { id }),
  vsxUpdate:        (id)                  => ipcRenderer.invoke("vsx:update",   { id }),

  // ── VS Code compatible file access (real Extension Host disk provider) ──────
  vscodeFsReadFile: (filePath) => ipcRenderer.invoke("vscodefs:readFile", filePath),
  vscodeFsWriteFile: (filePath, base64) => ipcRenderer.invoke("vscodefs:writeFile", { filePath, base64 }),
  vscodeFsMkdir: (dirPath) => ipcRenderer.invoke("vscodefs:mkdir", dirPath),
  vscodeFsRename: (oldPath, newPath) => ipcRenderer.invoke("vscodefs:rename", { oldPath, newPath }),

  // ── Language server (LSP) ───────────────────────────────────────────────────
  lspOpen:    (path, languageId, text) => ipcRenderer.invoke("lsp:open",    { path, languageId, text }),
  lspChange:  (path, text)             => ipcRenderer.invoke("lsp:change",  { path, text }),
  lspClose:   (path)                   => ipcRenderer.invoke("lsp:close",   { path }),
  lspRequest: (path, method, params)   => ipcRenderer.invoke("lsp:request", { path, method, params }),
  onLspEvent: (cb) => {
    const h = (_e, p) => cb(p);
    ipcRenderer.on("lsp:event", h);
    return () => ipcRenderer.removeListener("lsp:event", h);
  },

  // ── Extension host (VS Code extensions) ─────────────────────────────────────
  extHostState:  () => ipcRenderer.invoke("extHost:state"),
  extHostCommands: () => ipcRenderer.invoke("extHost:commands"),
  extHostRunCommand: (id, args) => ipcRenderer.invoke("extHost:runCommand", { id, args }),
  extHostOutput: (key) => ipcRenderer.invoke("extHost:output", { key }),
  extProviderRequest: (providerId, method, args) =>
    ipcRenderer.invoke("extHost:providerRequest", { providerId, method, args }),
  onExtEvent: (cb) => {
    const h = (_e, p) => cb(p);
    ipcRenderer.on("extHost:event", h);
    return () => ipcRenderer.removeListener("extHost:event", h);
  },

  // ── Phase B: REAL Node/Desktop Extension Host (utilityProcess) ──────────────
  nodeExtHostSpawn: (extMap) => new Promise((resolve, reject) => {
    const channel = "nodeExtHost:spawned";
    const onSpawned = (e) => {
      ipcRenderer.removeListener(channel, onSpawned);
      if (e.error) {
        reject(new Error(e.error));
      } else {
        resolve({ pid: e.pid, port: e.ports && e.ports[0] });
      }
    };
    ipcRenderer.on(channel, onSpawned);
    ipcRenderer.postMessage("nodeExtHost:spawn", { extMap });
  }),
  onNodeExtHostExit: (callback) => {
    const h = (_e, p) => callback(p);
    ipcRenderer.on("nodeExtHost:exited", h);
    return () => ipcRenderer.removeListener("nodeExtHost:exited", h);
  },
  extWebviewPost:     (panelId, message)   => ipcRenderer.invoke("extHost:webview", { action: "postToView", panelId, message }),
  extWebviewClosed:   (panelId)            => ipcRenderer.invoke("extHost:webview", { action: "closed", panelId }),
  extWebviewVisibility: (panelId, visible) => ipcRenderer.invoke("extHost:webview", { action: "visibility", panelId, visible }),
  extWebviewResolve:  (viewType, panelId)  => ipcRenderer.invoke("extHost:webview", { action: "resolve", viewType, panelId }),
  extTreeChildren:    (viewId, element)    => ipcRenderer.invoke("extHost:treeview", { action: "children", viewId, element: element === undefined ? null : element }),
  extTreeReveal:      (viewId, element, options) => ipcRenderer.invoke("extHost:treeview", { action: "reveal", viewId, element: element === undefined ? null : element, options }),
  extTreeviewEvent:   (kind, viewId, element) => ipcRenderer.invoke("extHost:treeview", { action: "event", kind, viewId, element: element === undefined ? null : element }),
getWebviewPreloadPath: () => ipcRenderer.invoke("app:webviewPreloadPath"),
});
