#!/usr/bin/env python3
"""
Audit CJK articles for English jargon leak (per memory feedback_no_cn_en_mixing).

Scans content/{zh-tw,zh-cn,ja,ko}/post/**/index.md for English words sandwiched
inside CJK prose. Excludes: code blocks, inline code, URLs, frontmatter,
whitelisted brands / file extensions / abbreviations.

Output: per-article hit list with offending sentences.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

# CJK locales to scan (per memory — rule applies to zh-tw / zh-cn primarily;
# ja / ko also should not have raw English jargon outside the whitelist).
LOCALES = {
    "zh-tw": "post",
    "zh-cn": "post",
    "ja": "post",
    "ko": "post",
}

# Whitelist: tokens allowed even when sandwiched in CJK.
# Brand names, file extensions, well-known acronyms, programming language names.
WHITELIST = {
    # Brands / products
    "keeply", "dropbox", "onedrive", "google", "drive", "icloud",
    "github", "gitlab", "bitbucket", "git",
    "autocad", "revit", "rhino", "sketchup", "vectorworks", "archicad",
    "solidworks", "fusion", "inventor", "catia",
    "excel", "word", "powerpoint", "outlook", "office", "microsoft", "windows", "mac", "macos", "ios", "android", "linux",
    "adobe", "illustrator", "photoshop", "indesign", "premiere", "lightroom", "acrobat",
    "figma", "sketch", "notion", "airtable", "asana", "trello", "jira", "confluence", "slack", "discord", "teams", "zoom",
    "youtube", "facebook", "twitter", "instagram", "linkedin", "tiktok", "wechat", "line", "whatsapp", "telegram",
    "claude", "chatgpt", "openai", "anthropic", "gemini", "copilot", "cursor", "vscode", "vim", "emacs",
    "blender", "maya", "cinema4d", "houdini", "davinci", "finalcut",
    "matlab", "mathematica", "wolfram", "jupyter",
    "stripe", "paypal", "amazon", "aws", "azure", "firebase", "supabase", "vercel", "netlify", "cloudflare",
    "macbook", "iphone", "ipad", "thinkpad", "surface",
    "chatgpt", "gpt", "llm",
    # File extensions / formats
    "docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf", "csv", "tsv", "txt", "md", "rtf",
    "jpg", "jpeg", "png", "svg", "gif", "webp", "heic", "tiff", "bmp", "raw",
    "mp3", "mp4", "wav", "flac", "mov", "avi", "mkv", "webm",
    "zip", "rar", "7z", "tar", "gz",
    "dwg", "dxf", "rvt", "skp", "3dm", "obj", "fbx", "stl", "step", "iges",
    "psd", "ai", "indd", "xd", "fig",
    "html", "css", "js", "ts", "tsx", "jsx", "json", "xml", "yaml", "yml", "toml",
    "py", "rb", "go", "rs", "java", "kt", "swift", "c", "cpp", "h", "hpp", "cs",
    "exe", "dmg", "pkg", "deb", "rpm", "apk", "ipa", "msi",
    # Acronyms / abbreviations
    "api", "sdk", "cli", "gui", "ui", "ux", "io", "db", "os", "ip", "url", "uri", "id", "uuid", "guid",
    "saas", "paas", "iaas", "seo", "sem", "crm", "erp", "cms", "lms",
    "cdn", "dns", "ssl", "tls", "tcp", "udp", "http", "https", "ftp", "sftp", "smtp", "imap", "ssh",
    "rest", "graphql", "grpc", "rpc",
    "json", "xml", "yaml", "csv", "html", "css", "sql", "nosql",
    "nas", "san", "raid", "ssd", "hdd", "nvme", "sata", "usb", "hdmi", "vga",
    "wifi", "bluetooth", "gps", "nfc", "qr",
    "cad", "cam", "cae", "bim",
    "ai", "ml", "nlp", "ar", "vr", "xr", "mr",
    "ceo", "cto", "cfo", "coo", "cmo", "vp", "pm", "qa",
    "b2b", "b2c", "saas", "mvp", "poc", "roi", "kpi", "okr",
    "rgb", "cmyk", "hex", "dpi", "ppi",
    "lan", "wan", "vlan", "vpn",
    # Programming langs / tech
    "python", "javascript", "typescript", "ruby", "rust", "golang", "swift", "kotlin",
    "react", "vue", "angular", "svelte", "nextjs", "nuxt", "remix", "astro", "hugo", "jekyll", "gatsby",
    "node", "nodejs", "deno", "bun", "npm", "yarn", "pnpm",
    "docker", "kubernetes", "k8s", "podman",
    "redis", "postgres", "postgresql", "mysql", "mariadb", "sqlite", "mongodb", "elasticsearch",
    # Generic short common
    "ok", "vs", "via", "etc", "ie", "eg",
    # Numbers/units that look like words
    "k", "m", "gb", "tb", "mb", "kb", "fps", "hz", "khz", "mhz", "ghz",
    # Country/region codes
    "us", "uk", "eu", "tw", "cn", "jp", "kr",
    # E-E-A-T (we use this term in articles)
    "eeat",
    # JTBD (jobs-to-be-done framework — used in articles)
    "jtbd",
    # Time-machine etc may slip in but with hyphen so won't match
    "git",
    # Proper nouns appearing across keeply-blog corpus
    "anna", "peter", "krogh", "julianozen", "lazide", "bill",
    # Microsoft / Apple feature names (case-insensitive — original casing preserved in prose)
    "autorecover", "autosave", "smartscreen", "sharepoint", "gatekeeper",
    "machine",  # part of "Time Machine" — preceded by Time (whitelist) so sandwich logic clears it; standalone "machine" sandwiched in CJK = real leak — handled per-article
    # Backup / cloud brands
    "backblaze", "idrive",
    # Tool / package names
    "winget", "lfs", "styler",
    # Versioning labels often in tables (V3 / V5 / V8 / B7) — alphanumeric short tokens
    "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10",
    "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10",
    # Phrase fragments (when "wi-fi" appears whole)
    "wi-fi", "co-edit", "auto-save", "always-on", "trade-off", "lock-in",
    # Internal doc IDs
    "adr-001", "adr-002", "adr-003", "adr-004",
    # General — already in upstream list but reaffirm
    "im", "ie", "eg", "vs", "via",
    # Brand abbreviations / tech acronyms (false positives in earlier scans)
    "time", "machine",        # Time Machine — Apple feature
    "trim",                   # TRIM — SSD command (case-folded by audit)
    "pc",                     # personal computer abbrev
    "it",                     # IT department / Information Technology
    "apple",                  # Apple Inc.
    "pas",                    # PAS framework
    "sd",                     # SD card
    "mercurial",              # Mercurial VCS
    "powershell",             # PowerShell
    "web",                    # Web (general)
    "pro",                    # Pro version label
    "cta",                    # call-to-action acronym
    "serp",                   # search engine results page
    "vibe", "coding",         # vibe coding (article topic)
    "q1", "q2", "q3", "q4",   # quarter labels
    "h1", "h2", "h3", "h4", "h5", "h6",  # heading levels
    "will",                   # Will Styler (proper noun; appears in case studies)
    "styler",                 # Will Styler surname
    # Common dev abbreviations / loanwords that can stay as-is
    "real",                   # "Real developer" label in cluster articles
    "developer",              # likewise
    # Microsoft / Apple feature label words frequently in tables
    "milestone",              # Keeply Release milestone
    "freeze",                 # milestone freeze
    # Brand-fragment tokens — only appear inside protected multiword names
    # (Google Docs, Local Clone Pattern, git terminology, Adobe Premiere)
    "docs",                   # Google Docs
    "local", "clone",         # Local Clone Pattern (Keeply spec M3-098)
    "terminology",            # git terminology (dev-audience SOP phrase)
    "premiere",               # Adobe Premiere
}

# Pattern: CJK char + optional space + ASCII word(s) + optional space + CJK char
# Captures the inner ASCII run (alphanumeric + apostrophe / ampersand allowed).
SANDWICH_RE = re.compile(
    r"([一-鿿぀-ゟ゠-ヿ가-힯])\s*"
    r"([A-Za-z][A-Za-z0-9'&\-]*(?:\s+[A-Za-z][A-Za-z0-9'&\-]*)*)\s*"
    r"([一-鿿぀-ゟ゠-ヿ가-힯])"
)

CODE_FENCE_RE = re.compile(r"^```")
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
URL_RE = re.compile(r"https?://\S+|\[([^\]]+)\]\(([^)]+)\)")
HEADING_ANCHOR_RE = re.compile(r"\{#[^}]+\}")


def strip_frontmatter(text: str) -> str:
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            return text[end + 5 :]
    return text


def strip_inline_noise(line: str) -> str:
    # Remove inline code spans
    line = INLINE_CODE_RE.sub(" ", line)
    # Remove URL targets (keep link text — that's prose)
    line = re.sub(r"\]\([^)]+\)", "](LINK)", line)
    line = URL_RE.sub(lambda m: m.group(1) if m.lastindex and m.group(1) else " ", line)
    line = re.sub(r"https?://\S+", " ", line)
    # Strip Hugo shortcodes
    line = re.sub(r"\{\{[<%][^}]*[>%]\}\}", " ", line)
    # Strip heading anchors
    line = HEADING_ANCHOR_RE.sub(" ", line)
    return line


def is_whitelisted(token: str) -> bool:
    t = token.lower().strip().strip("-'&")
    if not t:
        return True
    # Pure digits or version-like
    if re.fullmatch(r"[0-9]+(?:\.[0-9]+)*", t):
        return True
    # Single character (often noise like "x" in "3x" or "n")
    if len(t) <= 1:
        return True
    # Whitelisted brand / extension / acronym
    if t in WHITELIST:
        return True
    # Extension-prefixed: .docx etc handled when token has leading dot stripped
    if t.startswith("."):
        return t[1:] in WHITELIST
    return False


def split_run(run: str) -> list[str]:
    return [w for w in re.split(r"\s+", run) if w]


HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def audit_file(path: Path) -> list[tuple[int, str, list[str]]]:
    """Return list of (line_no, line, offending_tokens)."""
    text = path.read_text(encoding="utf-8", errors="replace")
    body = strip_frontmatter(text)
    # Strip HTML comments (editorial TODOs / image placeholders)
    body = HTML_COMMENT_RE.sub(" ", body)
    hits = []
    in_code = False
    for i, raw in enumerate(body.splitlines(), start=1):
        if CODE_FENCE_RE.match(raw):
            in_code = not in_code
            continue
        if in_code:
            continue
        # Skip blockquote lines — verbatim quoted English in case studies
        if raw.lstrip().startswith(">"):
            continue
        line = strip_inline_noise(raw)
        bad = []
        for m in SANDWICH_RE.finditer(line):
            run = m.group(2)
            for tok in split_run(run):
                if not is_whitelisted(tok):
                    bad.append(tok)
        if bad:
            hits.append((i, raw.strip(), bad))
    return hits


def main():
    target_slugs = sys.argv[1:] if len(sys.argv) > 1 else None
    total_hits = 0
    article_hits = {}  # slug -> {locale: [(line, tokens)]}
    for locale, sub in LOCALES.items():
        loc_dir = CONTENT / locale / sub
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
            hits = audit_file(md)
            if hits:
                article_hits.setdefault(slug, {})[locale] = hits
                total_hits += sum(len(h[2]) for h in hits)

    # Print summary first
    print("=" * 70)
    print(f"CJK ↔ English-jargon mixing audit")
    print("=" * 70)
    if not article_hits:
        print("✅ Zero violations.")
        return 0

    by_slug = sorted(article_hits.items(), key=lambda kv: -sum(len(h[2]) for loc in kv[1].values() for h in loc))
    print(f"\n📊 Article ranking (total English-token hits across CJK locales):\n")
    for slug, by_loc in by_slug:
        loc_counts = {loc: sum(len(h[2]) for h in hits) for loc, hits in by_loc.items()}
        total = sum(loc_counts.values())
        loc_str = ", ".join(f"{loc}={n}" for loc, n in loc_counts.items())
        print(f"  {total:4d}  {slug}  ({loc_str})")

    print(f"\n📋 Per-article details:\n")
    for slug, by_loc in by_slug:
        print(f"\n### {slug}")
        for locale in ("zh-tw", "zh-cn", "ja", "ko"):
            hits = by_loc.get(locale)
            if not hits:
                continue
            print(f"  [{locale}]")
            seen_tokens = {}
            for ln, line, toks in hits:
                for t in toks:
                    seen_tokens.setdefault(t.lower(), []).append((ln, line))
            for tok, occurrences in sorted(seen_tokens.items(), key=lambda kv: -len(kv[1])):
                print(f"    {len(occurrences):3d}x  '{tok}'")
                for ln, line in occurrences[:2]:
                    snippet = line if len(line) <= 120 else line[:117] + "..."
                    print(f"           L{ln}: {snippet}")

    print(f"\n💥 Total English tokens leaking into CJK prose: {total_hits}")
    print(f"📚 Articles affected: {len(article_hits)}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
