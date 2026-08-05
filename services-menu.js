(function () {
  var MENU_ID = 'svcMenu';

  function injectCSS() {
    if (document.getElementById('svcMenuCSS')) return;
    var css = document.createElement('style');
    css.id = 'svcMenuCSS';
    css.textContent = [
      '#svcMenu{opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;}',
      'html.svcmenu-open #svcMenu{opacity:1;visibility:visible;}',
      '#svcMenu .svc-pane{transform:translateX(140px);opacity:0;}',
      '#svcMenu .svc-pane:nth-child(1){transition:transform .95s cubic-bezier(.16,1,.3,1) .08s,opacity .8s ease .08s;}',
      '#svcMenu .svc-pane:nth-child(2){transition:transform .95s cubic-bezier(.16,1,.3,1) .22s,opacity .8s ease .22s;}',
      '#svcMenu .svc-pane:nth-child(3){transition:transform .95s cubic-bezier(.16,1,.3,1) .36s,opacity .8s ease .36s;}',
      'html.svcmenu-open #svcMenu .svc-pane{transform:translateX(0);opacity:1;}',
      '#svcMenu .svc-pane:hover .svc-pane-img{transform:scale(1.06);}',
      '#svcMenu .svc-pane:hover .svc-pane-vid{transform:scale(1.06);}',
      '#svcMenu .svc-pane:hover h3{color:#5fe0e0;}',
      "#svcMenu .arva-h{font-family:'Playfair Display','Georgia',serif;}",
      '@media (max-width:800px){#svcMenu .svc-grid{grid-template-columns:1fr !important;}}'
    ].join('');
    document.head.appendChild(css);
  }

  function pane(num, title, desc, vid, href) {
    return '' +
      '<div class="svc-pane" data-href="' + href + '" style="position:relative;overflow:hidden;cursor:pointer;background:#0C1F19;">' +
        '<div class="svc-pane-img" style="position:absolute;inset:0;background:#000;transition:transform .6s cubic-bezier(.22,1,.36,1);"><video class="svc-pane-vid" src="' + vid + '" muted="" loop="" playsinline="" preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"></video></div>' +
        '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,20,16,.15) 0%,rgba(6,20,16,.75) 100%);"></div>' +
        '<div style="position:absolute;left:0;right:0;top:0;padding:44px clamp(24px,3vw,52px) 0;text-align:center;">' +
          '<span style="display:inline-block;font-family:monospace;font-size:13px;color:#1EBABB;letter-spacing:.14em;margin-bottom:14px;">' + num + '</span>' +
          '<h3 class="arva-h" style="font-size:clamp(28px,2.4vw,40px);font-weight:600;color:#fff;line-height:1.05;margin-bottom:14px;">' + title + '</h3>' +
          '<p style="color:rgba(255,255,255,.72);font-size:14.5px;line-height:1.6;max-width:300px;min-height:70px;margin:0 auto 22px;">' + desc + '</p>' +
          '<span style="display:inline-flex;align-items:center;gap:8px;color:#fff;font-weight:700;font-size:14px;letter-spacing:.02em;">View <i data-lucide="arrow-up-right" style="width:17px;height:17px;color:#1EBABB;"></i></span>' +
        '</div>' +
      '</div>';
  }

  function injectMenu() {
    if (document.getElementById(MENU_ID)) return document.getElementById(MENU_ID);
    var wrap = document.createElement('div');
    wrap.id = MENU_ID;
    wrap.setAttribute('style', 'position:fixed;inset:0;z-index:9000;');
    wrap.innerHTML = '' +
      '<div id="svcMenuBackdrop" style="position:absolute;inset:0;background:rgba(6,20,16,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"></div>' +
      '<div class="svc-grid" style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);">' +
        pane('01', 'Life Insurance', 'Financial security for the people who depend on you, at the right level of cover.', 'assets/svc-life.mp4', 'Life Insurance.dc.html') +
        pane('02', 'Critical Illness Cover', 'A tax-free lump sum on diagnosis of a specified critical illness, when it matters most.', 'assets/svc-income.mp4', 'Critical Illness.dc.html') +
        pane('03', 'Income Protection', 'A monthly benefit if illness or injury stops you working, because your income is everything.', 'assets/svc-critical.mp4', 'Income Protection.dc.html') +
      '</div>' +
      '<button id="svcMenuClose" aria-label="Close menu" style="position:absolute;top:24px;right:24px;z-index:2;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;width:48px;height:48px;border-radius:50%;cursor:pointer;"><i data-lucide="x" style="width:20px;height:20px;"></i></button>';
    document.body.appendChild(wrap);
    return wrap;
  }

  // Safe icon rendering: append the <svg> INSIDE each <i data-lucide> instead of
  // replacing the node (lucide.createIcons swaps nodes React owns, which crashes
  // the page if a render is in flight). Exposed globally for the page scripts.
  window.__safeIcons = function () {
    var L = window.lucide;
    if (!L) return;
    document.querySelectorAll('i[data-lucide]').forEach(function (el) {
      if (el.firstChild) return;
      var name = el.getAttribute('data-lucide') || '';
      var pas = name.replace(/(^|-)([a-z0-9])/g, function (m, p, c) { return c.toUpperCase(); });
      var node = (L.icons && (L.icons[pas] || L.icons[name]));
      if (!node || !L.createElement) return;
      try {
        var svg = L.createElement(node);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        if (el.style.fill && el.style.fill !== 'none') svg.setAttribute('fill', el.style.fill);
        svg.style.display = 'block';
        el.appendChild(svg);
      } catch (e) {}
    });
  };
  function icons() { try { window.__safeIcons(); } catch (e) {} }

  function wire() {
    injectCSS();
    var menu = injectMenu();
    if (!menu || menu.__wired) { return; }
    menu.__wired = true;

    var open = function (e) { if (e) e.preventDefault(); document.documentElement.classList.add('svcmenu-open'); document.body.style.overflow = 'hidden'; icons(); };
    var close = function () { document.documentElement.classList.remove('svcmenu-open'); document.body.style.overflow = ''; };

    var cl = document.getElementById('svcMenuClose'); if (cl) cl.addEventListener('click', close);
    var bd = document.getElementById('svcMenuBackdrop'); if (bd) bd.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    menu.querySelectorAll('.svc-pane').forEach(function (p) {
      p.addEventListener('click', function () { var href = p.getAttribute('data-href'); if (href) window.location.href = href; });
      var vid = p.querySelector('.svc-pane-vid');
      if (vid) {
        p.addEventListener('mouseenter', function () { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); });
        p.addEventListener('mouseleave', function () { vid.pause(); vid.currentTime = 0; });
      }
    });

    // Wire the Services trigger: any element with [data-services-trigger],
    // or a nav link whose visible text starts with "Services".
    var triggers = [];
    document.querySelectorAll('[data-services-trigger]').forEach(function (t) { triggers.push(t); });
    document.querySelectorAll('nav a, header a').forEach(function (a) {
      var txt = (a.textContent || '').trim().toLowerCase();
      if (txt.indexOf('services') === 0) triggers.push(a);
    });
    triggers.forEach(function (t) { if (!t.__svcWired) { t.__svcWired = true; t.addEventListener('click', open); } });
    icons();
  }

  function boot() {
    if (!document.body) { return setTimeout(boot, 60); }
    wire();
    // retry a few times in case nav renders late (React mount)
    var n = 0; var t = setInterval(function () { wire(); if (++n > 30) clearInterval(t); }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
