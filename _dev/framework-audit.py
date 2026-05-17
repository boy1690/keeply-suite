#!/usr/bin/env python3
"""
全 article × 全 locale audit — 6 層 anti-mechanical framework 違反掃描
產出 markdown table report。
"""

from __future__ import annotations
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

LOCALES = ["zh-tw", "english", "zh-cn", "ja", "ko", "it"]
LOCALE_LABEL = {"english": "en", "zh-tw": "zh-TW", "zh-cn": "zh-CN", "ja": "ja", "ko": "ko", "it": "it"}

# ============ 規則 patterns ============

# P0.8 捏造 founder anecdote
P08_PATTERNS_ZH = [
    r"我訪談過",
    r"我聊過.*?(設計師|工程師|律師|會計|建築師)",
    r"我問過.*?(\d+|幾|N|很多)",
    r"八成讀者",
    r"上百個.*?(設計師|讀者|客戶|工程師)",
    r"幾百次.*?(聊|問|訪)",
    r"我訪問了",
    r"我們(訪談|採訪|統計)",
]
P08_PATTERNS_EN = [
    r"interviewed (hundreds|dozens|over \d+|N+)",
    r"talked to (hundreds|dozens)",
    r"surveyed (hundreds|dozens|\d+)",
    r"based on (interviews|surveys) with",
]
P08_PATTERNS_JA = [
    r"インタビューした.{0,10}(デザイナー|エンジニア|読者)",
    r"何百人もの",
    r"何百回も.{0,8}(聊|訪|問)",
]

# P0.4 OneDrive 500 + 30 天 retention 混淆
P04_ONEDRIVE_MIX_PATTERNS = [
    r"500.{0,10}30\s*天.{0,5}retention",  # zh
    r"500.{0,10}30\s*days.{0,5}retention",  # en
    r"500.{0,10}30\s*日.{0,5}リテンション",  # ja
]

# Directive AI-tell transitions
DIRECTIVE_TRANS_ZH = [
    r"^來看[，,]",  # 「來看，...」
    r"^讓我們先",
    r"值得注意的是",
    r"在繼續之前",
    r"^總而言之",
    r"^綜上所述",
]
DIRECTIVE_TRANS_EN = [
    r"\bFurthermore\b",
    r"\bMoreover\b",
    r"Let'?s dive into",
    r"It is worth noting",
    r"In conclusion,",
]

# Negative parallelism (not-X-but-Y / 不是 X — Y)
NEG_PARALLEL_ZH = r"不是\s*[^，。\n]{1,30}\s*[——]+\s*(它|是|這|那)"
NEG_PARALLEL_EN = r"\bnot\s+[a-zA-Z\s]{1,40}\s*[—–]+\s*(it'?s|but)"

# 中文夾英文 jargon (heading)
CN_EN_JARGON_HEADING = r"^##\s+.*\b(TLDR|FYI|IMO|spoiler|TBD|FAQ)\b"

# 牆段（mobile-unfriendly）
WALL_PARA_CHARS_ZH = 200  # zh paragraph > 200 chars = wall


# ============ Scanner ============


def count_pattern(text: str, patterns: list[str]) -> int:
    """Count total hits across all patterns."""
    total = 0
    for p in patterns:
        total += len(re.findall(p, text, re.MULTILINE))
    return total


def count_emdash(text: str) -> tuple[int, float]:
    """Em-dash count + density per 1000 zh-chars (or words for en)."""
    em_count = text.count("——") + text.count("—")  # 中文雙破折號 + 單破折號
    # 估字數
    char_count = len([c for c in text if "一" <= c <= "鿿"])
    if char_count == 0:
        # en mode: estimate by word
        words = len(text.split())
        density = em_count / max(words, 1) * 1000
    else:
        density = em_count / max(char_count, 1) * 1000
    return em_count, round(density, 1)


