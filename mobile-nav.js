/* TopQuote mobile optimisation: hamburger nav + responsive grid collapse.
   Injected outside the framework tree (document.body) so it is safe on all pages. */
(function () {
  if (window.__mnav) return; window.__mnav = 1;

  /* When this page is embedded in an iframe (the quote journey on /get-a-quote),
     the parent page already shows a hamburger. Building a second one here stacks
     two burgers in the corner, so bail out and let the parent's nav be the one. */
  try { if (window.self !== window.top) return; } catch (e) { return; }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var CSS = [
    '#mnavBtn{display:none;}',
    /* tap-to-call: a phone button beside the menu button, same look, always on screen */
    '#mcallBtn{display:none;}',
    '@media (max-width:980px){',
    '  header nav{display:none !important;}',
    '  #mnavBtn{display:flex !important;}',
    '  #mcallBtn{display:flex !important;}',
    '  header .tq-hdr-cta a[href="/get-a-quote"]{margin-right:92px !important;}',
    '}',
    /* 3-4 column grids -> 2 columns on tablet */
    '@media (max-width:900px){',
    '  [style*="grid-template-columns:repeat(3"],[style*="grid-template-columns:repeat(4"]{grid-template-columns:repeat(2,1fr) !important;}',
    '}',
    /* everything single column on phones + tame fixed-width scenes */
    '@media (max-width:640px){',
    '  [style*="display:grid"]{grid-template-columns:1fr !important;}',
    '  [style*="width:440px"],[style*="width:420px"],[style*="width:384px"],[style*="width:380px"]{max-width:92vw !important;}',
    '  [style*="padding:100px"],[style*="padding:90px"]{padding-left:20px !important;padding-right:20px !important;}',
    '}',
    '#mnavBtn{position:fixed;top:22px;right:20px;z-index:99991;width:46px;height:46px;border-radius:12px;border:none;background:#1EBABB;color:#fff;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);}',
    '#mcallBtn{position:fixed;top:22px;right:76px;z-index:99991;width:46px;height:46px;border-radius:12px;background:#1EBABB;color:#fff;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.25);}',
    '#mnav{position:fixed;inset:0;background:#0C1F19;z-index:99992;display:none;flex-direction:column;padding:26px 24px 40px;overflow:auto;-webkit-overflow-scrolling:touch;}',
    '#mnav.open{display:flex;}',
    "#mnav a{color:#fff;text-decoration:none;font-size:19px;font-weight:700;padding:14px 6px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Mulish',sans-serif;min-height:44px;display:flex;align-items:center;}",
    '#mnav a.sub{padding-left:24px;font-size:16px;color:rgba(255,255,255,.82);font-weight:500;}',
    '#mnav .mnav-label{color:#3fd3d4;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:18px 0 4px;font-family:Mulish,sans-serif;}',
    '#mnav a.cta{background:#1EBABB;border-radius:10px;justify-content:center;border:none;margin-top:22px;padding:16px;}',
    '#mnavClose{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;}'
  ].join('\n');

  var LINKS = [
    ['/', 'Home'],
    ['label', 'Services'],
    ['/life-insurance', 'Life Insurance', 'sub'],
    ['/critical-illness', 'Critical Illness', 'sub'],
    ['/income-protection', 'Income Protection', 'sub'],
    ['label', 'Company'],
    ['/about', 'About Us', 'sub'],
    ['/consumer-duty', 'Consumer Duty', 'sub'],
    ['/reconnect', 'Reconnect', 'sub'],
    ['/kids-pass', 'Kids Pass', 'sub'],
    ['label', 'Get in touch'],
    ['/contact', 'Contact', 'sub'],
    ['/careers', 'Careers', 'sub'],
    ['label', 'Resources'],
    ['/blog', 'Blog', 'sub'],
    ['/find-us', 'Find Us', 'sub'],
    ['/get-a-quote', 'Get a quote', 'cta']
  ];

  ready(function () {
    if (document.getElementById('mnavBtn')) return;
    var st = document.createElement('style');
    st.id = 'mnavCSS'; st.textContent = CSS;
    document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.id = 'mnavBtn'; btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    document.body.appendChild(btn);

    var call = document.createElement('a');
    call.id = 'mcallBtn'; call.href = 'tel:+441619743710';
    call.setAttribute('aria-label', 'Call TopQuote on 0161 974 3710');
    call.innerHTML = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    document.body.appendChild(call);

    var nav = document.createElement('div');
    nav.id = 'mnav';
    var inner = '<button id="mnavClose" aria-label="Close menu">\u00d7</button>';
    LINKS.forEach(function (l) {
      if (l[0] === 'label') { inner += '<div class="mnav-label">' + l[1] + '</div>'; return; }
      inner += '<a href="' + l[0] + '"' + (l[2] ? ' class="' + l[2] + '"' : '') + '>' + l[1] + '</a>';
    });
    nav.innerHTML = inner;
    document.body.appendChild(nav);

    var open = function () { nav.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var close = function () { nav.classList.remove('open'); document.body.style.overflow = ''; };
    btn.addEventListener('click', open);
    nav.querySelector('#mnavClose').addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  });
})();

/* tqMailCopy: an email link opens the visitor's mail app, but on computers with
   no mail app set up (webmail users) the click appears to do nothing. So the
   address is also copied and a short note says so. */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    var addr = a.getAttribute('href').slice(7).split('?')[0];
    var done = function (ok) {
      var t = document.getElementById('tqMailToast');
      if (!t) {
        t = document.createElement('div'); t.id = 'tqMailToast'; t.setAttribute('role', 'status');
        t.style.cssText = 'position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:99999;background:#0C1F19;color:#fff;font:600 15px/1.4 Muli,Mulish,sans-serif;padding:12px 20px;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.25);transition:opacity .3s;max-width:90vw;text-align:center;';
        document.body.appendChild(t);
      }
      t.textContent = ok ? 'Email address copied: ' + addr : 'Email us at ' + addr;
      t.style.opacity = '1';
      clearTimeout(done.t); done.t = setTimeout(function () { t.style.opacity = '0'; }, 3500);
    };
    var legacy = function () {
      var ta = document.createElement('textarea'); ta.value = addr; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;'; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (err) {}
      ta.remove(); return ok;
    };
    // the synchronous copy first: the async clipboard API can sit waiting on a
    // permission prompt, which would leave the visitor with no feedback at all
    var ok = legacy();
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).catch(function () {});
    done(ok);
  }, true);
})();
