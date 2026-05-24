#!/usr/bin/env python3
"""Cross-locale language consistency audit (T16-leak guard).

Scans every `content/{ja,ko,it,zh-tw,zh-cn}/post/*/index.md` for English
tech-term leaks that should have been translated to the local language.

Phase 0 — allowlist (always kept in English):
    - Brand names: OneDrive, Microsoft, Word, Excel, PowerPoint, GitHub,
      Dropbox, Adobe, AutoCAD, Premiere, Photoshop, Time Machine, Apple,
      Google, Notion, Figma, Tina, NAS, RAID, SSO, etc.
    - File extensions: .docx, .asd, .psd, ...
    - Acronyms: CFO, CTO, IT, SOX, HIPAA, GDPR, CLI, GUI
    - Code spans: anything in backticks
    - Code-like inline strings: Cmd+S, Ctrl+S, git, etc.
    - URLs: ignored entirely

Phase 1 — blacklist (must be translated per locale):
    Tech terms that have widely-used local equivalents.
    Per-locale translation table below.

Phase 2 — auto-translation:
    --fix mode auto-applies the translation table.

Exit code:
    0 = all clean
    1 = HARD violations (any blacklist hit in body)

Usage:
    python _dev/blog/language-consistency-audit.py
    python _dev/blog/language-consistency-audit.py --slug onedrive-version-history
    python _dev/blog/language-consistency-audit.py --fix          # auto-fix and write
    python _dev/blog/language-consistency-audit.py --locale ja
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"
LOCALES = {
    "ja": "ja",
    "ko": "ko",
    "it": "it",
    "zh-tw": "zh-tw",
    "zh-cn": "zh-cn",
}

# Allowlist — these stay in English even inside non-English locales.
ALLOWLIST_TERMS = {
    # Brand / product names
    "OneDrive", "SharePoint", "Microsoft", "Microsoft 365", "Microsoft Learn",
    "Microsoft Support", "Microsoft Q&A", "Word", "Excel", "PowerPoint",
    "Office", "Outlook", "Teams", "Azure", "Visual Studio",
    "GitHub", "GitLab", "Bitbucket", "git", "Mercurial", "svn", "Perforce",
    "Dropbox", "Google", "Google Drive", "Google Docs", "Google Workspace",
    "Notion", "Figma", "Slack", "Tactiq",
    "Adobe", "Photoshop", "Illustrator", "Premiere", "Acrobat",
    "AutoCAD", "Revit", "Apple", "macOS", "Mac", "Time Machine", "Finder",
    "Windows", "Linux", "iCloud", "iCloud Photos", "iOS", "iPad", "iPhone",
    "Keeply", "Release",  # Keeply feature names kept English
    "DocuSign", "Adobe Sign", "Veeam", "Acronis", "Backblaze", "M-Files",
    "Docuware", "Backblaze B2", "Mac", "Mercurial", "Fossil", "Pijul",
    "Synology", "QNAP", "Setapp", "Macworld", "Wikipedia", "Reddit",
    "FAQ", "TOC", "TL;DR",  # universal abbreviations
    "MS Support", "MS Learn", "MS Q&A",
    "Code Connect", "AI Overview",
    "HUIT", "UConn", "umaryland", "Harvard",
    "Anatomy of Work", "Asana", "McKinsey", "IDC",
    # File extensions kept as-is via dotted form
    # Code-like tokens
    "Cmd+S", "Ctrl+S", "Cmd+S", "Cmd-S", "Ctrl-S",
    "CFO", "CTO", "CEO", "COO", "CIO", "CMO", "IT",
    "SOX", "HIPAA", "GDPR", "PCI", "ISO",
    "CLI", "GUI", "UI", "UX", "API", "SDK", "CSV", "PDF", "JSON",
    "SaaS", "DAM", "LFS",
    "DLP", "SSO", "MFA", "2FA",
    "RAID", "NAS", "SMB", "SSD", "HDD", "USB", "LAN", "VPN",
    "SOC", "BWF", "ADR",
    "Hugo", "Hugo Stack", "Cloudflare", "GSC", "GA4", "BWT",
    "Tina",  # character name in articles
    # Numbers / version
    "v1", "v2", "v3", "v2.3", "v3.x",
    # Article-specific kept terms
    "FAQ schema", "Schema.org",
}

# Per-locale blacklist: English tech terms → local translation
# These are HARD violations when found in body text of the given locale.
# v2 (2026-05-15): expanded from 8 to 30+ terms covering Microsoft Office /
# SharePoint admin / SaaS / generic tech vocabulary.
BLACKLIST: dict[str, dict[str, str]] = {
    "ja": {
        # Microsoft / Office terms
        "AutoRecover": "自動回復",
        "Recycle Bin": "ごみ箱",
        "auto-delete": "自動削除",
        "Auto-delete": "自動削除",
        "admin center": "管理センター",
        "Admin Center": "管理センター",
        "tenant level": "テナントレベル",
        "tenant": "テナント",
        "site collection": "サイトコレクション",
        "storage quota": "ストレージ容量",
        "storage tier": "ストレージ階層",
        "storage cost": "ストレージコスト",
        "storage": "ストレージ",
        "major versions": "メジャーバージョン",
        "major version": "メジャーバージョン",
        "minor versions": "マイナーバージョン",
        "minor version": "マイナーバージョン",
        "versioning": "バージョニング",
        # Generic tech
        "Release freeze": "リリース凍結",
        "Release-freeze": "リリース凍結",
        "Mock UI": "モック UI",
        "per-file note": "ファイル単位ノート",
        "per-file": "ファイル単位",
        "cross-tool portability": "クロスツール移植性",
        "cross-tool": "クロスツール",
        "cutoff": "カットオフ",
        "trade-off": "トレードオフ",
        "bookkeeping": "記録管理",
        # Office workflow
        "board approved": "取締役会承認",
        "board-approved": "取締役会承認",
        "client signed": "クライアント承認",
        "client-signed": "クライアント承認",
        "IT admin": "IT 管理者",
        "board approval": "取締役会承認",
        "board": "取締役会",
        "active document": "アクティブドキュメント",
        "unlimited": "無制限",
        "mobile-only": "モバイル専用",
        "Office mobile": "Office モバイル",
        "SharePoint mobile": "SharePoint モバイル",
        "overkill": "過剰",
        "cleanup": "クリーンアップ",
        "Storage cost": "ストレージコスト",
        "compliance archive": "コンプライアンスアーカイブ",
        "audit chain": "監査チェーン",
        # v3 expansion
        "autosave": "自動保存",
        "Autosave": "自動保存",
        "auto-save": "自動保存",
        "Auto-save": "自動保存",
        "timeline": "タイムライン",
        "Timeline": "タイムライン",
        # v4 Korean tech term translations
        "자동 저장": "自動保存",
        "자동 저장 (Autosave)": "自動保存（Autosave）",
        "자동저장": "自動保存",
        "임시 저장": "一時保存",
        "임시저장": "一時保存",
        "백업파일": "バックアップファイル",
        "백업 파일": "バックアップファイル",
        "환경 설정": "環境設定",
        "환경설정": "環境設定",
        "복구하시겠습니까": "復元しますか",
        "최근 문서": "最近のファイル",
        "응용 프로그램 오류": "アプリケーションエラー",
        "작업 관리자에서 종료": "タスクマネージャーで終了",
        "월간 보고서": "月次レポート",
        "상사 제출": "上司提出",
        "rollback": "ロールバック",
        "snapshot": "スナップショット",
        "milestone": "マイルストーン",
        "checkpoint": "チェックポイント",
        "lockdown": "ロックダウン",
        "crash recovery": "クラッシュ復旧",
        "force-quit": "強制終了",
        "real-time": "リアルタイム",
        "background": "バックグラウンド",
        "foreground": "フォアグラウンド",
        "workflow": "ワークフロー",
        "Workflow": "ワークフロー",
        "deadline": "締切",
        "Deadline": "締切",
        # "cap" handled via regex (CAP_RE)
        # "site" alone NOT auto-translated (避免 domain name 衝突)
    },
    "ko": {
        "AutoRecover": "자동 복구",
        "Recycle Bin": "휴지통",
        "auto-delete": "자동 삭제",
        "Auto-delete": "자동 삭제",
        "admin center": "관리 센터",
        "Admin Center": "관리 센터",
        "tenant level": "tenant 레벨",
        "tenant": "tenant",
        "site collection": "사이트 컬렉션",
        "storage quota": "스토리지 할당량",
        "storage tier": "스토리지 계층",
        "storage cost": "스토리지 비용",
        "storage": "스토리지",
        "major versions": "주요 버전",
        "major version": "주요 버전",
        "minor versions": "부 버전",
        "minor version": "부 버전",
        "versioning": "버전 관리",
        "Release freeze": "Release 잠금",
        "Release-freeze": "Release 잠금",
        "Mock UI": "모크 UI",
        "per-file note": "파일별 노트",
        "per-file": "파일별",
        "cross-tool portability": "크로스 도구 이식성",
        "cross-tool": "크로스 도구",
        "cutoff": "컷오프",
        "trade-off": "트레이드오프",
        "bookkeeping": "기록 관리",
        "board approved": "이사회 승인",
        "board-approved": "이사회 승인",
        "client signed": "고객 서명",
        "client-signed": "고객 서명",
        "IT admin": "IT 관리자",
        "board approval": "이사회 승인",
        "board": "이사회",
        "active document": "활성 문서",
        "unlimited": "무제한",
        "mobile-only": "모바일 전용",
        "Office mobile": "Office 모바일",
        "SharePoint mobile": "SharePoint 모바일",
        "overkill": "과잉",
        "cleanup": "정리",
        "Storage cost": "스토리지 비용",
        "compliance archive": "컴플라이언스 아카이브",
        "audit chain": "감사 체인",
        # v3 expansion
        "autosave": "자동 저장",
        "Autosave": "자동 저장",
        "auto-save": "자동 저장",
        "Auto-save": "자동 저장",
        "timeline": "타임라인",
        "Timeline": "타임라인",
        "rollback": "롤백",
        "snapshot": "스냅샷",
        "milestone": "마일스톤",
        "checkpoint": "체크포인트",
        "lockdown": "잠금 환경",
        "crash recovery": "비정상 종료 복구",
        "force-quit": "강제 종료",
        "real-time": "실시간",
        "background": "백그라운드",
        "foreground": "포그라운드",
        "workflow": "워크플로우",
        "Workflow": "워크플로우",
        "deadline": "마감일",
        "Deadline": "마감일",
    },
    "it": {
        "AutoRecover": "Salvataggio automatico",
        "Recycle Bin": "Cestino",
        "auto-delete": "eliminazione automatica",
        "Auto-delete": "Eliminazione automatica",
        "admin center": "centro amministrativo",
        "Admin Center": "Centro amministrativo",
        "tenant level": "livello tenant",
        # "tenant" kept English (commonly used in IT IT-IT)
        "site collection": "site collection",
        "storage quota": "quota storage",
        "storage tier": "livello storage",
        "storage cost": "costo storage",
        # "storage" kept English (commonly used in IT IT-IT)
        "major versions": "versioni principali",
        "major version": "versione principale",
        "minor versions": "versioni secondarie",
        "minor version": "versione secondaria",
        "versioning": "versioning",
        "Release freeze": "Blocco Release",
        "Release-freeze": "Blocco Release",
        "Mock UI": "mock UI",
        "per-file note": "nota per file",
        "per-file": "per file",
        "cross-tool portability": "portabilità tra strumenti",
        "cross-tool": "tra strumenti",
        "cutoff": "cutoff",
        "trade-off": "trade-off",
        "bookkeeping": "tenuta dei registri",
        "board approved": "approvato dal consiglio",
        "board-approved": "approvato dal consiglio",
        "client signed": "firmato dal cliente",
        "client-signed": "firmato dal cliente",
        "IT admin": "IT admin",  # commonly kept English in IT-IT business context
        "board approval": "approvazione del consiglio",
        "board": "consiglio",
        "active document": "documento attivo",
        "unlimited": "illimitato",
        "mobile-only": "solo mobile",
        "Office mobile": "Office mobile",
        "SharePoint mobile": "SharePoint mobile",
        "overkill": "eccessivo",
        "cleanup": "pulizia",
        "Storage cost": "costo storage",
        "compliance archive": "archivio conformità",
        "audit chain": "catena di audit",
        # v3 expansion
        "autosave": "salvataggio automatico",
        "Autosave": "Salvataggio automatico",
        "auto-save": "salvataggio automatico",
        "Auto-save": "Salvataggio automatico",
        "timeline": "timeline",  # IT kept English (commonly used loan word)
        # v4 Korean tech term translations
        "자동 저장": "salvataggio automatico",
        "자동 저장 (Autosave)": "salvataggio automatico (Autosave)",
        "자동저장": "salvataggio automatico",
        "임시 저장": "salvataggio temporaneo",
        "임시저장": "salvataggio temporaneo",
        "백업파일": "file di backup",
        "백업 파일": "file di backup",
        "환경 설정": "impostazioni",
        "환경설정": "impostazioni",
        "복구하시겠습니까": "recuperare?",
        "최근 문서": "documenti recenti",
        "응용 프로그램 오류": "errore applicazione",
        "월간 보고서": "rapporto mensile",
        "상사 제출": "inviato al supervisore",
        "rollback": "rollback",
        "snapshot": "snapshot",
        "milestone": "milestone",
        "checkpoint": "checkpoint",
        "lockdown": "lockdown",
        "crash recovery": "recupero da crash",
        "force-quit": "chiusura forzata",
        "real-time": "in tempo reale",
        "background": "background",
        "foreground": "foreground",
        "workflow": "workflow",
        "deadline": "scadenza",
        "Deadline": "Scadenza",
    },
    "zh-tw": {
        "AutoRecover": "自動回復",
        "Recycle Bin": "資源回收筒",
        "auto-delete": "自動刪除",
        "Auto-delete": "自動刪除",
        "admin center": "管理中心",
        "Admin Center": "管理中心",
        "tenant level": "租戶層級",
        "tenant": "租戶",
        "site collection": "站台集合",
        "storage quota": "儲存空間配額",
        "storage tier": "儲存階層",
        "storage cost": "儲存成本",
        "storage": "儲存空間",
        "major versions": "主要版本",
        "major version": "主要版本",
        "minor versions": "次要版本",
        "minor version": "次要版本",
        "versioning": "版本管理",
        "Release freeze": "發行版凍結",
        "Release-freeze": "發行版凍結",
        "Mock UI": "模擬介面",
        "per-file note": "單檔筆記",
        "per-file": "單檔",
        "cross-tool portability": "跨工具可攜性",
        "cross-tool": "跨工具",
        "cutoff": "截止",
        "trade-off": "取捨",
        "bookkeeping": "紀錄管理",
        "board approved": "董事會核可",
        "board-approved": "董事會核可",
        "client signed": "客戶簽核",
        "client-signed": "客戶簽核",
        "IT admin": "IT 管理員",
        "bug": "錯誤",
        "board": "董事會",
        "active document": "活躍文件",
        "unlimited": "無上限",
        "mobile-only": "純行動裝置",
        "Office mobile": "Office 行動版",
        "SharePoint mobile": "SharePoint 行動版",
        "overkill": "過度",
        "cleanup": "清理",
        "Storage cost": "儲存空間成本",
        "compliance archive": "合規封存",
        "enterprise compliance archive": "企業合規封存",
        "audit chain": "稽核軌跡",
        # v3 expansion (2026-05-15 #2): generic tech terms读者常見英文 leak
        "autosave": "自動儲存",
        "Autosave": "自動儲存",
        "auto-save": "自動儲存",
        "Auto-save": "自動儲存",
        "timeline": "時間軸",
        "Timeline": "時間軸",
        # v4 (2026-05-15 #3) — Korean tech terms must translate, brand names kept
        "자동 저장": "自動儲存",
        "자동 저장 (Autosave)": "自動儲存（Autosave）",
        "자동저장": "自動儲存",
        "임시 저장": "暫存",
        "임시저장": "暫存",
        "백업파일": "備份檔案",
        "백업 파일": "備份檔案",
        "환경 설정": "環境設定",
        "환경설정": "環境設定",
        "복구하시겠습니까": "要還原嗎",
        "최근 문서": "最近文件",
        "응용 프로그램 오류": "應用程式錯誤",
        "작업 관리자에서 종료": "工作管理員終止",
        "월간 보고서": "月度報告",
        "상사 제출": "上級送審",
        "월간 보고서": "月度報告",
        "cluster": "集群",  # 文章 cluster context = topic grouping
        "rollback": "還原",
        "Rollback": "還原",
        "snapshot": "快照",
        "Snapshot": "快照",
        "milestone": "里程碑",
        "checkpoint": "檢查點",
        "lockdown": "鎖機",
        "viewer-only": "唯讀檢視",
        "crash recovery": "當機救援",
        "force-quit": "強制終了",
        "live": "即時",
        "Live": "即時",
        "real-time": "即時",
        "background": "背景",
        "foreground": "前景",
        "workflow": "工作流程",
        "Workflow": "工作流程",
        "deadline": "截止日",
        "Deadline": "截止日",
    },
    "zh-cn": {
        "AutoRecover": "自动恢复",
        "Recycle Bin": "回收站",
        "auto-delete": "自动删除",
        "Auto-delete": "自动删除",
        "admin center": "管理中心",
        "Admin Center": "管理中心",
        "tenant level": "租户层级",
        "tenant": "租户",
        "site collection": "站点集合",
        "storage quota": "存储配额",
        "storage tier": "存储层级",
        "storage cost": "存储成本",
        "storage": "存储",
        "major versions": "主要版本",
        "major version": "主要版本",
        "minor versions": "次要版本",
        "minor version": "次要版本",
        "versioning": "版本管理",
        "Release freeze": "发布版冻结",
        "Release-freeze": "发布版冻结",
        "Mock UI": "模拟界面",
        "per-file note": "单档笔记",
        "per-file": "单档",
        "cross-tool portability": "跨工具可移植性",
        "cross-tool": "跨工具",
        "cutoff": "截止",
        "trade-off": "取舍",
        "bookkeeping": "记录管理",
        "board approved": "董事会核可",
        "board-approved": "董事会核可",
        "client signed": "客户签核",
        "client-signed": "客户签核",
        "IT admin": "IT 管理员",
        "bug": "错误",
        "board": "董事会",
        "active document": "活跃文件",
        "unlimited": "无上限",
        "mobile-only": "纯移动设备",
        "Office mobile": "Office 移动版",
        "SharePoint mobile": "SharePoint 移动版",
        "overkill": "过度",
        "cleanup": "清理",
        "Storage cost": "存储成本",
        "compliance archive": "合规封存",
        "enterprise compliance archive": "企业合规封存",
        "audit chain": "审计轨迹",
        # v3 expansion
        "autosave": "自动保存",
        "Autosave": "自动保存",
        "auto-save": "自动保存",
        "Auto-save": "自动保存",
        "timeline": "时间轴",
        "Timeline": "时间轴",
        # v4 Korean tech term translations
        "자동 저장": "自动保存",
        "자동 저장 (Autosave)": "自动保存（Autosave）",
        "자동저장": "自动保存",
        "임시 저장": "暂存",
        "임시저장": "暂存",
        "백업파일": "备份文件",
        "백업 파일": "备份文件",
        "환경 설정": "环境设置",
        "환경설정": "环境设置",
        "복구하시겠습니까": "要还原吗",
        "최근 문서": "最近文档",
        "응용 프로그램 오류": "应用程序错误",
        "작업 관리자에서 종료": "任务管理器终止",
        "월간 보고서": "月度报告",
        "상사 제출": "上级送审",
        "cluster": "集群",
        "rollback": "还原",
        "Rollback": "还原",
        "snapshot": "快照",
        "Snapshot": "快照",
        "milestone": "里程碑",
        "checkpoint": "检查点",
        "lockdown": "锁机",
        "viewer-only": "只读查看",
        "crash recovery": "崩溃救援",
        "force-quit": "强制结束",
        "live": "实时",
        "Live": "实时",
        "real-time": "实时",
        "background": "后台",
        "foreground": "前台",
        "workflow": "工作流程",
        "Workflow": "工作流程",
        "deadline": "截止日",
        "Deadline": "截止日",
    },
}

# Standalone English "cap" word translation per locale (when not followed by - or _ or # or in slug-like contexts).
CAP_RE = re.compile(r"(?<![\w\-#])cap(?!s?[\w\-_])")
CAP_TRANSLATE = {
    "ja": "上限",
    "ko": "상한",
    "it": "limite",
    "zh-tw": "上限",
    "zh-cn": "上限",
}

# Korean script (Hangul) detection — when found in non-KO locales, must be either
# in BRAND_ALLOWLIST_KOREAN (brand names) or be flagged as locale leak.
KOREAN_CHAR_RE = re.compile(r"[가-힣]+")
BRAND_ALLOWLIST_KOREAN = {
    "한글",      # Hancom Hangul (product name)
    "한컴",      # Hancom (company name)
    "한컴오피스",  # Hancom Office
    "한컴 오피스",
    "Hancom 한글",
    "Hancom 한컴 오피스",
    "Hancom 한컴오피스",
    "지영",      # Korean character name (used as scenario protagonist)
}


def strip_inline_code(text: str) -> str:
    """Remove inline code spans `...` and code fences ```...``` so they
    don't trigger false positives."""
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`\n]+`", "", text)
    return text


