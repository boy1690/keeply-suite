# Handoff: Entity SEO foundation — Wikidata + Crunchbase + Product Hunt

> Created 2026-05-13. Three external-application tasks that establish
> Keeply as a recognized entity across the data sources Google + AI
> search engines use for Knowledge Graph / entity disambiguation.
>
> Each task = a browser AI prompt you paste into Operator / ChatGPT
> browser / Claude browser-use. ~5-15 min per task for you (mostly
> waiting for the agent + answering 1-2 clarifications).

## Why entity SEO matters in 2026

Google's Knowledge Graph + AI search engines (Perplexity / ChatGPT
Search / Google AI Overviews) treat "Keeply" as a fuzzy string until
they can link it to a canonical entity record. Once linked:

- Brand SERP gets a Knowledge Panel (boosts CTR + trust)
- `sameAs` URLs in our Organization JSON-LD are validated against
  these data sources → schema stops being "claims about Keeply" and
  becomes "verified info about entity Q-xxx (Wikidata) / Keeply
  Inc. (Crunchbase)"
- AI search engines can cite Keeply confidently because the entity
  has multiple independent sources confirming it

Without these, every mention of "Keeply" in AI search results is
disambiguation roulette against the brand also called Keeply.com
(US-based unrelated brand we saw at position 1 in SerpBear's
"Keeply" TW SERP).

---

## Task 1: Wikidata entry

### Prompt to paste into browser AI

```
I want you to create a Wikidata entry for "Keeply" — a file management
software product. I'm logged into Wikidata as the founder. Walk through
these steps and report back:

Step 1: Open https://www.wikidata.org/wiki/Special:NewItem
        Verify I'm logged in.

Step 2: Create a new item with:
  - Label (en): "Keeply"
  - Label (zh-TW): "Keeply" (same Latin)
  - Description (en): "File management software for project management
    teams with built-in version history and 3-2-1 storage"
  - Description (zh-TW): "為專案管理團隊設計的檔案管理軟體，內建版本歷史
    與 3-2-1 多地儲存"
  - Also: Label/Description in zh-CN, ja, ko, it (same content
    translated)

Step 3: Add these statements (claims):
  - instance of (P31): software (Q7397)
  - operating system (P306): Microsoft Windows (Q1406), macOS (Q14116)
  - programming language (P277): Rust (Q575650), TypeScript (Q978185)
    (Tauri app)
  - official website (P856): https://keeply.work
  - developer (P178): [skip if no Wikidata entry for the founder yet]
  - inception (P571): 2026 (or correct year — confirm with me)
  - copyright license (P275): proprietary (Q22682747)

Step 4: Add identifiers (P-properties for cross-reference):
  - GitHub topic (P9180): keeply [if you can find this property]
  - Twitter username, LinkedIn page — skip if missing

Step 5: Save the item. Note the Q-number (the auto-assigned ID like
Q123456789).

Report back: Q-number, any clarifications needed, any statements you
couldn't add (and why).

Do NOT add references / sources that don't exist — Wikidata's review
bots will flag fabricated sources.
```

### After you run this

Take the Q-number returned, add to `hugo.toml`:

```toml
[params.organization]
  sameAs = [
    "https://keeply.work",
    "https://github.com/boy1690/keeply-releases",
    "https://www.wikidata.org/wiki/Q<NUMBER>"    # ← add this
  ]
```

Then re-build → every Organization JSON-LD across the site links to
the Wikidata canonical entity.

---

## Task 2: Crunchbase company entry

### Prompt to paste into browser AI

