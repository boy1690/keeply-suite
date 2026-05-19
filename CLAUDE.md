# CLAUDE.md — keeply-suite (root)

> Monorepo umbrella for `keeply.work` (apex) + `blog.keeply.work` (subdomain).
> Two independent app stacks share **one** git working tree, but maintain **independent build / deploy pipelines** (Hugo vs Vanilla HTML+Node).
> Phase 4 (CLAUDE.md split) will expand the per-app rules — current state is post-Phase-2 (subtrees imported).

---

## Apps

| Dir | Stack | Domain | Source-of-truth CLAUDE.md |
|-----|-------|--------|---------------------------|
| `apps/blog/` | Hugo 0.160.1 extended | `blog.keeply.work` | [apps/blog/CLAUDE.md](apps/blog/CLAUDE.md) |
| `apps/website/` | Vanilla HTML + Node build (Tailwind + custom build.js + fingerprint + SRI) | `keeply.work` (apex) | [apps/website/CLAUDE.md](apps/website/CLAUDE.md) |

---

## Cross-app rules (root-level)

### Push policy
- Every `git push` requires explicit user authorization (inherited from global `~/.claude/CLAUDE.md`)
- Monorepo means **one push can trigger 2 deploys** (Cloudflare Pages watch paths separate blog vs website builds). Stay explicit about which app's changes are being pushed.

### Cloudflare zone
- Both apps share the `keeply.work` Cloudflare zone
- `CF_ZONE_ID` and `CF_PURGE_TOKEN` are identical
- Purge targets: `keeply.work/*` (website) and `blog.keeply.work/*` (blog) — same token works on both

### Cross-app URL refs
- Articles in `apps/blog/content/` referencing `keeply.work/*` paths must `curl -I` 200 verify before commit
- A future CI lint (`.github/workflows/lint-cross-refs.yml`) will block merge on 404 cross-refs
- Until lint ships: manually verify with `curl -I https://keeply.work/<path>` before push

### Commit message convention
- Scope-prefix per affected app: `blog(...)`, `website(...)`, `shared(...)`, or `root(...)` for cross-cutting
- Examples:
  - `blog(post): ship deleted-file-not-in-recycle-bin 4 locale`
  - `website(page): add /about with founder bio`
  - `root(ci): add cross-ref URL 200 lint`

### App boundaries
- Code / content / specs / `_dev` scripts **stay inside their app dir** (`apps/blog/` or `apps/website/`)
- Cross-app shared assets go in `shared/` (created Phase 4)
- This replaces the old "cross-repo boundary" rule from the pre-merge `keeply-blog/CLAUDE.md`

---

## Migration status

| Phase | Status | Note |
|-------|--------|------|
| 1. umbrella structure | ✅ done | README + CLAUDE.md + .gitignore + initial commit |
| 2. subtree import (blog + website) | ✅ done | full git history preserved (no `--squash`) |
| 4. CLAUDE.md split | ⏳ pending | will expand this root CLAUDE.md + populate `apps/{blog,website}/CLAUDE.md` |
| 5. project memory consolidation | ⏳ pending | merge `d--tools-doing-keeply-blog/memory/` + `d--tools-doing-keeply-website/memory/` → `d--tools-doing-keeply-suite/memory/`. Note: `d--tools-doing-keeply-workspace/memory/` is a SEPARATE context (Keeply org / CEO directive) and stays as-is |
| 6. hooks / skills / scripts path updates | ⏳ pending | `.claude/hooks/keeply-mock-audit.py` paths → `apps/blog/content/`; skill `keeply-mock-ui` `BLOG_ROOT` env var |
| 7. validation cycle (local builds) | ⏳ pending | both apps build locally, public/ outputs verified |
| 3A. Cloudflare Pages preview | ⏳ pending | 2 CF Pages projects, no DNS cutover yet |
| 8. DNS cutover | ⏳ pending | blog.keeply.work first, then keeply.work apex |
| 9. cleanup | ⏳ pending | archive old `keeply-blog` / `keeply-website` repos after 30-day stability |

Full plan: [apps/blog/_dev/proposals/monorepo-merge-plan.md](apps/blog/_dev/proposals/monorepo-merge-plan.md)

---

## Working directory note

When Claude session opens with working dir `D:/tools/doing/keeply-suite/`:
- Project memory path: `~/.claude/projects/d--tools-doing-keeply-suite/memory/`
- Old memory from `d--tools-doing-keeply-blog/` and `d--tools-doing-keeply-website/` to be migrated in Phase 5
- `d--tools-doing-keeply-workspace/` is unrelated (different context — Keeply org-level)
