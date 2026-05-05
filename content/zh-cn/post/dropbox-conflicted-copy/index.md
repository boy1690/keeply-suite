---
title: "Dropbox 冲突的副本：为什么一直出现？4 种让它不再回来的 sync 设计"
description: "Conflicted copy 不是 bug，是 Dropbox 用 last-writer-wins 而没做冲突检测的结果。"
date: 2026-05-05T05:55:00+08:00
draft: false
slug: dropbox-conflicted-copy
primary_keyword: "dropbox 冲突的副本"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - 文件管理
tags:
  - 版本管理
  - Dropbox
  - 云端同步
  - 冲突解决
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
---

周四晚上 10:30，你跟同事 Anna 共用 Dropbox 改一份提案。她加了 3 段内容，你同时加了结尾的 CTA。你们都按 Cmd+S。隔天打开文件夹，多了一份 `提案 (Anna 的 conflicted copy 2026-05-02).docx`。她改的你这里没有，你加的她那里也没有。你花 1 小时手动合并，30 分钟检查有没有漏。

这不是 bug。是 Dropbox 没做冲突检测层的后果。我们先看 conflicted copy 出现的真实 mechanism，再给你 3 种 sync 设计能根治。

## 目录

- [什么时候会出现 conflicted copy](#when-it-happens)
- [Dropbox 为什么这样设计](#why-dropbox-design)
- [手动合并两份文件是症状治疗](#why-manual-merge-fails)
- [3 种 sync 设计能根治](#three-designs)
- [Keeply 不适合的时候](#boundaries)

## 什么时候会出现 conflicted copy {#when-it-happens}

把「conflicted copy 一直出现」拆开看，4 种完全不同的场景每个都会触发：

| # | 场景 | mechanism |
|---|---|---|
| 1 | **两人同时编** | 两端都按 Cmd+S 上传，Dropbox 不知道前面已被改 |
| 2 | **离线编后上线** | 火车上改一段，回到 Wi-Fi sync 时跟云端版本不一致 |
| 3 | **多设备切换** | 笔电写到一半切手机继续，笔电后来 sync 撞到手机版 |
| 4 | **跨 OS sync delay** | Mac vs Windows 系统时钟差几秒，Dropbox 判 collision |

不讲真的不知道：4 种之中只要踩一种，conflicted copy 就会出现。**而你的工作模式里，4 种至少会踩到 2 种**。

## Dropbox 为什么这样设计 {#why-dropbox-design}

Dropbox 用 **last-writer-wins + 把旧版另存** 设计：两人同时改，后上传的版本胜出，前一版不丢掉，存成 `(conflicted copy)`。

不是技术做不到冲突检测。是 commercial trade-off：

- **实时体验优先**：sync 不能挡你工作。每次都跳「请选择合并方式」会让 Dropbox 变难用。
- **冲突解析推给 user**：把另一版另存 = 「我都帮你留着，你自己决定」
- **设计者的选择**：谁也不丢，但 user 得做工

对啊，这就是让人烦的地方。Dropbox 把工具该做的事（冲突检测层）推给 user 纪律。而纪律永远赢不过自动化。

## 手动合并两份文件是症状治疗 {#why-manual-merge-fails}

Dropbox Help Center 教你的 fix：「打开两份文件，比对差异，手动合并到主文件，删掉 conflicted copy。」一听很合理。

但这个 fix **不改变 mechanism**。你下个礼拜还会再 sync collision、还会再产生新 conflicted copy、还会再手动合并。一个月之后你已经做这件事 4-5 次。

你不是不会合并。你是在用一个**设计上不挡冲突的工具**。解法是换 sync mechanism，不是训练自己合并合得更快。

对比 Google 前 3 名（Dropbox Help / EaseUS / Wondershare）：他们都是症状治疗指南，没人从 mechanism 角度切。这篇文章是。

## 3 种 sync 设计能根治 {#three-designs}

把 sync 设计能做的事拆成 3 种模式。每种对应不同 collision 场景：

### Design A：Detect-and-prompt sync（Git-style merge）

两端改同档，sync 时检测 collision，跳 UI prompt 给 user 选：留 A、留 B、或把两个变更合并。**例子**：Git（CLI 圈用）、**Keeply** spec M3-100 conflict-detection（用办公室语言 wrap，不讲「merge conflict」）。**解场景 #1 + #2**。

### Design B：File locking（atomic check-out）

你打开文件，工具自动 lock。同事打开看到「Anna 在用」，不能改。**例子**：SharePoint、Adobe Creative Cloud Files、Bentley ProjectWise。**解场景 #1 + #3 + #4 全部**，trade-off：同事得等。

### Design C：Local Clone + manual sync（Keeply 模型）

Working copy 在你本机，sync 是主动 push（不是实时镜像）。collision 在 push 时检测，UI prompt 给 user 选。**例子**：**Keeply** 的 Local Clone Pattern（spec M3-098） + SMB safety layer（M3-095）+ conflict-detection（M3-100）。**解场景 #1-#4 全部**，trade-off：sync 不像 Dropbox 实时。

这时候你就会发现，4 种场景里 #4（跨 OS sync delay）是最难解的，因为它是纯时钟问题。Design A 跟 C 能 detect，但解析仍要 user 介入。

## Keeply 不适合的时候 {#boundaries}

Keeply 不解所有 Dropbox 场景：

- **大档实时同步**：Premiere project 边改边 sync，Keeply Local Clone 模型不适合（Push 一次几分钟）。
- **移动设备访问**：Keeply 是 desktop-first，Dropbox app 在手机上顺得多。
- **外部分享链接**：Dropbox 的「Share link」Keeply 没对应功能。
- **协作频率超高**（1 小时内 multiple edits）：Keeply UX 比 Dropbox 慢，那种场景该用 Google Docs co-edit。

## 下次看到 `(conflicted copy)` 之前

下次文件夹多出 `(conflicted copy)` filename，你不会再花 1 小时手动合并，你会知道那是 mechanism 问题，且你有别的选项。

想看 Keeply 怎么解 sync 冲突？[继续阅读「文件版本管理完整指南」](/zh-cn/post/file-version-management-complete-guide/)。

---

> 关于作者：Ting-Wei Tsao，Keeply 创始人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
