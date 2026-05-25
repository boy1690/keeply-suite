---
title: "【2026 File Management】Word Saves Versions, Not the Memory of Which One You Sent 3 Months Ago"
description: "Word AutoRecover, OneDrive version history, and Time Machine are all save-layer rescue tools — retention runs from cleared-on-close to a few hundred versions. Recovering the deliverable you sent 3 months ago needs a tool-layer always-on version history plus delivery-time metadata."
voice_version: v2-2026-05-11
date: 2026-05-25T10:45:00+08:00
draft: false
slug: "client-asked-which-version"
retrofit_status: v1-legacy
primary_keyword: "recover previous version of word document mac"
locale: en
categories: [Use cases]
tags: [file recovery, operator error]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: hybrid
ranking_locales: [en, ko]
cta_topic: versioning
image_alt_data: "Clock showing 11:23 beside three files — proposal_v3_FINAL.docx, proposal_v3_FINAL_v2.docx, proposal_v3_FINAL_final.docx — none traceable to the March delivery the client is asking about; Word AutoRecover and OneDrive do not reach 3 months back"
faq_schema:
  - q: What does Word's built-in version history do?
    a: "Word has three mechanisms: AutoRecover (crash rescue, cleared on close), AutoSave (saves to the cloud as you type), and OneDrive version history (keeps roughly 500 version snapshots). All three are short-term, save-incident rescue — none is designed to track the deliverable you sent 3 months ago."
  - q: How long do AutoRecover, OneDrive, and Time Machine each retain?
    a: "AutoRecover clears once the file closes normally; OneDrive version history defaults to about 500 versions and auto-deletes the oldest beyond that; Mac Time Machine keeps hourly snapshots for 24 hours and daily snapshots for 30 days. Every mechanism has a retention ceiling — none reaches across the 3-month line."
  - q: How long is Word version history?
    a: "Word itself keeps no long-term history of its own — AutoRecover clears when you close the file, and the version history you see actually comes from OneDrive, which keeps roughly 500 versions and prunes the oldest beyond that. There's no fixed number of days; once OneDrive prunes them or the file is local-only, older versions are gone — which is why a version you delivered 3 months ago usually isn't there."
  - q: Why can't Word's version history reach back 3 months?
    a: "Built-in version history lives in the \"save layer,\" designed for the most recent failed write, with retention tuned to how often the average user looks back within a month. Beyond 3 months isn't a design goal, so pruning is reasonable behavior. Solving it takes a tool-layer, always-on version history."
  - q: What does it take to recover a deliverable from 3 months ago?
    a: "Two layers: an always-on version history (every version you save is kept, independent of Word's or OneDrive's retention policy); and delivery-note metadata (who, when, and which version, embedded automatically on export). Keeply provides both."
  - q: How long does Google Docs keep revisions?
    a: "Google doesn't publish a firm retention period. Its documentation notes that older revisions may be merged to save space; in practice, revisions older than 3 months are often auto-merged or cleared, so they can't be relied on for long-term deliverable tracking."
---

# 【2026 File Management】Word Saves Versions, Not the Memory of Which One You Sent 3 Months Ago

> Built-in version history is save-layer rescue. Recovering versions you delivered 3 months ago takes a tool layer.

It's Saturday night, 11:23 PM. Your client messages: "Can you resend that proposal version you sent in March?"

You open OneDrive version history. Only the last week is left. Word AutoRecover cleared when you closed the file. There are 7 `_v` files on your laptop, none lining up with what you delivered in March.

Three months ago you pressed ⌘+S on that version. The tools didn't remember.

From the conversations Keeply users share, this 11:23 PM message is the scenario that comes up most often.

## TL;DR

Microsoft Word's **version history**, AutoRecover, and OneDrive version snapshots are all **save-layer rescue mechanisms**. Designed for "I crashed mid-document" scenarios. Retention runs short: from cleared on file close, up to about 500 versions in cloud history. This is save-layer rescue, not delivery tracking. To recover the version you delivered three months ago, you need an independent always-on version history at the tool layer, plus a metadata stamp at delivery time.

## Contents

