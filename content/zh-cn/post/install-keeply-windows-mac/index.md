---
title: "【2026 文件管理】Keeply 安装指南（Windows + macOS）：从下载到第一个项目"
description: "不靠 SmartScreen「仍要运行」那颗小字、不靠运气——本文走完 Windows winget 一行命令 + macOS 右键打开两条干净路径，10 分钟装好 Keeply、当天就能保住第一个项目。"
voice_version: v2-2026-05-11
date: 2026-04-26
draft: false
tags: [Keeply 教程]
categories: [教程]
primary_keyword: "Keeply 安装"
locales: ["en", "zh-TW", "zh-CN", "ja", "ko"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
image_alt_data: "安装步骤序列：从 Microsoft Defender SmartScreen 显示「Windows 已保护你的电脑」警告，经 winget 安装，到首个项目完成自动版本追踪——从封锁画面到首次受保护保存仅需十分钟"
faq_schema:
  - q: Windows 跳 SmartScreen 蓝屏，代表 Keeply 有问题吗？
    a: 不是。SmartScreen 蓝屏只是因为 Keeply 是新软件，累积下载量还不够被微软认列为「广为人知」。Keeply 已通过 Microsoft winget 官方审核收录，走 winget 一行命令就完全不会出现蓝屏。
  - q: Windows 上最快的安装方法是？
    a: 打开 PowerShell，粘贴 `winget install Boy1690.Keeply` 按回车，约 30 秒完成全程不出现 SmartScreen。如果不想开 PowerShell 可改下载 .exe 双击，遇到 SmartScreen 点左下角「其他信息」再点「仍要运行」即可。
  - q: macOS 显示「无法验证开发者」怎么处理？
    a: macOS 首次打开未上架 App Store 的应用会这样，是 Gatekeeper 默认保护不是 Keeply 问题。把 Keeply 拖进「应用程序」文件夹后，**右键点 Keeply 选「打开」**（不是双击），对话框跳出再点「打开」即可，之后直接双击就好。
  - q: 安装完成后第一步该做什么？
    a: 打开 Keeply 点「新增项目」，选一个你**目前正在做且不想搞丢**的文件夹拖进去。初次扫描约 1-2 分钟建立基准版本，之后 Keeply 自动在后台记录每一次保存，你照平常工作就好。
  - q: 安装过程常见错误有哪些？
    a: 三个最常见：(1) winget 命令找不到——Windows 10 旧版本没内建，到 Microsoft Store 搜「App Installer」更新即可；(2) .dmg 双击提示「已损坏」——这是 macOS 的误判，重新下载并右键打开；(3) 第一个项目扫描很慢——文件夹若超过 10GB 第一次需 5 分钟，之后保存记录会是即时的。
howto_schema:
  name: Keeply Windows / macOS 安裝教學
  totalTime: PT10M
  steps:
    - name: 了解藍屏原因
      text: SmartScreen 藍屏不代表軟體有問題，是判斷新軟體下載量是否累積足夠信譽。Keeply 已被 Microsoft winget 官方審查收錄，走 winget 路徑就不會出現藍屏。
      url: '#why-smartscreen'
    - name: 選擇安裝路徑
      text: 三條路擇一：Windows 推薦用 winget 指令；不想開 PowerShell 可下載 .exe；macOS 下載 .dmg。
      url: '#three-paths'
    - name: Windows winget 安裝
      text: 開啟 PowerShell，貼入 `winget install Boy1690.Keeply` 並按 Enter，約 30 秒完成，全程不出現 SmartScreen 警告。
      url: '#path-winget'
    - name: Windows .exe 安裝
      text: 下載 .exe 後雙擊，SmartScreen 跳出時點左下角「其他資訊」小字，再點「仍要執行」，安裝精靈接手完成安裝。
      url: '#path-exe'
    - name: macOS .dmg 安裝
      text: 下載 .dmg 並將 Keeply 拖入應用程式資料夾，首次開啟必須右鍵選「打開」而非雙擊，確認對話框點「打開」。
      url: '#path-macos'
    - name: 新增第一個專案
      text: 開啟 Keeply 點「新增專案」，選一個目前正在進行、不想搞丟的資料夾，初次掃描約 1-2 分鐘，之後自動在背景記錄版本歷史。
      url: '#first-project'
---

> 「我双击跳出蓝屏，以为是病毒就关了。」
>
> 。某刚听完 Keeply 介绍的设计师，当天回信这样写。

他不是第一个。Windows 那个蓝色画面拦下的人，可能比真正装起来的还多。

这篇从头走一次：**为什么会跳蓝屏 → 三条更干净的路 → 装完马上开第一个项目**。

## 目录

1. [为什么会跳出那个蓝屏（不是 Keeply 的问题）](#why-smartscreen)
2. [三条路任你选：先看哪条最快](#three-paths)
3. [Windows 路径 1：winget 一行指令（推荐）](#path-winget)
4. [Windows 路径 2：手动下载 .exe](#path-exe)
5. [macOS 安装：右键打开的关键步骤](#path-macos)
6. [装完之后：把第一个项目丢进去](#first-project)
7. [卡住了？5 个常见错误排除](#troubleshoot)

## 为什么会跳出那个蓝屏（不是 Keeply 的问题） {#why-smartscreen}

那个画面叫 [SmartScreen](https://learn.microsoft.com/zh-cn/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/)。它不是判断「这个软件有没有毒」，是判断「这个软件有没有累积够多人用过」。

换个角度：新开的餐厅还没大众点评评价，不代表难吃。是还没人吃过给星。

SmartScreen 对新软件的态度一模一样。它用「**下载量 + 时间**」累积信任，新版本一推出就会回到观察期。Keeply 每次更新都会经历一轮这个过程。这跟「软件本身安全吗」没关系。

那为什么还是会吓到人？因为画面只给你一颗很大的「不执行」钮，要按执行得先点旁边那个叫「**其他信息**」的小字。视觉上，它不像个提示，比较像个阻挡。

但你不必跟它打交道。**Keeply 已经被 Microsoft 的 [winget 套件 仓库](https://github.com/microsoft/winget-pkgs) 收录**，那条路根本不会跳警告。

所以重点不是怎么绕过警告。是怎么走一条警告不会跳出来的路。

![Windows SmartScreen 警告画面，箭头指出「其他信息」小字位置](fig-smartscreen-warning.svg)

## 三条路任你选：先看哪条最快 {#three-paths}

| 路径 | 适合谁 | 预估时间 | 跳蓝屏？ |
| --- | --- | --- | --- |
| **A. winget 指令**（Windows） | 不怕贴一行字到 PowerShell | 2 分钟 | 不会 |
| **B. 官方下载 .exe**（Windows） | 完全不想开黑色窗口 | 5 分钟 | 会，下面教你怎么处理 |
| **C. 官方下载 .dmg**（macOS） | Mac 用户 | 3 分钟 | 不会，但要按右键 |

选好了？跟着对应段落走，其他可以略过。

## Windows 路径 1：winget 一行指令（推荐） {#path-winget}

**winget** 是 Windows 内建的「软件商店指令版」，从 Windows 10 1809 起就在你电脑里了。你不必另外装任何东西。

打开 PowerShell（开始菜单搜「PowerShell」），贴这一行进去，按 Enter：

```powershell
winget install Boy1690.Keeply
```

![PowerShell 跑 winget 指令的画面，30 秒内完成下载与安装](fig-powershell-winget.svg)

30 秒左右会跑完。没有蓝屏。没有「其他信息」那颗小字。

为什么这条路这么干净？因为要列进 winget，Keeply 得通过 [Microsoft 在 GitHub 上的官方审查](https://github.com/microsoft/winget-pkgs)：检查安装包来源、文件签名、安装行为是否干净。把关过才放上架。

换句话说，你跑这行指令的时候，Microsoft 已经先帮你做了一次审核。SmartScreen 那层判断在这条路上是多余的，所以它根本不会出来。

这是「短路径」顺便也是「信任路径」。两件事一行解决。

## Windows 路径 2：手动下载 .exe {#path-exe}

不想开 PowerShell？也行。去 [keeply.work](https://keeply.work/) 点下载，拿到 `.exe` 安装文件，双击。

接下来会跳出 SmartScreen 蓝屏。**这是正常的**（[原因见上面](#why-smartscreen)）。要继续装，动作是这样：

1. 点蓝色画面上的「**其他信息**」（左下角的小字）
2. 才会出现「**仍要执行**」按钮
3. 点下去，安装向导接手

![SmartScreen 点完「其他信息」后，下方出现「仍要执行」按钮](fig-smartscreen-run-anyway.svg)

整个过程多花约 3 分钟，多在心理建设，不在实际操作。装完跟路径 1 殊途同归，下一段一起。

## macOS 安装：右键打开的关键步骤 {#path-macos}

Mac 不会跳蓝屏。但首次打开不能双击。双击会被 [macOS Gatekeeper](https://support.apple.com/zh-cn/102445) 挡下。

正确流程：

1. 下载 `.dmg`，把 Keeply 拖进 应用 文件夹
2. 打开 应用，找到 Keeply
3. **右键 → 打开**（不是双击）

   ![macOS Finder 右键菜单，第一项「打开」被框出](fig-macos-rightclick.svg)

4. 对话框跳出来，按「打开」

   ![macOS 确认对话框，「打开」按钮被框出](fig-gatekeeper-dialog.svg)

到这就完成了。**只有第一次需要这样**，之后双击正常用。

为什么第一次要绕？Gatekeeper 对任何「未公证或新公证」的 应用 默认不允许双击启动。右键打开是 Apple 自己提供的「我知道我在装什么」的明确同意动作。

这不是 Keeply 特殊状况。每个没被你电脑看过的新 Mac 应用 第一次打开都这样。

## 装完之后：把第一个项目丢进去 {#first-project}

装好不算成功。当天有项目被保护住，才算。

打开 Keeply，点「**新增项目**」，挑一个你正在做的文件夹。

**建议第一个丢什么**：你目前手上「**不想搞丢、又一直在动**」的那个。提案、合同、设计稿、PPT，都可以。最好不是你已经半年没碰的旧文件夹。那个的价值不在「保护」，在「归档」，是另一个故事。

第一次扫描需要 1 到 2 分钟。之后 Keeply 会在后台看着这个文件夹，**改文件自动记录**版本，不必你手动按存档点。

举个合成范例帮你想象：某设计师装完当下丢的是 Q2 提案文件夹。第一次扫描花了 2 分钟。第三天，他发现自己上周六改错一个 标志 颜色，从历史拉回前一版花了 20 秒。

装完当天就用第一个项目，比装完一周才用，留存率高很多。

## 卡住了？5 个常见错误排除 {#troubleshoot}

| 症状 | 处理 |
| --- | --- |
| `winget` 找不到指令 | 表示你的 Windows 还没装「应用安装程序」。改用路径 2（手动下载 .exe）就好，不必跟它纠结 |
| Win 11 跳「需要管理员」 | 用「**以管理员身份运行**」重开 PowerShell |
| Mac「无法打开因为无法验证开发者」 | 右键 → 打开（不是双击），见上面 macOS 段 |
| 公司网络挡下载 | 改用 winget 指令，走 Microsoft CDN，多半放行 |
| 装完打不开 | 重启一次；仍不行寄 [support@keeply.work](mailto:support@keeply.work) |

## 唯一要记住的一件事

记住一件事就好：

**蓝屏不是判决，是 信誉 还在累积。**

你不需要绕过警告，你只需要走 winget 那条没有警告的路。

---

> 关于作者：Ting-Wei Tsao，Keeply 创办人。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
