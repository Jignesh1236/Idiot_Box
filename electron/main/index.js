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

// ─── Browser extensions ───────────────────────────────────────────────────────
//
// Storage layout:
//   userData/
//     browser-extensions.json          ← array of extension metadata entries
//     browser-extensions/
//       <id>/                          ← unpacked extension directory
//         manifest.json
//         ...
//
// Metadata entry shape:
//   {
//     id          : string             ← "ext_<timestamp>"  (our stable key)
//     electronId  : string | null      ← id returned by session.loadExtension()
//     name        : string
//     version     : string
//     description : string
//     iconDataUrl : string | null      ← base64 data-url of best icon
//     unpackedDir : string             ← absolute path to unpacked dir
//     enabled     : boolean
//     loadError   : string | null      ← set when last load failed
//     addedAt     : number
//   }

const EXTENSIONS_BASE = path.join(app.getPath("userData"), "browser-extensions");
const EXTENSIONS_FILE = path.join(app.getPath("userData"), "browser-extensions.json");

const readExtensionsMeta  = () => { try { return JSON.parse(fs.readFileSync(EXTENSIONS_FILE, "utf8")); } catch { return []; } };
const writeExtensionsMeta = (d) => { try { fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(d, null, 2)); return true; } catch { return false; } };

// ── CRX unpacker ──────────────────────────────────────────────────────────────
// CRX3 format:
//   4 bytes  magic  "Cr24"
//   4 bytes  version (little-endian uint32) — expect 3
//   4 bytes  header size (little-endian uint32)
//   <header size> bytes  protobuf CrxFileHeader  (we skip; just need the ZIP)
//   rest     ZIP archive of the extension
//
// CRX2 format (legacy):
//   4 bytes  magic  "Cr24"
//   4 bytes  version (2)
//   4 bytes  pubkeyLen
//   4 bytes  sigLen
//   pubkeyLen bytes  public key
//   sigLen bytes     signature
//   rest     ZIP archive
function crxToZipBuffer(crxBuf) {
  const magic = crxBuf.slice(0, 4).toString("ascii");
  if (magic !== "Cr24") throw new Error("Not a valid CRX file (bad magic)");
  const version = crxBuf.readUInt32LE(4);
  if (version === 3) {
    const headerSize = crxBuf.readUInt32LE(8);
    return crxBuf.slice(12 + headerSize);
  } else if (version === 2) {
    const pubkeyLen = crxBuf.readUInt32LE(8);
    const sigLen    = crxBuf.readUInt32LE(12);
    return crxBuf.slice(16 + pubkeyLen + sigLen);
  }
  throw new Error(`Unsupported CRX version: ${version}`);
}

