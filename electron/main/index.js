// Main process entry point
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require("electron");
const path = require("path");
const fs   = require("fs");

// ─── Settings persistence ─────────────────────────────────────────────────────
const SETTINGS_FILE = path.join(app.getPath("userData"), "settings.json");

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")); }
  catch { return {}; }
}
function writeSettings(data) {
  try { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2)); return true; }
  catch { return false; }
}

ipcMain.handle("settings:read",  () => readSettings());
ipcMain.handle("settings:write", (_e, data) => writeSettings(data));

// ─── Installed editors detection ─────────────────────────────────────────────
const KNOWN_EDITORS = [
  { id: "vscode",    label: "Visual Studio Code", commands: ["code"],         win: ["Code.exe"] },
  { id: "cursor",    label: "Cursor",             commands: ["cursor"],       win: ["Cursor.exe"] },
  { id: "windsurf",  label: "Windsurf",           commands: ["windsurf"],     win: ["Windsurf.exe"] },
  { id: "zed",       label: "Zed",                commands: ["zed"],          win: [] },
  { id: "sublime",   label: "Sublime Text",       commands: ["subl","sublime_text"], win: ["sublime_text.exe"] },
  { id: "npp",       label: "Notepad++",          commands: ["notepad++"],    win: ["notepad++.exe"] },
  { id: "webstorm",  label: "WebStorm",           commands: ["webstorm"],     win: ["webstorm64.exe","webstorm.exe"] },
  { id: "idea",      label: "IntelliJ IDEA",      commands: ["idea"],         win: ["idea64.exe","idea.exe"] },
  { id: "rider",     label: "Rider",              commands: ["rider"],        win: ["rider64.exe","rider.exe"] },
  { id: "vstudio",   label: "Visual Studio",      commands: ["devenv"],       win: ["devenv.exe"] },
  { id: "android",   label: "Android Studio",     commands: ["studio"],       win: ["studio64.exe"] },
  { id: "vim",       label: "Vim",                commands: ["vim"],          win: ["vim.exe"] },
  { id: "nvim",      label: "Neovim",             commands: ["nvim"],         win: ["nvim.exe"] },
  { id: "system",    label: "System Default",     commands: [],               win: [] },
];

