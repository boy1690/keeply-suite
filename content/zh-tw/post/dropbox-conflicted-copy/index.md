---
title: "Dropbox 衝突的副本：為什麼一直出現？4 種讓它不再回來的 sync 設計"
description: "`(conflicted copy)` 不是 bug，是 Dropbox 設計上沒做衝突偵測、後存者覆蓋前一版的結果。本文拆解 4 種會觸發衝突副本的場景，以及 3 種同步設計怎麼根治。"
voice_version: v2-2026-05-11
date: 2026-05-05T05:55:00+08:00
draft: false
slug: dropbox-conflicted-copy
primary_keyword: "dropbox 衝突的副本"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories: [檔案管理]
tags: [版本控制, 檔案還原, 雲端同步]
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
image_alt_data: "分割圖示:Anna 與 Bill 同時編輯同一份 proposal.docx，Dropbox 碰撞產生「(conflicted copy)」檔——後存者覆蓋先存，每月每個團隊平均觸發 4 次，這是產品設計的結果而非錯誤"
faq_schema:
  - q: Dropbox 的「衝突的副本」是什麼時候會出現？
    a: 有 4 種場景都會觸發：兩人同時編輯並儲存、離線編輯後上線同步、多裝置切換時的同步延遲、以及 Mac 與 Windows 系統時鐘差異。這 4 種情境只要踩中一種就會產生衝突副本。
  - q: Dropbox 為什麼這樣設計衝突副本機制？
    a: Dropbox 採用 last-writer-wins 策略：後上傳的版本勝出，前一版另存為衝突副本。這是商業取捨，優先保障同步不打斷工作流，而非做衝突偵測。衝突解析責任被刻意推給使用者，不是技術做不到。
  - q: 手動合併兩份衝突副本能根治問題嗎？
    a: 不能。手動合併只是症狀治療，不改變同步機制。下個禮拜同樣情境會再次觸發衝突副本，一個月後你已經重複合併了 4-5 次。解法是換同步機制，而不是讓自己合併得更快。
  - q: 有什麼設計能根治 Dropbox 衝突副本問題？
    a: 有三種設計模式：衝突偵測並提示合併（Git-style）、檔案鎖定機制（check-out 模式）、以及本機副本加手動推送（Keeply 模型）。三種各有取捨，其中本機副本加推送能解決全部 4 種衝突場景。
  - q: Keeply 適合取代 Dropbox 解決衝突副本問題嗎？
    a: 部分適合。Keeply 能解決衝突副本的核心機制問題，但不適合大檔即時同步、行動裝置存取、外部分享連結、或 1 小時內多人頻繁協作的場景。那些情境 Dropbox 或 Google Docs 更合適。
---

週四晚上 10:30，你跟同事 Anna 共用 Dropbox 改一份提案。她加了 3 段內容，你同時加了結尾的 CTA。你們都按 Cmd+S。隔天打開資料夾，多了一份 `提案 (Anna 的 conflicted copy 2026-05-02).docx`。她改的你這裡沒有，你加的她那裡也沒有。你花 1 小時手動合併，30 分鐘檢查有沒有漏。

這不是 bug，是 Dropbox 設計上沒做衝突偵測層的後果。我們先看 4 種會觸發衝突副本的場景，再給你 3 種同步設計怎麼根治。

## 目錄

