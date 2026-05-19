#!/usr/bin/env python3
"""
Batch replace English jargon leaking into CJK prose with locale-appropriate equivalents.

Scope:
  - 4 CJK locales: zh-tw, zh-cn, ja, ko
  - 17 keeply-blog articles (content/{locale}/post/{slug}/index.md)

Preservation:
  - Frontmatter (--- ... ---) untouched
  - Fenced code blocks (``` ... ```) untouched
  - Inline code (`...`) untouched
  - URLs and link targets ([text](url)) untouched in url part
  - Brand / product names (Time Machine, AutoRecover, SmartScreen, etc.) untouched

Two-stage replacement:
  1. Phrase-level (e.g. "conflicted copy" → "衝突副本")
  2. Token-level (e.g. "sync" → "同步")

Strategy: protect-then-replace.
  - Replace protected sequences with sentinels first
  - Apply phrase + token replacements
  - Restore protected sequences
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

LOCALES = ["zh-tw", "zh-cn", "ja", "ko"]

# --- Protected sequences (regex patterns whose matches stay verbatim) ---
PROTECT_PATTERNS = [
    # Frontmatter is handled separately (split off before replacement)
    # Fenced code blocks
    re.compile(r"```[\s\S]*?```", re.MULTILINE),
    # Inline code
    re.compile(r"`[^`\n]+`"),
    # Link targets [text](url) — only the (url) part — keep [text] for translation
    re.compile(r"\((https?://[^)]+|/[^)]*|#[^)]*)\)"),
    # Bare URLs
    re.compile(r"https?://\S+"),
    # Hugo shortcodes {{< ... >}} {{% ... %}}
    re.compile(r"\{\{[<%][^}]*[>%]\}\}"),
    # Heading anchors {#anchor-id}
    re.compile(r"\{#[^}]+\}"),
    # HTML tags
    re.compile(r"<[a-zA-Z/][^>]*>"),
    # Multi-word brand / product names — must be matched before token replacement
    # so component words don't get translated
    re.compile(r"\bTime Machine\b"),
    re.compile(r"\bConflict-Detection\b"),
    re.compile(r"\bConflict Detection\b"),
    re.compile(r"\bConflict-detection\b"),
    re.compile(r"\bLocal Clone(?: Pattern)?\b"),
    re.compile(r"\bSMB safety layer\b", re.IGNORECASE),
    re.compile(r"\bPAS\b"),  # framework name
    re.compile(r"\bvibe coding\b", re.IGNORECASE),
    re.compile(r"\bAutoRecover\b"),
    re.compile(r"\bSmartScreen\b"),
    re.compile(r"\bSharePoint\b"),
    re.compile(r"\bGatekeeper\b"),
    re.compile(r"\bBackblaze\b"),
    re.compile(r"\bIDrive\b"),
    re.compile(r"\bWi-Fi\b"),
    re.compile(r"\bGit LFS\b"),
    re.compile(r"\bgit terminology\b"),
    re.compile(r"\bgit2 引擎\b"),
    re.compile(r"\bgit2\s+engine\b", re.IGNORECASE),
    re.compile(r"\bMicrosoft Word\b"),
    re.compile(r"\bMicrosoft 365\b"),
    re.compile(r"\bGoogle Docs\b"),
    re.compile(r"\bGoogle Drive\b"),
    re.compile(r"\bAdobe Creative Cloud(?: Files)?\b"),
    re.compile(r"\bBentley ProjectWise\b"),
    re.compile(r"\bHacker News\b"),
    re.compile(r"\bCmd\+[A-Z]\b"),
    re.compile(r"\bCtrl\+[A-Z]\b"),
    re.compile(r"\bM[0-9]+-[0-9]+\b"),  # spec IDs M3-100
    re.compile(r"\bADR-[0-9]+\b"),
    re.compile(r"\bV[0-9]+(?:\.[0-9]+)?\b"),  # V1, V3, V5
    re.compile(r"\bv[0-9]+(?:\.[0-9]+)?\b"),
    re.compile(r"\bB[0-9]+\b"),  # B7
    re.compile(r"\bSSD\b"),
    re.compile(r"\bHDD\b"),
    re.compile(r"\bTRIM\b"),  # all-caps SSD command
    re.compile(r"\bNAS\b"),
    re.compile(r"\bSMB\b"),
    re.compile(r"\bCSV\b"),
    re.compile(r"\bAPI\b"),
    re.compile(r"\bUI\b"),
    re.compile(r"\bUX\b"),
    re.compile(r"\bIT\b"),  # IT department / Information Technology
    re.compile(r"\bSDK\b"),
    re.compile(r"\bCLI\b"),
    re.compile(r"\bGUI\b"),
    re.compile(r"\bSaaS\b"),
    re.compile(r"\bSEO\b"),
    re.compile(r"\bSERP\b"),
    re.compile(r"\bMS\b"),
    re.compile(r"\bOS\b"),
    re.compile(r"\bPC\b"),
    re.compile(r"\bMac\b"),
    re.compile(r"\bWindows\b"),
    re.compile(r"\bLinux\b"),
    re.compile(r"\bCAD\b"),
    re.compile(r"\bSDK\b"),
    re.compile(r"\bSD\b"),  # SD card
    # Names
    re.compile(r"\bAnna\b"),
    re.compile(r"\bPeter Krogh\b"),
    re.compile(r"\bjulianozen\b"),
    re.compile(r"\blazide\b"),
    re.compile(r"\bWill Styler\b"),
    re.compile(r"\bWill\b(?=\s+[A-Z])"),  # Will followed by a capitalized name
    re.compile(r"\bMac only\b", re.IGNORECASE),
    re.compile(r"\bmacOS-only\b", re.IGNORECASE),
    re.compile(r"\bCell-level\b", re.IGNORECASE),
    re.compile(r"\bmilestone freeze\b", re.IGNORECASE),
    re.compile(r"\bRelease milestone\b"),
    re.compile(r"\bRedundancy doesn't prevent stupidity\b"),
    re.compile(r"\bRedundancy doesn[’']t prevent stupidity\b"),
    re.compile(r"\bReal developer\b"),
    re.compile(r"\bCLI access\b"),
    re.compile(r"\bAtlassian\b"),
    re.compile(r"\bStack Overflow\b"),
    re.compile(r"\bClaude Code\b"),
    re.compile(r"\bMicrosoft Learn\b"),
    re.compile(r"\bMicrosoft Excel\b"),
    re.compile(r"\bExcel for Web\b"),
    re.compile(r"\bMac App Store\b"),
    re.compile(r"\bMicrosoft Store\b"),
    re.compile(r"\bMicrosoft Defender\b"),
    re.compile(r"\bWindows Defender\b"),
    re.compile(r"\bFile History\b"),
    re.compile(r"\bVersion History\b"),
    re.compile(r"\bMercurial\b"),
    re.compile(r"\bSubversion\b"),
    re.compile(r"\bPowerShell\b"),
    re.compile(r"\bGit\b"),  # capitalized Git the tool
    re.compile(r"\bGitHub\b"),
    re.compile(r"\bGitLab\b"),
    re.compile(r"\bDropbox(?:[^a-zA-Z]|$)", re.MULTILINE),  # avoid greedy replace
    # SEO acronyms
    re.compile(r"\bGSC\b"),
    re.compile(r"\bBWT\b"),
    re.compile(r"\bGA4\b"),
    re.compile(r"\bICP\b"),
    re.compile(r"\bJTBD\b"),
    re.compile(r"\bE-E-A-T\b"),
    # Apple / brand suffixes
    re.compile(r"\bApple\b"),
    # Common file extensions in body (case-insensitive after dot)
    re.compile(r"\.(?:docx?|xlsx?|pptx?|pdf|csv|txt|md|jpg|jpeg|png|svg|gif|webp|mp[34]|mov|zip|rar|7z|tar|gz|dwg|dxf|rvt|skp|3dm|psd|ai|indd|html?|js|ts|tsx|json|xml|yaml|yml|toml|py|rb|go|rs|java|kt|swift|c|cpp|exe|dmg|pkg|deb|rpm|apk|ipa|msi)\b", re.IGNORECASE),
    # File names with extensions in tables (e.g. A-05_側溝_0418.dwg)
    re.compile(r"[A-Za-z0-9_\-]+\.(?:dwg|dxf|rvt|skp|psd|ai|indd|docx?|xlsx?|pdf|jpg|png)\b", re.IGNORECASE),
    # Short version refs (R12 / R2 etc — Walk-through R12, etc)
    re.compile(r"\bR[0-9]+\b"),
    # Spec IDs in slashes
    re.compile(r"\bspec\s+M[0-9]+-[0-9]+\b"),
]

# --- Phrase replacements per locale (applied after protection, before token-level) ---
PHRASE_MAP = {
    "zh-tw": [
        ("conflicted copy", "衝突副本"),
        ("working copy", "工作副本"),
        ("auto-save", "自動儲存"),
        ("always-on", "常駐"),
        ("trade-off", "取捨"),
        ("lock-in", "綁定"),
        ("co-edit", "共同編輯"),
        ("cherry-pick", "挑揀"),
        ("operator-error", "操作失誤"),
        ("real-time collaboration", "即時協作"),
        ("real-time", "即時"),
        ("desktop-first", "桌面優先"),
        ("桌面-first", "桌面優先"),
        ("UI prompt", "提示視窗"),
        ("version history", "版本歷史"),
        ("information gain", "資訊增量"),
        ("Pros", "優點"),
        ("Cons", "缺點"),
        ("hit piece", "攻擊文"),
        ("walk-through", "操作示範"),
    ],
    "zh-cn": [
        ("conflicted copy", "冲突副本"),
        ("working copy", "工作副本"),
        ("auto-save", "自动保存"),
        ("always-on", "常驻"),
        ("trade-off", "取舍"),
        ("lock-in", "绑定"),
        ("co-edit", "协同编辑"),
        ("cherry-pick", "挑拣"),
        ("operator-error", "操作失误"),
        ("real-time collaboration", "即时协作"),
        ("real-time", "即时"),
        ("desktop-first", "桌面优先"),
        ("桌面-first", "桌面优先"),
        ("UI prompt", "提示窗口"),
        ("version history", "版本历史"),
        ("information gain", "信息增量"),
        ("Pros", "优点"),
        ("Cons", "缺点"),
        ("hit piece", "攻击文"),
        ("walk-through", "操作演示"),
    ],
    "ja": [
        ("conflicted copy", "競合コピー"),
        ("working copy", "作業コピー"),
        ("auto-save", "自動保存"),
        ("always-on", "常時稼働"),
        ("trade-off", "トレードオフ"),
        ("lock-in", "囲い込み"),
        ("co-edit", "同時編集"),
        ("cherry-pick", "つまみ食い"),
        ("operator-error", "操作ミス"),
        ("real-time collaboration", "リアルタイム共同編集"),
        ("real-time", "リアルタイム"),
        ("desktop-first", "デスクトップ優先"),
        ("デスクトップ-first", "デスクトップ優先"),
        ("UI prompt", "確認ダイアログ"),
        ("version history", "バージョン履歴"),
        ("information gain", "情報増分"),
        ("Pros", "利点"),
        ("Cons", "欠点"),
        ("hit piece", "攻撃記事"),
        ("walk-through", "操作デモ"),
    ],
    "ko": [
        ("conflicted copy", "충돌 사본"),
        ("working copy", "작업 사본"),
        ("auto-save", "자동 저장"),
        ("always-on", "상시"),
        ("trade-off", "트레이드오프"),
        ("lock-in", "락인"),
        ("co-edit", "공동 편집"),
        ("cherry-pick", "골라쓰기"),
        ("operator-error", "조작 실수"),
        ("real-time collaboration", "실시간 협업"),
        ("real-time", "실시간"),
        ("desktop-first", "데스크톱 우선"),
        ("데스크톱-first", "데스크톱 우선"),
        ("UI prompt", "알림 창"),
        ("version history", "버전 기록"),
        ("information gain", "정보 증분"),
        ("Pros", "장점"),
        ("Cons", "단점"),
        ("hit piece", "공격 글"),
        ("walk-through", "사용 시연"),
    ],
}

# --- Token replacements per locale (only when CJK-adjacent; case-insensitive but preserves known forms) ---
TOKEN_MAP = {
    "zh-tw": {
        "sync": "同步", "mechanism": "機制", "collision": "衝突", "prompt": "提示",
        "push": "推送", "local": "本機", "user": "使用者", "version": "版本",
        "retention": "保留期", "history": "紀錄", "metadata": "元資料",
        "undo": "復原", "timeline": "時間軸", "prune": "清除", "trim": "修剪",
        "diff": "比對", "sector": "磁區", "layer": "層", "prefix": "前綴",
        "key": "關鍵", "file": "檔案", "email": "電子郵件", "delete": "刪除",
        "commit": "存檔點", "release": "發行版", "spreadsheet": "試算表",
        "scenario": "情境", "snapshot": "快照", "subscription": "訂閱",
        "onboarding": "上手", "fix": "修法", "repo": "倉庫", "dev": "工程師",
        "docs": "文件", "hidden": "隱藏", "byte": "位元組", "cell": "儲存格",
        "column": "欄", "debug": "除錯", "desktop": "桌面", "filename": "檔名",
        "query": "查詢", "config": "設定", "recycle": "回收", "trash": "垃圾桶",
        "trivial": "微小", "sidebar": "側邊欄", "store": "商店", "logo": "標誌",
        "anatomy": "結構", "applications": "應用", "helper": "輔助工具",
        "installer": "安裝程式", "invariant": "不變條件", "origin": "來源",
        "policy": "政策", "reputation": "信譽", "safety": "安全",
        "serp": "搜尋結果頁", "text": "文字", "forensics": "鑑識",
        "canonical": "正本", "app": "應用",
        "code": "程式碼", "coding": "寫程式", "copy": "副本",
        "anchor": "錨點", "bait": "誘餌", "size": "大小",
        "mapped": "映射", "grayed": "變灰", "smartphones": "智慧手機",
        "case": "情境", "context": "情境",
        "terminology": "術語", "review": "審視",
        "cloud": "雲端", "recovery": "救援", "auto": "自動", "hash": "雜湊值",
        "clone": "副本", "online": "線上", "conflicted": "衝突",
        "redundancy": "備援", "stupidity": "失誤", "of": "的",
        "use": "使用", "commercial": "商業", "project": "專案",
        "graph": "圖表", "window": "視窗", "net": "網",
        "vivid": "鮮明", "brief": "簡述", "enclosure": "附件",
        "function": "功能", "export": "匯出", "destructive": "破壞性",
        "bin": "資料夾", "out": "外", "with": "與", "work": "運作",
        "edits": "編輯", "multiple": "多人",
    },
    "zh-cn": {
        "sync": "同步", "mechanism": "机制", "collision": "冲突", "prompt": "提示",
        "push": "推送", "local": "本机", "user": "用户", "version": "版本",
        "retention": "保留期", "history": "记录", "metadata": "元数据",
        "undo": "撤销", "timeline": "时间轴", "prune": "清除", "trim": "修剪",
        "diff": "比对", "sector": "磁区", "layer": "层", "prefix": "前缀",
        "key": "关键", "file": "文件", "email": "邮件", "delete": "删除",
        "commit": "存档点", "release": "发布版", "spreadsheet": "电子表格",
        "scenario": "场景", "snapshot": "快照", "subscription": "订阅",
        "onboarding": "上手", "fix": "修法", "repo": "仓库", "dev": "工程师",
        "docs": "文档", "hidden": "隐藏", "byte": "字节", "cell": "单元格",
        "column": "列", "debug": "调试", "desktop": "桌面", "filename": "文件名",
        "query": "查询", "config": "配置", "recycle": "回收", "trash": "回收站",
        "trivial": "微小", "sidebar": "侧边栏", "store": "商店", "logo": "标志",
        "anatomy": "结构", "applications": "应用", "helper": "辅助工具",
        "installer": "安装程序", "invariant": "不变条件", "origin": "来源",
        "policy": "策略", "reputation": "信誉", "safety": "安全",
        "serp": "搜索结果页", "text": "文字", "forensics": "取证",
        "canonical": "正本", "app": "应用",
        "code": "代码", "coding": "编程", "copy": "副本",
        "anchor": "锚点", "bait": "诱饵", "size": "大小",
        "mapped": "映射", "grayed": "变灰", "smartphones": "智能手机",
        "case": "场景", "context": "上下文",
        "terminology": "术语", "review": "审视",
        "cloud": "云端", "recovery": "恢复", "auto": "自动", "hash": "哈希值",
        "clone": "副本", "online": "在线", "conflicted": "冲突",
        "redundancy": "冗余", "stupidity": "失误", "of": "的",
        "use": "使用", "commercial": "商业", "project": "项目",
        "graph": "图表", "window": "窗口", "net": "网",
        "vivid": "鲜明", "brief": "简述", "enclosure": "附件",
        "function": "功能", "export": "导出", "destructive": "破坏性",
        "bin": "文件夹", "out": "外", "with": "与", "work": "运作",
        "edits": "编辑", "multiple": "多人",
    },
    "ja": {
        "sync": "同期", "mechanism": "仕組み", "collision": "衝突", "prompt": "確認画面",
        "push": "プッシュ", "local": "ローカル", "user": "ユーザー", "version": "バージョン",
        "retention": "保持期間", "history": "履歴", "metadata": "メタデータ",
        "undo": "元に戻す", "timeline": "タイムライン", "prune": "削減", "trim": "トリム",
        "diff": "差分", "sector": "セクタ", "layer": "層", "prefix": "プレフィックス",
        "key": "鍵", "file": "ファイル", "email": "メール", "delete": "削除",
        "commit": "保存ポイント", "release": "リリース", "spreadsheet": "スプレッドシート",
        "scenario": "シナリオ", "snapshot": "スナップショット", "subscription": "サブスク",
        "onboarding": "立ち上げ", "fix": "対処", "repo": "リポジトリ", "dev": "開発者",
        "docs": "ドキュメント", "hidden": "隠れた", "byte": "バイト", "cell": "セル",
        "column": "列", "debug": "デバッグ", "desktop": "デスクトップ", "filename": "ファイル名",
        "query": "クエリ", "config": "設定", "recycle": "ゴミ箱", "trash": "ゴミ箱",
        "trivial": "些細", "sidebar": "サイドバー", "store": "ストア", "logo": "ロゴ",
        "anatomy": "構造", "applications": "アプリ", "helper": "ヘルパー",
        "installer": "インストーラー", "invariant": "不変条件", "origin": "由来",
        "policy": "ポリシー", "reputation": "評判", "safety": "安全",
        "serp": "検索結果", "text": "テキスト", "forensics": "フォレンジック",
        "canonical": "正本", "app": "アプリ",
        "code": "コード", "coding": "コーディング", "copy": "コピー",
        "anchor": "アンカー", "bait": "ベイト", "size": "サイズ",
        "mapped": "マッピング", "grayed": "グレーアウト", "smartphones": "スマホ",
        "case": "ケース", "context": "コンテキスト",
        "terminology": "用語", "review": "見直し",
        "cloud": "クラウド", "recovery": "復旧", "auto": "自動", "hash": "ハッシュ",
        "clone": "クローン", "online": "オンライン", "conflicted": "競合",
        "redundancy": "冗長", "stupidity": "ミス", "of": "の",
        "use": "使用", "commercial": "商業", "project": "プロジェクト",
        "graph": "グラフ", "window": "ウィンドウ", "net": "網",
        "vivid": "鮮明", "brief": "概要", "enclosure": "添付",
        "function": "機能", "export": "エクスポート", "destructive": "破壊的",
        "bin": "フォルダ", "out": "外", "with": "と", "work": "動作",
        "edits": "編集", "multiple": "複数",
    },
    "ko": {
        "sync": "동기화", "mechanism": "메커니즘", "collision": "충돌", "prompt": "알림 창",
        "push": "푸시", "local": "로컬", "user": "사용자", "version": "버전",
        "retention": "보존기간", "history": "기록", "metadata": "메타데이터",
        "undo": "실행 취소", "timeline": "타임라인", "prune": "정리", "trim": "축소",
        "diff": "차이", "sector": "섹터", "layer": "계층", "prefix": "접두사",
        "key": "핵심", "file": "파일", "email": "이메일", "delete": "삭제",
        "commit": "저장 시점", "release": "릴리스", "spreadsheet": "스프레드시트",
        "scenario": "시나리오", "snapshot": "스냅샷", "subscription": "구독",
        "onboarding": "시작 가이드", "fix": "해결", "repo": "저장소", "dev": "개발자",
        "docs": "문서", "hidden": "숨김", "byte": "바이트", "cell": "셀",
        "column": "열", "debug": "디버그", "desktop": "데스크톱", "filename": "파일명",
        "query": "쿼리", "config": "설정", "recycle": "휴지통", "trash": "휴지통",
        "trivial": "사소한", "sidebar": "사이드바", "store": "스토어", "logo": "로고",
        "anatomy": "구조", "applications": "애플리케이션", "helper": "헬퍼",
        "installer": "설치 프로그램", "invariant": "불변조건", "origin": "출처",
        "policy": "정책", "reputation": "평판", "safety": "안전",
        "serp": "검색 결과 페이지", "text": "텍스트", "forensics": "포렌식",
        "canonical": "정본", "app": "앱",
        "code": "코드", "coding": "코딩", "copy": "사본",
        "anchor": "앵커", "bait": "미끼", "size": "크기",
        "mapped": "매핑", "grayed": "흐리게", "smartphones": "스마트폰",
        "case": "사례", "context": "맥락",
        "terminology": "용어", "review": "검토",
        "cloud": "클라우드", "recovery": "복구", "auto": "자동", "hash": "해시",
        "clone": "클론", "online": "온라인", "conflicted": "충돌",
        "redundancy": "중복", "stupidity": "실수", "of": "의",
        "use": "사용", "commercial": "상업", "project": "프로젝트",
        "graph": "그래프", "window": "창", "net": "망",
        "vivid": "생생한", "brief": "간략", "enclosure": "첨부",
        "function": "기능", "export": "내보내기", "destructive": "파괴적",
        "bin": "폴더", "out": "밖", "with": "와", "work": "작동",
        "edits": "편집", "multiple": "여러",
    },
}

CJK_CHAR = r"[一-鿿぀-ゟ゠-ヿ가-힯]"


def split_frontmatter(text: str) -> tuple[str, str]:
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            return text[: end + 5], text[end + 5 :]
    return "", text


def protect(body: str) -> tuple[str, list[str]]:
    """Replace each protected match with a sentinel; return (transformed_body, store)."""
    store: list[str] = []
    out = body

    def make_repl(m):
        store.append(m.group(0))
        return f"\x00P{len(store) - 1}\x00"

    for pat in PROTECT_PATTERNS:
        out = pat.sub(make_repl, out)
    return out, store


def restore(body: str, store: list[str]) -> str:
    def repl(m):
        idx = int(m.group(1))
        return store[idx]

    return re.sub(r"\x00P(\d+)\x00", repl, body)


def is_cjk_dominant_line(line: str) -> bool:
    """True iff line contains ≥2 CJK chars (even after protection sentinels removed).

    Rationale: any line targeting CJK readers should not have raw English jargon —
    even when much of the line is brand names (which become protected sentinels).
    Threshold of 2 CJK chars excludes pure-English lines (e.g. URLs, code lines).
    """
    ratio_src = re.sub(r"\x00P\d+\x00", "", line)
    cjk_n = len(re.findall(CJK_CHAR, ratio_src))
    return cjk_n >= 2


ASCII_WORD = r"[A-Za-z0-9_]"
# ASCII-only word boundary — \b counts CJK as word char in Python re,
# which prevents matches like "Timeline에" where CJK is adjacent.
LB_NOT_ASCII = r"(?<![A-Za-z0-9_])"
LA_NOT_ASCII = r"(?![A-Za-z0-9_])"


def replace_phrases(body: str, phrases: list[tuple[str, str]]) -> tuple[str, int]:
    """Replace phrases inside CJK-dominant, non-blockquote lines."""
    count = 0
    out_lines = []
    for line in body.splitlines(keepends=True):
        if line.lstrip().startswith(">"):
            out_lines.append(line)
            continue
        if not is_cjk_dominant_line(line):
            out_lines.append(line)
            continue
        new_line = line
        for src, dst in phrases:
            pat = re.compile(LB_NOT_ASCII + re.escape(src) + LA_NOT_ASCII, re.IGNORECASE)
            def repl(m, replacement=dst):
                nonlocal count
                count += 1
                return replacement
            new_line = pat.sub(repl, new_line)
        out_lines.append(new_line)
    return "".join(out_lines), count


def replace_tokens(body: str, tokens: dict[str, str]) -> tuple[str, int]:
    """Replace English tokens in any line with CJK ratio >= 30%.

    Lines are processed individually. Inside a CJK-majority line, every
    English token (after protection) that matches a key in the map is
    replaced — regardless of immediate-neighbor punctuation/letters.
    """
    count = 0
    sorted_tokens = sorted(tokens.items(), key=lambda kv: -len(kv[0]))

    out_lines = []
    for line in body.splitlines(keepends=True):
        if line.lstrip().startswith(">"):
            out_lines.append(line)
            continue
        if not is_cjk_dominant_line(line):
            out_lines.append(line)
            continue

        new_line = line
        for src, dst in sorted_tokens:
            pat = re.compile(LB_NOT_ASCII + re.escape(src) + LA_NOT_ASCII, re.IGNORECASE)
            def repl(m, replacement=dst):
                nonlocal count
                count += 1
                return replacement
            new_line = pat.sub(repl, new_line)
        out_lines.append(new_line)
    return "".join(out_lines), count


def transform(text: str, locale: str) -> tuple[str, int]:
    fm, body = split_frontmatter(text)
    body_protected, store = protect(body)

    body_protected, n1 = replace_phrases(body_protected, PHRASE_MAP[locale])
    body_protected, n2 = replace_tokens(body_protected, TOKEN_MAP[locale])

    body_restored = restore(body_protected, store)
    return fm + body_restored, n1 + n2


def main():
    target_slugs = sys.argv[1:] if len(sys.argv) > 1 else None
    total = 0
    files_changed = 0
    for locale in LOCALES:
        loc_dir = CONTENT / locale / "post"
        if not loc_dir.exists():
            continue
        for slug_dir in sorted(loc_dir.iterdir()):
            if not slug_dir.is_dir():
                continue
            slug = slug_dir.name
            if target_slugs and slug not in target_slugs:
                continue
            md = slug_dir / "index.md"
            if not md.exists():
                continue
            original = md.read_text(encoding="utf-8")
            new_text, n = transform(original, locale)
            if n and new_text != original:
                md.write_text(new_text, encoding="utf-8")
                files_changed += 1
                total += n
                print(f"[{locale:5s}] {slug}: {n} replacements")
    print(f"\nDone. {total} replacements across {files_changed} files.")


if __name__ == "__main__":
    main()
