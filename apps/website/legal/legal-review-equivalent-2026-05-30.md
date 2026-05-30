---
title: "Keeply Privacy v0.3 — Legal Review (Researcher-Equivalent)"
product: "keeply"
doc-type: "legal-review-equivalent"
version: "v1.0"
status: "complete"
created: "2026-05-30"
reviewer: "Claude (research-agent, GDPR/EDPB domain)"
target_document: "privacy-2026-05-26.md (v0.3, draft)"
governance_basis: "governance/2026-05-26-telemetry-two-tier-consent.md (v1.0, approved)"
language: "zh-TW"
nature: "researcher-equivalent legal review (NOT licensed counsel opinion)"
---

# §0 性質聲明 — 本文件是什麼／不是什麼

**本文件為研究員審查（researcher-equivalent legal review），非律師意見書。**

撰寫脈絡：

- Keeply 為 **solo SaaS**（資料控制者 = TSAO Ting-Wei 自然人，無法務團隊、無律師預算）。
- Owner 在 2026-05 完成 telemetry 雙層 consent 設計（3 輪內部紅隊壓測）後，需在無 licensed counsel 可諮詢之情況下，對 privacy policy v0.3 草案做出 publish/no-publish 之合規判斷。
- 本審查係依**公開可達之 GDPR 條文、EDPB 指引、CJEU 判決、各國 DPA 表態、學術／實務評論**，由具備 GDPR/EDPB 領域研究能力之 AI 研究員代行律師審稿者之**結構性把關角色**。
- 本文件**不**取代律師意見書、**不**構成 Art 30 紀錄、**不**免除控制者於監督機關前之問責義務。
- 本文件之引述出處皆以可達 URL 列示；任何被引述為「結論」之段落均應視為**研究員整理之共識見解**，而非權威法律意見。

**使用建議**：本審查可作為 (a) Beta 期間之**自我把關 baseline**、(b) 未來付費 Team tier 公開發行前由律師正式審稿時之**先行盡職調查紀錄**、(c) Art 5(2) accountability 之**過程性問責文件**。

---

# §1 研究發現（依專題編號）

## 1.a 雙層 consent 模型在歐盟法下之合法性

### 文獻基礎

- **EDPB Guidelines 2/2023 on Technical Scope of Art 5(3) ePrivacy Directive**（2023-11-16 通過）：澄清 Art 5(3) 之適用範圍，明定「**non-personal data 與 personal data 皆受涵蓋**」（"the notion of information includes both non-personal data and personal data"），「**reading 與 writing 互相獨立、皆為 access**」（"gaining access is independent from storing information"）。Hunton 2023 評析。
- **EDPB 對「強制送的匿名計數」無明文允許範例**：迄 2026-05 為止，EDPB 未發布「software telemetry 雙層 consent」之專屬指引；最相關之比較為**網站分析工具的「無 consent 例外」實務**。
- **網站分析比較基準**：法、西、義、英 4 國 DPA 於 2024-2025 期間，**有條件**承認「first-party、cookieless、無 cross-site tracking、IP 完全匿名化、僅作彙總統計」之分析工具（Matomo on-premise、Plausible、Fathom）得**免 consent**。其餘 EU 多數成員國（德、荷、奧 等）仍堅持 Art 5(3) consent 義務。
- **Microsoft Windows 10 Telemetry 案（荷蘭 DPA, 2017→2018）**：荷蘭 DPA 之 2017-10 裁定**並非否定「opt-out 永遠違法」**，而是指出 Microsoft 之**特定缺失**——(i) 透明度不足（用戶不知收什麼）、(ii) 預設等級為 Full（最大量蒐集而非最小）、(iii) 同意機制不可靠（"failure to change default settings is not consent"）。**2018-04 follow-up 確認**：Microsoft 改為「Basic / Full」二選一、Basic 為**最小化、預設、可由用戶向下調**之等級後，**荷蘭 DPA 接受 Basic level 為合規**（"data is needed to help keep Windows and apps secure"）。

### 對 Keeply 雙層之適用

- Keeply 匿名層 = **單欄 enum source ∈ {winget/direct/homebrew/unknown}**、**無 id、無 IP、無時間、無 user agent**、**永不存個別 row**（D1 只存聚合計數）。在資料最小化光譜上，**遠比 Microsoft Basic level 嚴格**。
- 法 / 西 / 義 / 英 DPA 對「first-party、cookieless、完全匿名彙總」分析的免 consent 例外，**結構上類比 Keeply 匿名層**（皆為 first-party、無 cross-platform tracking、彙總化）；德、荷、奧 之嚴格立場則仍可能適用 Art 5(3) consent 義務（見 §1.g）。
- 個資層 = opt-in / Art 6(1)(a)：完全符合 EDPB Recommendations 2/2025 對 consent 之要求（unambiguous、informed、可撤回）。

### 結論

雙層模型之**結構**（強制匿名最小化 + opt-in 個資擴充）在 EU 法下無已知判例直接判定為違法；最接近之 Microsoft 案於 Basic level 改造後已被荷蘭 DPA 接受。**主要殘餘風險來自 Art 5(3)（見 §1.g），而非 Art 6 法基**。