```
I want you to create a Crunchbase company entry for "Keeply" — a file
management software product. I'm logged into Crunchbase as the founder.

Step 1: Open https://www.crunchbase.com/ → top-right user menu → "Add a
        Company" or visit https://www.crunchbase.com/#add-company

Step 2: Fill in:
  - Company name: Keeply
  - Website: https://keeply.work
  - Description: File management software for project management teams.
    Built-in version history, 3-2-1 multi-location storage, and
    multi-repo Release for non-developer teams that don't want to
    learn git.
  - Founding year: <ask me to confirm>
  - Founding location: <ask me to confirm — Taipei, Taiwan probably>
  - Industries: SaaS, Productivity, Information Technology
  - Operating status: Active
  - Funding stage: Bootstrapped / Pre-seed (whichever applies — ask)
  - Employee count: 1-10
  - Founder profile: link my LinkedIn (https://www.linkedin.com/in/
    ting-wei-tsao-b57480152/) and add as founder + CEO
  - Logo: upload from https://keeply.work/logo.svg if you can
    download; otherwise skip — I'll add later
  - Social links: GitHub
    (https://github.com/boy1690/keeply-releases), blog
    (https://blog.keeply.work)

Step 3: Submit. Crunchbase reviews submissions manually — typically
takes 1-7 days. You'll get email when approved.

Report back: submission confirmation, expected review timeline, any
clarifications needed.
```

### After Crunchbase approves

Add the Crunchbase URL to `hugo.toml` `[params.organization].sameAs`:

```toml
"https://www.crunchbase.com/organization/keeply"
```

---

## Task 3: Product Hunt launch (optional, time-sensitive)

### Prompt to paste into browser AI

```
I want you to create a Product Hunt listing for Keeply — file
management software. I'm logged into Product Hunt as the founder.

Step 1: Open https://www.producthunt.com/posts/new

Step 2: Fill in:
  - Name: Keeply
  - Tagline: "Your file history guardian — version control without
    the git terminology" (or ask me for the canonical tagline from
    `~/.claude/projects/d--tools-doing-keeply-blog/memory/keeply_brand_tagline.md`
    if you can read it)
  - Website: https://keeply.work
  - Description: 250-char limit. Use:
    "File management for project management teams. Built-in version
    history, 3-2-1 storage (local + canonical + mirror), and multi-
    repo Release. No git terminology required."
  - Topics: pick all that apply — Productivity, Developer Tools,
    Mac, Windows, Backup, Version Control
  - Logo: upload from https://keeply.work/logo.svg
  - Gallery images: 3-5 screenshots if available — skip if I haven't
    provided them; we can add later
  - Makers: add me as Maker (link LinkedIn / Twitter when prompted)
  - Pricing: $599 USD one-time (matches buy.html); add "Free trial"
    if applicable

Step 3: DO NOT publish immediately. Save as draft. Schedule for a
Tuesday-Thursday launch (best Product Hunt traffic days), ideally
12:01 AM Pacific time (full 24-hour visibility on launch day).

Confirm draft saved + return the draft URL + the scheduled launch
date you picked. Ask me to confirm the date before final submission.
```

### Why Product Hunt third (not first)

Product Hunt launch is a one-shot marketing event with most value
captured on launch day. Wikidata + Crunchbase first because they're
permanent infrastructure; Product Hunt is a campaign and should be
timed when you have:

1. ≥ 3 ready-to-ship screenshots
2. A waitlist / hunter willing to upvote on launch morning
3. A landing-page CTA ready for the launch-day traffic spike

If those aren't ready, defer Product Hunt 1-2 months.

---

## After all three land

Hugo.toml `[params.organization].sameAs` becomes:

```toml
sameAs = [
  "https://keeply.work",
  "https://blog.keeply.work",
  "https://github.com/boy1690/keeply-releases",
  "https://www.wikidata.org/wiki/Q<number>",
  "https://www.crunchbase.com/organization/keeply",
  "https://www.producthunt.com/products/keeply"
]
```

That's 6 independent verified mentions across the data sources Google
+ AI search engines actually use for entity recognition. Knowledge
Panel emergence typically follows within 4-12 weeks.

## Cross-references

- Memory `keeply_brand_tagline.md` — canonical positioning line
- Memory `keeply_target_audience.md` — broad audience definition
- Memory `reference_keeply_author_byline.md` — founder name (Ting-Wei Tsao)
- Existing `[params.organization].sameAs` in `hugo.toml`

## Status

- [ ] Wikidata entry submitted (Task 1)
- [ ] Wikidata Q-number added to hugo.toml organization sameAs
- [ ] Crunchbase company submitted (Task 2)
- [ ] Crunchbase URL added to sameAs after approval
- [ ] Product Hunt launch scheduled (Task 3, when ready)
- [ ] Product Hunt URL added to sameAs after launch
