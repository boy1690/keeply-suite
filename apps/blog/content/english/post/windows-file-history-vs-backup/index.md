---
title: "【2026 File Management】Windows file history vs backup: 3 different things"
description: "Windows ships three separate features people call \"backup\" — File History, Windows Backup, and version history in cloud sync. They solve three different problems. Confusing them is why you have one of them covered and feel safe when you're missing the other two."
voice_version: v2-2026-05-13
date: 2026-05-13T08:00:00+08:00
draft: false
slug: "windows-file-history-vs-backup"
retrofit_status: v1-legacy
primary_keyword: "windows file history vs backup"
locale: en
categories: [File Management]
tags: [version control, backup, tool comparison]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "Three side-by-side Windows backup mechanisms — File History continuous folder sync, Windows Backup point-in-time disaster snapshot, and version history layer — illustrating that the word 'backup' covers three jobs that aren't interchangeable"
faq_schema:
  - q: What's the difference between Windows File History and Windows Backup?
    a: File History continuously copies your selected user folders (Documents, Pictures, Desktop) to an external drive on a schedule (default hourly). Windows Backup is a point-in-time snapshot meant for disaster recovery — restore the whole system to a previous state. Different jobs, different shapes. File History won't restore a crashed Windows; Windows Backup won't give you yesterday's draft of a document.
    
  - q: Is OneDrive a backup?
    a: Not in the disaster-recovery sense. OneDrive is sync plus offsite copy. If you overwrite a file, sync replicates the overwrite. OneDrive has a 30-day Recycle Bin for deletions and version history for individual files (capped at the plan tier). That covers some of what File History covers, but it isn't a system-state backup.
    
  - q: Which Windows backup should I turn on first?
    a: Depends on what you're afraid of. Afraid your laptop dies — Windows Backup or system image. Afraid you'll overwrite a document and lose yesterday's version — File History plus a version-history layer. Afraid of all of the above — all three. They aren't redundant; they cover different failure modes.
    
  - q: Does File History keep every version of a file?
    a: No. File History saves a copy on a schedule (default every hour) only when the external drive is connected. If your drive was offline yesterday, there's no yesterday snapshot — the most recent version available will be from whenever the drive was last connected. This is one reason restoring through File History can return an unexpectedly old version.
    
  - q: Where does Keeply fit?
    a: Keeply is a per-save version history layer that lives next to whatever cloud or backup you're already running. Not a replacement for Windows Backup or File History. You keep using those for disaster recovery and external-drive sync; Keeply captures the versions you deliberately save so you can pull back the specific version you intended, not the closest scheduled snapshot.
---

# 【2026 File Management】Windows file history vs backup: 3 different things

> Three Windows features answer to "backup." They aren't interchangeable. You probably have one of them.

You set up File History when you got the laptop. You feel covered. Three months later, you overwrite a document with the wrong edit and look for yesterday's version.

The dialog opens. It offers you a copy from last Tuesday. That's not what you wanted.

You assumed "backup" was one thing. It was three things, and you had the wrong one running for this particular need.

## What Windows means when it says "backup"

Three features Microsoft ships in Windows go by names that all sound like backup. They aren't.

| Feature | What it actually is | What it's for |
|---|---|---|
| **File History** | Scheduled snapshot of user folders to an external drive | Recovering an older copy of a document — at hourly granularity |
| **Windows Backup** (Backup and Restore) | Point-in-time system image | Restoring a whole machine after disk failure or system rot |
| **Version history** (via OneDrive / cloud sync) | Per-file save history in cloud | Walking back individual file changes within a retention window |

Three different shapes. Three different jobs. The thing they share is the word "backup," which is why people get one of them running and assume the others are covered too.

## The three different axes

It's easier to see when you map them as three axes of protection.

**Axis 1 — Disk/system level.** When your drive dies or Windows refuses to boot, you need a system image — the whole machine, restorable to a known good state. Windows Backup does this. File History does not. OneDrive does not.

**Axis 2 — Folder level over time.** When a folder exists and you want a copy of it from earlier this month, you need scheduled folder snapshots. File History does this. Windows Backup is too coarse (full image, not folder versions). OneDrive does it for files synced to OneDrive, capped by retention plan.

**Axis 3 — Per-file save events.** When you want the specific save you made yesterday at 2:47 PM — the one before you broke the formula — you need per-save versioning. None of File History, Windows Backup, or OneDrive cleanly does this. File History gives you the closest scheduled snapshot (which might be hours off, or days off, if the drive was disconnected). OneDrive version history can do it for cloud-synced files only and only within the retention window. There's no general per-save layer in Windows.

The pattern: each tool answers one axis well, struggles with the others, and the third axis is essentially unaddressed by anything Microsoft ships by default.

