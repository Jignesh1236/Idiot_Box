const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

module.exports = {
  name: 'vscode-import-meta-url-fix',
  setup(build) {
    build.onLoad({ filter: /[\\/]node_modules[\\/]@codingame[\\/]/ }, (args) => {
      const contents = fs.readFileSync(args.path, 'utf8');
      if (!contents.includes('import.meta.url')) {
        return null;
      }
      const dir = path.dirname(args.path);
      const out = contents.replace(
        /new URL\(\s*(['"])((?:\.\/|\.\.\/)[^'"#?]+)\1\s*,\s*import\.meta\.url\s*\)/g,
        (_match, _quote, rel) => {
          const abs = path.resolve(dir, rel);
          if (!fs.existsSync(abs)) {
            return _match;
          }
          return `new URL(${JSON.stringify(pathToFileURL(abs).href)})`;
        }
      );
      return { contents: out, loader: 'js' };
    });
  },
};
