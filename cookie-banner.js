/* TopQuote cookie consent.

   What this site actually stores and loads, which is what the banner asks about:
     - tq-cookie-consent in localStorage, holding the visitor's own choice.
       Strictly necessary (it exists only to honour that choice), so it is kept
       whichever way they answer and needs no consent of its own.
     - Google Maps embeds on the home page and Find Us. Third party and not
       necessary to deliver the page, so they stay unloaded until the visitor
       says yes.
   Plausible counts page views. It sets no cookies and reads nothing from the
   device, so it is not gated here; visitors are told about it in the banner and
   can switch it off from the Cookie Policy, which is what the rules ask for.
   There is no tag manager, advertising or social pixel anywhere on the site. If
   any is ever added, give it its own category here and gate it: do not let it
   ride along on the embed consent, which was not given for it.

   COMPLIANCE: the wording shown to visitors must be approved by The Openwork
   Partnership before launch, alongside the Cookie Policy page it links to. */
(function () {
  var KEY = 'tq-cookie-consent';
  var VERSION = 2;   // bump when what we load changes, so visitors are re-asked
  var MAX_AGE = 182 * 24 * 60 * 60 * 1000;   // ~6 months; the ICO expects consent to be refreshed

  /* ---------- the stored choice ---------- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      // version 1 stored the bare string 'accepted' or 'rejected'; it was given
      // against a different description of what we load, so it is not honoured
      if (raw.charAt(0) !== '{') return null;
      var rec = JSON.parse(raw);
      if (rec.v !== VERSION) return null;
      if (!rec.at || Date.now() - rec.at > MAX_AGE) return null;
      return rec.choice === 'accepted' ? 'accepted' : 'rejected';
    } catch (e) { return null; }
  }

  function write(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice: choice, v: VERSION, at: Date.now() }));
    } catch (e) {}
  }

  /* ---------- the embeds the choice governs ---------- */

  // Each gated frame carries its real address in data-src and nothing in src,
  // so nothing is requested from the third party until this runs.
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
      if (f.getAttribute('src')) f.removeAttribute('src');   // a loaded frame only clears on reload
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
      btn.addEventListener('click', function () { choose('accepted'); });

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

  function apply(choice) {
    if (choice === 'accepted') loadFrames(); else holdFrames();
  }

  /* ---------- the banner ---------- */

  function close() {
    var b = document.getElementById('tq-cookie-banner');
    if (b) b.parentNode.removeChild(b);
  }

  function choose(choice) {
    write(choice);
    apply(choice);
    close();
  }

  function banner() {
    if (document.getElementById('tq-cookie-banner')) return;

    var wrap = document.createElement('div');
    wrap.id = 'tq-cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie choices');
    wrap.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;' +
      'max-width:760px;margin:0 auto;background:#0C1F19;color:#fff;border-radius:16px;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.35);padding:20px 22px;' +
      'font-family:Mulish,system-ui,sans-serif;display:flex;flex-wrap:wrap;' +
      'align-items:center;gap:14px 18px;';

    var txt = document.createElement('div');
    txt.style.cssText = 'flex:1 1 320px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.9);';
    txt.innerHTML = 'We keep one item of local storage to remember the choice you make here, and ' +
      'nothing else by default. Our office map is loaded from Google, which sets its own cookies, ' +
      'so it stays off unless you allow it. We count page views with Plausible, which sets no ' +
      'cookies and collects nothing personal, and you can switch it off in the policy. We use no ' +
      'advertising or tracking cookies. ' +
      '<a href="/cookie-policy" style="color:#3fd3d4;text-decoration:underline;">Cookie Policy</a>.';

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:10px;flex:0 0 auto;';

    // Both buttons are the same size, weight and prominence: refusing has to be
    // as easy as agreeing.
    function mk(label, choice, bg, fg, border) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;' +
        'border-radius:999px;padding:11px 20px;min-width:122px;border:' + (border || 'none') +
        ';background:' + bg + ';color:' + fg + ';';
      b.addEventListener('click', function () { choose(choice); });
      return b;
    }
    btns.appendChild(mk('Reject', 'rejected', 'transparent', '#fff', '1px solid rgba(255,255,255,.55)'));
    btns.appendChild(mk('Allow the map', 'accepted', '#1EBABB', '#0C1F19'));

    wrap.appendChild(txt);
    wrap.appendChild(btns);
    document.body.appendChild(wrap);
  }

  /* ---------- a way back to the choice, on every page ---------- */

  // Withdrawing has to be as easy as giving, so the control sits in the footer
  // rather than behind "clear your browser's site data". Injected here so it
  // reaches every page that loads this script, the blog included.
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
      try { localStorage.removeItem(KEY); } catch (err) {}
      holdFrames();     // withdrawing takes effect at once, not on the next page
      close();
      banner();
    });

    host.appendChild(document.createTextNode(' · '));
    host.appendChild(a);
  }

  /* ---------- go ---------- */

  function start() {
    apply(read());            // nothing third-party loads until this has run
    if (!read()) setTimeout(banner, 400);
    settingsLink();
  }

  // Anything else on the page can ask, rather than reading storage itself.
  window.tqCookieConsent = {
    get: read,
    set: choose,
    reopen: function () { close(); banner(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
