---
title: "3 ヶ月後、クライアントが「あの版を」と聞いてきたとき：Word の版数履歴では救えない"
description: "Word AutoRecover、OneDrive 版数履歴、Time Machine はすべて保存層レスキューです。retention は短く、ファイルを閉じれば消えるか、約 500 版が上限。3 ヶ月前に納品した版を取り戻すにはツール層が必要です。"
date: 2026-05-02T15:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "Word 版数履歴"
locale: ja
categories: [ユースケース]
tags: [ファイル復元, 操作ミス]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: hybrid
ranking_locales: [en, ko]
cta_topic: versioning
---

# 3 ヶ月後、クライアントが「あの版を」と聞いてきたとき：Word の版数履歴では救えない

> ソフトの内蔵版数履歴は保存層レスキュー。3 ヶ月前に納品した版を取り戻すにはツール層が要る。

土曜の夜 11:23、クライアントから連絡が入る。「3 月にお送りいただいた提案、もう一度送ってもらえますか？」

OneDrive の版数履歴を開く。直近 1 週間しか残っていない。Word の AutoRecover はファイルを閉じたときに消えた。手元には末尾 `_v` のファイルが 7 つ。3 月の納品とどれも一致しない。

3 ヶ月前に ⌘+S を押したあの版を、ツールは覚えていなかった。

## 要点

Microsoft Word の「**版数履歴**」、AutoRecover、OneDrive 版数スナップショットはすべて**保存層レスキュー**として設計されています。「打っている最中にクラッシュした」場面のためのもので、retention は短い：ファイルを閉じれば消える、クラウドの版数履歴で約 500 版。これは保存事故レスキューで、納品追跡ではありません。3 ヶ月後にクライアントが「あの版を」と聞いてきたら、ツール層に独立した always-on 版数履歴と、納品時点の metadata 印が必要です。

## 目次

1. Word 内蔵版数履歴ができることは？
2. AutoRecover / OneDrive / Time Machine：それぞれ何日保つ？
3. なぜ 3 ヶ月後には届かないのか？
4. 3 ヶ月前に納品した版を取り戻すには？
5. よくある質問

---

## Word 内蔵版数履歴ができることは？

Word と Office 全体には 3 種類の「**版数復元**」機構があります：

- **AutoRecover**：クラッシュ時に未保存の内容を救う。既定で 10 分ごとに自動退避。ファイルを正常に閉じると消える。
- **AutoSave**（[OneDrive / SharePoint オンライン Word](https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)）：入力中に逐次クラウドへ書き込む。
- **OneDrive 版数履歴**：保存ごとのスナップショットを残し、任意の時点に戻せる。Microsoft の [SharePoint 版管理ドキュメント](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) は既定で約 500 主要版を保持と記載。

設計意図は明確です。「**打っている途中でクラッシュした**」「**さっき上書きしてしまった**」という**短期の保存事故**に備えるもの。「**3 ヶ月後にクライアントがあの版を聞く**」場面の設計目標ではありません。

## AutoRecover / OneDrive / Time Machine：それぞれ何日保つ？

retention の数字を並べてみます。

