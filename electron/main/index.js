// Main process entry point
const { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeImage, clipboard, protocol, net: electronNet, session } = require("electron");
const path    = require("path");
const fs      = require("fs");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");
const chokidar = require("chokidar");
const pty     = require("node-pty");
const esbuild = require("esbuild");
const { ElectronChromeExtensions } = require("electron-chrome-extensions");

// ─── Custom scheme: extension-host file access ───────────────────────────────
// The web-worker extension host runs in a sandboxed worker that cannot
// fetch(file://...) — serve extension files through this privileged scheme
// so workers can fetch() them like regular http resources.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "ppoo-file",
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
  },
]);

// ─── Component Bundling for Canvas/Preview ──────────────────────────────────
// Real module resolution: esbuild bundles the component with the project's
// node_modules (clsx, class-variance-authority, @radix-ui/*, react-day-picker,
// date-fns, ...) plus local imports and the "@" -> src alias, leaving only
// react/react-dom as externals. The renderer evals the CJS output with a
// sandbox require() that maps those to the host React.
const BUNDLE_CONCURRENCY = 4;
let bundleActive = 0;
const bundleQueue = [];
const nextBundle = async () => {
  while (bundleQueue.length && bundleActive < BUNDLE_CONCURRENCY) {
    const task = bundleQueue.shift();
    bundleActive++;
    try { task.resolve(await task.fn()); } catch (err) { task.reject(err); }
    bundleActive--;
  }
};
const queuedBundle = (fn) => new Promise((resolve, reject) => {
  bundleQueue.push({ fn, resolve, reject });
  nextBundle();
});

ipcMain.handle("component:bundle", async (_e, { source, filePath, projectRoot } = {}) => {
  if (typeof source !== "string" || !source.trim()) {
    return { ok: false, error: "Empty source" };
  }
  if (typeof filePath !== "string" || !filePath) {
    return { ok: false, error: "Missing file path" };
  }
  return queuedBundle(async () => {
    try {
      const srcDir = path.join(projectRoot || path.dirname(filePath), "src");
      const result = await esbuild.build({
        stdin: {
          contents: source,
          resolveDir: path.dirname(filePath),
          sourcefile: filePath,
          loader: "tsx",
        },
        bundle: true,
        format: "cjs",
        platform: "browser",
        target: "es2020",
        jsx: "automatic",
        loader: {
          ".css": "empty", ".scss": "empty", ".less": "empty", ".pcss": "empty",
          ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".gif": "dataurl", ".webp": "dataurl", ".svg": "dataurl",
        },
        external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
        alias: { "@": srcDir },
        absWorkingDir: projectRoot || path.dirname(filePath),
        write: false,
        logLevel: "silent",
        define: { "process.env.NODE_ENV": '"development"' },
      });
      return { ok: true, code: result.outputFiles[0].text };
    } catch (err) {
      const e = err?.errors?.[0];
      const loc = e?.location;
      const where = loc ? ` (${path.basename(loc.file || filePath)}:${loc.line}:${loc.column})` : "";
      return { ok: false, error: `${e?.text || err?.message || String(err)}${where}` };
    }
  });
});

