# BWF patch proposal — 2026-03 核心更新 + AIO 48% 對映

> 起因：2026-03 Google 核心更新（3/27–4/8）+ AI Overviews 全面化（48% query）。
> 結論：你的框架方向已對（T12-49c information-gain、GATE-5 AIO cite、keyword-research 的「≥3 new facts」+「AI Overview reality」）。這份只做 **3 條 surgical 收緊**，把「原創 / 第一手」從加分項升成生存線，並把 AIO 從勾選項升成共同主指標。
> seo-watch（#2 核更凍結閘門）**已直接套用** 在 `~/.claude/skills/seo-watch/SKILL.md` + canonical，本檔不含。
> 套用時機：`user-global/bwf` 有別的流程在 commit，確認 idle 後再套（或交給該流程一起）。

---

## 證據（research 2026-05-22）

- **2026-03 核更**：比 2025-12 更猛，top-3 約 80% 換位、近 1/4 top-10 掉出 top-100；能見度推向「第一手 / 官方 / 品牌自有原始來源」，**降權 UGC、比較聚合站、為搜尋而生的內容**；**連高 E-E-A-T 出版商都讓位給它們引用的原始來源**；最穩定輸家＝「重新整理 top-10 但無原創數據 / 第一手經驗 / 獨特觀點」。
  ([Search Engine Land](https://searchengineland.com/march-2026-google-core-update-what-changed-474397) · [Amsive](https://www.amsive.com/insights/seo/google-march-2026-core-update-winners-losers-analysis/))
- **AIO**：已涵蓋 48% query（資訊型 >70%）；CTR 掉 15–46%，但點進者轉換率 ~23×；引用與自然 top-10 重疊度從 ~76%（2025 中）跌到 **17–54%**，「排第 1 ≠ 被 AIO 引用」。
  ([Stackmatix](https://www.stackmatix.com/blog/google-ai-overviews-impact-seo-2026) · [Heroic Rankings](https://heroicrankings.com/seo/managed/google-ai-overview-statistics-2026/))

---

## PATCH #1 — T12-49c 加「primary-source 收緊」(`bwf/traps.md`)

**現況**：49c 已有 12-enum `info_gain_type` + `serp_top10_gap_diagnosis`，且 (e) accountable-synthesis 已被限制在 4 種 synthesis type。
**缺口**：核更把 SERP 推向官方來源後，**純 synthesis 角度**（即使有 info-gain）會被原始來源蓋過。需要強制「至少一層第一手 / 自家數據」。

**在 `traps.md` 49c 的 `(e) accountable synthesis pairing` 那條之後，新增一條 bullet：**

```markdown
   - **(2026-03 核更) primary-source 收緊**（v0.3.2）：當 `serp_top10_gap_diagnosis.seen_patterns` 顯示 top-10 由**官方文件 / 原廠 / 高權威**主導時，`info_gain_type` 至少 1 個必須 ∈ **primary subset** {case-study, latest-data, mechanism-teardown, failure-postmortem}，且該料來自 **Keeply 自家數據 OR 作者第一手觀察**（非再次引用二手事實）。純 synthesis 子集 {definition, comparison, decision-framework, situational-judgment, how-to, pitfall-list, not-for, counter-example} 單獨成立 = halt（例外：Phase 0 author_qualification 為 (a)/(b) 第一手且能舉證 SERP 仍缺該角度）。
     - 與 (e) 連動：author_qualification 含 (e) **且** top-10 官方主導 → drop 或降為 cluster 支撐（不開競爭 pillar）。核更已證 (e)-only 在 official-dominated SERP 會被原始來源蓋過。
     - 證據：2026-03 核更降權「無原創數據 / 第一手 / 獨特觀點的綜合文」，連高 E-E-A-T 都讓位給原始來源（Search Engine Land 474397）。
```

**並在 `bwf/library/keyword-research.md` 的「Information gain audit ≥ 3 項新事實」(§994 附近) 補一句：**

```markdown
   - **(2026-03 收緊)**：≥3 新項中 **≥1 必須是 primary**（Keeply 自家數據 / 作者第一手觀察），不能 3 個都是 re-sourced 二手事實。核更後「有引用」不等於「有原創」。
```

---

## PATCH #2 — GATE-5 加 AIO 共同主指標 + citability 修法 (`bwf/gates.md`)

**現況**：GATE-5 已有 #4「AI Overview cite check」(只勾選) + #1「90 天 impressions/clicks/avg position/CTR」。
**缺口**：AIO 48% + 重疊度 17–54% → 「排到但沒被 AIO 引用」成常態，且這是 **citability 問題不是排名問題**，現行 retrofit（TITLE_ADD/H2_ADD keyword）救不了。CTR 結構性下滑也會誤判文章變差。

**(a) 升級 GATE-5 item #4 文字：**

```markdown
4. [C] **AI Overview cite check** done for each T1 launch locale —
   記錄 `cited: yes/no`（v0.3.2 升為 co-primary 指標，不只勾選）
```

**(b) GATE-5 末尾新增 item 11、12：**

```markdown
11. [I] **(2026 AIO) rank × AIO-cite 矩陣** — 每個 T1 標 (organic rank) × (AIO-cited y/n)：
    - top-10 + AIO-cited = winning，不動
    - top-10 + **NOT AIO-cited** = **citability 問題** → 走 citability path：H2 開頭 standalone 直答 / claim 清晰化 / schema entity / 補 Keeply 第一手數據點。**不是** keyword retrofit
    - not ranked = 正常 ranking retrofit
    - 證據：AIO 涵蓋 48% query、與自然 top-10 重疊度跌到 17–54%（Stackmatix 2026）
12. [I] **(2026 AIO) CTR 衰退歸因** — 點擊掉但**曝光穩 + AIO present** = 結構性（AIO 吃點擊，預期，**不**觸發 refresh，改看 conversions / assisted）；點擊掉**且排名掉** = actionable。AIO clicker 轉換率 ~23×，低點擊高轉換 ≠ 文章變差。
```

> 把標題的「10 項，7C/3I」改成「12 項，7C/5I」。

**並在 `bwf/library/measure.md` §5.3 refresh trigger 補：** refresh 前先做 #12 歸因——曝光穩 + AIO present 的純 CTR 下滑不算 refresh trigger（與 seo-watch Phase 0 核更凍結閘門一致）。

---

## 沒列入的（已驗證，維持不動）

AEO chunk 規則 / schema / 問句式 H2 / Phase 0 authority gate / SD-via-DA — 這次核更**反而印證**它們（AIO 看結構與實體權威、能見度向權威傾斜），不需改。

---

## 套用清單 — ✅ 全部已套用 2026-05-22

- [x] `bwf/traps.md` 49c — primary-source 收緊 bullet（line 563）
- [x] `bwf/library/keyword-research.md` — ≥1 primary 一句（§994）
- [x] `bwf/gates.md` GATE-5 — item #4 升級 + 新增 #11/#12 + 標題改「12 項，7C/5I」
- [x] `bwf/library/measure.md` §5.3 — CTR 歸因反向 guard（line 278）
- [x] `seo-watch` Phase 0 核更凍結閘門（live + canonical，commit `fa54bc0`）

> bwf 4 檔走 `~/.claude/bwf` junction 套用（= 同步 canonical `D:\tools\doing\skill\user-global\bwf`）。
> **未 commit bwf 那 4 檔** —— `user-global/bwf` 另有進行中的 WIP，留給該流程一起 commit，避免撞車。