// ── ZIP extractor (pure Node — no extra dependency) ──────────────────────────
// We parse the ZIP End-of-Central-Directory record to find all entries and
// extract them safely (no path traversal).
function extractZipBuffer(zipBuf, destDir) {
  // Find End of Central Directory signature (0x06054b50)
  const EOCD_SIG = 0x06054b50;
  let eocdOffset = -1;
  for (let i = zipBuf.length - 22; i >= 0; i--) {
    if (zipBuf.readUInt32LE(i) === EOCD_SIG) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error("Invalid ZIP: EOCD not found");

  const cdOffset = zipBuf.readUInt32LE(eocdOffset + 16);
  const cdCount  = zipBuf.readUInt16LE(eocdOffset + 10);

  const CD_SIG = 0x02014b50;
  let pos = cdOffset;

  for (let i = 0; i < cdCount; i++) {
    if (zipBuf.readUInt32LE(pos) !== CD_SIG) break;
    const compMethod   = zipBuf.readUInt16LE(pos + 10);
    const compSize     = zipBuf.readUInt32LE(pos + 20);
    const uncompSize   = zipBuf.readUInt32LE(pos + 24);
    const fnLen        = zipBuf.readUInt16LE(pos + 28);
    const extraLen     = zipBuf.readUInt16LE(pos + 30);
    const commentLen   = zipBuf.readUInt16LE(pos + 32);
    const localOffset  = zipBuf.readUInt32LE(pos + 42);
    const filename     = zipBuf.slice(pos + 46, pos + 46 + fnLen).toString("utf8");
    pos += 46 + fnLen + extraLen + commentLen;

    // Security: prevent path traversal
    const safeName = filename.replace(/\\/g, "/").split("/").filter((p) => p && p !== ".." && p !== ".").join("/");
    if (!safeName) continue;
    const fullDest = path.join(destDir, safeName);
    if (!fullDest.startsWith(destDir + path.sep) && fullDest !== destDir) continue;

    if (filename.endsWith("/")) {
      // directory entry
      fs.mkdirSync(fullDest, { recursive: true });
      continue;
    }

    // Read local file header to find actual data offset
    const LFH_SIG = 0x04034b50;
    if (zipBuf.readUInt32LE(localOffset) !== LFH_SIG) continue;
    const lfhFnLen    = zipBuf.readUInt16LE(localOffset + 26);
    const lfhExtraLen = zipBuf.readUInt16LE(localOffset + 28);
    const dataOffset  = localOffset + 30 + lfhFnLen + lfhExtraLen;
    const compData    = zipBuf.slice(dataOffset, dataOffset + compSize);

    fs.mkdirSync(path.dirname(fullDest), { recursive: true });

    if (compMethod === 0) {
      // Stored (no compression)
      fs.writeFileSync(fullDest, compData);
    } else if (compMethod === 8) {
      // Deflate — use Node's built-in zlib (inflateRawSync)
      const { inflateRawSync } = require("zlib");
      fs.writeFileSync(fullDest, inflateRawSync(compData));
    } else {
      // Unsupported compression method — skip file
      console.warn(`[extensions] Skipping "${filename}": unsupported compression method ${compMethod}`);
    }
  }
}

// ── Locate manifest.json inside an extracted directory ───────────────────────
// Sometimes ZIP contains a single root folder; we dig one level if needed.
function findManifestDir(dir) {
  const direct = path.join(dir, "manifest.json");
  if (fs.existsSync(direct)) return dir;
  // Try one level deep
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const nested = path.join(dir, e.name, "manifest.json");
      if (fs.existsSync(nested)) return path.join(dir, e.name);
    }
  }
  return null;
}

