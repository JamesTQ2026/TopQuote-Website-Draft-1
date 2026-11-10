// Guide pages: the small [1], [2] reference numbers.
// Plain anchor jumps put the clicked source at the very top of the screen, so the
// "Appendix: sources" heading (and the sources before it) scrolled out of view.
// Instead: bring the sources heading to just under the menu bar, keep the clicked
// source on screen, and give that source a short teal highlight.
(function () {
  var st = document.createElement('style');
  st.textContent = 'li[id^="tq-ref-"]{transition:background-color .8s ease;border-radius:6px;}' +
    'li[id^="tq-ref-"].tq-ref-hit{background-color:rgba(30,186,187,.14);}';
  document.head.appendChild(st);

  function topOffset() {
    var bar = document.querySelector('.tqmm-bar');
    if (bar && getComputedStyle(bar).display !== 'none') return bar.getBoundingClientRect().height + 24;
    return 90;   // phones: clear the floating menu and call buttons
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#tq-ref-"]');
    if (!a) return;
    var li = document.getElementById(a.getAttribute('href').slice(1));
    if (!li) return;
    e.preventDefault();
    var head = li.closest('ol') || li, s = head.previousElementSibling;
    while (s && !/^H[1-4]$/.test(s.tagName)) s = s.previousElementSibling;
    if (s) head = s;
    var top = head.getBoundingClientRect().top + window.scrollY - topOffset();
    var liBottom = li.getBoundingClientRect().bottom + window.scrollY;
    if (liBottom - top > window.innerHeight - 40) top = liBottom - window.innerHeight + 60;   // long list: keep the source in view
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
    li.classList.add('tq-ref-hit');
    setTimeout(function () { li.classList.remove('tq-ref-hit'); }, 2200);
  });
})();
