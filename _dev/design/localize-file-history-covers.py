"""Localize 2 windows-file-history cover SVGs across 5 locales (v2 — Keeply protagonist).

Article A cover restructured: Keeply pinned as primary tile, 3 Windows tools as supporting.
Article B cover updated: removed Cmd+S/intent-driven framing, Keeply as solution.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCALES = ["english", "zh-cn", "ja", "ko", "it"]

# Article A: windows-file-history-vs-backup
A_TRANSLATIONS = {
    "english": {
        "WHAT WINDOWS DOESN'T GIVE YOU": "WHAT WINDOWS DOESN'T GIVE YOU",
        "Windows 備份系列 ‧ EDITORIAL": "Windows Backup Series ‧ EDITORIAL",
        '<tspan x="0" y="100">Windows</tspan>': '<tspan x="0" y="100">Windows</tspan>',
        '<tspan x="0" y="240">有 3 種</tspan>': '<tspan x="0" y="240">has 3</tspan>',
        '<tspan x="0" y="380">「備份」</tspan>': '<tspan x="0" y="380">"Backups"</tspan>',
        "都答不出「會議後加結論」那版": "None can find \"the version after the meeting\"",
        "那一層留給 Keeply 補": "Keeply fills the layer they miss",
        "WITH NOTES ‧ ON YOUR LAPTOP ★": "WITH NOTES ‧ ON YOUR LAPTOP ★",
        "每 30 分鐘自動存 + 手動「儲存版本」": "Auto every 30 min + manual \"Save Version\"",
        "每一版可以寫筆記、本機跑": "Notes on every version, runs on your laptop",
        "DISK ‧ Windows Backup": "DISK ‧ Windows Backup",
        "整機快照——救硬碟壞掉、不救單檔": "Whole-disk snapshot — saves drives, not files",
        "FOLDER ‧ File History": "FOLDER ‧ File History",
        "資料夾排程快照——只有時間戳、要外接硬碟": "Scheduled folder snapshots — timestamps only, needs external drive",
        "CLOUD ‧ OneDrive 版本歷史": "CLOUD ‧ OneDrive version history",
        "雲端版本——只有保留期內、純時間戳": "Cloud versions — within retention, timestamps only",
        "THE 4TH LAYER WINDOWS NEVER GAVE YOU": "THE 4TH LAYER WINDOWS NEVER GAVE YOU",
    },
    "zh-cn": {
        "WHAT WINDOWS DOESN'T GIVE YOU": "WHAT WINDOWS DOESN'T GIVE YOU",
        "Windows 備份系列 ‧ EDITORIAL": "Windows 备份系列 ‧ EDITORIAL",
        '<tspan x="0" y="100">Windows</tspan>': '<tspan x="0" y="100">Windows</tspan>',
        '<tspan x="0" y="240">有 3 種</tspan>': '<tspan x="0" y="240">有 3 种</tspan>',
        '<tspan x="0" y="380">「備份」</tspan>': '<tspan x="0" y="380">「备份」</tspan>',
        "都答不出「會議後加結論」那版": "都答不出「会议后加结论」那版",
        "那一層留給 Keeply 補": "那一层留给 Keeply 补",
        "WITH NOTES ‧ ON YOUR LAPTOP ★": "WITH NOTES ‧ ON YOUR LAPTOP ★",
        "每 30 分鐘自動存 + 手動「儲存版本」": "每 30 分钟自动存 + 手动「保存版本」",
        "每一版可以寫筆記、本機跑": "每一版可以写笔记、本机跑",
        "DISK ‧ Windows Backup": "DISK ‧ Windows Backup",
        "整機快照——救硬碟壞掉、不救單檔": "整机快照——救硬盘坏掉、不救单档",
        "FOLDER ‧ File History": "FOLDER ‧ File History",
        "資料夾排程快照——只有時間戳、要外接硬碟": "文件夹计划快照——只有时间戳、要外接硬盘",
        "CLOUD ‧ OneDrive 版本歷史": "CLOUD ‧ OneDrive 版本历史",
        "雲端版本——只有保留期內、純時間戳": "云端版本——只有保留期内、纯时间戳",
        "THE 4TH LAYER WINDOWS NEVER GAVE YOU": "THE 4TH LAYER WINDOWS NEVER GAVE YOU",
    },
    "ja": {
        "WHAT WINDOWS DOESN'T GIVE YOU": "WHAT WINDOWS DOESN'T GIVE YOU",
        "Windows 備份系列 ‧ EDITORIAL": "Windows バックアップ シリーズ ‧ EDITORIAL",
        '<tspan x="0" y="100">Windows</tspan>': '<tspan x="0" y="100">Windowsに</tspan>',
        '<tspan x="0" y="240">有 3 種</tspan>': '<tspan x="0" y="240">3種類の</tspan>',
        '<tspan x="0" y="380">「備份」</tspan>': '<tspan x="0" y="380">「バックアップ」</tspan>',
        "都答不出「會議後加結論」那版": "どれも「会議後に結論を追加した版」を返せない",
        "那一層留給 Keeply 補": "そのレイヤは Keeply が補う",
        "WITH NOTES ‧ ON YOUR LAPTOP ★": "WITH NOTES ‧ ON YOUR LAPTOP ★",
        "每 30 分鐘自動存 + 手動「儲存版本」": "30分ごとに自動保存＋手動「バージョン保存」",
        "每一版可以寫筆記、本機跑": "各バージョンにメモ、ローカル動作",
        "DISK ‧ Windows Backup": "DISK ‧ Windows Backup",
        "整機快照——救硬碟壞掉、不救單檔": "ディスク全体のスナップショット——個別ファイルは救えない",
        "FOLDER ‧ File History": "FOLDER ‧ File History",
        "資料夾排程快照——只有時間戳、要外接硬碟": "フォルダのスケジュール撮影——タイムスタンプのみ、外付け必須",
        "CLOUD ‧ OneDrive 版本歷史": "CLOUD ‧ OneDrive バージョン履歴",
        "雲端版本——只有保留期內、純時間戳": "クラウド版——保持期間内のみ、タイムスタンプのみ",
        "THE 4TH LAYER WINDOWS NEVER GAVE YOU": "THE 4TH LAYER WINDOWS NEVER GAVE YOU",
    },
    "ko": {
        "WHAT WINDOWS DOESN'T GIVE YOU": "WHAT WINDOWS DOESN'T GIVE YOU",
        "Windows 備份系列 ‧ EDITORIAL": "Windows 백업 시리즈 ‧ EDITORIAL",
        '<tspan x="0" y="100">Windows</tspan>': '<tspan x="0" y="100">Windows에는</tspan>',
        '<tspan x="0" y="240">有 3 種</tspan>': '<tspan x="0" y="240">3가지</tspan>',
        '<tspan x="0" y="380">「備份」</tspan>': '<tspan x="0" y="380">"백업"이 있다</tspan>',
        "都答不出「會議後加結論」那版": "셋 다 「회의 후 결론을 추가한」 버전을 못 찾는다",
        "那一層留給 Keeply 補": "그 레이어는 Keeply가 채운다",
        "WITH NOTES ‧ ON YOUR LAPTOP ★": "WITH NOTES ‧ ON YOUR LAPTOP ★",
        "每 30 分鐘自動存 + 手動「儲存版本」": "30분마다 자동 저장 + 수동 「버전 저장」",
        "每一版可以寫筆記、本機跑": "버전마다 메모, 로컬에서 동작",
        "DISK ‧ Windows Backup": "DISK ‧ Windows Backup",
        "整機快照——救硬碟壞掉、不救單檔": "디스크 전체 스냅숏 — 디스크는 구해도 파일은 못 구한다",
        "FOLDER ‧ File History": "FOLDER ‧ File History",
        "資料夾排程快照——只有時間戳、要外接硬碟": "폴더 예약 스냅숏 — 타임스탬프뿐, 외장 드라이브 필수",
        "CLOUD ‧ OneDrive 版本歷史": "CLOUD ‧ OneDrive 버전 기록",
        "雲端版本——只有保留期內、純時間戳": "클라우드 버전 — 보존 기간 내, 타임스탬프뿐",
        "THE 4TH LAYER WINDOWS NEVER GAVE YOU": "THE 4TH LAYER WINDOWS NEVER GAVE YOU",
    },
    "it": {
        "WHAT WINDOWS DOESN'T GIVE YOU": "WHAT WINDOWS DOESN'T GIVE YOU",
        "Windows 備份系列 ‧ EDITORIAL": "Serie backup Windows ‧ EDITORIAL",
        '<tspan x="0" y="100">Windows</tspan>': '<tspan x="0" y="100">Windows</tspan>',
        '<tspan x="0" y="240">有 3 種</tspan>': '<tspan x="0" y="240">ha 3</tspan>',
        '<tspan x="0" y="380">「備份」</tspan>': '<tspan x="0" y="380">«backup»</tspan>',
        "都答不出「會議後加結論」那版": "Nessuno trova «la versione dopo la riunione»",
        "那一層留給 Keeply 補": "Quel livello lo copre Keeply",
        "WITH NOTES ‧ ON YOUR LAPTOP ★": "WITH NOTES ‧ ON YOUR LAPTOP ★",
        "每 30 分鐘自動存 + 手動「儲存版本」": "Auto ogni 30 min + «Salva versione» manuale",
        "每一版可以寫筆記、本機跑": "Note su ogni versione, gira sul tuo laptop",
        "DISK ‧ Windows Backup": "DISK ‧ Windows Backup",
        "整機快照——救硬碟壞掉、不救單檔": "Snapshot dell'intero disco — salva il disco, non i file",
        "FOLDER ‧ File History": "FOLDER ‧ File History",
        "資料夾排程快照——只有時間戳、要外接硬碟": "Snapshot pianificato — solo timestamp, serve disco esterno",
        "CLOUD ‧ OneDrive 版本歷史": "CLOUD ‧ Cronologia OneDrive",
        "雲端版本——只有保留期內、純時間戳": "Versioni cloud — solo entro retention, solo timestamp",
        "THE 4TH LAYER WINDOWS NEVER GAVE YOU": "THE 4TH LAYER WINDOWS NEVER GAVE YOU",
    },
}

# Article B: windows-file-history-wrong-version
B_TRANSLATIONS = {
    "english": {
        "WHEN A SNAPSHOT MISSES": "WHEN A SNAPSHOT MISSES",
        "Windows 備份系列 ‧ EDITORIAL": "Windows Backup Series ‧ EDITORIAL",
        '<tspan x="0" y="60">我問 File History</tspan>': '<tspan x="0" y="60">I asked File History</tspan>',
        '<tspan x="0" y="124">「給我昨天那版」</tspan>': '<tspan x="0" y="124">"give me yesterday\'s"</tspan>',
        "它回我的是——": "what it returned——",
        "換 Keeply 後再也沒踩這個坑": "Keeply doesn't have this blind spot",
        "本機跑、有筆記、不靠外接硬碟": "Runs locally, notes on every version, no drive needed",
        "FILE HISTORY 時間軸": "FILE HISTORY TIMELINE",
        "硬碟連線決定快照存在": "Drive connection decides whether snapshots exist",
        "今天": "Today",
        "我要的草稿 (昨天 14:47)": "The draft I want (yesterday 14:47)",
        "⚠ 沒抓到": "⚠ Not captured",
        "18 個月空白": "18-month gap",
        "外接硬碟跟著筆電出差、沒插過": "Drive went with the laptop, never plugged in",
        "最近一次快照（硬碟離線前）": "Last snapshot (before drive went offline)",
        "← 它給我": "← It returned this",
        "Keeply：本機跑、每版可以寫筆記": "Keeply: runs locally, every version can have a note",
        "「會議後加結論」自己一行——不用猜時間戳。": "\"After the meeting\" gets its own row — no guessing timestamps.",
        "KEEPLY HAS NEITHER BLIND SPOT": "KEEPLY HAS NEITHER BLIND SPOT",
    },
    "zh-cn": {
        "WHEN A SNAPSHOT MISSES": "WHEN A SNAPSHOT MISSES",
        "Windows 備份系列 ‧ EDITORIAL": "Windows 备份系列 ‧ EDITORIAL",
        '<tspan x="0" y="60">我問 File History</tspan>': '<tspan x="0" y="60">我问 File History</tspan>',
        '<tspan x="0" y="124">「給我昨天那版」</tspan>': '<tspan x="0" y="124">「给我昨天那版」</tspan>',
        "它回我的是——": "它回我的是——",
        "換 Keeply 後再也沒踩這個坑": "换 Keeply 后再也没踩这个坑",
        "本機跑、有筆記、不靠外接硬碟": "本机跑、有笔记、不靠外接硬盘",
        "FILE HISTORY 時間軸": "FILE HISTORY 时间轴",
        "硬碟連線決定快照存在": "硬盘连线决定快照存在",
        "今天": "今天",
        "我要的草稿 (昨天 14:47)": "我要的草稿 (昨天 14:47)",
        "⚠ 沒抓到": "⚠ 没抓到",
        "18 個月空白": "18 个月空白",
        "外接硬碟跟著筆電出差、沒插過": "外接硬盘跟着笔电出差、没插过",
        "最近一次快照（硬碟離線前）": "最近一次快照（硬盘离线前）",
        "← 它給我": "← 它给我",
        "Keeply：本機跑、每版可以寫筆記": "Keeply：本机跑、每版可以写笔记",
        "「會議後加結論」自己一行——不用猜時間戳。": "「会议后加结论」自己一行——不用猜时间戳。",
        "KEEPLY HAS NEITHER BLIND SPOT": "KEEPLY HAS NEITHER BLIND SPOT",
    },
    "ja": {
        "WHEN A SNAPSHOT MISSES": "WHEN A SNAPSHOT MISSES",
        "Windows 備份系列 ‧ EDITORIAL": "Windows バックアップ シリーズ ‧ EDITORIAL",
        '<tspan x="0" y="60">我問 File History</tspan>': '<tspan x="0" y="60">File History に頼んだ</tspan>',
        '<tspan x="0" y="124">「給我昨天那版」</tspan>': '<tspan x="0" y="124">「昨日の草稿を」</tspan>',
        "它回我的是——": "返ってきたのは——",
        "換 Keeply 後再也沒踩這個坑": "Keeply ならこの落とし穴はない",
        "本機跑、有筆記、不靠外接硬碟": "ローカル動作、各バージョンにメモ、外付け不要",
        "FILE HISTORY 時間軸": "FILE HISTORY タイムライン",
        "硬碟連線決定快照存在": "ドライブの接続がスナップショットの有無を決める",
        "今天": "今日",
        "我要的草稿 (昨天 14:47)": "欲しい草稿 (昨日 14:47)",
        "⚠ 沒抓到": "⚠ 取れていない",
        "18 個月空白": "18ヶ月の空白",
        "外接硬碟跟著筆電出差、沒插過": "外付けドライブはノートと出張、ずっと未接続",
        "最近一次快照（硬碟離線前）": "最後のスナップショット（オフライン直前）",
        "← 它給我": "← これが返ってきた",
        "Keeply：本機跑、每版可以寫筆記": "Keeply：ローカル動作、各バージョンにメモ",
        "「會議後加結論」自己一行——不用猜時間戳。": "「会議後に結論を追加」が独立した1行——タイムスタンプを当てなくていい。",
        "KEEPLY HAS NEITHER BLIND SPOT": "KEEPLY HAS NEITHER BLIND SPOT",
    },
    "ko": {
        "WHEN A SNAPSHOT MISSES": "WHEN A SNAPSHOT MISSES",
        "Windows 備份系列 ‧ EDITORIAL": "Windows 백업 시리즈 ‧ EDITORIAL",
        '<tspan x="0" y="60">我問 File History</tspan>': '<tspan x="0" y="60">File History에 부탁했다</tspan>',
        '<tspan x="0" y="124">「給我昨天那版」</tspan>': '<tspan x="0" y="124">「어제 초안을」</tspan>',
        "它回我的是——": "돌려준 것은——",
        "換 Keeply 後再也沒踩這個坑": "Keeply는 이 사각지대가 없다",
        "本機跑、有筆記、不靠外接硬碟": "로컬 동작, 버전마다 메모, 외장 드라이브 불필요",
        "FILE HISTORY 時間軸": "FILE HISTORY 타임라인",
        "硬碟連線決定快照存在": "드라이브 연결이 스냅숏의 존재를 결정한다",
        "今天": "오늘",
        "我要的草稿 (昨天 14:47)": "원하는 초안 (어제 14:47)",
        "⚠ 沒抓到": "⚠ 못 잡음",
        "18 個月空白": "18개월 공백",
        "外接硬碟跟著筆電出差、沒插過": "외장 드라이브가 노트북과 출장, 한 번도 안 꽂힘",
        "最近一次快照（硬碟離線前）": "마지막 스냅숏（드라이브 오프라인 직전）",
        "← 它給我": "← 이걸 돌려줬다",
        "Keeply：本機跑、每版可以寫筆記": "Keeply: 로컬 동작, 버전마다 메모 가능",
        "「會議後加結論」自己一行——不用猜時間戳。": "「회의 후 결론」이 한 줄로—타임스탬프 추측 안 해도 된다.",
        "KEEPLY HAS NEITHER BLIND SPOT": "KEEPLY HAS NEITHER BLIND SPOT",
    },
    "it": {
        "WHEN A SNAPSHOT MISSES": "WHEN A SNAPSHOT MISSES",
        "Windows 備份系列 ‧ EDITORIAL": "Serie backup Windows ‧ EDITORIAL",
        '<tspan x="0" y="60">我問 File History</tspan>': '<tspan x="0" y="60">Ho chiesto a File History</tspan>',
        '<tspan x="0" y="124">「給我昨天那版」</tspan>': '<tspan x="0" y="124">«la bozza di ieri»</tspan>',
        "它回我的是——": "mi ha restituito——",
        "換 Keeply 後再也沒踩這個坑": "Keeply non ha questo punto cieco",
        "本機跑、有筆記、不靠外接硬碟": "Gira in locale, note su ogni versione, niente disco esterno",
        "FILE HISTORY 時間軸": "LINEA TEMPORALE FILE HISTORY",
        "硬碟連線決定快照存在": "La connessione del disco decide se ci sono snapshot",
        "今天": "Oggi",
        "我要的草稿 (昨天 14:47)": "La mia bozza (ieri 14:47)",
        "⚠ 沒抓到": "⚠ Non catturato",
        "18 個月空白": "Vuoto di 18 mesi",
        "外接硬碟跟著筆電出差、沒插過": "Il disco esterno è partito col laptop, mai più collegato",
        "最近一次快照（硬碟離線前）": "Ultimo snapshot (prima che il disco andasse offline)",
        "← 它給我": "← Mi ha dato questo",
        "Keeply：本機跑、每版可以寫筆記": "Keeply: locale, ogni versione può avere una nota",
        "「會議後加結論」自己一行——不用猜時間戳。": "«Dopo la riunione» è una riga sua — niente timestamp da indovinare.",
        "KEEPLY HAS NEITHER BLIND SPOT": "KEEPLY HAS NEITHER BLIND SPOT",
    },
}


def apply(template_text, mapping):
    out = template_text
    for src, dst in mapping.items():
        if src not in out:
            print(f"  [WARN] missing key: {src[:60]}")
        out = out.replace(src, dst)
    return out


def main():
    a_template = (ROOT / "content/zh-tw/post/windows-file-history-vs-backup/cover.svg").read_text(encoding="utf-8")
    b_template = (ROOT / "content/zh-tw/post/windows-file-history-wrong-version/cover.svg").read_text(encoding="utf-8")

    for loc in LOCALES:
        a_out = apply(a_template, A_TRANSLATIONS[loc])
        (ROOT / f"content/{loc}/post/windows-file-history-vs-backup/cover.svg").write_text(a_out, encoding="utf-8")
        b_out = apply(b_template, B_TRANSLATIONS[loc])
        (ROOT / f"content/{loc}/post/windows-file-history-wrong-version/cover.svg").write_text(b_out, encoding="utf-8")
        print(f"  ✓ {loc}")


if __name__ == "__main__":
    main()
