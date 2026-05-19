#!/usr/bin/env node
// P1.11 標題公式 audit — 掃 content/{locale}/post/{slug}/index.md 的
// frontmatter title，對照 BWF P1.11（含 P1.21 contrast frame 模板）逐項
// 打分，flag 違規。
//
// 檢查項目（zh-tw / zh-cn 主要；en 規則不同）：
//   1. 長度：zh 全形 28-38 / en 50-60
//   2. 含【】tag 前綴（P1.21 contrast frame template）
//   3. primary_keyword 非空 + token 落在 title 前 12 字（去【】後算）
//   4. 含年份（落在【】內或 title 主體）
//   5. 含數字（不限年份；可以是步驟數、樣本數、限制數）
//   6. 含搜尋意圖詞之一（推薦 / 比較 / 評價 / 教學 / 懶人包 / 心得 / 攻略
//      / 指南 / 限制 / 方法 / 步驟 / 注意 / 怎麼 / 為什麼 / 差別 / 原則）
//   7. 含分段符號（：｜？/）至少一個
//
// Output: markdown table to stdout. Exit code 0 always — audit is
// advisory, not a CI hard-gate.
//
// Run: node _dev/blog/title-audit.js [--locale zh-tw]
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LOCALE_DIR = {
  'zh-tw': 'zh-tw',
  'zh-cn': 'zh-cn',
  'en': 'english',
  'ja': 'ja',
  'ko': 'ko',
  'it': 'it',
};

// CJK 全形寬度計算：CJK char = 1，半形 ASCII = 0.5
function widthCJK(s) {
  let w = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80) w += 0.5;
    else if (cp >= 0xff61 && cp <= 0xff9f) w += 0.5; // 半形片假名
    else w += 1;
  }
  return w;
}

const INTENT_WORDS_ZH = [
  '推薦', '比較', '評價', '教學', '懶人包', '心得', '攻略', '指南',
  '限制', '方法', '步驟', '注意', '怎麼', '為什麼', '差別', '原則',
  '完整', '完全', '入門', '解析', '常見', '選擇', '怎麼用', '怎麼做',
];

const INTENT_WORDS_EN = [
  'guide', 'tutorial', 'how to', 'why', 'best', 'top', 'review',
  'comparison', 'vs', 'tips', 'checklist', 'common', 'complete',
];

function parseFrontmatter(raw) {
  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd < 0) return null;
  const fm = raw.slice(4, fmEnd);
  const grab = (k) => {
    // Match `key: ...` up to end of line, then strip optional outer quotes
    // (single or double) and unescape `\"` inside. Supports YAML titles
    // like `title: "...\"X\"..."` that contain escaped quotes.
    const m = fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'));
    if (!m) return '';
    let v = m[1].trim();
    // Strip outer quotes if balanced
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"');
  };
  return {
    title: grab('title'),
    primary_keyword: grab('primary_keyword'),
    locale: grab('locale'),
    role: grab('role'),
    template: grab('template'),
  };
}

function tagPrefix(title) {
  const m = title.match(/^【([^】]+)】/);
  return m ? m[1] : null;
}
function titleBody(title) {
  return title.replace(/^【[^】]+】/, '').trim();
}

