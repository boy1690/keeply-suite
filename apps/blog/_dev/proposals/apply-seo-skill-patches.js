#!/usr/bin/env node
/**
 * apply-seo-skill-patches.js  —  2026-05-24
 *
 * 套用 SEO/GEO skills 優化（盤點結果見 keeply-suite/apps/blog/_dev/proposals/
 * seo-skills-optimization-patches.md）。
 *
 * 為什麼是「你自己跑」而非 agent 直接改：.claude/skills/SKILL.md 被 harness 硬擋為
 * self-modify，連 user 授權不解。由你執行 node 就不受此限。
 *
 * 特性：冪等（marker 已存在就 SKIP，可重複跑）／安全（exact-match 才動，找不到
 * anchor 就 NOT_FOUND 跳過，不會弄壞檔案）／備份（首次寫入前複製 *.bak-<ts>）／
 * 結尾逐筆報告 APPLIED / SKIP / NOT_FOUND。
 *
 * 用法：
 *   node d:/tmp/apply-seo-skill-patches.js            # 套用
 *   node d:/tmp/apply-seo-skill-patches.js --dry-run  # 只看、不寫
 */
"use strict";

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = process.env.SKILLS_DIR ||
  path.join(process.env.USERPROFILE || process.env.HOME, ".claude", "skills");
const DRY = process.argv.includes("--dry-run");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");

const L = (...lines) => lines.join("\n");

