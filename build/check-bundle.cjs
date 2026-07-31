const fs = require('fs');
const bundle = fs.readFileSync('electron/renderer/bundle.js', 'utf8');

// Find how productIconTheme CSS is generated - look for the font loading chain
// The key: VSCode loads codicons via a CSS injection. Let's find where it injects @font-face
const faceIdx = bundle.indexOf('@font-face');
console.log('@font-face in bundle:', faceIdx > -1 ? bundle.slice(faceIdx-50, faceIdx+500) : 'NOT FOUND');

// Find the font file URL that gets passed at runtime
// Look for "codicon" near "url(" pattern
let s = 0, found = [];
while (found.length < 8) {
  const i = bundle.indexOf('"codicon"', s);
  if (i === -1) break;
  found.push(bundle.slice(Math.max(0,i-60), i+120));
  s = i+1;
}
console.log('\n"codicon" occurrences:', JSON.stringify(found, null, 2));
