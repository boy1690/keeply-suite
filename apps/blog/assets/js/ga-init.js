// Skip analytics on local-dev + Cloudflare Pages preview hosts so neither
// localhost nor *.pages.dev preview deploys pollute the live GA4 property.
// (2026-05-21: keeply-blog.pages.dev preview was sending self-referral
// sessions into property 534326745.) Mirrors the website's ga4-loader gate.
(function () {
  var h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || /\.pages\.dev$/.test(h)) return;
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // Expose globally so cta-tracking.js (and any future custom events) can fire.
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', '{{ . }}');
})();
