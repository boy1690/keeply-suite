# Handoff — keeply.work main site GEO/AEO gap report (2026-05-17)

> Generated from av8d-levelup.com SEO/GEO/AEO scan + manual `curl` audit of the live `https://keeply.work/` HTML. **Cross-repo boundary** — this report belongs to `keeply-website` repo (not keeply-blog); writing only as handoff so user can carry findings + code snippets across manually.

## Scores (av8d-levelup scan, 2026-05-17)

| Axis | Score | Label | Top issues |
|------|-------|-------|------------|
| SEO  | 82 / 100 | 🥇 良好 | Meta tags 70, 頁面速度 70 |
| GEO  | 57 / 100 | ⚠️ 需改進 | **E-E-A-T 20**, Schema 完整性 40, 平台優化 55 |
| AEO  | 52 / 100 | ⚠️ 需改進 | **HowTo 0**, 問題式標題 20, Featured Snippet 25, FAQ 60 |
| **綜合** | **64 / 100** | 🥉 及格 | |

Top 5 recommendations from av8d (priority order, expected lift in parentheses):

1. **[HIGH] Schema — FAQPage** (+15-20 pts) — *already implemented* (live HTML has 7-Q FAQPage). av8d heuristic likely misses `@graph` nesting; this is a false negative.
2. **[MED] AI 爬蟲 — allow GPTBot / ClaudeBot** (+12-18 pts) — **gap unknown; confirm via `curl https://keeply.work/robots.txt`**. See §A.
3. **[MED] 品牌權威** (+8-12 pts) — off-site work (Reddit / YouTube / Wikipedia); not a code fix.
4. **[MED] HowTo schema** (+8-15 pts) — homepage has install steps but no HowTo schema. See §B.
5. **[MED] 問題式標題** (+5-10 pts) — H2/H3 are product taglines, not search-intent questions. See §C.

---

## §A. robots.txt — verify AI crawler policy

**Check live**: `curl -s https://keeply.work/robots.txt`

**Expected (2026-05-17 policy)**: allow all major training + retrieval crawlers; block only Bytespider / Diffbot / ImagesiftBot. Mirrors `keeply-blog/static/robots.txt` updated 2026-05-17.

