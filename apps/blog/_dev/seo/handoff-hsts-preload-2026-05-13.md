# Handoff: HSTS preload eligibility — keeply.work

> Created 2026-05-13 during Tier-B SEO audit. Decision belongs to you
> (user), not me — preload is a **one-way commitment** that locks HTTPS
> at the browser level for keeply.work + all subdomains, with a 6+ month
> uninstall path. Documenting state + trade-off + steps so you can make
> the call with full information.

## Current state (2026-05-13)

```text
$ curl -sI https://keeply.work/      | grep strict-transport
Strict-Transport-Security: max-age=600; includeSubDomains

$ curl -sI https://blog.keeply.work/ | grep strict-transport
Strict-Transport-Security: max-age=600; includeSubDomains
```

Header is set by Cloudflare Transform Rule "Keeply Security Headers"
(zone-level; see memory `reference_cloudflare_csp_rule.md`).
`max-age=600` (10 min) is conservative — short enough to roll back HSTS
within a coffee break if something breaks.

## What "preload" means

HSTS preload = the domain is added to a list hard-coded into Chrome /
Firefox / Safari / Edge. Browsers refuse to load the domain over HTTP
**ever**, even on first visit before they've seen a Strict-Transport-
Security response header.

Eligibility (per hstspreload.org):

- `max-age` ≥ `31536000` (1 year) ✗ currently 600
- `includeSubDomains` directive present ✓
- `preload` directive present ✗ currently missing
- All HTTP requests redirect to HTTPS on same host ✓ (Cloudflare default)
- Subdomains also serve HTTPS ✓
- **Only apex `keeply.work` is eligible** for submission. `blog.keeply.work`
  is a subdomain — covered automatically via `includeSubDomains`.

## Cost / benefit honest assessment

### Benefit

- Forecloses the entire class of SSL-strip MITM attacks against
  first-time visitors who type `keeply.work` (defaults to HTTP) before
  Cloudflare's HTTPS redirect can fire
- Small SEO + trust signal (Google has historically used HSTS preload as
  a minor positive ranking factor; AI search engines may use it for
  domain trustworthiness scoring)
- "Locks in" HTTPS — no future config slip can serve HTTP to anyone who
  ever visited via a preload-aware browser

### Cost

- **6+ month uninstall** if you ever need to disable HTTPS or use HTTP
  for a temporary endpoint on any subdomain (preload list updates ship
  with Chrome releases on a slow cycle)
- **Cannot serve HTTP on any subdomain** ever — `*.keeply.work` all forced
  HTTPS. If you add `staging.keeply.work` and forget cert renewal, the
  site is unreachable, not "served over HTTP as fallback".
- **All subdomains MUST serve HTTPS forever** — even ones not yet created

## Decision matrix

| Scenario | Recommendation |
|---|---|
| Confident `keeply.work` is HTTPS-only forever, including all future subdomains | ✅ Preload |
| Might run an HTTP-only dev tool on a subdomain (Jenkins/Grafana/internal panel) at some point | ❌ Skip |
| Currently new product, infrastructure still solidifying | ❌ Wait 6-12 months until ops shape settles, then revisit |

## Steps if you proceed

1. **Bump max-age**: edit Cloudflare Transform Rule "Keeply Security Headers"
   - Change HSTS value to: `max-age=31536000; includeSubDomains; preload`
   - Save + deploy
2. **Verify**: `curl -sI https://keeply.work/ | grep strict-transport`
   - Expect `max-age=31536000; includeSubDomains; preload`
3. **Soak test 1-2 weeks** — keep `max-age=31536000` running, watch for
   any HTTPS issues on any subdomain
4. **Submit**:
   - Open https://hstspreload.org/
   - Enter `keeply.work`
   - Re-verify all checks green
   - Submit. Approval is automated if all checks pass.
5. **Chromium release lag**: domain shipping into Chrome stable usually 2-3
   release cycles after submission (~6-12 weeks). Firefox / Safari /
   Edge sync from Chromium list with similar lag.

## Steps if you change your mind later

1. Submit removal request via https://hstspreload.org/
2. Wait 4-8 weeks for next Chrome release that removes you
3. Users who haven't updated Chrome still have HTTPS forced for ~12+ months

## Bottom line for this session

**I haven't changed anything in the Cloudflare config.** This is just
documentation surfacing the option. The HSTS header is already set
conservatively (600s) which is correct posture for a young product.

Recommend revisiting in Q4 2026 when ops shape is more solid.

## Cross-references

- `reference_cloudflare_csp_rule.md` — where the header lives
- Eligibility checker: https://hstspreload.org/
- Status check: `curl -sI <domain> | grep strict-transport`
