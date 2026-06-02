// Demo modal — open the /demo/s/keeply-promo deck in an overlay instead of
// navigating. Triggered by [data-demo-modal-open]; closed by
// [data-demo-modal-close], Esc, or backdrop click. iframe src is blanked on
// close so the deck stops playing and frees memory.
(function () {
  'use strict';

  // Per-page-session cache-bust so browsers don't reuse a stale response
  // captured before a CSP / header policy update on /demo/*. Browser still
  // caches normally within one page view (same query); next page load gets
  // a fresh ts, forcing a re-validate.
  var DEMO_URL = '/demo/s/keeply-promo/?v=' + Date.now();
  var modal = document.getElementById('demo-modal');
  if (!modal) return;
  var iframe = modal.querySelector('[data-demo-modal-iframe]');
  var openers = document.querySelectorAll('[data-demo-modal-open]');
  var closers = modal.querySelectorAll('[data-demo-modal-close]');
  var lastFocus = null;

  function show() {
    lastFocus = document.activeElement;
    if (iframe && iframe.getAttribute('src') !== DEMO_URL) {
      iframe.setAttribute('src', DEMO_URL);
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.documentElement.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('[data-demo-modal-close]');
    if (closeBtn && closeBtn.focus) closeBtn.focus();
  }

  function hide() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.documentElement.style.overflow = '';
    if (iframe) iframe.setAttribute('src', 'about:blank');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  for (var i = 0; i < openers.length; i++) {
    openers[i].addEventListener('click', function (e) {
      e.preventDefault();
      show();
    });
  }
  for (var j = 0; j < closers.length; j++) {
    closers[j].addEventListener('click', hide);
  }

  // backdrop click (target is the overlay itself, not the inner card)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) hide();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) hide();
  });
})();
