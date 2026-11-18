/* TopQuote author card — staggered reveal + social hover.
   Self-contained: injects its own styles/fonts, so if this script never runs
   the card simply renders fully visible (no hidden state is applied). */
(function(){
  if (window.__tqAuthorCardAnim) return; window.__tqAuthorCardAnim = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasFont = [].some.call(document.querySelectorAll('link[rel="stylesheet"]'), function(l){
    // the site's own fonts come with mobile-responsive.css (self-hosted)
    return (l.href || '').indexOf('Playfair+Display') > -1 || (l.href || '').indexOf('mobile-responsive') > -1;
  });
  if (!hasFont){
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap';
    document.head.appendChild(fl);
  }

  var css = [
    '.tq-ac .tqa{opacity:0;transform:translateY(16px);will-change:opacity,transform;}',
    '.tq-ac.tq-in .tqa{opacity:1;transform:none;transition:opacity .55s ease, transform .6s cubic-bezier(.22,1,.36,1);transition-delay:calc(var(--i,0)*.09s);}',
    '.tq-soc{transition:transform .2s ease, filter .2s ease;}',
    '.tq-soc:hover{transform:translateY(-3px);filter:brightness(1.08);}',
    '@media (prefers-reduced-motion: reduce){.tq-ac .tqa{opacity:1 !important;transform:none !important;}}'
  ].join('');
  var st = document.createElement('style');
  st.setAttribute('data-tq-ac', '');
  st.textContent = css;
  document.head.appendChild(st);

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('tq-in'); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }) : null;

  function scan(){
    var cards = document.querySelectorAll('.tq-ac:not([data-tq-seen])');
    [].forEach.call(cards, function(c){
      c.setAttribute('data-tq-seen', '');
      if (!io || reduce){ c.classList.add('tq-in'); return; }
      io.observe(c);
    });
  }

  function boot(){ scan(); setTimeout(scan, 300); setTimeout(scan, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  if ('MutationObserver' in window){
    var t = null, mo = new MutationObserver(function(){
      if (t) return;
      t = setTimeout(function(){
        t = null;
        scan();
        if (document.querySelector('.tq-ac[data-tq-seen]')) mo.disconnect();
      }, 120);
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    setTimeout(function(){ mo.disconnect(); }, 6000);
  }
})();

/* Back-to-top button for blog posts (same look and behaviour as the main pages' initScrollTop). */
(function(){
  function add(){
    if (!document.body || document.getElementById('scrollTopBtn')) return;
    var b = document.createElement('button');
    b.id = 'scrollTopBtn'; b.type = 'button'; b.setAttribute('aria-label','Back to top');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"></polyline></svg>';
    b.style.cssText = 'position:fixed;right:26px;bottom:26px;z-index:9999;width:52px;height:52px;border-radius:50%;border:0;background:#1EBABB;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 26px rgba(20,40,35,.28);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease,transform .2s ease;';
    b.onmouseenter = function(){ b.style.transform = 'translateY(-3px)'; };
    b.onmouseleave = function(){ b.style.transform = 'none'; };
    b.onclick = function(){ window.scrollTo({ top:0, behavior:'smooth' }); };
    document.body.appendChild(b);
    var onScroll = function(){ var y = window.scrollY || document.documentElement.scrollTop; var on = y > 500; b.style.opacity = on ? '1' : '0'; b.style.visibility = on ? 'visible' : 'hidden'; };
    window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