- [什麼時候會出現衝突副本？](#when-it-happens)
- [Dropbox 為什麼這樣設計？](#why-dropbox-design)
- [為什麼手動合併兩份檔案只是症狀治療？](#why-manual-merge-fails)
- [3 種同步設計怎麼根治？](#three-designs)
- [什麼時候 Keeply 不是 Dropbox 衝突副本的正確解法？](#boundaries)

## 什麼時候會出現衝突副本？ {#when-it-happens}

把「衝突副本一直出現」拆開看，4 種完全不同的場景每個都會觸發：

| # | 場景 | 機制 |
|---|---|---|
| 1 | **兩人同時編** | 兩端都按 Cmd+S 上傳，Dropbox 不知道前面已被改 |
| 2 | **離線編後上線** | 火車上改一段，回到 Wi-Fi 同步時跟雲端版本不一致 |
| 3 | **多裝置切換** | 筆電寫到一半切手機繼續，筆電後來同步撞到手機版 |
| 4 | **跨作業系統時鐘差** | Mac 跟 Windows 系統時鐘差幾秒，Dropbox 判定為衝突 |

沒人告訴你的是：4 種之中只要踩到一種，衝突副本就會出現。**而你的工作模式裡至少會踩到 2 種**。

## Dropbox 為什麼這樣設計？ {#why-dropbox-design}

Dropbox 用「後存者覆蓋、前一版另存」這個機制：兩人同時改，後上傳的版本勝出，前一版不丟掉，存成 `(conflicted copy)`。

不是技術做不到衝突偵測，是商業取捨：

- **即時體驗優先**：同步不能擋你工作。每次都跳「請選擇合併方式」會讓 Dropbox 變難用
- **衝突解析推給使用者**：把另一版另存 = 「我都幫你留著，你自己決定」
- **設計者的選擇**：誰也不丟，但使用者得做工

對啊，這就是讓人煩的地方。Dropbox 把工具該做的事（衝突偵測）推給使用者紀律。而紀律永遠贏不過自動化。

我做 Keeply 之前自己用 Dropbox 撞過上百次同樣的事，後來才搞懂不是我不夠細心，是 Dropbox 本來就這樣設計的。

## 為什麼手動合併兩份檔案只是症狀治療？ {#why-manual-merge-fails}

Dropbox Help Center 教你的修法：「打開兩份檔案、比對差異、手動合併到主檔、刪掉衝突副本。」一聽很合理。

但這個修法**不改變機制**。你下個禮拜還會再撞到同步衝突、還會再產生新衝突副本、還會再手動合併。一個月之後你已經做這件事 4-5 次。

你不是不會合併。你是在用一個**設計上不擋衝突的工具**。解法是換同步機制，不是訓練自己合併得更快。

對比 Google 前 3 名搜尋結果（Dropbox Help / EaseUS / Wondershare）：他們都是症狀治療指南，沒人從機制角度切入。這篇文章從機制切入。

## 3 種同步設計怎麼根治？ {#three-designs}

把同步設計能做的事拆成 3 種模式。每種對應不同的衝突場景：

### 設計 A：偵測 + 提示（同步時主動問你）

兩端改同檔，同步時偵測衝突，跳介面提示給使用者選：留 A、留 B、或把兩個變更合併。**例子**：工程師圈用的版本控制工具用這種模式。**Keeply** 把同樣的偵測搬進辦公室工具：撞到衝突時，用「Anna 的版本」「你的版本」「兩個合起來」這種白話讓你選，不會跳出術語。**解場景 #1 + #2**。

### 設計 B：檔案鎖定（誰開了誰先用）

你打開檔案，工具自動鎖住。同事打開看到「Anna 在用」，不能改，要等。**例子**：SharePoint、Adobe Creative Cloud Files、Bentley ProjectWise（建築業專案管理系統）。**解場景 #1 + #3 + #4**，取捨：同事得等。

### 設計 C：本機副本 + 主動推送（Keeply 模型）

你的工作版本在本機，同步是你主動按「推送」（不是 Dropbox 那種即時鏡像）。衝突在推送時才偵測、用白話介面問你。**Keeply** 走這條路：本機改完看一眼差異、確認沒問題再推上 NAS / SharePoint / 共用資料夾，省掉「Dropbox 偷偷蓋掉你的版本」這類驚喜。**解場景 #1-#4**，取捨：同步不像 Dropbox 即時。

這時候你就會發現，4 種場景裡 #4（跨作業系統時鐘差）是最難解的，因為它是純時鐘問題。設計 A 跟 C 能偵測到，但解析仍要使用者介入。

## 什麼時候 Keeply 不是 Dropbox 衝突副本的正確解法？ {#boundaries}

Keeply 不解所有 Dropbox 場景：

- **大檔即時同步**：Premiere 專案邊改邊同步，Keeply 本機副本模型不適合（推送一次要幾分鐘）。
- **行動裝置存取**：Keeply 是桌面優先，Dropbox 在手機上順得多。
- **外部分享連結**：Dropbox 的「Share link」Keeply 沒對應功能。
- **協作頻率超高**（1 小時內多人輪流編輯）：Keeply 比 Dropbox 慢，那種場景該用 Google Docs 共同編輯。

## 下次看到 `(conflicted copy)` 之前

下次資料夾多出 `(conflicted copy)` 檔名，你不會再花 1 小時手動合併。你會知道那是機制問題，而且你有別的選項。

想看 Keeply 怎麼解同步衝突？[繼續閱讀「檔案版本管理完整指南」](/zh-tw/post/file-version-management-complete-guide/)。

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
