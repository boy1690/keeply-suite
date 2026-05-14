#!/usr/bin/env node
// P1.15 Pillar ↔ Cluster 互連 audit + 成熟 cluster 偵測。
//
// P1.15 規定：
//   - cluster 必含 ≥1 in-body link 連回 pillar_parent
//   - pillar 必含 ≥3 in-body link 連到 cluster articles
//
// Audit 對 zh-tw locale（master）跑。其他 locale 結構應 mirror，但翻譯
// 過程偶爾會把 internal link 拿掉，這部分 v0.2 再加。
//
// 額外輸出：
//   (a) Role consistency — cluster 缺 pillar_parent / cluster 的 parent
//       slug 在 corpus 不存在 / 自身被 ≥3 article 指認為 parent 但 role
//       不是 pillar（implicit pillar suggestion）
//   (b) Mature-cluster suggestion — 同一 tag ≥5 article = 該寫一個
//       pillar 把它們收進來（Jerry 合併產文乘數）
//
// Run: node _dev/blog/internal-link-audit.js
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ZHTW_DIR = path.join(REPO_ROOT, 'content', 'zh-tw', 'post');

function parseFrontmatter(raw) {
  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd < 0) return null;
  const fm = raw.slice(4, fmEnd);
  const body = raw.slice(fmEnd + 4);
  const grab = (k) => {
    const m = fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'));
    if (!m) return '';
    let v = m[1].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"');
  };
  // tags can be `[a, b, c]` or block list; only inline form is used here
  const tagsRaw = grab('tags');
  let tags = [];
  if (tagsRaw) {
    const m = tagsRaw.match(/^\[(.+)\]$/);
    if (m) {
      tags = m[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }
  return {
    title: grab('title'),
    role: grab('role'),
    pillar_parent: grab('pillar_parent'),
    template: grab('template'),
    tags,
    body,
  };
}

// Extract in-body Hugo post links of the form `](/zh-tw/post/{slug}/)`.
// Locale filter to zh-tw; cross-locale references count as external.
function extractInternalLinks(body) {
  const links = new Set();
  const re = /\]\(\/zh-tw\/post\/([^/)]+)\/?\)/g;
  let m;
  while ((m = re.exec(body)) !== null) links.add(m[1]);
  return [...links];
}

function loadCorpus() {
  const corpus = new Map();
  const slugs = fs.readdirSync(ZHTW_DIR).filter((s) =>
    fs.statSync(path.join(ZHTW_DIR, s)).isDirectory()
  );
  for (const slug of slugs) {
    const fp = path.join(ZHTW_DIR, slug, 'index.md');
    if (!fs.existsSync(fp)) continue;
    const fm = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
    if (!fm) continue;
    corpus.set(slug, {
      slug,
      title: fm.title,
      role: fm.role,
      pillar_parent: fm.pillar_parent,
      template: fm.template,
      tags: fm.tags,
      links: extractInternalLinks(fm.body),
    });
  }
  return corpus;
}

