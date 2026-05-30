---
title: "Cloudflare 公開資訊作為 INV-8 合理證明（替代雙邊 DPA 確認信）"
product: "keeply"
doc-type: "evidence-pack"
version: "v1.0"
status: "draft"
created: "2026-05-30"
last_updated: "2026-05-30"
approvers: []
language: "zh-TW"
created_via: "research-agent (vendor compliance fanout, 8 sources)"
related:
  - "governance/2026-05-26-telemetry-two-tier-consent.md"
  - "art-30-processing-records.md (P-06)"
  - "privacy-2026-05-26.md (§2.5.2)"
  - "Keeply repo: cf-worker-telemetry/wrangler.toml, src/index.ts"
---

# Cloudflare 公開資訊 — INV-8 合理證明 Evidence Pack

## §0 性質聲明

本文以 **Cloudflare 官方公開資訊**（cloudflare.com legal pages、developer docs、trust hub、
DPF 名單）替代雙邊書面 DPA 確認信，作為 governance/2026-05-26 §6.1 **INV-8**（既有
Cloudflare DPA 涵蓋 D1 telemetry 儲存）之合理證明。

理由：Cloudflare 對自助方案（self-serve）客戶**不發個別雙邊 DPA 確認信**；標準 DPA
為「by-reference incorporation」式自動納入 Self-Serve Subscription Agreement。Keeply 為
solo controller、自助方案客戶，無 Enterprise account manager 可索取雙邊確認。

GDPR Art 5(2) accountability 容許以「合理可得之證據」（reasonably available evidence）證明
sub-processor 合規；Cloudflare 公開資訊為此類證據之主流來源（亦為大多數 SaaS vendor 對小客戶
的通用做法）。本文僅作 INV-8「替代證明」之用；若 Cloudflare 未來提供雙邊確認管道（如 Workers
paid plan 升級），仍應補強。

---

## §1 公開資訊蒐集

### §1.1 Cloudflare 標準 DPA

| 欄位 | 內容 |
|---|---|
| URL | https://www.cloudflare.com/cloudflare-customer-dpa/ |
| 當前版本 | **v6.4**, effective **April 3, 2026**（取自 cloudflare-customer-dpa 頁面，2026-05-30 取得） |
| 前一版本 | v6.3 (June 20, 2025)（PDF 仍可下載；本文蒐集時 v6.4 已為主版） |
| 取得日期 | 2026-05-30 |

**關鍵條文（取自 v6.4 與 v6.3）**：

- **適用範圍**：「This Data Processing Addendum, including the appendices (the 'DPA'),
  forms part of the Main Agreement.」（v6.4 開頭）
- **服務定義**：「all of the cloud-based solutions offered, marketed or sold by
  Cloudflare or its authorized partners that are designed to increase the
  performance, security and availability of Internet properties, applications and
  networks, along with any software, software development kits and application
  programming interfaces ('APIs').」
- **Self-Serve 自動納入（Self-Serve Subscription Agreement §6.1 Data Processing）**：
  「If Customer Content includes the personal data of European data subjects … then
  Cloudflare is a data processor or sub-processor, as applicable, and Cloudflare
  will handle such Personal Data in compliance with Cloudflare's Data Processing
  Addendum ('Data Processing Addendum'), which is **hereby incorporated by
  reference into this Agreement**.」
- **SCC**：「EU SCCs means the contractual clauses annexed to the European
  Commission's Implementing Decision **2021/914 of 4 June 2021**.」
- **Sub-processor §4.4**：「Cloudflare will maintain a list of sub-Processors at
  https://www.cloudflare.com/gdpr/subprocessors/ and will add the names of new and
  replacement sub-Processors to the list at least **thirty (30) days prior** to
  the date on which those sub-Processors commence processing of Personal Data.」

**Workers / D1 是否明確涵蓋**：v6.4 DPA 本文**未列舉個別服務名稱**，採「Services」
broad definition 涵蓋所有 cloud-based solutions（包含 SDK + API）。Workers 與 D1
為 Cloudflare 自家「cloud-based solutions」中的開發者平台，落入 broad definition。
**無明文排除清單**（無 carve-out for Workers/D1）。

### §1.2 D1 資料區域 / Data Residency

| 欄位 | 內容 |
|---|---|
| URL | https://developers.cloudflare.com/d1/configuration/data-location/ + release-notes |
| D1 GA | **2024-04-01 GA**：「D1 is now generally available and production ready.」 |
| 取得日期 | 2026-05-30 |

