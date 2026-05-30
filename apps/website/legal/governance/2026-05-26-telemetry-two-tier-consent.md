---
title: "Keeply Desktop Telemetry — Two-Tier Consent Design & Accountability Note"
product: "keeply"
doc-type: "governance"
version: "v1.1"
status: "approved"
created: "2026-05-26"
last_updated: "2026-05-30"
approvers: ["WEIWEI"]
supersedes: null
language: "zh-TW"
created_via: "manual (design note; not a LAW 5-doc-type)"
---

# Keeply 桌面 Telemetry — 雙層 Consent 設計與問責紀錄

> 對應實作：Keeply spec 296–299（`D:\tools\doing\Keeply`）。本文是 telemetry 上線的
> **問責（accountability）書面 + 工程驗收條件橋接**。consent 路線（Art 6(1)(a)）不需 LIA，
> 本文**取代** LIA 的角色，並把資料保護不變量寫成 blocking 驗收條件。

## 1. 背景與決策

KEEPLY_TELEMETRY_PRD（2026-05-26）要回答「~150–250 活躍安裝從哪來」（winget vs direct），
解 winget 的 git 定位 vs 品牌 P0.2 的 trade-off。

**初版設計（全域 opt-out / Art 6(1)(f)）經 2 輪 context-isolated 紅隊壓測後駁回**，理由：

1. **自家網站雙標**：`keeply.work` 的 GA4 + Microsoft Clarity 皆 **opt-in**（Consent Mode v2
   default-denied + cookie banner）。同一 controller 對「了解使用狀況改善產品」的同義目的，
   網站 opt-in、桌面 opt-out → GDPR Art 5(2) accountability 不一致。
2. **監理前例**：Windows 10 telemetry 經荷蘭 DPA 裁定違反 GDPR，理由「opt-out ≠ unambiguous
   consent」。
3. **既有承諾**：現行 privacy §2.3「Keeply 伺服器端的資料：無」+ 官網「does not collect or
   transmit any telemetry」→ telemetry 上線即 Art 13 透明性違規（重演 2026-04-23 ipapi 事件，
   見 `governance/2026-04-23-remove-ipapi-geolocation.md`）。
4. **ePrivacy Art 5(3)**：telemetry 無 fingerprint 那樣的 5(3)(b)「使用者請求之服務」豁免。
5. **n≈200 小母體**：持久 `anonymous_id` + 設備欄位組合是 pseudonymous（非匿名），re-id 風險高。

**決議：採「雙層（two-tier）」模型**（紅隊背書為最乾淨）。

## 2. 雙層架構

### 2.1 匿名層（Anonymous Tier）— 無同意、所有人皆送

- **送什麼**：僅單一 enum `source ∈ {winget, direct, homebrew, unknown}`。**無** id、無 os/arch/
  locale、無精確時間戳。
- **後端**：Cloudflare Worker 對計數器做 **atomic increment**；D1 只存聚合 `{source: count}`，
  **永不存個別 row、永不存 IP**。
- **去重**：靠 app 本機 `first_run_sent` flag（spec 296，每台機器一次），非伺服器 id。
- **法律定位**：**真匿名 → 非個人資料 → 不受 GDPR 管轄**。答 PRD 核心「winget vs direct %」為
  **全母體普查**（修正 opt-in 的 self-selection 偏誤）。
- **WP29 Opinion 05/2014 三測**（前提 = §3 不變量全達標）：
  - Singling-out：✅ 聚合計數無法挑出個人。
  - Linkability：✅ 單欄位、無 id、無時間 → 無法跨記錄關聯。
  - Inference：✅ 4 值計數推不出個人屬性。

### 2.2 個資層（Personal Tier）— opt-in 同意才送

- **送什麼**：os / os_version / arch / locale / app_version + heartbeat 留存 + 持久 `anonymous_id`。
- **法源**：**GDPR Art 6(1)(a) 同意**。預設不送；使用者明確選擇「允許分享使用統計」才送。
- **資料最小化（Art 5(1)(c)，同意不豁免）**：country 僅國家級（CF-IPCountry）；heartbeat
  **週/月聚合**（不可重建逐日行為曲線）；os_version 粗化（大版本，無 build number）；評估
  rotating daily id 取代持久 id。

## 3. BLOCKING 實作不變量（= 驗收條件）

> **匿名層的「真匿名」是 implementation invariant，不是 design claim。漏任一條 → 退回
> pseudonymous → 「不需同意」基礎崩。以下為 ship 前 blocking 驗收條件。**

