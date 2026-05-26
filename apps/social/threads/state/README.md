# state/ — Threads experiment tracking

Holds the kill-gate evidence (per [../CLAUDE.md](../CLAUDE.md) Validation gate):

- `attribution.md` — running log of Keeply signups answering "where did you hear about
  us?" (the Threads-attributable count drives the 6–8 week kill decision).
- `posts.json` — per-post log: date, source `/blg` slug, Threads permalink, canonical
  backlink, and any engagement/attribution observed.
- `kill-gate.md` — window start date, criterion (< 5 attributable trial signups AND no
  B2B engagement → stop), and the final go/kill verdict at window end.

Empty until the first post ships.