1. [What can Word's built-in version history actually do?](#what-can-words-built-in-version-history-actually-do)
2. [AutoRecover, OneDrive, Time Machine: how long does each retain?](#autorecover-onedrive-time-machine-how-long-does-each-retain)
3. [Why these mechanisms don't reach 3 months later](#why-these-mechanisms-dont-reach-3-months-later)
4. [Recovering the version you delivered 3 months ago](#recovering-the-version-you-delivered-3-months-ago)
5. [FAQ](#faq)

---

## What can Word's built-in version history actually do?

Word and the broader Office stack include three "**version recovery**" mechanisms:

- **AutoRecover**: rescues unsaved content during a crash. Saves a temp version every 10 minutes by default. Cleared once the file closes normally.
- **AutoSave** (OneDrive / SharePoint online Word): writes to the cloud as you type.
- **OneDrive version history**: keeps a snapshot of each save, retrievable for any timestamp. Microsoft's [SharePoint versioning docs](https://learn.microsoft.com/en-us/sharepoint/document-library-version-history-limits) note 500 major versions retained by default (personal Microsoft accounts: 25).

Excel's version history sits in the same design — see [the 4 Microsoft limits behind Excel's 1-2 version cap](/en/post/excel-version-history-limits/) for the spreadsheet shape of this same trap.

The design intent is consistent: handle "**I crashed mid-document**" or "**I just saved over something**". Short-term save accidents. They aren't designed for "**the client asks about version v3 from three months ago**."

## AutoRecover, OneDrive, Time Machine: how long does each retain?

To see whether these mechanisms hold, look at the retention numbers:

| Mechanism | Default retention | Prune trigger | Designed for |
| --- | --- | --- | --- |
| Word AutoRecover | Cleared on file close | File close, Word restart | Crash recovery |
| OneDrive AutoSave | Live writes | Live overwrite | Real-time co-editing |
| OneDrive version history | About [500 versions](https://learn.microsoft.com/en-us/sharepoint/document-library-version-history-limits) (25 on personal accounts) | Older drops once over 500 | Short-term rollback |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | hourly 24h + daily 30 days + weekly until disk full | Disk full | System-level backup |
| Windows File History | Configurable | Configurable | System-level backup |

That's exactly the bind. Each mechanism has a ceiling. From cleared on close to about 500 versions. None of them reach across three months.

On construction sites, every file version decides what gets delivered in the end. Not finding the delivered version means testing the limits of a manager's memory.

When you do find both versions, the next question is "what actually changed between them?" Keeply lays them side by side so you don't have to read line by line:

![Keeply version diff view: 4/12 client-approved version vs 5/4 pricing revision + proposal.docx 32-line diff + Basic $99→$149 / Pro $299→$399](diff-viewer.svg)

Red and green columns make the pricing change unmistakable — you forward this screenshot to your client and skip the explanation paragraph.

## Why these mechanisms don't reach 3 months later

Here's the distinction nobody names plainly: **save layer** versus **tool layer**.

Built-in version history lives at the **save layer**. Its purpose is "if the last write fails, roll back". So retention is short. The reference point is "how often the average user looks back within a month." Anything past three months isn't in the design target. Pruning is intentional.

Sam is a consultant. Saturday at 11:23 PM, his client asks for the March version of a report. He opens OneDrive version history; the oldest entry is April 28. AutoRecover was disabled long ago. He has 8 `_v`-prefixed `.docx` files locally; none of the file timestamps line up with that March delivery week.

Here's the worst part. Sam remembers afterward: in March, he sent the client a PDF exported that day, not the `.docx`. The original `.docx` was overwritten weeks ago. The PDF is in the client's inbox. **He just can't get back to that `.docx` version to keep editing.**

## Recovering the version you delivered 3 months ago

You need two layers:

- **Always-on version history**: every version you save is preserved, never pruned. Independent of Word's or OneDrive's retention policy.
- **Delivery-note metadata**: when you export a file, the metadata for "who, when, which underlying version" is embedded. Drop the file back into the tool three months later, see the full origin.

[Keeply](https://keeply.work) provides both layers.

Lisa has used Keeply for half a year. Monday morning, her client asks for the April version of a deck. She finds the attachment in her client's email and drops the `.pdf` into Keeply. Keeply surfaces "**This is the v3 deck from 2026-04-12**, the original `.docx` is still in your version history, tagged 'client-approved'." She clicks "go to this version" and three seconds later Word opens that exact April 12 version, ready to edit.

That said, Keeply doesn't replace AutoRecover. If Word crashes mid-document, AutoRecover is still your first line. Keeply also can't rewrite history retroactively: it has to be in use at delivery time for the metadata to embed. For deliveries before you installed Keeply, this article doesn't help. For every delivery from today onward, Keeply will.

That's the part that should let you breathe.

## FAQ

**Q1: Can Word AutoRecover be turned off?**

It can be, but it's on by default. Path: "File → Options → Save → Save AutoRecover information every 10 minutes." Note that AutoRecover clears when the file closes normally. It isn't long-term retention.

**Q2: Do OneDrive Personal and Business retain the same number of versions?**

Not exactly. OneDrive Personal retains about 500 versions by default. OneDrive for Business (Microsoft 365) also defaults to 500 but admins can adjust the limit. Once the cap is reached, the oldest version is pruned.

**Q3: Is Time Machine a backup or a version manager?**

Time Machine is a system-level backup, not a per-file version manager. It snapshots the whole disk, not "every save of proposal.docx." Recovering a specific version of a single file is technically possible but cumbersome.

**Q4: How long does Google Docs keep revisions?**

Google doesn't publish a clear retention number. Their [official docs](https://support.google.com/docs/answer/190843) note that "older revisions may be merged" to save space. In practice, revisions older than three months are often merged or pruned automatically.

**Q5: Is Keeply in the same category as Git?**

No. Git is a version-control tool built for software engineers — its interface is a black terminal, and you have to learn a vocabulary (branch, merge, commit) to use it. Keeply is built for non-engineers from day one: the interface is a file window, the words you see are "save a version / work copy / sync to project location," and there's no engineering jargon. Both solve a similar problem (keeping file history), but the audience, interface, and mental model are different.

---

That 11:23 message will come again. You don't know when.

But you know this: your version from 5 minutes ago and your version from 3 months ago. The tool can't treat them the same.

For every delivery from today onward, can you let the tool remember that one for you?

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
