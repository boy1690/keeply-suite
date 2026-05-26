# SOC v0.2 design — ready-to-apply upgrade for `~/.claude/commands/soc.md`

> The agent can't edit `~/.claude/commands/soc.md` (self-mod hard block, standalone file,
> no junction). This doc is the **complete v0.2 design** — apply by pasting the marked
> blocks into soc.md, OR add a permission rule for `Edit(~/.claude/commands/**)` and have
> the agent integrate it. Theme: turn SOC from a manual checklist into a **learning loop**.

```
INTENT (reads past performance → biases topic/angle)
  → DRAFT (apply proven templates, --auto)
  → SELF-REVIEW (+ pre-post DIAGNOSIS gate)
  → PUBLISH → ARCHIVE
  → MEASURE (capture per-post result) → PATTERNS (what works) ──┐
  ▲────────────────────────────────────────────────────────────┘
```
Preserves all v0.1 hard rules (A1–A8 + A8a). Adds **feedback loop / diagnosis / templates / autonomy** — every v0.1 deferred item.

---

## §1 — Data feedback loop (close SOC's biggest gap)

SOC v0.1 only had lagging 90/180-day milestones, no per-post learning. Add:

### 1a. New state-schema fields (add to §State Schema table, items 13–14)

```yaml
# 13. post_performance — per-post result log (drives the learning loop)
post_performance:
  - slug: "soc-2026-..-week.."
    channel: "linkedin-longform"
    hook_type: "scene | reversal | question | stat | confession"
    topic_atom: "shared-folder-overwrite | version-memory | delivery-tracking | ..."
    icp_angle: "consultant | architect | accountant | designer | freelancer"
    posted_at: "ISO"
    measured:
      impressions: null
      engagement_rate: null      # vs A8 real metric, not vanity KPI
      profile_clicks: null
      canonical_clicks: null     # clicks to keeply.work — the one that matters
      attributable_signups: null # from "where did you hear about us?"
# 14. pattern_intelligence — rolling synthesis (refreshed by /soc patterns)
pattern_intelligence:
  updated_at: null
  top_hook_types: []        # ranked by canonical_clicks + signups, NOT likes
  top_topic_atoms: []
  top_icp_angles: []
  dead_patterns: []         # tried, no signal — stop repeating
  sample_size: 0
  confidence: "low | medium | high"   # low until >=8 posts (mirror booster data-confidence)
```

### 1b. New subcommands (add to §Channel Sub-Dispatch special subcommands)

- `/soc measure <slug>` — prompt for / capture the post's measured metrics into
  `post_performance[].measured`. Run 48h and 1-week after publish. **Lead metric =
  canonical_clicks + attributable_signups, not impressions/likes** (A8 + trust-first).
