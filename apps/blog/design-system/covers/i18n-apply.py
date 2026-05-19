#!/usr/bin/env python3
"""
Keeply Cover Kit · i18n applicator

從 zh-TW cover.svg 當模板，套 i18n.json 的各語言字串，
批次產出每個 locale 的 cover.svg。也會確保 index.md front-matter
有 image / og_image 兩欄位。

Usage:
    python design-system/covers/i18n-apply.py              # 所有 locale
    python design-system/covers/i18n-apply.py --slug {slug}  # 單篇
"""

from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
KIT = ROOT / "design-system" / "covers"
CONTENT = ROOT / "content"

# Hugo contentDir for English 特例
LOCALE_DIR = {"en": "english"}


def load_i18n() -> dict:
    """讀 i18n.json 並濾掉 _schema/_fields 等 metadata key。"""
    data = json.loads((KIT / "i18n.json").read_text(encoding="utf-8"))
    return {k: v for k, v in data.items() if not k.startswith("_")}


def build_svg(template: str, loc: dict) -> str:
    """對 zh-TW 模板做所有替換，回傳新 SVG 字串。"""
    orig = load_i18n()["zh-tw"]
    out = template

    # font-family
    out = out.replace(
        f'font-family="{orig["font"]}"',
        f'font-family="{loc["font"]}"',
    )
    # comment header
    out = out.replace(
        "Cover: 共用資料夾的檔案版本問題（zh-TW）",
        "Cover: hidden-cost-shared-folders",
    )
    # eyebrow
    out = out.replace(f">{orig['eyebrow']}<", f">{loc['eyebrow']}<")
    # label_big
    out = out.replace(f">{orig['label_big']}<", f">{loc['label_big']}<")
    # label_small
    out = out.replace(f">{orig['label_small']}<", f">{loc['label_small']}<")
    # subtitle 1（純文字行）
    out = out.replace(f">{orig['subtitle_1']}<", f">{loc['subtitle_1']}<")
    # subtitle 2（含 amber tspan）
    # 原：每天繳的<tspan fill="#F59E0B">微型恐慌稅</tspan>
    orig_amber = orig["amber_highlight"]
    orig_plain = orig["subtitle_2"].replace(orig_amber, "")  # 去掉琥珀詞的前綴部分
    loc_amber = loc["amber_highlight"]
    if loc_amber not in loc["subtitle_2"]:
        raise ValueError(
            f"amber_highlight '{loc_amber}' 不在 subtitle_2 '{loc['subtitle_2']}'"
        )
    loc_plain = loc["subtitle_2"].replace(loc_amber, "")
    out = out.replace(
        f">{orig_plain}<tspan fill=\"#F59E0B\">{orig_amber}</tspan>",
        f">{loc_plain}<tspan fill=\"#F59E0B\">{loc_amber}</tspan>",
    )
    # filename warn
    out = out.replace(
        f"Floorplan_v7_FINAL_{orig['filename_warn']}.dwg",
        f"Floorplan_v7_FINAL_{loc['filename_warn']}.dwg",
    )
    # bottom note
    out = out.replace(f">{orig['bottom_note']}<", f">{loc['bottom_note']}<")

    return out


def ensure_frontmatter(index_path: Path) -> None:
    """確保 index.md front-matter 有 image / og_image 欄位。"""
    text = index_path.read_text(encoding="utf-8")
    changed = False
    if "image: cover.svg" not in text:
        text = re.sub(
            r"(slug:.*?\ndate:.*?\n)",
            r"\1image: cover.svg\n",
            text,
            count=1,
            flags=re.DOTALL,
        )
        changed = True
    if "og_image: cover.png" not in text:
        text = re.sub(
            r"(image: cover\.svg\n)",
            r"\1og_image: cover.png\n",
            text,
            count=1,
        )
        changed = True
    if changed:
        index_path.write_text(text, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", default="hidden-cost-shared-folders")
    args = parser.parse_args()
    slug = args.slug

    i18n = load_i18n()
    tpl_path = CONTENT / "zh-tw" / "post" / slug / "cover.svg"
    if not tpl_path.exists():
        print(f"ERROR: template not found: {tpl_path}")
        return 1
    template = tpl_path.read_text(encoding="utf-8")

    # RTL 語言手動維護鏡像版面，不由本腳本覆寫
    RTL_MANUAL = {"ar"}

    generated: list[str] = []
    skipped: list[str] = []
    for locale, loc in i18n.items():
        if locale == "zh-tw":
            continue  # 模板本身不需產
        if locale in RTL_MANUAL:
            skipped.append(f"{locale} (RTL — 手動維護)")
            continue
        loc_dir = LOCALE_DIR.get(locale, locale)
        post_dir = CONTENT / loc_dir / "post" / slug
        if not post_dir.exists():
            skipped.append(f"{locale} (no content dir)")
            continue
        svg_path = post_dir / "cover.svg"
        svg_path.write_text(build_svg(template, loc), encoding="utf-8")
        index_md = post_dir / "index.md"
        if index_md.exists():
            ensure_frontmatter(index_md)
        generated.append(locale)

    print(f"Generated: {len(generated)} → {', '.join(generated)}")
    if skipped:
        print(f"Skipped: {', '.join(skipped)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
