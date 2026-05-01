---
title: "Vibe Coding 失控了？1 個動作回到上一個能跑的版本"
description: "AI agent 衝太遠，code 不能跑。打開 Keeply 時間軸，最後一筆能跑的版本還在。"
date: 2026-04-30T09:00:00+08:00
slug: vibe-coding-rollback
locale: zh-TW
primary_keyword: "vibe coding 失控"
locales: [zh-TW, en, zh-CN, ja, ko]
tags: [Keeply 教學, vibe coding, AI coding, 版本管理, 救回檔案]
categories: [Keeply 應用情境]
template: T1-cluster
voice: B-Emotional-StoryBrand
motif: "AI 衝太遠 vs 你叫得回它"
image: cover.svg
og_image: cover.png
draft: false
status: approved
bwf_version_at_draft: v0.2.11
flow: v0.3 4-step (auto draft)
---

# Vibe Coding 失控了？1 個動作回到上一個能跑的版本

> AI agent 衝太遠，code 不能跑。打開 Keeply 時間軸，最後一筆能跑的版本還在。

## 目錄

1. [AI 衝太遠的時刻長什麼樣子？](#ai-overshoot)
2. [1 個動作：打開時間軸，點上一筆能跑的](#one-action)
3. [為什麼 AI 不會自己回頭](#ai-doesnt-rollback)

---

A 工程師打開 Cursor，叫 AI 改一個 bug。AI 改完跑不過。他叫 AI 再修。AI 動了第 3 個檔案。還是不行。又改了第 5 個。A 工程師此刻已經不確定 AI 動過哪幾個檔案了。

這時候你應該會想：先停下來，至少要回到剛才那個還能跑的狀態。

問題是這個：**你怎麼知道剛才能跑的是哪一版？**

---

## AI 衝太遠的時刻長什麼樣子？ {#ai-overshoot}

你在 vibe coding。你給 AI 一個目標，AI 寫了一段。

跑跑看，OK。

下一輪，你說「再加一個 feature」。AI 動了 3 個檔案。跑——出錯。

你說「修那個 error」。AI 動了 5 個檔案，改到 config，加了一個你沒問過的 helper function。跑，更多 error。

![AI agent 對話視窗 vs 你電腦上實際被改的檔案數對比](image-1.svg)

這時候 AI 還在自信地修。**它不會主動說「我可能寫崩了」**。

它的記憶只有當前 context window。**它不知道 5 個 prompt 之前你的 code 是好的**。但你電腦上的檔案知道。只要有人記住。

---

## 1 個動作：打開時間軸，點上一筆能跑的 {#one-action}

### 第 1 步：打開 Keeply 時間軸

左側 sidebar 第一個 tab。你會看到今天的所有變動，按時間排。

### 第 2 步：找最後一筆「還在跑」的時間點

時間軸上每一筆是 Keeply 的自動儲存點或你手動標記的時間點。每個點進去看變動內容，找你記得「那時候測過 OK」的版本。

通常是 30-60 分鐘前。AI 開始跑題前的最後一次測試。

![Keeply 時間軸 zoom-in：每筆檔案筆記顯示時間 + 變動行數 + 你之前的測試紀錄](image-2.svg)

### 第 3 步：右鍵那一筆，選還原

整個資料夾在 30 秒內回到那個時間點的狀態。**所有檔案、所有目錄結構、所有 config 全部一起回去**。不只是一個檔案。

包括 AI 偷加的 helper function、改過的 config、不該被動的 .env。**全部回去**。

接著你跑一次。能跑。

![還原前 vs 還原後對比：檔案樹 + 跑測試指令的綠燈](image-3.svg)

整個過程不到 1 分鐘。**你不用記 AI 動過哪幾個檔案。Keeply 全記了**。

---

## 為什麼 AI 不會自己回頭 {#ai-doesnt-rollback}

AI agent 設計成**往前推進**的。它收到 prompt，產出 edit。它不會主動回望「我剛才那一輪是不是把整個專案變糟了」。

這個責任不在 AI 身上。是它的架構限制。

責任在你：**你需要 safety net 在背景跑**。AI 衝多遠都行，因為你叫得回它。

不是 Keeply 要取代你寫 code。是你 vibe coding 的時候，不該靠記憶力回頭。記憶力會輸給 AI 改檔案的速度。

---

## 收尾

今天 AI 寫到失控之前，先打開 [Keeply](https://keeply.work/)，把專案資料夾拖進去。

下次它衝過頭，你打開時間軸點上一筆。**問題 30 秒內結束**。

---

## 延伸閱讀

- [檔案記事軟體 Keeply 怎麼用：不用學 30 個功能，2 個動作就上手](/zh-tw/post/keeply-getting-started-from-zero/)（PILLAR 3，Keeply 整體上手指南）

---

*作者：Ting-Wei Tsao，Keeply 創辦人 ｜ [LinkedIn](https://www.linkedin.com/in/tingwei-tsao/)*
