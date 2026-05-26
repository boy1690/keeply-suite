# PRD — Keeply Desktop Telemetry（最小可行版）

> 發起：keeply-suite marketing 端 L1 獲客分析（2026-05-26）
> 對象：Keeply 桌面 app 專案（Tauri 2 + Rust + React，`D:\tools\doing\Keeply`）
> 狀態：draft，待 Keeply agent + Bill 討論技術可行性與隱私決策

---

## 1. 背景與動機（為什麼現在要做）

2026-05-26 的行銷端漏斗分析挖到一個**測量盲區**：

- Keeply 有 **~150–250 個真實活躍安裝**（以各版 `latest.json` 的 updater 輪詢數推估：v1.0.12=172 / v1.0.10=257），但**獲客來源完全不明** —— Bill 本人也不知道用戶從哪來。
- 窮盡所有公開數據後，最強假設是 **winget search 長尾**：
  - `keeply-releases` release 頁 14 天只有 **1 view**（沒人逛頁手動下載）
  - GitHub repo **stars=0 / forks=0**（無開發者社群關注）
  - 公開網路**零提及**（搜不到任何論壇/評論/文章談 Keeply）
  - 卻有 **512 累計下載**（含 winget validation / Defender 掃描 / updater 等 noise）
  - winget manifest 掛了 `git / version-control / backup / sync / file-management` tags → 推論：用戶在命令列 `winget search git`（或 backup/version-control）撞到 Keeply、直接 `winget install`，**全程不經任何網站、不留痕跡**。
- **但這是未證實的假設。** 桌面 app 目前**完全沒有 telemetry**，所以「用戶是誰、從哪條路進來、留存如何」是個黑盒。

**沒有 telemetry → 所有通路投資與品牌定位決策都是矇眼下注。** 具體有一個正卡著的商業決策（見 §6）需要這個數據才能拍板。

## 2. 目標

最小、隱私乾淨的 telemetry，能回答三個問題：

1. **新安裝從哪來**（winget / 直接下載 / 網站）← **最關鍵，這是整個 PRD 的核心**
2. **用戶輪廓**：OS / arch / 語言 / 粗略地區 / app 版本
3. **活躍與留存**：DAU/WAU proxy（補強 `latest.json`，後者只反映「有開 updater」不反映「有在用」）

## 3. 非目標（明確不做，守隱私 + P0.2 品牌信任）

- ❌ 不收 PII（姓名/email/帳號）
- ❌ 不追蹤使用行為（開了哪個檔、檔名、內容、操作）
- ❌ 不做廣告 / 再行銷 / 跨裝置識別
- ❌ 不取代 `latest.json`（updater 輪詢仍是活躍基數 proxy）

## 4. 核心待解技術問題 ★（最高優先，Bill 不確定此點）

**如何可靠偵測 install source（winget vs 直接下載 vs 網站）？** 這是整個 telemetry 的價值核心 —— 沒有它，只能知道「用戶輪廓」但答不出「從哪來」。請 Keeply agent 研究：

- **winget 安裝 context**：
  - winget 安裝 NSIS `.exe`（manifest `InstallerType: nullsoft`）時，會不會設環境變數、傳特定參數、或留下可被偵測的痕跡？
  - winget 安裝時的 process tree（`winget.exe` → installer）能否在安裝當下被 NSIS 腳本捕捉？
  - NSIS installer 能否在安裝時寫一個 `install_source` 標記到註冊表 / app data，供 app **首次啟動時讀取**？
  - 參考方向：winget 的 silent install flags、`WT_SESSION` 之類環境變數、或 installer 收到的 command-line。
- **網站 / 直接下載**：GitHub release asset URL **不能帶 query string**（`/releases/download/<tag>/<asset>` 是固定的），所以無法用 UTM 區分「從 keeply.work 點」vs「GitHub 直接抓」。這條可能只能歸為 `direct`。
- **可接受的退路**：若無法精確三分，至少做到 **`winget` vs `non-winget` 二分** —— 這已足以驗證/否證 winget 假設（本 PRD 的首要目的）。

## 5. 資料模型（建議，可調整）

**`first_run` event**（首次啟動送一次）：
```
event:          "first_run"
anonymous_id:   <本地生成隨機 UUID，無 PII>
install_source: "winget" | "direct" | "unknown"   ← §4 的產物
app_version:    "1.0.12"
os:             "windows" | "macos"
os_version:     "..."
arch:           "x64" | "aarch64"
locale:         "zh-TW" | "en" | ...
timestamp:      ISO8601
```

