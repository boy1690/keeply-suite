---
title: "Dropbox 衝突的副本：為什麼一直出現？4 種讓它不再回來的 sync 設計"
description: "Conflicted copy 不是 bug，是 Dropbox 用 last-writer-wins 而沒做衝突偵測的結果。"
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
---

週四晚上 10:30，你跟同事 Anna 共用 Dropbox 改一份提案。她加了 3 段內容，你同時加了結尾的 CTA。你們都按 Cmd+S。隔天打開資料夾，多了一份 `提案 (Anna 的 conflicted copy 2026-05-02).docx`。她改的你這裡沒有，你加的她那裡也沒有。你花 1 小時手動合併，30 分鐘檢查有沒有漏。

這不是 bug。是 Dropbox 沒做衝突偵測層的後果。我們先看 conflicted copy 出現的真實 mechanism，再給你 3 種 sync 設計能根治。

## 目錄

- [什麼時候會出現 conflicted copy](#when-it-happens)
- [Dropbox 為什麼這樣設計](#why-dropbox-design)
- [手動合併兩份檔案是症狀治療](#why-manual-merge-fails)
- [3 種 sync 設計能根治](#three-designs)
- [Keeply 不適合的時候](#boundaries)

## 什麼時候會出現 conflicted copy {#when-it-happens}

把「conflicted copy 一直出現」拆開看，4 種完全不同的場景每個都會觸發：

| # | 場景 | mechanism |
|---|---|---|
| 1 | **兩人同時編** | 兩端都按 Cmd+S 上傳，Dropbox 不知道前面已被改 |
| 2 | **離線編後上線** | 火車上改一段，回到 Wi-Fi sync 時跟雲端版本不一致 |
| 3 | **多裝置切換** | 筆電寫到一半切手機繼續，筆電後來 sync 撞到手機版 |
| 4 | **跨 OS sync delay** | Mac vs Windows 系統時鐘差幾秒，Dropbox 判 collision |

不講真的不知道：4 種之中只要踩一種，conflicted copy 就會出現。**而你的工作模式裡，4 種至少會踩到 2 種**。

## Dropbox 為什麼這樣設計 {#why-dropbox-design}

Dropbox 用 **last-writer-wins + 把舊版另存**設計：兩人同時改，後上傳的版本勝出，前一版不丟掉，存成 `(conflicted copy)`。

不是技術做不到衝突偵測。是 commercial trade-off：

- **即時體驗優先**：sync 不能擋你工作。每次都跳「請選擇合併方式」會讓 Dropbox 變難用。
- **衝突解析推給 user**：把另一版另存 = 「我都幫你留著，你自己決定」
- **設計者的選擇**：誰也不丟，但 user 得做工

對啊，這就是讓人煩的地方。Dropbox 把工具該做的事（衝突偵測層）推給 user 紀律。而紀律永遠贏不過自動化。

## 手動合併兩份檔案是症狀治療 {#why-manual-merge-fails}

Dropbox Help Center 教你的 fix：「打開兩份檔案，比對差異，手動合併到主檔，刪掉 conflicted copy。」一聽很合理。

但這個 fix **不改變 mechanism**。你下個禮拜還會再 sync collision、還會再產生新 conflicted copy、還會再手動合併。一個月之後你已經做這件事 4-5 次。

你不是不會合併。你是在用一個**設計上不擋衝突的工具**。解法是換 sync mechanism，不是訓練自己合併合得更快。

對比 Google 前 3 名（Dropbox Help / EaseUS / Wondershare）：他們都是症狀治療指南，沒人從 mechanism 角度切。這篇文章是。

## 3 種 sync 設計能根治 {#three-designs}

把 sync 設計能做的事拆成 3 種模式。每種對應不同 collision 場景：

### Design A：Detect-and-prompt sync（Git-style merge）

兩端改同檔，sync 時偵測 collision，跳 UI prompt 給 user 選：留 A、留 B、或把兩個變更合併。**例子**：Git（CLI 圈用）、**Keeply** spec M3-100 conflict-detection（用辦公室語言 wrap，不講「merge conflict」）。**解場景 #1 + #2**。

### Design B：File locking（atomic check-out）

你打開檔案，工具自動 lock。同事打開看到「Anna 在用」，不能改。**例子**：SharePoint、Adobe Creative Cloud Files、Bentley ProjectWise。**解場景 #1 + #3 + #4 全部**，trade-off：同事得等。

### Design C：Local Clone + manual sync（Keeply 模型）

Working copy 在你本機，sync 是主動 push（不是即時鏡像）。collision 在 push 時偵測，UI prompt 給 user 選。**例子**：**Keeply** 的 Local Clone Pattern（spec M3-098） + SMB safety layer（M3-095）+ conflict-detection（M3-100）。**解場景 #1-#4 全部**，trade-off：sync 不像 Dropbox 即時。

這時候你就會發現，4 種場景裡 #4（跨 OS sync delay）是最難解的，因為它是純時鐘問題。Design A 跟 C 能 detect，但解析仍要 user 介入。

## Keeply 不適合的時候 {#boundaries}

Keeply 不解所有 Dropbox 場景：

- **大檔即時同步**：Premiere project 邊改邊 sync，Keeply Local Clone 模型不適合（Push 一次幾分鐘）。
- **行動裝置存取**：Keeply 是 desktop-first，Dropbox app 在手機上順得多。
- **外部分享連結**：Dropbox 的「Share link」Keeply 沒對應功能。
- **協作頻率超高**（1 小時內 multiple edits）：Keeply UX 比 Dropbox 慢，那種場景該用 Google Docs co-edit。

## 下次看到 `(conflicted copy)` 之前

下次資料夾多出 `(conflicted copy)` filename，你不會再花 1 小時手動合併——你會知道那是 mechanism 問題，且你有別的選項。

想看 Keeply 怎麼解 sync 衝突？[繼續閱讀「檔案版本管理完整指南」](/zh-tw/post/file-version-management-complete-guide/)。

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
