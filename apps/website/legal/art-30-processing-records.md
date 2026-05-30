# Article 30 Records of Processing Activities

| 欄位 | 內容 |
|---|---|
| 版本 | v0.3（draft） |
| 建立日期 | 2026-04-23 |
| 最後更新 | 2026-05-30（P-06 INV-8 結案為 MET）|
| Controller | TSAO Ting-Wei, trading as Keeply（individual sole trader, Taiwan） |
| 聯絡窗口 | wei@keeply.work |
| 法源依據 | GDPR Article 30(1)（Controller 之處理活動紀錄義務） |
| 下次例行複審 | 2027-04-23 |
| 狀態 | draft |

---

## 1. 文件目的

本文件依 GDPR Article 30(1) 要求，記錄 Keeply（資料控制者）之個人資料處理活動。本紀錄應隨處理活動變動（新增處理者、新增資料類別、新增處理目的）即時更新，並於歐盟監督機關要求時提供。

Keeply 雖為個人獨資規模、員工少於 250 人，但因處理歐盟資料主體之個資且處理並非偶發性（occasional），Art. 30(5) 小型組織豁免條件**不適用**，故需維持本紀錄。

---

## 2. 處理者（Processor / Sub-processor）總覽

| # | 處理者 | 處理內容 | 位置 | 跨境傳輸機制 | TIA 連結 |
|---|---|---|---|---|---|
| P-01 | Keygen LLC | 軟體授權驗證與機器指紋登錄 | 美國（Texas; AWS us-east-1） | SCC Module 2（via Keygen ToS §12.1.9） | `tia-2026-04-23-keygen.md` |
| P-02 | Paddle.com Market Ltd | 付款處理（Merchant of Record）、發票開立、稅務計算 | 英國/愛爾蘭 | Paddle 為獨立 controller（非 Keeply 之 processor） | 不適用（非 processor 關係）|
| P-03 | Cloudflare, Inc. | keeply.work 網站 CDN 與 DNS、網站訪客日誌 | 全球邊緣網路（含美國） | SCC（Cloudflare 標準 DPA）| 待補（低優先） |
| P-04 | GitHub, Inc.（Microsoft） | Keeply 二進位檔案之 release 託管（下載分析） | 美國 | DPF 認證 + SCC | 待補（低優先） |
| P-05 | Zoho Corporation | wei@keeply.work 電子郵件 | 美國/印度 | SCC | 待補（低優先） |
| P-06 | Cloudflare, Inc.（同 P-03 法人，新處理活動） | 桌面 app opt-in 使用統計：接收 app 主動送來之個資 payload（隨機 id + OS/版本/arch/locale + 低頻活躍訊號）並存於 D1 | 全球邊緣網路 + Cloudflare D1（含美國） | SCC（Cloudflare DPA v6.4，2026-04-03 effective）—— **INV-8 MET**（見 `cloudflare-public-evidence-2026-05-30.md`） | 待補 |

---

## 3. 各處理活動細目

### P-01: Keygen LLC（license 驗證）

| 欄位 | 內容 |
|---|---|
| 處理目的 | 軟體授權驗證、防止授權盜用（Art. 6(1)(b) 契約必要性 + Art. 6(1)(f) 防盜版正當利益） |
| 資料主體類別 | Keeply 付費版使用者（個體經營者、企業員工、freelancer） |
| 個資類別 | 偽名化機器指紋（HMAC-SHA256）、公開 IP、hostname、platform、API 請求日誌 |
| 接收者 | Keygen LLC 作為 Keeply 之 processor；sub-processors 見 Keygen Privacy §1.9（Cloudflare、Stripe、Fathom、BetterStack、SendGrid、Heroku、AWS、Clickhouse、WorkOS） |
| 跨境傳輸 | 台灣 → 美國；SCC Module 2 via Keygen ToS §12.1.9（Decision (EU) 2021/914）|
| 保留期 | License 期間 + 12 個月稽核；Keygen API 日誌 30 天 |
| 技術與組織措施 | TLS 1.2+、AES-256 at rest、bcrypt、SOC 2 Type II；偽名化於使用者本機完成（原始 MAC/MachineGuid 永不離開裝置）|
| 相關文件 | `privacy-2026-04-21.md` §2.2.1 / §5；`tia-2026-04-23-keygen.md`；`third-party-agreements/keygen/` |

