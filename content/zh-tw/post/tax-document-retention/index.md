---
title: "【2026 檔案管理】報稅檔案要存 7 年，雲端版本歷史只給你 30 天，怎麼辦？"
description: "國稅局保留 5-7 年查核權。Dropbox 版本歷史只給你 30 天。兩個數字都對，但不是在量同一件事——retention archive 跟 working version history 是兩個不同工具。本文拆解怎麼兩件都做好，不用買 compliance suite。"
voice_version: v2-2026-05-13
date: 2026-05-13T09:00:00+08:00
draft: false
slug: "tax-document-retention"
primary_keyword: "報稅檔案 保存"
locale: zh-TW
categories: [檔案管理]
tags: [雲端同步, 備份, 工具比較]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "時間軸圖表顯示國稅局查核保存期（5-7 年）遠超 Dropbox/OneDrive/Google Drive 版本歷史 cap（30 天）——揭露 retention 法規跟 working version history 是兩件事"
faq_schema:
  - q: 報稅檔案要留幾年？
    a: 台灣國稅局查核權一般 5 年（重大違章 7 年）。美國 IRS 一般 3 年，少報 25%+ 收入 6 年，呆帳扣除 7 年，未申報或詐欺則無限期。各國一般落在企業 5-10 年、個人 3-7 年區間。
    
  - q: Dropbox 安全到能存報稅檔案嗎？
    a: 存檔案本身 OK（at-rest 加密、多份冗餘）。它沒被設計成處理 retention 時間軸——Dropbox 版本歷史免費版 30 天 cap、付費 180-365 天。檔案會留著，但 cap 之外的版本歷史沒了。對報稅 archive 來說通常 OK，因為你存的是最終版不是中間編輯。
    
  - q: 需要專門的報稅 archive 工具嗎？
    a: 多半不用，除非你是有上百個客戶的企業（那時看 audit 級 archive——Veeam、Acronis、產業專用工具）。個人跟小企業，依年份分資料夾的一般雲端儲存加本機備份就夠。陷阱是把它跟你工作中的檔案混在一起，那邊版本歷史 cap 會咬你。
    
  - q: Archive 儲存跟 working version history 差別在哪？
    a: Archive 儲存放的是已簽署、多年後要拿出來的最終版——少存取、絕不覆蓋。Working version history 追蹤文件準備過程中的中間編輯——準備期內頻繁存取、30 天 cap 因為沒人需要去年 3 月報稅季 2 週前的草稿。把兩者混在一起會產生「任一工具都 cover 兩件事」的錯誤假設。
    
  - q: Keeply 在報稅檔案 retention 裡扮演什麼角色？
    a: 直接來說不扮演。Keeply 是 working version history 工具——你準備報稅時每次存檔都被抓，工作中有用但不是 archive。報完稅後，把最終 PDF 移到 archive 資料夾（雲端 + 本機備份，跟 Keeply 分開）。Keeply 的角色是讓你工作期間能回答「X 日早上我手上的數字是什麼」，報完後正本是 archive 裡的 PDF，不是 Keeply 時間軸。
---

# 【2026 檔案管理】報稅檔案要存 7 年，雲端版本歷史只給你 30 天，怎麼辦？

> 國稅局查核保留 5-7 年。Dropbox 版本歷史 30 天。兩個數字都對，但不是在量同一件事。

4 月 11 號星期三早上，去年的稅準備收尾。會計師寄信來：「請保留所有收據跟支持文件 7 年——那是查核視窗。」

你把收據資料夾拖進 Dropbox。完成。

5 年後查核通知到。打開 Dropbox。資料夾在。PDF 在。沒事。

這是簡單的 case。難的 case 是當你把「我把檔案存起來」跟「我把檔案的版本歷史存起來」搞混時——而且你會搞混，因為每篇雲端比較文都把兩件事混在一起講。

## 兩個讓所有人混淆的數字

報稅檔案討論中常被搞混的兩個 retention 期：

| 概念 | 一般期間 | 它在追蹤什麼 |
|---|---|---|
| **檔案保存（archive）** | 台灣 5 年 / 美國 3-7 年 / 多數國家 5-10 年 | 已申報的最終版 + 支持文件 |
| **Working version history** | 30 天（免費雲端）、180-365 天（付費） | 你準備報稅時的中間編輯 |

這是兩件不同的工作。Archive 需要持久性（5 年後最終 PDF 必須還能拿出來）。Version history 需要準備期間的深度（讓你週一改錯週三發現時能 roll back）。

人們以為自己的雲端兩件都 cover，因為兩件都「檔案放雲端」。它不 cover。而這個誤會咬人的時刻通常不在工作中——是 2 年後某件事讓你回頭看時。

## 「報稅檔案 retention」實際上需要什麼

個人跟小企業的最低可靠 setup：

- **每年一個最終版 archive 資料夾**：`2024-報稅/`、`2023-報稅/`...
- **每個年度資料夾裡**：已申報 PDF + 扣繳憑單 + 收據/支持文件
- **兩份**：雲端儲存（Dropbox、iCloud、Google Drive——任一家都行作為 archive）+ 本機備份（外接硬碟、Time Machine、NAS）
- **絕對不覆蓋**：報稅完那份 PDF 不再編輯。發現錯誤就以新文件形式申報修正——不要覆蓋原始檔