**關鍵事實**：

- **預設區域**：「D1 will automatically create your primary database instance in
  **a location close to where you issued the request to create a database**.」
  — 即依建立時的 origin IP 自動就近放置，**不保證任何特定國家**。
- **可指定 jurisdiction**（2025-11-05 起 GA）：兩個可選 jurisdiction：
  - `eu` — The European Union
  - `fedramp` — FedRAMP-compliant data centers
- **指定方式**：`wrangler d1 create <NAME> --jurisdiction=eu`，或 dashboard 建立時選擇，
  或 REST API 參數。
- **不可變更**：「Jurisdictions can only be set on database creation and cannot be
  added or updated after the database exists.」
- **Location hints**（不保證）：wnam / enam / weur / eeur / apac / oc — soft hint，
  CF 「will run in the nearest possible location (by latency) to your preference」。
- **查看方式**：`wrangler d1 info <DATABASE_NAME>` CLI command；或 Cloudflare
  dashboard → Workers & Pages → D1 SQL Database。

### §1.3 Workers + D1 隱私 / 安全承諾

| 欄位 | 內容 |
|---|---|
| URL | https://developers.cloudflare.com/d1/reference/data-security/ + trust-hub/gdpr/ + privacypolicy/ |
| 取得日期 | 2026-05-30 |

**D1 Data Security Page**：

- **At-rest**：「Objects are encrypted using **AES-256**」with 「**GCM (Galois/Counter
  Mode)** as its preferred mode」。「All D1-stored objects, including metadata and
  databases, use this automatic encryption without requiring user configuration.」
- **In-transit**：「Data transfer between a Cloudflare Worker and D1 is secured
  using **Transport Layer Security (TLS/SSL)**.」「API access via the HTTP API or
  using the wrangler command-line interface is also over TLS/SSL (HTTPS).」
- **認證引述**：SOC 2 + ISO/IEC 27001（指向 trust hub）。

**Cloudflare Privacy Policy / Trust Hub 一般性承諾**：

- 「We **do not sell** personal data we process, or use it for any purpose other
  than delivering our services.」（trust-hub/gdpr/）
- 「We will not sell or rent your personal information.」（privacypolicy)
- 「we do not permit our Service Providers to sell any personal information」

**[GAP]** Cloudflare 公開文件**未明文承諾**「不以 customer content（含 Workers/D1 處理
之資料）訓練 AI 模型」。trust-hub/gdpr/ 與 privacypolicy 皆未直接寫此句。
惟 DPA §4 processor obligations + 「not use for any purpose other than delivering our
services」可作間接論證。Keeply 風險低（D1 telemetry 內容為 OS/arch/locale + random id，
**本質上對 AI 訓練無價值**），但於本文明示為 residual gap。

### §1.4 Sub-processor List

| 欄位 | 內容 |
|---|---|
| URL | https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/ |
| 上次更新 | **2025-10-01** |
| 取得日期 | 2026-05-30 |

**第三方 sub-processors 摘要**（與 Workers/D1 處理通路相關者）：

| Sub-processor | 位置 | 服務 |
|---|---|---|
| Slack Technologies | US | Customer support |
| Zendesk | US/EEA/JP/AU | Customer support |
| Salesforce | US | Customer support |
| Google LLC | EEA/US/AU/IN | **Developer Platform**, Zero Trust, AI Gateway |
| Oracle America | US/EEA/UK/JP/AU/CA/SG | **Developer Platform**, Cache Reserve |
| AWS | US/EEA | Email Security |
| CoreWeave / Nebius | US/UK | Workers AI |
| Anthropic / OpenAI / X.AI / Groq | US/Global | AI Gateway |

**D1-specific sub-processor**：**無明列**。D1 為 Cloudflare 自家儲存層，未顯示委外。
Workers 之「Developer Platform」項目下列 Google LLC + Oracle America 為 sub-processor；
**Keeply 之 D1 + Worker（單純 fetch handler，不用 Workers AI、不用 AI Gateway）落入
此 Developer Platform 範疇**，故間接觸及 Google / Oracle 作為 infra-level
sub-processor。

**通知機制**：「Subscribe to our RSS feed to receive alerts whenever we make changes
to this list」（無 30 天 email 通知，採 pull 模式 — 建議 owner 將 RSS 加入 watch list）。

### §1.5 SCC / DPF / 跨境傳輸

| 欄位 | 內容 |
|---|---|
| 來源 | trust-hub/gdpr/ + dataprivacyframework.gov participant 5666 |
| 取得日期 | 2026-05-30 |