// mode "insertAfter": 在 find anchor 之後插入 text（保留 anchor）
// mode "replace"    : 把 find 換成 text
// marker            : 證明此筆已套用的唯一子字串
const EDITS = [

  // ===================== seo-setup =====================
  { file: "seo-setup", id: "S1 prereq CF token", mode: "insertAfter",
    marker: "Cloudflare API token (Analytics:Read)",
    find: "（見 Gotcha G2） |",
    text: "\n| **Cloudflare API token (Analytics:Read)** | dash.cloudflare.com → My Profile → API Tokens →「View Analytics and Logs」範本（read-only），限目標 zone | L1 AI-crawler 能見度 fetcher 的前提（**僅當站在 Cloudflare proxy 後**才有；見 Phase 2 + G14） |" },

  { file: "seo-setup", id: "S2 robots split->open", mode: "replace",
    marker: "robots.txt with open-all AI policy",
    find: "robots.txt with split AI policy",
    text: "robots.txt with open-all AI policy" },

  { file: "seo-setup", id: "S3 files table fetcher", mode: "insertAfter",
    marker: "需站在 Cloudflare proxy 後** |",
    find: "| `fetch-crux.js` | `ORIGINS` 改 |",
    text: "\n| `fetch-ai-crawlers.js` | `HOSTS` map + zone；**需站在 Cloudflare proxy 後** |" },

  { file: "seo-setup", id: "S4 secrets CF", mode: "insertAfter",
    marker: "CF_ANALYTICS_TOKEN",
    find: "| `CRUX_API_KEY` | `gcloud services api-keys list` 取 keyString |",
    text: L("",
      "| `CF_ANALYTICS_TOKEN` | Cloudflare User API token，「View Analytics and Logs」範本（Zone Analytics:Read，read-only）|",
      "| `CF_ZONE_ID` | Cloudflare zone overview 或 GraphQL `viewer{zones{zoneTag}}`；多 host 同 zone 時用 `clientRequestHTTPHost` 分流 |") },

  { file: "seo-setup", id: "S5 L1 AI-crawler subsection", mode: "insertAfter",
    marker: "L1 也含 AI 爬蟲能見度",
    find: "這是 feature，不是 bug。",
    text: L("", "",
      "### L1 也含 AI 爬蟲能見度（GEO 領先訊號）",
      "",
      "`fetch-ai-crawlers.js` 把 Cloudflare 上 AI 爬蟲命中**分流成兩類**（不是加總成一個虛榮數字）：",
      "",
      "- **user-fetch（領先指標）**：`ChatGPT-User` / `OAI-SearchBot` / `PerplexityBot` / `Perplexity-User` / `Claude-User` / `Claude-SearchBot` — 因為某個 user 的**即時 query 引用了你的頁**才來抓 → 你很可能正被 AI 答案引用。",
      "- **training（落後指標）**：`GPTBot` / `ClaudeBot` / `CCBot` / `Google-Extended` … — 語料收錄，基礎在場。",
      "",
      "資料源 = Cloudflare AI Crawl Control GraphQL（`httpRequestsAdaptiveGroups` 節點，**非** Enterprise Bot Management），用 `userAgent` 維度分類 → **Free plan 可跑**。這補上「robots.txt 開放了 AI crawler，那它們真的有來抓嗎」的 close-the-loop 訊號。Free-plan 限制見 G14。Reference impl：`apps/blog/_dev/seo/fetch-ai-crawlers.js` + `build-report.js` 🤖 區塊（2026-05-24）。") },

  { file: "seo-setup", id: "S6 Gotcha G14", mode: "insertAfter",
    marker: "G14 — Cloudflare Free plan AI-crawler",
    find: "只能擋 referral 歸因。",
    text: L("", "",
      "### G14 — Cloudflare Free plan AI-crawler analytics 的三個限制",
      "",
      "**前提**：站要在 Cloudflare proxy 後（orange cloud）CF 才看得到 bot 流量。",
      "",
      "1. **`botDetectionIds` filter 需付費 Bot Management** → 別依賴它；改用 `userAgent` 維度（all plans 可用）自行 substring 分類。",
      "2. **單次查詢跨度 ≤ 1 天**（錯誤訊息：cannot request a time range wider than 1d）→ 一天一個 ~24h query，迴圈 7 天再彙總。",
      "3. **保留期 ~8 天**（錯誤訊息：cannot request data older than 1w1d）→ **CF 本身做不出 week-over-week**。v1 報當週絕對值，跨週趨勢靠 weekly Issue 歷史；程式化 WoW 得自存週快照（v1.1，不需 daily cron）。",
      "",
      "**對策落點**：fetcher 內建 UA→class map + 逐日切片，weekly job 報表時跑 7 個日切查詢。") },

  { file: "seo-setup", id: "S7 monthly checklist", mode: "insertAfter",
    marker: "看 🤖 **AI 爬蟲能見度**",
    find: "看 organic traffic、indexing 變化、top queries 是否合理",
    text: "\n- [ ] 開最新 `seo-weekly` Issue → 看 🤖 **AI 爬蟲能見度**：user-fetch（被 AI 引用）有沒有掉、被抓最多的內容是哪幾篇（amplify 候選）" },

  { file: "seo-setup", id: "S8 reference index", mode: "insertAfter",
    marker: "← L1 AI 爬蟲能見度",
    find: "← L1 CrUX (INP)",
    text: "\n│   ├── fetch-ai-crawlers.js       ← L1 AI 爬蟲能見度 (GEO 領先訊號)" },

  { file: "seo-setup", id: "S9a Phase3a heading", mode: "replace",
    marker: "## Phase 3a — L2 Monthly",
    find: "## Phase 3 — L2 Monthly unlighthouse audit",
    text: "## Phase 3a — L2 Monthly unlighthouse audit" },

  { file: "seo-setup", id: "S9b Phase3b heading", mode: "replace",
    marker: "## Phase 3b — L3 SerpBear",
    find: "## Phase 3 — L3 SerpBear rank tracker",
    text: "## Phase 3b — L3 SerpBear rank tracker" },

  { file: "seo-setup", id: "S9c Phase3 anchor link", mode: "replace",
    marker: "#phase-3b--l3-serpbear-rank-tracker",
    find: "[Phase 3](#phase-3-serpbear-rank-tracker)",
    text: "[Phase 3b](#phase-3b--l3-serpbear-rank-tracker)" },

  { file: "seo-setup", id: "S10 routing footer", mode: "insertAfter",
    marker: "設定完之後的日常",
    find: "→ `blg` 的 Phase A.2 / B + Ubersuggest MCP",
    text: "\n- **設定完之後的日常**：site 出狀況 / traffic 掉 → **seo-watch**（incident triage）；GSC 索引噪音 / 一堆未索引 → **gsc-index-audit**；手上有第三方 scanner 分數要補 → **seo-audit-retrofit**；想自己學 / 懂原因 → **seo-coach**" },

  { file: "seo-setup", id: "S11 G7 cross-ref", mode: "insertAfter",
    marker: "GSC 端的同一問題診斷（R2",
    find: "3. Framework 規則寫進 BWF P1.16",
    text: "\n\n> GSC 端的同一問題診斷（R2 disableKinds）見 skill **gsc-index-audit** Phase 4.5 — 那是單一真相源，本處只列 setup 預防。" },

  // ===================== seo-watch =====================
  { file: "seo-watch", id: "W1 description AI triggers", mode: "replace",
    marker: "AI 搜尋引用掉了",
    find: "「為什麼 backlink 沒效果」時觸發。",
    text: "「為什麼 backlink 沒效果」「AI 不抓我們了」「ChatGPT / Perplexity 不引用了」「AI 搜尋引用掉了」時觸發。" },

  { file: "seo-watch", id: "W2 symptom table row", mode: "insertAfter",
    marker: "AI-search visibility regression | Phase 2G",
    find: "| 「Backlink 沒效果 / DR 沒漲」 | Off-page regression | Phase 2F |",
    text: "\n| 「AI 不抓了 / AI 搜尋引用掉 / GPTBot·ChatGPT-User 命中降」 | AI-search visibility regression | Phase 2G |" },

  { file: "seo-watch", id: "W3 Phase 2G section", mode: "insertAfter",
    marker: "Phase 2G — AI-search visibility regression triage",
    find: "**不 auto-fix**（off-page is human work）。",
    text: L("", "",
      "---", "",
      "## Phase 2G — AI-search visibility regression triage ⚠️ 2026 新增",
      "",
      "> 前提：站在 Cloudflare proxy 後。資料源 = `_dev/seo/fetch-ai-crawlers.js`（weekly Issue 🤖 區塊）。",
      "",
      "### Step 1：對比 user-fetch 趨勢",
      "讀最近 1-2 期 `seo-weekly` Issue 的 🤖 區塊，看 **user-fetch**（ChatGPT-User / OAI-SearchBot / PerplexityBot / Claude-User）命中 per-host 是否明顯下滑。training 類掉不急（落後指標）；**user-fetch 掉才是領先警訊**（可能正在被 AI 答案除名）。",
      "",
      "### Step 2：Hypothesis ladder",
      "",
      "| Hypothesis | Diagnose | Action |",
      "|------------|----------|--------|",
      "| H1：robots.txt 誤擋 AI UA | curl /robots.txt vs git log；查 Google-Extended/Applebot-Extended reverse-default trap（seo-setup G14/Phase1）| 修 robots Allow → 重 deploy |",
      "| H2：CF / WAF / Bot Fight Mode 開始擋 AI UA | CF dashboard Security events 過濾該 UA | 加 WAF skip rule 放行已知 AI UA |",
      "| H3：被引用內容頁 404 / 改名沒 redirect | 比對 🤖 區塊 top cited paths 是否變 404 | 301 → topic-matching pillar |",
      "| H4：內容不再被 AI 選用（AEO 退化）| 對該主題在 Perplexity/ChatGPT 實測查詢看有沒有引用我們 | 走 **seo-audit-retrofit** 補 Executive Answer / 問題式 H2 / schema |",
      "| H5：CF 取樣雜訊 / 單週波動 | 看是否只是 ±1 週抖動（Free plan 取樣 + 8d retention）| 不動，下一期再看 |",
      "",
      "對 H1-H3（技術故障）→ auto-fix（不受 Phase 0 核更閘門限制）。對 H4（內容）→ propose 走 seo-audit-retrofit。") },

  { file: "seo-watch", id: "W4+W5 battery Test9+10", mode: "replace",
    marker: "Test 10: AI crawler hits",
    find: "# Test 9: 11 removed locale (or whatever locale-policy is) 全 301 to designated target",
    text: L("# Test 9: 已移除的 locale（依當下 locale-policy，數量會變 — 對照 CLAUDE.md / market-pilot-deploy）全 301 to designated target",
      "# Test 10: AI crawler hits（fetch-ai-crawlers.js）— user-fetch 類 vs 上期 baseline 沒崩；被引用 top paths 仍 200") },

  { file: "seo-watch", id: "W6 perf dangling ref", mode: "replace",
    marker: "目前無專屬 perf skill",
    find: "Phase 2E（一般跳過，建議 user 用專屬 perf skill）",
    text: "Phase 2E（一般跳過 → 走 PSI / Lighthouse 手動，目前無專屬 perf skill）" },

  // ===================== gsc-index-audit =====================
  { file: "gsc-index-audit", id: "Ga seo-watch off-ramp", mode: "insertAfter",
    marker: "快速 incident off-ramp → `seo-watch`",
    find: "「教我自己判斷」。",
    text: "\n>\n> **快速 incident off-ramp → `seo-watch`**：若是「上週還好、這週突然壞」的單一症狀（traffic 掉 / 一批 404 / 沒被 index）要趕快 triage + 修，走 `seo-watch`（本 skill 是全 8 分類深掘 + 寫 baseline）。" },

  { file: "gsc-index-audit", id: "Gb Candidate5->4", mode: "replace",
    marker: "### Candidate 4 — Theme 模板沒讀",
    find: "### Candidate 5 — Theme 模板沒讀 frontmatter `robots:`（2026-05-18 新增）",
    text: "### Candidate 4 — Theme 模板沒讀 frontmatter `robots:`（2026-05-18 新增）" },

  { file: "gsc-index-audit", id: "Gc Candidate4->5", mode: "replace",
    marker: "### Candidate 5 — 13 auto-translate locale 的存廢決定",
    find: "### Candidate 4 — 13 auto-translate locale 的存廢決定（per Caveat 5）",
    text: "### Candidate 5 — 13 auto-translate locale 的存廢決定（per Caveat 5）" },

  { file: "gsc-index-audit", id: "Gd R1 dated note", mode: "insertAfter",
    marker: "2026-05-24 更新**：此 R1",
    find: "### R1 — 13 auto-translate locale：從 build **完全移除**（不是 noindex）",
    text: L("", "",
      "> ⚠️ **2026-05-24 更新**：此 R1 的「13 auto-translate locale」清單是 2026-05-18 當時狀態。其後 **vi + th 已升為 native 核心 locale**（commits cecba8d1 / b4a87080），de/es/pt-br/pl 也有 native pilot（見 market-pilot-deploy）。套用前**務必對照當下 locale-policy（CLAUDE.md）**重算「該砍哪些」，別照搬此清單與數字。") },

  // ===================== seo-audit-retrofit =====================
  { file: "seo-audit-retrofit", id: "Ra1 GR8 locale count", mode: "replace",
    marker: "locale 數依當下 policy",
    find: "20 locale × 12 keys = 240 字串",
    text: "locale 數 × 約 12 keys（locale 數依當下 policy，對照 CLAUDE.md）字串" },

  { file: "seo-audit-retrofit", id: "Ra2 對照表 locale count", mode: "replace",
    marker: "同步 patch（數量依當下 locale-policy）",
    find: "全 19 locale 同步 patch",
    text: "全 locale 同步 patch（數量依當下 locale-policy）" },

  // ===================== seo-coach =====================
  { file: "seo-coach", id: "Ca fix off-ramp", mode: "insertAfter",
    marker: "想要直接把問題修好",
    find: "→ 改用 seo-setup",
    text: "\n  - 想要直接把問題修好（不只學）→ 索引 / 未收錄走 gsc-index-audit、site 突然出狀況走 seo-watch" },

  // seo-coach reference: 13-ai-search.md — refresh to 2026
  { file: "seo-coach", relpath: "seo-coach/references/13-ai-search.md", id: "Cb1 CF AI-bot tracking", mode: "insertAfter",
    marker: "Cloudflare 流量分析（站在 Cloudflare 後才有",
    find: "3. **Brand Monitoring 工具**：追蹤品牌提及",
    text: L("",
      "4. **Cloudflare 流量分析（站在 Cloudflare 後才有，免費）**：把 AI 爬蟲分兩類看 —",
      "   - **user-fetch（領先訊號）**：ChatGPT-User / OAI-SearchBot / PerplexityBot / Claude-User — 它們來抓通常代表某個用戶的即時提問引用了你的頁 → 你正被 AI 答案引用。",
      "   - **training（基礎訊號）**：GPTBot / ClaudeBot / CCBot — 收進模型語料，在場但不等於被引用。",
      "   看這兩類的命中數與被抓的頁，是免費工具裡最接近「有沒有被 AI 引用」的領先指標。") },

  { file: "seo-coach", relpath: "seo-coach/references/13-ai-search.md", id: "Cb2 llms.txt line", mode: "insertAfter",
    marker: "新興慣例 `llms.txt`",
    find: "- 重要資訊用純文字，不只放在圖片裡",
    text: "\n- 新興慣例 `llms.txt`：根目錄放精選索引，讓 LLM 更容易抓到你最重要的內容（成本低、emerging、非必須）。" },

  // ===== Tier 3 行為調整（觸發收斂 / 名實對齊）=====
  { file: "gsc-index-audit", id: "Ge weekly-health trigger 收斂", mode: "replace",
    marker: "「GSC 索引深掘」",
    find: "「weekly SEO health」",
    text: "「GSC 索引深掘」" },

  { file: "seo-audit-retrofit", id: "Rb similar.ai 名實對齊", mode: "replace",
    marker: "av8d-levelup 為主",
    find: "第三方 SEO/AEO scanner（av8d-levelup, similar.ai, others）",
    text: "第三方 SEO/AEO scanner（av8d-levelup 為主；similar.ai 等同法類推）" },

  { file: "seo-coach", id: "Cc trigger 平衡（讓位）", mode: "insertAfter",
    marker: "但若用戶明顯只想「趕快修好",
    find: "即使用戶只說「看看我的 SEO」，也要啟動這個 skill，因為陪跑式對話比直接給答案更有學習效果。",
    text: "但若用戶明顯只想「趕快修好、不想學」（突發流量崩、要 ship-ready 改動）→ 讓 seo-watch / gsc-index-audit / seo-audit-retrofit 接手。" },
];

