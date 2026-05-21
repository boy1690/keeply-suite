# Plan — Blog CTA click tracking (measure the blog → product hand-off)

> Status: **DRAFT — awaiting approval** · Date: 2026-05-21 · Scope: `apps/blog/`
> Origin: GA4 analysis 2026-05-21 (via analytics-mcp). See companion GA4-UI tasks at end.

---

## 1. Problem

GA4 (28d, property 534326745) shows the conversion leak is the **blog → product hand-off**, and it is **completely uninstrumented**:

- Traffic lives on the blog (~110 sessions/28d, 77%); **all 5 download events live on `keeply.work`** (`download_click` ×4, `file_download` ×3 across `/` and `/zh-TW/`). The blog produced **zero** download events.
- `keeply.work` received only ~4 referral sessions in 28d, almost none from `blog.keeply.work` → the hand-off is barely happening.
- Every blog CTA is a bare `<a href="https://keeply.work/">` with **no GA4 event** → we cannot see how many readers click through, from which CTA, or where they drop.

**Goal:** make the blog → product hand-off measurable (per-CTA) so we can see which leg leaks.
**Non-goal:** redesigning CTA copy, fixing social bounce, blog consent mode — separate work.

---

## 2. Current state (verified 2026-05-21)

**Blog GA4 load** (`layouts/_partials/head.html` L195–201): production-only gate (`hugo.IsProduction`) → `gtag/js` + fingerprinted+SRI `assets/js/ga-init.js`. `ga-init.js` is a classic deferred script whose top-level `function gtag(){…}` becomes **`window.gtag`** (global). **No Consent Mode** on the blog (unlike the website), so events fire immediately.

**CTA anchors → all point at `https://keeply.work/` (homepage):**

| Partial | Element | Existing hook |
|---|---|---|
| `_partials/cta-download.html` | `<section class="cta-bottom">` → `<a>` | none |
| `_partials/cta-inline.html` | `<aside data-cta="inline">` → `<a>` | **has `data-cta="inline"`** |
| `_partials/cta-sticky-mobile.html` | `<div id="sticky-cta-mobile">` → `<a>` | none |
| `_partials/nav.html` | `<a class="bg-brand-600…">` ("download") | none |
| `_partials/footer.html` | keeply.work link | none (TBC) |

**Existing JS asset pattern:** `assets/js/*.js` (e.g. `locale-cookie-sync.js`) → `resources.Get` + `resources.Fingerprint "sha384"` → `<script defer integrity crossorigin>`. CSP `script-src 'self' …` already allows self-hosted fingerprinted scripts.

**⚠️ Enhanced Measurement overlap:** the `click` event (23 in 28d) is GA4's auto outbound-click measurement and **likely already contains blog→keeply.work clicks** with auto params `link_url` / `link_domain` / `outbound`. Those params are collected but **not reportable until registered as custom dimensions**. Our `cta_click` adds what EM can't: `cta_location` + clean `destination`.

---

## 3. Proposed change (code — all inside `apps/blog/`)

### 3a. New file `assets/js/cta-tracking.js`
Delegated `document` click listener (capture phase). Any `<a>` resolving to host `keeply.work`/`www.keeply.work` fires a `cta_click` GA4 event. No-ops when `window.gtag` is absent (non-production / GA blocked). `transport_type:'beacon'` so the hit survives the navigation away.

```js
/**
 * Keeply Blog — CTA click tracking (GA4).
 * Makes the blog → keeply.work hand-off measurable; the download_click event
 * only exists on keeply.work, so blog-side CTA clicks were invisible.
 * Classic deferred script (CSP-safe, no inline). window.gtag comes from
 * ga-init.js. If GA4 isn't loaded the call no-ops.
 */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.hostname !== 'keeply.work' && url.hostname !== 'www.keeply.work') return;
    if (typeof window.gtag !== 'function') return;

    var container = a.closest('[data-cta]');
    var loc = (container && container.getAttribute('data-cta')) || 'other';
    var path = url.pathname || '/';
    var dest = /\/install\/?$/.test(path) ? 'install'
             : (path === '/' || /^\/[a-z-]{2,5}\/$/.test(path)) ? 'home'
             : 'other';

    window.gtag('event', 'cta_click', {
      cta_location: loc,                                   // nav | inline | bottom | sticky-mobile | footer | other
      link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      link_url: a.href,
      destination: dest,                                   // home | install | other
      transport_type: 'beacon'
    });
  }, true);
})();
```

### 3b. Add `data-cta` location labels (one attribute each — clean attribution)
- `cta-download.html`: `<section class="cta-bottom …" data-cta="bottom">`
- `cta-sticky-mobile.html`: `<div id="sticky-cta-mobile" data-cta="sticky-mobile" …>`
- `nav.html`: download `<a … data-cta="nav">`
- `footer.html`: keeply.work `<a … data-cta="footer">`
- `cta-inline.html`: already `data-cta="inline"` — no change

### 3c. Hook in `head.html` (next to `locale-cookie-sync.js`, always loaded)
```go-html-template
{{- $ctaTrack := resources.Get "js/cta-tracking.js" | resources.Fingerprint "sha384" -}}
<script defer src="{{ $ctaTrack.RelPermalink }}" integrity="{{ $ctaTrack.Data.Integrity }}" crossorigin="anonymous"></script>
```
No CSP change needed (`script-src 'self'`). Loads on all pages; no-ops where GA4 is gated off.

---

## 4. GA4-side companion tasks (UI — only the account owner can do; MCP is read-only)

1. **Register custom dimensions** (Admin → Custom definitions, event-scoped): `cta_location`, `destination` — otherwise `cta_click` params won't show in reports.
2. **Mark `download_click` as a Key Event** (conversions are empty without this).
3. **(optional) Mark `cta_click` as a Key Event** — micro-conversion for the hand-off.
4. **Disable Enhanced Measurement "File downloads"** to stop the duplicate `file_download` (keep `download_click` as the canonical one).
5. **Data hygiene:** internal-traffic filter + add `keeply-blog.pages.dev` to unwanted referrals.

---

## 5. Verification

1. `cd apps/blog && hugo --gc --minify` → exit 0; confirm `public/**/cta-tracking.<hash>.js` emitted + referenced.
2. Deploy → GA4 **DebugView / Realtime**: click each CTA (nav / inline / bottom / sticky) → see `cta_click` with correct `cta_location` + `destination`.
3. After ~24–48h: via analytics-mcp `run_report` event=`cta_click` by `cta_location` → compare against `download_click` on keeply.work to quantify each leg of the funnel.

## 6. Rollback
Remove the `<script>` line in `head.html` + delete `assets/js/cta-tracking.js`. The `data-cta` attributes are inert and can stay.

## 7. Open decision
**CTA destination** stays `https://keeply.work/` (homepage, where the download buttons live) for now. Revisit retargeting to `/install` (shorten the two-hop) once `cta_click` → `download_click` funnel data exists.
