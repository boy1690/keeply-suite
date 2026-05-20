#!/usr/bin/env node
/**
 * check-i18n-parity.js — CI/local i18n key-parity check for apps/website.
 *
 * Every locale in i18n/ must carry exactly the same key set as en.json
 * (the source of truth: a key added to en.json must exist in all others).
 * Reports missing/extra keys per locale and exits 1 on any drift.
 *
 * Tracked twin of the local PreToolUse gate (.claude/hooks/i18n-parity-gate.js),
 * which is gitignored and therefore unavailable to a fresh CI checkout.
 *
 * Usage: node apps/website/_dev/check-i18n-parity.js   (cwd-independent)
 * Exit:  0 = all locales in parity · 1 = drift
 */
const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'i18n');
const REF_LOCALE = 'en';
const MAX_SHOWN = 15;

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
}

function main() {
  const refPath = path.join(I18N_DIR, `${REF_LOCALE}.json`);
  if (!fs.existsSync(refPath)) {
    console.error(`check-i18n-parity: ${REF_LOCALE}.json not found at ${I18N_DIR}`);
    process.exit(1);
  }
  const refKeys = new Set();
  flatten(JSON.parse(fs.readFileSync(refPath, 'utf8')), '', refKeys);

  const files = fs.readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json') && f !== `${REF_LOCALE}.json`);

  const problems = [];
  for (const f of files) {
    const loc = f.replace(/\.json$/, '');
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, f), 'utf8')); }
    catch (e) { problems.push(`  ${loc} — invalid JSON: ${e.message}`); continue; }
    const keys = new Set();
    flatten(data, '', keys);
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));
    if (missing.length || extra.length) {
      const fmt = (a) => a.slice(0, MAX_SHOWN).join(', ') + (a.length > MAX_SHOWN ? ` …(+${a.length - MAX_SHOWN})` : '');
      const seg = [];
      if (missing.length) seg.push(`missing ${missing.length} [${fmt(missing)}]`);
      if (extra.length) seg.push(`extra ${extra.length} [${fmt(extra)}]`);
      problems.push(`  ${loc} — ${seg.join(' | ')}`);
    }
  }

  if (problems.length) {
    console.error(`❌ i18n parity: ${problems.length} locale(s) out of parity with ${REF_LOCALE}.json (${refKeys.size} keys).\n`);
    console.error(problems.join('\n'));
    console.error('\nFix: every locale must carry exactly en.json’s key set (add missing / remove extra).');
    process.exit(1);
  }
  console.log(`✅ i18n parity: all ${files.length + 1} locales match ${REF_LOCALE}.json (${refKeys.size} keys).`);
}

main();