// 回傳 { hard: [...], warn: [...] }。
// HARD = 硬違規必修；WARN = 建議優化但可保留 voice-driven 選擇（P1.20）。
function auditZh(fm, isEn = false) {
  const hard = [], warn = [];
  const t = fm.title;
  if (!t) { hard.push('NO_TITLE'); return { hard, warn }; }

  // 1. Length — P1.21 contrast frame template 強制【】prefix（~8.5 全形字）
  //    所以實際上限要加 prefix 後算。HARD 線：zh 50 / en 70。
  const w = isEn ? t.length : widthCJK(t);
  if (isEn) {
    // P1.21 contrast frame 加【2026 File Management】prefix（~27 char）後
    // 整段合理範圍 = 50-60 sweet zone + 27 = 77-87；HARD 上限放到 100。
    if (w < 40) warn.push(`LEN_SHORT(${w})`);
    else if (w > 100) hard.push(`LEN_TOO_LONG(${w})`);
    else if (w > 87) warn.push(`LEN_LONG(${w})`);
  } else {
    if (w < 28) warn.push(`LEN_SHORT(${w.toFixed(1)})`);
    else if (w > 50) hard.push(`LEN_TOO_LONG(${w.toFixed(1)})`);
    else if (w > 42) warn.push(`LEN_LONG(${w.toFixed(1)})`);
  }

  // 2. Tag prefix (P1.21) — HARD（強制模板）
  if (!isEn && !tagPrefix(t)) hard.push('NO_TAG_PREFIX');

  // 3. primary_keyword — HARD（必填 + 不能是 baseline 註記）
  const pk = fm.primary_keyword;
  if (!pk) hard.push('NO_PRIMARY_KEYWORD');
  else if (/[(（].*baseline.*[)）]/i.test(pk) || /ja-master|主市場主鍵|主市场主键/i.test(pk)) {
    hard.push('PK_LOOKS_LIKE_NOTE');
  } else {
    const body = titleBody(t);
    const head = isEn ? body.slice(0, 30) : body.slice(0, 12);
    // partial token match: 任一 token 至少 2 chars 命中 head 就過
    const tokens = pk.split(/[\s,，、]+/).filter((s) => s.length >= 2);
    const hit = tokens.some((tok) => {
      if (isEn) return head.toLowerCase().includes(tok.toLowerCase());
      return head.includes(tok);
    });
    if (!hit) warn.push(`PK_NOT_IN_HEAD("${pk}")`);
  }

  // 4. Year — HARD（P1.21 contrast frame 強制含年份）
  if (!/20\d\d/.test(t)) hard.push('NO_YEAR');

  // 5. Digit in body — WARN（P1.11 偏好但 voice-driven hook 可缺）
  const body = titleBody(t);
  const bodyNoYear = body.replace(/20\d\d/g, '');
  if (!/\d/.test(bodyNoYear)) warn.push('NO_DIGIT_IN_BODY');

  // 6. Search-intent word — WARN（P1.20 voice-driven mode 合法）
  const words = isEn ? INTENT_WORDS_EN : INTENT_WORDS_ZH;
  const hasIntent = words.some((w) =>
    isEn ? body.toLowerCase().includes(w) : body.includes(w)
  );
  if (!hasIntent) warn.push('NO_INTENT_WORD');

  // 7. Divider — HARD（無分段符號 Google SERP 容易截）
  //    認可：：｜？，全形 + ASCII : ? | , / — P1.21 contrast frame connector 都算
  if (!/[：｜？，:?|,/]/.test(body)) hard.push('NO_DIVIDER');

  return { hard, warn };
}

const TRACKED_LOCALES = ['zh-tw', 'zh-cn', 'en'];