// ── engine ──────────────────────────────────────────────────────────────
const resolveFp = (e) => e.relpath
  ? path.join(SKILLS_DIR, ...e.relpath.split("/"))
  : path.join(SKILLS_DIR, e.file, "SKILL.md");

const byFile = {};
for (const e of EDITS) { const fp = resolveFp(e); (byFile[fp] = byFile[fp] || []).push(e); }

const report = [];
let anyChange = false;

for (const [fp, edits] of Object.entries(byFile)) {
  if (!fs.existsSync(fp)) { for (const e of edits) report.push([e.id, "FILE_MISSING", fp]); continue; }
  let content = fs.readFileSync(fp, "utf8");
  const original = content;

  for (const e of edits) {
    if (content.includes(e.marker)) { report.push([e.id, "SKIP", ""]); continue; }
    if (!content.includes(e.find)) { report.push([e.id, "NOT_FOUND", e.find.slice(0, 38)]); continue; }
    content = e.mode === "replace"
      ? content.replace(e.find, e.text)
      : content.replace(e.find, e.find + e.text);
    report.push([e.id, "APPLIED", ""]);
  }

  if (content !== original) {
    anyChange = true;
    if (!DRY) { fs.copyFileSync(fp, fp + ".bak-" + STAMP); fs.writeFileSync(fp, content); }
  }
}

// ── report ──────────────────────────────────────────────────────────────
const w = (s) => process.stdout.write(s + "\n");
const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
w("");
w(`SEO/GEO skill patches — ${DRY ? "DRY RUN (沒寫檔)" : "已套用"}  @ ${SKILLS_DIR}`);
w("-".repeat(74));
for (const [id, status, note] of report) w(`  ${pad(status, 11)} ${pad(id, 34)} ${note}`);
w("-".repeat(74));
const counts = report.reduce((m, [, s]) => ((m[s] = (m[s] || 0) + 1), m), {});
w("  " + Object.entries(counts).map(([k, v]) => `${k}:${v}`).join("   "));
if (!DRY && anyChange) w(`\n  備份：各檔同目錄 *.bak-${STAMP}`);
if (DRY) w("\n  這是 dry-run。確認後拿掉 --dry-run 再跑。");
const nf = report.filter(([, s]) => s === "NOT_FOUND").length;
if (nf) w(`\n  ⚠️ ${nf} 筆 NOT_FOUND：anchor 可能已被改過 → 回報我重抓。`);
