"""V2 em-dash purge — cut remaining em-dashes including bullet patterns + link text."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}


def transform(text: str, locale: str) -> str:
    # Universal: bullet pattern "- **X** — " → "- **X**："
    # zh + ja + ko + en
    if locale in ("zh-tw", "ja", "ko"):
        text = re.sub(r"(\n- \*\*[^*]+\*\*) — ", r"\1：", text)
    else:
        text = re.sub(r"(\n- \*\*[^*]+\*\*) — ", r"\1: ", text)

    # Universal: in-body remaining " — " → "。" (zh/ja/ko) / ". " (en)
    # but careful with markdown link [text — text](url)
    # Strategy: replace " — " inside link brackets too with " : " (just shorter form)
    text = re.sub(r"\[([^\]]+) — ([^\]]+)\]", r"[\1: \2]", text)

    # author byline " — " before role
    if locale in ("zh-tw",):
        text = text.replace("Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152) — Keeply 創辦人",
                            "Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152)，Keeply 創辦人")
    if locale == "ja":
        text = text.replace("Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152) — Keeply 創業者",
                            "Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152)、Keeply 創業者")
    if locale == "ko":
        text = text.replace("Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152) — Keeply 창업자",
                            "Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152)、Keeply 창업자")
    if locale == "en":
        text = text.replace("Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152) — Founder, Keeply",
                            "Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152), Founder of Keeply")

    # Remaining body em-dashes per locale: replace narrowly
    if locale == "zh-tw":
        text = text.replace("才察覺不對 — Ctrl+Z", "才察覺不對。Ctrl+Z")
        text = text.replace("看版本歷史 — 9:14 之前", "看版本歷史。9:14 之前")
        text = text.replace("Time Machine 才拍 — 那張快照", "Time Machine 才拍。那張快照")
    if locale == "ja":
        text = text.replace("田中さんがファイルを閉じる — この瞬間", "田中さんがファイルを閉じる。この瞬間")
        text = text.replace("バージョンが残っていなかった — AutoSave",
                            "バージョンが残っていなかった。AutoSave")
    if locale == "en":
        text = text.replace("Chen, an accountant (**composite case**), hit",
                            "Chen, an accountant (composite case), hit")
        text = text.replace("she went to close the file — Ctrl+Z was dead. She'd already",
                            "she went to close the file. Ctrl+Z was dead, she'd already")
        text = text.replace("the pre-9:14 version wasn't there. AutoSave",
                            "the pre-9:14 version wasn't there. AutoSave")
        text = text.replace("AutoSave had written a stream of small versions, and 9:13 — the moment she thought \"saved\" — was never logged as its own.",
                            "AutoSave had written a stream of small versions, and 9:13, the moment she thought \"saved,\" was never logged as its own.")
        text = text.replace("the cloud copy of `month_end_close_2026_05.xlsx`. Hit \"Restore this version.\"",
                            "the cloud copy of `month_end_close_2026_05.xlsx`. Hit \"Restore this version.\"")
    if locale == "ko":
        text = text.replace("Ctrl+Z는 안 먹힌다. 방금 한 번 닫았기 때문이다.", "Ctrl+Z는 안 먹힌다. 방금 한 번 닫았기 때문이다.")
        text = text.replace("9시 14분 이전 버전이 없다. 자동 저장이",
                            "9시 14분 이전 버전이 없다. 자동 저장이")
        text = text.replace("9시 13분 — 「저장됐다」고 그가 생각한 그 순간 — 은 독립",
                            "9시 13분, 「저장됐다」고 그가 생각한 그 순간은 독립")
        text = text.replace("Time Machine이 찍었다 — 그 스냅숏에 잡힌 건",
                            "Time Machine이 찍었다. 그 스냅숏에 잡힌 건")

    return text


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                print(f"  [MISS] {path}")
                continue
            text = path.read_text(encoding="utf-8")
            new_text = transform(text, locale)
            before_em = text.count("—")
            after_em = new_text.count("—")
            path.write_text(new_text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: em-dash {before_em} -> {after_em}")


if __name__ == "__main__":
    main()
