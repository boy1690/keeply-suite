---
title: "为什么我做 Keeply：从「我的文件到哪去了？」开始"
description: "Keeply 是为了让你看得到自己的文件而做的，不是为了把你变成 dev。"
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - 创办人笔记
tags:
  - Keeply
  - 设计哲学
  - 创办人
image: cover.svg
og_image: cover.png
role: standalone
template: T6
---

第一个用 Keeply 的早期测试者，打开 NAS 想看自己的文件。打开文件夹，看到的是 `objects/`、`pack/`、`HEAD`。没看到他存的设计档。他传讯息给我：「我的文件到哪去了？」

那一秒我知道做错了什么。

我们选了「备份」这个词当基础概念。备份在工程脑里是 OK 的：压缩过、编码过、不能直接看。但对使用者，**备份的反义词不是「没备份」，是「找不到」**。打开文件夹看不到自己的东西 = 信任断裂。技术 say it's safe 没用，眼睛 say not safe 就是 not safe。

这是 Keeply 的第一个转弯。后来变成正式 [ADR-001](https://github.com/boy1690): 不用「备份」做核心隐喻，改用「项目位置」。一个词之差，整个数据结构跟着改。

## 我选的那条岔路

当时可以走两条路。要么把使用者教成 dev（学会看 `objects/` 是 pack file、`HEAD` 是指标），要么把工具变成办公室语言（「储存版本」「版本历史」「还原」）。

教使用者比较便宜，做工具难。我选后者。

Keeply 的[使命](https://github.com/boy1690)从那之后写成一句话：「**让非技术人员用办公室语言管理文件版本，完全不需要知道 Git 的存在。**」UI 不出现 commit、branch、HEAD、stash 这些字，连隐喻都不行。底下用 git2 引擎，但那是我的问题不是你的。

## 我犯过的错（之一）

不是每个设计决策都对。今年四月有一轮做 Free / Team 差异化方案，我请高阶模型写初稿，它交回 530 行，含 5 种用途配额、watermark 证据、RFC 3161 timestamp、5 个复杂升级触发点。

我看完否决全部。

理由：watermark 在台湾不是法律证据（正式公文才是）。NAS 上一台机器多个文件夹物理上等价于 multi-vault，限数字没意义。RFC 3161 timestamp 对台湾使用者没实质卖点（走邮局存证或公证）。**这些 feature 服务的是理论不是真实使用者**。

每个 spec 决策现在都过这 3 题：用户要吗？台湾场景有意义吗？删掉会有人在意吗？任一 no = 不做。

## 为什么写这篇

这篇讲**透明**：我做这工具的理由、我犯过的错、我坚持的原则。

如果你要把客户资料、设计档、合约交给一个工具管 5 年 10 年，你需要知道做这工具的人怎么想。我没办法保证 Keeply 永远对的，但我可以保证：每个决策都有写下来、每个错都会 reframe、每个 over-engineered idea 都会被否决。

下一个版本见。

---

> 关于作者：Ting-Wei Tsao，Keeply 创办人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
