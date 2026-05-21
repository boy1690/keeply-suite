/**
 * Keeply Blog — CTA click tracking (GA4).
 *
 * Makes the blog → keeply.work hand-off measurable. The download_click event
 * only fires on keeply.work, so blog-side CTA clicks were invisible (GA4
 * 2026-05-21: 0 download events on the blog, all conversions stranded on the
 * apex). This delegated listener fires a `cta_click` event for any click on a
 * link that resolves to the keeply.work product site.
 *
 * Classic deferred script (CSP-safe, no inline). window.gtag is defined as a
 * global by ga-init.js. When GA4 isn't loaded (non-production, or blocked by
 * the visitor) the call no-ops. transport_type:'beacon' lets the hit survive
 * the navigation away.
 *
 * Companion GA4-admin tasks (register cta_location + destination as custom
 * dimensions; mark download_click a Key Event) are tracked in
 * _dev/proposals/blog-cta-click-tracking.md.
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
    var dest = /install(\.html)?\/?$/i.test(path) ? 'install'
             : /buy(\.html)?\/?$/i.test(path) ? 'buy'
             : (path === '/' || /^\/[a-z-]{2,6}\/$/i.test(path)) ? 'home'
             : 'other';

    window.gtag('event', 'cta_click', {
      cta_location: loc,
      link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      link_url: a.href,
      destination: dest,
      transport_type: 'beacon'
    });
  }, true);
})();