| # | 不變量 | 驗收 |
|---|--------|------|
| INV-1 | Worker **零 IP 落地**：關閉該 endpoint 的 request log + CF Analytics IP 記錄；計數用 atomic increment；**禁 per-event row、禁存到達時間戳**（連分鐘級不行） | Worker 設定審查 + D1 schema 只有聚合行 |
| INV-2 | **拿掉 spec 297 的 IP-hash rate-limit**（匿名層靠本機 flag 去重、不需伺服器 rate-limit）；防濫用改 CF WAF 無狀態，不落地任何 IP 衍生值 | code review：無 IP/IP-hash 進入儲存或 KV |
| INV-3 | privacy **§2.3「伺服器端資料：無」上線前先改寫** + 官網「never telemetry」措辭改寫 | 政策 diff 已 merge 早於/同步匿名層上線 |
| INV-4 | modal **棄「允許/不要」二元**：明示「拒絕也會送一筆無法識別你的安裝來源計數（像數下載次數）」；兩鈕視覺權重對等（EDPB 3/2022 deceptive-design）；設定提供匿名層 **kill switch**；匿名層 payload 可被使用者檢視 | UI review + 文案審 |
| INV-5 | **Unlinkability**：匿名層 beacon 與個資層 payload **時間去耦**（不同 endpoint + 匿名層絕不落 IP/時間 → 消滅 IP/時間/session 接合鍵） | §4 論證 + code review |
| INV-6 | 匿名層 **schema 凍結為單欄 `source`**；任何新增欄位必須重做 WP29 三測、預設視為個資層 | governance：schema 變更須回本文審 |
| INV-7（個資層） | Art 6(1)(a) 同意四要件（無預勾、informed 文案含「收什麼/誰收=Cloudflare/可撤回」、撤回與給予一樣容易）+ **版本化同意紀錄**（version+timestamp）+ 既有 ~200 用戶 **30 天 app 內公告**（§9 重大變更） | UI/consent-store review + 政策 §9 程序 |

## 4. Unlinkability 論證

威脅：同一 opt-in 使用者的個資層 payload（帶 id）與匿名層 beacon（source）若有共同接合鍵
（IP / 時間 / session）→ 可 join → 反推、去匿名化匿名層。

消除每一個接合鍵：

- **IP**：匿名層 Worker 零 IP 落地（INV-1/INV-2）→ 無 IP 接合鍵。
- **時間**：匿名層 beacon 與個資層 payload 不同刻送（jitter / 攢到下次啟動）→ 無「同一 first-run
  時刻」接合鍵。
- **session**：兩層無共用 session token；匿名層無任何 id。
- **共同欄位**：個資層**不收 install_source**（維持 spec 設計）→ 即使誤 join 也無新增資訊。

結論：四接合鍵全消除 → 兩層技術上不可接合。

## 4.5 Telemetry 個資層 ↔ Feedback 跨通路接合鍵分析

> **目的**：論證 Keeply telemetry 個資層（spec 297 `/event` endpoint → D1）與 feedback 通路（`wei@keeply.work` / 支援請求 / 未來 in-app feedback）之間**不可接合**，以滿足 EDPB 01/2025 pseudonymisation 「supplementary information 分離管理」要求，並閉合 unlinkability 論證之跨通路維度。

### 四接合鍵逐一分析

**接合鍵 1：識別碼 (id)**

- Telemetry 個資層使用 **rotating-daily-id** = `sha256(daily_salt || date)[..16]`（Spec B D4）。Salt 存於使用者本機；伺服器端不持有 salt → 無法重算任意日期之 id。
- Feedback 通路若使用持久識別碼，現行設計（email / 自由文字）與 telemetry rotating-id **無共同欄位**。
- **結論：id 接合鍵已切斷。** 閉合條件：Spec B D4（rotating-daily-id 獨立於 feedback 持久 id）已實作。

**接合鍵 2：IP 位址**

