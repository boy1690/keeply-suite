---
title: "【2026 File Management】AutoCAD drawing version control in 4 steps: stop your crew using last week's revision"
description: "It's 9:40 AM, you stop by the office, and the PM pulls up last Thursday's revision. The frame spec changed, you've been on site every day, nobody told you. A field supervisor's 4-step drawing version control playbook: no new tools for the crew, no workflow overhaul."
slug: "autocad-wrong-version-crew"
date: 2026-04-24T08:50:00+08:00
draft: false
locale: en
primary_keyword: "AutoCAD drawing version control"
tags: [version control, file recovery]
categories: [File management]
locales: [zh-TW, en, zh-CN, ja, ko, it]
image: cover.svg
og_image: cover.png
role: cluster
template: T1
pillar_parent: file-version-management-complete-guide
voice_version: v2-2026-05-11
status: approved_master
cta_topic: versioning
image_alt_data: "Three diverging timelines: Design shipped 5 versions, Office missed the last 2, Field crew still building from version 2 — one project folder, three realities, the gap between office and field always breaks first"
howto_schema:
  name: 圖檔版本管理 4 步：辦公室與現場對齊
  totalTime: PT2H
  steps:
    - name: 新版進辦公室即通知現場
      text: 新版一進辦公室當下通知現場人員，並要求對方明確回覆「收到」才算完成交接，不能只存好就算。
      url: '#h2-4'
    - name: 新版覆蓋舊版前先留檔
      text: 每次新版覆蓋舊版之前，將舊版獨立保存並於檔名中標記版次，以備設計回頭改回舊版時有據可查。
      url: '#h2-4'
    - name: 工具自動記錄版本供全員查看
      text: 導入 Keeply 等版本管理工具，讓每次存檔自動記錄一版，所有人開啟同一保管庫即可看到同一條版本時間線。
      url: '#h2-4'
    - name: 保留一份異地備份
      text: 確保至少一份檔案不在辦公室或工地 NAS，存放於外接硬碟、雲端或備份槽，防止公司 NAS 損毀時無從復原。
      url: '#h2-4'
---

> It's 9:40 AM, you stop by the office, and the PM pulls up last Thursday's revision. The frame spec changed, you've been on site every day, nobody told you. A field supervisor's 4-step drawing version control playbook: no new tools for the crew, no workflow overhaul.

It's 9:40 AM. You finally swing by the office and casually swipe through yesterday's site photos for the PM. The section of storm drain where the concrete has been poured, the cast-in-place frames all set in the slab, ready for the grates.

The PM doesn't say anything. He pulls a file up on his desk: `A-05_drain_0422_issued.dwg`.

"Frame's wrong. The architect revised it again last Thursday."

You feel that drop in your chest. Last Thursday's revision came through the office. Mike received it, filed it to the server, didn't ping anyone. You've been on site every day. Nobody mentioned it on Monday's huddle. You had no reason to know.

That section is already poured. Frame spec changed. That means chipping the cured concrete to pull the old frames out, setting new correct-sized frames, re-pouring the edges, letting it cure. Two more days on the schedule. Other trades stacked behind you, all waiting.

You didn't send the wrong file to the crew. You just didn't know the file had changed.

## Contents

