#!/usr/bin/env node
/**
 * Fetch Chrome User Experience Report (CrUX) field data for both Keeply origins.
 *
 * CrUX = real-user Web Vitals aggregated by Google from Chrome users.
 * Complements lab-only Lighthouse audit (unlighthouse) by exposing INP
 * (Interaction to Next Paint, dominant 2024+ Web Vital) — Lighthouse cannot
 * measure INP.
 *
 * Auth: API key via CRUX_API_KEY env. (CrUX API rejects OAuth user-tokens
 * with INVALID_ARGUMENT; key-only auth is the documented path.) Key is
 * restricted to chromeuxreport.googleapis.com only.
 *
 * Output: JSON to stdout. Per origin: per form-factor (phone/desktop) p75
 * for LCP / INP / CLS / FCP / TTFB plus the good/needs-improvement/poor
 * histogram density.
 *
 * 404 "chrome ux report data not found" = origin doesn't have enough
 * real-user Chrome traffic for CrUX to publish a dataset yet. Typical for
 * new sites; resolves once traffic crosses Google's (undocumented)
 * threshold of ~hundreds of unique Chrome users per 28-day window.
 */
'use strict';

const fs = require('fs');
const path = require('path');

function bootstrapKey() {
  if (process.env.CRUX_API_KEY) return;
  const envPath = path.join(__dirname, 'serpbear', '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  const m = text.match(/^CRUX_API_KEY=(.+)$/m);
  if (m) process.env.CRUX_API_KEY = m[1].replace(/^["']|["']$/g, '');
}
bootstrapKey();

const KEY = process.env.CRUX_API_KEY;
if (!KEY) {
  console.error('CRUX_API_KEY env not set (also tried _dev/seo/serpbear/.env)');
  process.exit(1);
}

const ORIGINS = [
  { url: 'https://blog.keeply.work', label: 'blog' },
  { url: 'https://keeply.work', label: 'main' },
];
const FORM_FACTORS = ['PHONE', 'DESKTOP'];

async function queryCrux(origin, formFactor) {
  const r = await fetch(
    `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, formFactor }),
    },
  );
  const text = await r.text();
  if (r.status === 404) return { status: 'no-crux-data' };
  if (!r.ok) return { error: `${r.status}: ${text.slice(0, 200)}` };
  return JSON.parse(text);
}

function summarize(record) {
  if (record.error || record.status) return record;
  const out = { collectionPeriod: record.record?.collectionPeriod, metrics: {} };
  const metrics = record.record?.metrics || {};
  for (const [key, val] of Object.entries(metrics)) {
    out.metrics[key] = {
      p75: val.percentiles?.p75,
      good: val.histogram?.[0]?.density,
      ni: val.histogram?.[1]?.density,
      poor: val.histogram?.[2]?.density,
    };
  }
  return out;
}

async function main() {
  const out = { generatedAt: new Date().toISOString(), origins: {} };
  for (const origin of ORIGINS) {
    out.origins[origin.label] = { origin: origin.url };
    for (const ff of FORM_FACTORS) {
      try {
        const raw = await queryCrux(origin.url, ff);
        out.origins[origin.label][ff.toLowerCase()] = summarize(raw);
      } catch (e) {
        out.origins[origin.label][ff.toLowerCase()] = { error: e.message };
      }
    }
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
