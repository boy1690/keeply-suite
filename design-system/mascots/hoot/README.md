# Hoot the Time Owl — Mascot Asset Library

> **v0.5 · 2026-05-17 — K-as-spell brand mechanic locked**
> The K logo is NOT a permanent badge — it's a sacred spell signature that only appears when Hoot casts Keeply magic.

## ✨ Brand Mechanic: K = Keeply Spell

| State | K visible? | Narrative |
|---|---|---|
| **Master / Hero** | ✅ K visible | Brand reference, Hoot in "active wizard" pose |
| **CALM** | ❌ dormant | Standby — wise guardian on watch |
| **SURPRISED** | ❌ dormant | Crisis detected, spell not yet cast |
| **CASTING SPELL** | ✅ **K glows cyan + halo** | **Keeply intervention LIVE** |
| **SLEEPY** | ❌ dormant | Off-duty, spell at rest |
| **ANGRY / SAD / etc** (future) | ❌ dormant | Personal moods, no spell active |

**Visual rule for new poses**:
- K dormant = plain gold hat band, K invisible
- K active = `k-logo-active.png` composited with cyan halo + magic sparkles (matches staff crystal color)
- K never appears as static badge — always tied to magic moment

**Why this matters**:
- K becomes narrative weight, not decoration
- Reserved K = high-impact when it appears
- Unified magic identity: K cyan glow = staff crystal cyan glow = brand action signal
- Stripe / Slack / Linear treat their brand mark same way (subtle in product, glows on activation)

## Asset files (v0.5)

```text
design-system/mascots/hoot/
├── README.md                       ← this file
├── compose-k.py                    ← K-active overlay tool (reusable)
├── k-logo.svg                      ← K dormant variant (flat, for master/hero stable use)
├── k-logo.png                      ← rendered dormant K
├── k-logo-active.svg               ← K active variant (cyan halo + sparkles, for casting moments)
├── k-logo-active.png               ← rendered active K
├── master.png                      ← v7 hero master (K visible, active wizard pose)
├── expression-sheet-2x2.png        ← v13 expressions (K only on CASTING)
├── mood-calm.png                   ← 512×512, K dormant
├── mood-surprised.png              ← 512×512, K dormant
├── mood-casting-spell.png          ← 512×512, K ACTIVE (cyan halo)
└── mood-sleepy.png                 ← 512×512, K dormant
```

---

## Tech: Hybrid AI + Vector Overlay

> Generated via Google AI Studio + Nano Banana (gemini-2.5-flash-image) via Playwright MCP
> Hybrid pipeline: AI generates owl/hat/expression; K logo composited via Python SVG overlay (Stripe/Slack/Linear pattern)
> Iterations: v1 (hand-drawn SVG fail) → v2 (Carl too realistic) → v3 (flat-wise) → v4 (Duo-style) → v5 (wizard) → v6 (Angry Birds eyes) → **v7 (master)** → v8 (expression sheet base) → v9-11 (failed K fixes) → **v12 (K via Python overlay)**

---

## Why K is composited, not generated

Gemini Nano Banana cannot reliably render consistent letterforms across panels:
- v8: K visible in 4/4 but inconsistent design
- v9 attempt (fix K orientation): Gemini removed K entirely from all panels
- v10: K back but chunky + 2/4 panels mirrored
- v11 (fix size): Gemini ignored "smaller" instruction + 2/4 missing K

**Decision (v12)**: Treat K as a vector overlay layer (like every real brand logo on physical merchandise). Gemini paints the owl + hat + expression; Python composites the K with pixel-perfect control.

This is how Stripe, Slack, Linear, and every real production brand handle logos on AI-generated assets. The logo NEVER lives inside the AI output — it lives in a separate vector layer that composites on top.

## Compose pipeline

```bash
# Render new mood sheet from Gemini
python compose-k.py hoot-gen-008-expressions.png

# Or single pose
python compose-k.py path/to/single-pose.png --single
```