def count_walls(text: str, threshold: int) -> int:
    """Count paragraphs > threshold chars."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    walls = 0
    for p in paragraphs:
        if p.startswith(("---", "#", "|", "-", "*", "<", "```")):
            continue
        char_count = len([c for c in p if "一" <= c <= "鿿"])
        if char_count > threshold:
            walls += 1
    return walls


def audit_file(filepath: Path, locale: str) -> dict:
    """Audit a single content/{locale}/post/{slug}/index.md"""
    text = filepath.read_text(encoding="utf-8")
    result = {"locale": locale}

    # Choose patterns by locale
    if locale in ("zh-tw", "zh-cn"):
        result["P0.8 fabricated"] = count_pattern(text, P08_PATTERNS_ZH)
        result["directive AI-tell"] = count_pattern(text, DIRECTIVE_TRANS_ZH)
        result["neg-parallel"] = len(re.findall(NEG_PARALLEL_ZH, text))
        result["en jargon heading"] = len(re.findall(CN_EN_JARGON_HEADING, text, re.MULTILINE))
        result["walls (>200 chars)"] = count_walls(text, WALL_PARA_CHARS_ZH)
    elif locale == "english":
        result["P0.8 fabricated"] = count_pattern(text, P08_PATTERNS_EN)
        result["directive AI-tell"] = count_pattern(text, DIRECTIVE_TRANS_EN)
        result["neg-parallel"] = len(re.findall(NEG_PARALLEL_EN, text, re.IGNORECASE))
        result["en jargon heading"] = 0  # n/a
        result["walls (>200 chars)"] = 0  # different threshold for en
    elif locale == "ja":
        result["P0.8 fabricated"] = count_pattern(text, P08_PATTERNS_JA)
        result["directive AI-tell"] = 0
        result["neg-parallel"] = 0
        result["en jargon heading"] = 0
        result["walls (>200 chars)"] = 0
    else:
        # ko / it minimal audit
        for k in ("P0.8 fabricated", "directive AI-tell", "neg-parallel", "en jargon heading", "walls (>200 chars)"):
            result[k] = 0

    # P0.4 OneDrive mix (all locales)
    result["P0.4 OneDrive mix"] = count_pattern(text, P04_ONEDRIVE_MIX_PATTERNS)

    # Em-dash density (all locales)
    em_count, em_density = count_emdash(text)
    result["em-dash count"] = em_count
    result["em-dash density"] = em_density

    return result


def main():
    slugs = sorted([d.name for d in (CONTENT / "zh-tw" / "post").iterdir() if d.is_dir()])
    rows = []
    totals = defaultdict(int)
    for slug in slugs:
        for locale in LOCALES:
            filepath = CONTENT / locale / "post" / slug / "index.md"
            if not filepath.exists():
                continue
            audit = audit_file(filepath, locale)
            audit["slug"] = slug
            rows.append(audit)
            for k, v in audit.items():
                if isinstance(v, (int, float)) and k != "em-dash density":
                    totals[k] += v

    # Print summary by slug (aggregated across locales)
    print("\n# Framework Audit — 全 article × locale")
    print("\n## Per-article 違反總和（彙整所有 locale）\n")
    print("| Slug | P0.8 捏造 | P0.4 OD-mix | neg-parallel | directive | en-jargon | walls | em-dash | 最高 em 密度 |")
    print("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    by_slug = defaultdict(lambda: defaultdict(int))
    by_slug_max_em = defaultdict(float)
    for r in rows:
        slug = r["slug"]
        for k in ("P0.8 fabricated", "P0.4 OneDrive mix", "neg-parallel", "directive AI-tell", "en jargon heading", "walls (>200 chars)", "em-dash count"):
            by_slug[slug][k] += r[k]
        by_slug_max_em[slug] = max(by_slug_max_em[slug], r["em-dash density"])
    for slug in slugs:
        d = by_slug[slug]
        em_dense = by_slug_max_em[slug]
        flag_p08 = "❌" if d["P0.8 fabricated"] > 0 else "✅"
        flag_p04 = "❌" if d["P0.4 OneDrive mix"] > 0 else "✅"
        flag_neg = "⚠️" if d["neg-parallel"] > 3 else ("🟡" if d["neg-parallel"] > 0 else "✅")
        flag_dir = "⚠️" if d["directive AI-tell"] > 0 else "✅"
        flag_jrg = "❌" if d["en jargon heading"] > 0 else "✅"
        flag_wall = "🟡" if d["walls (>200 chars)"] > 5 else ("✅" if d["walls (>200 chars)"] == 0 else "·")
        flag_em = "⚠️" if em_dense > 2 else "✅"
        print(f"| `{slug}` | {flag_p08} {d['P0.8 fabricated']} | {flag_p04} {d['P0.4 OneDrive mix']} | {flag_neg} {d['neg-parallel']} | {flag_dir} {d['directive AI-tell']} | {flag_jrg} {d['en jargon heading']} | {flag_wall} {d['walls (>200 chars)']} | {d['em-dash count']} | {flag_em} {em_dense} |")

    print("\n## 全站總和")
    for k in ("P0.8 fabricated", "P0.4 OneDrive mix", "neg-parallel", "directive AI-tell", "en jargon heading", "walls (>200 chars)", "em-dash count"):
        print(f"- {k}: **{totals[k]}**")

    print("\n## 圖例")
    print("- ✅ 0 命中 / 合規")
    print("- 🟡 floor edge（少量、需審）")
    print("- ⚠️ 警告（超過建議配額）")
    print("- ❌ P0 紅線（必修）")


if __name__ == "__main__":
    main()
