# Cloudflare + OG 分享卡設定（2026-04-27 戰場筆記）

> 部落格分享到 FB/LinkedIn/Threads 顯示大圖預覽卡的完整設定。下次文章發布如果遇到「分享沒圖」，先讀這篇再 debug。

## TL;DR

`blog.keeply.work` 是 Hugo → GitHub Pages → Cloudflare Free 三層架構。要讓社群分享出大圖卡，需要同時滿足 **Hugo OG meta tags 完整** + **Cloudflare 不擋社群爬蟲** + **`robots.txt` 顯式 allow**。任一層壞掉都會讓分享變成「只有網域名稱」的醜卡。

## 設定清單（按層級）

### 1. Hugo / repo 層

#### `layouts/_partials/head.html`

完整 OG / Twitter meta tags，含尺寸提示（FB / LINE 缺尺寸會 fallback 到小卡）：

```html
<meta property="og:image" content="{{ $ogImage }}" />
<meta property="og:image:secure_url" content="{{ $ogImage }}" />
<meta property="og:image:type" content="{{ $ogImageType }}" />
<meta property="og:image:width" content="{{ $ogImageWidth }}" />
<meta property="og:image:height" content="{{ $ogImageHeight }}" />
<meta property="og:image:alt" content="{{ $title | plainify }}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="{{ $ogImage }}" />
<meta name="twitter:image:alt" content="{{ $title | plainify }}" />
```

寬高從 Hugo Resources 動態取（raster 才有，SVG 自動 fallback 1600×900）。詳見 `layouts/_partials/head.html`。

#### 文章 frontmatter

每篇 `content/{locale}/post/{slug}/index.md` 必含：

```yaml
image: cover.svg       # 站內顯示用（向量）
og_image: cover.png    # 社群卡用（柵格，FB/X 不吃 SVG）
```

#### `static/robots.txt`

顯式 allow 所有社群爬蟲、disallow AI 訓練 bot。**重點**：覆蓋 Cloudflare 自動 inject 的 managed robots.txt（後者會擋 `meta-externalagent` 等）。

關鍵段落：

```
User-agent: facebookexternalhit
Allow: /
User-agent: meta-externalfetcher
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: Slackbot
Allow: /
User-agent: Discordbot
Allow: /
# AI 訓練 bot 全 disallow（GPTBot, ClaudeBot, meta-externalagent ...）
```

### 2. Cloudflare 層

進 https://dash.cloudflare.com → keeply.work zone。

#### AI Crawl Control

左邊側欄 **AI Crawl Control**：

| 設定 | 值 |
|---|---|
| 封鎖 AI 訓練機器人 | **請勿封鎖（允許網路爬蟲）** |
| 管理您的 robots.txt | **停用 robots.txt 設定** |

理由：CF 的 managed robots.txt 會 inject `meta-externalagent: Disallow`，FB Debugger 看到後會誤判 403（FB 有 known bug，把任何 403 都顯示成 robots.txt 問題）。我們用自家 robots.txt 替代。

#### IP Access Rules（網路安全 → WAF → 工具）

允許 Meta 整段 ASN：

| Value | Action | Notes |
|---|---|---|
| `AS32934` | Allow | Meta / Facebook scraper |
| `AS63293` | Allow | Facebook secondary ASN |

CF 文件：Allow IP Access Rule 會自動 override BFM、BIC、Security Level、UA Block。

#### WAF Custom Rule（網路安全 → WAF → 自訂規則）

對所有社群爬蟲做 Skip 全部安全檢查：

```
(http.user_agent contains "facebookexternalhit") or
(http.user_agent contains "facebookcatalog") or
(http.user_agent contains "meta-externalfetcher") or
(http.user_agent contains "Twitterbot") or
(http.user_agent contains "LinkedInBot") or
(http.user_agent contains "Slackbot") or
(http.user_agent contains "Discordbot") or
(http.user_agent contains "WhatsApp") or
(http.user_agent contains "TelegramBot") or
(ip.src.asnum eq 32934) or (ip.src.asnum eq 63293)
```

Action: **Skip**，勾選跳過：
BIC（Browser Integrity Check）、Hotlink Protection、Rate Limiting、Security Level、UA Blocking、Zone Lockdown、所有 WAF Managed Rules、所有 SBFM 規則。

跟 IP Access Rule 互為冗餘——IP Rule 涵蓋從 Meta IP 來的所有流量；UA Rule 涵蓋任何 IP 但宣告 FB UA 的流量。雙保險。

### 3. 部署後驗證（每次新文章都要跑）

