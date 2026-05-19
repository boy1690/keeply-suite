#!/usr/bin/env python3
"""
BWF AI-tell linter.

掃描草稿是否踩到 banned phrases / banned patterns / Git jargon。
Exit 0 = 乾淨；Exit 1 = 有命中（JSON hits 輸出到 stdout）。

用法：
    python ai_tell.py specs/{slug}/draft.en.md

設計原則（Harness Engineering）：
    寧可 false positive 也不要 false negative。人工覆審成本低，
    漏掉一個 "delve" 造成的品牌傷害大。
"""

import json
import re
import sys
from pathlib import Path


# 單字 / 短片語 banned list（來源：~/.claude/bwf/traps.md T1-T5, T7）
BANNED_PHRASES = [
    # T3 動詞陳腔（零容忍）
    r"\bdelve\b", r"\bdelves?\s+into\b",
    r"\bunlocks?\b", r"\bunleash(es|ed|ing)?\b",
    r"\bsupercharges?\b", r"\bleverage[sd]?\b",
    r"\bharness(es|ed|ing)?\b",
    r"\bfosters?\b", r"\bempower(s|ed|ing|ment)?\b",
    r"\belevates?\b", r"\bstreamlines?\b",
    r"\brevolutioniz(e|es|ed|ing)\b", r"\bredefines?\b",
    r"\btransformative\b", r"\bshowcases?\b", r"\bunderscores?\b",
    r"\bembark\s+on\s+a\s+journey\b",

    # T4 名詞/形容詞陳腔
    r"\btapestry\b", r"\blandscape\s+of\b", r"\brealm\s+of\b",
    r"\bparadigm\b", r"\becosystem\b", r"\bsynergy\b",
    r"\bholistic\b", r"\brobust\b", r"\bseamless(ly)?\b",
    r"\bcutting-?edge\b", r"\bstate-of-the-art\b",
    r"\bgame-?chang(er|ing)\b", r"\btestament\b",
    r"\btreasure\s+trove\b", r"\bnuanced?\b",
    r"\bmultifaceted\b", r"\bmyriad\b", r"\bplethora\b",
    r"\bvibrant\b", r"\bmeticulous(ly)?\b", r"\bintricate(ly)?\b",

    # T1 開場陳腔
    r"\bin\s+today'?s\s+(fast-paced\s+|digital\s+)?(world|age|landscape|era)\b",
    r"\blet'?s\s+(dive\s+in|explore|unpack)\b",
    r"\bpicture\s+this\b",
    r"\bimagine\s+if\b",
    r"\bhave\s+you\s+ever\s+wondered\b",
    r"\bit'?s\s+no\s+secret\s+that\b",
    r"\bgone\s+are\s+the\s+days\b",

    # T2 過渡陳腔
    r"\bmoreover\b", r"\bfurthermore\b",
    r"\bit'?s\s+important\s+to\s+note\b",
    r"\bit'?s\s+worth\s+noting\b",
    r"\bneedless\s+to\s+say\b",

    # T5 收尾陳腔
    r"\bin\s+conclusion\b", r"\bin\s+summary\b", r"\bto\s+sum\s+up\b",
    r"\bat\s+the\s+end\s+of\s+the\s+day\b",
    r"\bthe\s+bottom\s+line\s+is\b",
    r"\bpossibilities\s+are\s+endless\b",
    r"\bwhether\s+you'?re\s+a\s+beginner\s+or\s+an\s+expert\b",

    # T7 Keeply P0.1 — Git jargon 零容忍
    # 注意：commit / branch 這類字有商業合法語意（commitment / branch office），
    # 所以只攔 Git 語境（compound phrase 或動詞用法），不攔單字。
    r"\bgit\s+(commit|branch|rebase|merge|push|pull|checkout|stash|clone|fetch|reset|revert|cherry-?pick|log|diff|blame|bisect)\b",
    r"\bcommit\s+(message|hash|log|history|sha|id|graph|tree)\b",
    r"\b(last|first|previous|initial|latest)\s+commits?\b",
    r"\bcommit(s|ted|ting)?\s+to\s+(main|master|origin|HEAD|a\s+branch|the\s+branch|the\s+repo)\b",
    r"\b(amend|revert|squash|cherry-?pick|push|pull|rebase)\s+(a|the|this|that|my|your|these|those)?\s*commits?\b",
    r"\bbranch(es|ing)?\s+(off|from|into)\b",
    r"\bcreate\s+(a|the|new)?\s*branch\b",
    r"\bfeature\s+branch\b",
    r"\b(master|main|develop|dev|feature|release|hotfix)\s+branch\b",
    r"\brebas(e|es|ed|ing)\s+(onto|against|from|into|branch)\b",
    r"\bmerge\s+conflict\b",
    r"\bmerg(e|es|ed|ing)\s+(a|the|this|that|into|from|main|master|branch)\b",
    r"\bHEAD\b",  # 獨立大寫 HEAD 多是 Git 專用
    r"\bstash(es|ed|ing)?\b",
    r"\bgit\s+checkout\b",
    r"\bchecking?\s+out\s+(a|the|this|that|main|master|branch)\b",
    r"\borigin/\w+\b",
    r"\brepositor(y|ies)\s+(on\s+GitHub|on\s+GitLab|on\s+Bitbucket)?\b",
    r"\bpush(ed|ing)?\s+to\s+(origin|main|master|GitHub|remote|the\s+repo)\b",
    r"\bpull(ed|ing)?\s+from\s+(origin|main|master|GitHub|remote|the\s+repo)\b",
    r"\bdiff(s|ed|ing)?\s+(between|against|of\s+commits?)\b",
]

# 結構性檢查閾值（per 1000 words）
STRUCTURAL = {
    "em_dash_per_1000w_max": 2,
    "not_just_but_per_piece_max": 1,
    "tricolon_per_1000w_max": 1,
}


def extract_body(text: str) -> str:
    """剝掉 Hugo front-matter 和程式碼區塊，只留散文。"""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2]
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`]+`", "", text)
    return text


def lint(md_path: Path) -> list[dict]:
    raw = md_path.read_text(encoding="utf-8")
    text = extract_body(raw)
    hits: list[dict] = []

    for pat in BANNED_PHRASES:
        for m in re.finditer(pat, text, re.IGNORECASE):
            line_no = text[: m.start()].count("\n") + 1
            hits.append({
                "type": "banned_phrase",
                "pattern": pat,
                "match": m.group(),
                "line": line_no,
            })

    words = re.findall(r"\b\w+\b", text)
    word_count = len(words) or 1

    em_count = text.count("—")
    em_per_1000 = em_count * 1000 / word_count
    if em_per_1000 > STRUCTURAL["em_dash_per_1000w_max"]:
        hits.append({
            "type": "structural",
            "rule": "em_dash_density",
            "count": em_count,
            "per_1000": round(em_per_1000, 2),
            "max": STRUCTURAL["em_dash_per_1000w_max"],
        })

    not_just = len(re.findall(r"not\s+just\s+[\w\s,]{1,60}\s+but\b", text, re.IGNORECASE))
    if not_just > STRUCTURAL["not_just_but_per_piece_max"]:
        hits.append({
            "type": "structural",
            "rule": "not_just_but",
            "count": not_just,
            "max": STRUCTURAL["not_just_but_per_piece_max"],
        })

    return hits


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: ai_tell.py <path-to-markdown>", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    if not path.exists():
        print(f"file not found: {path}", file=sys.stderr)
        return 2
    hits = lint(path)
    print(json.dumps({
        "file": str(path),
        "hit_count": len(hits),
        "hits": hits,
    }, indent=2, ensure_ascii=False))
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())
