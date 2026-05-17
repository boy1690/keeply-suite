#!/usr/bin/env python3
"""
Hoot K-Logo Compositor

Composite the Keeply K logo SVG overlay onto Gemini-generated Hoot poses.

Why: Gemini Nano Banana cannot reliably render consistent text/letterforms
across multiple panels. K letters drift, mirror, or disappear between
generations. The production pattern (used by Stripe / Slack / Linear / every
real brand) is to keep the LOGO as a vector layer that composites on top
of generated illustrations — never paint logos into the AI output itself.

Pipeline:
  1. Gemini generates owl + hat + expression (no K requested)
  2. This script detects the gold hat band position by color matching
  3. K-logo SVG is rendered to transparent PNG via headless Chrome
  4. K is composited at hat-band center with configured size

Usage:
  python compose-k.py <input-sheet.png> [--k-size 70]
  python compose-k.py path/to/single-mood.png

Inputs:
  - k-logo.svg   (in same directory, the K source)
  - source image with Hoot character(s) on light bg + gold hat band visible

Output:
  - Overwrites mood-{name}.png files for 4-panel grids
  - OR saves <input>-with-k.png for single images
"""
import argparse
import subprocess
import sys
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
K_SVG = SCRIPT_DIR / "k-logo.svg"
K_PNG = SCRIPT_DIR / "k-logo.png"

CHROME_CANDIDATES = [
    Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
    Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
]


def render_k_logo_png(size: int = 100) -> Path:
    """Render k-logo.svg to transparent PNG via headless Chrome."""
    chrome = next((p for p in CHROME_CANDIDATES if p.exists()), None)
    if chrome is None:
        raise RuntimeError("Chrome/Edge not found")
    subprocess.run([
        str(chrome), "--headless", "--disable-gpu", "--hide-scrollbars",
        "--default-background-color=00000000",
        f"--window-size={size},{size}",
        f"--screenshot={K_PNG}",
        f"file:///{str(K_SVG).replace(chr(92), '/')}"
    ], capture_output=True, check=True)
    return K_PNG


def find_gold_band(panel: Image.Image) -> tuple[int, int, int] | None:
    """Detect hat band center (cx, cy, width_px) by sampling for gold color."""
    px = panel.load()
    w, h = panel.size
    best_y, best_count = None, 0
    for y in range(int(h * 0.15), int(h * 0.50)):
        count = sum(1 for x in range(w)
                    if (px[x, y][0] > 200 and 130 < px[x, y][1] < 220 and px[x, y][2] < 100))
        if count > best_count:
            best_count = count
            best_y = y
    if best_y is None or best_count < 10:
        return None
    gold_xs = [x for x in range(w)
               if (px[x, best_y][0] > 200 and 130 < px[x, best_y][1] < 220 and px[x, best_y][2] < 100)]
    cx = (min(gold_xs) + max(gold_xs)) // 2
    return (cx, best_y, best_count)


def composite_k(panel: Image.Image, k_size: int) -> Image.Image:
    """Composite K logo at detected band center. Returns new RGBA panel."""
    if not K_PNG.exists():
        render_k_logo_png()
    k_overlay = Image.open(K_PNG).convert("RGBA").resize((k_size, k_size), Image.LANCZOS)
    panel = panel.convert("RGBA")
    band = find_gold_band(panel)
    if band is None:
        print(f"  WARNING: no gold band detected, K not composited")
        return panel
    cx, cy, count = band
    print(f"  K composited at ({cx}, {cy}), band width {count}px")
    out = panel.copy()
    out.paste(k_overlay, (cx - k_size // 2, cy - k_size // 2), k_overlay)
    return out


def split_4panel_sheet(sheet: Image.Image) -> dict:
    """Split a 2x2 grid sheet into 4 named quadrants."""
    w, h = sheet.size
    return {
        "calm":          sheet.crop((0,      0,      w // 2, h // 2)),
        "surprised":     sheet.crop((w // 2, 0,      w,      h // 2)),
        "casting-spell": sheet.crop((0,      h // 2, w // 2, h)),
        "sleepy":        sheet.crop((w // 2, h // 2, w,      h)),
    }


def main():
    ap = argparse.ArgumentParser(description="Composite Keeply K logo onto Hoot poses")
    ap.add_argument("source", type=Path, help="Path to source image (2x2 grid or single pose)")
    ap.add_argument("--k-size", type=int, default=70, help="K logo size in px (default 70)")
    ap.add_argument("--single", action="store_true",
                    help="Treat input as single pose, not 2x2 grid")
    args = ap.parse_args()

    if not args.source.exists():
        sys.exit(f"Source not found: {args.source}")

    render_k_logo_png()
    print(f"K logo rendered: {K_PNG} ({K_PNG.stat().st_size}B)")

    sheet = Image.open(args.source).convert("RGBA")

    if args.single:
        result = composite_k(sheet, args.k_size)
        out = args.source.parent / f"{args.source.stem}-with-k.png"
        result.save(out)
        print(f"Saved: {out}")
    else:
        # 2x2 grid mode
        panels = split_4panel_sheet(sheet)
        composite_sheet = sheet.copy().convert("RGBA")
        w, h = sheet.size
        positions = {"calm": (0, 0), "surprised": (w // 2, 0),
                     "casting-spell": (0, h // 2), "sleepy": (w // 2, h // 2)}
        for name, panel in panels.items():
            print(f"\n[{name}]")
            with_k = composite_k(panel, args.k_size)
            with_k.save(SCRIPT_DIR / f"mood-{name}.png")
            ox, oy = positions[name]
            composite_sheet.paste(with_k, (ox, oy))
        composite_sheet.save(SCRIPT_DIR / "expression-sheet-2x2.png")
        print(f"\nSaved: expression-sheet-2x2.png + 4 mood-*.png in {SCRIPT_DIR}")


if __name__ == "__main__":
    main()
