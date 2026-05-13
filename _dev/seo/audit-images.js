#!/usr/bin/env node
/**
 * Audit images across all locales' published articles.
 *
 * Checks per image:
 *  - alt text present + non-empty
 *  - alt text quality (not too short / not generic / not auto-truncated)
 *  - src file actually exists in the article's bundle directory
 *  - inline HTML <img> has loading="lazy" (markdown img is theme-handled)
 *
 * Per-article checks:
 *  - cover.svg + cover.png both exist (BWF P0 cover.mandatory)
 *
 * Output: JSON summary to stdout. Per-article issue list as `issues`.
 * Exit code: 0 if no critical issues; 1 if any (CI gate).
 *
 * Run:
 *   node _dev/seo/audit-images.js                # summary only
 *   node _dev/seo/audit-images.js --verbose      # full issue list
 *   node _dev/seo/audit-images.js --locale en    # one locale
 */
'use strict';

const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.split('=')[0]));
const VERBOSE = args.has('--verbose');
const LOCALE_FILTER = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1];

// Locale → content directory map. Keeply-blog quirk: en sits under content/english/
const LOCALES = {
  en: 'content/english/post',
  'zh-tw': 'content/zh-tw/post',
  'zh-cn': 'content/zh-cn/post',
  ja: 'content/ja/post',
  ko: 'content/ko/post',
  it: 'content/it/post',
  de: 'content/de/post',
  es: 'content/es/post',
  fr: 'content/fr/post',
  pt: 'content/pt/post',
  ru: 'content/ru/post',
  nl: 'content/nl/post',
  pl: 'content/pl/post',
  tr: 'content/tr/post',
  vi: 'content/vi/post',
  th: 'content/th/post',
  id: 'content/id/post',
  ar: 'content/ar/post',
  hi: 'content/hi/post',
};

// alt-text quality heuristics
const GENERIC_ALT = new Set([
  'image', 'screenshot', 'photo', 'picture', 'figure', 'illustration',
  '圖片', '截圖', '示意圖', '插圖',
  '画像', 'スクリーンショット',
  '이미지', '스크린샷',
  'immagine', 'foto', 'screenshot',
]);

function readFrontmatter(md) {
  // Normalize line endings (some content files are CRLF on Windows checkouts)
  md = md.replace(/\r\n/g, '\n');
  const m = md.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[kv[1]] = v;
  }
  return out;
}

function* walkArticles(localeDir) {
  if (!fs.existsSync(localeDir)) return;
  const now = Date.now();
  for (const slug of fs.readdirSync(localeDir)) {
    const dir = path.join(localeDir, slug);
    const md = path.join(dir, 'index.md');
    if (!fs.existsSync(md) || !fs.statSync(dir).isDirectory()) continue;
    const fm = readFrontmatter(fs.readFileSync(md, 'utf8'));
    // Skip draft + future-dated (Hugo skips these in production)
    if (fm.draft === 'true' || fm.draft === true) continue;
    if (fm.date) {
      const t = Date.parse(fm.date);
      if (!Number.isNaN(t) && t > now) continue;
    }
    yield { slug, dir, md };
  }
}

function parseImages(markdown) {
  const out = [];
  // Markdown img: ![alt](src)  — alt may be empty
  const mdRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = mdRe.exec(markdown)) !== null) {
    out.push({ kind: 'md', alt: m[1], src: m[2], idx: m.index });
  }
  // Inline HTML <img ...>
  const htmlRe = /<img\b[^>]*?>/gi;
  while ((m = htmlRe.exec(markdown)) !== null) {
    const tag = m[0];
    const alt = (tag.match(/\balt\s*=\s*["']([^"']*)["']/i) || [, null])[1];
    const src = (tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [, null])[1];
    const lazy = /\bloading\s*=\s*["']lazy["']/i.test(tag);
    out.push({ kind: 'html', alt, src, lazy, idx: m.index, raw: tag });
  }
  // Hugo figure shortcode {{< figure src="..." alt="..." >}}
  const figRe = /\{\{<\s*figure\s+([^>]+?)\s*>\}\}/g;
  while ((m = figRe.exec(markdown)) !== null) {
    const attrs = m[1];
    const alt = (attrs.match(/alt\s*=\s*["']([^"']*)["']/) || [, null])[1];
    const src = (attrs.match(/src\s*=\s*["']([^"']+)["']/) || [, null])[1];
    out.push({ kind: 'figure', alt, src, idx: m.index });
  }
  return out;
}