- Telemetry Worker（spec 297）：`[observability] enabled = false`（INV-1）+ 移除 `hashIp`/`RATE_LIMIT_KV`（INV-2）+ code 不讀 `cf-connecting-ip`。D1 row 零原始 IP。
- Feedback 通路（email / 支援請求）：即使 email header 含寄件方 IP，該 IP 僅存於 Zoho email（P-05 處理活動），**不與 D1 telemetry 交集**。Telemetry 端**無 IP 可對齊** → join 無共同 IP key。
- 殘餘邊界：Feedback worker 若採 KV 存明文 IP 作 rate-limit（5 分鐘窗口），該 IP 只在 feedback 側短暫存在，**telemetry 端同時刻無對應 IP 記錄** → 無法跨通路 join。
- **結論：IP 接合鍵已切斷。** 閉合條件：(a) telemetry Worker 零 IP 落地（INV-1 + INV-2，已驗收）；(b) email IP 隔離於 Zoho P-05，不進 D1。

**接合鍵 3：時間戳**

- Telemetry 個資層：無精確事件時間戳落地（INV-1 禁存時間戳；heartbeat 以週/月彙總，INV 已驗收）。
- Feedback：使用者可能於操作同一功能時同步送出 feedback 與 telemetry 事件，時間相近。
- **然而**：時間接合需有至少一個共同識別欄位方能成立。id 已 rotating（接合鍵 1 斷）、IP 兩端皆零或隔離（接合鍵 2 斷）、session 無共用（接合鍵 4 斷）→ **時間單獨不足以 join**。
- **結論：時間接合鍵條件不成立（依賴其他接合鍵，皆已斷）。**

**接合鍵 4：Session Token**

- Telemetry Worker：stateless，無 session 機制，無 cookie，無 auth token。
- Feedback 通路：email 無共用 session；若未來有 in-app feedback UI，應確保不共用 telemetry session 識別。
- **結論：session 接合鍵不存在。** 閉合條件：未來 in-app feedback 若引入 session，須回本文重做分析。

### 綜合結論

| 接合鍵 | 狀態 | 閉合依據 |
|--------|------|----------|
| 識別碼 id | **已斷** | Spec B D4（rotating-daily-id，獨立於 feedback） |
| IP 位址 | **已斷** | INV-1 + INV-2（telemetry 零 IP）；Zoho P-05 隔離 |
| 時間戳 | **不成立** | 無獨立識別欄位，時間單獨不足 join |
| Session token | **不存在** | Telemetry Worker stateless |

**四鍵全斷 → telemetry 個資層與 feedback 通路技術上不可接合。**

### 閉合條件（Closing Conditions）

本分析成立前提為以下三點均已達成：

(a) **Spec B D4**：rotating-daily-id 實作完成，獨立於 feedback 任何持久識別碼。

(b) **B-1 延伸**：telemetry 端所有端點（含個資層 `/event`）零 raw IP 落地（INV-1 + INV-2 已驗收）。

(c) **本分析**載入問責文件（本節），供 Art 5(2) accountability 引用。

### 持續監控

- **Feedback worker 變更**：若 feedback 通路未來改為持久存 IP（如 analytics）、或引入與 telemetry 共用的識別碼，須立即重做本分析並更新 governance。
- **In-app feedback UI**：若引入 session-based feedback，須確認不共用 telemetry session 識別後更新本節。
- **下次例行複審**：2026-11-30（與 INV-8 同期）。

**INV-1 邊界**：『Worker 零 IP 落地』指 Keeply 控制之 D1 儲存層；CF edge 內部 metrics 暫存（如 Workers Analytics 帳號層彙總）依 CF 既有 sub-processor 揭露（P-03/P-06），不在 INV-1 涵蓋範圍。

## 5. ePrivacy Art 5(3) 分析

5(3) 管「存取/儲存終端設備資訊」，**不論該資訊是否個資**。

- **匿名層**：讀本機 registry 的 `install_source`（spec 296 凍結值）再送，技術上落入 5(3) 文義。
  緩解論點：(1) 被存取資訊不可識別個人；(2) 單次、非持續；(3) 無 id、無關聯能力；(4) 對使用者
  零侵害。結論：主流解釋下低風險；最嚴格 EU/德國（TTDSG）解釋下仍有殘餘曝險，已透過揭露
  + 極致最小化緩解。**不得宣稱「匿名所以完全不沾 5(3)」**。
- **個資層**：讀多欄位 + 持久 id → 需 consent；opt-in modal 即為 5(3) 所要求的事前同意。

## 6. 與其他文件 / 實作的連動

- **隱私政策修訂（privacy `--revise`，需 LEGAL-REVIEW 律師審）**：拆兩段 —— (1) 匿名安裝計數
  （非個資、輕量揭露、隨版生效、**不**觸發 §9 30 天）；(2) opt-in 使用統計（個資、同意基礎、
  完整揭露、既有用戶 30 天公告）；並改寫 §2.3。
