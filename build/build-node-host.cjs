const esbuild = require('esbuild');

// Phase B: REAL Node/Desktop Extension Host bundle (run by utilityProcess).
esbuild
  .build({
    entryPoints: ['electron/host/node-extension-host.js'],
    bundle: true,
    outfile: 'electron/host/node-extension-host.bundle.mjs',
    platform: 'node',
    format: 'esm',
    target: 'node18',
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