### P-02: Paddle.com Market Ltd（付款處理）

| 欄位 | 內容 |
|---|---|
| 處理目的 | 付款處理、發票、稅務合規、退款 |
| 資料主體類別 | Keeply 付費版使用者 |
| 個資類別 | 姓名、電子郵件、帳單地址、付款方式（Paddle 處理，Keeply 不接收卡號）、交易紀錄 |
| 接收者 | Paddle（作為 Merchant of Record 獨立 controller）|
| Keeply 之角色 | **非 controller**：Keeply 於此流程中為 Paddle 之客戶；Paddle 以 MoR 身分為該付款活動之 controller |
| 跨境傳輸 | 使用者 → Paddle（英國/愛爾蘭）；Paddle → Keeply 帳單彙總（Paddle 負責合規）|
| 保留期 | 7 年（台灣稅捐稽徵法第 30 條；其他地區同等稅務義務）|
| 合法基礎 | Art. 6(1)(b) 契約必要性 + Art. 6(1)(c) 法定稅務義務 |
| 相關文件 | `privacy-2026-04-21.md` §2.2.2；Paddle DPA（paddle.com/legal/dpa）|

### P-03: Cloudflare, Inc.（網站 CDN）

| 欄位 | 內容 |
|---|---|
| 處理目的 | keeply.work 網站內容快取與加速、DDoS 防護、DNS 解析 |
| 資料主體類別 | 所有 keeply.work 訪客 |
| 個資類別 | 訪客 IP、User Agent、請求路徑、時間戳 |
| 接收者 | Cloudflare Inc.（Keeply 之 processor）|
| 跨境傳輸 | 訪客所在地 → Cloudflare 全球邊緣節點；SCC（Cloudflare 標準 DPA）|
| 保留期 | Cloudflare 預設日誌保留期（無 Enterprise 帳戶時一般為數小時至數日）|
| 技術與組織措施 | TLS at edge、ISO 27001、SOC 2 |
| 合法基礎 | Art. 6(1)(f) 正當利益（網站安全與可用性）|
| 相關文件 | Cloudflare DPA（cloudflare.com/cloudflare-customer-dpa）|

### P-04: GitHub, Inc.（軟體散佈）

| 欄位 | 內容 |
|---|---|
| 處理目的 | Keeply 二進位檔案托管於 GitHub Releases（下載）；GitHub 提供匿名下載統計 |
| 資料主體類別 | 下載 Keeply 的使用者 |
| 個資類別 | 下載請求之 IP、時間戳（由 GitHub 處理）|
| 接收者 | GitHub Inc. / Microsoft Corporation |
| 跨境傳輸 | 使用者所在地 → GitHub 伺服器（美國）；GitHub 為 DPF 認證成員 + SCC |
| 保留期 | GitHub 預設政策 |
| 合法基礎 | Art. 6(1)(b) 契約必要性（免費版與付費版下載均需此管道）|
| 相關文件 | GitHub DPA（docs.github.com/en/site-policy/privacy-policies/github-data-protection-agreement）|

### P-05: Zoho Corporation（電子郵件）

| 欄位 | 內容 |
|---|---|
| 處理目的 | wei@keeply.work 與 hello@keeply.work 之電子郵件收發 |
| 資料主體類別 | 與 Keeply 通訊之任何對象（使用者、供應商、投資人等）|
| 個資類別 | 寄件人/收件人 email、主旨、內文、附件 |
| 接收者 | Zoho Corporation（Keeply 之 processor）|
| 跨境傳輸 | 對方所在地 → Zoho 資料中心（美國/印度）；SCC |
| 保留期 | 依 Keeply 自主管理（無自動刪除）|
| 合法基礎 | Art. 6(1)(f) 正當利益（商業通訊）|
| 相關文件 | Zoho DPA |

### P-06: Cloudflare, Inc.（桌面 app opt-in 使用統計）