- **Art-30 處理紀錄**：補一筆 telemetry 處理目的（Cloudflare = 既有 P-03、**零新增
  sub-processor、零新 TIA**）。
- **本文取代 LIA**：consent（6(1)(a)）路線不需 6(1)(f) 的 LIA；本 design note 承擔 Art 5(2)
  問責書面（最小化理由、同意設計、unlinkability、5(3) 分析、DPIA screening 結論）。
- **DPIA screening 結論**：telemetry 風險低（匿名層非個資；個資層 opt-in + 最小化 + 可撤回），
  **不需完整 DPIA**；新增伺服器端蒐集管道的風險已由本文不變量緩解。
- **Keeply spec 回改**（activation guard 未送任何資料 → 零損失）：297 拆 `/count`（匿名 atomic）
  + `/event`（個資 opt-in）；298 modal 重框（INV-4/INV-7）；299 heartbeat 歸個資層 + 週/月聚合。

## 6.1 紅隊政策審補強條件（2026-05-26，隱私政策 draft 第 2 輪審）

隱私政策 telemetry draft（`privacy-2026-05-26-telemetry-revision.md`）經紅隊審後，新增 / 強化下列**律師送審前 blocking**：

- **INV-3 補完 — 官網 `privacy.files.p3`（19 locale）同批改寫**：現行官網「does not collect or transmit **any telemetry, usage analytics, file metadata**」比政策 §2.3 更絕對、連匿名層都打臉。政策乾淨但官網續違規 = 白改。en + zh-TW source + fanout，與政策 merge **同批**。
- **INV-8 — Cloudflare DPA 涵蓋驗證**：**MET** — Cloudflare DPA v6.4（2026-04-03 effective）§6.1 auto-incorporation 涵蓋 D1/Workers；公開證據文件見 `cloudflare-public-evidence-2026-05-30.md`（2026-05-30 蒐集，8 個官方 URL）。DPA「Services」broad definition 廣義涵蓋所有 cloud-based solutions + SDK/API，無 D1/Workers 排除條款。雙邊書面確認信因 vendor 政策不可得，採公開資訊替代證明（GDPR Art 5(2) accountability 允許）。強化措施建議：啟用 D1 `jurisdiction: eu` 以收斂跨境傳輸範圍（非 blocking，owner 自查後決定）。下次複審：2026-11-30。
- **INV-9（新）— release 順序 gate**：政策 §2.5 上線**早於或同步於**含首啟 modal 的 app 版本（否則 modal 說有 telemetry、政策還沒 §2.5 = mini Art 13 打臉）。
- **保留期定案**：個資層 = **12 個月**（對齊 keygen fingerprint「+12 個月稽核」基準、合 Art 5(1)(e)），之後刪除或彙總為不可識別統計；匿名層 = 彙總保留無個別記錄。
- **過度宣稱已收**：政策對匿名層不寫絕對「不屬 GDPR」，改「經設計為不可識別、據此視為非個資」；「類似下載次數」移出法律定位、僅作聚合性質比喻並加非法律定性限定；個資層用「隨機識別碼」不誤稱「匿名」；不對外宣稱「兩層無法接合」（內部論證即可）。

## 7. 已知殘餘風險（知情、非 blocking）

- **個資層 self-selection bias**：opt-in 同意者非隨機 → 輪廓/留存數據偏。**核心 winget% 由匿名層
  普查解決，不受此影響**；輪廓數據解讀需保守。
- **匿名層計數精度**：reinstall / 多 user profile / VM 會輕微膨脹（計「安裝事件」近似「不重複
  機器」）；對 winget/direct **相對佔比**影響大致對稱，結論穩健，絕對量需保守。
- **「下載次數」類比**：匿名層是 app 主動讀 registry 外送（非伺服器被動觀察），正當性論點應為
  「送出的是不可識別資訊」，**不得倚賴「像下載次數」當法律免責**。

## 8. Sign-off

- Author: WEIWEI ｜ Date: 2026-05-26 ｜ Status: approved（內部 governance；隨附的隱私政策修訂
  另經 LEGAL-REVIEW）
- Review trigger：匿名層 schema 變更（INV-6）／ePrivacy 或 anonymisation 判例/指引重大變動／
  DPA 詢問／年度（next: 2027-05-26）。
