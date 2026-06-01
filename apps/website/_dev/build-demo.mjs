// Build apps/slides deck → apps/website/demo/ with vite base=/demo/.
// Post-build:
//   1. Write /demo/router-reconcile.js (external — satisfies CSP `script-src 'self'`)
//      that handles /demo/ → default-deck redirect and /demo/s/<id> → strip prefix
//      so open-slide's internal router (which doesn't read vite base) sees /s/<id>.
//   2. Inject <script src="/demo/router-reconcile.js"></script> at top of <head>.
//   3. Pre-render deck folders /demo/s/<id>/index.html as clones of the patched
//      index.html so plain static hosts can serve deep links directly.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const SLIDES_DIR = path.resolve(__dirname, '../../slides');
const SLIDES_NM  = path.join(SLIDES_DIR, 'node_modules');
const OUT_DIR    = path.resolve(__dirname, '../demo');

const openSlideVitePath = path.join(SLIDES_NM, '@open-slide/core/dist/vite/index.js');
const vitePath          = path.join(SLIDES_NM, 'vite/dist/node/index.js');

if (!fs.existsSync(openSlideVitePath) || !fs.existsSync(vitePath)) {
  console.warn('[build-demo] apps/slides deps not installed — skipping demo build.');
  console.warn('[build-demo] run: `pnpm -C apps/slides install` then re-run build.');
  process.exit(0);
}

const { createViteConfig } = await import(pathToFileURL(openSlideVitePath).href);
const { build, mergeConfig } = await import(pathToFileURL(vitePath).href);

const baseCfg = await createViteConfig({ userCwd: SLIDES_DIR, mode: 'build' });
const cfg = mergeConfig(baseCfg, {
  base: '/demo/',
  build: { outDir: OUT_DIR, emptyOutDir: true, chunkSizeWarningLimit: 1024 },
});

console.log('[build-demo] slides =', SLIDES_DIR);
console.log('[build-demo] out    =', OUT_DIR);
console.log('[build-demo] base   =', cfg.base);

await build(cfg);

// ─── 1. Write external reconcile script ────────────────────────────────────
const RECONCILE_JS = '(function(){var p=location.pathname;var t=p.endsWith("/")&&p!=="/"?p.slice(0,-1):p;if(t==="/demo"||t==="/demo/index"){location.replace("/demo/s/keeply-promo"+location.search+location.hash);return;}if(t.indexOf("/demo/")===0){var s=t.substring(5);if(p.endsWith("/"))s+="/";history.replaceState(null,"",s+location.search+location.hash);}})();\n';
fs.writeFileSync(path.join(OUT_DIR, 'router-reconcile.js'), RECONCILE_JS, 'utf8');
console.log('[build-demo] wrote router-reconcile.js');

// ─── 2. Inject external <script> tag (CSP-safe) ────────────────────────────
const idxPath = path.join(OUT_DIR, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
const TAG = '<script src="/demo/router-reconcile.js"></script>';
if (!html.includes('/demo/router-reconcile.js')) {
  // strip any stale inline reconcile snippet from prior build
  html = html.replace(/<script id="open-slide-base-reconcile">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace('<head>', '<head>\n    ' + TAG);
  fs.writeFileSync(idxPath, html, 'utf8');
  console.log('[build-demo] wired external reconcile script into index.html');
}

// ─── 3. Pre-render deck folders ────────────────────────────────────────────
const slidesContentDir = path.join(SLIDES_DIR, 'slides');
const deckIds = fs.readdirSync(slidesContentDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
  .map(d => d.name);
for (const id of deckIds) {
  const destDir = path.join(OUT_DIR, 's', id);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(idxPath, path.join(destDir, 'index.html'));
  console.log('[build-demo] pre-rendered /demo/s/' + id + '/');
}

console.log('[build-demo] done');
