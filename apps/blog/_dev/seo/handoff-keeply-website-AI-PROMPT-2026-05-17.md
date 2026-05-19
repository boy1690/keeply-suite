# Ready-to-paste AI prompt — apply GEO/AEO fixes to keeply-website repo

> **怎麼用**：在 `d:\tools\doing\keeply-website\` 開新 Claude session，把下方 `--- AI PROMPT START ---` 與 `--- AI PROMPT END ---` 之間整段貼給 AI。AI 會依序套用 §A-§E 並驗證。
>
> 結束後跑 `node _dev/inject-schema.js` 重新 inject schema、commit、deploy、再回 https://seo.av8d-levelup.com/ 用「無痕模式」重新分析（記得隔天才有新配額，或換 IP）。

---

--- AI PROMPT START ---

你正在 `d:\tools\doing\keeply-website\` repo（keeply.work 主行銷站，純 static HTML + Tailwind + `_dev/inject-schema.js` 後處理 JSON-LD）。

## 任務

依下方 §A-§E 五件事修改本 repo。**禁止跨 repo 寫**（不准動 `d:\tools\doing\Keeply\`、`d:\tools\doing\keeply-blog\`、任何 Ocular）。修完跑 build / inject-schema 驗證，回報每件事的狀態（done / partial / skipped + 理由）。

## 背景

av8d-levelup.com 2026-05-17 scan 給 keeply.work：SEO 82 / GEO 57 / AEO 52 / 綜合 64。E-E-A-T 20 / HowTo 0 / 問題式標題 20 / Schema 40 是主要拖分項。下方 §A-§E 是針對性修補，預期套完綜合 64 → 80+。

## §A — robots.txt：開放所有主流 AI 訓練爬蟲

把 `static/robots.txt`（如果不存在就建立）整檔覆寫為：

```
# Keeply main site robots.txt — 2026-05-17 policy
# Mirror of keeply-blog/static/robots.txt: open all major AI crawlers
# (training + retrieval) to maximize citation surface. Bytespider /
# Diffbot / ImagesiftBot blocked (poor compliance / low ROI).

User-agent: *
Allow: /

# Social link-preview scrapers
User-agent: facebookexternalhit
Allow: /
User-agent: facebookcatalog
Allow: /
User-agent: meta-externalfetcher
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: Slackbot-LinkExpanding
Allow: /
User-agent: Slackbot
Allow: /
User-agent: Discordbot
Allow: /
User-agent: TelegramBot
Allow: /
User-agent: WhatsApp
Allow: /
User-agent: line-poker
Allow: /
User-agent: Pinterestbot
Allow: /

# AI live-retrieval bots (cite when user triggers search)
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

# AI training crawlers — REVERSE DEFAULT for Google-Extended and
# Applebot-Extended: they treat absent rules as DISALLOW. Must Allow
# explicitly to be included in Gemini / Apple Intelligence training.
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

# Blocked: poor compliance / low ROI for our locales
User-agent: Bytespider
Disallow: /
User-agent: Diffbot
Disallow: /
User-agent: ImagesiftBot
Disallow: /

Sitemap: https://keeply.work/sitemap.xml
```

驗證：`curl -s http://localhost:PORT/robots.txt | head -5`（如果本地有 dev server）；或單純打開檔案確認內容。

---

## §B — HowTo schema：加進首頁 install 區段

開啟 `_dev/inject-schema.js`（或同等位置；負責把 JSON-LD 注入 `index.html` 的腳本）。在 `@graph` 陣列加一個 `HowTo` 物件，與既有 Organization / WebSite / SoftwareApplication / FAQPage 並列。

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

注意：如果首頁實際下載 / 安裝步驟描述跟上面不一致（例如不是 3 步、文字不同），改成跟頁面實際內容 1:1 對應。**不要寫頁面上沒有的步驟** — schema 跟 visible content 必須一致，否則 Google Rich Results 會 reject。

驗證：build 後 `curl -s https://keeply.work/ | grep -A 3 '"@type": "HowTo"'`，應該看到 HowTo block。

---

## §C — Organization.sameAs 擴展

同樣在 `_dev/inject-schema.js`，找到 `Organization` 物件的 `sameAs` 欄位（目前只有 `https://github.com/boy1690/keeply-releases`），擴展成：

```json
"sameAs": [
  "https://keeply.work",
  "https://blog.keeply.work",
  "https://github.com/boy1690/keeply-releases",
  "https://www.linkedin.com/in/ting-wei-tsao-b57480152/"
]
```

未來有 LinkedIn 公司頁 / X brand handle / Crunchbase / Wikidata 也加進來。Personal accounts（個人 GitHub / 個人 LinkedIn）放 Person.sameAs，brand-level URL 放 Organization.sameAs。

---

## §D — Person schema + 可見作者 byline

E-E-A-T 20 是 keeply.work 最低分項。**根因**：首頁完全沒有 Person schema，也沒有可見的「founder / about」字樣。

### D.1 — 在 `_dev/inject-schema.js` 的 `@graph` 加 Person 物件

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

### D.2 — visible HTML：footer 加 founder byline

在 `index.html`（與其他 locale 版本如 `en/index.html` 等）的 footer 區域，加一個小區塊：

