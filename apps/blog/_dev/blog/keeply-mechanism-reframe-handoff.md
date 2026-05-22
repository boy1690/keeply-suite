# Keeply mechanism reframe — status + remaining localization debt

> Updated 2026-05-22. Corpus-wide reframe of the **"every save → Keeply versions it"**
> misframing. **DONE across all 6 core locales** (zh-tw, en, zh-cn, it, ja, ko) — gate
> genuine Keeply-misframes = 0. it/ja/ko are PENDING NATIVE REVIEW (produced by subagent
> first-pass + gate/YAML verification). What remains below is *separate* localization debt.

## The correct framing (canonical)

Keeply captures a version via:
1. **Manual** — click "save version" + write a note (**primary**). In-Keeply-window Cmd+S/Ctrl+S also quick-saves.
2. **Opt-in interval auto-save** — 15 / 30 / 60 min, polling (NOT OS file-watch), **default off** (**secondary**).

It does **not** hook your editor's (Word/Photoshop/Excel) Cmd+S, and does **not** make a version on *every* save.
Per-locale UI terms: en "Save a version"/"Auto-save"; zh-tw「儲存版本」/「自動儲存」; zh-cn「保存版本」/「后台自动保存」;
it "salvare una versione"/"salvataggio automatico"; ja「バージョンを保存」/「自動保存」; ko「버전 저장」/「자동 저장」.

## Gate

`cd apps/blog && python _dev/blog/keeply-mechanism-audit.py [--slug X]`
Corpus HIGH = 12, ALL accounted for (none are genuine misframes):
- it (5) + ko (1) = LEAVE-cases: founder config-musings (keeply-first-week L80/L123), student-overwrite-habit (thesis L129), competitor/negation lines (windows L69/L92).
- en (1): windows-file-history-wrong-version L69 — false-positive ("it doesn't fire on every Cmd+S").
- zh-cn (5): photoshop L125 + why-i-built L19 false-positives; getting-started L43/L46 + restore-without-panic L24 = Traditional-Chinese Mock-UI/faq leaks (see below).

## Done (committed, this effort)

- `eeaacacf`/`138a70a4` etc — zh-tw masters
- `877b3d8d` — en (framing + translated 8 leaked faq/howto blocks)  [pushed]
- `58c03bf8` — zh-cn
- `dc279ee8` — it (subagent + verified)        [PENDING NATIVE REVIEW]
- `d0bad68d` — ja (subagent + verified)        [PENDING NATIVE REVIEW]
- `9fbe4b60` — ko (subagent + verified)        [PENDING NATIVE REVIEW]

## REMAINING — localization debt (NOT framing; gate does not flag it)

Whole `faq_schema` / `howto_schema` blocks never translated out of Traditional Chinese
(no per-save framing inside, so the mechanism gate is silent). Translate from the
corrected en master, then native-review:

| slug | locales with leaked Chinese block |
|------|-----------------------------------|
| 3-2-1-backup-rule | ja, ko (faq) |
| dropbox-conflicted-copy | it, ja, ko (faq) |
| install-keeply-windows-mac | ja, ko (howto) |
| keeply-first-week-workflow | ja, ko (howto) |
| version-control-software-non-developer | ja, ko (faq) |
| vibe-coding-rollback | ja, ko (howto) |
| file-version-management-complete-guide | ko (faq); **en master also leaked** |
| departing-employee-data-risk | ko (1 line) |

Also: ja `excel-overwrite-postmortem` / `excel-data-vanished-postmortem` bodies use the
zh UI term「儲存版本」instead of ja「バージョンを保存」(UI-term leak). And zh-cn
getting-started L43/L46 + restore-without-panic L24 carry Traditional-Chinese Mock-UI/faq
text (translate to Simplified).

To find them: `python _dev/blog/keeply-mechanism-audit.py` will NOT catch these (no
quantifier). Detect with a Han-scan: ko = lines with ≥4 Han chars; ja = Han-heavy lines
with no kana. Both should be 0 in a fully-localized file.