## What each one actually saves you from

Concrete scenarios, mapped to the three Windows features:

| Scenario | File History | Windows Backup | OneDrive version history |
|---|---|---|---|
| SSD physically fails | ❌ | ✅ | ✅ for synced files |
| Windows won't boot | ❌ | ✅ | ❌ (no system state) |
| Ransomware encrypts everything | ⚠️ if drive was offline | ✅ if image is offline | ⚠️ depends on sync timing |
| Overwrote a Word doc, want yesterday's version | ⚠️ closest hourly snapshot if drive connected | ❌ too coarse | ✅ if file is in OneDrive, within retention |
| Want the version from 3 months ago | ⚠️ only if File History was running and drive online that day | ❌ image is whole-system | ❌ usually past retention |
| Accidentally deleted file 2 weeks ago | ✅ if you remember it was in a watched folder | ✅ if image taken | ✅ Recycle Bin if within 30 days |

The takeaways you can't see if you only know one:

- A reader with **only File History**: covered for the "yesterday's draft" case (mostly), exposed when the drive dies or Windows breaks.
- A reader with **only Windows Backup**: covered for catastrophic failure, exposed for everyday overwrites and edits.
- A reader with **only OneDrive**: covered for cloud-synced files in retention, exposed when files are local-only, when retention has passed, and for system-state restore.

The article on [iCloud vs Dropbox version history](/en/post/cloud-version-history-cliff/) walks the cloud retention side in depth; this piece is the Windows-native side.

## The fourth axis nobody ships by default

Look at the table again. The bottom-right corner — "the specific version I deliberately saved" — has no clean tick mark.

File History gives you a scheduled snapshot, not your save. Windows Backup gives you the disk, not a file. OneDrive gives you cloud history, but only for cloud-synced files and only within the retention window.

An intent-driven version history layer — every version you save becomes a recoverable point, locally, no time cap — is the missing axis.

[Keeply](https://keeply.work) is one implementation. It watches the folders you point it at and keeps the versions you save as their own versions (plus an optional timer), without an external-drive schedule and without a retention cap. Pull yesterday's draft at 2:47 PM, not the closest scheduled snapshot.

After a meeting, you hit "Save version" and the dialog opens — you attach a note like "post-meeting conclusions added" and save:

![Keeply save-version dialog: changed-files list + note field + Cancel / Save Version buttons](save-dialog.svg)

Six months later, the Timeline shows each save as its own line — automatic background saves plus the manual ones with the note you wrote at the time:

![Keeply Timeline for meeting-notes.docx: auto-saved versions alongside manual saves (post-meeting conclusions / morning draft / after first client feedback)](timeline.svg)

When you do need to restore a specific version, the dialog is more direct than the Windows File Explorer "Previous Versions" tab — note preview, source timestamp, and an auto-snapshot safety net before the swap:

![Keeply Restore File dialog: meeting-notes.docx + source 2 days ago + note preview + auto-snapshot safety net](restore-file-dialog.svg)

This isn't a replacement for File History or Windows Backup — those still cover their axes. Keeply adds the axis Windows doesn't ship.

Cluster sibling: [I asked Windows File History for yesterday's draft. It gave me a file from 2019.](/en/post/windows-file-history-wrong-version/) — the narrative version of why the third axis matters.

## When this article isn't your fix

A few situations where the three-axis frame doesn't help:

**You're in a managed enterprise environment.** IT is running SCCM, Veeam, or another centralized backup. Your three axes are decided by policy. Talk to IT before adding personal layers.

**You're on Windows Home with no external drive.** File History wants an external drive or network location. Without one, the only thing running is OneDrive (if signed in). Buy an external drive, or accept that you have one axis only.

**You need immutable archive for compliance.** Backups in this article aren't compliance archives. SOX / HIPAA / GDPR retention needs proper archive tooling (Veeam, Acronis, industry-specific). The three-axis frame is workflow protection, not regulatory.

## See also

The pillar [file version management complete guide](/en/post/file-version-management-complete-guide/) covers the four structural reasons your tool wasn't designed for keeping file history — useful background to why these three Windows features split the way they do.

Sibling article: [I asked Windows File History for yesterday's draft. It gave me a file from 2019.](/en/post/windows-file-history-wrong-version/) walks one specific failure mode in detail.

Mac parallel: [Time Machine vs Dropbox: backup, sync, and the third axis neither of them is](/en/post/time-machine-vs-dropbox/) — same three-axis frame, different OS.

---

The word "backup" pulls three things into one bucket. You set up one, you feel covered, and the other two are quietly missing. Three months later something fails on an axis you weren't watching.

Pick what to run on each axis. Then know which one you don't have.

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