| 欄位 | 內容 |
|---|---|
| 處理目的 | 理解使用者安裝通路與產品使用情形以改善產品（僅 opt-in 個資層）。匿名安裝來源計數為非個資，不列入本紀錄（見 §5）|
| 資料主體類別 | 於首次啟動明確同意「分享使用統計」之 Keeply 桌面 app 使用者 |
| 個資類別 | 本機產生之隨機識別碼、作業系統與主要版本、處理器架構、介面語言、app 版本、低頻活躍訊號（週/月彙總）、邊緣推導之國家（兩碼國別，不存原始 IP）|
| 合法基礎 | **Art. 6(1)(a) 同意**（非 6(1)(f)；故無 LIA。問責書面見 `governance/2026-05-26-telemetry-two-tier-consent.md`）|
| 接收者 | Cloudflare Inc.（Keeply 之 processor；自架 Cloudflare Worker + D1）|
| 跨境傳輸 | 使用者所在地 → Cloudflare 全球邊緣 + D1（含美國）；SCC（Cloudflare 標準 DPA）|
| 保留期 | 12 個月（與授權稽核基準一致），之後刪除或彙總為不可識別統計 |
| 技術與組織措施 | Worker 零 IP 落地（關 request log + Analytics IP 記錄）；country 由 CF-IPCountry edge 推導、原始 IP 不落地；匿名層與個資層時間去耦（unlinkability）；TLS at edge、ISO 27001、SOC 2 |
| 相關文件 | `privacy-2026-05-26.md` §2.5；`governance/2026-05-26-telemetry-two-tier-consent.md`；Keeply spec 296–299 |
| **INV-8** | **MET** — Cloudflare DPA v6.4（2026-04-03 effective）透過 Self-Serve SSA §6.1 auto-incorporation 自動生效；DPA「Services」broad definition 廣義涵蓋所有 cloud-based solutions（含 Workers + D1），無排除條款。雙邊書面確認信因 vendor 政策不可得，以公開資訊替代證明（GDPR Art 5(2) accountability 允許）。公開證據文件：`cloudflare-public-evidence-2026-05-30.md`（8 個官方 URL，2026-05-30 蒐集）。下次複審：2026-11-30。|

---

## 4. 資料主體類別總表

| 類別 | 範圍 | 適用處理活動 |
|---|---|---|
| Keeply 付費版使用者 | 購買 Team tier 或 Early Access Perpetual 授權者 | P-01, P-02, P-04, P-05 |
| Keeply 免費版使用者 | 使用 Free tier 者（本機為主，不觸發 P-01）| P-04 |
| keeply.work 網站訪客 | 所有訪問網站者 | P-03 |
| 商業通訊對象 | 與 Keeply 信件往來者 | P-05 |
| 同意分享使用統計之 app 使用者 | 於首啟 opt-in 之桌面 app 使用者 | P-06 |

---

## 5. 資料最小化之明示排除

為滿足 Art. 5(1)(c) 最小化原則，以下資料**不**儲存、處理、傳輸：

- 專案檔案內容（保留於使用者本機 `~/.keeply/`）
- Keeply app 內部活動紀錄（本機 `activity.db`）
- 真實姓名（由 Paddle 處理，不進入 Keygen / Cloudflare）
- 電子郵件（由 Paddle 處理；Keeply 主動通訊時才會進 Zoho）
- 原始 MAC 位址 / MachineGuid / CPU serial（Keeply 於本機即 HMAC 雜湊化後才傳輸）
- 桌面 app 匿名安裝來源計數（單一 enum：winget/direct/homebrew/unknown）——經設計為非個資（聚合 atomic counter、無 id、無 IP、無時間戳），故不列為個資處理活動；技術保證見 `governance/2026-05-26-telemetry-two-tier-consent.md`
- 桌面 telemetry 之原始 IP（P-06 之 Worker 零 IP 落地；country 由 Cloudflare edge 推導後存兩碼國別，原始 IP 不落地）

---

## 6. 資料保存期總表

