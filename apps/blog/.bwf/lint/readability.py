#!/usr/bin/env python3
"""
BWF readability gate.

計算 Flesch Reading Ease，檢查 P1.8 門檻（≥60 一般 / ≥50 technical）。
同時輸出平均句長、最長句、passive voice 粗估。

用法：
    python readability.py specs/{slug}/draft.en.md
    python readability.py draft.en.md --technical

Exit 0 = pass；Exit 1 = fail。
"""

import json
import re
import sys
from pathlib import Path


VOWELS = "aeiouy"


def extract_body(text: str) -> str:
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2]
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`]+`", "", text)
    text = re.sub(r"^#+\s.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def count_syllables(word: str) -> int:
    """粗略音節計算：連續母音算一個，結尾 'e' 不算。最小 1。"""
    word = word.lower().strip("'\".,;:!?()[]{}")
    if not word:
        return 0
    count = 0
    prev_vowel = False
    for ch in word:
        is_vowel = ch in VOWELS
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def split_sentences(text: str) -> list[str]:
    sents = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", text.strip())
    return [s.strip() for s in sents if s.strip()]


def flesch_reading_ease(text: str) -> dict:
    sentences = split_sentences(text)
    words = re.findall(r"\b[A-Za-z']+\b", text)

    if not sentences or not words:
        return {"fre": None, "reason": "not enough content"}

    syllable_total = sum(count_syllables(w) for w in words)
    avg_sent_len = len(words) / len(sentences)
    avg_syll_per_word = syllable_total / len(words)

    fre = 206.835 - 1.015 * avg_sent_len - 84.6 * avg_syll_per_word

    sent_lens = [len(re.findall(r"\b\w+\b", s)) for s in sentences]
    longest = max(sent_lens) if sent_lens else 0

    passive_hits = len(re.findall(
        r"\b(is|was|were|are|been|being|be)\s+(\w+ed|\w+en)\b",
        text,
        re.IGNORECASE,
    ))
    passive_pct = passive_hits / len(sentences) * 100

    return {
        "fre": round(fre, 1),
        "avg_sentence_length": round(avg_sent_len, 1),
        "longest_sentence_words": longest,
        "avg_syllables_per_word": round(avg_syll_per_word, 2),
        "sentence_count": len(sentences),
        "word_count": len(words),
        "passive_voice_estimate_pct": round(passive_pct, 1),
    }


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("usage: readability.py <markdown> [--technical]", file=sys.stderr)
        return 2
    technical = "--technical" in args
    paths = [a for a in args if not a.startswith("--")]
    if not paths:
        print("no markdown path given", file=sys.stderr)
        return 2
    path = Path(paths[0])
    if not path.exists():
        print(f"file not found: {path}", file=sys.stderr)
        return 2

    body = extract_body(path.read_text(encoding="utf-8"))
    stats = flesch_reading_ease(body)

    threshold = 50 if technical else 60
    passed = stats.get("fre") is not None and stats["fre"] >= threshold

    out = {
        "file": str(path),
        "mode": "technical" if technical else "general",
        "fre_threshold": threshold,
        "passed": passed,
        "stats": stats,
    }
    print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