**`heartbeat` event**（活躍/留存，低頻，建議每日最多一次）：
```
event:        "heartbeat"
anonymous_id: <同上 UUID>
app_version:  "..."
timestamp:    ISO8601
```
country 由後端從請求 IP 粗略推導（不存 IP 本身）。

## 6. 這個數據要解的具體決策（讓 Keeply agent 理解優先級）

行銷端有一個正卡住的決策：**winget manifest 的描述目前寫「Git version control for non-technical office users… translates Git concepts… without learning Git」，這違反品牌鐵律 P0.2**（永不把 Keeply 定位成「給非開發者的 Git」）。

但這個 git 定位 + git tag **很可能正是 winget search 的流量來源**。形成 trade-off：

- **保 git 定位** → 可能保住 winget search「git」長尾獲客
- **守 P0.2** → 改描述，但可能砍掉唯一在運作的獲客引擎

**telemetry 就是解這個 trade-off 的硬證據**：若數據證實「新安裝大量來自 winget」→ git 定位的價值有據（行銷端傾向「分層定位」：winget/技術通路用 git、apex/blog 一般通路守 P0.2）；若 winget 佔比其實很低 → 直接守 P0.2、另找通路。

## 7. 後端選型（桌面 app 目前零分析基建，需從頭選）

| 選項 | 優點 | 缺點 |
|------|------|------|
| **Aptabase**（推薦） | 專為桌面 app 設計、Tauri 官方生態推薦、隱私友善（匿名、GDPR-ready）、有官方 Tauri plugin | 第三方依賴、免費額度上限 |
| **自建 Cloudflare Worker + D1/KV** | 最可控、無第三方、隱私最乾淨、Bill 已有 CF 帳號（keeply.work zone） | 要自建 endpoint + 儀表板 |
| 沿用網站 GA4（property 534326745，Measurement Protocol） | 與網站獲客同一儀表板 | GA4 對桌面 event 笨重、consent 模型不適用桌面、易污染網站數據 |

**建議：Aptabase（最快上線）或自建 CF Worker（最乾淨）**。不建議硬塞 GA4。

## 8. 隱私設計（建議，決策點留 Bill）

- 匿名隨機 UUID，無帳號、無檔名、無 IP 存儲
- **建議 opt-out**（首啟告知 + 設定可隨時關）。
  - ⚠️ 決策點：opt-out vs opt-in。**opt-in 會大幅降低覆蓋率、失去代表性**（多數人不會主動開），對「驗證來源」這個目的傷害大；opt-out 在匿名前提下業界常見且合規。建議 opt-out，但由 Bill 拍板。
- 首啟一行透明說明 + privacy policy 連結（keeply.work/privacy）
- solo operator + 匿名 + opt-out + 揭露，通常足以滿足 GDPR/CCPA；建議與既有隱私政策一致。

## 9. 實作階段建議

- **Phase 1（MVP）**：`first_run` ping（install_source + 輪廓）+ 隱私揭露 + opt-out 開關 + 後端 endpoint
- **Phase 2**：`heartbeat`（留存曲線）
- **Phase 3**：儀表板 / 月報（與 marketing 端 GitHub download + latest.json 數據合併看全貌）

## 10. 開放問題清單（討論用）

1. ★ **install_source 偵測技術可行性**（§4）—— 最關鍵，先研究這個
2. 後端選型：Aptabase vs 自建 CF Worker vs GA4
3. opt-out vs opt-in
4. 要不要收 country（IP 粗定位，後端推導不存 IP）
5. 是否與網站 GA4 打通成同一獲客視圖
6. macOS 端的 install source（Homebrew? 直接 .dmg?）是否也要區分

---

## 附錄：行銷端已掌握的事實（供交叉參照）

- 真實階段：**純免費 pre-revenue**（$599 付費未開始收）
- 真實活躍：~150–250（`latest.json` 輪詢）
- 累計下載：512（含 winget validation / Defender / updater noise，**非不重複人數**）
- 平台：~85% Windows（.exe 435 / .dmg 68 / .msi 6）
- 網站訪客（≠ 下載者）：US（blog 英文 SEO）+ 台灣（本土）為主，近半是 mobile（不能裝桌面 app）
- winget manifest：`microsoft/winget-pkgs` → `manifests/b/Boy1690/Keeply/`，InstallerUrl 指 `keeply-releases` release asset
- 相關桌面 spec：`infra/122-installer-trust-kit`（簽章/SmartScreen reputation）、`125`（季度信任檢查）、`126`（website download URL）

*PRD v0.1 | 2026-05-26 | 由 keeply-suite marketing L1 分析發起，交 Keeply 桌面 app 專案討論*
