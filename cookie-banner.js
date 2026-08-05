/* TopQuote cookie consent banner — mockup.
   COMPLIANCE: consent model and category behaviour to be confirmed with legal/compliance before launch. */
(function () {
  var KEY = 'tq-cookie-consent';
  function done() { return localStorage.getItem(KEY); }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} remove(); }
  function remove() { var b = document.getElementById('tq-cookie-banner'); if (b) b.remove(); }
  function build() {
    if (done() || document.getElementById('tq-cookie-banner')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tq-cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;margin:0 auto;background:#0C1F19;color:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:20px 22px;font-family:Mulish,system-ui,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;';
    var txt = document.createElement('div');
    txt.style.cssText = 'flex:1 1 320px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.9);';
    txt.innerHTML = 'We use essential cookies to make this site work. With your consent we\u2019d also like to use analytics and embedded content (maps, video). See our <a href="Cookie Policy.html" style="color:#3fd3d4;text-decoration:underline;">Cookie Policy</a>.';
    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:10px;flex:0 0 auto;';
    function mk(label, bg, fg, val, border) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.style.cssText = 'cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;border-radius:999px;padding:11px 20px;border:' + (border || 'none') + ';background:' + bg + ';color:' + fg + ';';
      b.addEventListener('click', function () { set(val); });
      return b;
    }
    btns.appendChild(mk('Reject', 'transparent', '#fff', 'rejected', '1px solid rgba(255,255,255,.35)'));
    btns.appendChild(mk('Accept all', '#1EBABB', '#0C1F19', 'accepted'));
    wrap.appendChild(txt); wrap.appendChild(btns);
    document.body.appendChild(wrap);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else setTimeout(build, 400);
})();
