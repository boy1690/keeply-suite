#!/usr/bin/env python3
"""
BWF translation safety linter.

掃描 source English 草稿是否有翻譯不安全的片語：
運動比喻、美國流行文化、慣用語、puns、US units。

用法：
    python translation_safety.py specs/{slug}/draft.en.md

Exit 0 = 乾淨；Exit 1 = 有命中。

設計原則（Harness Engineering）：
    這是**source 寫作**時就該過的 gate，不是翻譯時才想。
    在這裡攔下一個 idiom，省 19 次 locale 翻譯麻煩。
"""

import json
import re
import sys
from pathlib import Path


SPORTS_METAPHORS = [
    r"\bhome\s+run\b", r"\bslam\s+dunk\b",
    r"\bout\s+of\s+the\s+park\b", r"\bknock(ing|ed)?\s+it\s+out\b",
    r"\bsticky\s+wicket\b", r"\bsweet\s+spot\b",
    r"\bin\s+the\s+ballpark\b", r"\bballpark\s+(figure|estimate|number)\b",
    r"\blevel\s+playing\s+field\b", r"\bdrop\s+the\s+ball\b",
    r"\bmonday\s+morning\s+quarterback\b",
    r"\bhail\s+mary\b", r"\bend\s+zone\b", r"\bfull-?court\s+press\b",
    r"\bpar\s+for\s+the\s+course\b", r"\bhole\s+in\s+one\b",
    r"\bmove\s+the\s+goalposts\b",
]

POP_CULTURE = [
    r"\bgroundhog\s+day\b", r"\bseinfeld\b", r"\bsimpsons\b",
    r"\bchef'?s\s+kiss\b", r"\bmain\s+character\b",
    r"\bjumping\s+the\s+shark\b", r"\bblack\s+mirror\b",
    r"\bharry\s+potter\b", r"\bmatrix\s+(red|blue)\s+pill\b",
    r"\bstar\s+wars\b", r"\bgame\s+of\s+thrones\b",
    r"\bkardashian\b", r"\btaylor\s+swift\b",
]

IDIOMS = [
    r"\bkick\s+the\s+bucket\b",
    r"\blow-?hanging\s+fruit\b",
    r"\bmove\s+the\s+needle\b",
    r"\bbite\s+the\s+bullet\b",
    r"\bthe\s+ball'?s\s+in\s+your\s+court\b",
    r"\bhit\s+the\s+ground\s+running\b",
    r"\bback\s+to\s+the\s+drawing\s+board\b",
    r"\btouch\s+base\b",
    r"\bcircle\s+back\b",
    r"\bon\s+the\s+same\s+page\b",
    r"\bthink\s+outside\s+the\s+box\b",
    r"\bboil\s+the\s+ocean\b",
    r"\bpush\s+the\s+envelope\b",
    r"\bmove\s+mountains\b",
    r"\bbarking\s+up\s+the\s+wrong\s+tree\b",
    r"\bsilver\s+bullet\b",
    r"\bthe\s+whole\s+nine\s+yards\b",
    r"\brabbit\s+hole\b",
    r"\bcan\s+of\s+worms\b",
    r"\belephant\s+in\s+the\s+room\b",
    r"\bcut\s+to\s+the\s+chase\b",
    r"\bat\s+the\s+drop\s+of\s+a\s+hat\b",
    r"\bbreak\s+the\s+ice\b",
    r"\bonce\s+in\s+a\s+blue\s+moon\b",
]

US_UNITS = [
    (r"\b(\d+(?:\.\d+)?)\s*(feet|foot|ft)\b", "feet → meters"),
    (r"\b(\d+(?:\.\d+)?)\s*(inches?|in)\b", "inches → cm"),
    (r"\b(\d+(?:\.\d+)?)\s*(miles?|mi)\b", "miles → km"),
    (r"\b(\d+(?:\.\d+)?)\s*(pounds?|lbs?)\b", "pounds → kg"),
    (r"\b(\d+(?:\.\d+)?)\s*(ounces?|oz)\b", "ounces → g"),
    (r"\b(\d+(?:\.\d+)?)\s*°F\b", "°F → °C"),
    (r"\b(\d+(?:\.\d+)?)\s*(gallons?|gal)\b", "gallons → liters"),
]

CATEGORIES = [
    ("sports_metaphor", SPORTS_METAPHORS),
    ("pop_culture", POP_CULTURE),
    ("idiom", IDIOMS),
]


def extract_body(text: str) -> str:
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

    for category, patterns in CATEGORIES:
        for pat in patterns:
            for m in re.finditer(pat, text, re.IGNORECASE):
                line_no = text[: m.start()].count("\n") + 1
                hits.append({
                    "type": category,
                    "match": m.group(),
                    "line": line_no,
                    "suggest": "rewrite literally",
                })

    for pat, hint in US_UNITS:
        for m in re.finditer(pat, text, re.IGNORECASE):
            line_no = text[: m.start()].count("\n") + 1
            hits.append({
                "type": "us_unit",
                "match": m.group(),
                "line": line_no,
                "suggest": f"add SI equivalent: {hint}",
            })

    return hits


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: translation_safety.py <markdown>", file=sys.stderr)
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