- **DPF 認證**：「Cloudflare has **certified its compliance** with the EU-U.S. Data
  Privacy Framework, the Swiss-U.S. Data Privacy Framework, and the UK extension to
  the EU-U.S. DPF for transfers to the United States.」
- **DPF 名單**：https://www.dataprivacyframework.gov/participant/5666 — 顯示 Active。
- **SCC 後備**：「Should these certifications lapse or become otherwise invalidated,
  Cloudflare relies on the **EU standard contractual clauses**, including
  supplementary measures as necessary for transfers to the United States.」
- **2025 新增認證**（2025-06-03）：「Global Cross-Border Privacy Rules (Global CBPR)
  and Global Privacy Recognition for Processors (Global PRP) systems.」

### §1.6 Workers Logs / Analytics 預設 IP 記錄

| 欄位 | 內容 |
|---|---|
| URL | https://developers.cloudflare.com/workers/observability/logs/workers-logs/ |
| 取得日期 | 2026-05-30 |

**Workers Logs（spec 297 telemetry Worker 對象）**：

- 預設行為：「You must **add the observability setting** for your Worker to write
  logs to Workers Logs.」— **opt-in**，不主動寫入。
- **預設 invocation log 內容**：「details such as the Request, Response, and related
  metadata」 — 文件未明列 client IP 為 default field。
- **關閉方式**（即 Keeply wrangler.toml 使用之設定）：
  ```toml
  [observability]
  enabled = false
  ```
  Keeply Worker `wrangler.toml` 第 13-14 行確認此設定為 active。
- **`invocation_logs = false`**：另一層細控（不關全 observability、只關 invocation log），
  Keeply 採完全關閉 observability 之更嚴格策略。

**Cloudflare Analytics 一般性**：「Cloudflare states they do not 'fingerprint' individuals
via their IP address, User Agent string, or any other data for analytics purposes」
（Web Analytics 系列頁面）— 但此為 Web Analytics 產品宣稱，**非 Workers Analytics**。

**[GAP / 殘餘 ambiguity]**：Cloudflare 文件**未明文宣告**「`[observability] enabled = false`
時，dashboard 端的 Workers Analytics（request count / error rate）是否亦不保留 IP」。
Workers Analytics 為 dashboard 附帶 metrics，文件未拆分。對 Keeply 風險：dashboard
metrics 可能仍以 aggregate 形式存在但**不影響 D1 落地**（INV-1 的「零 IP 落地」針對
D1 row，不針對 CF 自家邊緣 metrics）。應於 §4 標記為 known residual。

---

## §2 與 Keeply 對齊（PASS / GAP）

| Keeply claim | 來源 | Cloudflare 公開證據 | 狀態 |
|---|---|---|---|
| Cloudflare 為 Keeply 之 processor | privacy §2.5.2 / art-30 P-06 | DPA §4 + Self-Serve SSA §6.1 auto-incorporation；「Cloudflare is a data processor or sub-processor, as applicable」 | **PASS** |
| 既有 DPA 涵蓋 D1 telemetry 此**新處理活動** | INV-8 / art-30 P-06 | DPA broad「Services」定義涵蓋所有 cloud-based solutions + SDK/API；無 D1/Workers 排除條款 | **PASS（推定涵蓋）** |
| 跨境傳輸法源 = SCC | privacy §2.5.2 + art-30 P-06 | DPA 明引 2021/914 SCC + DPF certification primary + SCC fallback | **PASS** |
| 「無新增 sub-processor」 | governance §6 | Cloudflare 既為 P-03 sub-processor；D1 新處理活動仍由 Cloudflare 自身處理（D1 不外包），Developer Platform 之 infra sub-processor（Google/Oracle）為既有揭露 | **PASS（Cloudflare 法人不變；下游 Google/Oracle 為 Cloudflare 已揭露之 sub-sub-processor，落入 art-30 P-03 透明性框架）** |
| TLS in-transit + AES-256 at-rest | art-30 P-06 TOM 欄 | D1 data-security page 明文 AES-256-GCM + TLS/SSL | **PASS** |
| Worker zero IP 落地 | INV-1 / privacy §2.5.2 | `[observability] enabled = false` 為官方支援之 wrangler 設定；Keeply Worker 已套用；validateCount 100% 不讀 IP/cf-ipcountry | **PASS（實作 + 文件雙證據）** |
| 個資層 country 由 CF-IPCountry edge 推導、不存原始 IP | privacy §2.5.2 | Worker `src/index.ts:267` 確認僅讀 cf-ipcountry header、不讀 cf-connecting-ip；CF edge 推導為產品行為（無原始 IP 寫入 D1） | **PASS** |
| 保留期 = 12 個月 | art-30 §6 + privacy §8 | Worker cron `"0 3 1 * *"` + scheduled handler `DELETE FROM events WHERE created_at < strftime('%s', 'now', '-365 days')` 自動 enforce | **PASS（技術 enforce）** |
| 不販售 / 不挪作他用 | governance 補強條件 | trust-hub/gdpr：「do not sell … or use it for any purpose other than delivering our services」 | **PASS** |
| 不以 customer content 訓練 AI | (Keeply 未在 policy 明文宣稱) | **無明文承諾** — DPA processor 條款 + 「not for other purposes」可間接論證 | **GAP（軟）** |
| D1 jurisdiction = EU 或具體區域 | (Keeply 未明文宣稱) | Keeply 目前未指定 jurisdiction → D1 落於建立時 origin 之就近區域；用戶 IP 因此未 pinned 到 EU | **GAP（需 owner dashboard 自查 + 列入 §5 待辦）** |
| 30 天 sub-processor 變更通知 | (政策未明文承諾) | DPA §4.4 承諾 30 天 prior to commence；通知管道為 RSS（owner pull） | **PASS（vendor 端）+ ACTION（owner 端訂閱 RSS）** |
| Dashboard Workers Analytics 是否保留 IP | INV-1 嚴格解讀 | 文件**未明文**；observability=false 對 dashboard 邊緣 metrics 是否衍生 IP 保留**未明示** | **GAP（軟，邊緣聚合 metrics 不影響 D1 落地，但無法 100% 證明 CF 內部完全無 IP-bearing 暫存）** |

