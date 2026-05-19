# BWF Lint MVP

GATE-4 自動檢查的 Python 腳本。目前 MVP 3 支（其他延後）。

## 現有

| 腳本 | 用途 | GATE-4 對應 |
|------|------|-------------|
| `ai_tell.py` | Banned phrases / Git jargon / em-dash 密度 / not-just-but 濫用 | #5 #6 |
| `readability.py` | Flesch Reading Ease + 句長 / passive voice | #1 #2 #3 |
| `translation_safety.py` | 運動比喻 / 流行文化 / idiom / US units | #8 |

## 延後（v0.2+）

- `burstiness.py` — 句長 std dev ≥7（GATE-4 #4）
- `voice_sim.py` — embedding cosine vs corpus centroid（GATE-4 #7，需先有 corpus）
- `seo.py` — 每 locale title/meta/H1/slug 長度（GATE-4 #9）

## 用法

```bash
python .bwf/lint/ai_tell.py specs/{slug}/draft.en.md
python .bwf/lint/readability.py specs/{slug}/draft.en.md
python .bwf/lint/readability.py specs/{slug}/draft.en.md --technical
python .bwf/lint/translation_safety.py specs/{slug}/draft.en.md
```

Exit 0 = pass；Exit 1 = 有命中；Exit 2 = 用法錯誤。

## 設計原則

Harness Engineering：這些 lint 的存在是要把錯誤攔在發生之前。寧可 false positive 也不放過 false negative——人工覆審成本低，漏掉「delve」造成的品牌傷害大。

所有腳本**不依賴外部套件**（純 stdlib）——降低上手摩擦，可以直接 `python` 跑。

## Known limitations

### `readability.py` — FRE 分數有 ±3 分噪音

音節計算用 stdlib 粗估（連續母音算一個，結尾 `e` 不算），比起 `pyphen` 精度低。
實測對標竿段落 vs. 標準計算器有 ±3 分誤差範圍。

**使用建議**：

- FRE ≥ 63 或 ≤ 57 → 結論可信
- FRE 58–62 → 視為「邊緣」，不要當「剛好過/剛好沒過」
- 要精確分數時用 https://readable.com/ 人工覆審

未來升級到 `pyphen` 可消除此噪音（列入 v0.2）。

### `ai_tell.py` — Git jargon 只攔 compound 用法

為避免誤殺合法商業用法（`commitment to users` / `branch office`），
只攔明顯 Git 語境（`git commit`、`commit message`、`feature branch`、
`committed to main` 等）。

**代價**：孤立的 Git 動詞（`I pushed yesterday`）不會被抓——
但 Keeply 寫作不會出現這種語境，實際 false negative 率接近零。
若未來踩到案例，在 `BANNED_PHRASES` 加精確 pattern。

### `translation_safety.py` — idiom list 非窮盡

只覆蓋高頻英文 idiom / US-centric references。區域性慣用語
（英式、澳式、南非英文）和新興網路用語可能漏。
**使用建議**：人工審核時對「感覺像比喻但不確定是不是 idiom」的片語額外留意。