| 資料類別 | 保存期 | 法律基礎 |
|---|---|---|
| 使用者本機資料 | 由使用者自主管理 | 使用者控制 |
| Keygen license 紀錄 | License 期間 + 12 個月 | Art. 6(1)(b) 契約 + Art. 6(1)(f) |
| Keygen API 日誌 | 30 天 | Keygen 內部安全 |
| Paddle 付款紀錄 | 7 年 | 稅捐稽徵法第 30 條 |
| Cloudflare 訪客日誌 | 數小時至數日 | Cloudflare 預設 |
| GitHub 下載紀錄 | GitHub 預設 | GitHub 預設 |
| Zoho email | Keeply 自主管理 | 商業通訊保存 |
| 桌面 telemetry 個資層（P-06） | 12 個月，之後刪除或彙總為不可識別統計 | Art. 6(1)(a) 同意 |

---

## 7. 資料主體權利實現機制

| 權利 | 條文 | 實現路徑 |
|---|---|---|
| 查閱權 | Art. 15 | 使用者來信 wei@keeply.work → Keeply 從 Keygen/Paddle 彙整資料回覆 |
| 更正權 | Art. 16 | 同上 |
| 刪除權 | Art. 17 | Keeply 代轉請求予 Keygen；Paddle 依稅務義務豁免（Art. 17(3)(b)）|
| 限制處理權 | Art. 18 | 依個案處理 |
| 資料可攜權 | Art. 20 | 本機資料使用者自行複製；Keygen 資料透過 email 請求結構化匯出 |
| 反對權 | Art. 21 | Privacy Policy §3.7、§5.7、§7.6 已說明行使路徑 |
| 不受自動化決定 | Art. 22 | 不適用（Keeply 無自動化決策）|

---

## 8. 安全事件通知

依 Art. 33：Keeply 作為 controller，於得知資料外洩後 72 小時內應通知主管監督機關（若有高風險）。

| 來源 | 通知路徑 |
|---|---|
| Keygen 通知 Keeply 發生外洩 | Keygen Privacy §1.8 承諾 72 小時 breach notification → Keeply 評估 → 通知 DPA 與資料主體（若適用）|
| Keeply 自身發生外洩 | Keeply 自行評估 → 通知 DPA 與受影響資料主體 |

---

## 9. 版本控制與複審

| 日期 | 版本 | 變動 |
|---|---|---|
| 2026-05-30 | v0.3 | P-06 INV-8 結案：Cloudflare DPA v6.4 auto-incorporation 廣義涵蓋 D1/Workers，以 `cloudflare-public-evidence-2026-05-30.md` 為替代書面證明。P-06 總覽表與詳細條目同步更新。|
| 2026-05-26 | v0.2 | 新增 P-06：Cloudflare 桌面 app opt-in 使用統計（Art. 6(1)(a) 同意；新處理活動 + 新資料類別，同 P-03 法人）。匿名安裝來源計數為非個資、明示排除（§5）。對齊 privacy-2026-05-26.md §2.5 + governance/2026-05-26-telemetry-two-tier-consent.md。|
| 2026-04-23 | v0.1 | 初始版本建立 |

下次例行複審：2027-04-23。

觸發式複審條件：新增處理者、新增資料類別、新增處理目的、保留期變更、跨境傳輸機制變更、Keeply 商業模式重大變更。

---

## 附件：相關文件索引

| 文件 | 路徑 | 狀態 |
|---|---|---|
| Privacy Policy（zh-TW）| `privacy-2026-04-21.md` | draft v0.1 |
| Privacy Policy（EN）| `privacy-2026-04-21.en.md` | draft v0.1 |
| TIA（Keygen）| `tia-2026-04-23-keygen.md` | draft v0.1 |
| DPIA | `dpia-2026-04-21.md` | draft v0.1 |
| LIA - identity-hash | `lia-2026-04-21-identity-hash.md` | draft v0.1 |
| LIA - fingerprint | `lia-2026-04-21-fingerprint.md` | draft v0.1 |
| LIA - admin-dashboard | `lia-2026-04-21-admin-dashboard.md` | draft v0.1 |
| DPA template（for Team tier customers）| `dpa-template-2026-04-21.md` | draft v0.1 |
| License enforcement gap | `governance/license-enforcement-gap.md` | approved v1.0 |
| Keygen 合約證據包 | `third-party-agreements/keygen/` | 5 PDFs |

---

*本文件 v0.1 為 draft。首次年度複審（2027-04-23）後將更新至 v0.2。*
