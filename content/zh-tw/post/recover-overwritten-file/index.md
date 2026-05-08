---
title: "找回被覆蓋檔案的極限：AutoRecover 救不到的地方"
description: "AutoRecover 為當機救援設計，資料復原軟體成功率以覆蓋後幾分鐘為勝負。這些工具都救不了「正常關閉後才發現覆蓋掉」的場景。事後救援不是答案，事前防禦才是。工具層的 always-on 版本歷史，讓覆蓋儲存不再是破壞性動作。"
date: 2026-05-02T18:00:00+08:00
draft: false
slug: "recover-overwritten-file"
primary_keyword: "找回被覆蓋的檔案"
locale: zh-TW
categories: [使用情境]
tags: [檔案還原, 操作失誤]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: single-market-ja-primary
ranking_locales: [ja, ko]
cta_topic: recovery
---

# 找回被覆蓋檔案的極限：AutoRecover 救不到的地方

> AutoRecover 是為當機救援設計的。覆蓋儲存後你需要的是事前防禦。

週五晚上 19:30，月底結算文件用 Excel 編輯中，不小心把前一張工作表覆蓋掉了。

Ctrl+Z 已經沒用（剛才關閉了）。AutoRecover 檔案也消失了。

週一早上前要復原。但來得及嗎？

## 重點

搜尋「**找回被覆蓋的檔案**」的人多數在求事後救援。但 Microsoft AutoRecover 是為當機設計的，資料復原軟體的成功率以覆蓋後幾分鐘為勝負。這些工具都不適用於「正常關閉後才發現覆蓋」的場景。**事後救援不是答案，事前防禦才是**。在工具層放一份 always-on 版本歷史，覆蓋儲存就不再是破壞性動作。

## 本文目錄

1. AutoRecover 到底是為什麼設計的？
2. AutoRecover / 以前的版本 / 復原軟體：各自能救什麼？
3. 為什麼「覆蓋儲存後」就來不及了？
4. 事後救援之外：always-on 版本歷史的選項
5. 常見問題

---

## AutoRecover 到底是為什麼設計的？

Microsoft Office 內建有 3 種「**版本還原**」機制：

- **AutoRecover**：當機時救回未儲存內容。預設每 10 分鐘自動暫存一份。**檔案正常關閉後就清除**。
- **以前的版本**（Windows）：透過陰影複製功能還原到過去快照。需要事前設定。
- **OneDrive 版本歷史**：每次儲存的版本快照。[Microsoft 官方文件](https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)指出預設保留約 500 個主要版本。

設計目的明確：這 3 個機制是給「**當機救援**」、「**最近的儲存事故**」使用的。「**正常關閉後才發現覆蓋錯**」這種場景不在設計目標內。

## AutoRecover / 以前的版本 / 復原軟體：各自能救什麼？

要看每個機制的邊界，並列對比：

| 機制 | 救得到的場景 | 救不到的場景 | 注意事項 |
| --- | --- | --- | --- |
| AutoRecover | 編輯中當機 | 正常關閉後的覆蓋錯 | 檔案關閉即清除 |
| OneDrive [版本歷史](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | 過去 500 版以內 | 超過 500 版的舊版、純本地檔案 | 需雲端儲存 |
| Windows 以前的版本 | 有陰影複製的話 | 沒設定、SSD 環境 | 需事前設定 |
| 資料復原軟體 | 覆蓋直後、磁區未被新寫入 | 過了一段時間、SSD TRIM 後 | 成功率視環境而定 |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | 最近的快照 | 快照間隔之外 | 需另外設定 |

對啊，這就是讓人煩的地方。沒有一個機制能結構性地觸及「正常關閉後覆蓋錯」這種典型場景。

## 為什麼「覆蓋儲存後」就來不及了？

這裡要拆一個沒人明講的差別：**儲存層** vs **工具層**。

這些機制活在**儲存層**。設計目標是「最近一次寫入失敗就回滾」，所以 retention 設得短。500 版、30 天這些數字，參考的是「平均使用者一個月內回頭找的次數」。3 個月以上不在設計目標內，prune 掉是合理。

A 先生是會計。週五晚上 19:30，他不小心把月底結算 Excel 覆蓋掉了。他找 AutoRecover 檔案，找不到。試了資料復原軟體，跳出「磁區已被覆寫」訊息。週一早上前還剩 60 小時。

這裡是真正的問題。A 先生事後想到，如果是週五白天覆蓋的，AutoRecover 30 分鐘間隔可能有抓到。**但他「發現的時間點」已經太晚。事後救援依賴「發現的時機」。事前防禦不依賴發現。每次儲存早就留下版本了。**

## 事後救援之外：always-on 版本歷史的選項

要超越事後救援的極限，靠的是**事前防禦**。在工具層放一份 always-on 版本歷史。

每次儲存 = 一個版本被保留。不會 prune。不依賴 Word 或 OneDrive 的 retention policy。

[Keeply](https://keeply.work) 用 git 引擎在每次儲存時自動 commit。「覆蓋儲存」就**不再是破壞性動作**。前一個版本永遠留著。

B 小姐用 Keeply 半年。週一早上發現月底結算被覆蓋成前一張表。她打開 Keeply。週五 19:00 的表、19:15 的表、19:30 的覆蓋後表，全部以版本保留。她點「回到 19:00 的版本」，3 秒後 Excel 開啟那個版本。

不過 Keeply 不取代 AutoRecover。編輯中當機的救援還是 AutoRecover 的第一道線。Keeply 也不能溯及既往：必須在覆蓋發生時已經啟動。Keeply 啟用前的覆蓋，本文救不了你。但從今天開始的每次儲存，都救得了。

對啊，這就是讓人鬆一口氣的部分。

## 常見問題

**Q1: AutoRecover 預設是開的嗎？**

是。設定路徑：「檔案 → 選項 → 儲存 → 儲存自動回復資訊每 10 分鐘」。但 AutoRecover 在檔案正常關閉後會清除，不算長期保留。

**Q2: 資料復原軟體的成功率多高？**

覆蓋直後幾分鐘內有成功率，但 SSD（多數現代電腦）由於 TRIM 指令會立即清除被覆蓋的磁區，成功率比 HDD 低。HDD 過幾天後成功率也急遽下降。

**Q3: OneDrive 個人版跟商務版版本歷史保留一樣多嗎？**

不完全一樣。OneDrive 個人預設約 500 版。商務版（Microsoft 365）也預設 500 版但管理員可調整。到上限就 prune 最舊。

**Q4: Time Machine 有用嗎？**

Mac 的 Time Machine 是系統級備份。在快照間隔（預設 1 小時）內發生覆蓋就救不到。它也不是檔案級的版本管理，要從 Time Machine 救單檔特定版本很麻煩。

**Q5: Keeply 是 AutoRecover 的替代嗎？**

不是。AutoRecover 處理當機救援，Keeply 處理正常儲存後的版本保留。兩者是互補關係。Keeply 必須事前啟動（不能溯及既往）。

---

「啊，覆蓋掉了」的 19:30 那個瞬間，未來還會出現。你不知道什麼時候。

但有一件事要知道：事後救援有極限。事前防禦不依賴發現的時機。

從今天開始的每次儲存，能讓工具替你保留版本嗎？

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