**Code snippet to paste into `keeply-website/static/robots.txt`** (mirror keeply-blog's):

```
User-agent: *
Allow: /

# Social link-preview scrapers
User-agent: facebookexternalhit
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: Slackbot
Allow: /
User-agent: Discordbot
Allow: /

# AI live-retrieval bots
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Perplexity-User
Allow: /

# AI training crawlers — REVERSE DEFAULT for Google-Extended /
# Applebot-Extended: they treat absent rules as DISALLOW. Must
# Allow explicitly.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: CCBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

# Blocked: poor compliance / low ROI
User-agent: Bytespider
Disallow: /
User-agent: Diffbot
Disallow: /

Sitemap: https://keeply.work/sitemap.xml
```

---

## §B. HowTo schema — add to homepage install section

The homepage `/` shows install steps (download → install → first save) but `_dev/inject-schema.js` only emits Organization + WebSite + SoftwareApplication + FAQPage. Add a HowTo block in `@graph`:

```json
{
  "@type": "HowTo",
  "@id": "https://keeply.work/#install-howto",
  "name": "Install Keeply on Windows or macOS in 30 seconds",
  "totalTime": "PT30S",
  "supply": [
    { "@type": "HowToSupply", "name": "Windows 10/11 or macOS (Apple Silicon)" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Download",
      "text": "Click the download button on keeply.work to get the Windows installer or macOS DMG.",
      "url": "https://keeply.work/#download"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Install",
      "text": "Double-click the installer. No account creation, no email signup.",
      "url": "https://keeply.work/#install"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Save your first version",
      "text": "Open any project folder in Keeply. Click 儲存版本 (Save version). Done — Keeply now tracks every save.",
      "url": "https://keeply.work/#first-save"
    }
  ]
}
```

Expected lift: AEO **HowTo 0 → 70+**, contributing +8-15 to overall AEO.

---

## §C. 問題式標題 — H2 rewrite candidates

Current H2 (zh-Hant) are product taglines. ChatGPT/Perplexity prefer question H2 matching user prompts. Suggested rewrites (drop into `index.html` `<h2>`):

| 原 H2 (推測) | 改寫成問題式 |
|-------------|--------------|
| Keeply 的特色 | 為什麼 Keeply 不是另一個 Git？ |
| 完全離線 | Keeply 可以離線使用嗎？ |
| 與 Dropbox 比較 | Keeply 跟 Dropbox 差在哪？ |
| 團隊功能 | Keeply 適合幾人團隊？需要每人付費嗎？ |
| 支援檔案 | Keeply 支援哪些檔案格式？ |
| 立即下載 | 怎麼下載 Keeply？要付費嗎？ |

Pair each H2 with an Executive Answer paragraph (80-120 zh chars, 40-60 en words, answer first). Re-uses existing FAQPage Q/A — H2 mirrors the FAQ question, body opens with the same answer text.

Expected lift: AEO **問題式標題 20 → 70+**, +5-10 overall AEO.

---

## §D. organization.sameAs — expand entity graph

Current `Organization.sameAs` in live HTML has only `https://github.com/boy1690/keeply-releases`. Expand to feed the AI entity-disambiguation graph (mirrors keeply-blog hugo.toml 2026-05-17 update):

```json
"sameAs": [
  "https://keeply.work",
  "https://blog.keeply.work",
  "https://github.com/boy1690/keeply-releases",
  "https://www.linkedin.com/in/ting-wei-tsao-b57480152/"
]
```

Add more as they're created: LinkedIn company page, X brand handle, Crunchbase entry, Wikidata Q-item.

Expected lift: 平台優化 / 品牌權威 +3-5 pts each.

---

## §E. Founder visibility — Person schema + author byline

E-E-A-T 20 is the lowest sub-score. Root cause: homepage has zero Person schema and no visible founder byline. Add to `@graph`:

```json
{
  "@type": "Person",
  "@id": "https://keeply.work/#founder",
  "name": "Tsao Ting Wei",
  "alternateName": "曹庭維",
  "jobTitle": "Founder, Keeply",
  "url": "https://keeply.work/about",
  "sameAs": [
    "https://github.com/boy1690",
    "https://www.linkedin.com/in/ting-wei-tsao-b57480152/"
  ],
  "worksFor": { "@id": "https://keeply.work/#organization" }
}
```

Also visible HTML: add a small footer block with founder name + LinkedIn link. Optionally create `/about.html` (already in spec backlog) with 100-200 word founder bio + photo.

Expected lift: E-E-A-T **20 → 45+**, +10-15 GEO overall.

---

## §F. dateModified visibility

av8d checks both Article schema `dateModified` AND visible "Last updated: YYYY-MM-DD" text. Homepage has neither. For the homepage this is awkward (it's a product page, not an article), but the OS Roadmap section or pricing table could carry a "Last updated 2026-05-XX" stamp. Skip if it feels forced.

---

## §G. Out of scope for this report

- **Reddit / YouTube / Wikipedia brand mentions** — off-site work, not a code change. Keep separate backlog.
- **Page speed (Meta tags 70 / 頁面速度 70)** — see `_dev/seo/handoff-keeply-website-cls-2026-05-13.md` (already filed).

---

## Suggested apply order (smallest blast radius first)

1. §A `robots.txt` — 5 min, zero risk
2. §D `Organization.sameAs` expand — 5 min, zero risk
3. §E Person schema + visible founder byline — 30 min
4. §B HowTo schema for install steps — 20 min
5. §C H2 rewrites + Executive Answer paragraphs — 1-2 hr (copy + i18n)

After applying §A-§E, re-run av8d-levelup analyzer; expected overall lift +15-25 points (from 64 → 80+).
