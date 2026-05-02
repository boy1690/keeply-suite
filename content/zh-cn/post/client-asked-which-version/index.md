---
title: "3 个月后客户问你那版：Word 内置版本历史救不了你"
description: "Word AutoRecover、OneDrive 版本历史、Time Machine 都是存储层救援，retention 从文件关闭就清除到约 500 个版本上限。3 个月后找回交付版本要靠工具层。"
date: 2026-05-02T15:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "Word 版本历史"
locale: zh-CN
categories: ["文件版本管理"]
tags: ["版本历史", "AutoRecover", "OneDrive", "delivery-note", "operator-error"]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: hybrid
ranking_locales: [en, ko]
---

# 3 个月后客户问你那版：Word 内置版本历史救不了你

> 软件内置版本历史是存储层救援，3 个月后找回交付版本要靠工具层。

周六晚上 11:23，客户发消息给你：「3 月那版你寄我的提案可以再传一份吗？」

你打开 OneDrive 版本历史——只剩一周。Word AutoRecover 在文件关闭时就清除掉。电脑里 7 个 `_v` 字尾文件，没一个对得上 3 月那次交付。

3 个月前你按下 ⌘+S 那个版本，工具没记得。

## 重点

Microsoft Word 的「**版本历史**」、AutoRecover、OneDrive 版本纪录都是**存储层救援机制**。设计给「打到一半当机」用，retention 短：从文件关闭就清除，到云端版本历史约 500 个版本上限。这是存储救援，不是交付追踪。3 个月后客户问哪版？要工具层独立的 always-on 版本历史，加上交付当下的 metadata 标记，才找得回。

## 本文目录

1. Word 内置版本历史能做什么？
2. AutoRecover / OneDrive / Time Machine：各能保留多久？
3. 为什么这些机制守不到 3 个月后？
4. 找回 3 个月前的交付版本，你需要什么？
5. 常见问题

---

## Word 内置版本历史能做什么？

Word 跟 Office 生态系内建有 3 种「**版本还原**」机制：

- **AutoRecover**：当机时救回未储存的内容。预设每 10 分钟自动暂存一份。文件正常关闭后就清除。
- **自动储存**（[OneDrive / SharePoint 在线 Word](https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)）：边打边存到云端。
- **OneDrive 版本历史**：保留每次储存的版本快照，可回头看任意时间点。OneDrive 商务 / SharePoint 版本历史[官方文件](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37)指出预设保留约 500 个主要版本。

这 3 种设计目的都很清楚：给「**打到一半当机**」、「**刚刚存错了**」这类**短期储存事故**用。它们不是「**3 个月后客户问哪版**」这种场景的设计目标。

## AutoRecover / OneDrive / Time Machine：各能保留多久？

要看这些机制守不守得住，先看 retention 数字：

| 机制 | 预设 retention | prune 条件 | 适合场景 |
| --- | --- | --- | --- |
| Word AutoRecover | 文件关闭即清除 | 文件关闭、Word 重启 | 当机救援 |
| OneDrive 自动储存 | 边打边存 | — | 即时协作 |
| OneDrive 版本历史 | 预设约 [500 个版本](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | 超过 500 自动 prune 最旧 | 短期回滚 |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | hourly 24h + daily 30 天 + weekly 直到磁盘满 | 磁盘满 | 系统级备份 |
| Windows 文件历史 | 设定可调 | 设定可调 | 系统级备份 |

对啊，每个机制都有上限。文件关闭清除到 500 个版本，跨不过 3 个月这条线。

## 为什么这些机制守不到 3 个月后？

这里要拆一个没人明讲的差别：**存储层** vs **工具层**。

软件内置的版本历史活在**存储层**。它存在的目的是「最近一次写入失败就回滚」，所以 retention 设得短。从文件关闭清除到 500 个版本上限，这些设计参考的是「平均使用者一个月内回头找的次数」。3 个月以上不在设计目标内，prune 掉是合理。

A 先生是顾问。周六 11:23 客户发消息要他 3 月那版报告。他打开 OneDrive 版本历史，最旧的是 4 月 28 日。Word AutoRecover 早关了。他电脑里 8 个 `_v` 开头的 .docx，没一个文件修改日期对得上 3 月那周的交付。

等等，这还不是最糟的。A 先生事后想起来，3 月那次他寄附件给客户用的是当天导出的 PDF。原始 .docx 早被覆盖掉了。**他寄出去的 PDF 在客户信箱里。但他没办法从 PDF 拼回 .docx 那个版本继续改。**

## 找回 3 个月前的交付版本，你需要什么？

你需要两层：

- **always-on 版本历史**：每次储存都留下，不会 prune。不依赖 Word 或 OneDrive 的 retention policy。
- **交付便条 metadata**：导出文件时自动嵌入「谁、什么时候、对应哪个版本」的 metadata。3 个月后拖回工具，看到完整 origin。

[Keeply](https://keeply.work) 提供这两层。

B 小姐用 Keeply 半年。周一早上客户发消息要她 4 月那版设计稿。她在客户 email 找到附件，把 .pdf 拖回 Keeply。Keeply 跳出「这是 2026-04-12 的 v3 简报」，含原始 .docx commit hash 加上用途分类「业主核定版」。她点「回到这个版本」，3 秒后 Word 开出 4/12 那版继续改。

但 Keeply 不取代 AutoRecover——你打到一半当机，AutoRecover 仍是第一道线。Keeply 也不能溯及既往：要 Keeply 在交付当下已经在用，metadata 才嵌得进去。没装 Keeply 过的旧交付，本文救不了你。但装了之后，从今天开始的每次交付都救得了。

对啊，这就是让人松一口气的部分。

## 常见问题

**Q1: Word AutoRecover 预设关不关得掉？**

可以关，但预设是开的。设定路径：「文件 → 选项 → 储存 → 储存自动回复信息每 10 分钟」。但 AutoRecover 在文件正常关闭后会清除。不算长期保留。

**Q2: OneDrive 个人版跟商务版版本历史保留一样多吗？**

不一样。OneDrive 个人预设约 500 个版本。商务版（Microsoft 365）也预设 500 个但管理员可调，到上限就 prune 最旧。

**Q3: Time Machine 算备份还是版本管理？**

Time Machine 是系统级备份。它保留整个磁盘快照，不会单独追踪「proposal.docx 每次储存的版本」这个层级。要从 Time Machine 救单档特定版本可以做，但很麻烦。

**Q4: Google Docs 修订版能保留多久？**

Google 没公开明确 retention 数字。[官方文件](https://support.google.com/docs/answer/190843)指出「较旧的修订版可能会被合并」以节省空间。实务经验：3 个月以上的修订版常被自动合并或 prune。

**Q5: Keeply 补的层跟 Git 一样吗？**

Keeply 用 Git 引擎做版本管理，但不暴露 Git 术语。你看到的词是「储存版本 / 工作副本 / 同步到专案位置」。Git 的 commit / branch / push 不会出现在 UI 上。对非开发者来说是办公室语言的版本管理。

---

11:23 那条消息，下次出现是什么时候你不知道。

但你知道一件事：你 5 分钟前的版本和 3 个月前的版本，工具不能不分。

从今天开始的每次交付，能不能让工具替你记得那一份？
