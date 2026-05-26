/**
 * Keeply — "Can I recover my file?" storage-locus diagnostic (spec 052)
 *
 * A client-side decision tree: the visitor answers where the file lived + what
 * safety net existed, and gets an honest verdict (recoverable / depends / lost)
 * with next steps. No backend, no PII, nothing stored.
 *
 * Progressive enhancement: the page ships a static fallback table inside
 * #frd-app. If this script never runs (JS off, crawler), that table stays
 * visible and readable. When it runs, it replaces the table with the
 * interactive flow.
 *
 * CSP: must be an external file (no inline) — script-src has no 'unsafe-inline'.
 * Strings for both shipped locales (en + zh-TW) are embedded here so the page
 * needs no inline config block and no shared i18n pack keys (spec 052 D1=b).
 *
 * GA4: fires window.gtag events (Consent Mode v2 gates delivery; spec 024):
 *   - tool_start    once, on first answer
 *   - tool_complete on verdict { verdict, storage_locus }
 *   - tool_cta_click on Keeply CTA { verdict, storage_locus }
 * (The real download_click conversion fires later on the /install page.)
 */
(function () {
  'use strict';

  var root = document.getElementById('frd-app');
  if (!root) return;

  // ─── locale ──────────────────────────────────────────────────────────────
  var isZh = location.pathname.indexOf('/zh-TW/') !== -1 ||
    (document.documentElement.lang || '').indexOf('Hant') !== -1;
  var loc = isZh ? 'zh-TW' : 'en';

  // ─── copy (both shipped locales) ───────────────────────────────────────────
  var STRINGS = {
    'en': {
      start: 'Start the check',
      restart: 'Start over',
      progress: function (n) { return 'Question ' + n + ' of 3'; },
      ctaHref: '/install.html',
      q1: {
        q: 'Where did the file you want back normally live?',
        opts: [
          { v: 'cloud', label: 'A cloud drive', hint: 'Dropbox, OneDrive, Google Drive, SharePoint' },
          { v: 'local', label: 'On my own computer', hint: 'Local disk, Desktop, Downloads folder' },
          { v: 'nas', label: "The company NAS / shared network drive", hint: 'A shared server everyone maps to' },
          { v: 'sync', label: 'A folder that auto-syncs to the cloud / not sure', hint: '' }
        ]
      },
      q2: {
        cloud: { q: 'Does that cloud drive have version history / autosave turned on?', opts: [{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unknown', label: "I don't know" }] },
        sync: { q: 'Does that cloud drive have version history / autosave turned on?', opts: [{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unknown', label: "I don't know" }] },
        local: { q: 'Does this computer have Time Machine (Mac) / File History (Windows), or any regular backup?', opts: [{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unknown', label: "I don't know" }] },
        nas: { q: 'Does your NAS or IT have snapshots turned on?', opts: [{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unknown', label: "I don't know" }] }
      },
      q3: {
        q: 'Roughly how long ago did you overwrite or delete it?',
        opts: [{ v: 'minutes', label: 'Within minutes' }, { v: 'hours', label: 'Within hours' }, { v: 'days', label: 'Days ago or more' }]
      },
      verdict: {
        recoverable: {
          tag: '✅ You can almost certainly get it back',
          cls: 'border-green-500 bg-green-50',
          line: 'As long as your safety net was on before this happened, the version before you saved over it is almost certainly still there.',
          steps: {
            cloud: ['Open the file in your cloud drive (web version).', 'Find "Version history" / "Manage versions".', 'Pick the version from before the change and restore it.'],
            local: ['Open Time Machine (Mac) or File History (Windows).', 'Browse to the moment before the change.', 'Restore that single file.'],
            nas: ['Ask IT, or open your NAS admin, for the folder snapshot.', 'Find the snapshot from before the change.', 'Restore the file from it.']
          }
        },
        depends: {
          tag: '⚠️ It depends — and you need to check now',
          cls: 'border-amber-500 bg-amber-50',
          line: "Whether you can get it back comes down to one thing: did someone turn on a snapshot or backup beforehand? If yes, you can restore it. If not, there's no second chance.",
          steps: {
            cloud: ['Check the cloud Recycle Bin / Trash (deleted items linger 30 days on most plans).', 'Check "Version history" even if you think it was off.', 'The sooner you look, the better — retention windows expire.'],
            sync: ['Check the cloud Recycle Bin / Trash — sync deletes propagate there.', 'Check version history on the web version.', 'Act fast; retention windows expire.'],
            local: ['Check the Recycle Bin / Trash first.', 'Look for any old copy: email attachments, exports, a colleague.', 'If nothing turns up and there was no backup, see the honest note below.'],
            nas: ['Ask IT whether folder snapshots are enabled — most of the answer is here.', 'If snapshots exist, restore from the one before the change.', 'If not, see the honest note below.']
          }
        },
        lost: {
          tag: '❌ It probably cannot be recovered',
          cls: 'border-red-400 bg-red-50',
          line: "A local file you saved over, with no backup, is almost impossible to recover on a modern SSD — don't spend money on recovery software that promises otherwise; the overwrite plus the SSD's TRIM have most likely already wiped the old data.",
          steps: {
            local: ['Stop trying to "recover" — rebuild instead.', 'Pull what you can from old email attachments, exports, preview thumbnails, or a colleague who has a copy.', 'Tell the client/boss early and honestly while you rebuild.'],
            nas: ['If no snapshot existed, the overwritten version is gone.', 'Rebuild from the latest copy anyone on the team still has.', 'Set up a safety net so this is the last time (see below).']
          }
        }
      },
      cta: {
        heading: "Here's why this hurt",
        body: 'The panic comes from one gap: files on your computer and on the NAS have no automatic version safety net — the cloud’s version history doesn’t reach here, and relying on people to back up by hand eventually fails. Keeply fills exactly that gap: it keeps versions of your local and NAS files automatically, so every save is a restore point — no technical know-how needed.',
        button: 'Try Keeply free'
      },
      faded: 'Your answers stay in your browser. Nothing is uploaded.'
    },

    'zh-TW': {
      start: '開始檢測',
      restart: '重新開始',
      progress: function (n) { return '第 ' + n + ' / 3 題'; },
      ctaHref: '/zh-TW/install.html',
      q1: {
        q: '你想救回的那個檔案，平常存在哪裡？',
        opts: [
          { v: 'cloud', label: '雲端硬碟', hint: 'Dropbox、OneDrive、Google Drive、SharePoint' },
          { v: 'local', label: '我自己的電腦裡', hint: '本機硬碟、桌面、下載資料夾' },
          { v: 'nas', label: '公司的 NAS／共用網路磁碟', hint: '大家都連的共用伺服器' },
          { v: 'sync', label: '會自動同步到雲端的資料夾／我不確定', hint: '' }
        ]
      },
      q2: {
        cloud: { q: '你的雲端硬碟有開「版本歷史／自動儲存」嗎？', opts: [{ v: 'yes', label: '有' }, { v: 'no', label: '沒有' }, { v: 'unknown', label: '不知道' }] },
        sync: { q: '那個雲端有開「版本歷史／自動儲存」嗎？', opts: [{ v: 'yes', label: '有' }, { v: 'no', label: '沒有' }, { v: 'unknown', label: '不知道' }] },
        local: { q: '這台電腦有開 Time Machine（Mac）或「檔案歷程記錄」（Windows），或平常有在備份嗎？', opts: [{ v: 'yes', label: '有' }, { v: 'no', label: '沒有' }, { v: 'unknown', label: '不知道' }] },
        nas: { q: '你們的 NAS 或 IT 有開「快照（snapshot）」嗎？', opts: [{ v: 'yes', label: '有' }, { v: 'no', label: '沒有' }, { v: 'unknown', label: '不知道' }] }
      },
      q3: {
        q: '你大概多久前把它存壞或刪掉的？',
        opts: [{ v: 'minutes', label: '幾分鐘內' }, { v: 'hours', label: '幾小時內' }, { v: 'days', label: '幾天以上' }]
      },
      verdict: {
        recoverable: {
          tag: '✅ 你幾乎一定救得回',
          cls: 'border-green-500 bg-green-50',
          line: '只要你的安全網在出事前就開著，被覆蓋前的舊版通常都留著——幾乎一定救得回。',
          steps: {
            cloud: ['在雲端硬碟（網頁版）打開那個檔案。', '找「版本歷史／管理版本」。', '挑出改動前的版本，還原它。'],
            local: ['打開 Time Machine（Mac）或檔案歷程記錄（Windows）。', '回到改動前的那個時間點。', '只還原這一個檔案。'],
            nas: ['問 IT、或打開 NAS 管理後台，找資料夾快照。', '找改動前的那個快照。', '從裡面還原檔案。']
          }
        },
        depends: {
          tag: '⚠️ 看狀況——而且要現在馬上查',
          cls: 'border-amber-500 bg-amber-50',
          line: '能不能救回，取決於一件事：有沒有人「事先」開好快照或備份？有，就還原得回；沒有，就沒有第二次機會。',
          steps: {
            cloud: ['先查雲端的回收桶／垃圾桶（多數方案刪除後會留 30 天）。', '就算你以為沒開，也去看一下「版本歷史」。', '愈早查愈好——保留期會過期。'],
            sync: ['查雲端的回收桶／垃圾桶——同步刪除會跑到那裡。', '到網頁版看版本歷史。', '動作要快，保留期會過期。'],
            local: ['先看資源回收筒／垃圾桶。', '找任何舊副本：email 附件、匯出檔、同事手上的。', '如果都找不到、又沒備份，看下面那段誠實的話。'],
            nas: ['問 IT 有沒有開資料夾快照——答案多半在這。', '有快照的話，從改動前那個還原。', '沒有的話，看下面那段誠實的話。']
          }
        },
        lost: {
          tag: '❌ 大概救不回了',
          cls: 'border-red-400 bg-red-50',
          line: '本機檔案被存檔覆蓋、又沒有任何備份，在現代 SSD 上幾乎救不回——別急著花錢買號稱能救的復原軟體，覆蓋寫入加上 SSD 的 TRIM 機制，舊資料多半已經被抹掉。',
          steps: {
            local: ['別再嘗試「復原」了，改用重建的。', '從舊的 email 附件、匯出檔、預覽縮圖、或同事手上的副本，把能拿回來的先拿回來。', '一邊重建、一邊誠實地早點跟客戶／老闆說。'],
            nas: ['如果當初沒開快照，被覆蓋的版本就沒了。', '從團隊裡還留著的最新副本重建。', '架一張安全網，讓這是最後一次（見下方）。']
          }
        }
      },
      cta: {
        heading: '你會這麼慌，是有原因的',
        body: '慌張來自一個缺口：本機和 NAS 上的檔案，根本沒有一張自動版本安全網——雲端的版本歷史罩不到這裡，而靠人記得手動備份，遲早會破功。Keeply 就是補這塊：自動幫你本機和 NAS 的檔案留版本，存檔就是一個還原點，不用懂任何工程術語。',
        button: '免費試用 Keeply'
      },
      faded: '你的作答只留在瀏覽器裡，不會上傳。'
    }
  };

  var T = STRINGS[loc];

  // ─── state + GA4 ───────────────────────────────────────────────────────────
  var answers = { locus: null, safety: null, age: null };
  var started = false;

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  function markStart() {
    if (started) return;
    started = true;
    track('tool_start', { tool: 'recover-file' });
  }

  // ─── verdict logic ─────────────────────────────────────────────────────────
  function resolveVerdict() {
    var locus = answers.locus, safe = answers.safety;
    // cloud / sync: hinges on version history
    if (locus === 'cloud' || locus === 'sync') {
      if (safe === 'yes') return 'recoverable';
      return 'depends'; // no / unknown → check recycle bin + history
    }
    if (locus === 'local') {
      if (safe === 'yes') return 'recoverable';
      if (safe === 'no') return 'lost';
      return 'depends'; // unknown → go check
    }
    if (locus === 'nas') {
      if (safe === 'yes') return 'recoverable';
      if (safe === 'no') return 'lost';
      return 'depends';
    }
    return 'depends';
  }
  function showCta(verdict) {
    return (verdict === 'depends' || verdict === 'lost') &&
      (answers.locus === 'local' || answers.locus === 'nas' || answers.locus === 'sync');
  }

  // ─── rendering ─────────────────────────────────────────────────────────────
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function clear() { root.innerHTML = ''; }

  function optionButton(opt, onPick) {
    var hint = opt.hint ? '<span class="block text-sm text-gray-500 mt-0.5">' + opt.hint + '</span>' : '';
    var b = el('<button type="button" class="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-colors">' +
      '<span class="font-medium text-gray-900">' + opt.label + '</span>' + hint + '</button>');
    b.addEventListener('click', function () { onPick(opt.v); });
    return b;
  }

  function renderQuestion(stepNum, question, opts, onPick) {
    clear();
    var wrap = el('<div></div>');
    wrap.appendChild(el('<p class="text-sm font-semibold text-brand-600 mb-2">' + T.progress(stepNum) + '</p>'));
    wrap.appendChild(el('<h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-5">' + question + '</h2>'));
    var list = el('<div class="space-y-3"></div>');
    opts.forEach(function (o) { list.appendChild(optionButton(o, onPick)); });
    wrap.appendChild(list);
    wrap.appendChild(el('<p class="text-xs text-gray-400 mt-5">' + T.faded + '</p>'));
    root.appendChild(wrap);
  }

  function renderVerdict() {
    var key = resolveVerdict();
    var v = T.verdict[key];
    var locus = answers.locus;
    var steps = v.steps[locus] || v.steps.local || v.steps.cloud || [];
    track('tool_complete', { tool: 'recover-file', verdict: key, storage_locus: locus });

    clear();
    var wrap = el('<div></div>');
    var card = el('<div class="rounded-2xl border-2 ' + v.cls + ' p-6 md:p-7"></div>');
    card.appendChild(el('<p class="text-lg md:text-xl font-bold text-gray-900 mb-3">' + v.tag + '</p>'));
    card.appendChild(el('<p class="text-gray-800 leading-relaxed mb-4">' + v.line + '</p>'));
    if (steps.length) {
      var ol = el('<ol class="list-decimal pl-5 space-y-2 text-gray-700"></ol>');
      steps.forEach(function (s) { ol.appendChild(el('<li class="leading-relaxed">' + s + '</li>')); });
      card.appendChild(ol);
    }
    wrap.appendChild(card);

    if (showCta(key)) {
      var cta = el('<div class="mt-5 rounded-2xl bg-brand-600 text-white p-6 md:p-7"></div>');
      cta.appendChild(el('<p class="text-lg font-bold mb-2">' + T.cta.heading + '</p>'));
      cta.appendChild(el('<p class="text-brand-50 leading-relaxed mb-5">' + T.cta.body + '</p>'));
      var a = el('<a href="' + T.ctaHref + '" class="inline-block bg-white text-brand-700 hover:bg-brand-50 font-bold px-7 py-3 rounded-full transition-colors">' + T.cta.button + '</a>');
      a.addEventListener('click', function () { track('tool_cta_click', { tool: 'recover-file', verdict: key, storage_locus: locus }); });
      cta.appendChild(a);
      wrap.appendChild(cta);
    }

    var restart = el('<button type="button" class="mt-5 text-sm text-gray-500 underline hover:text-gray-700">' + T.restart + '</button>');
    restart.addEventListener('click', start);
    wrap.appendChild(restart);
    root.appendChild(wrap);
  }

  // ─── flow ──────────────────────────────────────────────────────────────────
  function step3() {
    renderQuestion(3, T.q3.q, T.q3.opts, function (v) { answers.age = v; renderVerdict(); });
  }
  function step2() {
    var q = T.q2[answers.locus] || T.q2.cloud;
    renderQuestion(2, q.q, q.opts, function (v) { answers.safety = v; step3(); });
  }
  function step1() {
    renderQuestion(1, T.q1.q, T.q1.opts, function (v) {
      markStart();
      answers.locus = v;
      step2();
    });
  }

  function start() {
    answers = { locus: null, safety: null, age: null };
    step1();
  }

  // Replace the static fallback with the interactive flow.
  start();
})();
