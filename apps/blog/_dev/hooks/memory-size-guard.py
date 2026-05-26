#!/usr/bin/env python3
"""memory-size-guard.py — PostToolUse hook (memory-index hygiene warning).

Pattern borrowed from aaron-he-zhu/seo-geo-claude-skills hooks/claude-hook.sh
"Hot cache limit warning": after a Write/Edit to the memory index, check its size
and, if over budget, inject a context note telling the model to slim it BEFORE it
silently grows past the point where the harness only loads part of it.

Live trigger (2026-05-22): the keeply-suite MEMORY.md is 30KB vs the 24.4KB harness
limit; the session-start reminder warned "index entries are too long ... Only part
of it was loaded." This hook makes that warning fire at edit time, not just login.

Checks (PostToolUse on Write|Edit), only for a file named MEMORY.md under a
.../memory/ path:
  * total bytes  > WARN_BYTES (default 24000 ~= the 24.4KB ceiling)
  * any single index line > LINE_CHARS (default 200) — the documented per-entry cap

Emits Claude Code additionalContext (hookSpecificOutput) so the note lands in the
model's context. Never blocks (PostToolUse can't), never errors out (fails silent).

INSTALL (user only — agent cannot self-modify .claude config):
  Add to .claude/settings.json (project or ~/.claude global), then reload:

     "hooks": {
       "PostToolUse": [
         { "matcher": "Write|Edit",
           "hooks": [ { "type": "command",
             "command": "python \"$CLAUDE_PROJECT_DIR/apps/blog/_dev/hooks/memory-size-guard.py\"" } ] }
       ]
     }
"""
import json
import os
import sys

WARN_BYTES = int(os.environ.get("MEMORY_WARN_BYTES", "24000"))
LINE_CHARS = int(os.environ.get("MEMORY_LINE_CHARS", "200"))


def emit(msg):
    out = {"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                  "additionalContext": msg}}
    sys.stdout.write(json.dumps(out))


def main():
    raw = sys.stdin.buffer.read()
    data = None
    for enc in ("utf-8-sig", "utf-16", "utf-8"):
        try:
            data = json.loads(raw.decode(enc))
            break
        except Exception:
            data = None
    if data is None:
        sys.exit(0)

    tin = data.get("tool_input", {}) or {}
    path = (tin.get("file_path") or tin.get("path") or "").replace("\\", "/")
    if os.path.basename(path) != "MEMORY.md" or "/memory" not in path.lower():
        sys.exit(0)
    if not os.path.exists(path):
        sys.exit(0)

    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
    except Exception:
        sys.exit(0)

    nbytes = len(text.encode("utf-8"))
    long_lines = [ln for ln in text.splitlines()
                  if len(ln) > LINE_CHARS and ln.lstrip().startswith(("- ", "* ", "["))]

    problems = []
    if nbytes > WARN_BYTES:
        problems.append(
            f"MEMORY.md is {nbytes // 1024}KB (> {WARN_BYTES // 1024}KB budget) — "
            "the harness will load only PART of it next session.")
    if long_lines:
        problems.append(
            f"{len(long_lines)} index line(s) exceed {LINE_CHARS} chars.")

    if problems:
        emit("Memory-index hygiene warning: " + " ".join(problems) +
             " Slim it now: keep each MEMORY.md entry to one line "
             "(`- [Title](file.md) — short hook`) and push detail into the topic "
             "file's body, not the index. Do this before relying on MEMORY.md as "
             "session context.")
    sys.exit(0)


if __name__ == "__main__":
    main()
