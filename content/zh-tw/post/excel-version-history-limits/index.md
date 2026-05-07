---
title: "Excel 還原版本只回 1-2 版？4 個 Microsoft AutoSave 沒講的限制"
description: "Excel 版本史只回 1-2 版不是 bug，是 Microsoft 把 AutoSave 當 cloud bait 設計的後果。"
date: 2026-05-04T20:00:00+08:00
draft: false
slug: excel-version-history-limits
primary_keyword: "excel 還原版本"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories: [檔案管理]
tags: [版本控制, 檔案還原, 雲端同步]
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
---

週五下午 5:47，你在改月底結算 Excel。剛剛刪了一段公式想試另一個算法，結果改錯了。Cmd+Z hit 到 undo 上限，回不去。打開「檔案 > 資訊 > 版本歷史」，grayed out。你才想到：這份結算表存桌面，沒上 OneDrive。30 分鐘的公式工作沒了。

這不是個案。每個用 Excel 工作的人都會遇到——是 Microsoft 把版本歷史當 cloud subscription bait 設計的後果。我們先看清楚 4 個你撞到的限制，再給你 3 個工具設計怎麼真正解。

## 目錄

- [Excel 版本歷史 grayed out 的真實原因](#why-grayed-out)
- [Microsoft AutoSave 沒講的 4 個限制](#four-limits)
- [為什麼 Microsoft 設計成這樣](#why-microsoft)
- [3 種工具設計怎麼真正解](#three-designs)
- [Keeply 不適合的時候](#boundaries)

## Excel 版本歷史 grayed out 的真實原因 {#why-grayed-out}

「檔案 > 資訊 > 版本歷史」這個按鈕**只在 4 個條件全滿足時才工作**：(1) 檔案存 OneDrive 或 SharePoint (2) AutoSave 已打開 (3) 你是商業版授權 (4) 在 desktop 不在 web。任一條件不 met，按鈕就 grayed out。

不講真的不知道：你的工作模式可能 4 個條件**1 個都沒中**：存桌面、AutoSave 預設關閉、個人版、跨 desktop/web 切換。所以 grayed out 是預設情況，不是你哪裡做錯。

## Microsoft AutoSave 沒講的 4 個限制 {#four-limits}

把「Excel 版本歷史不夠用」拆開看，4 個 invariant 限制不論你怎麼設定都繞不過：

| # | 限制 | 後果 |
|---|---|---|
| 1 | **desktop AutoSave 只回 1-2 版** | 你改錯 30 分鐘前 = 救不回 |
| 2 | **OneDrive/SharePoint 30 天過期** | 季度 review 客戶要看 60 天前版本 = 沒了 |
| 3 | **本機檔案完全沒版本史** | 為了隱私存桌面 = 無歷史 |
| 4 | **沒有 cell-level diff** | 不能說「保留新加的 column 但救回舊 formula」 |

每個限制都是 Microsoft 工程上**故意不解**的選擇，不是技術做不到。下一段講為什麼。

## 為什麼 Microsoft 設計成這樣 {#why-microsoft}

完整的 file history layer 技術上 trivial。macOS Time Machine 2007 年就示範給整個業界看了。Microsoft 工程上能做、商業上不做。

問題是商業設計：版本歷史是 OneDrive subscription 的差異化功能。如果 desktop Excel 自己就有完整 history、本機檔案也有、無時間限制，OneDrive 訂閱會少一個 lock-in 理由。

對啊，這就是讓人煩的地方。你撞到的不是 bug，是 paywall。只是 Microsoft 不會這樣 frame。版本歷史對使用者是**檔案安全網**；對 Microsoft 是**訂閱上鉤餌**。兩個角色在同一個功能上，誰決定行為？決定那個的人不是你。

## 3 種工具設計怎麼真正解 {#three-designs}

把工具能做的事拆成 3 種設計模式。每種對應前面 4 個限制裡的某一些。

### Design A：每次 Cmd+S 自動 snapshot（不依賴雲端）

工具在你按 Cmd+S 的同時保留前一版，無論檔案存桌面還是雲端。**例子**：macOS Time Machine（檔案層 / 系統級）、Keeply（檔案層 / git 引擎）。**Keeply** 的差別：每版完整保留無時間限制（不像 OneDrive 30 天過期）。**解限制 #1 + #2 + #3**。

### Design B：自動里程碑（每月底/每季度凍結）

工具讓你主動標「這版是月底結算 v3」「這版是 Q2 close」，凍結點之後不論怎麼改都還在。**例子**：Git tag（developer-only）、Keeply Release（內建，UI 不講 git 術語）。**解限制 #2 的延長場景**：季度 review 還能找到當時的版本。

### Design C：版本內容搜尋

從歷史任何版本搜 cell 內容（不只是檔名）。**例子**：Keeply spec 049 version-search 搜歷史版本內 cell content。**解限制 #4 的部分**：雖然不是 cell-level diff，但能找到「那個 100 元的數字最後一次出現是哪一版」。

這時候你就會發現，4 個限制裡 #4（cell-level diff）是真實 boundary，下面 H2 #5 老實講為什麼。

## Keeply 不適合的時候 {#boundaries}

Keeply 不解所有 Excel 場景：

- **Cell-level diff**：Keeply 顯示「整檔 v3 → v4」，不顯示「cell B7 從 100 變 105」。要 cell diff 仍要 Microsoft 365 co-edit 或 spreadsheet diff 工具。
- **Formula 邏輯錯誤**：Keeply 救「上一版的 formula」，不救「formula 本身寫錯」。後者是 Excel debug 工具的場。
- **多人 collaborative editing**：Microsoft 365 即時協作比 Keeply 強（不同場景）。
- **檔案 size 仍受硬碟限制**：100 個 50MB 模型 = 5GB Keeply 也是 5GB。

## 下次按 Cmd+S 之前

下次你撞到 Excel grayed out，不會再以為自己沒做對——你會知道那是 Microsoft 故意設計的結果，且你有別的選項。

想看 Keeply 怎麼處理 Excel 版本？[繼續閱讀「檔案版本管理完整指南」](/zh-tw/post/file-version-management-complete-guide/)。

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