```html
<!-- Founder byline (E-E-A-T signal) -->
<div class="text-sm text-gray-500 mt-4">
  Made by <a href="https://www.linkedin.com/in/ting-wei-tsao-b57480152/"
   class="underline hover:text-indigo-600" rel="noopener" target="_blank">Tsao Ting Wei (曹庭維)</a>,
  Founder of Keeply.
</div>
```

各 locale 對應翻譯（用既有 i18n 機制；如果沒有，先用 EN 版本占位，標 TODO 等翻譯）：
- zh-Hant: 由創辦人 [Tsao Ting Wei (曹庭維)](...) 親手打造。
- zh-Hans: 由创办人 [Tsao Ting Wei (曹庭维)](...) 亲手打造。
- en: Made by [Tsao Ting Wei (曹庭維)](...), Founder of Keeply.
- ja: 開発者 [Tsao Ting Wei (曹庭維)](...) によって作られました。
- ko: 창립자 [Tsao Ting Wei (曹庭維)](...) 가 직접 만들었습니다.
- it: Realizzato da [Tsao Ting Wei (曹庭維)](...), Fondatore di Keeply.
- (其他 locale 比照)

---

## §E — H2 問題式改寫 + Executive Answer paragraph

AEO 問題式標題 20 分是因為 H2 都是 marketing 標語（「完全離線」、「我們的特色」），不是 search-intent 問題。

### E.1 — H2 改寫

找到 `index.html`（含其他 locale 版本）的 `<h2>` 元素，**逐一檢查** 並改成問題形式。建議對照表（zh-Hant）：

| 原 H2（推測） | 改寫成問題式 |
|--------------|--------------|
| Keeply 的特色 | 為什麼 Keeply 不是另一個 Git？ |
| 完全離線 | Keeply 可以離線使用嗎？ |
| 與 Dropbox 比較 | Keeply 跟 Dropbox 差在哪？ |
| 團隊功能 | Keeply 適合幾人團隊？需要每人付費嗎？ |
| 支援檔案 | Keeply 支援哪些檔案格式？ |
| 立即下載 | 怎麼下載 Keeply？要付費嗎？ |

如果實際 H2 跟上述不同，先用 grep 找出來再對應改寫。**不准刪 H2 內容，只改文字**。

### E.2 — 每個 H2 後加 Executive Answer paragraph

每個 H2 下方的第一段必須是**直接答案** —— 80-120 zh chars / 40-60 en words / 客觀無前言 / 直接 punchline。例：

> **Keeply 跟 Dropbox 差在哪？**（H2）
>
> Dropbox 同步「檔案目前的樣子」；Keeply 記住「檔案的每一個版本」。Dropbox 按人頭月費；Keeply 個人版永久免費，團隊版 $25/月 flat fee 不論幾人。你的檔案存在自己硬碟，不在 vendor 雲端。
>
> （後續才展開細節）

這跟既有 FAQPage 的 Q/A 是同一套答案 —— H2 mirror FAQ question，body 第一段 mirror accepted answer.text。直接從 schema 抓現成答案改寫。

### E.3 — i18n

各 locale 版本的 H2 + Executive Answer 必須同步改。**不准**只改 zh-Hant 不動其他。如果有 i18n 機制（`data-i18n-key`），改 key 對應的 translation；否則逐檔改 HTML。

---

## 結束驗證 checklist

跑完 §A-§E 後依序驗證：

1. `curl -s https://keeply.work/robots.txt` —— 確認看到 GPTBot/ClaudeBot/Google-Extended 都是 Allow。
2. `node _dev/inject-schema.js` —— 確認 exit 0，沒有 JSON 語法錯誤。
3. `curl -s https://keeply.work/ | grep -c '"@type"'` —— 應該數到 5 個（Organization + WebSite + SoftwareApplication + FAQPage + HowTo + Person = 6 種，但 Person 跟 Organization 可能合為 1 個 script，所以 ≥ 5 即可）。
4. 用 Google Rich Results Test (`https://search.google.com/test/rich-results`) 貼 `https://keeply.work/`，看 HowTo / FAQPage / Person 是否都 valid。
5. 用 Schema.org Validator (`https://validator.schema.org/`) 同上交叉驗。
6. 各 locale 首頁人工開瀏覽器，確認 footer founder byline 顯示正常。
7. 各 locale H2 確認改成問題式，下方有 Executive Answer paragraph。

最後 git commit + push 走平常 deploy 流程。隔天去 https://seo.av8d-levelup.com/ 重跑（記得開無痕，或等 00:00 Asia/Taipei 配額重置）。預期：綜合 64 → 80+。

## 不要做的事

- 不准動 `d:\tools\doing\Keeply\`（桌面 app repo）任何檔案。
- 不准動 `d:\tools\doing\keeply-blog\`（部落格 repo）任何檔案 —— 它已經獨立修好。
- 不准把 §A robots.txt 加 wildcard `Disallow` 規則 —— 全部 AI 爬蟲都該 Allow，只有 Bytespider/Diffbot/ImagesiftBot 例外。
- 不准在 §B HowTo schema 寫頁面實際沒有的步驟 —— schema 跟 visible content 必須 1:1。
- 不准 `git push` 前沒有 `node _dev/inject-schema.js` exit 0 + locale 抽樣人工檢查通過。

完成後回報：每個 §A-§E 的狀態（done / partial / skipped + 理由）+ 驗證 6-7 步的結果。

--- AI PROMPT END ---