- ["Is that last Thursday's revision?"](#h2-1)
- [Before "issued-for-construction," there are a lot of drafts. Then the architect flips one back](#h2-2)
- [The office knows. The field doesn't](#h2-3)
- [AutoCAD drawing version control in 4 steps: office + field aligned](#h2-4)
- [The only people who don't need this: the crew installing from printed sheets](#h2-5)

---

## "Is that last Thursday's revision?" {#h2-1}

It's the question the PM circles back with when something looks off. The crew asks it too. They don't mean anything by it. They just want to confirm. The problem is, half the time you can't answer right away either.

You open your laptop. The project folder has `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. There's also `A-05_drain_0420_avoidutility.dwg` that somebody dropped in the WhatsApp group. And the early March one, `A-05_drain_0315.dwg`, you never deleted because the architect sometimes circles back to an earlier layout when a change doesn't pan out.

Five file names. You know one of them is what the crew's actually building from. But you can't remember which.

This isn't laziness, not on your part and not on Mike's. It's that the gap between "a new drawing arrives at the office" and "the field knows about it" has nobody assigned to it. You happen to be the person standing on both sides of that gap.

I spent years on construction sites myself and saw this play out too many times. New revisions reach the office, the field doesn't know, and it's always two lines that never connect.

---

## Before "issued-for-construction," there are a lot of drafts. Then the architect flips one back {#h2-2}

You might think, "Fine, I'll just double-check every time I'm in the office." In theory, sure. In practice it falls apart because **drafts keep piling up before anything gets formally issued**.

One detail, from first schematic to issued-for-construction, goes through a lot of versions. Owner adds a comment. Revision. Field walk turns up a utility conflict. Revision. Structural engineer reviews. Revision. **Then the architect goes to rev 5 and the owner says "actually rev 2's edge detail was cleaner," so it flips back**. You open the folder and see six files, two of which are nearly identical. But you can't tell which one is the one that counts right now.

If you waited for the architect to fully "finalize" before you let the crew start, the schedule would crush you. Three trades are stacked up behind this section. Every day you hold, you burn labor, equipment, and float. So the GC takes the calculated risk — **proceeds on the latest seen version**, betting the next revision won't be drastic.

Most of the time the bet pays off. Sometimes it doesn't. That's this week.

---

## The office knows. The field doesn't {#h2-3}

The real break point is here: **a new drawing arrives at the office, the field doesn't hear about it, and nobody carries the message across the gap**.

On the office side, the person receiving the email might be a PM assistant, admin, or another super. Their instinct when a file lands is "file it properly". Folder, naming, archive. They don't always know exactly what the field is up to this week, and they can't always tell at a glance whether this revision is the kind that has to be flagged immediately. To them, filed is done.

On the field side, you're out every day. Even if you hit the office every Friday to sync, between your last check and your next check, the architect might have issued two revisions and flipped one back. You can find it if you go looking. But **only if you're disciplined enough to actively check back in**. Not every super does, every time.

On the crew side, they build from whatever you handed them last. They don't know whether there's a newer file at the office. And they shouldn't need to. Their job is to install per the drawing, not to track versions.

Of those three threads, **the one between office and field is the easiest one to drop**. Not because anyone is slacking. Because no process forces that line to stay open. A "new version uploaded" message in a group thread that's missed is missed for good.

---

## AutoCAD drawing version control in 4 steps: office + field aligned {#h2-4}

There isn't much to it. Four steps. Before I built Keeply, I watched this same script play out at the firm I was at: new revision lands in the office, the field doesn't know, concrete gets poured wrong. The four steps below are the minimum set that closes "nobody carried it across."

**1. The moment a new file lands at the office, ping the field. And wait for a "got it" back.** Not "filed and done." **Handshake completed only when the field person explicitly acknowledges**. Could be WhatsApp, could be Slack, could be a phone call. The rule is: the field has to confirm in writing. No confirmation, the handoff isn't complete.

**2. Before any new revision overwrites the previous one, keep the previous one separately.** Name it `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. This is **for the time the architect flips back**. You can still pull up exactly what rev 3 looked like.

**3. Let the tool record every revision automatically, and make it visible to everyone.** This is where tools take over for the parts discipline can't sustain. [Keeply](https://keeply.work) is built for exactly this. Every save auto-records a version. Files stay where they are. In your project folder, right where your team already looks. **As long as everyone opens the same shared vault (typically the company NAS), everyone sees the same timeline**. The moment the office drops a new file in, the field super opens their Keeply on site and the timeline shows "15:30 today, architect revised again." Honest note: if you need to compare two `.dwg` drawings line by line, you still have to open AutoCAD and do it yourself. Keeply doesn't do CAD drawing diffs. But "a new version dropped, who sent it, when, and have you opened it?". That you stop missing. PM asks "Did you see last Thursday's rev?" and the timeline answers it.

Here's roughly what that looks like on screen:

```text
A-05_drain.dwg
Vault: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Version description                    Tag     When
─────────────────────────────────────────────
 ●  Frame spec revised                          Today
 ●  Rerouted to avoid utility                  04/20
 ●  Issued after owner review          ⭐Issued  04/18
 ●  Profile adjusted                           04/15

─────────────────────────────────────────────
 Vault members (shared NAS)
   Mike (office) · You (field) · Chen (foreman)

   Everyone opens the same folder, everyone sees
   the same timeline. The moment a new version
   lands, it shows up for everyone.
   Hover any row → one-click restore.
```

**Compatibility**: Keeply records underneath, compatible with your existing NAS, SharePoint, OneDrive Business, Synology, QNAP, shared network drives. Files don't move, you don't switch from AutoCAD, you don't change the crew's workflow.

I have to be honest: if you need to compare two `.dwg` drawings line-by-line, you still open AutoCAD and do that yourself. Keeply doesn't do CAD drawing diffs.

**4. At least one copy that's not on this machine and not on the site NAS.** External drive, cloud, backup slot. Whatever. The point is **at least one off-site copy**. Office NAS drives fail, get wiped, get repurposed for the next project. The off-site backup is the cheapest insurance you'll ever buy yourself.

Steps 1 and 2 can run on discipline alone, but honestly. Three months in you'll miss half of them. Step 3 is how the tool catches the other half.

---

## The only people who don't need this: the crew installing from printed sheets {#h2-5}

Let's be honest. This isn't for everyone in construction. But the exclusion list is shorter than you'd think.

**The only people who fully don't need this are the crew installing from the drawing in front of them.** Their job is to build per the sheet they were handed, not chase versions. Chasing versions is your job.

**Public works actually need this more, not less.** You might assume large public or government projects are covered because they already have a BIM collaboration platform. It's the opposite. Public works run more paperwork than private jobs by a wide margin, change requests drag across months, management turnover is higher, the document pile grows faster, and the institutional memory breaks more easily. BIM platforms solve the final deliverable. They don't solve planning documents, shared files, and the revision notes that design drawings accumulate in-process. And those are the things that actually grow, day after day.

**One-person shops need it too.** You might think: "It's just me on this project from start to finish, do I really need version control?" You do. Because three months from now, looking at the same file, **you will forget why past-you made the change**. A timeline stores more than the file itself. It stores the reason at the moment. Future-you will thank present-you for leaving the trail.

Everyone else. Small-to-midsize residential, commercial, interior fit-out, drainage, landscape, roads, campus work, public works, BIM projects, solo designers, design firms — **if your work involves a file being changed and reopened later by someone else or by future-you, you need a timeline.** Every time that line breaks, time and money walk out of your pocket.

---

A `.dwg` is not just a drawing. It's a snapshot of what design, the office, and the field agreed on at one specific moment. That moment keeps changing, keeps getting handed across, keeps getting built from the wrong version.

Worth giving each of your projects its own timeline?

## See also

The full pillar [file version management complete guide](/en/post/file-version-management-complete-guide/) breaks down 4 structural reasons your tool wasn't designed for keeping file history.

---

Remember that 9:40 AM moment. The PM pulling up Thursday's revision, and your chest dropping? You don't have to be the version manager anymore. **Keeply: your file's guardian memory.** Remembers every save, every issued version, every snapshot before the old one gets overwritten. Lives inside your existing project folder. No new tools, no new habits for the crew. Construction fits especially well, because the line between office and field breaks on every single project.

[Meet Keeply →](https://keeply.work)

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
