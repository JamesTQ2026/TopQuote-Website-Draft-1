/* TopQuote mobile optimisation: hamburger nav + responsive grid collapse.
   Injected outside the framework tree (document.body) so it is safe on all pages. */
(function () {
  if (window.__mnav) return; window.__mnav = 1;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var CSS = [
    '#mnavBtn{display:none;}',
    '@media (max-width:980px){',
    '  header nav{display:none !important;}',
    '  #mnavBtn{display:flex !important;}',
    '  header a[href="Get a Quote.dc.html"]{margin-right:60px !important;}',
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
    '#mnav{position:fixed;inset:0;background:#0C1F19;z-index:99992;display:none;flex-direction:column;padding:26px 24px 40px;overflow:auto;-webkit-overflow-scrolling:touch;}',
    '#mnav.open{display:flex;}',
    "#mnav a{color:#fff;text-decoration:none;font-size:19px;font-weight:700;padding:14px 6px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Mulish',sans-serif;min-height:44px;display:flex;align-items:center;}",
    '#mnav a.sub{padding-left:24px;font-size:16px;color:rgba(255,255,255,.82);font-weight:500;}',
    '#mnav .mnav-label{color:#3fd3d4;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:18px 0 4px;font-family:sans-serif;}',
    '#mnav a.cta{background:#1EBABB;border-radius:10px;justify-content:center;border:none;margin-top:22px;padding:16px;}',
    '#mnavClose{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;}'
  ].join('\n');

  var LINKS = [
    ['Home Page.dc.html', 'Home'],
    ['label', 'Services'],
    ['Life Insurance.dc.html', 'Life Insurance', 'sub'],
    ['Critical Illness.dc.html', 'Critical Illness', 'sub'],
    ['Income Protection.dc.html', 'Income Protection', 'sub'],
    ['label', 'Company'],
    ['About Us.dc.html', 'About Us'],
    ['Consumer Duty.dc.html', 'Consumer Duty'],
    ['Reconnect.dc.html', 'Reconnect'],
    ['Contact.dc.html', 'Contact'],
    ['Careers.dc.html', 'Careers'],
    ['Blog.dc.html', 'Blog'],
    ['Find Us.dc.html', 'Find Us'],
    ['Get a Quote.dc.html', 'Get a quote', 'cta']
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