See [`compose-k.py`](compose-k.py) — finds gold hat band by color sampling, overlays K-logo PNG at center.

K source of truth: [`k-logo.svg`](k-logo.svg) — edit once, applies to all assets.

---

## Files

```text
design-system/mascots/hoot/
├── README.md                       ← this file
├── master.png                      ← canonical master (1024×1024)
├── expression-sheet-2x2.png        ← 4 moods in single sheet (1024×1024)
├── mood-calm.png                   ← 512×512
├── mood-surprised.png              ← 512×512
├── mood-casting-spell.png          ← 512×512
└── mood-sleepy.png                 ← 512×512
```

## Character DNA (locked v7)

| Attribute | Spec |
|---|---|
| **物種** | 紫色貓頭鷹（owl）|
| **配色 body** | Royal purple #6D28D9 |
| **配色 hat** | Deep purple #4C1D95 + gold #FBBF24 trim band |
| **配色 belly** | Cream #FEF3C7 |
| **配色 accents** | Orange #F59E0B（beak + feet）/ Cyan #22D3EE（magic） |
| **眼結構** | 大白眼 sclera + amber #FBBF24 iris + 黑瞳 + 雙白高光（Angry Birds style）|
| **眉毛** | Thick dark navy #1E1B3A（表情核心驅動）|
| **帽子** | 巫師尖頂 + 金腰帶（K logo embedded）+ cyan 月亮星星 |
| **法仗** | 木紋 + cyan 時鐘水晶 + 魔法粒子 |
| **K 標誌** | 巫師帽金腰帶上（dark navy K），不在胸前 |
| **比例** | Duo 風 teardrop body + 大頭 chibi |
| **風格** | 2D flat vector, 無 realism, 無 feather texture |

## Expression library (current v8 — 4 moods)

| Mood | Brows | Pupils | Beak | Extra |
|---|---|---|---|---|
| **CALM** | 中性微弧 | Centered | Small smile | — |
| **SURPRISED** | Raised high | Small dots in big white | Open small | 側邊動線 |
| **CASTING SPELL** | V-shape inward | Looking at staff | Closed firm | 加多 cyan sparkles |
| **SLEEPY** | 鬆弛 | Closed arc | Tiny smile | "Zzz" 飄帽上 |

## Future expressions to generate (per request)

- ANGRY (V-brows deeper down, smaller pupils)
- SAD (brows angled up inward, looking down)
- WINK (one eye closed arc, other normal)
- LOVE (heart-shaped pupils)
- CONFUSED (mismatched brows + ?)
- READING (looking down at book, brows soft)

## Hero poses to generate

- Side profile（侧脸 + 法仗對外）
- Wing-spread casting（雙翅展開 + 時間魔法 burst）
- Sitting on timeline branch（坐在發光時間樹枝上）
- Holding clock face（雙翅捧時鐘）

## Reproducibility

**Generation prompt（locked v7 master）**：see [`mascot-brief.md`](../../_dev/design/cover-experiments/mascot-brief.md) Phase 1.

**Tool stack**：
- Google AI Studio (`https://aistudio.google.com/`)
- Model: `gemini-2.5-flash-image` (Nano Banana, free tier)
- Driver: Claude Code + Playwright MCP
- Auth: Google Pro account

**Cost**：免費 tier 至今（gen 001-008，~8 generations）

## Usage

### Cover hero image

直接 import `master.png` 進 cover v2 SVG framework 作 hero illustration（per `_dev/design/cover-experiments/cover-v2-framework-spec.md`）。

### Blog inline emotion

剪 `mood-*.png` 進文章 inline GIF 當情緒插畫（如：「✕ Recycle Bin 滿了」配 `mood-surprised.png`，「✓ 時光倒流找回檔案」配 `mood-casting-spell.png`）。

### Social Reels / TikTok

用 master + 4 mood 為 frame 進 Rive 做 6-15 sec animation loop。

### Sticker pack

`mood-*.png` 可直接做 Slack / LINE / Discord sticker（512×512 是這些平台的標準 sticker 規格）。
