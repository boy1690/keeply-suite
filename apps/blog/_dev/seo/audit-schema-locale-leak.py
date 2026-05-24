#!/usr/bin/env python3
"""
audit-schema-locale-leak.py — detect structured-data (faq_schema / howto_schema)
frontmatter whose VALUE language doesn't match the locale = leaked-from-master defect.

Root cause (2026-05-24): when an article was localized, the body got translated but the
frontmatter faq_schema / howto_schema blocks were left in the zh-TW master language —
so e.g. an English page emitted Chinese FAQ/HowTo JSON-LD (broken rich results + polluted
AEO entity signals). 240 such lines were found across 9 articles × en/ja/ko/zh-cn/it.

Run from apps/blog:  python _dev/seo/audit-schema-locale-leak.py
Exit 0 = clean. Exit 1 = leaks found (use as pre-ship gate / CI check).

Wire into BWF DELIVER pre-ship audit (Touch 4 step 7.5) alongside audit_ai_tells.py.
"""
import os, re, glob, sys

CONTENT = os.path.join(os.path.dirname(__file__), "..", "..", "content")

LATIN = {"english","it","de","es","fr","pl","pt-br","tr","vi","id","nl","ar","hi","ru"}
# Traditional-only chars (differ from Simplified). 案/它 etc. are shared → excluded.
TRAD = set("為裡麼體軟檔產這當們來個東語頭問題實寫點還對應該樣覺擊歲屬轉騰齊辭釋錄歷顯驗務開關閉單買賣讀們會兒夾鈕")
# Chinese-only function words/markers — used to tell leaked-Chinese from genuine
# kanji-only Japanese (e.g. 総合評価 is real JA and must NOT be flagged).
ZH_MARKERS = set("的是嗎這麼們沒為裡喲呢吧嘛唄啦於與及裏麽")

kana   = re.compile(r"[぀-ヿ]")
hangul = re.compile(r"[가-힯]")
han    = re.compile(r"[一-鿿]")
cjk    = re.compile(r"[぀-ヿ一-鿿가-힯]")
# only these frontmatter keys carry schema human-readable values
KEYVAL = re.compile(r'^\s*(?:-\s*)?(q|a|name|text):\s*(.+?)\s*$')

def frontmatter_lines(path):
    out=[]
    with open(path, encoding="utf-8") as f:
        lines=f.readlines()
    if not lines or not lines[0].startswith("---"):
        return out
    for i,l in enumerate(lines[1:], start=2):
        if l.startswith("---"): break
        out.append((i, l.rstrip("\n")))
    return out

def is_leak(locale, val):
    # by-design: 創 (create) char described in image_alt, 한글/Hangul product name in EN
    if "創" in val: return False
    if locale in LATIN:
        if not cjk.search(val): return False
        # english article legitimately discussing Korean product 한글 (HWP)
        if locale=="english" and hangul.search(val) and not han.search(val) and not kana.search(val):
            return False
        return True
    if locale == "ja":
        # leaked Chinese: Han, no kana, no hangul, AND a Chinese-only marker present
        if kana.search(val) or hangul.search(val): return False
        return bool(han.search(val)) and (any(c in ZH_MARKERS for c in val) or any(c in TRAD for c in val))
    if locale == "ko":
        return bool(cjk.search(val)) and not hangul.search(val)
    if locale == "zh-cn":
        return any(c in TRAD for c in val)
    return False  # zh-tw master / unknown

def main():
    results={}
    for locdir in sorted(os.listdir(CONTENT)):
        base=os.path.join(CONTENT, locdir, "post")
        if not os.path.isdir(base): continue
        for idx in glob.glob(os.path.join(base,"*","index.md")):
            slug=os.path.basename(os.path.dirname(idx))
            hits=[(ln, m.group(2)[:48]) for ln,t in frontmatter_lines(idx)
                  if (m:=KEYVAL.match(t)) and is_leak(locdir, m.group(2))]
            if hits: results.setdefault(slug,{})[locdir]=hits
    total=sum(len(h) for s in results.values() for h in s.values())
    for slug in sorted(results):
        print(f"\n■ {slug}")
        for loc in sorted(results[slug]):
            print(f"    {loc:9s} {len(results[slug][loc]):2d} 行   e.g. {results[slug][loc][0][1]}")
    if total:
        print(f"\n❌ {total} 行 schema-locale leak，{sum(len(v) for v in results.values())} 個 (slug×locale)")
        sys.exit(1)
    print("✅ schema-locale-leak: 0 leak（faq_schema / howto_schema 全 locale 語言對齊）")
    sys.exit(0)

if __name__ == "__main__":
    main()
