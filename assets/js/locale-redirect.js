(function () {
  if (location.pathname !== '/') return;

  var SUPPORTED = ['en','zh-tw','zh-cn','ja','ko','de','es','fr','it','pt','ru','nl','pl','tr','vi','th','id','ar','hi'];
  var DEFAULT = 'en';
  var ALIAS = {
    'zh-hant': 'zh-tw', 'zh-hk': 'zh-tw', 'zh-mo': 'zh-tw',
    'zh-hans': 'zh-cn', 'zh-sg': 'zh-cn', 'zh': 'zh-cn',
    'pt-br': 'pt', 'pt-pt': 'pt'
  };

  function norm(raw) {
    if (!raw) return null;
    var s = String(raw).trim().toLowerCase().replace('_', '-');
    if (SUPPORTED.indexOf(s) !== -1) return s;
    if (ALIAS[s]) return ALIAS[s];
    var primary = s.split('-')[0];
    if (SUPPORTED.indexOf(primary) !== -1) return primary;
    return null;
  }

  function fromQuery() {
    var m = location.search.match(/[?&]lang=([^&]+)/);
    return m ? norm(decodeURIComponent(m[1])) : null;
  }

  function fromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)keeply_locale=([^;]+)/);
    return m ? norm(decodeURIComponent(m[1])) : null;
  }

  function fromReferrer() {
    try {
      if (!document.referrer) return null;
      var u = new URL(document.referrer);
      if (!/(^|\.)keeply\.work$/.test(u.hostname)) return null;
      var seg = u.pathname.split('/').filter(Boolean)[0];
      return seg ? norm(seg) : null;
    } catch (e) { return null; }
  }

  function fromNavigator() {
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language];
    for (var i = 0; i < langs.length; i++) {
      var n = norm(langs[i]);
      if (n) return n;
    }
    return null;
  }

  var locale = fromQuery() || fromCookie() || fromReferrer() || fromNavigator() || DEFAULT;
  if (locale && locale !== DEFAULT) {
    location.replace('/' + locale + '/');
  }
})();
