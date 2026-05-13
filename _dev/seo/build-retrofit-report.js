#!/usr/bin/env node
/**
 * Render the GSC retrofit-queue JSON (from gsc-retrofit-queue.js) into a
 * weekly GitHub Issue body. Reads JSON from stdin or from
 * $SEO_DATA_DIR/gsc-retrofit.json; writes markdown to stdout.
 *
 * Companion to build-report.js. Kept separate so the retrofit Issue has a
 * focused scope — readers don't have to skip past traffic charts to get
 * to actionable rewrite candidates.
 */
'use strict';

const fs = require('fs');
const path = require('path');

function loadJson() {
  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let buf = '';
      process.stdin.on('data', (c) => (buf += c));
      process.stdin.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
      });
      process.stdin.on('error', reject);
    });
  }
  const dir = process.env.SEO_DATA_DIR || '/tmp/seo-data';
  const fp = path.join(dir, 'gsc-retrofit.json');
  return Promise.resolve(JSON.parse(fs.readFileSync(fp, 'utf8')));
}

const ACTION_LABEL = {
  TITLE_ADD: 'Title add',
  H2_ADD: 'H2 add',
  AMPLIFY: 'Amplify',
  SATURATED: 'Saturated',
  NO_ARTICLE: 'No article',
};

const ACTION_ORDER = ['TITLE_ADD', 'H2_ADD', 'AMPLIFY'];

function pct(n) { return (n * 100).toFixed(1) + '%'; }
function pos(n) { return n.toFixed(1); }

function renderArticle(a) {
  const score = a.candidates
    .filter((c) => c.action === 'TITLE_ADD' || c.action === 'H2_ADD')
    .reduce((s, c) => s + c.impressions, 0);
  const lines = [];
  lines.push(`### \`${a.locale}/${a.slug}\` — leverage ${score} impressions`);
  lines.push('');
  lines.push(`URL: ${a.pageUrl}`);
  lines.push('');

  // Group candidates by action.
  const grouped = {};
  for (const c of a.candidates) {
    (grouped[c.action] ||= []).push(c);
  }

  for (const action of ACTION_ORDER) {
    const items = grouped[action] || [];
    if (!items.length) continue;
    lines.push(`**${ACTION_LABEL[action]}** (${items.length})`);
    lines.push('');
    lines.push('| Query | Pos | Imp | Clicks | CTR | In body |');
    lines.push('|---|---|---|---|---|---|');
    for (const c of items) {
      const inBody = c.evidence.bodyCount > 0 ? `${c.evidence.bodyCount}×` : '—';
      lines.push(`| \`${c.query}\` | ${pos(c.position)} | ${c.impressions} | ${c.clicks} | ${pct(c.ctr)} | ${inBody} |`);
    }
    lines.push('');
  }

  if (a.good.length) {
    const top = a.good.slice(0, 3).map((g) => `\`${g.query}\` (pos ${pos(g.position)}, ${g.impressions} imp)`).join('; ');
    lines.push(`<sub>Already top-3: ${top}</sub>`);
    lines.push('');
  }
  if (a.saturated.length) {
    const sat = a.saturated.slice(0, 3).map((g) => `\`${g.query}\` (pos ${pos(g.position)})`).join('; ');
    lines.push(`<sub>Saturated (likely competitor gap, not retrofit): ${sat}</sub>`);
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const data = await loadJson();
  const lines = [];
  const win = data.window;
  const th = data.thresholds;
  const dayCount = Math.round((Date.parse(win.endDate) - Date.parse(win.startDate)) / 86400000);
  lines.push(`# SEO retrofit queue — ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push(`Window: ${win.startDate} → ${win.endDate} (${dayCount} days)`);
  lines.push('');
  lines.push(`Thresholds: position ${th.MIN_POS}–${th.MAX_POS}, ≥${th.MIN_IMP} impressions, top ${th.TOP_N} per article`);
  lines.push('');
  lines.push(`Coverage: ${data.totals.articlesWithData} articles with GSC data; ${data.totals.skippedNoUrlMatch} non-article URLs skipped; ${data.totals.articlesMissingContent} articles missing content/ files`);
  lines.push('');
  lines.push('## How to read this');
  lines.push('');
  lines.push('Each section is one article × locale, ranked by retrofit leverage (sum of TITLE_ADD + H2_ADD impressions).');
  lines.push('');
  lines.push('- **TITLE_ADD**: query missing from title + H2 + body. Highest leverage — usually a 30-min title rewrite + 1 paragraph addition lifts rank significantly.');
  lines.push('- **H2_ADD**: query is in body but neither title nor any H2 carries it. Add a subheading + 1–2 paragraphs covering it explicitly.');
  lines.push('- **AMPLIFY**: query is in title/H2 but body coverage is thin (≤1 mention). Expand the relevant section.');
  lines.push('- **Saturated**: query is everywhere in the article and we still rank 5–15. This is a *competitor / backlink / dwell-time* problem, not a content gap. Skip retrofit; flag for SOC / backlink work.');
  lines.push('');
  lines.push('## Articles');
  lines.push('');

  const withCandidates = data.articles.filter((a) => a.candidates.length > 0);
  const withoutCandidates = data.articles.filter((a) => a.candidates.length === 0);

  if (!withCandidates.length) {
    lines.push('_No retrofit candidates this week. Either everything is ranking top-3 or nothing is in the 5–15 zone yet._');
    lines.push('');
  } else {
    for (const a of withCandidates) lines.push(renderArticle(a));
  }

  if (withoutCandidates.length) {
    lines.push('## Articles with GSC data but no candidates');
    lines.push('');
    for (const a of withoutCandidates) {
      lines.push(`- \`${a.locale}/${a.slug}\` — ${a.good.length} top-3 queries, ${a.onRadar.length} on-radar (pos 16–30), ${a.saturated.length} saturated`);
    }
    lines.push('');
  }

  process.stdout.write(lines.join('\n'));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
