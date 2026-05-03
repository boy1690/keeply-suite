# Locale Investment Review — 2026-W18 (2026-05-03)

> First cycle of locale-tier classification per `~/.claude/bwf/library/locale-investment-tiers.md`.
> Establishes baseline; future cycles compare against this.

**Cycle**: 1 (baseline)
**Window**: rollout day 2026-05-03 — last 7 days of GSC + GA4 data
**Source**: SEO weekly Issue #6 (`gh issue view 6 --repo boy1690/keeply-blog`)
**Next review**: 2026-05-17 (auto-scheduled via routine `trig_011eiu5AkU9Y13yx1ZvRmgpw`)

---

## Per-locale tier classification

| Locale | Tier | Last cycle | This cycle's signal (7d) | Action |
|---|---|---|---|---|
| **en** | T3 (core, default) | — | 1 GSC click + 18 imp main, ~22 GA4 sessions blog | Hold |
| **zh-TW** | T3 (core, default) | — | 27+ GA4 sessions across 4 pages — strongest non-en locale | Hold; strong baseline |
| **zh-CN** | T3 (core, default) | — | 1 GA4 session, no GSC traction | Hold; under-indexed, monitor |
| **ja** | T3 (core, default) | — | Not in top-pages report | Hold; no signal yet |
| **ko** | T3 (core, default) | — | Not in top-pages report | Hold; no signal yet |
| **it** | **T3** ⬆️ | T1 (default) | **4 GSC impressions** on `/it/post/file-version-management-complete-guide/` + native query "cronologia versioni" pos 10 (3 impressions) | **PROMOTED T1 → T3 (manual override)** via strong-signal override criterion (native top-10 query + multi-impression content). User decision 2026-05-03. See updated framework section §2. |
| pl | T1 | — | 1 GSC impression (single point = noise) | Hold |
| da | T1 | — | 1 GSC impression on `/da/privacy.html` (legal page, not content) | Hold |
| de | T1 | — | 1 GSC impression on `/de/` homepage | Hold; no content traction |
| es, fr, pt, nl, tr, vi, th, id, ar, hi, ru | T1 | — | 0 GSC impressions, 0 GA4 sessions | Hold; baseline working as designed |

---

## Promotions executed this cycle

**1 promotion via strong-signal override (manual)**:

- **`it` (Italian): T1 → core T3** — manual override using newly-added strong-signal criterion (native-language top-10 GSC query + multi-impression auto-translated content). User decision 2026-05-03 to invest in Italian as a 6th core locale alongside en/zh-tw/zh-cn/ja/ko. Backfill of 9 existing articles' Italian polish queued as separate task; new articles from this point ship with full it human-quality from launch.

This is the first ever strong-signal-override promotion. Memory `project_locale_core_5.md` updated to reflect 6 cores. CLAUDE.md updated for 6-locale parity check + URL matrix expansion. BWF framework `locale-investment-tiers.md` updated with override criterion documented for future cycles.

---

## Article-level signals worth noting

- **`/zh-tw/post/install-keeply-windows-mac/` — 17 GA4 sessions / 20 page views in 7 days** ── single highest-traffic post. This is "support content" demand (existing users finding install instructions), not new acquisition. Suggests creating more zh-TW how-to / install / setup-help content.
- **`/it/post/file-version-management-complete-guide/`** ── only auto-translated locale article with multi-impression GSC traction. The matching native query "in google docs, a cosa serve cronologia versioni?" at position 10 indicates real Italian search demand for this concept. Worth watching closely.
- **`/buy.html` getting 2 sessions** out of only 14 main-site sessions = 14% buy-page reach rate. Sample too small for conclusions but worth monitoring as conversion-funnel KPI.
- **No GSC impressions yet for** ja/ko despite being T3 cores ── may be Yandex/Naver index lag, not a tier issue. Re-evaluate at 2026-05-17 cycle.

---

## Next-cycle watch list

Locales 1 cycle away from promotion (need to confirm signal in next review):

- **it** — if 30d cumulative GSC impressions ≥ 30 OR ≥ 1 click → promote T1 → T2

Articles to monitor:
- `/it/post/file-version-management-complete-guide/` — Italian
- `/zh-tw/post/install-keeply-windows-mac/` — even though core, this is the strongest non-English performer; consider if cluster expansion warranted

---

## Decisions feeding back into BWF Touch 1 INTENT

**Next 2 weeks (until 2026-05-17 cycle)**:

✅ DO:
- Continue planned BWF article cadence (write-on-completion per `feedback_publish_cadence_ship_on_completion.md`)
- **NEW articles**: ship in 6 locales now (en/zh-tw/zh-cn/ja/ko/it). Italian gets human-quality from launch, not auto-translated.
- Prioritise English content (Western market is where signal currently centres)
- If a how-to article fits the roadmap, give it precedence (zh-TW signal validates this format)
- **Italian backfill**: 9 existing articles need Italian human polish (priority: file-version-management-complete-guide first, since it's the one already getting impressions)

⏸ HOLD:
- Do NOT pre-emptively rewrite any other auto-translated locale content. Wait for sustained signal.
- Do NOT add new locales beyond current 19. Capacity should focus on graduating existing locales up the tier ladder, not horizontal expansion.

❌ DO NOT:
- Spend human-rewrite hours on de/fr/es/pt/nl/tr/vi/th/id/ar/hi/ru content this cycle. Zero traction = zero ROI of human polish.
- Demote any locale yet — too early. Demotion criterion is 90 days zero impressions, we're at 7 days.

---

## Cycle sanity check

**Was this baseline cycle even meaningful?**
- 7 days of data on a brand-new SEO infrastructure (rollout 2026-05-02→03)
- Total clicks across both properties: 4
- Total GA4 sessions: 59 (blog 45 + main 14)
- Most traffic likely founder + immediate circle, not real organic acquisition

**Conclusion**: cycle 1 is a **baseline anchor**, not a decision-making cycle. Real classification work begins cycle 2 (2026-05-17) when we have something to compare against.