def strip_anchor_refs(text: str) -> str:
    """Remove markdown anchor refs `](#anchor)`, heading IDs `{#anchor}`, and
    markdown link/image targets `](filename.ext)` / `](path/to/file)` from
    audit-counting surface. These are ASCII filenames / Hugo IDs that legitimately
    contain English-looking tokens and must not be counted as locale leak."""
    # Heading IDs
    text = re.sub(r"\{#[a-zA-Z0-9\-_]+\}", "{#ANCHOR}", text)
    # All markdown link/image targets (including #anchor, filename.ext, or path)
    text = re.sub(r"\]\([^)]+\)", "](LINK)", text)
    return text


def strip_frontmatter(text: str) -> str:
    """Return body only, excluding YAML frontmatter. Tolerates BOM + CRLF (Windows)."""
    m = re.match(r"^﻿?---\r?\n.*?\r?\n---\r?\n(.*)", text, re.DOTALL)
    return m.group(1) if m else text


def strip_urls(text: str) -> str:
    """Remove markdown links + bare URLs (params often contain English)."""
    text = re.sub(r"\]\(https?://[^\s)]+\)", "](URL)", text)
    text = re.sub(r"https?://\S+", "URL", text)
    return text


# Markdown heading anchor `{#...}` must NEVER be translated — they're Hugo IDs.
# Markdown image / link `](...)` paths must NEVER be translated — they're filenames/URLs.
# Markdown code spans `...` must NEVER be translated — they're literal code/filenames.
ANCHOR_RE = re.compile(r"\{#[a-zA-Z0-9\-_]+\}")
# Markdown link/image target: `](something)` — protect path entirely whether anchor or filename
LINK_TARGET_RE = re.compile(r"\]\(([^)]+)\)")
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")


