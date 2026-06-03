# AEO Baseline — 2026-06-03

> Scope: 全 Keeply web（keeply.work apex + blog.keeply.work）。
> 取數：GA4 via analytics-mcp（property **534326745** = "keeply.work"，含 blog stream）;
> AI Visibility = Ahrefs free AI Visibility Checker via Playwright MCP（真實登入 Chrome,Cloudflare 過驗證）。
> ⚠️ 只收經查證的事實 —— 原始數字會誤導,必驗 topics/domains（見下方碰撞案例）。

## 1. 下游結果指標 — GA4 AI 搜尋 referral（近 90 天）

**AI 搜尋引擎 referral = 0。** sessionSource 清單裡完全沒有 chatgpt.com / perplexity.ai / gemini / copilot / claude.ai。

- 真實流量 ~231 session（hostName: blog.keeply.work **182** + keeply.work **49**)。
- 來源:direct 184、google 20、instagram 16、blog→apex 14、bing 14、facebook 系 13、threads 4、github 3…
- 🧹 資料衛生:127.0.0.1 + localhost 共 **39 session** 被記進 GA4（本機 dev build 在打 GA,佔 ~14%)→ 該在 GA4 設 internal-traffic filter 濾掉。

## 2. 上游能見度 — AI Visibility Checker（brand = "Keeply"）

**原始 Total Mentions = 50**（ChatGPT 1 / Perplexity 7 / Copilot 1 / AI Overviews 6 / **AI Mode 34** / AI Mode-new 1）。

**⚠️ 但查證後 = 同名碰撞,不是本 Keeply。** Top topics / cited domains 全是**瑞典廚房家電**:

| Top topics | Top-cited domains |
|---|---|
| vattenkokare med temperaturinställning（溫控熱水壺) | elgiganten.se（瑞典電器零售） |
| espressomaskin billig（便宜濃縮咖啡機) | kaffecompagniet.se |
| kitchenaid vattenkokare / skärmaskin（切片機) | bäst-i-test.se / pricerunner.se / reddit.com |

跟「檔案版本管理」零關係。唯一沾邊「folder lock」1 次（仍可能指別的軟體）。
→ **真正 Keeply 在本業類別的 AI 能見度 ≈ 0;那 50 是品牌名碰撞噪音。**

## 3. 結論（verified）

- 下游 0 referral + 上游本業 ≈ 0 → **現在沒有真實 AI 訊號。**
- **不買 Brand Radar（$199–699/月)**:會去追「瑞典家電的 Keeply」或追到零。免費 checker 已把買不買的 gate 用數據關掉。
- AEO 是**內容/品牌權威 + 實體消歧**工程(讓 AI 把「Keeply」綁定到檔案管理,而非熱水壺;靠 Organization schema/sameAs + 被權威站引用),不是買工具能解。

## 3b. Site Explorer 佐證(blog.keeply.work,Ahrefs 索引,2026-06-03)

第三個獨立來源再次證實 0 AI 訊號 + 揭露真正瓶頸:
- **AI citations 全平台 = 0**（AI Overviews / ChatGPT / Perplexity / Gemini / Copilot / Grok 全 0)。
- **Domain Rating = 0;Backlinks = 0;Referring domains = 0。** ← 結構性瓶頸:**0 連結 = 0 權威**。
- Organic keywords = 2（Ahrefs 估值;**Ahrefs 對小/新站嚴重低估**,GSC 的 765 已索引/33 點擊才是真相)。
- 推論（grounded）:**瓶頸不是內容量（765 頁已存在），是 authority/能見度**。765 頁 vs 33 點擊 = 內容換不到能見度;DR 0/0 backlink 是排名與 AI 引用上不去的根因。在 0 連結站上加內容 ≈ 多產不排名的頁。→ 槓桿 = 建 backlink/被引用 + 內容打「低 DR 也贏得了」的需求,不是「再多寫」。
- **斷鏈回收 = N/A**（0 backlink,無斷鏈可回收）;**page-2 near-win** 要用 GSC（Ahrefs 低估）。

## 4. 下次對照
- 重跑時機:做完一輪 entity/authority 工作後,或 ~季度。
- 看:GA4 是否首次出現 AI referral(>0);AI Visibility Checker 的 topics 是否開始出現「file / version / backup」類(脫離家電碰撞)。
- 方法:GA4 用 analytics-mcp;AI Visibility Checker 用 Playwright MCP 驅動真實登入 Chrome(自動化會被 CF 擋,真 session 才過)。**raw 數字必驗 topics,別直接信。**
