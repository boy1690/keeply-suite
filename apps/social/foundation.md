# SOC channel foundation — base pages setup (HYBRID model)

> **Hybrid (2026-05-24):** each channel gets a **brand account** (official presence / name-claim)
> **+ founder-personal participation** (where B2B trust + signups are actually built). This keeps
> every SOC hard rule (A5 Reddit comment-first, A6 FB groups — both stay personal) and adds an
> official layer on top. I drafted the copy; **account creation/editing is yours** (identity-gated).

**Positioning (shared):** Keeply = a file-version guardian for teams who live in shared folders —
automatic, always-on version history + delivery tracking, so you can return to any past version.
Founder: Ting-Wei Tsao (civil engineer → built Keeply after a file got saved over on site).
ICP: consultants / architects / accountants / designers / freelancers.
Keeply red-line: "always-on version history that never expires" — never "saves every Cmd+S".

| Channel | Brand account (official) | Founder-personal (community) |
|---|---|---|
| LinkedIn | Company page ✅ built (entity) | **Personal profile = posting channel** (A2) |
| Reddit | Company account (name-claim) | **Personal account = comment-first** (A5, the workhorse) |
| Facebook | **粉絲頁 / Page** (broadcast) | Personal profile **in ICP groups** (A6, the workhorse) |
| Threads | **Company account** (experiment) | — (brand voice; kill-gated) |

---

## LinkedIn

**Personal profile = the posting channel (A2; do this first).**
- **Headline:** `Founder, Keeply — version history + delivery tracking for teams who live in shared folders | civil engineer turned builder`
- **About (first 2 lines show before "see more"):** `I'm building Keeply after a file I'd worked on for weeks got saved over in a shared folder. It keeps an always-on version history of your files — even on a NAS or shared drive — so you can always get back the version you need.` (then founder story → who it's for → keeply.work)
- **Featured:** pin keeply.work + 1 top blog post. **Creator mode ON** (file management / version control).

**Company page** (`/company/keeply-work`) ✅ built — entity/credibility anchor. Post 2–3 updates (About copy in `apps/blog/_dev/hooks/linkedin-about-en.md`), then leave it; don't make it the posting channel (0.28x reach).

## Reddit

**Company account** (name-claim + credibility; use sparingly — Reddit dislikes brand spam):
- Handle: `u/keeply` (or `u/keeply_app`). Bio: `Keeply — always-on file version history for teams in shared folders. keeply.work`
- Use for: claiming the name, occasional official AMA/launch only. **Not** for routine commenting.

**Founder personal account = the workhorse (A5):** comment-first, 90/10, ICP subs.
- Bio: `Building Keeply (always-on file version history). Here to help with file/version/backup pain — not to pitch.`
- ICP subs: r/architecture · r/AskArchitects · r/biglaw · r/Lawyertalk · r/Accounting · r/graphic_design · r/freelance · r/datahoarder · r/selfhosted · r/interior_design
- Rules: comment-first (no self-promo posts); 90% help / 10% Keeply only when genuinely the right answer; never r/SaaS or r/Entrepreneur.

## Facebook

**Page (粉絲頁) = broadcast/brand presence** (like the LinkedIn company page):
- Name `Keeply`, category Software/Productivity, link keeply.work, About = the shared positioning. Post product updates + blog reshares here.

**Founder personal profile = the workhorse (A6):** joins + participates in ICP **groups** (a Page can't do this).
- Candidate groups (US/UK/CA/AU/NZ only): QB Power User Community · Tax Professionals of America · CPA & Accountant Business Owners (USA) · Bay Area Attorney Network · Ivy Designer Network · Interior Architecture + Design (IA+D) · Architects & Designers of NYC · Graphic Designers Tip Lounge · state-bar solo-firm groups
- Rules: 0–4 wks lurk + log themes; 4+ wks contribute as a named founder giving answers — never in-thread pitches. (DE/FR/JP/KR/BR groups are NOT this channel.)

## Threads

**Company account** (experiment, A1-excluded from canonical SOC → time-boxed, kill-gated; see `threads/CLAUDE.md`).
- Handle `@keeply` / `@keeply.work`. Bio: `Your files have stories. Keeply remembers them all. Always-on version history for teams in shared folders. → keeply.work`
- First post draft ready in `threads/drafts/`.

---

## Build order
1. **LinkedIn personal profile** (B2B #1; company page already anchors entity).
2. **Reddit:** claim company account (5 min) → set up founder account + join subs + lurk (the real work).
3. **Facebook:** create Page (10 min) → founder joins 5–8 groups + lurk (the real work).
4. **Threads** company account (experiment).

⚠️ **Cross-cutting prerequisite:** set up keeply.work signup attribution ("where did you hear about us?") — without it, no channel can be measured (SOC §1 + Threads kill-gate).

## Mine vs yours
- **Mine:** all copy/bios above, subs/groups lists, SOC rules, per-channel `state/` when we start each.
- **Yours:** create/log into accounts, paste copy, join subs/groups (identity-gated). I can drive the browser for whichever you're logged into.