def protect_anchors(text: str) -> tuple[str, list[str]]:
    """Replace `{#anchor}`, `](url)`, `code spans` with placeholders, returning the
    protected text + the originals so they can be re-inserted after substitution.

    Combined protection (anchor IDs + link targets + inline code) ensures
    translation never breaks Hugo IDs, image paths, internal URL paths, or
    code-like content."""
    saved: list[str] = []
    protected = text

    def stash(match):
        saved.append(match.group(0))
        return f"\x00P{len(saved)-1}\x00"

    # Order matters: code first (might contain {} or ()), then anchors, then links
    protected = INLINE_CODE_RE.sub(stash, protected)
    protected = ANCHOR_RE.sub(stash, protected)
    protected = LINK_TARGET_RE.sub(stash, protected)
    return protected, saved


def restore_anchors(text: str, saved: list[str]) -> str:
    """Re-insert all protected placeholders."""
    for i, orig in enumerate(saved):
        text = text.replace(f"\x00P{i}\x00", orig, 1)
    return text


FRONTMATTER_FIELDS_TO_AUDIT = (
    "title",
    "description",
    "image_alt_data",
)


def extract_frontmatter_audit_text(text: str) -> str:
    """Pull title / description / image_alt_data / faq_schema q+a values out of
    frontmatter as a single string for blacklist scanning. These render to
    user-visible HTML (meta tags, FAQ structured data, page <title>), so they
    must follow the same locale-consistency rules as body text."""
    m = re.match(r"^﻿?---\r?\n(.*?)\r?\n---", text, re.DOTALL)
    if not m:
        return ""
    fm = m.group(1)
    chunks: list[str] = []
    # title / description / image_alt_data — single-line YAML values
    for field in FRONTMATTER_FIELDS_TO_AUDIT:
        for line in re.findall(rf'^{field}:\s*"([^"]+)"', fm, re.MULTILINE):
            chunks.append(line)
        for line in re.findall(rf"^{field}:\s+([^\n]+)$", fm, re.MULTILINE):
            if not line.startswith('"'):
                chunks.append(line)
    # faq_schema: indented YAML list of q/a entries
    for kv_match in re.findall(r'^\s+-?\s*[qa]:\s*"([^"]+)"', fm, re.MULTILINE):
        chunks.append(kv_match)
    return "\n".join(chunks)