| 機構 | 既定 retention | prune 条件 | 想定シーン |
| --- | --- | --- | --- |
| Word AutoRecover | ファイル閉時に消える | ファイル閉、Word 再起動 | クラッシュ救援 |
| OneDrive AutoSave | 入力中に書込 | 。 | リアルタイム共同編集 |
| OneDrive 版数履歴 | 既定で約 [500 版](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | 500 超で古いものから prune | 短期ロールバック |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | hourly 24h + daily 30 日 + weekly ディスク満まで | ディスク満 | システムレベルバックアップ |
| Windows ファイル履歴 | 設定可変 | 設定可変 | システムレベルバックアップ |

そう、どの機構にも上限があります。ファイル閉時の消去から約 500 版まで、3 ヶ月の線は越えられません。

## なぜ 3 ヶ月後には届かないのか？

ここで誰もはっきり言わない区別があります。**保存層** vs **ツール層**。

ソフトの内蔵版数履歴は **保存層** に住んでいます。存在意義は「直近の書き込みが失敗したらロールバック」。だから retention が短い。ファイル閉時の消去から 500 版まで、設計の参照点は「平均的な利用者が 1 ヶ月以内に振り返る回数」。3 ヶ月以上は設計目標に入っていません。prune されるのは合理的です。

A さんはコンサルタント。土曜 11:23 にクライアントから 3 月のレポートを送ってほしいと連絡。OneDrive の版数履歴を開くと最古は 4 月 28 日。AutoRecover はとっくに切ってある。手元には `_v` 始まりの .docx が 8 つ。どれもファイル更新日が 3 月の納品週と一致しない。

そして最悪なのは、A さんは後で気づきます。3 月のあの送付は当日エクスポートした PDF を添付しただけ。元の .docx は数週間前に上書きで消えている。**送った PDF はクライアントの受信箱にあるけれど、その PDF からあの版の .docx に戻って続きを書くことはできない。**

## 3 ヶ月前に納品した版を取り戻すには？

2 層必要です：

- **always-on 版数履歴**：保存ごとに残し、prune されない。Word や OneDrive の retention policy に依存しない。
- **納品メモ metadata**：エクスポート時に「誰が、いつ、どの版に対応するか」の metadata を自動で埋め込む。3 ヶ月後にツールへ戻せば、原点が見える。

[Keeply](https://keeply.work) はこの 2 層を提供します。

B さんは Keeply を半年使っている。月曜の朝、クライアントから 4 月のデザインを再送依頼。クライアントの email にあった添付の .pdf を Keeply にドロップする。Keeply が「これは 2026-04-12 の v3 提案です」と表示。元 .docx の commit hash と用途分類「業主核定版」付き。「この版に戻る」をクリックすると 3 秒後に Word が 4/12 のあの版を開く。

ただし Keeply は AutoRecover を置き換えません。打っている最中のクラッシュは AutoRecover が第一線です。Keeply は遡及できません：納品時点で Keeply を使っている必要があり、そうでなければ metadata は埋め込まれません。Keeply 導入前の納品は本記事では救えません。今日からの納品はすべて救えます。

そう、ここがほっとできるところ。

## よくある質問

**Q1: Word AutoRecover は既定でオンですか？**

既定でオン。設定経路：「ファイル → オプション → 保存 → 10 分ごとに自動回復用データを保存する」。ただし AutoRecover はファイルを正常に閉じると消えます。長期保持ではありません。

**Q2: OneDrive 個人版とビジネス版で版数保持数は同じですか？**

完全に同じではありません。OneDrive 個人は既定で約 500 版。OneDrive for Business（Microsoft 365）も既定 500 版だが管理者が調整可能。上限到達で最古から prune。

**Q3: Time Machine はバックアップですか、版数管理ですか？**

Time Machine はシステムレベルのバックアップで、ファイル単位の版数管理ではありません。ディスク全体のスナップショットを保つもので、「proposal.docx の保存ごとの版」を追跡するわけではありません。Time Machine から特定版を救うことは可能ですが手間がかかります。

**Q4: Google Docs の修訂版はどれくらい保持されますか？**

Google は明確な retention 数字を公開していません。[公式ドキュメント](https://support.google.com/docs/answer/190843) には「古い修訂版は容量節約のため統合されることがあります」とあります。実務上は 3 ヶ月超の修訂版は自動で統合・prune されることが多い印象。

**Q5: Keeply の層は Git と同じですか？**

Keeply は Git エンジンを使いますが、UI に Git 用語は出しません。表示は「版を保存 / ワークコピー / プロジェクト位置に同期」など。commit、branch、push は出ません。非開発者にはオフィス言語の版数管理として届きます。

---

11:23 のあのメッセージ、次にいつ来るかは分かりません。

でもひとつ分かっていること：5 分前の版と 3 ヶ月前の版を、ツールに同じに扱わせてはいけない。

今日からの納品ごとに、ツールにあの一つを覚えてもらうことはできますか？

---

> 著者について：Ting-Wei Tsao、Keeply 創業者。
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
