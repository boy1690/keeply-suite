#!/usr/bin/env node
/**
 * Audit internal-link distribution against BWF P1.15 cluster strategy.
 *
 * P1.15 rules:
 *  - pillar articles must link to ≥3 of their cluster articles in-body
 *  - cluster articles must link to ≥1 their declared pillar (pillar_parent) in-body
 *  - standalone articles have no link requirement
 *
 * Output: JSON summary + per-violation list.
 * Exit code: 0 if no critical violations; 1 if any.
 *
 * Audits the English locale only (canonical content; translations
 * inherit link structure via Hugo's `ref` shortcode usage). For
 * per-locale link audit run with --locale=<code>.
 *
 * Run:
 *   node _dev/seo/audit-internal-links.js
 *   node _dev/seo/audit-internal-links.js --verbose
 *   node _dev/seo/audit-internal-links.js --locale=en
 */
'use strict';

const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.split('=')[0]));
const VERBOSE = args.has('--verbose');
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] || 'en';

const LOCALE_DIR = {
  en: 'content/english/post',
  'zh-tw': 'content/zh-tw/post',
  'zh-cn': 'content/zh-cn/post',
  ja: 'content/ja/post',
  ko: 'content/ko/post',
  it: 'content/it/post',
}[LOCALE];

if (!LOCALE_DIR) {
  console.error(`Unknown locale ${LOCALE}. Use one of: en, zh-tw, zh-cn, ja, ko, it`);
  process.exit(2);
}

function readFrontmatter(md) {
  md = md.replace(/\r\n/g, '\n');
  const m = md.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    out[kv[1]] = v;
  }
  return out;
}

function loadArticles() {
  const articles = {};
  if (!fs.existsSync(LOCALE_DIR)) return articles;
  const now = Date.now();
  for (const slug of fs.readdirSync(LOCALE_DIR)) {
    const dir = path.join(LOCALE_DIR, slug);
    const md = path.join(dir, 'index.md');
    if (!fs.existsSync(md) || !fs.statSync(dir).isDirectory()) continue;
    const text = fs.readFileSync(md, 'utf8').replace(/\r\n/g, '\n');
    const fm = readFrontmatter(text);
    if (fm.draft === 'true') continue;
    if (fm.date) {
      const t = Date.parse(fm.date);
      if (!Number.isNaN(t) && t > now) continue;
    }
    const body = text.replace(/^---\n[\s\S]+?\n---\n/, '');
    articles[slug] = { slug, dir, md, text, body, frontmatter: fm };
  }
  return articles;
}

function extractInternalLinks(article, allSlugs) {
  // Markdown: [text](url) — internal if URL is a relative blog path or absolute to blog.keeply.work
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const links = [];
  let m;
  while ((m = linkRe.exec(article.body)) !== null) {
    const url = m[2];
    let targetSlug = null;
    // Match /<locale>/post/<slug>/ or relative ../<slug>/ or {{< ref ... >}}-equivalent
    const mPath = url.match(/\/post\/([^/?#]+)\/?/);
    if (mPath) targetSlug = mPath[1];
    else if (url.startsWith('../') || url.match(/^\.\.?\//)) {
      const seg = url.split('/').filter(Boolean);
      const last = seg[seg.length - 1];
      if (allSlugs.has(last)) targetSlug = last;
    }
    if (targetSlug && allSlugs.has(targetSlug)) {
      links.push({ text: m[1], targetSlug });
    }
  }
  return links;
}

function classifyRole(article, clustersByPillar) {
  const fm = article.frontmatter;
  if (clustersByPillar[article.slug]?.length > 0) return 'pillar';
  if (fm.role === 'pillar') return 'pillar';
  if (fm.role === 'cluster' || fm.pillar_parent) return 'cluster';
  if (fm.role === 'standalone') return 'standalone';
  return 'standalone';
}

function main() {
  const articles = loadArticles();
  const allSlugs = new Set(Object.keys(articles));

  // Build cluster→pillar map
  const clustersByPillar = {};
  for (const [slug, a] of Object.entries(articles)) {
    const parent = a.frontmatter.pillar_parent;
    if (parent) {
      if (!clustersByPillar[parent]) clustersByPillar[parent] = [];
      clustersByPillar[parent].push(slug);
    }
  }

  const violations = [];
  const stats = { pillars: 0, clusters: 0, standalones: 0, total_internal_links: 0, orphans: 0 };

  for (const [slug, a] of Object.entries(articles)) {
    const role = classifyRole(a, clustersByPillar);
    const links = extractInternalLinks(a, allSlugs);
    const targets = new Set(links.map((l) => l.targetSlug));
    stats.total_internal_links += links.length;

    if (role === 'pillar') {
      stats.pillars++;
      const clusters = clustersByPillar[slug] || [];
      const linkedClusters = clusters.filter((c) => targets.has(c));
      if (linkedClusters.length < 3) {
        violations.push({
          severity: 'error',
          kind: 'pillar-undersupplied',
          slug,
          role: 'pillar',
          detail: `links to ${linkedClusters.length}/${clusters.length} declared clusters (need ≥3)`,
          declared_clusters: clusters,
          linked_clusters: linkedClusters,
        });
      }
    } else if (role === 'cluster') {
      stats.clusters++;
      const pillar = a.frontmatter.pillar_parent;
      if (!pillar) {
        violations.push({ severity: 'error', kind: 'cluster-no-pillar-declared', slug });
      } else if (!targets.has(pillar)) {
        violations.push({
          severity: 'error',
          kind: 'cluster-no-pillar-link',
          slug,
          role: 'cluster',
          declared_pillar: pillar,
          detail: `pillar_parent=${pillar} not linked in body`,
        });
      }
    } else {
      stats.standalones++;
    }

    if (links.length === 0 && role !== 'standalone') {
      stats.orphans++;
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    locale: LOCALE,
    articles_scanned: Object.keys(articles).length,
    ...stats,
    violations_total: violations.length,
    violations_by_kind: violations.reduce((acc, v) => { acc[v.kind] = (acc[v.kind] || 0) + 1; return acc; }, {}),
  };

  const out = VERBOSE ? { summary, violations } : { summary, sample: violations.slice(0, 10) };
  console.log(JSON.stringify(out, null, 2));
  process.exit(violations.length > 0 ? 1 : 0);
}

main();