def fix_frontmatter(fm: str, blacklist: dict[str, str], locale: str) -> str:
    """Apply blacklist translations to title / description / image_alt_data /
    faq_schema q+a values in frontmatter. Preserve YAML structure."""
    def translate_value(val: str) -> str:
        protected, anchors = protect_anchors(val)
        for en, local in sorted(blacklist.items(), key=lambda kv: -len(kv[0])):
            if en == local:
                continue
            protected = protected.replace(en, local)
        cap_trans = CAP_TRANSLATE.get(locale, "上限")
        protected = CAP_RE.sub(cap_trans, protected)
        return restore_anchors(protected, anchors)

    # title / description / image_alt_data
    def replace_field(m_):
        field, quoted_val = m_.group(1), m_.group(2)
        return f'{field}: "{translate_value(quoted_val)}"'

    fm = re.sub(
        r'^(' + "|".join(FRONTMATTER_FIELDS_TO_AUDIT) + r'):\s*"([^"]+)"',
        replace_field,
        fm,
        flags=re.MULTILINE,
    )

    # FAQ q/a
    def replace_qa(m_):
        prefix, val = m_.group(1), m_.group(2)
        return f'{prefix}"{translate_value(val)}"'

    fm = re.sub(
        r'^(\s+-?\s*[qa]:\s*)"([^"]+)"',
        replace_qa,
        fm,
        flags=re.MULTILINE,
    )

    return fm


