#!/usr/bin/env python3
"""red-team-gate.py — BWF PreToolUse hook (enforces "always run the red-team").

Blocks setting `status: approved` on a BWF spec artifact unless that stage's
red-team verdict field is present in the file. So a touchpoint cannot be
approved without its red-team having run + been recorded.

Stage → required field:
  intent.md            -> intent_red_team:   (Touch 1 INTENT, Lens INTENT)
  keywords.md          -> red_team:          (Touch 1.5 KEYWORDS, Lens A + Lens B)
  angle.md             -> angle_red_team:    (Touch 2 ANGLE, Lens ANGLE)
  skeleton.md          -> skeleton_red_team: (Touch 3 SKELETON, Lens SKELETON)
  final.<locale>.md    -> locale_red_team:   (Touch 4 translation pod, native local-market
                          (non-en only)       red-team — v1.8 2026-05-22; see red-team-brief.md
                                              "Per-locale translation pod")

INSTALL (user only — agent cannot self-modify .claude config):
  1. copy this file into .claude/hooks/  (or keep here and point the command at it)
  2. add to .claude/settings.json via your merge script:

     "hooks": {
       "PreToolUse": [
         { "matcher": "Edit|Write",
           "hooks": [ { "type": "command",
             "command": "python \"$CLAUDE_PROJECT_DIR/apps/blog/_dev/red-team-gate.py\"" } ] }
       ]
     }
  3. reload.

Exit codes: 0 = allow; 2 = block (PreToolUse convention — stderr is fed back to the agent).
Fails OPEN (exit 0) on any parse/IO error so it never wedges normal editing.
"""
import json
import os
import re
import sys

STAGE_FIELD = {
    "intent.md":   "intent_red_team",
    "keywords.md": "red_team",
    "angle.md":    "angle_red_team",
    "skeleton.md": "skeleton_red_team",
}


def main():
    # Read stdin as bytes and decode robustly: the Claude Code harness sends UTF-8,
    # but a manual PowerShell 5.1 pipe sends UTF-16. Try the common encodings so the
    # gate never fails-open just because of an encoding mismatch.
    raw = sys.stdin.buffer.read()
    data = None
    for enc in ("utf-8-sig", "utf-16", "utf-8"):
        try:
            data = json.loads(raw.decode(enc))
            break
        except Exception:
            data = None
    if data is None:
        sys.exit(0)  # fail open only on truly unparseable input

    tool_input = data.get("tool_input", {}) or {}
    path = tool_input.get("file_path", "") or ""
    base = os.path.basename(path)
    field = STAGE_FIELD.get(base)
    if not field:
        # Per-locale translation gate (v1.8, 2026-05-22): a translated final.<locale>.md
        # (non-en) cannot be approved without its native local-market red-team verdict.
        m = re.match(r"^final\.([a-z]{2}(?:-[a-z]{2})?)\.md$", base, re.I)
        if m and m.group(1).lower() != "en":
            field = "locale_red_team"
        else:
            sys.exit(0)  # not a gated BWF artifact

    # Only gate the moment of approval.
    new_text = tool_input.get("content") or tool_input.get("new_string") or ""
    if not re.search(r"status\s*:\s*approved", new_text):
        sys.exit(0)

    # The red-team field must exist either in the new text or already on disk.
    haystack = new_text
    if not re.search(rf"^\s*{field}\s*:", haystack, re.M) and os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as fh:
                haystack += "\n" + fh.read()
        except Exception:
            pass

    if not re.search(rf"^\s*{field}\s*:", haystack, re.M):
        if field == "locale_red_team":
            which = "native local-market translation red-team (per-locale translation pod)"
        else:
            which = f"{base.replace('.md', '').upper()} red-team"
        sys.stderr.write(
            f"[red-team-gate] BLOCKED: approving {base} without a red-team verdict.\n"
            f"Run the {which} (see ~/.claude/bwf/library/red-team-brief.md) and record "
            f"`{field}:` in {base} before setting status: approved.\n"
        )
        sys.exit(2)  # block

    sys.exit(0)


if __name__ == "__main__":
    main()