// ─── Long path helper (Windows) ──────────────────────────────────────────────
const toLongPath = (p) => {
  if (process.platform !== "win32" || !p) return p;
  let n = p.replace(/\//g, "\\");
  if (n.startsWith("\\\\?\\")) return n;
  if (n.startsWith("\\\\")) return "\\\\?\\UNC\\" + n.slice(2);
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

// ─── Editors (open files externally) ──────────────────────────────────────────
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
  { id: "editor",   label: "Editor",               commands: []                     },
  { id: "system",   label: "System Default",       commands: []                     },
];
let _availableEditors = null;
const getAvailableEditors = () => {
  if (_availableEditors) return _availableEditors;
  const cmdExists = (cmd) => { try { require("child_process").execSync(process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`, { stdio: "ignore" }); return true; } catch { return false; } };
  _availableEditors = [
    { id: "editor", label: "Editor" },
    ...KNOWN_EDITORS
      .filter((e) => e.id !== "system" && e.id !== "editor" && e.commands.some(cmdExists))
      .map((e) => ({ id: e.id, label: e.label }))
  ];
  return _availableEditors;
};
ipcMain.handle("editors:list", () => getAvailableEditors().map((e) => ({ id: e.id, label: e.label, available: true })));

ipcMain.handle("fs:openFile", async (event, { filePath, editorId }) => {
  if (editorId === "editor") {
    try { event.sender.send("editor:openFile", { filePath }); } catch {}
    return;
  }
  const editor = KNOWN_EDITORS.find((e) => e.id === editorId);
  if (!editor || editor.id === "system" || !editor.commands.length) { await shell.openPath(filePath); return; }
  try { require("child_process").spawn(editor.commands[0], [filePath], { detached: true, stdio: "ignore" }).unref(); }
  catch { await shell.openPath(filePath); }
});

ipcMain.handle("fs:writeFile", async (_e, { filePath, text }) => {
  try {
    fs.writeFileSync(toLongPath(filePath), text, "utf8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs:saveFileAs", async (event, { filePath, text }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const defaultName = filePath ? filePath.replace(/.*[\\/]/, "") : "untitled.txt";
  const { canceled, filePath: newPath } = await dialog.showSaveDialog(win, {
    title: "Save As",
    defaultPath: defaultName,
  });
  if (canceled || !newPath) return { canceled: true };
  try {
    fs.writeFileSync(toLongPath(newPath), text, "utf8");
    return { canceled: false, path: newPath };
  } catch (err) {
    return { canceled: false, error: err.message };
  }
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

// ─── Project config (tabs state + pin config) ──────────────────────────────────
const PIN_DIR  = ".project_config";
const PIN_FILE = ".pinconfig";
const TABS_FILE = "tabs.json";

ipcMain.handle("projectConfig:readTabs", async (_e, rootPath) => {
  const filePath = path.join(rootPath, PIN_DIR, TABS_FILE);
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch { return null; }
});

ipcMain.handle("projectConfig:writeTabs", async (_e, rootPath, data) => {
  const dir = path.join(rootPath, PIN_DIR);
  const filePath = path.join(dir, TABS_FILE);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
});

// ─── Pin config ────────────────────────────────────────────────────────────────
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

// ─── Canvas (Visual Project Map) ──────────────────────────────────────────────
const CANVAS_EXT_RE        = /\.(jsx|tsx|js|ts|vue|svelte|html)$/i;
const CANVAS_EXCLUDE_DIRS  = new Set(["node_modules", "dist", "build", ".git", ".next", ".nuxt", ".output", ".cache", "coverage", "out"]);
const CANVAS_SCAN_NAMES    = ["pages", "components", "views", "widgets", "features", "ui"];
const CANVAS_LAYOUT_DIR    = ".canvas";
const CANVAS_LAYOUT_FILE   = "layout.json";

const detectFramework = (rootPath) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootPath, "package.json"), "utf8"));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    if (names.includes("next")) return "next";
    if (names.includes("react") || names.includes("react-dom")) return "react";
    if (names.includes("vue")) return "vue";
    if (names.includes("svelte")) return "svelte";
    if (names.includes("solid-js")) return "solid";
    if (names.includes("preact")) return "preact";
    if (names.includes("@angular/core")) return "angular";
    return "unknown";
  } catch { return "unknown"; }
};

// Iterative scan — no recursion, so deeply nested trees can't overflow the
// call stack on large projects. Each directory fails soft (permission errors,
// long paths) without aborting the whole scan.
const scanCanvasDir = (rootAbs, rootRel) => {
  const root = { name: path.basename(rootAbs), relPath: rootRel, absPath: rootAbs, groups: [], children: [] };
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(toLongPath(node.absPath), { withFileTypes: true })
        .filter((e) => !e.name.startsWith(".") && !CANVAS_EXCLUDE_DIRS.has(e.name));
    } catch { continue; }
    entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    for (const e of entries) {
      const childAbs = path.join(node.absPath, e.name);
      const childRel = node.relPath ? `${node.relPath}/${e.name}` : e.name;
      if (e.isDirectory()) {
        const g = { name: e.name, relPath: childRel, absPath: childAbs, groups: [], children: [] };
        node.groups.push(g);
        stack.push(g);
      } else if (CANVAS_EXT_RE.test(e.name)) {
        node.children.push({ name: e.name, relPath: childRel, absPath: childAbs, ext: e.name.slice(e.name.lastIndexOf(".")) });
      }
    }
  }
  return root;
};

ipcMain.handle("canvas:scan", async (_e, rootPath) => {
  try {
    if (!rootPath || !fs.existsSync(rootPath)) return null;
    const srcExists = fs.existsSync(path.join(rootPath, "src"));
    const roots = [];
    for (const name of CANVAS_SCAN_NAMES) {
      const cand = srcExists ? path.join(rootPath, "src", name) : path.join(rootPath, name);
      const final = srcExists && !fs.existsSync(cand) ? path.join(rootPath, name) : cand;
      if (fs.existsSync(final)) roots.push(scanCanvasDir(final, path.relative(rootPath, final).replace(/\\/g, "/")));
    }
    let count = 0;
    const tally = (n) => { count += n.children.length; n.groups.forEach(tally); };
    roots.forEach(tally);
    return { root: rootPath, framework: detectFramework(rootPath), roots, count };
  } catch (err) {
    return { error: err?.message || String(err) };
  }
});

ipcMain.handle("canvas:saveLayout", async (_e, rootPath, data) => {
  const dir = path.join(rootPath, CANVAS_LAYOUT_DIR);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, CANVAS_LAYOUT_FILE), JSON.stringify(data || {}, null, 2));
    return true;
  } catch { return false; }
});

ipcMain.handle("canvas:loadLayout", async (_e, rootPath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(rootPath, CANVAS_LAYOUT_DIR, CANVAS_LAYOUT_FILE), "utf8"));
  } catch { return null; }
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

  let finalDst = dst, i = 1;
  while (fs.existsSync(finalDst)) {
    const { dir, name, ext } = path.parse(dst);
    finalDst = path.join(dir, `${name} (${i++})${ext}`);
  }

  const parentDir = path.dirname(finalDst);
  if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

  fs.renameSync(src, finalDst);

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
  try { const s = fs.statSync(toLongPath(itemPath)); return { isDir: s.isDirectory(), exists: true, size: s.size, mtime: s.mtime, birthtime: s.birthtime }; }
  catch { return { isDir: false, exists: false }; }
});

ipcMain.handle("media:copyImage", async (_e, filePath) => {
  try {
    const img = nativeImage.createFromPath(toLongPath(filePath));
    clipboard.writeImage(img);
    return true;
  } catch {
    return false;
  }
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
const watchers = new Map();

function watcherKey(rootPath, wcId) { return `${rootPath}::${wcId}`; }

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
  if (watchers.has(key)) return;

  const debounce = makeDebouncer(200);

  const watcher = chokidar.watch(rootPath, {
    depth:             3,
    ignoreInitial:     true,
    ignored:           /(^|[/\\])\..|(node_modules)/,
    persistent:        true,
    usePolling:        false,
    awaitWriteFinish:  { stabilityThreshold: 100, pollInterval: 50 },
  });

  const notify = (changedPath) => {
    const affectedDir = fs.existsSync(changedPath) && fs.statSync(changedPath).isDirectory()
      ? changedPath
      : path.dirname(changedPath);

    debounce(affectedDir, () => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win && !win.isDestroyed() && !event.sender.isDestroyed()) {
        event.sender.send("fs:change", affectedDir, changedPath);
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

// ─── Browser webview context menu ────────────────────────────────────────────
ipcMain.handle("browser:webviewContextMenu", (event, { hasSelection, selectionText, linkURL, srcURL, isEditable, pageURL, x, y, webContentsId }) => {
  return new Promise((resolve) => {
    const act = (action, data) => resolve({ action, data });
    const sep = { type: "separator" };
    const items = [];

    if (linkURL) {
      items.push({ label: "Open Link in New Tab",  click: () => act("openLinkNewTab", { url: linkURL }) });
      items.push({ label: "Copy Link Address",     click: () => act("copyLink",       { url: linkURL }) });
      items.push(sep);
    }

    if (srcURL) {
      items.push({ label: "Open Image in New Tab", click: () => act("openImageNewTab", { url: srcURL }) });
      items.push({ label: "Copy Image Address",    click: () => act("copyImageURL",    { url: srcURL }) });
      items.push(sep);
    }

    if (hasSelection && selectionText) {
      items.push({ label: "Copy",                  accelerator: "Ctrl+C",  click: () => act("copy") });
      items.push({ label: `Search for "${selectionText.slice(0, 20)}${selectionText.length > 20 ? "…" : ""}"`, click: () => act("searchSelection", { text: selectionText }) });
      items.push(sep);
    }

    if (isEditable) {
      if (!hasSelection) items.push({ label: "Copy",    accelerator: "Ctrl+C",  click: () => act("copy")  });
      items.push({ label: "Paste",   accelerator: "Ctrl+V",  click: () => act("paste") });
      items.push({ label: "Cut",     accelerator: "Ctrl+X",  click: () => act("cut")   });
      items.push({ label: "Select All", accelerator: "Ctrl+A", click: () => act("selectAll") });
      items.push(sep);
    }

    items.push({ label: "Back",    click: () => act("back"),    enabled: true });
    items.push({ label: "Forward", click: () => act("forward"), enabled: true });
    items.push({ label: "Reload",  click: () => act("reload") });
    items.push(sep);

    items.push({ label: "Save Page As…", click: () => act("saveAs") });
    items.push({ label: "Print…",        click: () => act("print") });
    items.push(sep);

    // Chrome extension contextMenus
    if (chromeExt && webContentsId) {
      try {
        const wc = require("electron").webContents.fromId(webContentsId);
        const extItems = wc ? chromeExt.getContextMenuItems(wc, { linkURL, srcURL, selectionText, isEditable, editable: isEditable, pageURL, x, y }) : [];
        if (extItems && extItems.length) {
          items.push(sep);
          items.push(...extItems);
          items.push(sep);
        }
      } catch {}
    }

    items.push({ label: "View Page Source", click: () => act("viewSource", { url: pageURL }) });
    items.push({ label: "Inspect Element",  click: () => act("inspect", { x, y }) });

    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Browser tab context menu ─────────────────────────────────────────────────
ipcMain.handle("browser:tabContextMenu", (event) => {
  return new Promise((resolve) => {
    const act = (action) => resolve({ action });
    const items = [
      { label: "Settings",           click: () => act("settings") },
      { label: "Refresh",            click: () => act("refresh") },
    ];
    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Context menu ─────────────────────────────────────────────────────────────
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
    } else if (type === "file") {
      const openWithSubmenu = [
        { label: "System Default", accelerator: "Ctrl+Enter", click: () => act("openWithSystem") },
        { type: "separator" },
        { label: "Media Viewer",                          click: () => act("openInMediaViewer") },
      ];

      items = [
        { label: "Open",                    accelerator: "Enter",        click: () => act("open")     },
        { label: "Open in New Editor Tab",                               click: () => act("openInNewEditorTab") },
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
    } else if (type === "mediaViewer") {
      const filePath = selectedPaths?.[0] || "";
      const extName = path.extname(filePath).toLowerCase();
      const isImg = IMAGE_EXTS.includes(extName);
      items = [
        { label: "Zoom In (+25%)",           accelerator: "Ctrl+=",       click: () => act("zoomIn") },
        { label: "Zoom Out (-25%)",          accelerator: "Ctrl+-",       click: () => act("zoomOut") },
        { label: "Reset Zoom (100%)",        accelerator: "Ctrl+0",       click: () => act("resetZoom") },
        { label: "Fit to Screen",            accelerator: "F",            click: () => act("fitWindow") },
        sep,
        { label: "Rotate 90° Right",         accelerator: "R",            click: () => act("rotateRight") },
        { label: "Rotate 90° Left",          accelerator: "Shift+R",      click: () => act("rotateLeft") },
        { label: "Flip Horizontally",        accelerator: "H",            click: () => act("flipH") },
        { label: "Flip Vertically",          accelerator: "V",            click: () => act("flipV") },
        sep,
        { label: "Copy Image to Clipboard",  enabled: isImg,              click: () => act("copyImage") },
        { label: "Copy File Path",           accelerator: "Ctrl+Shift+C", click: () => act("copyPath") },
        { label: "Reveal in File Explorer",  accelerator: "Ctrl+Shift+R", click: () => act("reveal") },
        { label: "Open in System Default",   accelerator: "Enter",        click: () => act("openWithSystem") },
        sep,
        { label: "Close Media Viewer",       accelerator: "Esc",          click: () => act("close") },
      ];
    }

    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Terminal ─────────────────────────────────────────────────────────────────
const termProcesses = new Map();
let lastProjectPath = null;

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

ipcMain.handle("terminal:open", async (event, { tabId, cwd, forceRestart }) => {
  const key = termKey(event.sender, tabId);

  if (termProcesses.has(key)) {
    if (!forceRestart) return true;
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
      { label: "Copy",                  accelerator: "Ctrl+Shift+C", enabled: hasSelection, click: () => act("copy") },
      { label: "Paste",                 accelerator: "Ctrl+Shift+V",                       click: () => act("paste") },
      { type: "separator" },
      { label: "New Terminal Panel",     accelerator: "Ctrl+Shift+T",                        click: () => act("addPanel") },
      { label: "Split Right",           accelerator: "Ctrl+Shift+\\",                       click: () => act("splitRight") },
      { label: "Split Down",            accelerator: "Ctrl+Shift+-",                        click: () => act("splitDown") },
      { type: "separator" },
      { label: "Clear Terminal",        accelerator: "Ctrl+K",                              click: () => act("clear") },
      { label: "Restart Shell",         accelerator: "Ctrl+Shift+R",                        click: () => act("restart") },
      { label: "Close Panel",           accelerator: "Ctrl+W",                              click: () => act("close") },
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
const net = require("net");
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

// ─── Chrome extensions ──────────────────────────────────────────────────────
// Native session.extensions API + electron-chrome-extensions for
// chrome.tabs/windows/action/storage/... support in the browser webviews.
const EXTENSIONS_FILE = path.join(app.getPath("userData"), "extensions.json");
let chromeExt = null;
const pendingCreateTabs = [];   // FIFO of { url, resolve } awaiting webview attach
let lastGuestWc = null;
let lastGuestWin = null;

// The package instance exposes the session via `.ctx.session`.
function chromeExtensionsApi() {
  if (!chromeExt) return null;
  const ses = chromeExt.ctx?.session || session.defaultSession;
  return ses.extensions || ses;
}

function loadChromeExtensions() {
  if (!chromeExt) return;
  let entries = [];
  try { entries = JSON.parse(fs.readFileSync(EXTENSIONS_FILE, "utf8")); } catch { entries = []; }
  for (const e of entries) {
    const p = typeof e === "string" ? e : e?.path;
    if (!p || e?.enabled === false) continue;
    try { chromeExtensionsApi().loadExtension(p); } catch (err) { console.error("loadExtension failed:", p, err); }
  }
}

function readChromeExtensionEntries() {
  let entries = [];
  try { entries = JSON.parse(fs.readFileSync(EXTENSIONS_FILE, "utf8")); } catch { entries = []; }
  return entries;
}

function saveChromeExtensionEntry(entry) {
  let entries = readChromeExtensionEntries();
  const i = entries.findIndex((e) => (typeof e === "string" ? e === entry.path : e.path === entry.path));
  if (i >= 0) entries[i] = entry;
  else entries.push(entry);
  try { fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(entries, null, 2)); } catch {}
}

ipcMain.handle("chrome:loadExtension", async () => {
  const r = await dialog.showOpenDialog({
    title: "Load unpacked Chrome extension", properties: ["openDirectory"],
  });
  if (r.canceled || !r.filePaths.length || !chromeExt) return { ok: false };
  try {
    const ext = await chromeExtensionsApi().loadExtension(r.filePaths[0]);
    saveChromeExtensionEntry({ path: r.filePaths[0], id: ext.id, enabled: true });
    return { ok: true, id: ext.id, name: ext.name };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("chrome:listExtensions", () => {
  if (!chromeExt) return [];
  const out = [];
  try {
    const all = chromeExtensionsApi().getAllExtensions() || [];
    const entries = readChromeExtensionEntries();
    for (const ext of all) {
      const entry = entries.find((e) => typeof e === "object" && e.id === ext.id);
      out.push({
        id: ext.id,
        name: ext.name,
        version: ext.version,
        description: ext.manifest?.description || "",
        path: entry?.path || ext.path || "",
        enabled: entry ? entry.enabled !== false : true,
      });
    }
  } catch {}
  return out;
});

ipcMain.handle("chrome:setExtensionEnabled", async (_e, id, enabled) => {
  if (!chromeExt) return { ok: false };
  const entries = readChromeExtensionEntries();
  const entry = entries.find((e) => typeof e === "object" && e.id === id);
  if (!entry) return { ok: false, error: "Not found" };
  try {
    if (enabled) {
      const ext = await chromeExtensionsApi().loadExtension(entry.path);
      entry.id = ext.id;
    } else {
      chromeExtensionsApi().removeExtension(id);
    }
    entry.enabled = !!enabled;
    saveChromeExtensionEntry(entry);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("chrome:removeExtension", (_e, id) => {
  if (!chromeExt) return { ok: false };
  try { chromeExtensionsApi().removeExtension(id); } catch {}
  const entries = readChromeExtensionEntries().filter((e) => typeof e !== "object" || e.id !== id);
  try { fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(entries, null, 2)); } catch {}
  return { ok: true };
});

// ─── Settings window ──────────────────────────────────────────────────────────
let settingsWin = null;
function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 780, height: 520, minWidth: 600, minHeight: 400,
    title: "Settings", backgroundColor: "#1a1a1a",
    icon: path.join(__dirname, "../renderer/assets/idot_box.png"),
    parent: BrowserWindow.getAllWindows()[0], modal: false, show: false,
    webPreferences: { preload: path.join(__dirname, "../preload/index.js"), contextIsolation: true, nodeIntegration: false },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, "../renderer/settings.html"));
  settingsWin.once("ready-to-show", () => settingsWin.show());
  settingsWin.on("closed", () => { settingsWin = null; });
}

ipcMain.handle("settings:openWindow", () => openSettingsWindow());

// ─── App menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "File", submenu: [
        { label: "Open Project", accelerator: "CmdOrCtrl+O",       click: async () => { const r = await dialog.showOpenDialog({ title: "Open Project", properties: ["openDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:openProject", r.filePaths[0]); } } },
        { label: "New Project",  accelerator: "CmdOrCtrl+Shift+N", click: async () => { const r = await dialog.showOpenDialog({ title: "Select folder for new project", properties: ["openDirectory","createDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:newProject", r.filePaths[0]); } } },
        { type: "separator" },
        { label: "Load Extension…", click: () => sendToRenderer("menu:loadExtension", null) },
        { type: "separator" },
        { label: "Save",            accelerator: "CmdOrCtrl+S",          click: () => sendToRenderer("menu:saveFile", null) },
        { label: "Save As",         accelerator: "CmdOrCtrl+Shift+S",    click: () => sendToRenderer("menu:saveFileAs", null) },
        { label: "AutoSave", type: "checkbox", checked: false,           click: (item) => sendToRenderer("menu:toggleAutoSave", item.checked) },
        { type: "separator" },
        { label: "Save Project", click: () => sendToRenderer("menu:saveProject", null) },
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
    {
      label: "View", submenu: [
        { label: "Command Palette…", accelerator: "CmdOrCtrl+Shift+P", click: () => sendToRenderer("menu:commandPalette", null) },
      ],
    },
  ]);
}

// ─── Main window ──────────────────────────────────────────────────────────────
function createWindow() {
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
    icon: path.join(__dirname, "../renderer/assets/idot_box.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload-bundle.cjs"),
      contextIsolation: true, nodeIntegration: false, webviewTag: true,
    },
  });

  win.webContents.setBackgroundThrottling(false);

  // Register every browser webview as a chrome.tabs tab
  win.webContents.on("did-attach-webview", (_e, wc) => {
    lastGuestWc = wc; lastGuestWin = win;
    try { chromeExt?.addTab(wc, win); } catch {}
    wc.on("did-navigate", () => { try { chromeExt?.selectTab(wc); } catch {} });
    wc.on("focus",       () => { try { chromeExt?.selectTab(wc); } catch {} });
    const pending = pendingCreateTabs.shift();
    if (pending) pending.resolve([wc, win]);
  });

  // TEMP ext-host self-check (remove later)
  const checkLog = path.join(process.env.TEMP || "/tmp", "opencode", "ppoo-check.log");
  const checkErr = path.join(process.env.TEMP || "/tmp", "opencode", "ppoo-console-errors.log");
  win.webContents.on("console-message", (_e, level, message, line, sourceId) => {
    if (level >= 1) {
      try { fs.appendFileSync(checkErr, `[${level}] ${message} (${sourceId}:${line})\n`); } catch {}
    }
  });
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      try {
        const res = await win.webContents.executeJavaScript(`(async () => {
          const r1 = await fetch('file:///C:/Users/Jignesh/Downloads/New%20folder%20(8)/electron/renderer/extensions/demo-extension/package.json').then(r => r.status).catch(e => 'ERR:' + e.message);
          const r2 = await fetch('data:application/json,%7B%22x%22%3A1%7D').then(r => r.status).catch(e => 'ERR:' + e.message);
          return JSON.stringify({ fileFetch: r1, dataFetch: r2 });
        })()`);
        fs.appendFileSync(checkLog, "\nFETCHTEST " + res);
      } catch (e) {
        fs.appendFileSync(checkLog, "\nFETCHTEST ERR " + String(e));
      }
      for (let i = 0; i < 30; i++) {
        try {
          const res = await Promise.race([
            win.webContents.executeJavaScript(`(async () => {
            const m = window.__flexModel && window.__flexModel.current;
            let editorPaths = [];
            if (m) {
              const walk = (n) => {
                if (n.getType?.() === 'tab' && n.getComponent?.() === 'editor') editorPaths.push(n.getConfig?.()?.filePath || null);
                n.getChildren?.()?.forEach(walk);
              };
              walk(m.getRoot());
            }
            let ext = null;
            if (window.__ppooExtCheck) {
              try { ext = await window.__ppooExtCheck(); } catch (e) { ext = { err: String(e) }; }
            }
            return JSON.stringify({
              monaco: !!document.querySelector('.monaco-editor'),
              iframe: !!document.querySelector('iframe[src*=webWorkerExtensionHostIframe]'),
              editorPaths,
              ext,
              resources: performance.getEntriesByType('resource').map(e => e.name.split('/').pop()).slice(-12),
              rootChildren: document.getElementById('root') ? document.getElementById('root').children.length : -1,
            });
          })()`),
            new Promise((resolve) => setTimeout(() => resolve("POLLTIMEOUT"), 12000)),
          ]);
          fs.appendFileSync(checkLog, "\n" + (typeof res === "string" ? res : "POLLTIMEOUT"));
          const parsed = (() => { try { return JSON.parse(res); } catch { return {}; } })();
          if (parsed.ext?.commandResult && parsed.monaco) break;
        } catch (e) {
          fs.appendFileSync(checkLog, "\n" + JSON.stringify({ selfCheckError: String(e) }));
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      // Phase 2: open a real file and re-check editor still works
      try {
        const root = path.join(__dirname, "../..");
        const pj = path.join(root, "package.json");
        await win.webContents.executeJavaScript(`(() => {
          window.__currentProjectPath = ${JSON.stringify(root)};
          window.dispatchEvent(new CustomEvent("project:opened", { detail: { path: ${JSON.stringify(root)} } }));
          window.dispatchEvent(new CustomEvent("open-file-in-editor", { detail: { path: ${JSON.stringify(pj)} } }));
        })()`);
      } catch {}
      await new Promise((r) => setTimeout(r, 12000));
      try {
        const res = await win.webContents.executeJavaScript(`JSON.stringify({
          monaco: !!document.querySelector('.monaco-editor'),
          statusText: (document.body.innerText.match(/Ln \\d+, Col \\d+.*/) || [null])[0],
        })`);
        fs.appendFileSync(checkLog, "\nPHASE2 " + res);
      } catch (e) {
        fs.appendFileSync(checkLog, "\nPHASE2 " + JSON.stringify({ err: String(e) }));
      }
    }, 6000);
  });
  // END TEMP

  if (wasMaximized) win.maximize();
  win.show();

  win.loadFile(path.join(__dirname, "../renderer/index.html"));

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

app.whenReady().then(async () => {
  ElectronChromeExtensions.handleCRXProtocol(session.defaultSession);
  chromeExt = new ElectronChromeExtensions({
    license: "GPL-3.0",
    session: session.defaultSession,
    async createTab(details) {
      const url = details.url || "about:blank";
      const result = await new Promise((resolve) => {
        pendingCreateTabs.push({ url, resolve });
        sendToRenderer("chrome:createTab", url);
        setTimeout(() => resolve([lastGuestWc, lastGuestWin]), 4000);
      });
      return result;
    },
  });

  // Keep browser-action popup windows inside the app window so they don't
  // overlap the window's edges or the webview's right-side scrollbar, and
  // hold them hidden until the content size settles so they don't visibly
  // flicker/grow while loading.
  chromeExt.on("browser-action-popup-created", (popup) => {
    const pwin = popup?.browserWindow;
    const parent = popup?.parent;
    if (!pwin || !parent) return;

    let settleTimer = null;
    let settleShown = false;
    let suppressShow = true;
    let contentLoaded = false;

    const clamp = () => {
      try {
        if (pwin.isDestroyed() || parent.isDestroyed()) return;
        const pb = parent.getContentBounds();
        const wb = pwin.getBounds();
        const x = Math.max(pb.x, Math.min(wb.x, pb.x + pb.width - wb.width));
        const y = Math.max(pb.y, Math.min(wb.y, pb.y + pb.height - wb.height));
        if (x !== wb.x || y !== wb.y) pwin.setBounds({ ...wb, x, y });
      } catch {}
    };

    const showSettled = () => {
      if (settleShown || pwin.isDestroyed() || parent.isDestroyed()) return;
      settleShown = true;
      suppressShow = false;
      clamp();
      pwin.show();
    };

    const kickSettle = () => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(showSettled, 120);
    };

    const onLayoutChange = () => { clamp(); kickSettle(); };

    // Hide the initial premature show (library shows on first preferred-size-changed)
    pwin.on("show", () => {
      if (suppressShow) { try { pwin.hide(); } catch {} }
      if (!settleShown) kickSettle();
    });

    // Wait for content to fully load, then wait for size to stabilize
    pwin.webContents.on("did-finish-load", () => {
      contentLoaded = true;
      if (!settleShown) kickSettle();
    });

    // Also track resize/move for any post-load adjustments
    pwin.on("resize", onLayoutChange);
    pwin.on("move", onLayoutChange);
    if (typeof popup.on === "function") {
      popup.on("resized", onLayoutChange);
      popup.on("moved", onLayoutChange);
    }

    // Safety net: show anyway after 1s
    setTimeout(showSettled, 1000);
  });

  loadChromeExtensions();
  const PP_FILE_MIME = {
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".cjs": "text/javascript",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".map": "application/json",
    ".wasm": "application/wasm",
    ".txt": "text/plain",
    ".md": "text/plain",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
  };
  protocol.handle("ppoo-file", async (request) => {
    try {
      const url = new URL(request.url);
      const filePath = decodeURIComponent(url.pathname.replace(/^\/([A-Za-z]):/, (_m, d) => d.toUpperCase() + ":"));
      const res = await electronNet.fetch(pathToFileURL(filePath).toString());
      const headers = new Headers(res.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Content-Type", PP_FILE_MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream");
      return new Response(res.body, { status: res.status, headers });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
  getShell();
  Menu.setApplicationMenu(buildMenu());
  createWindow();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