def extract_svg_text(svg_path: Path) -> str:
    """Pull all text content out of `<text>` and `<tspan>` elements in an SVG.

    Cover.svg files contain user-visible text that must follow the same locale
    consistency rules as the article body. (Bug discovered 2026-05-15: cover SVG
    KO tech terms `자동 저장 / 임시 저장 .bak / 백업파일` were leaking into
    non-KO locale rendered pages because audit only scanned index.md.)

    Allowlist: "design tagline" style strings — all-caps English with `·` or `|`
    separators (e.g. `ONEDRIVE · 500 MAJOR VERSIONS · AUTORECOVER ≠ HISTORY`) are
    intentional brand-design captions, not body leak. Skipped from scan.
    """
    if not svg_path.exists():
        return ""
    try:
        text = svg_path.read_text(encoding="utf-8")
    except Exception:
        return ""
    # Extract text between <text...>...</text> and <tspan...>...</tspan>
    chunks = re.findall(r"<text[^>]*>(.*?)</text>", text, re.DOTALL)
    chunks += re.findall(r"<tspan[^>]*>(.*?)</tspan>", text, re.DOTALL)
    # Strip nested XML tags
    cleaned = [re.sub(r"<[^>]+>", "", c) for c in chunks]
    # Filter out design-tagline allowlist (all-caps English + `·`/`|` separators)
    filtered = []
    for c in cleaned:
        stripped = c.strip()
        if not stripped:
            continue
        # All-caps tagline detection: 80%+ uppercase Latin + contains `·` or `|`
        if "·" in stripped or "|" in stripped:
            latin = re.findall(r"[A-Za-z]", stripped)
            upper = re.findall(r"[A-Z]", stripped)
            if latin and len(upper) / len(latin) >= 0.8:
                continue  # skip design tagline
        filtered.append(stripped)
    return "\n".join(filtered)


