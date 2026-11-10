/* TopQuote cookie consent.

   Three categories, because three different things are at stake:

     necessary  tq-cookie-consent in localStorage, holding the choice made here.
                It exists only to honour that choice, so it is kept whichever way
                the visitor answers and needs no consent of its own.
     analytics  Google Analytics 4 and PostHog (EU cloud). They set cookies and
                send usage data to Google / PostHog, so neither is loaded at all
                until the visitor says yes. Google Consent Mode is set to denied
                before anything runs, and updated only on a yes. PostHog never
                runs inside the quote form's iframe.
     embeds     The Google Maps frames on the home page and Find Us, and the live
                Feefo review widgets (their script sets a feefo.com cookie and
                reports widget views to Feefo). Third party
                and not needed to deliver the page, so they stay unloaded too.

   Refusing is one click, in a button of the same size and weight as accepting.
   Nothing is pre-ticked.

   COMPLIANCE: the wording shown to visitors must be approved by The Openwork
   Partnership before launch, alongside the Cookie Policy page it links to. */
(function () {
  // run once per page, even if the file is included twice
  if (window.__tqCookieBanner) return; window.__tqCookieBanner = 1;
  /* ------------------------------------------------------------------ *
   *  Put the GA4 Measurement ID here, the G-XXXXXXXXXX from             *
   *  Admin > Data streams in Google Analytics. While it is empty the    *
   *  consent choice is still recorded and honoured; nothing is loaded.  *
   * ------------------------------------------------------------------ */
  var GA4_ID = 'G-T6XJWR7ZRW';   // TopQuote Website property (530525971)

  var KEY = 'tq-cookie-consent';
  var VERSION = 5;   // bump when the categories change, so visitors are re-asked (5: PostHog added to Analytics)
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
    // not inside the quote form's iframe (health questions); the page around it is measured
    try { if (window.self !== window.top) return; } catch (e) { return; }
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
  /* ---------- PostHog (EU cloud), same consent as Google Analytics ---------- */
  // Project 343860. Loads only after an Analytics yes; never inside the quote form's
  // iframe, so health answers (smoking, heart conditions) are never sent. Typed text in
  // form fields is masked in session recordings. No person profiles unless identified.
  var POSTHOG_KEY = 'phc_vd4gsxVuP6FWjQkMD7r4HpgyYwNRbCNyuCQdEBuruFwX';
  var POSTHOG_HOST = 'https://eu.i.posthog.com';
  var phLoaded = false;
  function loadPostHog() {
    try { if (window.self !== window.top) return; } catch (e) { return; }
    if (!POSTHOG_KEY) return;
    if (phLoaded) { try { window.posthog.opt_in_capturing(); } catch (e) {} return; }
    phLoaded = true;
    /* PostHog's standard loader: a small stand-in that queues calls until the library arrives */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      session_recording: { maskAllInputs: true }
    });
  }
  function denyPostHog() {
    if (phLoaded) { try { window.posthog.opt_out_capturing(); } catch (e) {} }
    // its cookie and storage: ph_<key>_posthog (and anything else it keeps under ph_)
    try {
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('ph_') !== 0) return;
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + d;
        });
      });
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && k.indexOf('ph_') === 0) localStorage.removeItem(k);
      }
      for (var j = sessionStorage.length - 1; j >= 0; j--) {
        var sk = sessionStorage.key(j);
        if (sk && sk.indexOf('ph_') === 0) sessionStorage.removeItem(sk);
      }
    } catch (e) {}
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

      /* Until embeds are allowed, show a picture of the map rather than a grey
         box: a self-hosted OpenStreetMap image (no cookies, nothing loaded from
         Google), centred on the office, with a pin. The interactive Google map
         still loads only on consent; "Open in Google Maps" is a plain link out. */
      var hold = document.createElement('div');
      hold.className = 'tq-embed-hold';
      // the map picture loads when the box is near the screen (data-lazy-bg, see mobile-nav.js)
      hold.setAttribute('data-lazy-bg', '/assets/map-alderley-park.webp');
      hold.style.cssText = 'position:absolute;inset:0;overflow:hidden;' +
        'background:#E8EBE6 center/cover no-repeat;' +
        'font-family:Mulish,system-ui,sans-serif;color:#173B33;';

      var pin = document.createElement('div');
      pin.setAttribute('aria-hidden', 'true');
      pin.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);' +
        'filter:drop-shadow(0 4px 6px rgba(0,0,0,.3));';
      pin.innerHTML = '<svg width="38" height="48" viewBox="0 0 38 48"><path d="M19 47S3 29.5 3 18a16 16 0 0 1 32 0c0 11.5-16 29-16 29z" fill="#1EBABB" stroke="#fff" stroke-width="3"/><circle cx="19" cy="18" r="6" fill="#fff"/></svg>';

      var tag = document.createElement('div');
      tag.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,10px);' +
        'background:#fff;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700;' +
        'white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.15);';
      tag.textContent = 'TopQuote, Glasshouse, Alderley Park';

      var card = document.createElement('div');
      card.style.cssText = 'position:absolute;left:16px;right:16px;bottom:16px;margin:0 auto;max-width:27.5rem;' +
        'background:rgba(255,255,255,.96);border-radius:14px;padding:14px 16px;text-align:center;' +
        'box-shadow:0 10px 30px rgba(0,0,0,.18);';

      var msg = document.createElement('p');
      msg.style.cssText = 'margin:0 0 10px;font-size:13.5px;line-height:1.5;color:#4A5A55;';
      msg.textContent = 'The interactive Google map sets its own cookies, so it loads only when you allow it.';

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Show interactive map';
      btn.style.cssText = 'cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;' +
        'border:0;border-radius:999px;padding:10px 18px;background:#1EBABB;color:#0C1F19;';
      btn.addEventListener('click', function () {
        var c = read() || { analytics: false, embeds: false };
        c.embeds = true;
        apply(c, true);
      });

      var out = document.createElement('a');
      out.href = 'https://www.google.com/maps/search/?api=1&query=Glasshouse%2C+Alderley+Park%2C+Macclesfield+SK10+4TG';
      out.target = '_blank'; out.rel = 'noopener';
      out.textContent = 'Open in Google Maps';
      out.style.cssText = 'font-weight:700;font-size:14px;border-radius:999px;padding:10px 18px;' +
        'border:1.5px solid #1EBABB;color:#159a9b;text-decoration:none;background:#fff;';

      var credit = document.createElement('a');
      credit.href = 'https://www.openstreetmap.org/copyright';
      credit.target = '_blank'; credit.rel = 'noopener';
      credit.textContent = '© OpenStreetMap contributors';
      credit.style.cssText = 'position:absolute;right:0;top:0;font-size:11px;padding:3px 7px;' +
        'background:rgba(255,255,255,.85);color:#4A5A55;text-decoration:none;border-bottom-left-radius:6px;';

      row.appendChild(btn);
      row.appendChild(out);
      card.appendChild(msg);
      card.appendChild(row);
      hold.appendChild(pin);
      hold.appendChild(tag);
      hold.appendChild(card);
      hold.appendChild(credit);

      var parent = f.parentNode;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      parent.appendChild(hold);
    });
  }

  /* ---------- putting a choice into effect ---------- */

  /* ---------- live Feefo widgets ---------- */

  // Pages mark a live slot with data-feefo-live and today's version with
  // data-feefo-fallback; the CSS swaps them once html[data-feefo="on"] is set.
  var feefoLoaded = false;
  function loadFeefo() {
    // not inside the quote journey's iframe: the page around it has its own tab
    try { if (window.self !== window.top) return; } catch (e) { return; }
    document.documentElement.setAttribute('data-feefo', 'on');
    if (feefoLoaded) return;
    feefoLoaded = true;
    // the slide-out reviews tab, on every page; added to <body> directly so the
    // page framework never re-renders it away
    if (!document.querySelector('feefo-slideout')) {
      document.body.appendChild(document.createElement('feefo-slideout'));
    }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://api.feefo.com/api/javascript/top-quote';
    (document.body || document.head).appendChild(s);
    hideFeefoDates();
  }

  // The review date under each reviewer's name is hidden (James, 9 Nov 2026).
  // Feefo draws its widgets inside shadow roots with generated class names, so
  // CSS cannot reach them: find the date lines by their text instead, now and
  // whenever the carousel or slide-out adds more reviews.
  // "9 Jul 2024" on the cards; "2 years ago" in the full reviews panel
  var DATE_RE = /^(\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|(\d+|a|an) (second|minute|hour|day|week|month|year)s? ago)$/i;
  function hideDatesIn(root) {
    var els = root.querySelectorAll('div, span, time, p');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.childElementCount === 0 && el.style.display !== 'none' && DATE_RE.test(el.textContent.trim())) el.style.display = 'none';
    }
  }
  function hideFeefoDates() {
    var seen = [], tries = 0;
    // widgets live under the feefo-* tags; the "Read all reviews" panel is a
    // plain element added straight to <body> when someone opens it
    function scan() {
      var hosts = document.querySelectorAll('feefo-service-carousel, feefo-slideout, feefo-score-badge, feefo-service-carousel *, feefo-slideout *, #feefo-popUp-container *, body > *');
      for (var i = 0; i < hosts.length; i++) {
        var sr = hosts[i].shadowRoot;
        if (!sr || seen.indexOf(sr) >= 0) continue;
        seen.push(sr);
        hideDatesIn(sr);
        new MutationObserver((function (r) { return function () { hideDatesIn(r); }; })(sr))
          .observe(sr, { childList: true, subtree: true, characterData: true });
      }
    }
    var timer = setInterval(function () {
      scan();
      if (++tries > 40) clearInterval(timer);   // 30 seconds is ample for the widgets to load
    }, 750);
    // the panel's container can be added before its contents, so watch below
    // <body> too; scans are bunched to at most one every 300 ms
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; scan(); }, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }
  function holdFeefo() {
    // a script already running in this page view cannot be unloaded; the next
    // page view starts clean because nothing loads without a yes
    document.documentElement.removeAttribute('data-feefo');
  }

  function apply(choice, persist) {
    if (persist) write(choice);
    if (choice && choice.analytics) { loadGA(); loadPostHog(); } else { denyGA(); denyPostHog(); }
    if (choice && choice.embeds) { loadFrames(); loadFeefo(); } else { holdFrames(); holdFeefo(); }
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
      ['analytics', 'Analytics', 'Google Analytics and PostHog, so we can see which pages are read and how the site is used.', 'analytics'],
      ['embeds', 'Embedded content', 'The Google map of our office at Alderley Park, and our live Feefo reviews.', 'embeds']
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

    // Match the row it joins rather than guessing: the last link's own classes
    // and inline style, and a copy of whatever separator sits between them.
    var model = links[links.length - 1];
    var a = document.createElement('a');
    a.className = ((model.className || '') + ' tq-cookie-settings').trim();
    a.href = '#';
    a.textContent = 'Cookie settings';
    a.setAttribute('style', model.getAttribute('style') || '');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      banner(true);   // straight to the per-category panel, showing what is set
    });

    var sep = model.previousElementSibling;
    if (sep && sep.tagName === 'SPAN' && sep.textContent.trim().length === 1) {
      host.appendChild(sep.cloneNode(true));
    } else {
      host.appendChild(document.createTextNode(' · '));
    }
    host.appendChild(a);
  }

  /* ---------- go ---------- */

  /* Pages built by the design framework can render the map after start() has
     run, so it was missed: no placeholder and no map, just an empty box.
     Watch for maps that appear later and give them the same treatment.
     Debounced; holdFrames/loadFrames skip frames already handled, so the
     changes they make do not trigger another pass. */
  function watchFrames() {
    if (!window.MutationObserver || !document.body) return;
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () {
        queued = false;
        var c = read(), on = !!(c && c.embeds);
        var need = frames().some(function (f) {
          return on ? !f.getAttribute('src') : !f.parentNode.querySelector('.tq-embed-hold');
        });
        if (need) { if (on) loadFrames(); else holdFrames(); }
      }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    var choice = read();
    apply(choice, false);        // nothing third-party loads until this has run
    if (!choice) setTimeout(function () { banner(false); }, 400);
    settingsLink();
    // framework pages draw (and can redraw) the footer after this runs, which drops the
    // link: add it again whenever the page changes and it is missing
    if (window.MutationObserver && document.body) {
      var queued = false;
      new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; settingsLink(); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    watchFrames();
  }

  window.tqCookieConsent = {
    get: read,
    set: function (c) { apply(c, true); },
    open: function () { banner(true); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