function audit(corpus) {
  // Build reverse index: slug → [articles that declare this slug as parent]
  const reverseParent = new Map();
  for (const a of corpus.values()) {
    if (!a.pillar_parent) continue;
    if (!reverseParent.has(a.pillar_parent)) reverseParent.set(a.pillar_parent, []);
    reverseParent.get(a.pillar_parent).push(a.slug);
  }

  const findings = {
    pillarsMissingClusterLinks: [],
    clustersMissingPillarLink: [],
    clustersWithoutPillarParent: [],
    clustersWithBadPillarParent: [],
    implicitPillars: [],
    missingRoles: [],
    matureTags: [],
  };

  for (const a of corpus.values()) {
    // (1) pillar 必含 ≥3 cluster link
    if (a.role === 'pillar') {
      const expectedClusters = reverseParent.get(a.slug) || [];
      const actualLinks = a.links.filter((l) => corpus.has(l) && corpus.get(l).pillar_parent === a.slug);
      if (actualLinks.length < 3) {
        findings.pillarsMissingClusterLinks.push({
          slug: a.slug,
          declared_clusters: expectedClusters.length,
          in_body_cluster_links: actualLinks.length,
          missing: expectedClusters.filter((s) => !actualLinks.includes(s)),
        });
      }
    }

    // (2) cluster 必含 ≥1 pillar link
    if (a.role === 'cluster') {
      if (!a.pillar_parent) {
        findings.clustersWithoutPillarParent.push({ slug: a.slug });
      } else if (!corpus.has(a.pillar_parent)) {
        findings.clustersWithBadPillarParent.push({
          slug: a.slug,
          declared_parent: a.pillar_parent,
        });
      } else if (!a.links.includes(a.pillar_parent)) {
        findings.clustersMissingPillarLink.push({
          slug: a.slug,
          pillar: a.pillar_parent,
        });
      }
    }

    // (3) Implicit pillar: ≥3 articles declare this slug as parent but role ≠ pillar
    const incomingCount = (reverseParent.get(a.slug) || []).length;
    if (incomingCount >= 3 && a.role !== 'pillar') {
      findings.implicitPillars.push({
        slug: a.slug,
        incoming: incomingCount,
        current_role: a.role || '_(empty)_',
      });
    }

    // (4) Missing role: pillar_parent 也空白 + role 也空白 = unclear positioning
    if (!a.role && !a.pillar_parent) {
      findings.missingRoles.push({ slug: a.slug, tags: a.tags });
    }
  }

  // (5) Mature-cluster suggestion: count articles per tag, flag ≥5
  const tagCounts = new Map();
  for (const a of corpus.values()) {
    for (const t of a.tags) {
      if (!tagCounts.has(t)) tagCounts.set(t, []);
      tagCounts.get(t).push(a.slug);
    }
  }
  for (const [tag, slugs] of tagCounts.entries()) {
    if (slugs.length >= 5) {
      // Has a pillar that covers this topic already?
      const pillarsInTag = slugs.filter((s) => corpus.get(s).role === 'pillar');
      findings.matureTags.push({
        tag,
        count: slugs.length,
        articles: slugs,
        has_pillar: pillarsInTag.length > 0,
        existing_pillars: pillarsInTag,
      });
    }
  }

  return findings;
}

