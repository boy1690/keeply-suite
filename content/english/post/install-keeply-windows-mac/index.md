---
title: "【2026 File Management】Install Keeply on Windows and macOS: a 10-minute walkthrough"
description: "Skip the SmartScreen 'Run anyway' fine print and the guesswork — this article walks through Windows winget one-liner + macOS right-click open, two clean paths to install Keeply in 10 minutes and protect your first project the same day."
voice_version: v2-2026-05-11
date: 2026-04-26
draft: false
tags: [keeply tutorial]
categories: [Tutorials]
primary_keyword: "install Keeply"
locales: ["en", "zh-TW", "zh-CN", "ja", "ko"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
image_alt_data: "Step sequence from Microsoft Defender SmartScreen 'Windows protected your PC' warning through winget install to first project auto-versioned — ten minutes from blocked app screen to first protected save"
faq_schema:
  - q: Does the Windows SmartScreen warning mean Keeply has a problem?
    a: No. SmartScreen flags Keeply because it's a new app and hasn't accumulated enough downloads to be labelled "widely known" by Microsoft. Keeply is officially listed in the Microsoft winget catalog, and the one-line winget install path skips the SmartScreen warning entirely.
  - q: What's the fastest way to install Keeply on Windows?
    a: Open PowerShell, paste `winget install Boy1690.Keeply` and press Enter. It finishes in about 30 seconds, no SmartScreen warning. If you'd rather not open PowerShell, download the .exe and double-click; when SmartScreen appears, click "More info" then "Run anyway".
  - q: macOS says "cannot verify developer" — what do I do?
    a: macOS shows this on first launch for any app not published to the App Store. It's Gatekeeper's default protection, not a Keeply issue. After dragging Keeply into the Applications folder, **right-click Keeply and choose "Open"** (don't double-click). Click "Open" again in the confirmation dialog — every double-click after that works normally.
  - q: What should I do right after installing?
    a: Open Keeply, click "New project" and drag in a folder you're **actively working on and don't want to lose**. The initial scan takes 1-2 minutes to build a baseline, then Keeply records every save in the background while you work as normal.
  - q: What are the most common install errors?
    a: Three you'll hit most often. (1) `winget` not found — older Windows 10 builds don't ship it; update "App Installer" from the Microsoft Store. (2) .dmg says "damaged" — macOS misjudgment; redownload and right-click open. (3) First project scan is slow — folders over 10 GB take ~5 minutes the first time, but save tracking afterwards is real-time.
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

> "I double-clicked, the blue screen popped up, and I figured it was a virus and closed it."
>
>. A designer who'd just heard about Keeply, replying that same afternoon.

He's not the first. The blue screen on Windows probably stops more people than actually finish installing.

Here's the whole path from start to finish: **why the blue screen shows up → three cleaner ways to install → opening your first project right after**.

## Table of contents

1. [Why the blue screen shows up (it's not a Keeply problem)](#why-smartscreen)
2. [Three paths. Pick whichever fits you](#three-paths)
3. [Windows path 1: one winget command (recommended)](#path-winget)
4. [Windows path 2: download the .exe](#path-exe)
5. [macOS install: the right-click step you can't skip](#path-macos)
6. [After install: drop in your first project](#first-project)
7. [Stuck? 5 common errors](#troubleshoot)

## Why the blue screen shows up (it's not a Keeply problem) {#why-smartscreen}

That screen is called [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). It doesn't decide "is this software malicious?". It decides "has enough people used this yet?".

Think of it this way: a new restaurant with no Google reviews isn't bad food. It's just food no one's rated yet.

SmartScreen treats new software the same way. It builds trust with **download volume + time**, and every new release goes through this observation period again. Keeply hits this every time it ships an update. None of it has to do with whether the software itself is safe.

So why does it scare people? Because the screen only gives you a giant "Don't run" button. To run anyway, you have to click a tiny link called **More info** off to the side. Visually it doesn't read as a notice. It reads as a wall.

But you don't have to deal with it. **Keeply is published in [Microsoft's winget package repo](https://github.com/microsoft/winget-pkgs)**, and that path doesn't trigger the warning at all.

So the point isn't how to bypass the warning. It's how to take a path where the warning never appears.

![Windows SmartScreen warning, with the small "More info" link circled](fig-smartscreen-warning.svg)

## Three paths. Pick whichever fits you {#three-paths}

| Path | Best if you | Time | Blue screen? |
| --- | --- | --- | --- |
| **A. winget command** (Windows) | don't mind pasting one line into PowerShell | 2 min | No |
| **B. Official .exe download** (Windows) | don't want to open a black terminal | 5 min | Yes. We'll walk you through it |
| **C. Official .dmg download** (macOS) | are on a Mac | 3 min | No, but right-click required |

Picked one? Jump to the matching section. Skip the others.

## Windows path 1. One winget command (recommended) {#path-winget}

**winget** is Windows' built-in "package manager". Basically a Microsoft Store but for the command line. It's been baked into Windows since version 10 1809. You don't need to install anything extra.

Open PowerShell (search "PowerShell" in the Start menu), paste this line, hit Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell running winget. Download and install completes in about 30 seconds](fig-powershell-winget.svg)

About 30 seconds and it's done. No blue screen. No "More info" fine print.

Why is this path so clean? Because to be listed in winget at all, Keeply has to pass [Microsoft's official review on GitHub](https://github.com/microsoft/winget-pkgs): they check installer source, file signatures, and installation behaviour. It only ships once everything passes.

Put differently: when you run that command, Microsoft has already done a round of vetting for you. SmartScreen's check is redundant on this path, so it just doesn't appear.

Short path and trust path, in one line.

## Windows path 2. Download the .exe {#path-exe}

Don't want to touch PowerShell? Fine. Go to keeply.work, click download, grab the `.exe`, double-click it.

The SmartScreen blue screen will pop up. **That's normal** ([why, see above](#why-smartscreen)). To proceed:

1. Click **More info** (the small underlined text on the warning)
2. A **Run anyway** button appears
3. Click it. The installer takes over from there.

![Once you click "More info", the "Run anyway" button appears next to "Don't run"](fig-smartscreen-run-anyway.svg)

The whole detour adds maybe 3 minutes. Most of it psychological, not actual clicks. From here on, this path and path 1 converge.

## macOS install. The right-click step you can't skip {#path-macos}

No blue screen on Mac. But you can't double-click on first launch ,  [macOS Gatekeeper](https://support.apple.com/en-us/102445) will block it.

Correct flow:

1. Download the `.dmg`, drag Keeply into your Applications folder
2. Open Applications, find Keeply
3. **Right-click → Open** (not double-click)

   ![macOS Finder right-click menu with "Open" highlighted at the top](fig-macos-rightclick.svg)

4. A dialog appears. Click "Open"

   ![macOS confirmation dialog with the "Open" button highlighted](fig-gatekeeper-dialog.svg)

That's it. **Only the first launch needs this**. Double-click works normally afterwards.

Why the detour first time? Gatekeeper blocks double-click launch for any app it hasn't seen notarized. Right-click → Open is Apple's way of saying "I know what I'm installing, let me through".

This isn't a Keeply quirk. Every new Mac app that hasn't been on your machine before behaves the same way on first launch.

## After install. Drop in your first project {#first-project}

Installed isn't done. Your first project being protected the same day. That's done.

Open Keeply, hit **New project**, pick a folder you're actively working in.

**What to drop in first**: whatever you're holding right now that you can't afford to lose and that you keep editing. A pitch, a contract, a design file, a deck. Any of those work. Don't pick a folder you haven't touched in six months. That folder's value is in archiving, not in protection. Different story.

The first scan takes 1 to 2 minutes. After that, Keeply watches the folder in the background and **records versions automatically as you save**. No manual "checkpoint" button to press.

A made-up but typical example: a designer drops in their Q2 pitch folder right after install. First scan takes 2 minutes. Three days later, they realize they swapped a logo colour wrong last Saturday. Pulling the previous version from history takes 20 seconds.

People who use the first project on install day stick around far more than people who wait a week.

## Stuck? 5 common errors {#troubleshoot}

| Symptom | Fix |
| --- | --- |
| `winget` command not found | Means your Windows doesn't have App Installer yet. Use path 2 (download the .exe) instead. Don't fight it |
| Win 11 says "needs administrator" | Reopen PowerShell with **Run as administrator** |
| Mac says "cannot be opened because it is from an unidentified developer" | Right-click → Open (not double-click). See macOS section above |
| Company network blocks the download | Use the winget command instead. It goes through Microsoft's CDN and usually gets through |
| Installed but won't open | Restart once. Still nothing? Email [support@keeply.work](mailto:support@keeply.work) |

## The one thing to remember

One thing:

**The blue screen isn't a verdict. It's reputation still being built.**

You don't need to bypass the warning. You just need to take the winget path where the warning never shows up.

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
