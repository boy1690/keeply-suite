---
title: "【2026 File Management】Tax document retention: how to keep files for 7 years when your cloud caps at 30 days"
description: "IRS keeps audit rights for 3-7 years. Your Dropbox keeps version history for 30 days. The mismatch isn't a bug in either, it's a category confusion — retention archives and working version history are two different tools. Here's how to set up both without buying a compliance suite."
voice_version: v2-2026-05-13
date: 2026-05-13T09:00:00+08:00
draft: false
slug: "tax-document-retention"
primary_keyword: "tax document retention"
locale: en
categories: [File Management]
tags: [cloud sync, backup, tool comparison]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "Timeline diagram showing IRS audit retention requirement (3-7 years) far exceeding Dropbox/OneDrive/Google Drive version history cap (30 days) — illustrating the mismatch between regulatory retention and working version history"
faq_schema:
  - q: How long should I keep tax documents?
    a: In the US, the IRS recommends 3 years for most returns, 6 years if you understated income by 25%+, 7 years if you claimed a bad-debt deduction, indefinitely if you didn't file or filed fraudulently. State requirements often add another year on top. Outside the US, most jurisdictions land in 5-10 years for businesses, 3-7 for individuals.
    
  - q: Is Dropbox safe enough for tax document storage?
    a: Dropbox is fine for storing the files themselves (encrypted at rest, redundant copies). What it's not designed for is the retention timeline — Dropbox version history caps at 30 days on free plans and 180-365 on paid. The files stay, but the version history past the cap is gone. For tax archives that's usually fine because you're storing the final version, not intermediate edits.
    
  - q: Do I need a special tax archive tool?
    a: Probably not, unless you're a business with hundreds of clients (then look at audit-grade archive — Veeam, Acronis, or industry-specific tools). For individuals and small businesses, a regular cloud storage folder organized by year, plus a local backup, is enough. The trap is mixing it with your working files where version history caps will eventually bite.
    
  - q: What's the difference between archive storage and working version history?
    a: Archive storage holds the final, signed version that you need years from now — accessed rarely, never overwritten. Working version history tracks the intermediate edits while a document is being prepared — accessed frequently during the work period, capped at 30 days because no one needs the 2-week-old draft of last March's return. Mixing them creates the wrong assumption that either tool covers both jobs.
    
  - q: How does Keeply fit into tax document retention?
    a: It doesn't, directly. Keeply is a working version history tool — every save while you prepare the return is captured, useful during the work but not the archive. Once filed, move the final PDF to your archive folder (cloud + local backup, separate from Keeply). Keeply's role is keeping the prep history visible so you can answer "which numbers did I have on day X" while working; once the return is filed, the prep history is no longer the canonical record.
---

# 【2026 File Management】Tax document retention: how to keep files for 7 years when your cloud caps at 30 days

> The IRS keeps audit rights for 7 years. Your Dropbox keeps version history for 30 days. Both numbers are correct. They aren't measuring the same thing.

Wednesday morning, April 11. You're closing out tax prep for last year. Your accountant emails: "Please keep all receipts and supporting docs for 7 years — that's the audit window."

You drag the receipts folder into Dropbox. Done.

Five years later, an audit notice arrives. You open Dropbox. The folder is there. The PDFs are there. You're fine.

This is the easy case. The hard case is what happens when you confuse "I keep the file" with "I keep the version history of the file" — and you do, because every cloud comparison article keeps lumping them together.

## The two numbers that confuse everything

Two retention periods get mixed up in tax document discussions:

| Concept | Typical period | What it tracks |
|---|---|---|
| **Document retention (archive)** | 3-7 years (US), 5-10 years (most countries) | The final, filed return + supporting docs |
| **Working version history** | 30 days (free cloud), 180-365 days (paid) | Intermediate edits while you prepare the return |

These are different jobs. The archive needs longevity (the final PDF must be available 7 years from now). The version history needs depth during the work period (so you can roll back if you made a mistake on Monday and noticed Wednesday).

People assume their cloud handles both because both involve "files in the cloud." It doesn't. And the moment that confusion bites is usually not during the work — it's two years later when something prompts you to look back.

## What "tax document retention" actually requires

The minimum reliable setup for individuals and small businesses:

