/* CoverPanda — shared journey nav. Injected into every prototype.
   Provides: a fixed "Journey" pill back to the map, and progress helpers.
   Safe to load standalone (degrades to no-op visuals). Same-origin :3060 required for state sharing. */
(function () {
  var KEY = 'cp_journey';
  var MAP = '../journey-map.html'; // relative so it works on :3060 AND under a GitHub Pages /repo/ base path

  // which stage does this file belong to?
  var path = location.pathname.toLowerCase();
  var STAGE =
    path.indexOf('revamped-signup') > -1 ? 'land' :
    path.indexOf('financial-os') > -1 ? 'full' :
    (path.indexOf('vendor-stack') > -1 || path.indexOf('launch-agent') > -1 || path.indexOf('connectivity') > -1 ||
     path.indexOf('onboarding-portal') > -1 || path.indexOf('candidate-portal') > -1 || path.indexOf('vendor-portal') > -1) ? 'expand' :
    null;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  // mark current stage in progress (never downgrade a 'live')
  if (STAGE) {
    var s = read();
    if (s[STAGE] !== 'live') { s[STAGE] = 'in_progress'; write(s); }
  }

  // expose milestone setters for the prototypes
  window.cpJourneyDone = function (stage) {
    var st = read(); st[stage || STAGE] = 'live'; write(st);
    location.href = MAP + '?done=' + encodeURIComponent(stage || STAGE);
  };
  window.cpJourneyMark = function (stage, status) {
    var st = read(); st[stage || STAGE] = status || 'in_progress'; write(st);
  };
  window.cpGoMap = function () { location.href = MAP; };

  // ---- shared marketplace store: the three-sided seam ----
  // A franchisee's vendor request written here (franchisee onboarding portal) is read
  // by the vendor portal's inbox as the same object. Same-origin localStorage.
  var MKT = 'cp_marketplace';
  function mktRead() { try { return JSON.parse(localStorage.getItem(MKT)) || []; } catch (e) { return []; } }
  function mktWrite(a) { try { localStorage.setItem(MKT, JSON.stringify(a)); } catch (e) {} }
  window.cpMktAdd = function (req) {
    var a = mktRead();
    var i = a.findIndex(function (r) { return r.id === req.id; });
    if (i > -1) a[i] = req; else a.push(req);
    mktWrite(a); return req.id;
  };
  window.cpMktList = function () { return mktRead(); };
  window.cpMktUpdate = function (id, patch) {
    var a = mktRead().map(function (r) { return r.id === id ? Object.assign(r, patch) : r; });
    mktWrite(a);
  };

  // inject the fixed pill once the DOM is ready
  function inject() {
    if (document.getElementById('cpJourneyPill')) return;
    var css = document.createElement('style');
    css.textContent =
      '#cpJourneyPill{position:fixed;left:16px;bottom:16px;z-index:9000;display:inline-flex;align-items:center;gap:8px;' +
      'background:#131210;color:#fff;border:0;border-radius:999px;padding:9px 14px 9px 12px;font-size:12.5px;font-weight:600;' +
      "font-family:'Instrument Sans',-apple-system,sans-serif;cursor:pointer;box-shadow:0 2px 6px rgba(19,18,16,.18),0 14px 34px rgba(19,18,16,.22);" +
      'transition:transform .12s ease, background .15s ease;letter-spacing:-.01em}' +
      '#cpJourneyPill:hover{background:#2e2c28;transform:translateY(-1px)}' +
      '#cpJourneyPill .cpg{width:18px;height:18px;border-radius:6px;background:#ff3e00;display:grid;place-items:center;font-size:11px;line-height:1}' +
      '#cpJourneyPill .cpl{opacity:.62;font-weight:500}' +
      '@media print{#cpJourneyPill{display:none}}';
    document.head.appendChild(css);

    var labels = { land: 'Land', expand: 'Expand', full: 'Full' };
    var pill = document.createElement('button');
    pill.id = 'cpJourneyPill';
    pill.title = 'Back to your CoverPanda journey map';
    pill.innerHTML = '<span class="cpg">⊞</span> Journey' +
      (STAGE ? ' <span class="cpl">· ' + labels[STAGE] + '</span>' : '');
    pill.onclick = function () { location.href = MAP; };
    document.body.appendChild(pill);

    // reveal any "continue your journey" affordances baked into static markup
    var only = document.querySelectorAll('.cp-journey-only');
    for (var i = 0; i < only.length; i++) only[i].style.display = '';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
