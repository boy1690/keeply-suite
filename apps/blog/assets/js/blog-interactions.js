(function () {
  var progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    var updateProgress = function () {
      var h = document.documentElement;
      var scrollTop = h.scrollTop || document.body.scrollTop;
      var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  var tocLinks = document.querySelectorAll('.toc-fixed nav a');
  if (tocLinks.length) {
    var headings = Array.prototype.map.call(tocLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      return { link: a, el: document.getElementById(id) };
    }).filter(function (h) { return h.el; });

    var onTocScroll = function () {
      var offset = 120;
      var active = null;
      for (var i = 0; i < headings.length; i++) {
        var rect = headings[i].el.getBoundingClientRect();
        if (rect.top - offset <= 0) active = headings[i];
      }
      tocLinks.forEach(function (l) { l.classList.remove('active'); });
      if (active) active.link.classList.add('active');
    };
    window.addEventListener('scroll', onTocScroll, { passive: true });
    onTocScroll();
  }

  // Sticky bottom CTA (mobile only). Hidden by default via translate-y-full
  // class in the partial; shown when scrolled past 30% AND bottom CTA section
  // is not currently in viewport. Dismissable via X button, persisted 7 days.
  var stickyBar = document.getElementById('sticky-cta-mobile');
  var stickyDismiss = document.getElementById('sticky-cta-dismiss');
  if (stickyBar && stickyDismiss) {
    var DISMISS_KEY = 'keeply_sticky_cta_dismissed_v1';
    var DISMISS_TTL_MS = 7 * 86400 * 1000;
    var SHOW_AFTER_PCT = 0.30;
    var dismissed = false;
    try {
      var raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        var ts = parseInt(raw, 10);
        if (!isNaN(ts) && (Date.now() - ts) < DISMISS_TTL_MS) dismissed = true;
      }
    } catch (e) { /* private mode, treat as not dismissed */ }

    if (!dismissed) {
      var bottomVisible = false;
      var bottomCta = document.querySelector('section.cta-bottom');
      if ('IntersectionObserver' in window && bottomCta) {
        new IntersectionObserver(function (entries) {
          bottomVisible = entries[0].isIntersecting;
          updateSticky();
        }, { threshold: 0.1 }).observe(bottomCta);
      }

      var stickyShown = false;
      function showSticky() {
        if (stickyShown) return;
        stickyBar.classList.remove('translate-y-full');
        stickyBar.classList.add('translate-y-0');
        stickyShown = true;
      }
      function hideSticky() {
        if (!stickyShown) return;
        stickyBar.classList.add('translate-y-full');
        stickyBar.classList.remove('translate-y-0');
        stickyShown = false;
      }
      function updateSticky() {
        var scrolled = window.scrollY || document.documentElement.scrollTop;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docH > 0 ? scrolled / docH : 0;
        if (bottomVisible || pct < SHOW_AFTER_PCT) hideSticky();
        else showSticky();
      }

      stickyDismiss.addEventListener('click', function () {
        hideSticky();
        stickyBar.style.display = 'none';
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { /* ignore */ }
      });

      window.addEventListener('scroll', updateSticky, { passive: true });
      window.addEventListener('resize', updateSticky, { passive: true });
      updateSticky();
    }
  }
})();
