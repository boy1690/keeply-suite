# Image alt truncation — fix tracker

> Surfaced 2026-05-13 by `npm run seo:audit:images`. 211 alt texts
> across 5 articles × 8-19 locales appear truncated mid-sentence (long
> alt ending without terminal punctuation).
>
> Captured here so the content fix work has a backlog, separate from
> the audit infra. BWF trap T24 documents the prevention rule for
> future articles.

## Scope

```text
file-version-management-complete-guide   19 locales × ~5-6 trunc/locale  ~110 alts
keeply-getting-started-from-zero         15 locales × ~1-2 trunc/locale  ~25 alts
vibe-coding-rollback                     15 locales × ~3 trunc/locale    ~45 alts
what-keeply-saves-vs-backup-cloud        14 locales × ~1-2 trunc/locale  ~20 alts
install-keeply-windows-mac                8 locales × ~1 trunc/locale    ~10 alts
---------------------------------------------------------------------
Total                                                                   211 alts
```

## Truncation pattern (samples from EN locale)

| Article | Image | Truncated alt ending | Likely full intent |
|---|---|---|---|
| file-version-management-complete-guide | image-1.svg | `...Caption: Different jo` | `...Caption: Different jobs, same file, no version handoff.` |
| file-version-management-complete-guide | image-4.svg | `..._v3_finalfinal.psd\` lined up. C` | `...lined up. Caption: nine "final" copies, none of which is the canonical version.` |
| file-version-management-complete-guide | image-5.svg | `...Professional: 180 days / ` | `...Professional: 180 days / Business: 365 days. Annotate which retention tier is most teams' default.` |
| file-version-management-complete-guide | image-6.svg | `...with a why this ch` | `...with a why this changed annotation alongside the timestamp and user.` |
| file-version-management-complete-guide | image-7.svg | `...real coworker's desktop scree` | `...real coworker's desktop screenshot showing the rules immediately ignored — _v2_FINAL_real_REAL.psd.` |

Length distribution of truncated alts: 81-134 chars (no fixed cutoff
→ not a `slice(0, N)` bug; truncation happens during alt authoring,
not during pipeline transform).

## Fix process per article

For each of the 5 source slugs:

1. **Open EN article** `content/english/post/<slug>/index.md`
2. **Grep** `^!\[` to find all body images
3. **For each truncated alt** — examine the surrounding article paragraph + the image filename + (if SVG inline) the SVG title/desc — infer the intended full description
4. **Rewrite alt** in EN: complete sentence, ends with `.` / `?` / `!`, 50-125 chars sweet spot, contains specific entity (product / UI element / number / verb)
5. **Sync to other locales**: each locale's `content/<locale>/post/<slug>/index.md` has its own alt (translation). Same EN fix → translate per locale, NOT verbatim copy.
6. **Re-run audit**: `npm run seo:audit:images` — confirm slug drops out of issue list

## Acceptance

- [ ] All 5 source articles audited + EN alts rewritten as complete sentences
- [ ] All locale variants updated with translated complete alts
- [ ] `npm run seo:audit:images` → `by_kind.alt-likely-truncated = 0`
- [ ] Future articles fail GATE-4 if trap T24 fires (audit script returns exit ≠ 0 OR warning count above threshold)

## Why not fix in this session

Session focus = SEO infrastructure (audit + framework rules). Rewriting
211 alts is a content-quality task that deserves per-image care, not
bulk regex replacement. Audit surfaces problem + BWF trap T24 prevents
recurrence; this tracker queues the manual content work.

## Recommended sequence

Priority order (highest leverage first):

1. `file-version-management-complete-guide` (most affected, 19 locales × ~6 alts)
2. `vibe-coding-rollback` (15 locales × 3)
3. `keeply-getting-started-from-zero` (15 locales × 1-2)
4. `what-keeply-saves-vs-backup-cloud` (14 locales × 1-2)
5. `install-keeply-windows-mac` (8 locales × 1)

Estimated time per article: 30-60 min EN rewrite + 30 min per locale
sync (or batch via translation prompt). Total budget: ~1 full day per
article in worst case (file-version-management-complete-guide).

## Cross-reference

- Audit script: `_dev/seo/audit-images.js`
- npm script: `npm run seo:audit:images` (summary) / `:verbose` (full list)
- BWF trap rule: `~/.claude/bwf/traps.md` T24 — Image alt truncation
- User-level SEO skill: `~/.claude/skills/seo-setup/SKILL.md` (mentions image audit as Tier B1)
