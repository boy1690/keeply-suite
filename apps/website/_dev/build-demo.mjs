// Build apps/slides deck → apps/website/demo/ with vite base=/demo/.
// Post-build:
//   1. Inject inline <script> that fixes the open-slide-router-vs-base mismatch:
//      - /demo/  or /demo/index → redirect to default deck /demo/s/keeply-promo
//      - /demo/s/<id>          → history.replaceState strips /demo prefix so
//        open-slide's internal router (which doesn't read vite base) sees /s/<id>
//        and matches the deck route.
//   2. Pre-render deck folders /demo/s/<id>/index.html (clones of the built
//      index.html) so plain static hosts (Python http.server, etc.) can serve
//      deep-link paths without needing SPA fallback rules.
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

// ─── 1. Inject router-base reconciliation snippet ───────────────────────────
const idxPath = path.join(OUT_DIR, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
const SNIPPET = '<script>(function(){var p=location.pathname;var t=p.endsWith("/")&&p!=="/"?p.slice(0,-1):p;if(t==="/demo"||t==="/demo/index"){location.replace("/demo/s/keeply-promo"+location.search+location.hash);return;}if(t.indexOf("/demo/")===0){var s=t.substring(5);if(p.endsWith("/"))s+="/";history.replaceState(null,"",s+location.search+location.hash);}})();</script>';
if (!html.includes('open-slide-base-reconcile')) {
  const tagged = SNIPPET.replace('<script>', '<script id="open-slide-base-reconcile">');
  html = html.replace('<head>', '<head>\n    ' + tagged);
  fs.writeFileSync(idxPath, html, 'utf8');
  console.log('[build-demo] injected /demo router-base reconcile script');
}

// ─── 2. Pre-render deck folders so deep links serve as real files ──────────
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
