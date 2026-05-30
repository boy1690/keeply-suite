#!/usr/bin/env node
/**
 * sync-legal.js — Legal Portal sync (keeply.work/legal/*)
 *
 * Publishes a *selected subset* of the private `boy1690/law` repo's
 * `products/keeply/` documents into `apps/website/legal/`, so that:
 *   (1) Keeply's telemetry release-gate (Spec G) can `fetch()` the online
 *       law registry + the Cloudflare INV-8 evidence pack to clear the
 *       `policyPublished` + `dpaConfirmed` chains; and
 *   (2) Keeply's privacy policy can hyperlink to public governance / Art-30
 *       records (transparency; law-research §4 option 3 upgrade path).
 *
 * Design — drift-free projection, not a hand-edit:
 *   - Raw `.md` docs are copied byte-for-byte (fs.copyFileSync) so the
 *     Cloudflare evidence pack stays SHA-256 identical to the law source
 *     (the gate pins its hash).
 *   - `registry.json` is a *projected* artifact: the gate (`telemetry-release-gate.mjs`)
 *     reads `registry.privacy.current_version.status`, a shape the raw
 *     law/registry.json does NOT have. We derive that shape from the law
 *     privacy document's own front-matter — so status/version always track
 *     the law source of truth and never drift.
 *   - Only the keeply segment is published. LIA / DPIA / DPA-template and
 *     other clients are NEVER copied (internal-accountability docs).
 *
 * Idempotent: re-run any time the law docs change, then commit + push the
 * resulting `apps/website/legal/**` (manual sync — see LEGAL-PORTAL report).
 *
 * Usage:
 *   node _dev/sync-legal.js            # sync + emit registry, verify SHA
 *   LAW_REPO=/path/to/law node _dev/sync-legal.js
 *
 * Exit: 0 = ok · 1 = a hard check failed (SHA mismatch / missing source).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

// ── Paths ────────────────────────────────────────────────────────────────────
const WEBSITE_ROOT = path.resolve(__dirname, '..');
const LEGAL_DIR = path.join(WEBSITE_ROOT, 'legal');
// law repo: env override, else the in-suite private working copy at
// keeply-suite/legal-source/law (gitignored; its own .git → boy1690/law).
const LAW_REPO = process.env.LAW_REPO || path.resolve(WEBSITE_ROOT, '..', '..', 'legal-source', 'law');
const LAW_KEEPLY = path.join(LAW_REPO, 'products', 'keeply');

// ── What we publish ────────────────────────────────────────────────────────
// dest path is relative to LEGAL_DIR. Raw copies are byte-identical.
const RAW_DOCS = [
  // REQUIRED — telemetry gate dpaConfirmed chain (SHA-pinned below)
  { src: 'cloudflare-public-evidence-2026-05-30.md', dest: 'cloudflare-public-evidence-2026-05-30.md' },
  // RECOMMENDED — transparency + privacy hyperlink targets
  { src: 'governance/2026-05-26-telemetry-two-tier-consent.md', dest: 'governance/2026-05-26-telemetry-two-tier-consent.md' },
  { src: 'governance/2026-04-23-remove-ipapi-geolocation.md', dest: 'governance/2026-04-23-remove-ipapi-geolocation.md' },
  { src: 'art-30-processing-records.md', dest: 'art-30-processing-records.md' },
  { src: 'legal-review-equivalent-2026-05-30.md', dest: 'legal-review-equivalent-2026-05-30.md' },
];

// SHA-256 pin for the gate's dpaConfirmed chain. If the law source changes,
// this MUST be updated in lockstep with Keeply's .telemetry-release-gate.json.
const CF_EVIDENCE_FILE = 'cloudflare-public-evidence-2026-05-30.md';
const CF_EVIDENCE_SHA = '327dd53ae45f38b0ded2a1aaaa8b1f11dd293ca36ac83854de5c67e96207428d';

// Source privacy document whose front-matter drives the registry projection.
const PRIVACY_DOC = 'privacy-2026-05-26.md';

const BASE_URL = 'https://keeply.work/legal';

// ── helpers ──────────────────────────────────────────────────────────────────
function sha256(buf) { return createHash('sha256').update(buf).digest('hex'); }

/** Extract a scalar from a doc's YAML front-matter (first `--- … ---` block). */
function frontMatter(mdText) {
  const m = mdText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

function copyRaw(srcAbs, destAbs) {
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.copyFileSync(srcAbs, destAbs);
}

// ── main ───────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(LAW_KEEPLY)) {
    console.error(`[sync-legal] FATAL: law repo not found at ${LAW_KEEPLY}\n` +
      `  Set LAW_REPO=/abs/path/to/law and re-run.`);
    process.exit(1);
  }
  fs.mkdirSync(LEGAL_DIR, { recursive: true });

  // 1. Copy raw docs (byte-identical)
  const published = [];
  for (const { src, dest } of RAW_DOCS) {
    const srcAbs = path.join(LAW_KEEPLY, src);
    if (!fs.existsSync(srcAbs)) {
      console.error(`[sync-legal] FATAL: source missing: ${srcAbs}`);
      process.exit(1);
    }
    copyRaw(srcAbs, path.join(LEGAL_DIR, dest));
    published.push({ dest, url: `${BASE_URL}/${dest.replace(/\.md$/, '')}`, raw_url: `${BASE_URL}/${dest}` });
    console.log(`  copied  ${src}  →  legal/${dest}`);
  }

  // 2. Verify the SHA-pinned evidence pack survived the copy byte-for-byte
  const cfAbs = path.join(LEGAL_DIR, CF_EVIDENCE_FILE);
  const actualSha = sha256(fs.readFileSync(cfAbs));
  if (actualSha !== CF_EVIDENCE_SHA) {
    console.error(`[sync-legal] FATAL: SHA-256 mismatch on ${CF_EVIDENCE_FILE}\n` +
      `  expected ${CF_EVIDENCE_SHA}\n  actual   ${actualSha}\n` +
      `  (Either the law source changed — update the pin in this script AND in\n` +
      `   Keeply/.telemetry-release-gate.json — or the copy corrupted bytes.)`);
    process.exit(1);
  }
  console.log(`  SHA-256 verified on ${CF_EVIDENCE_FILE}: ${actualSha}`);

  // 3. Project registry.json into the shape the gate reads:
  //    registry.privacy.current_version.status
  const privacyFm = frontMatter(fs.readFileSync(path.join(LAW_KEEPLY, PRIVACY_DOC), 'utf8'));
  const lawRegistry = JSON.parse(fs.readFileSync(path.join(LAW_REPO, 'registry.json'), 'utf8'));
  const controller = lawRegistry?.products?.keeply?.controller ?? null;

  const registry = {
    _meta: {
      purpose: 'Keeply public legal registry — projection of boy1690/law products/keeply for the telemetry release-gate (Spec G) + public transparency.',
      generated_by: '_dev/sync-legal.js',
      source_of_truth: 'private repo boy1690/law (products/keeply)',
      note: 'Only the keeply segment is published; other clients and internal-accountability docs (LIA/DPIA/DPA-template) are not disclosed.',
      schema_for_gate: 'privacy.current_version.status === "published"',
    },
    privacy: {
      current_version: {
        version: privacyFm.version || null,
        status: privacyFm.status || null,         // projected from law privacy front-matter
        current_file: PRIVACY_DOC,
        last_updated: privacyFm.last_updated || null,
        languages: ['zh-TW', 'en'],
      },
      public_urls: {
        'zh-TW': 'https://keeply.work/privacy',
        en: 'https://keeply.work/en/privacy',
      },
    },
    controller,
    documents_published: published.map((p) => ({ file: p.dest, url: p.url, raw_url: p.raw_url })),
  };

  fs.writeFileSync(path.join(LEGAL_DIR, 'registry.json'), JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log(`  wrote   legal/registry.json  (privacy.current_version.status = "${registry.privacy.current_version.status}")`);

  // 4. Gate readiness summary
  console.log('\n[sync-legal] done.');
  if (registry.privacy.current_version.status !== 'published') {
    console.log(`  ⚠ policyPublished chain will FAIL: privacy status = "${registry.privacy.current_version.status}" (gate expects "published").`);
    console.log(`    The controller must mark privacy ${PRIVACY_DOC} as published in the law repo, then re-run this script.`);
  } else {
    console.log('  ✓ policyPublished chain ready (privacy status = published).');
  }
}

main();