// ── Read best icon as data-url ────────────────────────────────────────────────
function readExtensionIcon(manifestDir, manifest) {
  try {
    const icons = manifest.icons || manifest.action?.default_icon || {};
    const sizes = Object.keys(icons).map(Number).filter(Boolean).sort((a, b) => b - a);
    const iconFile = sizes.length ? icons[String(sizes[0])] : null;
    if (!iconFile) return null;
    const iconPath = path.join(manifestDir, iconFile);
    if (!fs.existsSync(iconPath)) return null;
    const ext  = path.extname(iconFile).toLowerCase();
    const mime = ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png"
      : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".ico" ? "image/x-icon" : null;
    if (!mime) return null;
    const data = fs.readFileSync(iconPath);
    if (data.length > 256 * 1024) return null; // skip oversized icons
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch { return null; }
}

// ── Load a single extension into the Electron session ────────────────────────
async function loadExtensionIntoSession(unpackedDir) {
  try {
    const { session } = require("electron");
    const ext = await session.defaultSession.loadExtension(unpackedDir, { allowFileAccess: true });
    return { ok: true, electronId: ext.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Unload a single extension from the Electron session ──────────────────────
function unloadExtensionFromSession(electronId) {
  if (!electronId) return;
  try {
    const { session } = require("electron");
    session.defaultSession.removeExtension(electronId);
  } catch (err) {
    console.warn("[extensions] unload failed:", err.message);
  }
}

// ── IPC: read list ────────────────────────────────────────────────────────────
ipcMain.handle("extensions:read", () => readExtensionsMeta());

// ── IPC: upload ZIP or CRX ────────────────────────────────────────────────────
ipcMain.handle("extensions:upload", async (_event, { name: _name, sourcePath }) => {
  try {
    fs.mkdirSync(EXTENSIONS_BASE, { recursive: true });

    const extname = path.extname(sourcePath).toLowerCase();
    if (extname !== ".zip" && extname !== ".crx") {
      return { success: false, error: "Only .zip and .crx files are supported" };
    }

    const safeId    = "ext_" + Date.now();
    const unpackDir = path.join(EXTENSIONS_BASE, safeId);
    fs.mkdirSync(unpackDir, { recursive: true });

    // Read source into buffer
    const srcBuf = fs.readFileSync(sourcePath);

    // For CRX: strip the CRX header to get the ZIP payload
    const zipBuf = extname === ".crx" ? crxToZipBuffer(srcBuf) : srcBuf;

    // Extract ZIP into unpackDir
    extractZipBuffer(zipBuf, unpackDir);

    // Locate manifest.json (may be inside a sub-folder)
    const manifestDir = findManifestDir(unpackDir);
    if (!manifestDir) {
      fs.rmSync(unpackDir, { recursive: true, force: true });
      return { success: false, error: "Invalid Extension: manifest.json not found" };
    }

    // Parse manifest
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, "manifest.json"), "utf8"));
    } catch (e) {
      fs.rmSync(unpackDir, { recursive: true, force: true });
      return { success: false, error: `Invalid manifest.json: ${e.message}` };
    }

    if (!manifest.manifest_version || !manifest.name) {
      fs.rmSync(unpackDir, { recursive: true, force: true });
      return { success: false, error: "Invalid manifest: missing required fields (manifest_version, name)" };
    }

    // If manifest was inside a sub-folder, move contents up so unpackDir IS the extension root
    if (manifestDir !== unpackDir) {
      const children = fs.readdirSync(manifestDir);
      for (const child of children) {
        fs.renameSync(path.join(manifestDir, child), path.join(unpackDir, child));
      }
      // Remove now-empty sub-folder
      try { fs.rmSync(manifestDir, { recursive: true, force: true }); } catch {}
    }

    // Read icon
    const iconDataUrl = readExtensionIcon(unpackDir, manifest);

    // Report unsupported permissions as warnings (non-blocking)
    const UNSUPPORTED = ["nativeMessaging","downloads","proxy","webRequest","declarativeNetRequest","devtools"];
    const permissions = [...(manifest.permissions || []), ...(manifest.optional_permissions || [])];
    const unsupported = permissions.filter((p) => UNSUPPORTED.includes(p));

    // Load into Electron session
    const loadResult = await loadExtensionIntoSession(unpackDir);

    const entry = {
      id:          safeId,
      electronId:  loadResult.ok ? loadResult.electronId : null,
      name:        manifest.name,
      version:     manifest.version || "?",
      description: manifest.description || "",
      iconDataUrl,
      unpackedDir,
      enabled:     true,
      loadError:   loadResult.ok ? null : loadResult.error,
      addedAt:     Date.now(),
      unsupportedPermissions: unsupported.length ? unsupported : undefined,
    };

    const list = readExtensionsMeta();
    list.push(entry);
    writeExtensionsMeta(list);

    return { success: true, entry };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: delete extension ─────────────────────────────────────────────────────
ipcMain.handle("extensions:delete", async (_e, { id }) => {
  try {
    const list  = readExtensionsMeta();
    const entry = list.find((e) => e.id === id);
    if (!entry) return true;

    // Unload from session
    if (entry.electronId) unloadExtensionFromSession(entry.electronId);

    // Remove unpacked directory
    if (entry.unpackedDir && fs.existsSync(entry.unpackedDir)) {
      try { fs.rmSync(entry.unpackedDir, { recursive: true, force: true }); } catch {}
    }

    writeExtensionsMeta(list.filter((e) => e.id !== id));
    return true;
  } catch { return false; }
});

// ── IPC: toggle extension enabled/disabled ────────────────────────────────────
ipcMain.handle("extensions:toggle", async (_e, { id }) => {
  try {
    const list  = readExtensionsMeta();
    const entry = list.find((e) => e.id === id);
    if (!entry) return { success: false, error: "Extension not found" };

    const willEnable = !entry.enabled;

    if (willEnable) {
      // Guard: unpackedDir must exist (old entries from pre-upgrade may lack it)
      if (!entry.unpackedDir || !fs.existsSync(path.join(entry.unpackedDir, "manifest.json"))) {
        entry.loadError = "Extension directory or manifest.json not found — please re-install this extension.";
        entry.enabled   = false;
        writeExtensionsMeta(list);
        return { success: true, entry };
      }
      const loadResult = await loadExtensionIntoSession(entry.unpackedDir);
      entry.enabled    = true;
      entry.electronId = loadResult.ok ? loadResult.electronId : entry.electronId;
      entry.loadError  = loadResult.ok ? null : loadResult.error;
    } else {
      if (entry.electronId) unloadExtensionFromSession(entry.electronId);
      entry.enabled   = false;
      entry.loadError = null;
    }

    writeExtensionsMeta(list);
    return { success: true, entry };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: load all saved extensions on startup ─────────────────────────────────
ipcMain.handle("extensions:loadAll", async () => {
  const list = readExtensionsMeta();
  let changed = false;

  for (const entry of list) {
    if (!entry.enabled) continue;

    // Guard: unpackedDir missing entirely (old pre-upgrade entry with only filePath/file)
    if (!entry.unpackedDir) {
      entry.loadError = "Extension was installed before the current version. Please remove and re-install it.";
      entry.enabled   = false;
      changed = true;
      continue;
    }

    // Guard: directory or manifest gone (deleted outside the app)
    if (!fs.existsSync(path.join(entry.unpackedDir, "manifest.json"))) {
      entry.loadError = "Extension directory or manifest.json not found";
      entry.enabled   = false;
      changed = true;
      continue;
    }

    // Backfill icon if missing
    if (!entry.iconDataUrl) {
      try {
        const m = JSON.parse(fs.readFileSync(path.join(entry.unpackedDir, "manifest.json"), "utf8"));
        entry.iconDataUrl = readExtensionIcon(entry.unpackedDir, m);
        changed = true;
      } catch {}
    }

    const loadResult = await loadExtensionIntoSession(entry.unpackedDir);
    entry.electronId = loadResult.ok ? loadResult.electronId : entry.electronId;
    entry.loadError  = loadResult.ok ? null : loadResult.error;
    changed = true;
  }

  if (changed) writeExtensionsMeta(list);
  return list;
});

// ── IPC: load an unpacked extension folder (user picks the manifest.json folder) ──
ipcMain.handle("extensions:loadUnpacked", async (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: "Select Unpacked Extension Folder (containing manifest.json)",
      properties: ["openDirectory"],
    });
    if (canceled || !filePaths.length) return { success: false, canceled: true };

    const srcDir = filePaths[0];
    const manifestPath = path.join(srcDir, "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      return { success: false, error: "Invalid Extension: manifest.json not found in selected folder" };
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (e) {
      return { success: false, error: `Invalid manifest.json: ${e.message}` };
    }

    if (!manifest.manifest_version || !manifest.name) {
      return { success: false, error: "Invalid manifest: missing required fields (manifest_version, name)" };
    }

    // Copy the folder into our managed extensions directory so it persists
    // even if the user moves/deletes the original folder.
    fs.mkdirSync(EXTENSIONS_BASE, { recursive: true });
    const safeId    = "ext_" + Date.now();
    const unpackDir = path.join(EXTENSIONS_BASE, safeId);
    fs.cpSync(srcDir, unpackDir, { recursive: true });

    // Read icon from the copied location
    const iconDataUrl = readExtensionIcon(unpackDir, manifest);

    // Unsupported permission warnings
    const UNSUPPORTED = ["nativeMessaging","downloads","proxy","webRequest","declarativeNetRequest","devtools"];
    const permissions = [...(manifest.permissions || []), ...(manifest.optional_permissions || [])];
    const unsupported = permissions.filter((p) => UNSUPPORTED.includes(p));

    // Load into Electron session
    const loadResult = await loadExtensionIntoSession(unpackDir);

    const entry = {
      id:          safeId,
      electronId:  loadResult.ok ? loadResult.electronId : null,
      name:        manifest.name,
      version:     manifest.version || "?",
      description: manifest.description || "",
      iconDataUrl,
      unpackedDir,
      enabled:     true,
      loadError:   loadResult.ok ? null : loadResult.error,
      addedAt:     Date.now(),
      unsupportedPermissions: unsupported.length ? unsupported : undefined,
    };

    const list = readExtensionsMeta();
    list.push(entry);
    writeExtensionsMeta(list);

    return { success: true, entry };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: open extension popup window ─────────────────────────────────────────
ipcMain.handle("extensions:openPopup", async (event, { extensionId, currentTabUrl }) => {
  try {
    const list  = readExtensionsMeta();
    const entry = list.find((e) => e.id === extensionId);
    if (!entry || !entry.enabled || !entry.electronId) {
      return { success: false, error: "Extension not loaded" };
    }

    // Read manifest to find popup page
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(entry.unpackedDir, "manifest.json"), "utf8"));
    } catch {
      return { success: false, error: "Could not read extension manifest" };
    }

    const popupPage = manifest.action?.default_popup
      || manifest.browser_action?.default_popup
      || manifest.page_action?.default_popup;

    if (!popupPage) {
      return { success: false, error: "Extension has no popup" };
    }

    // Build the chrome-extension:// URL for this popup
    const popupUrl = `chrome-extension://${entry.electronId}/${popupPage}`;

    const parentWin = BrowserWindow.fromWebContents(event.sender);
    const parentBounds = parentWin ? parentWin.getBounds() : { x: 200, y: 200, width: 1280, height: 720 };

    // Default popup size
    const PW = 350;
    const PH = 500;

    const popupWin = new BrowserWindow({
      width:  PW,
      height: PH,
      minWidth:  200,
      minHeight: 100,
      resizable: true,
      frame:     true,
      show:      false,
      title:     entry.name,
      backgroundColor: "#ffffff",
      // Position near top-right of parent (where extension button lives)
      x: Math.max(0, parentBounds.x + parentBounds.width - PW - 40),
      y: parentBounds.y + 80,
      parent: parentWin || undefined,
      modal:  false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration:  false,
        // Use the same session partition so extension APIs work
        session: require("electron").session.defaultSession,
      },
    });

    popupWin.setMenuBarVisibility(false);
    popupWin.loadURL(popupUrl);
    popupWin.once("ready-to-show", () => popupWin.show());

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: pick ZIP/CRX file via native dialog ──────────────────────────────────
ipcMain.handle("extensions:pickFile", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "Select Extension File",
    filters: [
      { name: "Extension Files", extensions: ["zip", "crx"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

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
  if (editorId === "editor" || editorId === "panel5") {
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

// ─── Browser webview context menu ────────────────────────────────────────────
ipcMain.handle("browser:webviewContextMenu", (event, { hasSelection, selectionText, linkURL, srcURL, isEditable, pageURL }) => {
  return new Promise((resolve) => {
    const act = (action, data) => resolve({ action, data });
    const sep = { type: "separator" };
    const items = [];

    // Link actions
    if (linkURL) {
      items.push({ label: "Open Link in New Tab",  click: () => act("openLinkNewTab", { url: linkURL }) });
      items.push({ label: "Copy Link Address",     click: () => act("copyLink",       { url: linkURL }) });
      items.push(sep);
    }

    // Image / media
    if (srcURL) {
      items.push({ label: "Open Image in New Tab", click: () => act("openImageNewTab", { url: srcURL }) });
      items.push({ label: "Copy Image Address",    click: () => act("copyImageURL",    { url: srcURL }) });
      items.push(sep);
    }

    // Selection
    if (hasSelection && selectionText) {
      items.push({ label: "Copy",                  accelerator: "Ctrl+C",  click: () => act("copy") });
      items.push({ label: `Search for "${selectionText.slice(0, 20)}${selectionText.length > 20 ? "…" : ""}"`, click: () => act("searchSelection", { text: selectionText }) });
      items.push(sep);
    }

    // Editable input
    if (isEditable) {
      if (!hasSelection) items.push({ label: "Copy",    accelerator: "Ctrl+C",  click: () => act("copy")  });
      items.push({ label: "Paste",   accelerator: "Ctrl+V",  click: () => act("paste") });
      items.push({ label: "Cut",     accelerator: "Ctrl+X",  click: () => act("cut")   });
      items.push({ label: "Select All", accelerator: "Ctrl+A", click: () => act("selectAll") });
      items.push(sep);
    }

    // Navigation
    items.push({ label: "Back",    click: () => act("back"),    enabled: true });
    items.push({ label: "Forward", click: () => act("forward"), enabled: true });
    items.push({ label: "Reload",  click: () => act("reload") });
    items.push(sep);

    // Page actions
    items.push({ label: "Save Page As…", click: () => act("saveAs") });
    items.push({ label: "Print…",        click: () => act("print") });
    items.push(sep);
    items.push({ label: "View Page Source", click: () => act("viewSource", { url: pageURL }) });
    items.push({ label: "Inspect Element",  click: () => act("inspect") });

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
      { type: "separator" },
      { label: "Extension Manager",  click: () => act("extensionManager") },
    ];
    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
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

ipcMain.handle("terminal:open", async (event, { tabId, cwd, forceRestart }) => {
  const key = termKey(event.sender, tabId);

  // If a PTY is already running for this tabId, don't kill it — just return.
  // The renderer now sends cd commands to change directory instead of
  // calling terminal:open again. Only kill when forceRestart is explicitly set
  // (e.g. from the context-menu "Restart" action).
  if (termProcesses.has(key)) {
    if (!forceRestart) return true; // reuse existing PTY
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

ipcMain.handle("settings:openWindow", () => openSettingsWindow());

// ─── App menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "File", submenu: [
        { label: "Open Project", accelerator: "CmdOrCtrl+O",       click: async () => { const r = await dialog.showOpenDialog({ title: "Open Project", properties: ["openDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:openProject", r.filePaths[0]); } } },
        { label: "New Project",  accelerator: "CmdOrCtrl+Shift+N", click: async () => { const r = await dialog.showOpenDialog({ title: "Select folder for new project", properties: ["openDirectory","createDirectory"] }); if (!r.canceled && r.filePaths.length) { lastProjectPath = r.filePaths[0]; sendToRenderer("menu:newProject", r.filePaths[0]); } } },
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

app.whenReady().then(async () => {
  getShell();
  Menu.setApplicationMenu(buildMenu());
  createWindow();
  // Load all previously-installed extensions into the default session on startup.
  // We do this AFTER createWindow so the session is fully initialised.
  try {
    const list = readExtensionsMeta();
    let changed = false;
    for (const entry of list) {
      if (!entry.enabled) continue;

      // Old pre-upgrade entry — lacks unpackedDir
      if (!entry.unpackedDir) {
        entry.loadError = "Extension was installed before the current version. Please remove and re-install it.";
        entry.enabled   = false;
        changed = true;
        continue;
      }

      if (!fs.existsSync(path.join(entry.unpackedDir, "manifest.json"))) {
        entry.loadError = "Extension directory or manifest.json not found";
        entry.enabled   = false;
        changed = true;
        continue;
      }

      // Backfill icon if missing (entries from before this upgrade)
      if (!entry.iconDataUrl) {
        try {
          const m = JSON.parse(fs.readFileSync(path.join(entry.unpackedDir, "manifest.json"), "utf8"));
          entry.iconDataUrl = readExtensionIcon(entry.unpackedDir, m);
          changed = true;
        } catch {}
      }
      const result = await loadExtensionIntoSession(entry.unpackedDir);
      entry.electronId = result.ok ? result.electronId : entry.electronId;
      entry.loadError  = result.ok ? null : result.error;
      changed = true;
    }
    if (changed) writeExtensionsMeta(list);
  } catch (err) {
    console.error("[extensions] startup load failed:", err);
  }
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