- `/soc patterns` — synthesize `post_performance` → refresh `pattern_intelligence`
  (which hook_type / topic_atom / icp_angle correlate with clicks+signups; flag
  dead_patterns). Confidence stays `low` until ≥8 measured posts (don't over-fit early).

### 1c. INTENT reads patterns (modify Step I-4 / add I-4.5)

> **Step I-4.5 (v0.2): pattern-informed angle.** Before asking channels, read
> `pattern_intelligence`. If `confidence ≥ medium`, surface: "last N posts: {top_hook}
> + {top_icp_angle} drove the most canonical_clicks; {dead_patterns} got no signal."
> Bias this week's topic_atom / icp_angle toward what worked; avoid dead_patterns.
> If `confidence = low` (<8 posts), say so and don't over-steer — keep exploring.

---

## §2 — Pre-post DIAGNOSIS gate (smarter SELF-REVIEW)

Add **Step SR-1.5** to SELF-REVIEW (before the hard-rule checklist), per channel draft:

```
PRE-POST DIAGNOSIS (predict + flag before publish — not after):
- [ ] HOOK STRENGTH: first 200 chars (LinkedIn truncate line) carry a concrete scene or
      reversal, not a warm-up. Read it cold — would the ICP stop scrolling? Weak → rewrite.
- [ ] 吸客非吸讚 (trust-first, per marcthibodeau): does this attract a CUSTOMER
      (specific ICP file-pain → could become a trial) or just a VIEWER (generic-relatable,
      drives likes but no signups)? If viewer-bait → reframe to ICP pain.
- [ ] AI-TELL: no "in today's fast-paced world" / "let's dive in" / em-dash spam /
      tidy tricolons. Sound like a person, not a content mill.
- [ ] STANDALONE VALUE: posts 1..n-1 deliver value with ZERO product mention; Keeply
      only in the last beat (mirrors A5 90/10 + the blg P0.2 discipline).
- [ ] PREDICTION: based on pattern_intelligence, note expected band
      (e.g. "scene+consultant historically mid-band clicks"). Sets a baseline to MEASURE against.
- [ ] CTA SANITY: exactly one backlink, to the keeply.work / Hugo canonical (A3).
Diagnosis fail → back to DRAFT (max 3 rounds, then ESCALATE). This is informational +
blocking only on 吸客非吸讚 viewer-bait or a missing/again-wrong backlink.
```

---

## §3 — Template / snippet library (stop drafting from zero)

New companion file **`apps/social/soc-templates.md`** (or wherever soc state lives).
DRAFT Step D-3 references it per channel. Starter set:

### LinkedIn long-form structures (800–1,200 chars, single-line breaks)
- **Scene→reframe→ICP echo→CTA** (the report/shared-folder draft uses this):
  `[3-line concrete scene] / [the trap nobody warns you about] / [why it hits {ICP}] / [what actually fixes it + → canonical]`
- **Confession→lesson:** `I used to {bad habit}. It cost me {specific}. Here's what I do now.`
- **Counter-narrative:** `Everyone says {common advice}. For {ICP} handling files, it's backwards because {reason}.`

### Reddit comment (90/10, comment-first)
- **Answer-first:** `[direct answer to their pain, 90% pure help] … [only if genuinely the right tool] fwiw I use {keeply} for the version-history part — {1 line}.`
- Never lead with product. Never post a self-promo thread. ICP subs only (A5).

### Facebook Groups answer (lurk-then-contribute, US/UK/CA/AU/NZ, A6)
- **Named-founder helper:** `[answer their question fully, no pitch] [optional: I build a tool in this space, happy to DM if useful — never in-thread pitch].`

### Hook patterns (first 200 chars)
- Time-anchored scene: `"This week I sat down to {task}…"`
- Question the reader is living: `"Ever opened a shared folder and your own file was… not yours anymore?"`
- Specific stat from /blg note (cite). · Avoid: generic "In today's world…".

---

## §4 — Autonomous mode (fewer prompts)

Add a `--auto` flag and an autonomy section. Mirrors your IBV/WEB autonomous flow.

```
/soc weekly --auto [--channels linkedin-longform,reddit-comment]

AUTONOMOUS RULES (only stop at the 2 real gates):
1. Source blg note: auto-pick the most recent /blg weekly note; only ask if none / >1 ambiguous.
2. ICP role: infer from the blg note's persona/frontmatter; only ask if absent.
3. Channels: default to last week's channel set (or [linkedin-longform, reddit-comment]
   if first run); --channels overrides.
4. DRAFT: apply §3 templates + pattern_intelligence automatically.
5. STOP only at:
   (a) PRE-POST DIAGNOSIS gate (§2) — show drafts + diagnosis, get one "ship it",
   (b) HUMAN-CHANNEL-PUBLISH — you publish manually (no API; unchanged).
6. Hard rules A1–A8 still enforced; any violation → ESCALATE (never silently override).
Non-auto (interactive) flow stays the v0.1 default; --auto is opt-in.
```

---

## How to apply
1. **You paste** the marked blocks into `~/.claude/commands/soc.md` (each maps to a named
   section/step above), bump shipped version to v0.2.0, and create `soc-templates.md`; **or**
2. **Authorize the agent**: add an `Edit`/`Write` permission for `~/.claude/commands/**`
   (via `/update-config`), then the agent integrates §1–§4 surgically + creates the templates file.

> Note: SOC's canonical home is `keeply-workspace/apps/soc/` (separate context). Decide
> whether v0.2 + the templates file live there or are mirrored — keep one source of truth.
