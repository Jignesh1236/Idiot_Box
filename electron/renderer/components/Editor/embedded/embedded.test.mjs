// Smoke test for embedded language region detection + virtual document
// position mapping. Run via esbuild bundle + node (see README notes); the
// router's Monaco wiring is exercised by the running app.
//
//   npx esbuild electron/renderer/components/Editor/embedded/embedded.test.mjs \
//     --bundle --platform=node --format=cjs --outfile=<tmp>/embedded.test.cjs
//   node <tmp>/embedded.test.cjs

import {
  computeLineStarts,
  lineColAtOffset,
  offsetAtLineCol,
  hostConfigForExt,
  hostConfigForLanguage,
  detectEmbeddedRegions,
} from "./regions.js";
import {
  VirtualDocument,
  buildVirtualUri,
  virtualPathFor,
  parseVirtualPath,
  isVirtualUri,
} from "./virtual-document.js";

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ok  " + msg);
  else { failures++; console.error("FAIL  " + msg); }
};

// Fake Monaco model over the parent text.
const makeModel = (text) => {
  const starts = computeLineStarts(text);
  return {
    text,
    uri: { toString: () => "file:///C:/proj/index.html" },
    getValue: () => text,
    getOffsetAt: (pos) => offsetAtLineCol(starts, pos.lineNumber, pos.column),
    getPositionAt: (off) => {
      const lc = lineColAtOffset(text, starts, off);
      return { lineNumber: lc.line, column: lc.column };
    },
    getVersionId: () => 1,
    getLanguageId: () => "html",
  };
};

// ── Region detection: HTML ───────────────────────────────────────────────────
console.log("regions: html");
{
  const text = [
    "<!DOCTYPE html>",
    "<html>",
    "<!-- <script>var x = 1;</script> -->",
    "<head>",
    '  <style lang="scss">',
    "    $c: #fff;",
    "    body { color: $c; }",
    "  </style>",
    "</head>",
    "<body>",
    '<script lang="ts">',
    "  const n: number = 1;",
    "</script>",
    '<div title="a>b">text</div>',
    "</body>",
    "</html>",
  ].join("\n");

  const cfg = hostConfigForLanguage("html");
  ok(cfg && cfg.kind === "html", "html config resolved");
  const regions = detectEmbeddedRegions(text, "file:///C:/proj/index.html", cfg);
  ok(regions.length === 2, `found 2 embedded regions (got ${regions.length})`);
  ok(regions[0].languageId === "scss", `style region is scss (got ${regions[0].languageId})`);
  ok(regions[1].languageId === "typescript", `script region is typescript (got ${regions[1].languageId})`);

  const style = text.slice(regions[0].startOffset, regions[0].endOffset);
  ok(style.includes("$c: #fff;"), "style region content includes scss body");
  ok(!style.includes("style"), "style region content excludes tags");

  // The <script> inside the HTML comment must NOT be a region.
  const allContent = regions.map((r) => text.slice(r.startOffset, r.endOffset)).join("\n");
  ok(!allContent.includes("var x = 1"), "commented-out script is not tokenized as a region");

  const start = lineColAtOffset(text, computeLineStarts(text), regions[1].startOffset);
  ok(start.line === 11, `script region starts on line 11 (got ${start.line})`);
}

// ── Region detection: vue (template + script + style) ────────────────────────
console.log("regions: vue");
{
  const text = [
    "<template>",
    '  <div class="app">{{ msg }}</div>',
    "</template>",
    "<script setup lang=\"ts\">",
    "  const msg = 'hi';",
    "</script>",
    "<style scoped>",
    "  .app { color: red; }",
    "</style>",
  ].join("\n");
  const cfg = hostConfigForLanguage("vue");
  const regions = detectEmbeddedRegions(text, "file:///C:/proj/app.vue", cfg);
  ok(regions.length === 3, `vue found template+script+style (got ${regions.length})`);
  ok(regions[0].languageId === "html", `vue template is html (got ${regions[0].languageId})`);
  ok(regions[1].languageId === "typescript", `vue script is typescript (got ${regions[1].languageId})`);
  ok(regions[2].languageId === "css", `vue style is css (got ${regions[2].languageId})`);
  ok(hostConfigForExt(".vue").kind === "vue", "hostConfigForExt('.vue') works");
}

// ── Region detection: svelte ─────────────────────────────────────────────────
console.log("regions: svelte");
{
  const text = [
    "<script>",
    "  export let name = 'world';",
    "</script>",
    "<style>",
    "  h1 { color: blue; }",
    "</style>",
  ].join("\n");
  const regions = detectEmbeddedRegions(text, "file:///C:/proj/App.svelte", hostConfigForLanguage("svelte"));
  ok(regions.length === 2, `svelte found script+style (got ${regions.length})`);
  ok(regions[0].languageId === "javascript", "svelte script is javascript");
  ok(regions[1].languageId === "css", "svelte style is css");
}

// ── Unterminated block extends to EOF ────────────────────────────────────────
console.log("regions: unterminated");
{
  const text = "<html>\n<style>\nbody { color: red; }\n";
  const regions = detectEmbeddedRegions(text, "u", hostConfigForLanguage("html"));
  ok(regions.length === 1, "unterminated style still detected");
  ok(regions[0].endOffset === text.length, "unterminated style region extends to EOF");
}

// ── Virtual document mapping round-trip ──────────────────────────────────────
console.log("mapping: round-trip");
{
  const text = [
    "<html>",
    "<body>",
    "<style>",
    ".a { color: red; }",
    ".b { color: blue; }",
    "</style>",
    "</body>",
    "</html>",
  ].join("\n");
  const model = makeModel(text);
  const regions = detectEmbeddedRegions(text, model.uri.toString(), hostConfigForLanguage("html"));
  const region = regions[0];
  const content = text.slice(region.startOffset, region.endOffset);

  const vd = new VirtualDocument({
    uri: buildVirtualUri(model.uri.toString(), "css", 0),
    languageId: "css",
    parentModelUri: model.uri.toString(),
    parentPath: "C:\\proj\\index.html",
    startOffset: region.startOffset,
    endOffset: region.endOffset,
    text: content,
    index: 0,
  });

  // Position inside the css body ("color:" line).
  const parentPos = { lineNumber: 4, column: 6 }; // inside ".a { color"
  const vp = vd.toVirtualPosition(model, parentPos);
  const back = vd.toParentPosition(model, vp);
  ok(back.lineNumber === 4 && back.column === 6,
     `round-trip position (got ${back.lineNumber}:${back.column})`);

  // LSP position
  const lsp = vd.toLspPosition(model, parentPos);
  ok(lsp.line === 1, `lsp line is region-relative 1 (got ${lsp.line})`);

  // Range mapping (virtual LSP range -> parent Monaco range)
  const lr = { start: { line: 1, character: 2 }, end: { line: 1, character: 5 } };
  const pr = vd.toParentRangeFromLsp(model, lr);
  const vBack = vd.toLspRangeFromMonaco(model, pr);
  ok(vBack.start.line === 1 && vBack.start.character === 2 && vBack.end.line === 1 && vBack.end.character === 5,
     "range round-trip through LSP");

  // Virtual path helpers
  const vpath = virtualPathFor("C:\\proj\\index.html", "css", 0);
  const parsed = parseVirtualPath(vpath);
  ok(parsed && parsed.parentPath === "C:\\proj\\index.html" && parsed.languageId === "css" && parsed.index === 0,
     "virtualPathFor/parseVirtualPath round-trip");
  ok(isVirtualUri(buildVirtualUri(model.uri.toString(), "css", 0)), "isVirtualUri true for virtual uri");
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
