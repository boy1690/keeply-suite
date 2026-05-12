---
title: "【2026 File Management】What the 3-2-1 backup rule doesn't cover in 2026"
description: "The 3-2-1 backup rule (3 copies, 2 media, 1 offsite) protects against hardware failure, fire, and ransomware. But it was never designed to handle operator error — you overwriting your own version, cloud sync replicating the broken file to all three copies. Here's what 3-2-1 covers, what it misses, and how to close the gap."
voice_version: v2-2026-05-11
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
image_alt_data: "Diagram showing 3 backup copies of proposal_v7_FINAL.psd all labeled LATEST — illustrating Peter Krogh's 2005 rule: the 3-2-1 structure is unchanged but your version pain has moved to the wrong-copy problem"
faq_schema:
  - q: 3-2-1 備份原則到底在說什麼？
    a: 3-2-1 是 Peter Krogh 2005 年訂下的備份規則：3 份檔案、2 種儲存媒介、1 份存放異地。設計目的是讓任何單一硬體故障、媒介老化、機房災難都無法讓你的檔案完全消失。
  - q: 3-2-1 備份原則防什麼、不防什麼？
    a: 3-2-1 能防硬碟損毀、機房失火、勒索軟體。但它不防操作失誤：你自己覆蓋版本、同事改錯共用資料夾、雲端同步把錯的版本傳到三個位置，3-2-1 都救不了。
  - q: 為什麼做了 3-2-1 備份還是會丟檔？
    a: 3-2-1 的「3 份」是空間冗餘，不是時間冗餘。2026 年雲端即時同步，「3」變成同一個錯誤被即時複製到 3 個位置。你需要的不只是多份備份，而是能回溯時間點的版本歷史。
  - q: 雲端備份算 3-2-1 的「異地」嗎？
    a: 算。但 iCloud、OneDrive、Google Drive 是同步不是備份。你刪除或覆蓋會即時同步到雲端，無法防止操作失誤。異地要求只解決物理隔離問題，版本歷史是另一層需求。
  - q: 個人工作者也需要 3-2-1 備份原則嗎？
    a: 看檔案重要性。判斷標準只有一個：丟了會不會痛？跟個人或企業身份無關。會痛就需要。3-2-1 是必要但不足夠的基礎，還需要搭配版本歷史才能應對操作失誤場景。
---

# 【2026 File Management】What the 3-2-1 backup rule doesn't cover in 2026

> The 3-2-1 rule hasn't changed in 20 years, but what you're afraid of has.

In 2005, photographer **Peter Krogh** wrote his backup rule into existence: 3 copies, 2 different media, 1 stored offsite. He was protecting against tape decay, dropped hard drives, server-room fires.

Twenty years later, what you're afraid of is **pressing ⌘+S one too many times**.

The 3-2-1 rule never moved, but your real threat did.

## TL;DR

The **3-2-1 backup rule** is necessary: three copies, two media types, one offsite. It protects against hardware failure, fire, ransomware, the disaster scenarios. But it was never designed to handle **operator-error**: you overwriting your own file, a teammate editing the wrong version, cloud sync replicating the broken version to all three copies. This piece breaks down what 3-2-1 covers, what it misses, and what fills the gap.

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

{{IMAGE-1: Visual of 3-2-1. Three stacked file copies, two media icons (local + cloud / NAS + external), arrow to one offsite location.}}

## What does 3-2-1 protect against, and what doesn't it?

3-2-1 protects against everything that makes a file *disappear* — hard drive failure, office fire, ransomware encryption. It doesn't protect against the file still being there but wrong — you overwriting your own version, a teammate editing the wrong shared folder, you needing the proposal from three months ago. The scenarios laid out:

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

This is the most common scenario.

Sam is a designer. Monday morning, 10:32 AM, a client calls asking for the proposal version they signed off three months ago. Sam opens the NAS. 12 versions, three cloud copies all showing the current latest.

But Sam doesn't want the latest. He wants the version from three months ago.

Here's the worst part: it's only after the backup completes that he realizes "latest" isn't what he needs. 3-2-1 dutifully protected the wrong version, three times.

## Can one tool handle 3-2-1 plus version history?

Yes. [Keeply](https://keeply.work) builds 3-2-1 directly into its location layer:

- **Local work copy**: the working version on your machine (the "1 copy")
- **Project location (canonical)**: the canonical store on your NAS or cloud (counts toward "2 media")
- **Backup location**: the entire project synced to a different physical location (the "1 offsite")

Layer in automatic version history on every save, plus a "Release" mechanism — a snapshot you can mark as "this version went to the client" so it never gets overwritten by later saves. One tool, three layers of protection.

Keeply doesn't decide where your backup location goes. If you keep your machine and the backup in the same office, a fire takes both. No tool fixes that. The "offsite" principle is still on you.

But you don't need two separate tools, one for spatial redundancy and one for version history. One Keeply, from your laptop to your backup, from this second to last week, all visible and all retrievable.

{{IMAGE-2: Three-layer protection diagram. Location layer (local + canonical + backup), time layer (version history), freeze layer (release purposes).}}

## FAQ

**Q1: How is the 3-2-1 rule different from the 4-2-1-1-0 rule?**

4-2-1-1-0 extends 3-2-1: one immutable backup added, zero verification errors required. Still spatial redundancy at heart. **Doesn't solve the version-history problem.**

**Q2: Does cloud backup count as the "offsite" copy?**

Yes. But iCloud, OneDrive, and Google Drive are sync, not backup. If you delete or overwrite locally, the cloud syncs the same change in seconds. **They don't protect against operator-error.**

**Q3: Does NAS count as 2 media types?**

NAS plus a local drive can count as 2 media. But RAID isn't a backup. RAID protects against drive failure. It doesn't protect against you deleting the wrong file.

**Q4: Is Keeply already 3-2-1?**

Yes. Keeply builds 3-2-1 into its location layer (local work copy + canonical + backup location) and adds version history plus the Release freeze feature (mark a snapshot as a milestone that later saves can't overwrite). One tool, three layers. ([Compare: what Keeply actually saves vs. backup and cloud tools.](/en/post/what-keeply-saves-vs-backup-cloud/))

**Q5: Do solo workers need 3-2-1 too?**

Depends on how much your files matter. If losing them would hurt, yes. The criterion is "would losing this hurt." It has nothing to do with whether you're an individual or an enterprise.

## See also

The full pillar [file version management complete guide](/en/post/file-version-management-complete-guide/) breaks down 4 structural reasons your tool wasn't designed for keeping file history.

---

In 2005, Peter Krogh designed 3-2-1 to protect against hard drives that drop on the floor.

You're not Peter Krogh in 2005. You're afraid of pressing ⌘+S one too many times.

You don't need two tools, you need one that handles all three layers.

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