---

## §3 公開資訊無法涵蓋之缺口

### 3.1 D1 確切 region（owner 自查）

Cloudflare 公開文件僅說明「就近建立」 + 「可選 eu / fedramp jurisdiction」。Keeply 目前
之 D1 (`keeply-telemetry`) 建立時是否指定 jurisdiction、實際落於哪個區域，**只能由 owner
登入 dashboard 或執行 `wrangler d1 info keeply-telemetry` 確認**。

**對 art-30 P-06 影響**：「跨境傳輸 → Cloudflare 全球邊緣 + D1（含美國）」此宣稱為保守
最大涵蓋；若 owner 自查確認 D1 已 pinned 至 EU jurisdiction，可改寫為「EU only」並降低
SCC 觸發頻次（EU→EU 不觸發跨境機制）。**目前保持「含美國」是安全的揭露**。

### 3.2 AI 訓練免責明文承諾（vendor 端缺）

無 public-facing 文件直接寫「Cloudflare 不以 Workers/D1 customer data 訓練 AI 模型」。
僅 DPA processor 條款 + 「not for other purposes」可推論。對 Keeply 風險低（D1 內容為
OS/arch/locale + random id，**對 AI 訓練無實質價值**），但 strict-mode 政策可能要求明文。

**建議行動**：列入 §5 owner 待辦 — 若可接受 residual，於下次 privacy review 加入註解
「Cloudflare 於 v6.4 DPA 與 trust-hub 公開承諾不販售、不挪作他用 personal data；雖無
明文 AI 訓練免責句，processor 條款結構性禁止此用途」。

### 3.3 Dashboard 端 Workers Analytics IP 保留行為

`[observability] enabled = false` 確認關閉 Workers Logs (D1-bound logging product)。
但 Cloudflare dashboard 之 built-in Workers Analytics（request count / error rate / CPU
time）是否在內部以 IP-bearing 形式短暫保留以做 aggregate，**官方文件未拆分說明**。

**對 INV-1 影響**：INV-1 字面要求「Worker **零 IP 落地**」，主要針對 D1 row（已驗證
100% PASS）。dashboard 之邊緣 aggregate metrics 不寫 D1、不對 owner 暴露 row-level IP；
CF 內部短暫處理屬 P-03 既有 CDN 觀察行為（與 keeply.work 網站日誌同性質，art-30 已涵蓋）。
不算 INV-1 違反，但建議於 governance 補一句明確：「INV-1 之『零 IP 落地』指 Keeply 控制
之 D1 儲存層；CF edge 內部 metrics 暫存依 CF 既有 sub-processor 揭露（P-03/P-06）。」

### 3.4 雙邊書面確認信永久不可得