```bash
# 從本機模擬 FB 爬蟲
curl -sI --compressed \
  -H "Range: bytes=0-524288" -H "Connection: close" \
  -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" \
  "https://blog.keeply.work/{locale}/post/{slug}/" \
  | grep -iE 'HTTP|cf-ray|cf-mitigated|cf-cache-status|server'
```

通過條件：
- `HTTP/2 200`（或 206 with Range）
- 有 `cf-ray`
- **無 `cf-mitigated`**（出現代表被 CF challenge 擋）

## 已知陷阱

### FB Debugger 顯示 403 + robots.txt 提示是 known bug

> "Bad Response Code … Please allowlist facebookexternalhit on your sites robots.txt config"

這條提示**不論真實原因為何都會出現**（自 2024 年 3 月起，[FB bug report](https://developers.facebook.com/support/bugs/1085796049211789/)）。看到這個訊息時：

1. 用 LinkedIn Post Inspector / Threads / 真實 FB 貼文預覽 cross-check
2. 如果 LinkedIn 過 → 設定沒問題，是 FB 自己的 cache stuck，等 24–72 小時
3. 不要被誤導去改 robots.txt

### FB cache 黏 30 天

每次改完 CF 設定後，要用 **Batch Invalidator**（不是 Sharing Debugger 的 Scrape Again）清空：

https://developers.facebook.com/tools/debug/sharing/batch/

URL 用**空格分隔**貼進文字框（不是換行），按「偵錯」→ 等 5 分鐘 → 再回 Sharing Debugger。

### Cloudflare Free 的 silent 403

Free 方案的 BIC + Security Level (Medium 預設) 會對 IP 信譽分數低的 ASN 自動 challenge / block，**且不一定寫到 Security Events log**（抽樣保留 24h）。Cloudflare Trace 工具不模擬 IP 信譽，會誤報「全 pass」。

判斷邊緣 vs 原始的標頭差異：

| Signal | CF edge 403 | GH Pages 原始 403 |
|---|---|---|
| `cf-ray` | 有 | 有（CF 仍代理） |
| `cf-cache-status` | 常缺席 | `DYNAMIC` / `MISS` / `BYPASS` |
| `cf-mitigated: challenge` | challenge 時出現 | 沒有 |
| `x-served-by` / `x-github-request-id` / `via: 1.1 varnish` | 沒有 | **有** |

只要 403 沒有 `x-served-by` → 99% 是 CF 自己回的。

### Cloudflare managed robots.txt 會 override 你的 static/robots.txt

CF 邊緣攔截 `/robots.txt` 並回自家版本，即使你的 GitHub Pages 已經有 robots.txt。**必須**在 dashboard 裡停用：AI Crawl Control → Directives → 「停用 robots.txt 設定」。

驗證：

```bash
curl -s "https://blog.keeply.work/robots.txt?cb=$(date +%s)" | head -3
```

第一行應該是 `# Keeply Blog robots.txt`（自家版）；如果是 `# As a condition of accessing this website...` 則仍是 CF 版。

## 自動化腳本

`scripts/refresh-og-cache.sh`：

```bash
# 列出 4 個 launch locale 的 URL + 對應的 FB / LI debugger 連結
bash scripts/refresh-og-cache.sh {slug}

# 自動開瀏覽器分頁刷快取
bash scripts/refresh-og-cache.sh {slug} --open

# Graph API 重抓（需 FB_GRAPH_TOKEN）
FB_GRAPH_TOKEN=xxx bash scripts/refresh-og-cache.sh {slug} --fb-api
```

`/blg` Touch 4 step 12 自動跑 `--open` 模式，新文章發布時會自動開 FB Debugger / LinkedIn Inspector 的分頁讓你刷快取。

## 戰場時序（2026-04-27）

從「FB 分享沒圖」到收工花了約 3 小時，主要時間花在：

1. 加 OG meta tags 寬高（30 分鐘）
2. 自家 robots.txt 取代 CF managed（30 分鐘）
3. CF dashboard 戰術調整（AI Crawl Control / Bot Fight Mode / Browser Integrity Check 全關）（30 分鐘）
4. CF Trace 診斷 + IP Access Rules + WAF Custom Rule（45 分鐘）
5. 用 LinkedIn / Threads cross-check 確認 FB Debugger 自身 bug（30 分鐘）

收尾結論：**LinkedIn 過 = 設定無誤；FB Debugger 自己壞**。實際 FB 分享貼文（非 Debugger）通常正常，cache 會在 24–72 小時自然修復。
