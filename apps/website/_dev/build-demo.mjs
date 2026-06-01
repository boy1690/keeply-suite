// Build apps/slides deck → apps/website/demo/ with vite base=/demo/.
// Direct absolute-path import bypasses package-exports resolution issues.
// Post-build: inject /demo/ → /demo/s/keeply-promo redirect because the
// open-slide router doesn't read vite base for its home route — a direct
// hit on /demo/ would otherwise land on open-slide's own 404 page.
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

// Post-build: inject root-path redirect into demo/index.html.
// Browser-side JS check so it works on every static host (no _redirects needed).
const idxPath = path.join(OUT_DIR, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
const SNIPPET = '<script>(function(){var p=location.pathname;if(p.endsWith("/"))p=p.slice(0,-1);if(p==="/demo"||p==="/demo/index")location.replace("/demo/s/keeply-promo"+location.search+location.hash);})();</script>';
if (!html.includes('/demo/s/keeply-promo')) {
  html = html.replace('<head>', '<head>\n    ' + SNIPPET);
  fs.writeFileSync(idxPath, html, 'utf8');
  console.log('[build-demo] injected /demo root redirect into index.html');
} else {
  console.log('[build-demo] redirect already present (no-op)');
}

console.log('[build-demo] done');