Cloudflare 自助方案無 account manager 路徑可索取個別客戶之雙邊 DPA 簽署確認。Enterprise
方案有此服務但年費 $5k+。Keeply solo SaaS 規模不合理升 Enterprise 僅為取得簽署紙本。

**緩解**：本 evidence pack 即為合理可得證據之 best-effort 集合。律師 review 時應確認此
做法是否被接受為 Art 5(2) accountability 充分證明。

---

## §4 結論：INV-8 是否 substantially met？

**結論：YES（substantially met）+ 1 明確待辦**

### 4.1 PASS 之依據

1. Cloudflare DPA v6.4 透過 Self-Serve SSA §6.1 **auto-incorporation** 自動納入合約 —
   Keeply 已接受 SSA → DPA 已生效，**無需個別簽署**。
2. DPA「Services」broad definition 涵蓋所有 Cloudflare cloud-based solutions + SDK/API，
   D1 與 Workers 落入此定義，**無排除清單**。
3. 跨境傳輸雙保險：DPF active certification（primary） + SCC 2021/914（fallback）—
   art-30 P-06 「SCC」之宣稱為合法基礎之一。
4. Sub-processor 透明性（§4.4 30 天 prior） + 公開清單 URL + RSS 通知機制全到位。
5. D1 加密 (AES-256-GCM at-rest + TLS in-transit) 滿足 art-30 P-06 TOM 欄位。
6. Worker zero-IP 落地以 Keeply 自身 code review 確認 + Cloudflare 官方 wrangler 設定
   支援 (`[observability] enabled = false`)。

### 4.2 GAP 之 residual risk

- **AI 訓練免責**為軟 gap，內容性質使風險極低，建議於下次 privacy review 補軟性說明，
  非 blocking。
- **D1 region** 為 owner-side 自查事項，不影響 INV-8 抽象成立；art-30 P-06 已保守揭露
  「含美國」，自查後可選擇收斂或維持現狀。

### 4.3 是否仍需主動發信？

**不需要對 Cloudflare 發信。** 三層判斷：

1. Cloudflare 公開政策明示**不對 self-serve 提供個別確認**（產業通例）。
2. 公開資訊已涵蓋 INV-8 法定要求之 substance（合法基礎 + 跨境機制 + 服務涵蓋 + TOM +
   sub-processor 透明性）。
3. 發信亦不會收到回覆 → 反而留下「未收到回覆」之文件痕跡，反不利。

**建議改作**：將本 evidence pack 列為 art-30 P-06「相關文件」欄位之主引用，並於 INV-8
欄位狀態由「待辦」改為「**以 cloudflare-public-evidence-2026-05-30.md 證明**」。

### 4.4 下次重新驗證觸發條件

- DPA 版本變動（自 v6.4 起）— 建議 owner 每 6 個月查一次 cloudflare-customer-dpa 頁面。
- Cloudflare 新增 D1-touching sub-processor（RSS 通知）— owner 訂閱 RSS 後 30 天內評估。
- DPF certification 失效 — Cloudflare 已承諾 SCC fallback，但需更新 art-30 P-06 跨境機制
  欄。
- D1 jurisdiction 政策變更（如 EU 之外新增 jurisdiction）— 可考慮指定 eu 以收斂跨境
  通路。

---

## §5 Owner 待辦清單（dashboard 自查）

> 以下為 owner（wei@keeply.work）需親自於 Cloudflare dashboard 或 CLI 確認之項目。
> 完成後請更新本檔 §5.x 之「完成日期 + 結果」欄位。

### 5.1 確認 D1 (`keeply-telemetry`) 之實際 region / jurisdiction

**指令**：
```bash
wrangler d1 info keeply-telemetry
```
或登入 https://dash.cloudflare.com → Workers & Pages → D1 SQL Database →
`keeply-telemetry` → 查看 Region / Jurisdiction 欄。

**期望結果**：記錄目前 region（如 `wnam` / `weur` / 具體 jurisdiction）。
**決策**：
- 若 region 為 EU（weur/eeur 或 jurisdiction=eu）→ art-30 P-06 跨境機制可註明「主要 EU
  儲存 + 推送 origin 可能跨境」。
- 若 region 為 US/亞洲 → 維持現有保守揭露「含美國」。
- 若希望未來新建 D1 強制 EU → 須 **drop and recreate** 並加 `--jurisdiction=eu`
  （**jurisdiction 不可後改**）。

**完成日期 / 結果**：[ ] 待 owner 填寫

