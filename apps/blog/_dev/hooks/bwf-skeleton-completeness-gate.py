#!/usr/bin/env python3
"""bwf-skeleton-completeness-gate.py — BWF PreToolUse hook (content-completeness gate).

COMPLEMENTS red-team-gate.py (do not merge): red-team-gate enforces that the
*red-team ran* (verdict field present at approval). THIS gate enforces that the
skeleton's *content* carries the BWF house markers that keep getting skipped —
the ones with documented ship incidents.

Pattern borrowed from aaron-he-zhu/seo-geo-claude-skills hooks/claude-hook.sh
"Artifact Gate" (block decision on a structurally-incomplete artifact), adapted
to BWF skeleton.md and tuned against the live corpus so it never false-positives.

WHAT IT BLOCKS (exit 2) — only the one check proven safe on 24 approved skeletons:
  * skeleton.md set to `status: approved` that HAS an FAQ section but the FAQ
    section never mentions "Keeply".
    -> incident: excel-overwrite-postmortem v1 shipped a 5-Q FAQ all
       Microsoft/Apple, no Keeply protagonist Q (memory:
       feedback_faq_keeply_presence_required). Corpus check: every skeleton that
       has an FAQ already names Keeply in it, so this fires ONLY on the regression.

WHAT IT WARNS (exit 0, message to stderr — never wedges editing):
  * no admit-limitation marker (P1.14)            -> 6/24 corpus skeletons lack it
  * 1500+char-class article with no body-image plan (P1.26)

Only fires at the moment of approval (content contains `status: approved`), like
red-team-gate.py. Fails OPEN (exit 0) on any parse/IO error.

INSTALL (user only — agent cannot self-modify .claude config):
  Add a command to the existing PreToolUse "Edit|Write" block in
  .claude/settings.json (alongside red-team-gate.py), then reload:

     { "type": "command",
       "command": "python \"$CLAUDE_PROJECT_DIR/apps/blog/_dev/hooks/bwf-skeleton-completeness-gate.py\"" }

Exit codes: 0 = allow (incl. warnings); 2 = block.
"""
import json
import os
import re
import sys


def load_stdin():
    raw = sys.stdin.buffer.read()
    for enc in ("utf-8-sig", "utf-16", "utf-8"):
        try:
            return json.loads(raw.decode(enc))
        except Exception:
            continue
    return None


def main():
    data = load_stdin()
    if data is None:
        sys.exit(0)  # fail open on unparseable input

    tin = data.get("tool_input", {}) or {}
    path = tin.get("file_path", "") or ""
    if os.path.basename(path) != "skeleton.md":
        sys.exit(0)  # only gate skeleton.md

    new_text = tin.get("content") or tin.get("new_string") or ""
    if not re.search(r"status\s*:\s*approved", new_text):
        sys.exit(0)  # only gate the moment of approval

    # Build the full picture: an Edit may only carry the changed hunk, so fold in
    # the on-disk file (same trick red-team-gate.py uses).
    hay = new_text
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as fh:
                hay += "\n" + fh.read()
        except Exception:
            pass

    # ---- BLOCKING check: FAQ present but no Keeply protagonist ----
    faq = re.search(r"^#{2,3}.*(常見問題|FAQ|よくある|자주|frequently asked)",
                    hay, re.M | re.I)
    if faq:
        region = hay[faq.end(): faq.end() + 3000]
        if "keeply" not in region.lower():
            sys.stderr.write(
                "[skeleton-gate] BLOCKED: approving skeleton.md whose FAQ section "
                "has no Keeply protagonist Q.\n"
                "BWF rule (feedback_faq_keeply_presence_required): a cluster FAQ "
                "must carry >=1 Keeply-as-protagonist question (place it first — "
                "AEO chunks pull the top Q). Add it, then set status: approved.\n"
            )
            sys.exit(2)

    # ---- NON-BLOCKING warnings (stderr is surfaced; exit 0 never wedges) ----
    warn = []
    if not re.search(r"P1\.14|admit.?limitation|不取代|不解決|Keeply 不|isn'?t the right",
                     hay, re.I):
        warn.append("no admit-limitation marker (P1.14) — each cluster article "
                    "needs >=1 explicit 'Keeply doesn't solve X' line.")
    # body-image plan: only nudge when this looks like a full cluster article
    is_release = re.search(r"article_type\s*:\s*release-notes|skip_touch_5\s*:\s*true", hay)
    if not is_release and not re.search(r"body_images\s*:|\{\{IMAGE", hay):
        warn.append("no body-image plan (P1.26) — 1500+char articles need a "
                    "body_images: block / {{IMAGE}} placeholders.")
    if warn:
        sys.stderr.write("[skeleton-gate] OK (allowed) — observations:\n  - "
                         + "\n  - ".join(warn) + "\n")

    sys.exit(0)


if __name__ == "__main__":
    main()