就這樣。你雲端的版本歷史 cap 對 archive 不重要，因為報完之後你不會編輯那個檔案。Dropbox 30 天視窗只在你刪除或覆蓋時有意義——而你不該做那種事。

| 儲存位置 | Retention 行為 | 報稅 archive 評估 |
|---|---|---|
| iCloud Drive | 無限期存檔；非 Apple 檔不暴露版本歷史 | ✅ 當 archive 沒問題 |
| Dropbox | 無限期存檔；版本歷史 30/180/365 天 cap | ✅ 當 archive 沒問題（你不會編輯） |
| OneDrive | 無限期存檔；500 versions；回收筒 30/93 天 | ✅ 當 archive 沒問題 |
| Google Drive | 無限期存檔；30 天 OR 100 versions；「Keep forever」 override | ✅ 當 archive 沒問題 |
| **只有本機磁碟** | 無限期，看硬體故障率 | ⚠️ 需要第二份 |
| **email 信箱當 archive** | 帳號活著就無限期 | ⚠️ 查核時搜尋地獄 |

雲端 OK。不 OK 的是把雲端版本歷史當 archive 層——因為版本歷史 cap 會丟掉你以為被保護的中間狀態。

## Version-history 工具真正幫得上的地方

如果你在準備報稅時用 [Keeply](https://keeply.work) 這類版本歷史工具，它會抓你準備期間的每次存檔。這對一個特定場景有用：

你 4 月申報完。6 月時，你想到某一行可能用錯數字。你要知道——「4 月 10 號早上我寄給會計師時，那份試算表是什麼版本？」

申報 PDF 在你的 archive 裡。但準備過程那份工作用試算表存了 30+ 次。雲端版本歷史超過 30 天沒了。Time Machine 有時間單位整碟 snapshot，但不知道哪次存檔對應「我寄出的那個早上」。

Keeply 抓每次故意存檔加 timestamp，所以「4 月 10 號早上」一個點擊就到——不是給國稅局看的（他們要的是 PDF），是給你自己答案的。

```
Keeply 時間軸 — 2024-報稅-工作表.xlsx

2025-04-10 — 星期三
─────────────────────────────────
● 09:14   2024-報稅-工作表.xlsx    （存檔）
● 09:47   2024-報稅-工作表.xlsx    ★ Release：寄給會計師
● 11:22   2024-報稅-工作表.xlsx    （存檔——加上會計師回饋）
```

★ Release 標記是你寄給會計師的版本。後續編輯不會蓋掉。多年後還拿得到。

這不是 archive 的替代品——是工作期間的 audit trail。報稅完後正本是 archive 資料夾裡的 PDF，不是 Keeply 時間軸。

## 這篇文章不 cover 的場景

3 個邊界要講清楚：

**你是有合規 retention 要求的企業（SOX、HIPAA、GDPR）**：這篇的「雙份雲端 + 本機備份」pattern 不是 compliance 級。你需要 audit 認證的 archive 工具——Veeam、Acronis、或產業專屬供應商。法規要求的是檔案 *跟* chain-of-custody metadata，一般雲端儲存不產出這些。

**你處理上百個客戶的報稅文件**：搬到 tax practice management 工具（Drake、TaxDome、宏碁 i 報稅雲等）。它們有內建 retention workflow 跟客戶 portal。別用 Dropbox 資料夾自幹。

**你申報過 amended return 要追蹤原始版 vs 修正版**：兩份都當獨立 PDF 放同年度資料夾。別用版本歷史追蹤——修正版是新文件，不是舊文件的新版本。

## 延伸閱讀

主篇 [檔案版本管理完整指南](/zh-tw/post/file-version-management-complete-guide/) 拆解 4 個結構性原因——為什麼工具就是沒設計給你這件事。

[比 iCloud 跟 Dropbox 之前先看：4 家雲端共通的版本歷史天花板](/zh-tw/post/cloud-version-history-cliff/) — 本文引用的「雲端版本歷史 cap」問題詳細版。

[3-2-1 備份原則：20 年了，2026 還夠用嗎？](/zh-tw/post/3-2-1-backup-rule/) — 「兩份」的空間冗餘那一面。Archive 資料夾要跑 3-2-1。

---

國稅局 retention 要求跟你雲端版本歷史 cap 都是真的。它們不是在量同一件事。

Archive 用：你的雲端 OK——存申報後的 PDF、不要覆蓋、有本機備份。Working 期間：版本歷史工具補編輯中的部分。兩個一起就 cover 兩件事。混在一起就會在 5 年後變成痛點。

5 年後查核通知到時，答案是「打開 2024-報稅資料夾，PDF 在這」——不是「我來試試從 4 年前 expired 的 Dropbox 版本歷史救」。

---

> 關於作者：Ting-Wei Tsao，Keeply 創辦人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