- **One final-version archive folder per year**: `2025-tax/`, `2024-tax/`, etc.
- **Inside each year folder**: the filed return PDF + W-2s/1099s + receipts/supporting docs
- **Two copies**: cloud storage (Dropbox, iCloud, Google Drive — any of them work for archive) + a local backup (external drive, Time Machine, NAS)
- **Never overwrite**: once the return is filed, that PDF doesn't get edited again. If you find an error, file an amended return as a new document — don't overwrite the original

That's it. The version history cap on your cloud doesn't matter for the archive because you're not editing the file after filing. Dropbox's 30-day window only matters if you delete or overwrite — which you shouldn't be doing.

| Storage location | Retention behavior | Verdict for tax archive |
|---|---|---|
| iCloud Drive | Stores file indefinitely; no version history exposed for non-Apple files | ✅ Fine as archive |
| Dropbox | Stores file indefinitely; version history capped 30/180/365 days | ✅ Fine as archive (you're not editing) |
| OneDrive | Stores file indefinitely; 500 versions kept; Recycle Bin 30/93 days | ✅ Fine as archive |
| Google Drive | Stores file indefinitely; 30 days OR 100 versions; "Keep forever" override | ✅ Fine as archive |
| **Local-only drive** | Indefinite, depends on hardware failure rate | ⚠️ Need a second copy |
| **Email inbox as archive** | Indefinite while account active | ⚠️ Search hell when audit hits |

The cloud is fine. What's not fine is treating the cloud's version history as the archive layer, because the version history cap will discard intermediate states you might think are protected.

## Where the version-history tool actually helps

If you use a version-history tool like [Keeply](https://keeply.work) while preparing the return, it captures every save you made during prep. That's useful for one specific scenario:

You filed in April. In June, you realize you might have used the wrong figure on one line. You want to know — what was the version of the spreadsheet I had on the morning of April 10 when I sent it to the accountant?

The filed PDF is in your archive. But the working spreadsheet went through 30+ saves during prep. Cloud version history past 30 days is gone. Time Machine has hourly disk snapshots but doesn't know which save corresponds to "the morning I sent it."

Keeply captures every deliberate save with a timestamp, so "the morning of April 10" is a click away — not for the IRS (they want the filed PDF), but for your own answer.

```
Keeply timeline — tax-2024-worksheet.xlsx

April 10, 2025 — Wednesday
─────────────────────────────────
● 09:14   tax-2024-worksheet.xlsx    (saved)
● 09:47   tax-2024-worksheet.xlsx    ★ Release: sent-to-accountant
● 11:22   tax-2024-worksheet.xlsx    (saved — accountant feedback applied)
```

The ★ Release marker is the version you sent to your accountant. Survives later edits. Available years later.

This is not a replacement for the archive — it's a working-period audit trail. After filing, the canonical record is the PDF in your archive folder, not the Keeply timeline.

## When this article doesn't cover your situation

Three boundaries to call out:

**You're a business with regulated retention requirements (SOX, HIPAA, GDPR)**: This article's "two-copy cloud + local backup" pattern isn't compliance-grade. You need audit-certified archive tooling — Veeam, Acronis, or your industry's specific provider. The retention rule applies to the file *and* the chain-of-custody metadata, which generic cloud storage doesn't produce.

**You handle hundreds of clients' tax documents**: Move to a tax-practice management tool (Drake, ProConnect, TaxDome, etc.). They have built-in retention workflows and client portals. Don't roll your own with Dropbox folders.

**You filed amended returns and need to track the original vs. amended**: Keep both as separate PDFs in the same year folder. Don't try to use version history to track this — the amendment is a new document, not a new version of the old one.

## See also

The full pillar [file version management complete guide](/en/post/file-version-management-complete-guide/) breaks down 4 structural reasons your tool wasn't designed for keeping file history.

[Before comparing iCloud vs Dropbox: all 4 clouds share the same version history cliff](/en/post/cloud-version-history-cliff/) — the version-history-cap-on-cloud problem this article references.

[The 3-2-1 backup rule: 20 years on, is it still enough in 2026?](/en/post/3-2-1-backup-rule/) — the spatial-redundancy side of "two copies." Run 3-2-1 for the archive folder.

---

The IRS retention requirement and your cloud's version history cap are both true. They aren't measuring the same thing.

For the archive, your cloud is fine — store the filed return, don't overwrite, keep a local backup. For the working period, a version-history tool fills in the edits-in-flight. Together they cover both jobs. Mixing them creates the gap that hurts five years later.

Five years from now, when the audit notice arrives, the answer is "open the 2025-tax folder, here's the PDF" — not "let me try to recover from Dropbox version history that expired four years ago."

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
