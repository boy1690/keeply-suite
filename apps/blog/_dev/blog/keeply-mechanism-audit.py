#!/usr/bin/env python3
"""Keeply capture-mechanism audit — flag the "every save / per Cmd+S -> Keeply versions it"
framing that misrepresents the product.

Verified mechanism (D:/tools/doing/Keeply src + specs 048/236):
  Keeply captures versions via (a) MANUAL "save version" + note, (b) opt-in INTERVAL
  auto-save (15/30/60 min, default OFF, polling — NOT real-time), (c) an in-Keeply-window
  Cmd+S/Ctrl+S quick-save. It does NOT hook your editor's (Photoshop/Word) Cmd+S, and it
  does NOT make a version on *every* save. So any "every Cmd+S / each save -> Keeply keeps
  a version" wording is WRONG.

This lint flags lines carrying an EVERY/PER quantifier on a save action. It splits:
  HIGH   = quantifier + Keeply/version-capture on the same line (the wrong framing)
  REVIEW = quantifier present but no capture verb (often a legit editor-save mention,
           e.g. "you hit Cmd+S to overwrite" — eyeball it)

The in-Keeply quick-save ("press Cmd+S in Keeply to quick-save") is NOT flagged: it has
no every/per quantifier, which is the discriminator.

Usage:
    python keeply-mechanism-audit.py [--content-dir ./content] [--slug X] [--strict]
Exit 0 = no HIGH findings. Exit 1 = HIGH found (or any, with --strict).
"""
import argparse
import hashlib
import re
import sys
from pathlib import Path

# Default allowlist: HIGH findings accepted as non-bugs (LEAVE-cases, false-positives,
# and known localization debt queued for the translation flow). A finding is
# allowlisted by a content signature so it survives line-number shifts but a NEW /
# changed misframe is NOT masked. Regenerate with --update-allowlist.
DEFAULT_ALLOWLIST = Path(__file__).with_name("keeply-mechanism-allowlist.txt")


def _sig(locale: str, slug: str, line: str) -> str:
    """Stable signature for an allowlist entry — locale+slug+normalized line text."""
    norm = " ".join(line.split())
    return hashlib.sha1(f"{locale}|{slug}|{norm}".encode("utf-8")).hexdigest()


def load_allowlist(path: Path) -> set:
    if not path or not path.exists():
        return set()
    sigs = set()
    for ln in path.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if ln and not ln.startswith("#"):
            sigs.add(ln.split()[0])
    return sigs

# EVERY / PER-save quantifier on a save action (multilingual). This is the trigger.
QUANT = re.compile(
    r"每次\s*(?:Cmd|Ctrl)\+S"
    r"|每[一]?次存檔|每[一]?次儲存|每[一]?次保存"
    r"|記錄每一次|记录每一次|自動記錄每次|自动记录每次"
    r"|每次故意(?:存檔|保存|存)"
    r"|把每次\s*(?:Cmd|Ctrl)\+S\s*都當|把每次\s*(?:Cmd|Ctrl)\+S\s*都当"
    r"|every\s+Cmd\+S|each\s+time\s+you\s+Cmd\+S|records?\s+every\s+save"
    r"|no\s+save\s+interval\s+to\s+configure|watching\s+every\s+Cmd\+S"
    r"|(?:Cmd|Ctrl)\+S\s*の(?:たび|ごと)|毎回の保存"
    r"|(?:Cmd|Ctrl)\+S\s*마다|매번.{0,6}저장"
    r"|ogni\s+Cmd\+S|ogni\s+salvataggio",
    re.IGNORECASE,
)

# Keeply / version-capture context → upgrades a quantifier hit to HIGH.
CAPTURE = re.compile(
    r"Keeply|版本歷史|版本历史|version\s+history"
    r"|另存|存一版|存一個版|保存一版|留(?:一|下)?版|存版本|存成版本|記錄|记录|抓"
    r"|preserve|capture|records?\b|snapshot"
    r"|バージョン|スナップ|記録"
    r"|버전|기록"
    r"|versione|registra",
    re.IGNORECASE,
)

# Competitor / other-tool context. "every save -> a version" is TRUE for these
# (OneDrive/SharePoint/Dropbox/iCloud cloud version history, Time Machine), so a
# line describing THEM (and not Keeply) is legit, not the misframing we hunt.
COMPETITOR = re.compile(
    r"OneDrive|SharePoint|Dropbox|Time\s*Machine|iCloud|Google\s*(?:Drive|Docs)"
    r"|Creative\s*Cloud|Version\s*History\b",
    re.IGNORECASE,
)
KEEPLY = re.compile(r"Keeply", re.IGNORECASE)