### 5.2 訂閱 Cloudflare sub-processor RSS

**URL**：https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/ 頁尾 RSS 連結

**動作**：加入 owner 之 RSS reader（如 Feedly / Inoreader）或設定 email digest。

**完成日期**：[ ] 待 owner 確認

### 5.3 截圖存證

建議 owner 截圖留證以下三頁（佐證本 evidence pack 蒐集時點屬實）：

1. https://www.cloudflare.com/cloudflare-customer-dpa/ （顯示 v6.4 + 2026-04-03）
2. https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/ （顯示
   2025-10-01 last updated + 第三方清單）
3. https://www.dataprivacyframework.gov/participant/5666 （DPF active status）

**截圖建議命名**：`third-party-agreements/cloudflare/2026-05-30-{dpa|subprocessors|dpf}.png`
**完成日期**：[ ] 待 owner 截圖並存放

### 5.4 art-30 P-06 INV-8 欄位狀態更新

**動作**：將 `art-30-processing-records.md` P-06 表格之「**待辦（INV-8）**」欄位
改寫為：

```markdown
| **INV-8** | **MET** — 以 `cloudflare-public-evidence-2026-05-30.md` 證明：
Cloudflare DPA v6.4 透過 Self-Serve SSA §6.1 auto-incorporation 涵蓋本處理活動；
broad「Services」定義包含 D1 + Workers；無排除清單。
雙邊書面確認信因 vendor 政策不可得，採公開資訊證明。下次複審：2026-11-30。 |
```

**完成日期**：[ ] 待 owner 編輯 art-30 P-06

### 5.5 governance §6.1 INV-8 狀態更新

**動作**：將 `governance/2026-05-26-telemetry-two-tier-consent.md` §6.1 INV-8 條目改為
「**MET — 以 cloudflare-public-evidence-2026-05-30.md 證明**」。

**完成日期**：[ ] 待 owner 編輯 governance 文件

---

## §附錄 A：紅旗（research 過程中發現的潛在問題）

### A.1 D1 預設區域不可預測

D1 「就近建立」邏輯依據 wrangler push 時的 origin IP；Keeply Worker 若由 owner 從台灣
建立，**預設可能落 apac（Tokyo/Singapore）**，而非歐美。對 art-30 P-06 之「含美國」
揭露可能過度保守（實際 D1 可能僅在 APAC）；亦可能 under-represent（若 read-replicas
擴散）。**§5.1 owner 自查為解。**

### A.2 D1 read replication 預設啟用情形未確認

文件「When using D1 read replication, D1 automatically creates a read replica in
every available region」— 此為 opt-in feature，但 owner 應確認 `keeply-telemetry`
D1 未誤啟 read replication（會造成 telemetry 個資複製到全球各區，超出 P-06 揭露範圍）。

**建議**：`wrangler d1 info keeply-telemetry` 輸出檢查是否有 read replicas 欄位。
若有且非 EU-pinned，考慮關閉。

### A.3 Workers Analytics dashboard 之邊緣 metrics

`[observability] enabled = false` 關閉 Workers Logs（寫入 D1-adjacent log store），
但 dashboard 上「Requests」「Errors」「CPU time」等 built-in metrics **無 opt-out**。
此為 CF 既有 P-03 sub-processor 行為範疇，**不違反 INV-1**（INV-1 針對 D1 落地），
但 governance 文件可補一句明示界線。

### A.4 Cloudflare AI 訓練免責無明文

雖風險低，但若 EU DPA 嚴格 reviewer 質疑，無 verbatim quote 可援。**建議**於下一版
privacy policy 採「processor 結構性禁止 + 內容無 AI 訓練價值」雙論述應對。

### A.5 Self-Serve SSA §6.1 觸發條件為「Customer Content includes personal data」

DPA auto-incorporation 條件為 SSA §6.1 之「If Customer Content includes …」。Keeply
傳送至 D1 之 telemetry 個資層內容（OS/arch/locale + random id + country）屬於
「personal data of European data subjects」 → 觸發條件成立 → DPA **生效**。
**無 ambiguity**。

---

**文件控制**

- 版本：v1.0（draft，待 owner 完成 §5 待辦後升 v1.1）
- 蒐集者：research-agent (vendor compliance fanout, 2026-05-30)
- 來源計：8 個 Cloudflare 官方 URL + 1 個 US 政府 DPF 名單 URL
- 下次例行重審：2026-11-30（半年）或觸發條件（§4.4）
- 取代：N/A（首版）
