// Build apps/slides deck → apps/website/demo/ with vite base=/demo/.
// Direct absolute-path import bypasses package-exports resolution issues.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const SLIDES_DIR = path.resolve(__dirname, '../../slides');
const SLIDES_NM  = path.join(SLIDES_DIR, 'node_modules');
const OUT_DIR    = path.resolve(__dirname, '../demo');

// Direct internal-entry imports. open-slide internal relative imports + vite's
// own deps still resolve from their respective node_modules.
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
console.log('[build-demo] done');
