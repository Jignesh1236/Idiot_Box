const esbuild = require('esbuild');
const vscodeUrlFix = require('./vscode-url-fix.cjs');

esbuild
  .build({
    entryPoints: ['electron/renderer/index.jsx'],
    bundle: true,
    outfile: 'electron/renderer/bundle.js',
    platform: 'browser',
    loader: {
      '.css': 'css',
      '.jsx': 'jsx',
      '.svg': 'dataurl',
      '.png': 'dataurl',
      '.ttf': 'dataurl',
    },
    external: ['node:fs/promises', 'node:fs', 'node:path'],
    plugins: [vscodeUrlFix],
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
