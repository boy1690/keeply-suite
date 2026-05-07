---
title: "What the 3-2-1 backup rule doesn't cover in 2026"
description: "The 3-2-1 backup rule is necessary—but it was never designed to handle operator-error. Here's what it covers, what it misses, and what fills the gap."
date: 2026-05-02T09:00:00+08:00
draft: false
slug: "3-2-1-backup-rule"
primary_keyword: "3-2-1 backup rule"
locale: en
categories: [Use cases]
tags: [version control, operator error, tool comparison]
image: cover.svg
og_image: cover.png
cta_topic: backup
---

# What the 3-2-1 backup rule doesn't cover in 2026

> The 3-2-1 rule hasn't changed in 20 years—but what you're afraid of has.

In 2005, photographer **Peter Krogh** wrote his backup rule into existence: 3 copies, 2 different media, 1 stored offsite. He was protecting against tape decay, dropped hard drives, server-room fires.

Twenty years later, what you're afraid of is **pressing ⌘+S one too many times**.

The 3-2-1 rule never moved—but your real threat did.

## TL;DR

The **3-2-1 backup rule** is necessary: three copies, two media types, one offsite. It protects against hardware failure, fire, ransomware—the disaster scenarios. But it was never designed to handle **operator-error**: you overwriting your own file, a teammate editing the wrong version, cloud sync replicating the broken version to all three copies. This piece breaks down what 3-2-1 covers, what it misses, and what fills the gap.

## Contents

1. [What is the 3-2-1 backup rule?](#what-is-the-3-2-1-backup-rule)
2. [What does 3-2-1 protect against, and what doesn't it?](#what-does-3-2-1-protect-against-and-what-doesnt-it)
3. [Why does 3-2-1 still let you lose files?](#why-does-3-2-1-still-let-you-lose-files)
4. [Can one tool handle 3-2-1 plus version history?](#can-one-tool-handle-3-2-1-plus-version-history)
5. [FAQ](#faq)

---

## What is the 3-2-1 backup rule?

The 3-2-1 rule comes from Peter Krogh's [*The DAM Book* (O'Reilly, 2005)](https://www.oreilly.com/library/view/the-dam-book/9780596008550/):

- **3 copies** of your data: the original plus 2 backups
- **2 storage media**: e.g. local drive plus cloud, or NAS plus external SSD
- **1 copy stored offsite**: physically separated from the rest

In 2005, the dominant media were tape, CD/DVD, and mechanical hard drives. Failure rates were high, media aged fast. The rule's design intent was clear: **make sure no single hardware failure, media degradation, or facility disaster can wipe out your files**.

{{IMAGE-1: Visual of 3-2-1 — three stacked file copies, two media icons (local + cloud / NAS + external), arrow to one offsite location.}}

## What does 3-2-1 protect against, and what doesn't it?

To see where 3-2-1 holds, look at what "losing a file" actually looks like:

| Scenario | Does 3-2-1 save you? | Why |
| --- | :---: | --- |
| Hard drive fails | ✅ | 3 copies on different media |
| Office burns down | ✅ | 1 copy is offsite |
| Ransomware encryption | ✅ (offsite copy untouched) | Offsite isolation |
| **You overwrite your own version** | ❌ | All 3 copies sync to the new version |
| **Teammate edits the wrong file** | ❌ | Same as above |
| **Need a version from 3 months ago** | ❌ | 3-2-1 isn't version history |

That's exactly the frustration. 3-2-1 protects against "the file is gone." It doesn't address "the file is still there but it's wrong."

## Why does 3-2-1 still let you lose files?

Here's a 20-year-old blind spot no one names plainly: **the "3" in "3 copies" is spatial redundancy, not temporal redundancy.**

In 2005, drive lifetimes were short and media was fragile. Multiple copies fought physical decay. "3" was a sensible answer to that problem.

In 2026, drives are reliable and cloud sync is instant. What does the "3" become? It becomes the same mistake replicated to three places, in real time.

Sam is a designer. Monday morning, 10:32 AM, a client calls asking for the proposal version they signed off three months ago. Sam opens the NAS — 12 versions, three cloud copies all showing the current latest.

But Sam doesn't want the latest. He wants the version from three months ago.

Here's the worst part: it's only after the backup completes that he realizes "latest" isn't what he needs. 3-2-1 dutifully protected the wrong version, three times.

## Can one tool handle 3-2-1 plus version history?

Yes. [Keeply](https://keeply.work) builds 3-2-1 directly into its location layer:

- **Local work copy**: the working version on your machine (the "1 copy")
- **Project location (canonical)**: the canonical store on your NAS or cloud (counts toward "2 media")
- **Backup location**: the entire project synced to a different physical location (the "1 offsite")

Layer in git-grade version history and a release-freezing mechanism. One tool, three layers of protection.

Keeply doesn't decide where your backup location goes. If you keep your machine and the backup in the same office, a fire takes both. No tool fixes that. The "offsite" principle is still on you.

But you don't need two separate tools, one for spatial redundancy and one for version history. One Keeply, from your laptop to your backup, from this second to last week, all visible and all retrievable.

{{IMAGE-2: Three-layer protection diagram — location layer (local + canonical + backup), time layer (version history), freeze layer (release purposes).}}

## FAQ

**Q1: How is the 3-2-1 rule different from the 4-2-1-1-0 rule?**

4-2-1-1-0 extends 3-2-1: one immutable backup added, zero verification errors required. Still spatial redundancy at heart. **Doesn't solve the version-history problem.**

**Q2: Does cloud backup count as the "offsite" copy?**

Yes. But iCloud, OneDrive, and Google Drive are sync, not backup. If you delete or overwrite locally, the cloud syncs the same change in seconds. **They don't protect against operator-error.**

**Q3: Does NAS count as 2 media types?**

NAS plus a local drive can count as 2 media. But RAID isn't a backup. RAID protects against drive failure. It doesn't protect against you deleting the wrong file.

**Q4: Is Keeply already 3-2-1?**

Yes. Keeply builds 3-2-1 into its location layer (local work copy + canonical + backup location) and adds version history and release freezing. One tool, three layers.

**Q5: Do solo workers need 3-2-1 too?**

Depends on how much your files matter. If losing them would hurt, yes. The criterion is "would losing this hurt." It has nothing to do with whether you're an individual or an enterprise.

## See also

The full pillar [file version management complete guide](/en/post/file-version-management-complete-guide/) breaks down 4 structural reasons your tool wasn't designed for keeping file history.

---

In 2005, Peter Krogh designed 3-2-1 to protect against hard drives that drop on the floor.

You're not Peter Krogh in 2005. You're afraid of pressing ⌘+S one too many times.

You don't need two tools—you need one that handles all three layers.
