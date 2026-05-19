# keeply-suite

Umbrella monorepo for `keeply.work` web properties.

- `apps/blog/` — Hugo-based blog at `blog.keeply.work`
- `apps/website/` — Vanilla HTML + Node build at `keeply.work`
- `shared/` — cross-app brand assets / SOPs / docs (placeholder, populated in Phase 4)

See [CLAUDE.md](CLAUDE.md) for Claude agent rules and [apps/blog/_dev/proposals/monorepo-merge-plan.md](apps/blog/_dev/proposals/monorepo-merge-plan.md) for the migration plan.

## Quick commands

| App | Build | Deploy target |
|-----|-------|---------------|
| blog | `cd apps/blog && hugo --gc --minify` | Cloudflare Pages, watch paths: `apps/blog/**` |
| website | `cd apps/website && npm ci && npm run build` | Cloudflare Pages, watch paths: `apps/website/**` |

## Git history preservation

Both apps imported via `git subtree add` (not `--squash`), so per-app history is fully preserved.

## Cloudflare zone

Both apps share the `keeply.work` Cloudflare zone — `CF_ZONE_ID` and `CF_PURGE_TOKEN` are identical across deploys.