function isCommandAvailable(cmd) {
  try {
    require("child_process").execSync(
      process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`,
      { stdio: "ignore" }
    );
    return true;
  } catch { return false; }
}

ipcMain.handle("editors:list", () => {
  return KNOWN_EDITORS.map((e) => {
    const available = e.id === "system" ||
      e.commands.some(isCommandAvailable);
    return { id: e.id, label: e.label, available };
  });
});

// ─── IPC: open file with editor ───────────────────────────────────────────────
ipcMain.handle("fs:openFile", async (_e, { filePath, editorId }) => {
  const editor = KNOWN_EDITORS.find((e) => e.id === editorId);
  if (!editor || editor.id === "system" || !editor.commands.length) {
    await shell.openPath(filePath);
    return;
  }
  const cmd = editor.commands[0];
  try {
    require("child_process").spawn(cmd, [filePath], { detached: true, stdio: "ignore" }).unref();
  } catch {
    await shell.openPath(filePath);
  }
});

// ─── IPC: open folder via native dialog ──────────────────────────────────────
ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ─── IPC: read directory — folders only ──────────────────────────────────────
ipcMain.handle("fs:readDir", async (_e, dirPath) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => ({ name: e.name, path: path.join(dirPath, e.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch { return []; }
});

// ─── IPC: read directory — folders + files ───────────────────────────────────
ipcMain.handle("fs:readDirAll", async (_e, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const folders = entries.filter((e) => e.isDirectory())
      .map((e) => ({ name: e.name, path: path.join(dirPath, e.name), isDir: true }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    const files = entries.filter((e) => e.isFile())
      .map((e) => ({ name: e.name, path: path.join(dirPath, e.name), isDir: false }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return [...folders, ...files];
  } catch { return []; }
});

// ─── IPC: filesystem operations ──────────────────────────────────────────────
ipcMain.handle("fs:newFolder", async (_e, { parentPath, name }) => {
  const target = path.join(parentPath, name || "New Folder");
  let final = target, i = 1;
  while (fs.existsSync(final)) final = `${target} (${i++})`;
  fs.mkdirSync(final, { recursive: true });
  return final;
});

ipcMain.handle("fs:newFile", async (_e, { parentPath, name }) => {
  const target = path.join(parentPath, name || "New File.txt");
  let final = target, i = 1;
  while (fs.existsSync(final)) {
    const { name: n, ext } = path.parse(target);
    final = path.join(parentPath, `${n} (${i++})${ext}`);
  }
  fs.writeFileSync(final, "");
  return final;
});

ipcMain.handle("fs:rename", async (_e, { oldPath, newName }) => {
  const newPath = path.join(path.dirname(oldPath), newName);
  fs.renameSync(oldPath, newPath);
  return newPath;
});

ipcMain.handle("fs:delete", async (_e, { itemPath, useTrash }) => {
  if (useTrash !== false) {
    await shell.trashItem(itemPath);
  } else {
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) fs.rmdirSync(itemPath, { recursive: true });
    else fs.unlinkSync(itemPath);
  }
  return true;
});

ipcMain.handle("fs:duplicate", async (_e, { itemPath }) => {
  const { dir, name, ext } = path.parse(itemPath);
  let dest = path.join(dir, `${name} copy${ext}`), i = 2;
  while (fs.existsSync(dest)) dest = path.join(dir, `${name} copy ${i++}${ext}`);
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    fs.cpSync(itemPath, dest, { recursive: true });
  } else {
    fs.copyFileSync(itemPath, dest);
  }
  return dest;
});

ipcMain.handle("fs:copyItem", async (_e, { srcPath, destDir }) => {
  const name = path.basename(srcPath);
  let dest = path.join(destDir, name), i = 2;
  while (fs.existsSync(dest)) dest = path.join(destDir, `${path.parse(name).name} (${i++})${path.extname(name)}`);
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) fs.cpSync(srcPath, dest, { recursive: true });
  else fs.copyFileSync(srcPath, dest);
  return dest;
});

ipcMain.handle("fs:moveItem", async (_e, { srcPath, destDir }) => {
  const dest = path.join(destDir, path.basename(srcPath));
  fs.renameSync(srcPath, dest);
  return dest;
});

ipcMain.handle("fs:revealInExplorer", (_e, { itemPath }) => {
  shell.showItemInFolder(itemPath);
});

// ─── IPC: vscode-icons icon resolver ─────────────────────────────────────────
const vsicons = require("vscode-icons-js");
const VSICONS_BASE = "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/";

ipcMain.handle("fs:getVscodeIcon", (_e, { name, isDir, isOpen }) => {
  try {
    const iconFile = isDir
      ? (isOpen ? vsicons.getIconForOpenFolder(name) : vsicons.getIconForFolder(name))
      : vsicons.getIconForFile(name);
    return VSICONS_BASE + iconFile;
  } catch {
    return VSICONS_BASE + (isDir ? "default_folder.svg" : "default_file.svg");
  }
});

// ─── IPC: native Windows shell icon ──────────────────────────────────────────
ipcMain.handle("fs:getIcon", async (_e, filePath) => {
  try {
    const icon = await app.getFileIcon(filePath, { size: "normal" });
    return icon.toDataURL();
  } catch { return null; }
});

// ─── IPC: context menu ───────────────────────────────────────────────────────
ipcMain.handle("contextMenu:show", (event, { type, itemPath, clipboardPath }) => {
  return new Promise((resolve) => {
    const send = (action, data = {}) => resolve({ action, ...data });

    let items;
    if (type === "folder") {
      items = [
        { label: "New Folder",              click: () => send("newFolder") },
        { label: "New File",                click: () => send("newFile") },
        { type: "separator" },
        { label: "Rename",                  click: () => send("rename") },
        { label: "Delete",                  click: () => send("delete") },
        { label: "Duplicate",               click: () => send("duplicate") },
        { type: "separator" },
        { label: "Copy",                    click: () => send("copy") },
        { label: "Cut",                     click: () => send("cut") },
        { label: "Paste", enabled: !!clipboardPath, click: () => send("paste") },
        { type: "separator" },
        { label: "Reveal in File Explorer", click: () => send("reveal") },
        { label: "Copy Path",               click: () => send("copyPath") },
        { label: "Refresh",                 click: () => send("refresh") },
      ];
    } else {
      items = [
        { label: "Open",                    click: () => send("open") },
        { label: "Open With...",            click: () => send("openWith") },
        { type: "separator" },
        { label: "Rename",                  click: () => send("rename") },
        { label: "Delete",                  click: () => send("delete") },
        { label: "Duplicate",               click: () => send("duplicate") },
        { type: "separator" },
        { label: "Copy",                    click: () => send("copy") },
        { label: "Cut",                     click: () => send("cut") },
        { label: "Paste", enabled: !!clipboardPath, click: () => send("paste") },
        { type: "separator" },
        { label: "Reveal in File Explorer", click: () => send("reveal") },
        { label: "Copy Path",               click: () => send("copyPath") },
      ];
    }

    const menu = Menu.buildFromTemplate(items);
    const win  = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, callback: () => resolve(null) });
  });
});

// ─── Helper ───────────────────────────────────────────────────────────────────
const sendToRenderer = (channel, payload) => {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, payload);
};

// ─── Settings window ──────────────────────────────────────────────────────────
let settingsWin = null;

function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 780,
    height: 520,
    minWidth: 600,
    minHeight: 400,
    title: "Settings",
    backgroundColor: "#1a1a1a",
    parent: BrowserWindow.getAllWindows()[0],
    modal: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, "../renderer/settings.html"));
  settingsWin.once("ready-to-show", () => settingsWin.show());
  settingsWin.on("closed", () => { settingsWin = null; });
}

// ─── App menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Project", accelerator: "CmdOrCtrl+O",
          click: async () => {
            const r = await dialog.showOpenDialog({ title: "Open Project", properties: ["openDirectory"] });
            if (!r.canceled && r.filePaths.length) sendToRenderer("menu:openProject", r.filePaths[0]);
          },
        },
        {
          label: "New Project", accelerator: "CmdOrCtrl+Shift+N",
          click: async () => {
            const r = await dialog.showOpenDialog({ title: "Select folder for new project", properties: ["openDirectory", "createDirectory"] });
            if (!r.canceled && r.filePaths.length) sendToRenderer("menu:newProject", r.filePaths[0]);
          },
        },
        { type: "separator" },
        { label: "Save Project", accelerator: "CmdOrCtrl+S",  click: () => sendToRenderer("menu:saveProject", null) },
        { type: "separator" },
        { label: "Close Project", accelerator: "CmdOrCtrl+W", click: () => sendToRenderer("menu:closeProject", null) },
        { label: "Close App",    accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "Settings",
      click: openSettingsWindow,
    },
  ];
  return Menu.buildFromTemplate(template);
}

// ─── Main window ──────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720,
    backgroundColor: "#0d0d0d",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu());
  createWindow();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