CODE_FENCE = re.compile(r"^\s*```")


def audit(text: str):
    """Return (high, review) lists of (line_no, line)."""
    high, review = [], []
    in_code = False
    for i, raw in enumerate(text.splitlines(), 1):
        if CODE_FENCE.match(raw):
            in_code = not in_code
            continue
        if in_code:
            continue
        if not QUANT.search(raw):
            continue
        if not CAPTURE.search(raw):
            review.append((i, raw.strip()))
            continue
        # Legit: line describes a competitor's per-save versioning, not Keeply's.
        if COMPETITOR.search(raw) and not KEEPLY.search(raw):
            continue
        high.append((i, raw.strip()))
    return high, review


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--content-dir", default="./content")
    ap.add_argument("--slug", action="append", default=None)
    ap.add_argument("--strict", action="store_true", help="exit 1 on REVIEW lines too")
    ap.add_argument("--allowlist", default=str(DEFAULT_ALLOWLIST),
                    help="file of accepted-finding signatures (default: sibling keeply-mechanism-allowlist.txt)")
    ap.add_argument("--no-allowlist", action="store_true", help="ignore the allowlist (show every HIGH)")
    ap.add_argument("--update-allowlist", action="store_true",
                    help="rewrite the allowlist to exactly the current HIGH findings, then exit 0")
    args = ap.parse_args()

    root = Path(args.content_dir).resolve()
    if not root.exists():
        print(f"mechanism-audit: {root} not found (skipped)."); return 0

    allow = set() if (args.no_allowlist or args.update_allowlist) else load_allowlist(Path(args.allowlist))

    results = {}  # (slug, locale) -> (high, review)
    nblock = naccept = nreview = 0
    accepted_sigs = []  # (sig, locale, slug, line) for --update-allowlist
    for md in sorted(root.glob("*/post/*/index.md")):
        locale, slug = md.parts[-4], md.parts[-2]
        if args.slug and slug not in args.slug:
            continue
        high, review = audit(md.read_text(encoding="utf-8", errors="replace"))
        if high or review:
            results[(slug, locale)] = (high, review)
            nreview += len(review)
            for ln, line in high:
                sig = _sig(locale, slug, line)
                if sig in allow:
                    naccept += 1
                else:
                    nblock += 1
                accepted_sigs.append((sig, locale, slug, line))

    if args.update_allowlist:
        lines = ["# keeply-mechanism allowlist — accepted HIGH findings (LEAVE-cases /",
                 "# false-positives / localization debt). Regenerate: --update-allowlist.",
                 "# format: <sha1>  <locale>/<slug>  <line excerpt>", ""]
        for sig, loc, slug, line in accepted_sigs:
            lines.append(f"{sig}  {loc}/{slug}  {' '.join(line.split())[:70]}")
        Path(args.allowlist).write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"✅ allowlist updated: {len(accepted_sigs)} finding(s) -> {args.allowlist}")
        return 0

    print("=" * 72)
    print("Keeply capture-mechanism audit — 'every save -> Keeply versions it' framing")
    print("=" * 72)
    if not results:
        print("✅ Clean — no per-save/per-Cmd+S Keeply-capture framing found."); return 0

    print(f"\n💥 {nblock} BLOCKING HIGH  +  {naccept} allowlisted  +  {nreview} REVIEW\n")
    by_slug = {}
    for (slug, loc), v in results.items():
        by_slug.setdefault(slug, {})[loc] = v
    for slug in sorted(by_slug, key=lambda s: -sum(len(h) for h, _ in by_slug[s].values())):
        locs = by_slug[slug]
        print(f"### {slug}  (HIGH in: {', '.join(sorted(l for l,(h,_) in locs.items() if h)) or '—'})")
        for loc in sorted(locs):
            high, review = locs[loc]
            for ln, line in high:
                tag = "ok  " if _sig(loc, slug, line) in allow else "HIGH"
                print(f"  [{tag} {loc}] L{ln}: {line[:104]}")
            for ln, line in review:
                print(f"  [rev  {loc}] L{ln}: {line[:104]}")
        print()

    if nblock:
        print("Fix → reframe to: manual 'save version' + note (primary) + opt-in interval")
        print("auto-save 15/30/60 min (secondary). Keeply does NOT version every save.")
        print("(If a flagged line is a genuine LEAVE-case, accept it via --update-allowlist.)")
    else:
        print("✅ No NEW misframing — all HIGH are allowlisted (accepted baseline).")
    return 1 if (nblock or (args.strict and nreview)) else 0


if __name__ == "__main__":
    raise SystemExit(main())
