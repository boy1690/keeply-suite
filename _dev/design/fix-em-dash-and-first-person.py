"""Reduce em-dash density + add first-person mentions for forensic article.

Affects all 4 launch locales of excel-overwrite-postmortem in content/ + specs/.
- H2 lines: replace " — " with "：" (saves ~7 em-dashes per locale)
- Body em-dashes after bold bullet: replace with "，" or split sentence (saves ~5)
- Add 3 first-person "我" / "I" / "私" / "내가" in lead + closing for zh-TW (T13-56b)
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}

# Body em-dash replacements per locale (targeted, conservative).
# Each rule: (old_substring, new_substring). Order matters.
BODY_REPLACEMENTS = {
    "zh-tw": [
        # H2 line separators
        ('## 9:14 — 那一秒發生了什麼', '## 9:14：那一秒發生了什麼'),
        ('## T+0〜十幾秒 — OneDrive', '## T+0〜十幾秒：OneDrive'),
        ('## T+15 分鐘 — 「以前的版本」為什麼是空的', '## T+15 分鐘：「以前的版本」為什麼是空的'),
        ('## T+24 小時 — Time Machine 的 1 小時間隔', '## T+24 小時：Time Machine 的 1 小時間隔'),
        ('## T+30 天 — 還原軟體什麼也沒找回來', '## T+30 天：還原軟體什麼也沒找回來'),
        ('## 平行宇宙 — 那台電腦裡裝了 Keeply，9:14 會怎樣', '## 平行宇宙：那台電腦裡裝了 Keeply，9:14 會怎樣'),
        ('## 極限 — Keeply 也救不到的 3 種覆蓋', '## 極限：Keeply 也救不到的 3 種覆蓋'),
        # Body em-dashes
        ('Ctrl+Z 按不了 — 剛才已經關過', 'Ctrl+Z 按不了。剛才已經關過'),
        ('一個確認 — 那份檔案真的回不來', '一個確認。那份檔案真的回不來'),
        ('30 分鐘以內就出事** — 第一張自動快照', '30 分鐘以內就出事**。第一張自動快照'),
        ('共用網路磁碟上的 Excel** — Keeply', '共用網路磁碟上的 Excel**。Keeply'),
        ('別人在另一台電腦上覆蓋了雲端那份** — Keeply', '別人在另一台電腦上覆蓋了雲端那份**。Keeply'),
        ('版本歷史救回。本機 Excel 檔（沒掛 OneDrive）', '版本歷史救回。本機 Excel 檔案（沒掛 OneDrive）'),
        # First-person mentions (T13-56b minimum 3 for zh-TW master)
        ('本文就是這份紀錄。',
         '我把這份紀錄整理出來。'),
        ('我把這份紀錄整理出來。\n\n## 9:14',
         '我把這份紀錄整理出來。今天我帶你跟著時間軸走一遍。\n\n## 9:14'),
        ('事故報告書到這裡結束。下次怎麼不再發生這件事，從另一個地方說起。',
         '事故報告書到這裡結束。下次怎麼不再發生這件事，我會另外寫一篇接著聊。'),
        # 10 點那張快照，是事故 46 分鐘後拍下的事後現場 — there's no em-dash here, just verify
        # T+24 H2 elaborate: "事故 46 分鐘後" already no em-dash
    ],
    "ja": [
        ('## 9:14 — その瞬間に起きたこと', '## 9:14：その瞬間に起きたこと'),
        ('## T+0〜十数秒 — OneDrive', '## T+0〜十数秒：OneDrive'),
        ('## T+15分 — 「以前のバージョン」が空だった理由', '## T+15分：「以前のバージョン」が空だった理由'),
        ('## T+24時間 — Time Machine の 1 時間間隔', '## T+24時間：Time Machine の 1 時間間隔'),
        ('## T+30日 — 復元ソフトが何も持ってこなかった理由', '## T+30日：復元ソフトが何も持ってこなかった理由'),
        ('## 別の世界線 — その PC に Keeply が入っていたら 9:14 に何が起きていたか',
         '## 別の世界線：その PC に Keeply が入っていたら 9:14 に何が起きていたか'),
        ('## 限界 — Keeply もこの 3 種類の上書きには間に合わない',
         '## 限界：Keeply もこの 3 種類の上書きには間に合わない'),
        ('Ctrl+Z は効かない — さっき閉じたから', 'Ctrl+Z は効かない。さっき閉じたから'),
        ('9:16 田中さんがファイルを閉じる — この瞬間', '9:16 田中さんがファイルを閉じる。この瞬間'),
        ('得たのは、確証だった — もう戻ってこないという確証',
         '得たのは、確証だった。もう戻ってこないという確証'),
        ('30 分未満で起きた事故** — 最初の自動取り込み',
         '30 分未満で起きた事故**。最初の自動取り込み'),
        ('Excel ファイル** — Keeply はクライアント PC', 'Excel ファイル**。Keeply はクライアント PC'),
        ('cloud 側の上書き** — Keeply はあなたの PC',
         'cloud 側の上書き**。Keeply はあなたの PC'),
        ('UI は「バージョン履歴」「儲存版本」「復元」のみ。あなたが理解する',
         'UI は「バージョン履歴」「儲存版本」「復元」のみ。あなたが理解する'),
        ('Keeply は git 用語を使わない — UI は',
         'Keeply は git 用語を使わない。UI は'),
        # ja first-person 私 already in source via 第三人称 narrator; add 2 light author mentions
        ('本文はその記録だ。',
         '本文は私が整理したその記録だ。'),
        ('事故報告書はここで終わる。次に起きないようにする話を始めよう。',
         '事故報告書はここで終わる。次に起きないようにする話は、私の別の記事で続ける。'),
    ],
    "en": [
        ('## 9:14 — what happened in that second', '## 9:14: what happened in that second'),
        ('## T+0 to ~15 seconds — OneDrive AutoSave',
         '## T+0 to ~15 seconds: OneDrive AutoSave'),
        ('## T+15 minutes — why "Previous Versions" was empty',
         '## T+15 minutes: why "Previous Versions" was empty'),
        ('## T+24 hours — Time Machine\'s 1-hour gap',
         '## T+24 hours: Time Machine\'s 1-hour gap'),
        ('## T+30 days — why the recovery software found nothing',
         '## T+30 days: why the recovery software found nothing'),
        ('## Parallel timeline — what would happen at 9:14 if Keeply were on that PC',
         '## Parallel timeline: what would happen at 9:14 if Keeply were on that PC'),
        ('## Limits — three overwrites Keeply also can\'t catch',
         '## Limits: three overwrites Keeply also can\'t catch'),
        ('Ctrl+Z was dead, she\'d already closed once.', 'Ctrl+Z was dead. She\'d already closed once.'),
        ('46 minutes after the scene was cleared.', '46 minutes after the scene was cleared.'),
        ('What Chen got for her subscription fee was a confirmation. The file isn\'t coming back.',
         'What Chen got for her subscription fee was a confirmation. The file isn\'t coming back.'),
        ('within 30 minutes of installing Keeply** — the first',
         'within 30 minutes of installing Keeply**. The first'),
        ('shared network drive** — Keeply runs', 'shared network drive**. Keeply runs'),
        ('from another device** — Keeply tracks', 'from another device**. Keeply tracks'),
        ('"just deleted + HDD + filesystem not yet overwritten" — all three together.',
         '"just deleted + HDD + filesystem not yet overwritten." All three together.'),
        # Add first-person
        ('This is that record.', 'This is the record I put together.'),
        ('The forensic record ends here. Preventing this next time is a different conversation.',
         'The forensic record ends here. I\'ll cover preventing this next time in a separate piece.'),
    ],
    "ko": [
        ('## 9:14 — 그 1초에 일어난 일', '## 9:14: 그 1초에 일어난 일'),
        ('## T+0 ~ 15초 — OneDrive 자동 저장의 경쟁 조건',
         '## T+0 ~ 15초: OneDrive 자동 저장의 경쟁 조건'),
        ('## T+15분 — 「이전 버전」이 비어 있던 이유',
         '## T+15분: 「이전 버전」이 비어 있던 이유'),
        ('## T+24시간 — Time Machine의 1시간 간격',
         '## T+24시간: Time Machine의 1시간 간격'),
        ('## T+30일 — 복구 소프트웨어가 아무것도 못 가져온 이유',
         '## T+30일: 복구 소프트웨어가 아무것도 못 가져온 이유'),
        ('## 평행 우주 — 그 PC에 Keeply가 깔려 있었다면 9:14에 무슨 일이 일어났을까',
         '## 평행 우주: 그 PC에 Keeply가 깔려 있었다면 9:14에 무슨 일이 일어났을까'),
        ('## 한계 — Keeply도 못 잡는 3가지 덮어쓰기', '## 한계: Keeply도 못 잡는 3가지 덮어쓰기'),
        ('Ctrl+Z는 안 먹힌다, 방금 한 번 닫았기 때문이다.', 'Ctrl+Z는 안 먹힌다. 방금 한 번 닫았기 때문이다.'),
        ('확인 한 줄이었다 — 그 파일은 정말 안 돌아온다.',
         '확인 한 줄이었다. 그 파일은 정말 안 돌아온다.'),
        ('Keeply 설치 30분 이내에 사고 발생** — 첫 자동 스냅숏',
         'Keeply 설치 30분 이내에 사고 발생**. 첫 자동 스냅숏'),
        ('공유 네트워크 드라이브 위의 Excel 파일** — Keeply는',
         '공유 네트워크 드라이브 위의 Excel 파일**. Keeply는'),
        ('덮어쓴** — Keeply는', '덮어쓴**. Keeply는'),
        # Add author 1st-person
        ('이 글이 그 기록이다.', '이 글은 내가 정리한 그 기록이다.'),
        ('사고 보고서는 여기서 끝난다. 다음에 이 일이 안 일어나게 하는 얘기는 다른 곳에서 시작한다.',
         '사고 보고서는 여기서 끝난다. 다음에 이 일이 안 일어나게 하는 얘기는, 내가 다른 글에서 이어 쓸 것이다.'),
    ],
}


def apply(path: Path, rules: list) -> int:
    if not path.exists():
        return 0
    text = path.read_text(encoding="utf-8")
    count = 0
    for old, new in rules:
        if old in text:
            text = text.replace(old, new, 1)
            count += 1
    path.write_text(text, encoding="utf-8")
    return count


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        rules = BODY_REPLACEMENTS.get(locale, [])
        # Apply to both spec and content
        spec_path = ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md"
        content_path = ROOT / "content" / dirname / "post" / SLUG / "index.md"
        n_spec = apply(spec_path, rules)
        n_content = apply(content_path, rules)
        print(f"  [{locale}] spec={n_spec}/{len(rules)} content={n_content}/{len(rules)}")


if __name__ == "__main__":
    main()
