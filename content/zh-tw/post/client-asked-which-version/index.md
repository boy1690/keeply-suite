---
title: "3 個月後客戶問你那版：Word 內建版本歷史救不了你"
description: "Word AutoRecover、OneDrive 版本歷史、Time Machine 都是儲存層救援，retention 從檔案關閉清除到約 500 個版本上限。3 個月後找回交付版本要靠工具層。"
date: 2026-05-02T15:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "Word 版本歷史"
locale: zh-TW
categories: ["檔案版本管理"]
tags: ["版本歷史", "AutoRecover", "OneDrive", "delivery-note", "operator-error"]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: hybrid
ranking_locales: [en, ko]
---

# 3 個月後客戶問你那版：Word 內建版本歷史救不了你

> 軟體內建版本歷史是儲存層救援，3 個月後找回交付版本要靠工具層。

週六晚上 11:23，客戶 LINE 你：「3 月那版你寄我的提案可以再傳一份嗎？」

你打開 OneDrive 版本歷史——只剩一週。Word AutoRecover 在檔案關閉時就清除掉。電腦裡 7 個 `_v` 字尾檔案，沒一個對得上 3 月那次交付。

3 個月前你按下 ⌘+S 那個版本，工具沒記得。

## 重點

Microsoft Word 的「**版本歷史**」、AutoRecover、OneDrive 版本紀錄都是**儲存層救援機制**。設計給「打到一半當機」用，retention 短：從檔案關閉就清除，到雲端版本歷史約 500 個版本上限。這是儲存救援，不是交付追蹤。3 個月後客戶問哪版？要工具層獨立的 always-on 版本歷史，加上交付當下的 metadata 標記，才找得回。

## 本文目錄

