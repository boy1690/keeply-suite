---
title: "Dropbox 冲突的副本：为什么一直出现？4 种让它不再回来的 sync 设计"
description: "Conflicted copy 不是 bug，是 Dropbox 用 last-writer-wins 而没做冲突检测的结果。"
date: 2026-05-05T05:55:00+08:00
draft: false
slug: dropbox-conflicted-copy
primary_keyword: "dropbox 冲突的副本"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories: [文件管理]
tags: [版本控制, 文件恢复, 云端同步]
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
image_alt_data: "分割图示:Anna 与 Bill 同时编辑同一份 proposal.docx，Dropbox 碰撞产生「(conflicted copy)」文件——后存者覆盖先存，每月每个团队平均触发 4 次，这是产品设计的结果而非错误"
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

周四晚上 10:30，你跟同事 Anna 共用 Dropbox 改一份提案。她加了 3 段内容，你同时加了结尾的 CTA。你们都按 Cmd+S。隔天打开文件夹，多了一份 `提案 (Anna 的 conflicted copy 2026-05-02).docx`。她改的你这里没有，你加的她那里也没有。你花 1 小时手动合并，30 分钟检查有没有漏。

这不是 bug。是 Dropbox 没做冲突检测层的后果。我们先看 冲突副本 出现的真实 机制，再给你 3 种 同步 设计能根治。

## 目录

- [什么时候会出现 冲突 副本](#when-it-happens)
- [Dropbox 为什么这样设计](#why-dropbox-design)
- [手动合并两份文件是症状治疗](#why-manual-merge-fails)
- [3 种 同步 设计能根治](#three-designs)
- [Keeply 不适合的时候](#boundaries)

## 什么时候会出现 冲突副本 {#when-it-happens}

把「冲突 副本 一直出现」拆开看，4 种完全不同的场景每个都会触发：

| # | 场景 | 机制 |
|---|---|---|
| 1 | **两人同时编** | 两端都按 Cmd+S 上传，Dropbox 不知道前面已被改 |
| 2 | **离线编后上线** | 火车上改一段，回到 Wi-Fi 同步 时跟云端版本不一致 |
| 3 | **多设备切换** | 笔电写到一半切手机继续，笔电后来 同步 撞到手机版 |
| 4 | **跨 OS 同步 delay** | Mac vs Windows 系统时钟差几秒，Dropbox 判 冲突 |

不讲真的不知道：4 种之中只要踩一种，冲突 副本 就会出现。**而你的工作模式里，4 种至少会踩到 2 种**。

## Dropbox 为什么这样设计 {#why-dropbox-design}

Dropbox 用 **last-writer-wins + 把旧版另存** 设计：两人同时改，后上传的版本胜出，前一版不丢掉，存成 `(conflicted copy)`。

不是技术做不到冲突检测。是 商业 取舍：

- **实时体验优先**：同步 不能挡你工作。每次都跳「请选择合并方式」会让 Dropbox 变难用。
- **冲突解析推给 用户**：把另一版另存 = 「我都帮你留着，你自己决定」
- **设计者的选择**：谁也不丢，但 用户 得做工

对啊，这就是让人烦的地方。Dropbox 把工具该做的事（冲突检测层）推给 用户 纪律。而纪律永远赢不过自动化。

我做 Keeply 之前自己用 Dropbox 撞过上百次同样的事，后来才搞懂不是我不够细心，是 Dropbox 本来就这样设计的。

## 手动合并两份文件是症状治疗 {#why-manual-merge-fails}

Dropbox Help Center 教你的 修法：「打开两份文件，比对差异，手动合并到主文件，删掉 冲突副本。」一听很合理。

但这个 修法 **不改变 机制**。你下个礼拜还会再 同步 冲突、还会再产生新 冲突副本、还会再手动合并。一个月之后你已经做这件事 4-5 次。

你不是不会合并。你是在用一个**设计上不挡冲突的工具**。解法是换 同步 机制，不是训练自己合并合得更快。

对比 Google 前 3 名（Dropbox Help / EaseUS / Wondershare）：他们都是症状治疗指南，没人从 机制 角度切。这篇文章是。

## 3 种 同步 设计能根治 {#three-designs}

把 同步 设计能做的事拆成 3 种模式。每种对应不同 冲突 场景：

### Design A：Detect-and-prompt sync（Git-style merge）

两端改同档，同步 时检测 冲突，跳 UI 提示 给 用户 选：留 A、留 B、或把两个变更合并。**例子**：Git（CLI 圈用）、**Keeply** spec M3-100 conflict-detection（用办公室语言 wrap，不讲「merge conflict」）。**解场景 #1 + #2**。

### Design B：File locking（atomic check-out）

你打开文件，工具自动 lock。同事打开看到「Anna 在用」，不能改。**例子**：SharePoint、Adobe Creative Cloud Files、Bentley ProjectWise。**解场景 #1 + #3 + #4 全部**，取舍：同事得等。

### Design C：Local Clone + manual 同步（Keeply 模型）

Working 副本 在你本机，同步 是主动 推送（不是实时镜像）。冲突 在 推送 时检测，UI 提示 给 用户 选。**例子**：**Keeply** 的 Local Clone Pattern（spec M3-098） + SMB safety layer（M3-095）+ conflict-detection（M3-100）。**解场景 #1-#4 全部**，取舍：同步 不像 Dropbox 实时。

这时候你就会发现，4 种场景里 #4（跨 OS 同步 delay）是最难解的，因为它是纯时钟问题。Design A 跟 C 能 detect，但解析仍要 用户 介入。

## Keeply 不适合的时候 {#boundaries}

Keeply 不解所有 Dropbox 场景：

- **大档实时同步**：Premiere 项目 边改边 同步，Keeply Local Clone 模型不适合（推送 一次几分钟）。
- **移动设备访问**：Keeply 是 桌面优先，Dropbox 应用 在手机上顺得多。
- **外部分享链接**：Dropbox 的「Share link」Keeply 没对应功能。
- **协作频率超高**（1 小时内 多人 编辑）：Keeply UX 比 Dropbox 慢，那种场景该用 Google Docs 协同编辑。

## 下次看到 `(conflicted copy)` 之前

下次文件夹多出 `(conflicted copy)` 文件名，你不会再花 1 小时手动合并，你会知道那是 机制 问题，且你有别的选项。

想看 Keeply 怎么解 同步 冲突？[继续阅读「文件版本管理完整指南」](/zh-cn/post/file-version-management-complete-guide/)。

---

> 关于作者：Ting-Wei Tsao，Keeply 创始人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
