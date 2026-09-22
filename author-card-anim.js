/* TopQuote author card — staggered reveal + social hover.
   Self-contained: injects its own styles/fonts, so if this script never runs
   the card simply renders fully visible (no hidden state is applied). */
(function(){
  if (window.__tqAuthorCardAnim) return; window.__tqAuthorCardAnim = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasFont = [].some.call(document.querySelectorAll('link[rel="stylesheet"]'), function(l){
    return (l.href || '').indexOf('Playfair+Display') > -1;
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