def audit_file(path: Path, locale: str, fix: bool = False) -> tuple[list[tuple[str, int]], str]:
    """Return list of (term, count) violations + (optionally) fixed text."""
    text = path.read_text(encoding="utf-8")
    body = strip_frontmatter(text)
    body_clean = strip_anchor_refs(strip_inline_code(strip_urls(body)))
    # Also scan user-visible frontmatter fields (title / description / FAQ).
    fm_audit_text = extract_frontmatter_audit_text(text)
    # Cover.svg text is designer-controlled typography (design captions,
    # rhetorical anchors like "不是 bug，是設計", product-feature labels
    # like "Time Machine snapshot"). It uses different rules from body
    # prose — designers intentionally keep certain English loan-words for
    # visual rhythm. Scan it ONLY for Korean-script leak in non-KO locales
    # (the original bug that introduced SVG scanning), NOT for the ASCII
    # blacklist. Body + frontmatter remain the strict audit surface.
    cover_svg_text = extract_svg_text(path.parent / "cover.svg")
    audit_corpus = body_clean + "\n" + fm_audit_text
    # Cover.svg appended separately ONLY for Korean script scan (phase 3).
    audit_corpus_with_cover = audit_corpus + "\n" + cover_svg_text

    violations: list[tuple[str, int]] = []
    blacklist = BLACKLIST.get(locale, {})

    # Short blacklist terms that risk substring false-positives need a word
    # boundary on each end. Long phrases (>= 8 chars, or containing whitespace
    # / hyphen) don't need boundary. Added 2026-05-17 after `board` matched
    # `keyboard` in cover.svg "Customize keyboard shortcuts" caption.
    def _count_term(corpus: str, term: str) -> int:
        # ASCII-only short terms: enforce \b boundary. Phrases & non-ASCII
        # (e.g. Korean tokens) keep raw substring count.
        if len(term) <= 7 and term.isascii() and ' ' not in term:
            return len(re.findall(rf"(?<![A-Za-z0-9_])"
                                  rf"{re.escape(term)}"
                                  rf"(?![A-Za-z0-9_])", corpus))
        return corpus.count(term)

    # Allowlist English product feature names — intentional brand usage in
    # cover.svg design captions or body when referring to the actual product
    # feature. Added 2026-05-17 after audit flagged Photoshop autosave /
    # Time Machine snapshot / Recycle Bin which are official product names.
    # Uses regex to allow any 1-5 CJK / connector chars between brand name
    # and feature term (e.g. "Time Machine 是 snapshot", "Time Machine은").
    BRAND_FEATURE_REGEX = [
        r"Photoshop[\s　-鿿·的の은는가]{0,4}[Aa]uto-?[Ss]ave",
        r"Time Machine[\s　-鿿·的の은는가가의을를]{0,5}snapshots?",
        r"AutoSave",  # Microsoft product name (camelCase)
        r"Conflicted copy",  # Dropbox feature name
    ]
    masked = audit_corpus
    for pat in BRAND_FEATURE_REGEX:
        masked = re.sub(pat, "<<BRAND>>", masked)

    # 1. Blacklist exact terms — skip idempotent kept-English entries (en == local)
    for en, local in blacklist.items():
        if en == local:
            continue  # idempotent — term intentionally kept English in this locale
        count = _count_term(masked, en)
        if count > 0:
            violations.append((en, count))

    # 2. Standalone "cap" — body + frontmatter audit-text
    cap_hits = CAP_RE.findall(audit_corpus)
    if cap_hits:
        violations.append(("cap (standalone)", len(cap_hits)))

    # 3. Korean script in non-KO locales — flag any Hangul not in brand allowlist
    if locale != "ko":
        # Mask brand-allowed Korean strings before scanning.
        # CRITICAL: sort by length descending so longer brands (e.g. "한컴 오피스")
        # are masked before shorter prefixes ("한컴") would consume them and orphan
        # the suffix as a false-positive leak. (Bug found by locale-translation-reviewer
        # subagent on 2026-05-15 hwp-file-recovery review.)
        # Korean-script scan covers cover.svg too — that's the bug class
        # this scan was originally added for (KO tech terms in non-KO covers).
        scrubbed = audit_corpus_with_cover
        for brand in sorted(BRAND_ALLOWLIST_KOREAN, key=len, reverse=True):
            scrubbed = scrubbed.replace(brand, "<<BRAND>>")
        ko_hits = KOREAN_CHAR_RE.findall(scrubbed)
        if ko_hits:
            # Count unique offending tokens
            unique_tokens = set(ko_hits)
            for token in sorted(unique_tokens):
                count = scrubbed.count(token)
                violations.append((f"Korean script '{token}' (translate or allowlist)", count))

    if not fix:
        return violations, text

    # 3. Apply translations
    fixed = text
    body_full = strip_frontmatter(fixed)
    # Protect markdown anchors {#xxx} from translation (Hugo IDs must stay ASCII)
    body_full, anchors = protect_anchors(body_full)
    # Sort longer keys first to avoid prefix-collisions
    for en, local in sorted(blacklist.items(), key=lambda kv: -len(kv[0])):
        if en == local:
            continue
        body_full = body_full.replace(en, local)
    # cap-as-standalone replacement in body only (preserve frontmatter slugs like cap-mechanism)
    cap_trans = CAP_TRANSLATE.get(locale, "上限")
    body_full = CAP_RE.sub(cap_trans, body_full)
    # Restore anchors
    body_full = restore_anchors(body_full, anchors)
    # rebuild fixed
    m = re.match(r"^(---\n.*?\n---\n)", text, re.DOTALL)
    if m:
        fm = m.group(1)[:-5]  # strip trailing "\n---\n"
        fm_fixed = fix_frontmatter(fm, blacklist, locale)
        fixed = fm_fixed + "\n---\n" + body_full
    else:
        fixed = body_full
    return violations, fixed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", help="audit one slug only")
    ap.add_argument("--locale", help="audit one locale only")
    ap.add_argument("--fix", action="store_true", help="auto-translate and write")
    args = ap.parse_args()

    target_locales = [args.locale] if args.locale else list(LOCALES.keys())
    rows: list[tuple[str, str, str, list[tuple[str, int]]]] = []

    for loc in target_locales:
        loc_dir = CONTENT_DIR / loc / "post" if loc != "en" else CONTENT_DIR / "english" / "post"
        if loc == "en":
            continue  # EN is the reference language, nothing to translate from
        if not loc_dir.exists():
            continue
        for slug_dir in sorted(loc_dir.iterdir()):
            if not slug_dir.is_dir():
                continue
            slug = slug_dir.name
            if args.slug and slug != args.slug:
                continue
            idx = slug_dir / "index.md"
            if not idx.exists():
                continue
            violations, fixed_text = audit_file(idx, loc, fix=args.fix)
            rows.append((loc, slug, str(idx), violations))
            if args.fix and violations:
                idx.write_text(fixed_text, encoding="utf-8")

    total_articles = len(rows)
    articles_with_leaks = sum(1 for r in rows if r[3])
    total_violations = sum(sum(v[1] for v in r[3]) for r in rows)

    print(f"# Language Consistency Audit")
    print(f"")
    print(f"Total: {total_articles} article-locale pairs scanned")
    print(f"Articles with leaks: {articles_with_leaks}")
    print(f"Total violations: {total_violations}")
    print(f"")
    if args.fix:
        print(f"**--fix MODE applied: leaks rewritten in place.**")
        print(f"")
    print(f"## Per-locale summary")
    print(f"")
    print(f"| Locale | Articles scanned | With leaks | Total leak count |")
    print(f"|---|---|---|---|")
    for loc in target_locales:
        if loc == "en":
            continue
        loc_rows = [r for r in rows if r[0] == loc]
        with_leaks = sum(1 for r in loc_rows if r[3])
        leak_count = sum(sum(v[1] for v in r[3]) for r in loc_rows)
        print(f"| {loc} | {len(loc_rows)} | {with_leaks} | {leak_count} |")
    print(f"")
    print(f"## Violations by article")
    print(f"")
    print(f"| Locale | Slug | Term | Count |")
    print(f"|---|---|---|---|")
    for loc, slug, _, viols in rows:
        for term, count in viols:
            print(f"| {loc} | `{slug}` | {term} | {count} |")

    if total_violations > 0 and not args.fix:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