function render(findings, corpus) {
  const out = [];
  out.push(`# P1.15 Pillar ↔ Cluster 互連 audit — ${new Date().toISOString().split('T')[0]}`);
  out.push('');
  out.push(`Locale: zh-tw (master)`);
  out.push(`Total articles in corpus: ${corpus.size}`);
  out.push('');

  const total = Object.values(findings).reduce((s, arr) => s + arr.length, 0);
  if (total === 0) {
    out.push('_All checks pass._');
    return out.join('\n') + '\n';
  }

  out.push('## Summary');
  out.push('');
  out.push('| Check | Count |');
  out.push('|---|---|');
  out.push(`| Pillars missing ≥3 in-body cluster links (P1.15 hard rule) | ${findings.pillarsMissingClusterLinks.length} |`);
  out.push(`| Clusters missing in-body link to pillar (P1.15 hard rule)  | ${findings.clustersMissingPillarLink.length} |`);
  out.push(`| Clusters with no pillar_parent set                          | ${findings.clustersWithoutPillarParent.length} |`);
  out.push(`| Clusters whose pillar_parent slug doesn't exist             | ${findings.clustersWithBadPillarParent.length} |`);
  out.push(`| Implicit pillars (≥3 incoming, role ≠ pillar)              | ${findings.implicitPillars.length} |`);
  out.push(`| Articles with empty role + no pillar_parent                 | ${findings.missingRoles.length} |`);
  out.push(`| Mature tags (≥5 articles, candidate for pillar coverage)    | ${findings.matureTags.length} |`);
  out.push('');

  if (findings.pillarsMissingClusterLinks.length) {
    out.push('## HARD — Pillars missing in-body cluster links');
    out.push('');
    for (const f of findings.pillarsMissingClusterLinks) {
      out.push(`### \`${f.slug}\``);
      out.push('');
      out.push(`- 宣告 cluster 數（從 pillar_parent 反查）: **${f.declared_clusters}**`);
      out.push(`- in-body 連到自身 cluster 的 link: **${f.in_body_cluster_links}**`);
      out.push(`- 需補連 (${f.missing.length}): ${f.missing.map((s) => '`' + s + '`').join(', ')}`);
      out.push('');
    }
  }

  if (findings.clustersMissingPillarLink.length) {
    out.push('## HARD — Clusters missing in-body link to pillar');
    out.push('');
    out.push('| Cluster slug | Pillar slug (declared parent) |');
    out.push('|---|---|');
    for (const f of findings.clustersMissingPillarLink) {
      out.push(`| \`${f.slug}\` | \`${f.pillar}\` |`);
    }
    out.push('');
  }

  if (findings.clustersWithoutPillarParent.length) {
    out.push('## HARD — Clusters with empty `pillar_parent`');
    out.push('');
    for (const f of findings.clustersWithoutPillarParent) {
      out.push(`- \`${f.slug}\``);
    }
    out.push('');
  }

  if (findings.clustersWithBadPillarParent.length) {
    out.push('## HARD — Clusters whose `pillar_parent` points to non-existent slug');
    out.push('');
    for (const f of findings.clustersWithBadPillarParent) {
      out.push(`- \`${f.slug}\` → declared parent \`${f.declared_parent}\` (not in corpus)`);
    }
    out.push('');
  }

  if (findings.implicitPillars.length) {
    out.push('## WARN — Implicit pillars (should set `role: pillar`)');
    out.push('');
    out.push('| Slug | Incoming clusters | Current role |');
    out.push('|---|---|---|');
    for (const f of findings.implicitPillars) {
      out.push(`| \`${f.slug}\` | ${f.incoming} | ${f.current_role} |`);
    }
    out.push('');
  }

  if (findings.missingRoles.length) {
    out.push('## WARN — Articles with empty role + no `pillar_parent` (unclear positioning)');
    out.push('');
    out.push('決定：標 `role: standalone` 或 `role: cluster` + 填 `pillar_parent`。');
    out.push('');
    out.push('| Slug | Tags |');
    out.push('|---|---|');
    for (const f of findings.missingRoles) {
      out.push(`| \`${f.slug}\` | ${f.tags.join(', ') || '_(none)_'} |`);
    }
    out.push('');
  }

  if (findings.matureTags.length) {
    out.push('## INFO — Mature tags (≥5 articles; candidate for new pillar)');
    out.push('');
    out.push('Jerry「合併產文」乘數信號：同一 tag 累積 ≥5 article 後寫一篇 pillar 懶人包能拉整個 cluster 的搜尋權重。');
    out.push('');
    for (const f of findings.matureTags) {
      out.push(`### \`${f.tag}\` — ${f.count} articles`);
      out.push('');
      if (f.has_pillar) {
        out.push(`已有 pillar 覆蓋: ${f.existing_pillars.map((s) => '`' + s + '`').join(', ')}`);
      } else {
        out.push(`**尚無 pillar 覆蓋** — 寫一個 pillar 收這 ${f.count} 篇是高 ROI 動作。`);
      }
      out.push('');
      out.push('Articles:');
      for (const s of f.articles) out.push(`- \`${s}\``);
      out.push('');
    }
  }

  out.push('## Issue codes');
  out.push('');
  out.push('- **HARD** = 違反 P1.15 強制（pillar ≥3 cluster link / cluster ≥1 pillar link）');
  out.push('- **WARN** = 結構不清楚但不違反 hard rule');
  out.push('- **INFO** = 建議的 content roadmap 動作（不是違規）');
  return out.join('\n') + '\n';
}

const corpus = loadCorpus();
const findings = audit(corpus);
process.stdout.write(render(findings, corpus));