### 出處

- [EDPB Guidelines 2/2023 — official news](https://www.edpb.europa.eu/news/news/2023/edpb-provides-clarity-tracking-techniques-covered-eprivacy-directive_en)
- [Hunton evaluation of EDPB 2/2023](https://www.hunton.com/privacy-and-information-security-law/edpb-publishes-guidelines-to-clarify-scope-of-eu-cookie-notice-and-consent-requirements)
- [Dutch DPA Windows 10 ruling summary — Privacy International](https://privacyinternational.org/examples-abuse/1902/dutch-dpa-microsoft-breaches-data-protection-law-windows-10)
- [Dutch DPA 2018 follow-up — Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl/actueel/microsoft-verbetert-privacybescherming-nader-onderzoek-nodig)
- [Matomo no-consent legal basis analysis](https://legalweb.io/en/news-en/integrate-matomo-piwik-pro-in-a-legally-compliant-manner-use-without-consent-in-the-gdpr/)
- [Matomo ePrivacy national implementations FAQ](https://matomo.org/faq/general/eprivacy-directive-national-implementations-and-website-analytics/)

---

## 1.b Rotating-Daily-ID（salt+date sha256）之個資定性

### 文獻基礎

- **WP29 Opinion 05/2014 (WP216) 三測**：singling-out / linkability / inference。三項皆不可重建即為匿名（非個資）；任一項可重建即為 pseudonymous（仍為個資）。
- **EDPB Guidelines 01/2025 on Pseudonymisation**（2025-01-16 通過）核心立場：
  - **simple hash of an identifier**（無 keyed、無 domain 管理、無 supplementary information 分離）**不足以達成 pseudonymisation 之最佳實踐**，更非 anonymisation。
  - **keyed hashing（HMAC、加 salt+key 管理）**才能稱為強形式 pseudonymisation；但**仍為個資**，除非 key 與 supplementary information 已不可逆銷毀。
  - **rotating identifier 之效果取決於：(i) salt 是否仍可重現、(ii) 是否仍可被原系統重新計算、(iii) 接收方是否有「合理機會」取得 salt**。
- **CJEU EDPS v SRB（Case C-413/23 P, 2025-09-04）**——里程碑判決：
  - 確立 **「個資相對主義」**：同一筆資料對 controller 為個資、對 recipient 可為匿名，取決於**該 recipient 是否有「realistic means / reasonable means」重新識別**（para. 77, 86）。
  - **insignificant risk test**：若第三方 recipient 取得 re-identification means 之風險「微不足道」（insignificant），該資料對其而言可落在 GDPR 範圍外。
  - **未對 rotating identifier 提供明文指引**，但該判決框架可由 controller 案例適用。

### 對 Keeply 個資層之適用

Keeply 個資層 rotating id = `SHA256(daily_salt || date)`：

- 對 Keeply（controller）：**仍可重新計算今天的 id**（持有 salt + 知日期）→ 仍可 singling-out 一日內事件 → **對 Keeply 為個資**。
- 對 Cloudflare（sub-processor，存 D1 之該 row）：**未持有 salt**（salt 留在使用者本機）→ 對 Cloudflare 無 realistic means 重新識別 → SRB ruling 下**可能對 Cloudflare 為匿名**。**但**：Cloudflare 仍同時收 country + os + os_version + arch + locale + app_version + heartbeat → 對小母體 n≈200 而言，**這組欄位本身就可能 singling-out**（見 §1.c），salt 缺失不足以使其匿名。
- 對 Keeply 政策定性：**rotating-daily-id 整體仍為個資**（因為 controller 視角下可重識，且 sub-processor 視角下因 quasi-identifier 組合可 singling-out）→ governance 文件中**「個資層用『隨機識別碼』不誤稱『匿名』」之表述正確**。

### 結論

- governance INV 中將個資層歸為**個資 + Art 6(1)(a) 同意**之分類**完全正確**，不過度宣稱、不誤稱匿名。
- 政策 §2.5.2 之措辭「附帶一個本機產生的隨機識別碼」+ 落於 Art 6(1)(a) 同意 + 12 個月保留 = **符合 EDPB 01/2025 + SRB 判決框架**。
- **若未來決定「daily 改 per-event 完全 random」**（不可重識），個資層可進一步降階；目前 daily-rotating 仍正確分類為個資，無 over-/under-claim。

### 出處

- [WP29 Opinion 05/2014 three tests summary — Bloomberg Law](https://news.bloomberglaw.com/privacy-and-data-security/the-eu-article-29-working-partys-opinion-on-privacy-and-anonymity-its-harder-than-you-think)
- [EDPB adopts Pseudonymisation Guidelines 01/2025 — news](https://www.edpb.europa.eu/news/news/2025/edpb-adopts-pseudonymisation-guidelines-and-paves-way-improve-cooperation_en)
- [Trilateral Research analysis of EDPB 01/2025](https://trilateralresearch.com/cybersecurity/unpacking-the-edpb-pseudonymisation-guidelines-key-insights-and-learnings)
- [FPF analysis of CJEU EDPS v SRB](https://fpf.org/blog/rethinking-personal-data-the-cjeus-contextual-turn-in-edps-vs-srb/)
- [Goodwin Law: EDPS v SRB ruling](https://www.goodwinlaw.com/en/insights/publications/2025/09/alerts-technology-dpc-personal-data-or-not)
- [Clifford Chance: Pseudonymized data after EDPS v SRB](https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2025/09/pseudonymized-data-after-edps-v-srb.html)

---

## 1.c 小母體（n≈200）re-identification 風險與最小化

### 文獻基礎

- WP29 Opinion 05/2014：**quasi-identifier 組合**（年齡 + 郵遞區號 + 性別）長期被引為「3 欄即可 singling-out 87% 美國人口」典型。
- EDPB 01/2025 Pseudonymisation：**「pseudonymisation domain」概念** = 在該 domain 內可重識的人都算 holder of additional information；domain 越小、母體越小，風險越高。
- 對 telemetry payload 之具體分析（學術 / 業界共識）：
  - `os` (4 值：win/mac/linux/other) + `os_version` (大版本) + `arch` (3 值) + `locale` (約 20 值) + `country` (約 200 值) → **entropy ≈ 4×4×3×20×200 = 192,000 組合**。
  - 母體 n≈200 之下，**多數組合會落在唯一個體**（例如某韓國 macOS 14 ARM ko-KR 使用者）。
- Keeply 既有設計緩解：(i) country 罕見歸 other；(ii) heartbeat 週/月聚合（不重建逐日曲線）；(iii) os_version 大版本（不含 build number）。

### 對 Keeply 個資層之風險評估

- **個資層自身**：rotating id + quasi-identifier 組合 → **n≈200 時可達 singling-out 中等風險**。已透過 country 罕見歸 other + 大版本聚合 + heartbeat 聚合三項緩解，符合 Art 5(1)(c) 最小化之**合理但非完美**標準。
- **個資層 ↔ 匿名層接合風險**：governance §4 已論證四接合鍵（IP / 時間 / session / 共同欄位）全消除。技術設計合理；**但「不對外宣稱『兩層無法接合』」之自律已寫入 §6.1**，與 EDPB 01/2025 「不承諾絕對」之精神一致。
- **進一步建議（非 blocking）**：
  - 個資層 country 之 "other" 門檻可寫入 governance（如「若該 country 母體 < 5，歸 other」），增加最小化之可稽核性。
  - 評估將 rotating-daily-id 改為 **per-event ephemeral**（每事件一個 nonce，無跨事件 linkability）。但這會犧牲 heartbeat 留存推算能力 → 設計取捨，目前 daily-rotating 為合理平衡。

### 結論

最小化措施**符合**但**未過度**達成 Art 5(1)(c)。governance INV-6（匿名層 schema 凍結為單欄）+ INV-1/2（匿名層 unlinkability）是真正讓「真匿名」站得住的支柱；個資層之最小化措施屬於「合理但非極致」，**對 opt-in / Art 6(1)(a) 路線而言已足夠**。

### 出處

- 同 §1.b 之 WP29 與 EDPB 01/2025 引用
- 對 quasi-identifier risk 之經典實證：Sweeney L. (2000). _Simple Demographics Often Identify People Uniquely_. Carnegie Mellon University.（社群共識引用）

---

## 1.d 既有用戶之 30 天提前告知 + 升級慢用戶之首啟保底揭露

### 文獻基礎

- **GDPR Art 13** + **WP29 Transparency Guidelines (WP260, 2018)**：
  - GDPR **本身對「政策變更通知之提前期限」沉默**——**並無「30 天」之法定強制要求**。
  - WP29 WP260 表達：「重大變更應主動帶到 data subject 注意」，具體手段為 email / pop-up / 顯著通知；**未指定固定期限**，僅要求「well in advance of the stipulated time limits」（充分提前）。
  - 何謂「重大變更」：**新處理目的、新 controller 識別、權利行使方式變更**。Telemetry 新增屬「**新處理目的**」之典型 → 確屬重大。
  - 通知方式：可包括「pop-up on a webpage **or other modality which will effectively bring the changes to the attention of the data subject**」→ **app 內首啟 modal 為已被認可之 modality**。
- **業界實務常規**：30 天為市場常見值（Microsoft、Google、Apple 多用 30-60 天），但**非法定強制**。

### 對 Keeply v0.3 §9 之適用

- §9 規定「重大變更於生效前至少 **30 天**公告」+「下次啟動時應用程式內通知」→ **超過 GDPR 法定最低要求**（GDPR 只要 "in advance"），**業界常規水準**。
- §2.5 上線時，**升級慢的用戶**首啟才看到 modal（governance INV-7 + INV-9 已涵蓋）→ 該用戶於首啟當下取得通知、modal 出現即代表處理開始（同意取得後才送）→ **符合 Art 13 「at the time of collection」**。
- **隱憂**：「30 天」之承諾若無法做到（如 v1.0.6 一週後就要 ship telemetry），會自打嘴巴。需確認 §9 之 30 天起算點為「政策 publish 於 keeply.work」而**非**「該用戶實際看到的時點」（後者對升級慢用戶不可達）。governance INV-9（政策 §2.5 上線早於或同步於含 modal 之 app 版本）已隱含採前者起算 — **建議於 §9 加註明確化**。

### 結論

§9 設計**超過**GDPR 最低標準、**符合**WP29 WP260 + 業界常規。建議微幅明確化「30 天」起算點以閉合 INV-9 之隱含承諾。

### 出處

- [GDPR Article 13 — gdpr-info.eu](https://gdpr-info.eu/art-13-gdpr/)
- [WP260 Transparency Guidelines — Lexology summary](https://www.lexology.com/library/detail.aspx?g=652b1b73-d499-4404-857b-0abe6b62b38f)
- [WP260 — bird & bird PDF (final adopted version)](https://www.twobirds.com/-/media/pdfs/comparison--article29wptransparencyguidelinespdf.pdf)
- [IAPP analysis WP29 transparency final](https://iapp.org/news/a/whats-new-in-wp29s-final-guidelines-on-transparency)

---

## 1.e Opt-out 匿名計數的「真匿名」門檻

### 文獻基礎

- **EDPB 01/2025 + WP29 05/2014**：anonymisation = **impossibility（or "negligibly small probability"）of singling-out / linkability / inference**。
- **EDPB 01/2025 強調 implementation invariant**：「a hash in itself is pseudonymisation **unless** keyed hash with protected key, strict access and appropriate TOMs」+「相對匿名性」需建立在**該 actor 確實無 means 重識**之事實證明，**非設計宣稱**。
- **CJEU SRB**：對 recipient 為 anonymous 之要件 = "realistic / reasonable means 重識之風險微不足道"。

### 對 Keeply 匿名層 INV-1~6 之適用（逐條評估）

| INV | 內容 | 對應「真匿名」標準之達標度 |
|-----|------|----------------------------|
| INV-1 | Worker 零 IP 落地、無 per-event row、無時間戳 | **核心保證**。零 IP = 切斷「IP+os ≈ identifier」最強重識路徑。無 per-event row + atomic counter = 結構上不可能保留個別記錄。**達標**。 |
| INV-2 | 拿掉 IP-hash rate-limit | 補強 INV-1（避免 IP-hash 成為弱接合鍵）。**達標**。 |
| INV-3 | 政策 §2.3 與官網「never telemetry」同步改寫 | **非匿名性論證、但屬 Art 13 透明性義務**——若不改，匿名層上線即構成 mini Art 13 違規。**程序面達標**。 |
| INV-4 | Modal 棄二元、明示「拒絕也送匿名」、視覺權重對等 | 對應 EDPB 03/2022 Deceptive Design Patterns 指引。**達標**。 |
| INV-5 | 兩層時間去耦（unlinkability） | governance §4 已論證四接合鍵全消除。**達標但需 implementation 證據**（code review）。 |
| INV-6 | 匿名層 schema 凍結為單欄 | 防止「schema creep」漸進破壞匿名性。**達標**。 |

**最關鍵之問題**：**WP29 三測對 Keeply 匿名層之實際結果**：
- Singling-out：彙總計數無 per-event row → **無法挑出個人**。✅
- Linkability：單欄 + 無 id + 無時間 → **無接合鍵**。✅
- Inference：4 值 enum 之 counter → **無屬性推論**。✅

**前提**：INV-1~6 **實作層確實達成**（不是設計層宣稱）。governance §3 表格將每條 INV 配備「驗收條件」（Worker 設定審查 + D1 schema 審查 + code review）= **正確的 implementation invariant approach**。

### 結論

匿名層**結構上達到 WP29 三測 + EDPB 01/2025「真匿名」門檻**。`governance` 文件對 INV-1~6 之 implementation invariant 處理方式（非單純設計宣稱、而是 ship 前 blocking 驗收）= **符合 EDPB 01/2025 之 "rigorous, documented, regularly updated methods" 要求**。

**唯一殘餘風險**：ePrivacy Art 5(3) 之獨立分析（見 §1.g），與資料是否個資**獨立**。

### 出處

- 同 §1.b
- [EDPB Deceptive Design Patterns Guidelines 03/2022](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-032022-deceptive-design-patterns-social-media_en)

---

## 1.f Cloudflare 作為 sub-processor + D1 涵蓋驗證

### 文獻基礎

- **Cloudflare Customer DPA v6.3（2025-06-20）/ v6.4（2026-04-03 effective）**：Services 定義為「all of the cloud-based solutions offered, marketed or sold by Cloudflare...along with any software, software development kits and application programming interfaces」——**廣義涵蓋 Workers + D1**。
- **無 product-specific carve-out**：DPA 對 storage product（D1）與 network product（CDN）**未差別對待**。
- **Sub-processor list 結構**：Cloudflare 維護兩份清單（cloudflare-services / professional-services），新增 sub-processor 須 30 天前公告。**D1 未列為獨立條目**——理由：D1 由 Cloudflare 自己跑（非外包 sub-processor），落在 "Cloudflare Group" 內部處理。
- **D1 jurisdiction setting**：D1 支援 `jurisdiction: eu` 設定，可保證資料儲存於 EU 區域——對 EU 用戶資料減少跨境風險。

### 對 Keeply governance INV-8（DPA 涵蓋驗證）之適用

- **DPA 文義上涵蓋 Workers + D1**：v6.4 DPA scope clause 為廣義定義，**無需 Cloudflare 出具額外書面確認**——通用 DPA 即適用。
- **TIA 充分性**：既有 Cloudflare P-03（網站 CDN）TIA 是基於同一 DPA、同一法人、同一跨境傳輸機制（SCC）。**P-06 新處理活動於 DPA 框架下無需新 TIA**，但需於 Art-30 紀錄獨立列為**新處理活動 + 新資料類別**（已於 art-30 v0.2 P-06 條目完成）。
- **可選強化**：將 Keeply D1 instance 設為 `jurisdiction: eu` → 對 EU 資料減少跨境傳輸、增強 Art 44 防禦。**強烈建議實施**（governance 未列、屬實作層加分）。
- **INV-8 狀態調整建議**：governance INV-8 原表述為「書面確認既有 DPA 涵蓋」——根據文獻，**Cloudflare 不會出具 product-specific 書面**（DPA 採廣義定義模式）。建議將 INV-8 改寫為「**Cloudflare DPA v6.4 scope clause 廣義涵蓋 Workers/D1，於 Art-30 P-06 註明此涵蓋係依 DPA 通用定義**」+ 加 **「啟用 D1 `jurisdiction: eu`」** 作為實作層強化。

### 結論

INV-8 本意已透過 Cloudflare DPA v6.4 文義達成；建議**修正 INV-8 表述**+ **採用 D1 EU jurisdiction**。**非 BLOCKING**——但可從「待辦」結案。

### 出處

- [Cloudflare Customer DPA — current](https://www.cloudflare.com/cloudflare-customer-dpa/)
- [Cloudflare DPA v6.3 PDF (Jun 2025)](https://cf-assets.www.cloudflare.com/slt3lc6tev37/3LmXORq5FW5EuJ0OT1B871/f466268011407efbc07f4fadbd1af466/Cloudflare_Customer_DPA_v6.3_June_20__2025.pdf)
- [Cloudflare Sub-processor list (services)](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/)
- [Cloudflare D1 jurisdiction (eu / fedramp)](https://community.cloudflare.com/t/d1-workers-d1-can-restrict-data-localization-with-jurisdictions/853925)
- [Cloudflare D1 FAQ](https://developers.cloudflare.com/d1/reference/faq/)

---

## 1.g ePrivacy Art 5(3) / TTDSG §25 對讀本機 install_source registry

### 文獻基礎（**這是 v0.3 最大殘餘風險**）

- **EDPB Guidelines 2/2023（2023-11-16）**核心立場（Hunton 評析）：
  1. **「gaining access」獨立於「storing」**：**僅 read（不 write）亦觸發 Art 5(3)**。
  2. **資訊本身為 personal 或 non-personal 不重要**——只要是儲存於終端設備、被 access，Art 5(3) 即適用。
  3. **Art 5(3) 之兩項豁免（strictly necessary for transmission / strictly necessary for service expressly requested by user）採狹義解釋**。
- **德國 TTDSG / TDDDG §25**（Bundeskanzleramt 2021 + 2024-11 DSK Guidance v1.2）：完全內國法化 Art 5(3)；2025-04-01 起 Consent Management Ordinance 生效。
- **activeMind.legal 德國律所立場**：對 software telemetry「**強烈不建議依 legitimate interest**、**應採 consent**」——對「強制送的匿名計數」未明文背書例外。
- **法、西、義、英 對網站分析之免 consent 例外**：條件包括 first-party、cookieless、無 cross-site tracking、無個資、僅彙總統計 → **結構上接近 Keeply 匿名層**，但**該例外針對的是「網站訪客」對「網頁分析腳本」之同意**；**對於「桌面 app 主動讀本機 registry」是否類比適用，無明文判例**。

### 對 Keeply 匿名層之適用

- Keeply 桌面 app 啟動時 read Windows registry `install_source` 值 → **文義上落入 Art 5(3) "gaining access" + EDPB 2/2023 明確涵蓋 read-only access**。
- 即使該值**非個資**（單欄 enum、無 id、無 IP）→ EDPB 2/2023 仍將其納入 Art 5(3) 適用（資料屬性不豁免）。
- **可能適用之豁免**：
  - Art 5(3)(a)「strictly necessary for transmission」→ **不適用**（telemetry 非通訊傳輸所需）。
  - Art 5(3)(b)「strictly necessary for service expressly requested by user」→ **適用性有爭議**。論點：使用者下載並啟動 Keeply = 同意核心功能（版本控制）；telemetry **不**是核心功能 → **大概率不適用此豁免**。
- governance §5 已誠實標示：「主流解釋下低風險；最嚴格 EU/德國解釋下仍有殘餘曝險」+「不得宣稱『匿名所以完全不沾 5(3)』」。**此處理方式符合 EDPB 01/2025「不過度宣稱」精神**。
- **比較參照**：
  - Microsoft Windows 10 Basic level（讀 telemetry registry 並送出）已被荷蘭 DPA 接受為合規 → **存在「強制最小化 telemetry 在實務上被接受」之先例**。但 Microsoft Basic ≠ 完全免 consent；只是被 DPA 視為「不過度即可」。
  - 法/西/義/英 對網站分析之 first-party 例外 → **結構類比但未直接判例**。
- **最嚴格場景之風險**：德國 / 奧地利 / 荷蘭 DPA 若主動審查，**可能要求 Keeply 將匿名層改為 consent-based**（即「拒絕 = 完全不送任何資料」）。

### Keeply 已採之風險緩解

- governance §5 顯式記錄此 5(3) 殘餘曝險（**非靜默忽略**）；
- 政策 §2.5.1 顯式揭露「即使你選擇不分享使用統計，匿名計數仍會送出」+ 提供 kill switch；
- 政策 §2.5.1 不宣稱「絕對不沾 5(3)」；
- 匿名層 schema 已收縮到單欄之極限（無法再小）。

### 結論

**這是 v0.3 之唯一 BLOCKING 殘餘風險**——但 BLOCKING **不**等於「不可 publish」，而是**需明確的風險承擔記錄**。

- **EU 主流解釋下**（法/西/義/英 之 first-party 例外結構類比 + Microsoft Basic 先例）：低風險、可 publish。
- **EU 最嚴格解釋下**（德/奧/荷 之 strict ePrivacy 立場 + EDPB 2/2023 之 read-also-counts 邏輯）：高風險、**未來若收到 DPA 通知，需在 X 期內將匿名層改為 consent-based**。
- governance §5 已認識並接受此風險。**研究員建議**：v0.3 §2.5.1 加一句「**若你位於採取嚴格 ePrivacy 解釋之歐盟司法管轄區（如德國），且不希望此計數送出，請於設定中關閉「使用狀況回報」**」→ 將「kill switch」從「設計選項」升格為「對特定司法管轄區之合規路徑」，閉合最後一道殘餘曝險。

### 出處

- [EDPB Guidelines 2/2023 — official](https://www.edpb.europa.eu/news/news/2023/edpb-provides-clarity-tracking-techniques-covered-eprivacy-directive_en)
- [Hunton: EDPB 2/2023 clarifies cookie scope](https://www.hunton.com/privacy-and-information-security-law/edpb-publishes-guidelines-to-clarify-scope-of-eu-cookie-notice-and-consent-requirements)
- [Securiti TTDSG guide](https://securiti.ai/blog/german-ttdsg-guide/)
- [Didomi German Consent Management Ordinance](https://www.didomi.io/blog/german-consent-management-ordinance)
- [activeMind.legal: lawful telemetry processing](https://www.activemind.legal/guides/telemetry-data/)
- 同 §1.a 對 Matomo / Plausible / Fathom 與法/西/義/英 例外之引用

---

# §2 v0.3 政策逐節合規評估

格式：**節 — PASS / CONCERN / FAIL — 理由**

## §0 前言（line 22-36）

- **PASS**。誠實揭露雙層 telemetry、區分匿名與 opt-in、引用 §2.5。措辭克制無過度宣稱。

## §1.1 適用範圍 — **PASS**。
## §1.2 資料控制者（含雙身分揭露）— **PASS**。已正確區分自然人 vs 法人實體、明定 GDPR 控制者為自然人。
## §1.3 聯絡 — **PASS**。Art 12(3) 7+30 日承諾正確。
## §1.4 EU Representative — **PASS**（誠實揭露未指派 + 承諾於 Team 公開發行前指派；Beta 階段可接受）。
## §1.5 監督機關 — **PASS**。

## §2.1 本機資料 — **PASS**。
## §2.2 子處理者 — **PASS**。Keygen 與 Paddle 之處理者/獨立 controller 區分正確；SCC Module 2 引述準確。
## §2.3 Keeply 伺服器端 — **PASS**。governance INV-3 之改寫已完成（「除桌面應用程式的使用統計外，Keeply 不運營一般應用程式後端」）。與 §2.5 一致。

## §2.4 網站語言偵測 — **PASS**。延續 ipapi.co 移除後之乾淨設計。

## §2.5 桌面 telemetry — **PASS WITH MINOR CONCERN**
  - §2.5.1 措辭 **「經設計為不蒐集任何可識別你或你裝置的資訊」**「**因此我們將其視為非個人資料之統計**」——**符合 EDPB 01/2025「不絕對化」精神**。
  - §2.5.1 之 `(可將其理解為類似網站統計「下載次數」的聚合數字；此比喻僅為說明資料的聚合性質，非法律定性依據。)` ——**非常正確的限定**，採用 governance §7「不倚賴下載次數類比作法律免責」之自律。
  - **CONCERN（非 BLOCKING）**：§2.5.1 對「對嚴格 ePrivacy 司法管轄區之 kill switch 路徑」未顯式說明（見 §1.g 建議改寫）。

## §2.5.1 對外指向 `/law/products/keeply/governance/...` — **FAIL（必修）**。**這是 publish 前 BLOCKING 修改**。詳見本文 §4。

## §2.5.2 對外指向同上 — **FAIL（必修）**。同 §2.5.1 處理。

## §3 匯出檔案識別碼 — **PASS**（與本次 telemetry 修訂無關，沿用 v0.2）。
## §4 活動紀錄與 dual-write — **PASS**。
## §5 授權裝置識別 — **PASS**。
## §6 Team 方案 — **PASS**。

## §7 資料主體權利 — **PASS**。**MINOR**：可補一句「對 §2.5.2 之同意撤回 = 設定 → 使用狀況回報」（已在 §2.5.2 內，但 §7 索引未列）。

## §8 資料保留期 — **PASS**。新增匿名層（彙總、無個別記錄）+ 個資層（12 個月）列法正確。「Art.6(1)(a) 同意」標籤 OK。

## §9 政策變更 — **PASS WITH MINOR CONCERN**。
  - 30 天承諾**超過**GDPR 法定（無明文期限），符合業界常規。
  - **CONCERN**：30 天起算點未明定（建議補「自 keeply.work 上之新版本 publish 日起算」）+ 升級慢用戶之首啟保底揭露未明寫（governance INV-9 已涵蓋，但政策層級可補一句）。

---

# §3 風險評級與建議修改

| 風險級別 | 項目 | 來源節 | 建議處理 |
|----------|------|--------|----------|
| **BLOCKING** | §2.5.1 / §2.5.2 對外指向 `/law/products/keeply/governance/...` 為**內部死鏈**，使用者無法存取 | §4 | **publish 前必修**——見 §4 三選一處理建議 |
| **HIGH（已知接受、非 BLOCKING）** | 匿名層 vs ePrivacy Art 5(3) 嚴格解釋下殘餘曝險 | §1.g | (a) governance §5 已記錄、可接受；(b) **建議 §2.5.1 加一句「嚴格 ePrivacy 司法管轄區可關閉開關」**，升格 kill switch 為合規路徑 |
| **MEDIUM** | §9 30 天起算點未明定 | §2 §9 | 補一句「自政策於 keeply.work publish 之日起算」 |
| **MEDIUM** | INV-8 表述不準（Cloudflare 不出具 product-specific 書面） | §1.f | 修改 INV-8 為「DPA v6.4 scope clause 廣義涵蓋」+ 採用 D1 EU jurisdiction（governance 補述、政策無需動） |
| **LOW** | §7 未索引 §2.5.2 撤回路徑 | §2 §7 | 補一行 cross-reference |
| **LOW** | 個資層 country "other" 門檻可寫入 governance | §1.c | 非必要；增加可稽核性 |

---

# §4 §2.5.1 死鏈處理建議

**問題**：v0.3 §2.5.1 與 §2.5.2 兩處皆指向 `/law/products/keeply/governance/2026-05-26-telemetry-two-tier-consent.md`——此路徑為**內部 LAW 倉庫**，使用者於 keeply.work 上的政策 publish 後**完全無法存取**（404 / 不存在於 web origin）。

**法律後果**：「對外引述但不可達」之文件 = **違反 Art 12「concise, transparent, intelligible, easily accessible」要求**。WP260 明定「easily accessible」為 Art 12 核心義務之一。

**三選一處理方式**（推薦順序：3 > 2 > 1）：

### 選項 1（最簡）：移除引用，僅自然語言描述
改寫為：「此計數**經設計為不蒐集任何可識別你或你裝置的資訊**（包括無識別碼、無 IP 位址、無時間戳、僅以原子計數器累加）；因此我們將其視為非個人資料之統計。」

- **優點**：零維護負擔、零外部依賴。
- **缺點**：對深度查詢者（記者、學者、DPA）不便。

### 選項 2（中庸）：改為「內部技術文件、得依請求提供」
改寫為：「此計數**經設計為不蒐集任何可識別你或你裝置的資訊**；技術保證與 implementation invariants 載於 Keeply 內部治理文件，得依請求向 wei@keeply.work 索取。」

- **優點**：避免死鏈、保留深度查證路徑。
- **缺點**：依賴 owner 個別回應；對自動化監督機關不友善。
- **類比**：v0.3 §3.3 對 LIA 文件已採此模式（「得依請求提供」）。

### 選項 3（最強，**研究員推薦**）：governance 公開發布於 keeply.work
將 `governance/2026-05-26-telemetry-two-tier-consent.md` 與其他 governance 文件一併 publish 為 keeply.work 之公開技術文件（如 `keeply.work/legal/governance/telemetry-2026-05-26`）+ 政策內改為對外 URL。

- **優點**：(a) 主動透明 = 最強 Art 5(2) accountability 證據；(b) 對未來 Team 客戶 DPA 採購流程友善；(c) 對 DPA 詢問可直接指向公開 URL；(d) Microsoft、Cloudflare 等業界先例皆採此模式。
- **缺點**：需於 keeply-website agent 開 spec 同步發布 + 之後 governance 修訂須走 publish workflow。
- **此選項應在 Team 公開發行前完成**；Beta 期間可暫採選項 2 過渡。

**具體建議**：
- **v0.3 publish 用選項 2**（最低 BLOCKING 處理）：12 行內可改完、避免死鏈、保持透明性。
- **v0.4 或 Team 公開發行前升級為選項 3**：對應 §1.4 EU Representative 指派之同一里程碑。

**選項 2 之具體改寫文字**（zh-TW + 對應 .en.md）：

> §2.5.1 末段「**法律定位**」改為：
>
> 此計數**經設計為不蒐集任何可識別你或你裝置的資訊**（包括無識別碼、無 IP 位址、無時間戳，僅以原子計數器累加聚合值；技術保證載於 Keeply 內部治理文件，得依請求向 wei@keeply.work 索取）；因此我們將其視為非個人資料之統計。

> §2.5.2 末段「**子處理者與國際傳輸**」改為（移除路徑引用即可）：
>
> 本層資料經 **Cloudflare**（既有子處理者，見 §2.2）處理與儲存；相關國際傳輸依 §2.2 所載之保障機制（SCC／DPF）處理；無新增子處理者。

---

# §5 結論

## v0.3 是否可 publish？

**「需修改後 publish」（Conditional Pass）**。

### Publish 前必補之修改（BLOCKING）

1. **修死鏈**：§2.5.1 與 §2.5.2 對 `/law/products/keeply/governance/...` 之引用——採 §4 選項 2 改寫（移除路徑、改為「得依請求提供」）。**這是唯一硬 BLOCKING**。

### 強烈建議補之修改（HIGH，可同批做）

2. **§2.5.1 加 ePrivacy kill switch 段**：補一句說明嚴格 ePrivacy 司法管轄區用戶可關閉開關。建議文字：

> （補於 §2.5.1 「你的選擇」段末）：「若你位於採取嚴格 ePrivacy 解釋之歐盟司法管轄區（如德國），且不希望此計數送出，於設定中關閉「使用狀況回報」即可同時停止本層之資料送出。」

3. **§9 30 天起算點明確化**：補一句「自本政策於 `keeply.work` 上之新版本 publish 之日起算」。

### 可分批做之治理改進（MEDIUM/LOW，非 publish 阻擋）

4. **governance INV-8 修改**：DPA v6.4 涵蓋已達成，從「待辦」結案；新增「實作層採用 D1 `jurisdiction: eu`」作為強化措施。
5. **§7 補 §2.5.2 撤回路徑 cross-reference**。
6. **governance 個資層 country "other" 門檻可寫入**（增加最小化可稽核性）。
7. **v0.4 或 Team 公開發行前**：將 governance 文件升級為公開發布（§4 選項 3）。

## 我為什麼判 Conditional Pass 而非 Pass / Fail

- **不判 Pass 的理由**：BLOCKING 死鏈未修就 publish = Art 12 違規（easily accessible）+ 對讀者誤導（暗示有可達文件實則不可達）。
- **不判 Fail 的理由**：
  - 雙層架構之**結構**在 EU 法下無已知違法判例。
  - INV-1~7 之 implementation invariant 處理方式**符合**EDPB 01/2025 對「真匿名」之 rigorous, documented, regularly updated methods 要求。
  - 個資層之 Art 6(1)(a) 同意 + 12 個月保留 + opt-in modal 設計**符合**EDPB Recommendations 2/2025 之 consent 四要件。
  - Cloudflare DPA v6.4 文義已涵蓋 Workers + D1，無需額外書面。
  - §9 之 30 天承諾**超過**GDPR 法定（無明文期限）。
  - **唯一**真實殘餘曝險（ePrivacy Art 5(3) 嚴格解釋）已於 governance §5 顯式記錄並接受，且 v0.3 已採「不過度宣稱」措辭——若 DPA 未來主動審查，Keeply 之**問責文件鏈完整**，可進行說理與調整。

## 一句話總結

**v0.3 之 telemetry 設計與政策措辭實質上達到、且部分超過 GDPR + EDPB 2025 級之合規水準；唯一阻擋 publish 的問題是 §2.5.1/§2.5.2 對內部 governance 文件之**死鏈引用**——12 行改寫即可解除 BLOCKING、發布上線**。

---

**文件控制**

- 版本：v1.0
- 撰寫：2026-05-30
- 性質：researcher-equivalent legal review（非律師意見）
- 目標：privacy-2026-05-26.md v0.3 draft
- 治理基礎：governance/2026-05-26-telemetry-two-tier-consent.md v1.0 approved
- 下次審閱觸發：v0.4 發布前、Team 公開發行前、CJEU/EDPB 對 ePrivacy Art 5(3) 之軟體 telemetry 適用發布新指引、任一 DPA 對 Keeply 提出詢問。
