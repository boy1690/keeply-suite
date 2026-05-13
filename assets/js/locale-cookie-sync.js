(function () {
  try {
    var SUPPORTED = ['en','zh-tw','zh-cn','ja','ko','de','es','fr','it','pt','ru','nl','pl','tr','vi','th','id','ar','hi'];
    var seg = location.pathname.split('/').filter(Boolean)[0];
    if (!seg || SUPPORTED.indexOf(seg) === -1) return;
    var existing = document.cookie.match(/(?:^|;\s*)keeply_locale=([^;]+)/);
    if (existing && decodeURIComponent(existing[1]) === seg) return;
    document.cookie = 'keeply_locale=' + seg +
      '; domain=.keeply.work; path=/; max-age=31536000; SameSite=Lax; Secure';
  } catch (e) {}
})();