function isGenericAlt(alt) {
  if (!alt) return false;
  const lower = alt.trim().toLowerCase();
  if (GENERIC_ALT.has(lower)) return true;
  if (/^image[\s\-_]?\d+$/i.test(lower)) return true;
  if (/^fig[\s\-_]?\d+$/i.test(lower)) return true;
  if (/^screenshot[\s\-_]?\d+$/i.test(lower)) return true;
  return false;
}

function auditArticle(article, locale) {
  const issues = [];
  const md = fs.readFileSync(article.md, 'utf8');

  // Cover audit
  for (const cover of ['cover.svg', 'cover.png']) {
    if (!fs.existsSync(path.join(article.dir, cover))) {
      issues.push({ severity: 'error', kind: 'cover-missing', detail: cover });
    }
  }

  const images = parseImages(md);
  for (const img of images) {
    const ctx = { syntax: img.kind, src: img.src, alt: img.alt };
    // Alt text checks
    if (img.alt === null || img.alt === undefined) {
      issues.push({ severity: 'error', kind: 'alt-missing', ...ctx });
    } else if (img.alt.trim() === '') {
      issues.push({ severity: 'error', kind: 'alt-empty', ...ctx });
    } else if (img.alt.length < 8) {
      issues.push({ severity: 'warn', kind: 'alt-too-short', detail: `${img.alt.length} chars`, ...ctx });
    } else if (img.alt.length > 200) {
      issues.push({ severity: 'warn', kind: 'alt-too-long', detail: `${img.alt.length} chars`, ...ctx });
    } else if (img.alt.endsWith('…') || img.alt.endsWith('...')) {
      issues.push({ severity: 'warn', kind: 'alt-truncated', ...ctx });
    } else if (img.alt.length > 80 && !/[.!?。！？)）\]…」』"]$/.test(img.alt.trim())) {
      issues.push({ severity: 'warn', kind: 'alt-likely-truncated', detail: `ends "...${img.alt.slice(-30)}"`, ...ctx });
    } else if (isGenericAlt(img.alt)) {
      issues.push({ severity: 'warn', kind: 'alt-generic', ...ctx });
    }
    // Src existence (only for relative paths inside bundle)
    if (img.src && !/^https?:|^\//.test(img.src) && !img.src.startsWith('data:')) {
      const resolved = path.resolve(article.dir, img.src);
      if (!fs.existsSync(resolved)) {
        issues.push({ severity: 'error', kind: 'src-missing', ...ctx });
      }
    }
    // HTML img lazy-loading
    if (img.kind === 'html' && !img.lazy) {
      issues.push({ severity: 'warn', kind: 'html-img-no-lazy', ...ctx });
    }
  }

  return { locale, slug: article.slug, images: images.length, issues };
}

function main() {
  const allResults = [];
  for (const [locale, dir] of Object.entries(LOCALES)) {
    if (LOCALE_FILTER && locale !== LOCALE_FILTER) continue;
    for (const article of walkArticles(dir)) {
      allResults.push(auditArticle(article, locale));
    }
  }

  // Summary stats
  const byKind = {};
  let totalImages = 0;
  let articlesWithIssues = 0;
  let critical = 0;
  for (const r of allResults) {
    totalImages += r.images;
    if (r.issues.length) articlesWithIssues++;
    for (const i of r.issues) {
      byKind[i.kind] = (byKind[i.kind] || 0) + 1;
      if (i.severity === 'error') critical++;
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    locales_scanned: LOCALE_FILTER ? [LOCALE_FILTER] : Object.keys(LOCALES),
    articles_total: allResults.length,
    articles_with_issues: articlesWithIssues,
    images_total: totalImages,
    critical_issues: critical,
    by_kind: byKind,
  };

  const out = VERBOSE
    ? { summary, articles: allResults.filter((r) => r.issues.length) }
    : { summary, sample: allResults.filter((r) => r.issues.length).slice(0, 10) };

  console.log(JSON.stringify(out, null, 2));
  process.exit(critical > 0 ? 1 : 0);
}

main();
