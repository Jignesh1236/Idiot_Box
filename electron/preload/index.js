// Preload script entry point
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ── Icon resolution ───────────────────────────────────────────────────────
  getVscodeIcon: (name, isDir, isOpen) =>
    ipcRenderer.invoke("fs:getVscodeIcon", { name, isDir, isOpen: !!isOpen }),
  getIcon: (filePath) => ipcRenderer.invoke("fs:getIcon", filePath),

  // ── Folder / file access ──────────────────────────────────────────────────
  openFolder:  ()         => ipcRenderer.invoke("dialog:openFolder"),
  readDir:     (dir)      => ipcRenderer.invoke("fs:readDir", dir),
  readDirAll:  (dir)      => ipcRenderer.invoke("fs:readDirAll", dir),

  // ── File operations ───────────────────────────────────────────────────────
  newFolder:         (parentPath, name)          => ipcRenderer.invoke("fs:newFolder",   { parentPath, name }),
  newFile:           (parentPath, name)          => ipcRenderer.invoke("fs:newFile",     { parentPath, name }),
  rename:            (oldPath, newName)          => ipcRenderer.invoke("fs:rename",      { oldPath, newName }),
  deleteItem:        (itemPath, useTrash = true) => ipcRenderer.invoke("fs:delete",      { itemPath, useTrash }),
  duplicate:         (itemPath)                  => ipcRenderer.invoke("fs:duplicate",   { itemPath }),
  copyItem:          (srcPath, destDir)          => ipcRenderer.invoke("fs:copyItem",    { srcPath, destDir }),
  moveItem:          (srcPath, destDir)          => ipcRenderer.invoke("fs:moveItem",    { srcPath, destDir }),
  revealInExplorer:  (itemPath)                  => ipcRenderer.invoke("fs:revealInExplorer", { itemPath }),

  // ── Open file with editor ─────────────────────────────────────────────────
  openFile: (filePath, editorId) => ipcRenderer.invoke("fs:openFile", { filePath, editorId }),

  // ── Context menu ─────────────────────────────────────────────────────────
  // Returns a promise that resolves to { action, ... } or null (dismissed).
  showContextMenu: (type, itemPath, clipboardPath) =>
    ipcRenderer.invoke("contextMenu:show", { type, itemPath, clipboardPath }),

  // ── Settings ──────────────────────────────────────────────────────────────
  readSettings:  ()     => ipcRenderer.invoke("settings:read"),
  writeSettings: (data) => ipcRenderer.invoke("settings:write", data),

  // ── Editors ───────────────────────────────────────────────────────────────
  listEditors: () => ipcRenderer.invoke("editors:list"),

  // ── Menu events (main → renderer) ────────────────────────────────────────
  onMenuEvent: (channel, callback) => {
    const valid = ["menu:openProject","menu:newProject","menu:saveProject","menu:closeProject"];
    if (!valid.includes(channel)) return () => {};
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
});
