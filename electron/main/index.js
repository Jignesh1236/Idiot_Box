// Main process entry point
const { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeImage } = require("electron");
const path    = require("path");
const fs      = require("fs");
const net     = require("net");
const { spawn } = require("child_process");
const chokidar = require("chokidar");
const pty     = require("node-pty");

// ─── Long path helper (Windows) ──────────────────────────────────────────────
const toLongPath = (p) => {
  if (process.platform !== "win32" || !p) return p;
  // Normalize forward slashes to backslashes
  let n = p.replace(/\//g, "\\");
  // Already has long-path prefix
  if (n.startsWith("\\\\?\\")) return n;
  // UNC path: \\server\share\... → \\?\UNC\server\share\...
  if (n.startsWith("\\\\")) return "\\\\?\\UNC\\" + n.slice(2);
  // Only apply \\?\ prefix for absolute paths longer than ~250 chars
  if (n.length >= 250 && path.isAbsolute(n) && !n.startsWith("\\\\?\\")) {
    return "\\\\?\\" + n;
  }
  return n;
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const SETTINGS_FILE = path.join(app.getPath("userData"), "settings.json");
const readSettings  = () => { try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")); } catch { return {}; } };
const writeSettings = (d) => { try { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(d, null, 2)); return true; } catch { return false; } };
ipcMain.handle("settings:read",  () => readSettings());
ipcMain.handle("settings:write", (_e, data) => writeSettings(data));

// ─── Browser extensions ─────────────────────────────────────────────────────────
const EXTENSIONS_FILE = path.join(app.getPath("userData"), "browser-extensions.json");
const readExtensions  = () => { try { return JSON.parse(fs.readFileSync(EXTENSIONS_FILE, "utf8")); } catch { return []; } };
const writeExtensions = (d) => { try { fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(d, null, 2)); return true; } catch { return false; } };
ipcMain.handle("extensions:read",   () => readExtensions());
ipcMain.handle("extensions:write",  (_e, data) => writeExtensions(data));

// ─── Editors ─────────────────────────────────────────────────────────────────
const KNOWN_EDITORS = [
  { id: "vscode",   label: "Visual Studio Code", commands: ["code"]               },
  { id: "cursor",   label: "Cursor",             commands: ["cursor"]             },
  { id: "windsurf", label: "Windsurf",           commands: ["windsurf"]           },
  { id: "zed",      label: "Zed",                commands: ["zed"]                },
  { id: "sublime",  label: "Sublime Text",       commands: ["subl","sublime_text"]},
  { id: "npp",      label: "Notepad++",          commands: ["notepad++"]          },
  { id: "webstorm", label: "WebStorm",           commands: ["webstorm"]           },
  { id: "idea",     label: "IntelliJ IDEA",      commands: ["idea"]               },
  { id: "rider",    label: "Rider",              commands: ["rider"]              },
  { id: "vstudio",  label: "Visual Studio",      commands: ["devenv"]             },
  { id: "android",  label: "Android Studio",     commands: ["studio"]             },
  { id: "vim",      label: "Vim",                commands: ["vim"]                },
  { id: "nvim",     label: "Neovim",             commands: ["nvim"]               },
  { id: "system",   label: "System Default",     commands: []                     },
];
let _availableEditors = null;
const getAvailableEditors = () => {
  if (_availableEditors) return _availableEditors;
  const cmdExists = (cmd) => { try { require("child_process").execSync(process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`, { stdio: "ignore" }); return true; } catch { return false; } };
  _availableEditors = KNOWN_EDITORS
    .filter((e) => e.id !== "system" && e.commands.some(cmdExists))
    .map((e) => ({ id: e.id, label: e.label }));
  return _availableEditors;
};
ipcMain.handle("editors:list", () => getAvailableEditors().map((e) => ({ id: e.id, label: e.label, available: true })));

ipcMain.handle("fs:openFile", async (_e, { filePath, editorId }) => {
  const editor = KNOWN_EDITORS.find((e) => e.id === editorId);
  if (!editor || editor.id === "system" || !editor.commands.length) { await shell.openPath(filePath); return; }
  try { require("child_process").spawn(editor.commands[0], [filePath], { detached: true, stdio: "ignore" }).unref(); }
  catch { await shell.openPath(filePath); }
});

ipcMain.handle("dialog:confirm", async (event, message) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { response } = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Cancel", "OK"],
    defaultId: 1,
    cancelId: 0,
    message,
  });
  return response === 1;
});

ipcMain.handle("dialog:alert", async (event, message) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  await dialog.showMessageBox(win, {
    type: "error",
    buttons: ["OK"],
    defaultId: 0,
    message,
  });
});

// ─── Dialog ───────────────────────────────────────────────────────────────────
ipcMain.handle("dialog:openFolder", async (event) => {
  const r = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (r.canceled || !r.filePaths.length) return null;
  const folderPath = r.filePaths[0];
  lastProjectPath = folderPath;
  event.sender.send("menu:openProject", folderPath);
  return folderPath;
});

// ─── Directory reads ──────────────────────────────────────────────────────────
const sortByName = (arr) => arr.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

ipcMain.handle("fs:readDir", async (_e, dirPath) => {
  try {
    return sortByName(fs.readdirSync(toLongPath(dirPath), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => ({ name: e.name, path: path.join(dirPath, e.name) })));
  } catch { return []; }
});

ipcMain.handle("fs:readDirAll", async (_e, dirPath) => {
  try {
    const entries = fs.readdirSync(toLongPath(dirPath), { withFileTypes: true });
    return [
      ...sortByName(entries.filter((e) => e.isDirectory()).map((e) => ({ name: e.name, path: path.join(dirPath, e.name), isDir: true }))),
      ...sortByName(entries.filter((e) => e.isFile()).map((e)      => ({ name: e.name, path: path.join(dirPath, e.name), isDir: false }))),
    ];
  } catch { return []; }
});

// ─── Pin config ────────────────────────────────────────────────────────────────
const PIN_DIR  = ".project_config";
const PIN_FILE = ".pinconfig";

ipcMain.handle("fs:readPinConfig", async (_e, rootPath) => {
  const filePath = path.join(rootPath, PIN_DIR, PIN_FILE);
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch {
    const exists = (name) => fs.existsSync(path.join(rootPath, name));
    return ["assets", "components"].filter(exists);
  }
});

ipcMain.handle("fs:writePinConfig", async (_e, rootPath, data) => {
  const dir  = path.join(rootPath, PIN_DIR);
  const filePath = path.join(dir, PIN_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

// ─── File system operations ───────────────────────────────────────────────────
ipcMain.handle("fs:newFolder", async (_e, { parentPath, name }) => {
  const lp = toLongPath(parentPath);
  let target = path.join(lp, name || "New Folder"), i = 1, final = target;
  while (fs.existsSync(final)) final = `${target} (${i++})`;
  fs.mkdirSync(final, { recursive: true }); return path.join(parentPath, path.basename(final));
});

ipcMain.handle("fs:newFile", async (_e, { parentPath, name }) => {
  const lp = toLongPath(parentPath);
  let target = path.join(lp, name || "New File.txt"), i = 1, final = target;
  while (fs.existsSync(final)) { const { name: n, ext } = path.parse(target); final = path.join(lp, `${n} (${i++})${ext}`); }
  fs.writeFileSync(final, ""); return path.join(parentPath, path.basename(final));
});

ipcMain.handle("fs:rename", async (_e, { oldPath, newName }) => {
  const po = toLongPath(oldPath);
  const np = path.join(path.dirname(po), newName);
  try { fs.renameSync(po, np); return path.join(path.dirname(oldPath), newName); }
  catch (err) { throw new Error(`Cannot rename "${path.basename(oldPath)}": ${err.code === "EBUSY" ? "file is in use by another process" : err.message}`); }
});

ipcMain.handle("fs:delete", async (_e, { itemPath }) => {
  const lp = toLongPath(itemPath);
  try {
    const s = fs.statSync(lp);
    if (s.isDirectory()) fs.rmSync(lp, { recursive: true, force: true });
    else fs.unlinkSync(lp);
    return true;
  } catch (err) {
    throw new Error(`Cannot delete "${path.basename(itemPath)}": ${err.code === "EBUSY" ? "item is in use by another process" : err.message}`);
  }
});

// ─── Local trash (project-level recycle bin) ──────────────────────────────
const TRASH_DIR = ".trash";
const MANIFEST  = "manifest.json";

function trashDir(rootPath) {
  return path.join(rootPath, TRASH_DIR);
}

function manifestPath(rootPath) {
  return path.join(trashDir(rootPath), MANIFEST);
}

function readManifest(rootPath) {
  try { return JSON.parse(fs.readFileSync(manifestPath(rootPath), "utf8")); }
  catch { return {}; }
}

function writeManifest(rootPath, manifest) {
  const td = trashDir(rootPath);
  if (!fs.existsSync(td)) fs.mkdirSync(td, { recursive: true });
  fs.writeFileSync(manifestPath(rootPath), JSON.stringify(manifest, null, 2));
}

ipcMain.handle("fs:trashItem", async (_e, { itemPath, rootPath }) => {
  const lpItem = toLongPath(itemPath);
  const lpRoot = toLongPath(rootPath);
  try {
    const name = path.basename(lpItem);
    const td   = trashDir(lpRoot);
    if (!fs.existsSync(td)) fs.mkdirSync(td, { recursive: true });

    let trashId = `${Date.now()}_${name}`;
    let dest    = path.join(td, trashId);
    let i = 1;
    while (fs.existsSync(dest)) {
      trashId = `${Date.now()}_${i++}_${name}`;
      dest    = path.join(td, trashId);
    }

    // If the item is inside .trash itself, skip (shouldn't happen, but safety)
    if (lpItem === td || lpItem.startsWith(td + path.sep)) {
      throw new Error("Cannot trash item inside .trash folder");
    }

    fs.renameSync(lpItem, dest);

    const manifest = readManifest(lpRoot);
    manifest[trashId] = { originalPath: itemPath, timestamp: Date.now(), isDir: fs.statSync(dest).isDirectory() };
    writeManifest(lpRoot, manifest);

    return { trashId, originalPath: itemPath };
  } catch (err) {
    throw new Error(`Cannot trash "${path.basename(itemPath)}": ${err.message}`);
  }
});

ipcMain.handle("fs:restoreTrashItem", async (_e, { trashId, rootPath }) => {
  const lpRoot = toLongPath(rootPath);
  const manifest = readManifest(lpRoot);
  const entry = manifest[trashId];
  if (!entry) throw new Error(`Trash entry "${trashId}" not found`);

  const src = path.join(trashDir(lpRoot), trashId);
  const dst = toLongPath(entry.originalPath);

  // If original location is occupied, add suffix
  let finalDst = dst, i = 1;
  while (fs.existsSync(finalDst)) {
    const { dir, name, ext } = path.parse(dst);
    finalDst = path.join(dir, `${name} (${i++})${ext}`);
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(finalDst);
  if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

  fs.renameSync(src, finalDst);

  // Remove from manifest
  delete manifest[trashId];
  writeManifest(lpRoot, manifest);

  return finalDst;
});

ipcMain.handle("fs:duplicate", async (_e, { itemPath }) => {
  const lp = toLongPath(itemPath);
  try {
    const { dir, name, ext } = path.parse(lp);
    let dest = path.join(dir, `${name} copy${ext}`), i = 2;
    while (fs.existsSync(dest)) dest = path.join(dir, `${name} copy ${i++}${ext}`);
    const s = fs.statSync(lp);
    if (s.isDirectory()) fs.cpSync(lp, dest, { recursive: true }); else fs.copyFileSync(lp, dest);
    return path.join(path.dirname(itemPath), path.basename(dest));
  } catch (err) {
    throw new Error(`Cannot duplicate "${path.basename(itemPath)}": ${err.message}`);
  }
});

ipcMain.handle("fs:copyItem", async (_e, { srcPath, destDir }) => {
  const lpSrc = toLongPath(srcPath);
  const lpDst = toLongPath(destDir);
  try {
    const name = path.basename(lpSrc);
    let dest = path.join(lpDst, name), i = 2;
    while (fs.existsSync(dest)) dest = path.join(lpDst, `${path.parse(name).name} (${i++})${path.extname(name)}`);
    const s = fs.statSync(lpSrc);
    if (s.isDirectory()) fs.cpSync(lpSrc, dest, { recursive: true }); else fs.copyFileSync(lpSrc, dest);
    return path.join(destDir, path.basename(dest));
  } catch (err) {
    throw new Error(`Cannot copy "${path.basename(srcPath)}": ${err.code === "EBUSY" ? "item is in use by another process" : err.message}`);
  }
});

ipcMain.handle("fs:moveItem", async (_e, { srcPath, destDir }) => {
  const lpSrc = toLongPath(srcPath);
  const lpDst = toLongPath(destDir);
  try {
    const dest = path.join(lpDst, path.basename(lpSrc));
    fs.renameSync(lpSrc, dest);
    return path.join(destDir, path.basename(srcPath));
  } catch (err) {
    throw new Error(`Cannot move "${path.basename(srcPath)}": ${err.code === "EBUSY" ? "item is in use by another process" : err.message}`);
  }
});

ipcMain.handle("fs:revealInExplorer", (_e, { itemPath }) => shell.showItemInFolder(itemPath));

ipcMain.handle("fs:stat", async (_e, itemPath) => {
  try { const s = fs.statSync(toLongPath(itemPath)); return { isDir: s.isDirectory(), exists: true }; }
  catch { return { isDir: false, exists: false }; }
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const vsicons   = require("vscode-icons-js");
const VSICONS_B = "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/";
ipcMain.handle("fs:getVscodeIcon", (_e, { name, isDir, isOpen }) => {
  try { return VSICONS_B + (isDir ? (isOpen ? vsicons.getIconForOpenFolder(name) : vsicons.getIconForFolder(name)) : vsicons.getIconForFile(name)); }
  catch { return VSICONS_B + (isDir ? "default_folder.svg" : "default_file.svg"); }
});
ipcMain.handle("fs:getIcon", async (_e, filePath) => {
  try { return (await app.getFileIcon(filePath, { size: "normal" })).toDataURL(); } catch { return null; }
});

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
const VIDEO_EXTS = [".mp4", ".webm", ".avi", ".mov", ".mkv", ".wmv", ".flv"];

ipcMain.handle("fs:getFilePreview", async (_e, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTS.includes(ext)) {
    try {
      const data = fs.readFileSync(toLongPath(filePath));
      if (data.length > 2 * 1024 * 1024) return { type: "image", data: null };
      const mime = ext === ".svg" ? "image/svg+xml"
        : ext === ".ico" ? "image/x-icon"
        : `image/${ext.slice(1)}`;
      return { type: "image", data: `data:${mime};base64,${data.toString("base64")}` };
    } catch { return null; }
  }
  if (VIDEO_EXTS.includes(ext)) return { type: "video" };
  return null;
});

ipcMain.handle("fs:readTextFile", async (_e, filePath) => {
  try { return fs.readFileSync(toLongPath(filePath), "utf8"); } catch { return null; }
});

ipcMain.handle("fs:readFileAsDataUrl", async (_e, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(toLongPath(filePath));
    if (data.length > 10 * 1024 * 1024) return null;
    const mime = ext === ".svg" ? "image/svg+xml"
      : ext === ".ico" ? "image/x-icon"
      : ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".gif" || ext === ".bmp" || ext === ".webp" ? `image/${ext.slice(1)}`
      : ext === ".mp4" ? "video/mp4"
      : ext === ".webm" ? "video/webm"
      : null;
    if (!mime) return null;
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch { return null; }
});

// ─── Chokidar filesystem watcher ─────────────────────────────────────────────
// Map: watchKey (rootPath:webContentsId) → chokidar.FSWatcher
const watchers = new Map();

function watcherKey(rootPath, wcId) { return `${rootPath}::${wcId}`; }

// Debounce helper per-directory — avoids flooding on bulk changes
function makeDebouncer(delay = 150) {
  const timers = new Map();
  return (key, fn) => {
    if (timers.has(key)) clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => { timers.delete(key); fn(); }, delay));
  };
}

ipcMain.handle("fs:watch", (event, rootPath) => {
  const wcId = event.sender.id;
  const key  = watcherKey(rootPath, wcId);
  if (watchers.has(key)) return; // already watching

  const debounce = makeDebouncer(200);

  const watcher = chokidar.watch(rootPath, {
    depth:             3,           // only watch 3 levels deep initially; shallow is cheap
    ignoreInitial:     true,        // don't fire for existing files on startup
    ignored:           /(^|[/\\])\..|(node_modules)/,  // skip hidden + node_modules
    persistent:        true,
    usePolling:        false,       // use native OS events, no polling
    awaitWriteFinish:  { stabilityThreshold: 100, pollInterval: 50 },
  });

  const notify = (changedPath) => {
    const affectedDir = fs.existsSync(changedPath) && fs.statSync(changedPath).isDirectory()
      ? changedPath
      : path.dirname(changedPath);

    debounce(affectedDir, () => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win && !win.isDestroyed() && !event.sender.isDestroyed()) {
        event.sender.send("fs:change", affectedDir);
      }
    });
  };

  watcher.on("add",       notify);
  watcher.on("unlink",    notify);
  watcher.on("addDir",    notify);
  watcher.on("unlinkDir", notify);
  watcher.on("change",    notify);

  watchers.set(key, watcher);
});

ipcMain.handle("fs:unwatch", async (event, rootPath) => {
  const key = watcherKey(rootPath, event.sender.id);
  const w   = watchers.get(key);
  if (w) { await w.close(); watchers.delete(key); }
});

// ─── Context menu ─────────────────────────────────────────────────────────────
// type:  "none" | "file" | "folder" | "multi"
// selectedPaths: string[]
// clipboardPaths: string[] | null
ipcMain.handle("contextMenu:show", (event, { type, selectedPaths = [], clipboardPaths = null }) => {
  return new Promise((resolve) => {
    const act = (action) => resolve({ action });
    const has = (n) => selectedPaths.length >= n;
    const sep = { type: "separator" };

    let items = [];

    if (type === "breadcrumb") {
      items = [
        { label: "Copy Path",               accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
        { label: "Copy Name",                                             click: () => act("copyName") },
        sep,
        { label: "Open in Terminal",                                     click: () => act("openInTerminal") },
        { label: "Reveal in File Explorer", accelerator: "Ctrl+Shift+R", click: () => act("reveal")   },
        sep,
        { label: "Refresh",                 accelerator: "F5",           click: () => act("refresh") },
      ];
    } else if (type === "none") {
      items = [
        { label: "New Folder",              accelerator: "Ctrl+Shift+N", click: () => act("newFolder") },
        { label: "New File",                accelerator: "Ctrl+N",       click: () => act("newFile")   },
        sep,
        { label: "Paste",                   accelerator: "Ctrl+V", enabled: !!(clipboardPaths?.length), click: () => act("paste") },
        sep,
        { label: "Reveal in File Explorer", accelerator: "Ctrl+Shift+R", click: () => act("reveal")  },
        { label: "Refresh",                 accelerator: "F5",           click: () => act("refresh") },
      ];
    } else if (type === "multi") {
      items = [
        { label: `Delete (${selectedPaths.length} items)`, accelerator: "Delete", click: () => act("delete") },
        sep,
        { label: "Copy",                    accelerator: "Ctrl+C", click: () => act("copy") },
        { label: "Cut",                     accelerator: "Ctrl+X", click: () => act("cut")  },
        sep,
        { label: "Copy Path",               accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
      ];
    } else if (type === "pinned") {
      items = [
        { label: "New Folder",              accelerator: "Ctrl+Shift+N", click: () => act("newFolder") },
        { label: "New File",                accelerator: "Ctrl+N",       click: () => act("newFile")   },
        sep,
        { label: "Open in Terminal",                                     click: () => act("openInTerminal") },
        sep,
        { label: "Unpin",                                                click: () => act("pinToSidebar") },
        sep,
        { label: "Rename",                  accelerator: "F2",           click: () => act("rename")    },
        { label: "Delete",                  accelerator: "Delete",       click: () => act("delete")    },
        { label: "Duplicate",               accelerator: "Ctrl+D",       click: () => act("duplicate") },
        sep,
        { label: "Copy",                    accelerator: "Ctrl+C",       click: () => act("copy") },
        { label: "Cut",                     accelerator: "Ctrl+X",       click: () => act("cut")  },
        { label: "Paste",                   accelerator: "Ctrl+V", enabled: !!(clipboardPaths?.length), click: () => act("paste") },
        sep,
        { label: "Reveal in File Explorer", accelerator: "Ctrl+Shift+R", click: () => act("reveal")   },
        { label: "Copy Path",               accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
        { label: "Refresh",                 accelerator: "F5",           click: () => act("refresh")  },
      ];
    } else if (type === "folder") {
      items = [
        { label: "New Folder",              accelerator: "Ctrl+Shift+N", click: () => act("newFolder") },
        { label: "New File",                accelerator: "Ctrl+N",       click: () => act("newFile")   },
        sep,
        { label: "Open in Terminal",                                     click: () => act("openInTerminal") },
        sep,
        { label: "Pin to sidebar",                                       click: () => act("pinToSidebar") },
        sep,
        { label: "Rename",                  accelerator: "F2",           click: () => act("rename")    },
        { label: "Delete",                  accelerator: "Delete",       click: () => act("delete")    },
        { label: "Duplicate",               accelerator: "Ctrl+D",       click: () => act("duplicate") },
        sep,
        { label: "Copy",                    accelerator: "Ctrl+C",       click: () => act("copy") },
        { label: "Cut",                     accelerator: "Ctrl+X",       click: () => act("cut")  },
        { label: "Paste",                   accelerator: "Ctrl+V", enabled: !!(clipboardPaths?.length), click: () => act("paste") },
        sep,
        { label: "Reveal in File Explorer", accelerator: "Ctrl+Shift+R", click: () => act("reveal")   },
        { label: "Copy Path",               accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
        { label: "Refresh",                 accelerator: "F5",           click: () => act("refresh")  },
      ];
    } else {
      const openWithSubmenu = [
        { label: "System Default", accelerator: "Ctrl+Enter", click: () => act("openWithSystem") },
        { type: "separator" },
        { label: "Media Viewer",                          click: () => act("openInMediaViewer") },
      ];

      items = [
        { label: "Open",                    accelerator: "Enter",        click: () => act("open")     },
        { label: "Open with", submenu: openWithSubmenu },
        sep,
        { label: "Rename",                  accelerator: "F2",           click: () => act("rename")    },
        { label: "Delete",                  accelerator: "Delete",       click: () => act("delete")    },
        { label: "Duplicate",               accelerator: "Ctrl+D",       click: () => act("duplicate") },
        sep,
        { label: "Copy",                    accelerator: "Ctrl+C",       click: () => act("copy") },
        { label: "Cut",                     accelerator: "Ctrl+X",       click: () => act("cut")  },
        { label: "Paste",                   accelerator: "Ctrl+V", enabled: !!(clipboardPaths?.length), click: () => act("paste") },
        sep,
        { label: "Reveal in File Explorer", accelerator: "Ctrl+Shift+R", click: () => act("reveal")   },
        { label: "Copy Path",               accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
      ];
    }

    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Terminal ─────────────────────────────────────────────────────────────────
// Each terminal process is keyed by senderId:tabId so multiple windows don't collide
const termProcesses = new Map();
let lastProjectPath = null; // track last opened project for terminal

function detectShell() {
  if (process.platform !== "win32") return process.env.SHELL || "/bin/bash";
  try { require("child_process").execSync("pwsh -c exit", { stdio: "ignore" }); return "pwsh.exe"; } catch {}
  try { require("child_process").execSync("powershell -c exit", { stdio: "ignore" }); return "powershell.exe"; } catch {}
  return process.env.COMSPEC || "cmd.exe";
}

let cachedShell = null;
function getShell() {
  if (!cachedShell) cachedShell = detectShell();
  return cachedShell;
}

function getShellArgs(shell) {
  if (shell === "pwsh.exe" || shell === "powershell.exe") return ["-NoLogo"];
  return [];
}

function termKey(sender, tabId) { return `${sender.id}:${tabId}`; }

ipcMain.handle("terminal:getProjectPath", () => lastProjectPath);

ipcMain.handle("terminal:open", async (event, { tabId, cwd }) => {
  const key = termKey(event.sender, tabId);
  if (termProcesses.has(key)) {
    termProcesses.get(key).kill();
    termProcesses.delete(key);
  }

  const shell = getShell();
  const shellArgs = getShellArgs(shell);
  const p = pty.spawn(shell, shellArgs, {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: cwd || process.cwd(),
    env: { ...process.env },
  });

  termProcesses.set(key, p);

  p.onData((data) => {
    try { event.sender.send("terminal:data", { tabId, data }); } catch {}
  });

  p.onExit(({ exitCode, signal }) => {
    if (termProcesses.get(key) === p) termProcesses.delete(key);
    try { event.sender.send("terminal:exit", { tabId, code: exitCode, signal }); } catch {}
  });

  return true;
});

ipcMain.handle("terminal:write", async (event, { tabId, data }) => {
  const p = termProcesses.get(termKey(event.sender, tabId));
  if (p) p.write(data);
});

ipcMain.handle("terminal:resize", async (event, { tabId, cols, rows }) => {
  const p = termProcesses.get(termKey(event.sender, tabId));
  if (p && cols > 0 && rows > 0) p.resize(cols, rows);
});

ipcMain.handle("terminal:close", async (event, { tabId }) => {
  const key = termKey(event.sender, tabId);
  const p = termProcesses.get(key);
  if (p) { p.kill(); termProcesses.delete(key); }
});

ipcMain.handle("terminal:contextMenu", (event, { hasSelection }) => {
  return new Promise((resolve) => {
    const act = (action) => resolve({ action });
    const items = [
      { label: "Copy",      accelerator: "Ctrl+Shift+C", enabled: hasSelection, click: () => act("copy") },
      { label: "Paste",     accelerator: "Ctrl+Shift+V",                       click: () => act("paste") },
      { type: "separator" },
      { label: "Kill Terminal",                                                 click: () => act("kill") },
      { label: "Restart",                                                       click: () => act("restart") },
    ];
    const menu = Menu.buildFromTemplate(items);
    const win = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

ipcMain.handle("terminal:tabContextMenu", (event) => {
  return new Promise((resolve) => {
    const act = (action) => resolve({ action });
    const items = [
      { label: "Kill Terminal",   click: () => act("kill") },
      { label: "Restart",         click: () => act("restart") },
      { type: "separator" },
      { label: "Rename Tab",      click: () => act("rename") },
      { type: "separator" },
      { label: "Close Tab",       click: () => act("close") },
    ];
    const menu = Menu.buildFromTemplate(items);
    const win = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Port scanner ────────────────────────────────────────────────────────────
const COMMON_PORTS = [3000, 3001, 5000, 5173, 8080, 8081, 4200, 8000, 3005, 3006];
function scanPorts() {
  return new Promise((resolve) => {
    const active = [];
    let remaining = COMMON_PORTS.length;
    if (!remaining) { resolve(active); return; }
    for (const port of COMMON_PORTS) {
      const s = net.createConnection({ port, host: "127.0.0.1", timeout: 600 });
      s.on("connect", () => { s.destroy(); active.push(port); checkDone(); });
      s.on("error", () => { s.destroy(); checkDone(); });
      s.on("timeout", () => { s.destroy(); checkDone(); });
      function checkDone() { if (--remaining <= 0) resolve(active.sort((a, b) => a - b)); }
    }
  });
}

ipcMain.handle("panel:addMenu", async (event) => {
  const ports = await scanPorts();
  return new Promise((resolve) => {
    const act = (action) => resolve({ action });
    const items = [
      { label: "Browser", click: () => act("browser") },
      { label: "Terminal", click: () => act("terminal") },
    ];
    if (ports.length) {
      items.push({ type: "separator" });
      items.push({ label: "Running Ports", enabled: false });
      for (const p of ports) {
        items.push({ label: `  http://localhost:${p}`, click: () => act(`port:${p}`) });
      }
    }
    const menu = Menu.buildFromTemplate(items);
    const win = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Native file drag ──────────────────────────────────────────────────────────
// IPC handler directly calls event.sender.startDrag() to initiate a native OS file
// drag. will-start-drag is unreliable for custom draggable elements (it only fires
// for <a> links and <img> elements), so we bypass it entirely.
const dragIcon = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAMlJREFUOE9jZBi4gBEDDxg/fvz4f/78+f+BGJQHU3MAiPkfKH6AiYH0AB8U/AfEDED8n5mB9ABGqHj8B+L/QMz7nxwXUJYF/xlI9wEzA+kBdFAA4gdENSHVBUxAg/8C8X8GBtIDiC4gxYVMFEQAy3+g4xmY6O8Coh2Ay4VMDAR4wZvk5QJqBAAjIwVcAAwW5v+BiQivCygNAHo4UCMAkIEB5QISTcCXCxguIDkEKB0AlAYA5VwAGn1UhwE12YDqAqTUC6gJAOq7gHQTMDXQ0gUA7VlTtGxCBnQAAAAASUVORK5CYII="
);

ipcMain.on("drag:startNative", (event, paths) => {
  try {
    if (paths?.length) {
      event.sender.startDrag({ files: paths, icon: dragIcon });
    }
  } catch (err) {
    console.error("startDrag failed:", err);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sendToRenderer = (channel, payload) => {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, payload);
};

// ─── Session restore ───────────────────────────────────────────────────────────
const SESSION_FILE = path.join(app.getPath("userData"), "session.json");

ipcMain.handle("session:save", (_e, data) => {
  try { fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2)); return true; } catch { return false; }
});

ipcMain.handle("session:load", () => {
  try { return JSON.parse(fs.readFileSync(SESSION_FILE, "utf8")); } catch { return null; }
});

// ─── Settings window ──────────────────────────────────────────────────────────
let settingsWin = null;
function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 780, height: 520, minWidth: 600, minHeight: 400,
    title: "Settings", backgroundColor: "#1a1a1a",
    parent: BrowserWindow.getAllWindows()[0], modal: false, show: false,
    webPreferences: { preload: path.join(__dirname, "../preload/index.js"), contextIsolation: true, nodeIntegration: false },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, "../renderer/settings.html"));
  settingsWin.once("ready-to-show", () => settingsWin.show());
  settingsWin.on("closed", () => { settingsWin = null; });
}