1. [Word 內建版本歷史能做什麼？](#word-內建版本歷史能做什麼)
2. [AutoRecover / OneDrive / Time Machine：各能保留多久？](#autorecover--onedrive--time-machine各能保留多久)
3. [為什麼這些機制守不到 3 個月後？](#為什麼這些機制守不到-3-個月後)
4. [找回 3 個月前的交付版本，你需要什麼？](#找回-3-個月前的交付版本你需要什麼)
5. [常見問題](#常見問題)

---

## Word 內建版本歷史能做什麼？

Word 跟 Office 生態系內建有 3 種「**版本還原**」機制：

- **AutoRecover**：當機時救回未儲存的內容。預設每 10 分鐘自動暫存一份。檔案正常關閉後就清除。
- **自動儲存**（[OneDrive / SharePoint 線上 Word](https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)）：邊打邊存到雲端。
- **OneDrive 版本歷史**：保留每次儲存的版本快照，可回頭看任意時間點。OneDrive 商務 / SharePoint 版本歷史[官方文件](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37)指出預設保留約 500 個主要版本。

這 3 種設計目的都很清楚：給「**打到一半當機**」、「**剛剛存錯了**」這類**短期儲存事故**用。它們不是「**3 個月後客戶問哪版**」這種場景的設計目標。

## AutoRecover / OneDrive / Time Machine：各能保留多久？

要看這些機制守不守得住，先看 retention 數字：

| 機制 | 預設 retention | prune 條件 | 適合場景 |
| --- | --- | --- | --- |
| Word AutoRecover | 檔案關閉即清除 | 檔案關閉、Word 重啟 | 當機救援 |
| OneDrive 自動儲存 | 邊打邊存 | — | 即時協作 |
| OneDrive 版本歷史 | 預設約 [500 個版本](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | 超過 500 自動 prune 最舊 | 短期回滾 |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | hourly 24h + daily 30 天 + weekly 直到磁碟滿 | 磁碟滿 | 系統級備份 |
| Windows 檔案歷史 | 設定可調 | 設定可調 | 系統級備份 |

對啊，每個機制都有上限。檔案關閉清除到 500 個版本，跨不過 3 個月這條線。3-2-1 防的是磁帶腐壞，Word 防的是當機，這些都不是同一個問題。

## 為什麼這些機制守不到 3 個月後？

這裡要拆一個沒人明講的差別：**儲存層** vs **工具層**。

軟體內建的版本歷史活在**儲存層**。它存在的目的是「最近一次寫入失敗就回滾」，所以 retention 設得短。從檔案關閉清除到 500 個版本上限，這些設計參考的是「平均使用者一個月內回頭找的次數」。3 個月以上不在設計目標內，prune 掉是合理。

A 先生是顧問。週六 11:23 客戶 LINE 他要 3 月那版報告。他打開 OneDrive 版本歷史，最舊的是 4 月 28 日。Word AutoRecover 早關了。他電腦裡 8 個 `_v` 開頭的 .docx，沒一個檔案修改日期對得上 3 月那週的交付。

等等，這還不是最糟的。A 先生事後想起來，3 月那次他寄附件給客戶用的是當天匯出的 PDF。原始 .docx 早被覆蓋掉了。**他寄出去的 PDF 在客戶信箱裡。但他沒辦法從 PDF 拼回 .docx 那個版本繼續改。**

## 找回 3 個月前的交付版本，你需要什麼？

你需要兩層：

- **always-on 版本歷史**：每次儲存都留下，不會 prune。不依賴 Word 或 OneDrive 的 retention policy。
- **交付便條 metadata**：匯出檔案時自動嵌入「誰、什麼時候、對應哪個版本」的 metadata。3 個月後拖回工具，看到完整 origin。

[Keeply](https://keeply.work) 提供這兩層。

B 小姐用 Keeply 半年。週一早上客戶 LINE 她要 4 月那版設計稿。她在客戶 email 找到附件，把 .pdf 拖回 Keeply。Keeply 跳出「這是 2026-04-12 的 v3 簡報」，含原始 .docx commit hash 加上用途分類「業主核定版」。她點「回到這個版本」，3 秒後 Word 開出 4/12 那版繼續改。

但 Keeply 不取代 AutoRecover——你打到一半當機，AutoRecover 仍是第一道線。Keeply 也不能溯及既往：要 Keeply 在交付當下已經在用，metadata 才嵌得進去。沒裝 Keeply 過的舊交付，本文救不了你。但裝了之後，從今天開始的每次交付都救得了。

對啊，這就是讓人鬆一口氣的部分。

## 常見問題

**Q1: Word AutoRecover 預設關不關得掉？**

可以關，但預設是開的。設定路徑：「檔案 → 選項 → 儲存 → 儲存自動回復資訊每 10 分鐘」。但 AutoRecover 在檔案正常關閉後會清除。不算長期保留。

**Q2: OneDrive 個人版跟商務版版本歷史保留一樣多嗎？**

不一樣。OneDrive 個人預設約 500 個版本。商務版（Microsoft 365）也預設 500 個但管理員可調，到上限就 prune 最舊。

**Q3: Time Machine 算備份還是版本管理？**

Time Machine 是系統級備份。它保留整個磁碟快照，不會單獨追蹤「proposal.docx 每次儲存的版本」這個層級。要從 Time Machine 救單檔特定版本可以做，但很麻煩。

**Q4: Google Docs 修訂版能保留多久？**

Google 沒公開明確 retention 數字。[官方文件](https://support.google.com/docs/answer/190843)指出「較舊的修訂版可能會被合併」以節省空間。實務經驗：3 個月以上的修訂版常被自動合併或 prune。

**Q5: Keeply 補的層跟 Git 一樣嗎？**

Keeply 用 Git 引擎做版本管理，但不暴露 Git 術語。你看到的詞是「儲存版本 / 工作副本 / 同步到專案位置」。Git 的 commit / branch / push 不會出現在 UI 上。對非開發者來說是辦公室語言的版本管理。

---

11:23 那條 LINE 訊息，下次出現是什麼時候你不知道。

但你知道一件事：你 5 分鐘前的版本和 3 個月前的版本，工具不能不分。

從今天開始的每次交付，能不能讓工具替你記得那一份？
