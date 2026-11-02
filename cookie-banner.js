/* TopQuote cookie consent.

   Three categories, because three different things are at stake:

     necessary  tq-cookie-consent in localStorage, holding the choice made here.
                It exists only to honour that choice, so it is kept whichever way
                the visitor answers and needs no consent of its own.
     analytics  Google Analytics 4. It sets cookies and sends data to Google for
                Google's own purposes, so it is not loaded at all until the
                visitor says yes. Google Consent Mode is set to denied before
                anything runs, and updated only on a yes.
     embeds     The Google Maps frames on the home page and Find Us. Third party
                and not needed to deliver the page, so they stay unloaded too.

   Plausible is deliberately NOT gated here. It sets no cookies and reads nothing
   from the device, so the consent rule is not engaged; visitors are told about
   it and can switch it off from the Cookie Policy, which is what the rules ask
   for instead. If the Plausible subscription is ever dropped, remove its script
   tag from the pages and its paragraph from the policy in the same change.

   Refusing is one click, in a button of the same size and weight as accepting.
   Nothing is pre-ticked.

   COMPLIANCE: the wording shown to visitors must be approved by The Openwork
   Partnership before launch, alongside the Cookie Policy page it links to. */
(function () {
  /* ------------------------------------------------------------------ *
   *  Put the GA4 Measurement ID here, the G-XXXXXXXXXX from             *
   *  Admin > Data streams in Google Analytics. While it is empty the    *
   *  consent choice is still recorded and honoured; nothing is loaded.  *
   * ------------------------------------------------------------------ */
  var GA4_ID = '';

  var KEY = 'tq-cookie-consent';
  var VERSION = 3;   // bump when the categories change, so visitors are re-asked
  var MAX_AGE = 182 * 24 * 60 * 60 * 1000;   // ~6 months; the ICO expects consent to be refreshed
  var CATS = ['analytics', 'embeds'];

  /* ---------- the stored choice ---------- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw || raw.charAt(0) !== '{') return null;   // v1 stored a bare string
      var rec = JSON.parse(raw);
      if (rec.v !== VERSION) return null;               // asked about different things
      if (!rec.at || Date.now() - rec.at > MAX_AGE) return null;
      return { analytics: rec.analytics === true, embeds: rec.embeds === true };
    } catch (e) { return null; }
  }

  function write(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, at: Date.now(),
        analytics: choice.analytics === true,
        embeds: choice.embeds === true
      }));
    } catch (e) {}
  }

  /* ---------- Google Consent Mode ---------- */

  // Denied before anything else runs, so that if a Google tag is ever added
  // without going through this file, it still starts in the refused state.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',   // the consent record itself
    security_storage: 'granted',
    wait_for_update: 500
  });

  var gaLoaded = false;
  function loadGA() {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (gaLoaded || !GA4_ID) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    // Google Signals would share the visit for ads personalisation, which is not
    // what this consent was given for, so it stays off.
    gtag('config', GA4_ID, { allow_google_signals: false, anonymize_ip: true });
  }
  function denyGA() {
    gtag('consent', 'update', { analytics_storage: 'denied' });
    clearGACookies();
    // A tag already running in this page view cannot be unloaded; the next page
    // view starts clean because nothing is injected without a yes.
  }

  // Withdrawing has to be as easy as giving, and that has to mean the cookies
  // go too: Consent Mode stops new data, but _ga sits on the device for two
  // years otherwise. Cleared on every refusal, including the first visit, so a
  // stale cookie from an earlier yes cannot outlive it.
  function clearGACookies() {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    // www.top-quote.co.uk also writes to .top-quote.co.uk
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga|^_gid|^_gat|^_dc_gtm_/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  /* ---------- the embeds ---------- */

  function frames() {
    return [].slice.call(document.querySelectorAll('iframe[data-src][data-consent="embeds"]'));
  }

  function loadFrames() {
    frames().forEach(function (f) {
      var hold = f.parentNode.querySelector('.tq-embed-hold');
      if (hold) hold.parentNode.removeChild(hold);
      f.style.display = '';
      if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
    });
  }

  function holdFrames() {
    frames().forEach(function (f) {
      if (f.getAttribute('src')) f.removeAttribute('src');
      f.style.display = 'none';
      if (f.parentNode.querySelector('.tq-embed-hold')) return;

      var hold = document.createElement('div');
      hold.className = 'tq-embed-hold';
      hold.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;' +
        'background:#ECEDF1;color:#173B33;font-family:Mulish,system-ui,sans-serif;';

      var msg = document.createElement('p');
      msg.style.cssText = 'margin:0;font-size:14.5px;line-height:1.6;max-width:330px;color:#4A5A55;';
      msg.textContent = 'This map comes from Google, which sets its own cookies. ' +
        'It stays off until you allow embedded content.';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Show the map';
      btn.style.cssText = 'cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;' +
        'border:0;border-radius:999px;padding:11px 22px;background:#1EBABB;color:#0C1F19;';
      btn.addEventListener('click', function () {
        var c = read() || { analytics: false, embeds: false };
        c.embeds = true;
        apply(c, true);
      });

      var alt = document.createElement('p');
      alt.style.cssText = 'margin:0;font-size:13px;line-height:1.55;color:#6B7280;';
      alt.innerHTML = 'The address is written out on <a href="/find-us" style="color:#159a9b;">Find Us</a>.';

      hold.appendChild(msg);
      hold.appendChild(btn);
      hold.appendChild(alt);

      var parent = f.parentNode;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      parent.appendChild(hold);
    });
  }

  /* ---------- putting a choice into effect ---------- */

  function apply(choice, persist) {
    if (persist) write(choice);
    if (choice && choice.analytics) loadGA(); else denyGA();
    if (choice && choice.embeds) loadFrames(); else holdFrames();
    if (persist) close();
  }

  /* ---------- the banner ---------- */

  var BTN = 'cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;' +
            'border-radius:999px;padding:11px 18px;min-width:120px;';

  function close() {
    var b = document.getElementById('tq-cookie-banner');
    if (b) b.parentNode.removeChild(b);
  }

  function button(label, css, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = BTN + css;
    b.addEventListener('click', onClick);
    return b;
  }

  function banner(openPanel) {
    close();
    var now = read() || { analytics: false, embeds: false };

    var wrap = document.createElement('div');
    wrap.id = 'tq-cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie choices');
    wrap.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;' +
      'max-width:760px;margin:0 auto;background:#0C1F19;color:#fff;border-radius:16px;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.35);padding:20px 22px;' +
      'font-family:Mulish,system-ui,sans-serif;';

    var txt = document.createElement('div');
    txt.style.cssText = 'font-size:14px;line-height:1.6;color:rgba(255,255,255,.9);margin-bottom:16px;';
    txt.innerHTML = 'We use cookies to remember the choice you make here, and, if you allow it, ' +
      'to measure how the site is used and to show the map of our office. Nothing is switched on ' +
      'until you say so. You can change your mind at any time from the footer of any page. ' +
      '<a href="/cookie-policy" style="color:#3fd3d4;text-decoration:underline;">Cookie Policy</a>.';
    wrap.appendChild(txt);

    /* -- the per-category panel -- */
    var panel = document.createElement('div');
    panel.style.cssText = 'display:' + (openPanel ? 'block' : 'none') +
      ';border-top:1px solid rgba(255,255,255,.18);padding-top:14px;margin-bottom:16px;';

    var rows = [
      ['necessary', 'Strictly necessary', 'Remembers this choice. Always on.', null],
      ['analytics', 'Analytics', 'Google Analytics, so we can see which pages are read.', 'analytics'],
      ['embeds', 'Embedded content', 'The Google map of our office at Alderley Park.', 'embeds']
    ];
    var boxes = {};
    rows.forEach(function (r) {
      var row = document.createElement('label');
      row.style.cssText = 'display:flex;gap:12px;align-items:flex-start;padding:9px 0;cursor:' +
        (r[3] ? 'pointer' : 'default') + ';';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.cssText = 'margin-top:3px;width:18px;height:18px;flex:none;accent-color:#1EBABB;';
      if (r[3]) {
        cb.checked = now[r[3]] === true;   // never pre-ticked on a first visit
        boxes[r[3]] = cb;
      } else {
        cb.checked = true;
        cb.disabled = true;
      }
      var copy = document.createElement('div');
      copy.style.cssText = 'font-size:13.5px;line-height:1.5;';
      copy.innerHTML = '<strong style="color:#fff;">' + r[1] + '</strong>' +
        '<div style="color:rgba(255,255,255,.72);">' + r[2] + '</div>';
      row.appendChild(cb);
      row.appendChild(copy);
      panel.appendChild(row);
    });
    wrap.appendChild(panel);

    /* -- the buttons -- */
    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

    var reject = button('Reject all', 'border:1px solid rgba(255,255,255,.55);background:transparent;color:#fff;',
      function () { apply({ analytics: false, embeds: false }, true); });

    var accept = button('Accept all', 'border:0;background:#1EBABB;color:#0C1F19;',
      function () { apply({ analytics: true, embeds: true }, true); });

    var manage = button(openPanel ? 'Save my choices' : 'Choose',
      'border:1px solid rgba(255,255,255,.55);background:transparent;color:#fff;',
      function () {
        if (panel.style.display === 'none') {
          panel.style.display = 'block';
          manage.textContent = 'Save my choices';
          return;
        }
        apply({ analytics: !!(boxes.analytics && boxes.analytics.checked),
                embeds: !!(boxes.embeds && boxes.embeds.checked) }, true);
      });

    btns.appendChild(reject);
    btns.appendChild(manage);
    btns.appendChild(accept);
    wrap.appendChild(btns);

    document.body.appendChild(wrap);
  }

  /* ---------- a way back to the choice, on every page ---------- */

  function settingsLink() {
    if (document.querySelector('.tq-cookie-settings')) return;
    var links = document.querySelectorAll(
      'footer a[href="/cookie-policy"], footer a[href$="cookie-policy.pdf"]');
    if (!links.length) return;
    var host = links[links.length - 1].parentNode;

    var a = document.createElement('a');
    a.className = 'tq-cookie-settings';
    a.href = '#';
    a.textContent = 'Cookie settings';
    a.style.cssText = 'color:inherit;text-decoration:none;font:inherit;';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      banner(true);   // straight to the per-category panel, showing what is set
    });

    host.appendChild(document.createTextNode(' · '));
    host.appendChild(a);
  }

  /* ---------- go ---------- */

  function start() {
    var choice = read();
    apply(choice, false);        // nothing third-party loads until this has run
    if (!choice) setTimeout(function () { banner(false); }, 400);
    settingsLink();
  }

  window.tqCookieConsent = {
    get: read,
    set: function (c) { apply(c, true); },
    open: function () { banner(true); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