// ─── App menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "File", submenu: [
        { label: "Open Project", accelerator: "CmdOrCtrl+O",       click: async () => { const r = await dialog.showOpenDialog({ title: "Open Project", properties: ["openDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:openProject", r.filePaths[0]); } } },
        { label: "New Project",  accelerator: "CmdOrCtrl+Shift+N", click: async () => { const r = await dialog.showOpenDialog({ title: "Select folder for new project", properties: ["openDirectory","createDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:newProject", r.filePaths[0]); } } },
        { type: "separator" },
        { label: "Save Project",  accelerator: "CmdOrCtrl+S", click: () => sendToRenderer("menu:saveProject", null) },
        { type: "separator" },
        { label: "Close Project", accelerator: "CmdOrCtrl+W", click: () => { lastProjectPath = null; sendToRenderer("menu:closeProject", null); } },
        { type: "separator" },
        { label: "Open New Window", accelerator: "CmdOrCtrl+Shift+W", click: () => createWindow() },
        { label: "Close App",        accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    { label: "Settings", click: openSettingsWindow },
    {
      label: "Window", submenu: [
        { label: "Reset Window", accelerator: "CmdOrCtrl+R", click: () => sendToRenderer("menu:resetLayout", null) },
      ],
    },
  ]);
}

// ─── Main window ──────────────────────────────────────────────────────────────
function createWindow() {
  // Restore window state from session
  let winState = { width: 1280, height: 720 };
  let wasMaximized = false;
  try {
    const s = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
    if (s.window) {
      winState = { width: s.window.width || 1280, height: s.window.height || 720, x: s.window.x, y: s.window.y };
      wasMaximized = s.window.maximized || false;
    }
  } catch {}

  const win = new BrowserWindow({
    ...winState,
    backgroundColor: "#0d0d0d",
    show: false,
    webPreferences: { preload: path.join(__dirname, "../preload/index.js"), contextIsolation: true, nodeIntegration: false, webviewTag: true },
  });

  if (wasMaximized) win.maximize();
  win.show();

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
  win.webContents.openDevTools();

  // Save session on close — grabs layout JSON from renderer first
  win.on("close", async () => {
    try {
      const bounds = win.getBounds();
      const maximized = win.isMaximized();
      let layout = null;
      try { layout = await win.webContents.executeJavaScript("window.__getLayoutJSON()"); } catch {}
      const data = {
        window: { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y, maximized },
        layout,
      };
      fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
    } catch {}
  });
}

app.whenReady().then(() => { getShell(); Menu.setApplicationMenu(buildMenu()); createWindow(); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
