---
title: "為什麼我做 Keeply：從「我的檔案到哪去了？」開始"
description: "Keeply 是為了讓你看得到自己的檔案而做的，不是為了把你變成 dev。"
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - 創辦人筆記
tags:
  - Keeply
  - 設計哲學
  - 創辦人
image: cover.svg
og_image: cover.png
role: standalone
template: T6
---

第一個用 Keeply 的早期測試者，打開 NAS 想看自己的檔案。打開資料夾，看到的是 `objects/`、`pack/`、`HEAD`。沒看到他存的設計檔。他傳訊息給我：「我的檔案到哪去了？」

那一秒我知道做錯了什麼。

我們選了「備份」這個詞當基礎概念。備份在工程腦裡是 OK 的：壓縮過、編碼過、不能直接看。但對使用者，**備份的反義詞不是「沒備份」，是「找不到」**。打開資料夾看不到自己的東西 = 信任斷裂。技術 say it's safe 沒用，眼睛 say not safe 就是 not safe。

這是 Keeply 的第一個轉彎。後來變成正式 [ADR-001](https://github.com/boy1690): 不用「備份」做核心隱喻，改用「專案位置」。一個詞之差，整個資料結構跟著改。

## 我選的那條岔路

當時可以走兩條路。要嘛把使用者教成 dev（學會看 `objects/` 是 pack file、`HEAD` 是指標），要嘛把工具變成辦公室語言（「儲存版本」「版本歷史」「還原」）。

教使用者比較便宜，做工具難。我選後者。

Keeply 的[使命](https://github.com/boy1690)從那之後寫成一句話：「**讓非技術人員用辦公室語言管理檔案版本，完全不需要知道 Git 的存在。**」UI 不出現 commit、branch、HEAD、stash 這些字，連隱喻都不行。底下用 git2 引擎，但那是我的問題不是你的。

## 我犯過的錯（之一）

不是每個設計決策都對。今年四月有一輪做 Free / Team 差異化方案，我請高階模型寫初稿，它交回 530 行，含 5 種用途配額、watermark 證據、RFC 3161 timestamp、5 個複雜升級觸發點。

我看完否決全部。

理由：watermark 在台灣不是法律證據（正式公文才是）。NAS 上一台機器多個資料夾物理上等價於 multi-vault，限數字沒意義。RFC 3161 timestamp 對台灣使用者沒實質賣點（走郵局存證或公證）。**這些 feature 服務的是理論不是真實使用者**。

每個 spec 決策現在都過這 3 題：用戶要嗎？台灣場景有意義嗎？刪掉會有人在意嗎？任一 no = 不做。

## 為什麼寫這篇

這篇講**透明**：我做這工具的理由、我犯過的錯、我堅持的原則。

如果你要把客戶資料、設計檔、合約交給一個工具管 5 年 10 年，你需要知道做這工具的人怎麼想。我沒辦法保證 Keeply 永遠對的，但我可以保證：每個決策都有寫下來、每個錯都會 reframe、每個 over-engineered idea 都會被否決。

下一個版本見。

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
