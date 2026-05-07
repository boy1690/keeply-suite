---
title: "How to install Keeply on Windows and macOS in 10 minutes"
description: "Skip the 'Run anyway' fine print and the guesswork — install Keeply in ten minutes and protect your first project the same day."
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
---

> "I double-clicked, the blue screen popped up, and I figured it was a virus and closed it."
>
> — A designer who'd just heard about Keeply, replying that same afternoon.

He's not the first. The blue screen on Windows probably stops more people than actually finish installing.

Here's the whole path from start to finish: **why the blue screen shows up → three cleaner ways to install → opening your first project right after**.

## Table of contents

1. [Why the blue screen shows up (it's not a Keeply problem)](#why-smartscreen)
2. [Three paths — pick whichever fits you](#three-paths)
3. [Windows path 1: one winget command (recommended)](#path-winget)
4. [Windows path 2: download the .exe](#path-exe)
5. [macOS install: the right-click step you can't skip](#path-macos)
6. [After install: drop in your first project](#first-project)
7. [Stuck? 5 common errors](#troubleshoot)

## Why the blue screen shows up (it's not a Keeply problem) {#why-smartscreen}

That screen is called [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). It doesn't decide "is this software malicious?" — it decides "has enough people used this yet?".

Think of it this way: a new restaurant with no Google reviews isn't bad food. It's just food no one's rated yet.

SmartScreen treats new software the same way. It builds trust with **download volume + time**, and every new release goes through this observation period again. Keeply hits this every time it ships an update. None of it has to do with whether the software itself is safe.

So why does it scare people? Because the screen only gives you a giant "Don't run" button. To run anyway, you have to click a tiny link called **More info** off to the side. Visually it doesn't read as a notice — it reads as a wall.

But you don't have to deal with it. **Keeply is published in [Microsoft's winget package repo](https://github.com/microsoft/winget-pkgs)**, and that path doesn't trigger the warning at all.

So the point isn't how to bypass the warning. It's how to take a path where the warning never appears.

![Windows SmartScreen warning, with the small "More info" link circled](fig-smartscreen-warning.svg)

## Three paths — pick whichever fits you {#three-paths}

| Path | Best if you | Time | Blue screen? |
| --- | --- | --- | --- |
| **A. winget command** (Windows) | don't mind pasting one line into PowerShell | 2 min | No |
| **B. Official .exe download** (Windows) | don't want to open a black terminal | 5 min | Yes — we'll walk you through it |
| **C. Official .dmg download** (macOS) | are on a Mac | 3 min | No, but right-click required |

Picked one? Jump to the matching section. Skip the others.

## Windows path 1 — one winget command (recommended) {#path-winget}

**winget** is Windows' built-in "package manager" — basically a Microsoft Store but for the command line. It's been baked into Windows since version 10 1809. You don't need to install anything extra.

Open PowerShell (search "PowerShell" in the Start menu), paste this line, hit Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell running winget — download and install completes in about 30 seconds](fig-powershell-winget.svg)

About 30 seconds and it's done. No blue screen. No "More info" fine print.

Why is this path so clean? Because to be listed in winget at all, Keeply has to pass [Microsoft's official review on GitHub](https://github.com/microsoft/winget-pkgs): they check installer source, file signatures, and installation behaviour. It only ships once everything passes.

Put differently: when you run that command, Microsoft has already done a round of vetting for you. SmartScreen's check is redundant on this path, so it just doesn't appear.

Short path and trust path, in one line.

## Windows path 2 — download the .exe {#path-exe}

Don't want to touch PowerShell? Fine. Go to keeply.work, click download, grab the `.exe`, double-click it.

The SmartScreen blue screen will pop up. **That's normal** ([why, see above](#why-smartscreen)). To proceed:

1. Click **More info** (the small underlined text on the warning)
2. A **Run anyway** button appears
3. Click it. The installer takes over from there.

![Once you click "More info", the "Run anyway" button appears next to "Don't run"](fig-smartscreen-run-anyway.svg)

The whole detour adds maybe 3 minutes — most of it psychological, not actual clicks. From here on, this path and path 1 converge.

## macOS install — the right-click step you can't skip {#path-macos}

No blue screen on Mac. But you can't double-click on first launch — [macOS Gatekeeper](https://support.apple.com/en-us/102445) will block it.

Correct flow:

1. Download the `.dmg`, drag Keeply into your Applications folder
2. Open Applications, find Keeply
3. **Right-click → Open** (not double-click)

   ![macOS Finder right-click menu with "Open" highlighted at the top](fig-macos-rightclick.svg)

4. A dialog appears — click "Open"

   ![macOS confirmation dialog with the "Open" button highlighted](fig-gatekeeper-dialog.svg)

That's it. **Only the first launch needs this** — double-click works normally afterwards.

Why the detour first time? Gatekeeper blocks double-click launch for any app it hasn't seen notarized. Right-click → Open is Apple's way of saying "I know what I'm installing, let me through".

This isn't a Keeply quirk. Every new Mac app that hasn't been on your machine before behaves the same way on first launch.

## After install — drop in your first project {#first-project}

Installed isn't done. Your first project being protected the same day — that's done.

Open Keeply, hit **New project**, pick a folder you're actively working in.

<!-- TODO: 替換為真實截圖 keeply-add-project.png（Keeply「新增專案」對話框） -->

**What to drop in first**: whatever you're holding right now that you can't afford to lose and that you keep editing. A pitch, a contract, a design file, a deck — any of those work. Don't pick a folder you haven't touched in six months. That folder's value is in archiving, not in protection. Different story.

The first scan takes 1 to 2 minutes. After that, Keeply watches the folder in the background and **records versions automatically as you save**. No manual "checkpoint" button to press.

A made-up but typical example: a designer drops in their Q2 pitch folder right after install. First scan takes 2 minutes. Three days later, they realize they swapped a logo colour wrong last Saturday — pulling the previous version from history takes 20 seconds.

People who use the first project on install day stick around far more than people who wait a week.

## Stuck? 5 common errors {#troubleshoot}

| Symptom | Fix |
| --- | --- |
| `winget` command not found | Means your Windows doesn't have App Installer yet. Use path 2 (download the .exe) instead — don't fight it |
| Win 11 says "needs administrator" | Reopen PowerShell with **Run as administrator** |
| Mac says "cannot be opened because it is from an unidentified developer" | Right-click → Open (not double-click). See macOS section above |
| Company network blocks the download | Use the winget command instead — it goes through Microsoft's CDN and usually gets through |
| Installed but won't open | Restart once. Still nothing? Email [support@keeply.work](mailto:support@keeply.work) |

## The one thing to remember

One thing:

**The blue screen isn't a verdict — it's reputation still being built.**

You don't need to bypass the warning. You just need to take the winget path where the warning never shows up.
