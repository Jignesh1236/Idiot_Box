const esbuild = require("esbuild");
const webviewPreload = require.resolve("electron-chrome-extensions/preload").replace(/\\/g, "/");

esbuild
  .build({
    entryPoints: ["electron/preload/preload-entry.cjs"],
    bundle: true,
    outfile: "electron/preload/preload-bundle.cjs",
    platform: "node",
    format: "cjs",
    external: ["electron"],
    define: { __WEBVIEW_PRELOAD__: JSON.stringify(webviewPreload) },
    logLevel: "info",
  })
  .catch(() => process.exit(1));