function main() {
  const argv = process.argv.slice(2);
  const localeArgIdx = argv.indexOf('--locale');
  const localeFilter = localeArgIdx >= 0 ? argv[localeArgIdx + 1] : null;
  const locales = localeFilter ? [localeFilter] : TRACKED_LOCALES;

  const rows = [];
  for (const locale of locales) {
    const dirName = LOCALE_DIR[locale];
    if (!dirName) continue;
    const baseDir = path.join(REPO_ROOT, 'content', dirName, 'post');
    if (!fs.existsSync(baseDir)) continue;
    const slugs = fs.readdirSync(baseDir).filter((s) =>
      fs.statSync(path.join(baseDir, s)).isDirectory()
    );
    for (const slug of slugs) {
      const fp = path.join(baseDir, slug, 'index.md');
      if (!fs.existsSync(fp)) continue;
      const fm = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
      if (!fm) continue;
      const isEn = locale === 'en';
      const { hard, warn } = auditZh(fm, isEn);
      rows.push({ locale, slug, title: fm.title, pk: fm.primary_keyword, hard, warn });
    }
  }

  const out = [];
  out.push(`# P1.11 標題公式 audit — ${new Date().toISOString().split('T')[0]}`);
  out.push('');
  out.push(`Total: ${rows.length} articles × ${locales.length} locale(s)`);
  out.push('');

  const withHard = rows.filter((r) => r.hard.length > 0);
  const withWarn = rows.filter((r) => r.warn.length > 0 && r.hard.length === 0);
  const clean = rows.length - withHard.length - withWarn.length;
  out.push(`- 完全通過: ${clean}`);
  out.push(`- 只有 WARN: ${withWarn.length}`);
  out.push(`- 含 HARD 違規: **${withHard.length}**`);
  out.push('');

  if (withHard.length === 0 && withWarn.length === 0) {
    out.push('_All audited titles pass P1.11._');
    process.stdout.write(out.join('\n') + '\n');
    return;
  }

  // Frequency
  const freq = (key) => {
    const m = new Map();
    for (const r of rows) for (const i of r[key]) {
      const k = i.replace(/\(.+\)/, '');
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  out.push('## Issue frequency');
  out.push('');
  out.push('| Severity | Code | Count |');
  out.push('|---|---|---|');
  for (const [k, v] of freq('hard')) out.push(`| HARD | ${k} | ${v} |`);
  for (const [k, v] of freq('warn')) out.push(`| WARN | ${k} | ${v} |`);
  out.push('');

  if (withHard.length) {
    out.push('## HARD 違規（必修）');
    out.push('');
    out.push('| Locale | Slug | Title | HARD | WARN |');
    out.push('|---|---|---|---|---|');
    for (const r of withHard) {
      const t = r.title.length > 50 ? r.title.slice(0, 50) + '…' : r.title;
      out.push(`| ${r.locale} | \`${r.slug}\` | ${t} | ${r.hard.join(', ')} | ${r.warn.join(', ') || '—'} |`);
    }
    out.push('');
  }
  if (withWarn.length) {
    out.push('## 只有 WARN（建議優化但可保留 voice-driven 選擇）');
    out.push('');
    out.push('| Locale | Slug | WARN |');
    out.push('|---|---|---|');
    for (const r of withWarn) {
      out.push(`| ${r.locale} | \`${r.slug}\` | ${r.warn.join(', ')} |`);
    }
    out.push('');
  }

  out.push('## Issue codes');
  out.push('');
  out.push('### HARD（硬違規必修）');
  out.push('- `NO_TITLE` — title 空白');
  out.push('- `NO_TAG_PREFIX` — 缺【…】prefix（P1.21 contrast frame template 強制）');
  out.push('- `NO_PRIMARY_KEYWORD` — frontmatter primary_keyword 欄位空白');
  out.push('- `PK_LOOKS_LIKE_NOTE` — primary_keyword 夾雜 baseline / master / 引號 註記，不是純 keyword');
  out.push('- `NO_YEAR` — title 不含 20XX 年份（P1.21 強制）');
  out.push('- `NO_DIVIDER` — title 主體不含 ：｜？/ 等分段符號（無分段易被 SERP 截斷）');
  out.push('- `LEN_TOO_LONG` — zh > 50 全形 / en > 70 char（過長會被 Google rewrite）');
  out.push('');
  out.push('### WARN（建議優化但 P1.20 voice-driven mode 合法）');
  out.push('- `LEN_SHORT` / `LEN_LONG` — zh 28-42 / en 40-60 為甜蜜帶');
  out.push('- `PK_NOT_IN_HEAD` — primary_keyword 任一 token (≥2 char) 沒落在【】後 12 字內');
  out.push('- `NO_DIGIT_IN_BODY` — title 主體（去年份後）不含任何阿拉伯數字');
  out.push('- `NO_INTENT_WORD` — title 主體不含搜尋意圖詞（推薦/比較/教學等）');
  out.push('');

  process.stdout.write(out.join('\n') + '\n');
}

main();
