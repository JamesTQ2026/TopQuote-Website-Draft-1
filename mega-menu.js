// TopQuote mega menu (site-wide). REVERSIBLE: set ENABLED = false to restore the original dark header nav everywhere.
(function () {
  var ENABLED = true;
  if (!ENABLED) return;
  if (window.__tqMegaMenu) return; window.__tqMegaMenu = true;
  // On the home page the menu scrolls away with the page instead of staying fixed.
  var STATIC_PAGE = location.pathname === '/' || /home page/i.test(decodeURIComponent(location.pathname));
  // Pages with a light background at the top: the bar starts in its solid white state.
  var LIGHT_PAGE = /^\/get-a-quote|get a quote/i.test(decodeURIComponent(location.pathname));

  var LI = [
    ['Life insurance policies', [
      ['Level term life insurance', '/life-insurance/level-term-life-insurance'],
      ['Decreasing term life insurance', '/life-insurance/decreasing-term-life-insurance'],
      ['Short term life insurance', '/life-insurance/short-term-life-insurance'],
      ['Term life insurance', '/life-insurance/term-life-insurance'],
      ['Whole of life insurance', '/life-insurance/whole-of-life-insurance'],
      ['Life insurance for funeral costs', '/life-insurance/life-insurance-funeral-cover'],
      ['Joint life insurance', '/life-insurance/joint-life-insurance'],
      ['Family income benefit', '/life-insurance/family-income-benefit'],
      ['Life insurance with critical illness cover', '/life-insurance/life-insurance-with-critical-illness-cover'],
      ['Life insurance with no medical', '/life-insurance/life-insurance-with-no-medical'],
      ['Critical illness cover', '/critical-illness'],
      ['Income protection', '/income-protection']
    ]],
    ['Family &amp; life stages', [
      ['Family life insurance', '/family-life-insurance'],
      ['Life insurance for mums', '/life-insurance-for-mums'],
      ['Life insurance for women', '/life-insurance/life-insurance-for-women'],
      ['Life insurance for dads', '/life-insurance-for-dads'],
      ['Life insurance for parents', '/life-insurance-for-parents'],
      ['Life insurance when pregnant', '/life-insurance-when-pregnant'],
      ['Life insurance after divorce', '/life-insurance-after-divorce'],
      ['Life insurance for couples', '/life-insurance/life-insurance-for-couples'],
      ['Life insurance for young adults', '/life-insurance/life-insurance-for-young-adults']
    ], 'More from TopQuote', [
      ['Kids Pass &amp; Popcorn Pass', '/kids-pass'],
      ['Blog', '/blog'],
      ['Careers', '/careers'],
      ['Find Us', '/find-us']
    ]],
    ['Life insurance guides', [
      ['What is life insurance?', '/life-insurance/what-is-life-insurance'],
      ['How much does life insurance cost?', '/life-insurance/how-much-does-life-insurance-cost'],
      ['How much life insurance do I need?', '/life-insurance/how-much-life-insurance-do-i-need'],
      ['Is life insurance worth it?', '/life-insurance/is-life-insurance-worth-it'],
      ['Types of life insurance', '/life-insurance/types-of-life-insurance'],
      ['Is life insurance taxable?', '/life-insurance/is-life-insurance-taxable'],
      ['How life insurance payouts work', '/life-insurance/how-life-insurance-payouts-work'],
      ['How long does a claim take?', '/life-insurance/how-long-does-a-life-insurance-claim-take'],
      ['Life insurance and income protection', '/life-insurance/life-insurance-and-income-protection']
    ]],
    ['Mortgage', [
      ['Mortgage life insurance', '/life-insurance/mortgage-life-insurance'],
      ['Do you need life insurance for a mortgage?', '/life-insurance/do-you-need-life-insurance-for-a-mortgage']
    ], 'Medical conditions', [
      ['Life insurance for smokers', '/life-insurance/life-insurance-for-smokers'],
      ['Life insurance with medical conditions', '/life-insurance/life-insurance-with-medical-conditions'],
      ['Life insurance with type 1 diabetes', '/life-insurance/life-insurance-with-type-1-diabetes'],
      ['Life insurance with type 2 diabetes', '/life-insurance/life-insurance-with-type-2-diabetes'],
      ['High risk life insurance', '/life-insurance/high-risk-life-insurance'],
      ['HIV life insurance', '/life-insurance/hiv-life-insurance']
    ]],
    ['Providers', [
      ['Aviva', '/providers/aviva'],
      ['Legal &amp; General', '/providers/legal-and-general'],
      ['Vitality', '/providers/vitality'],
      ['LV=', '/providers/lv'],
      ['Royal London', '/providers/royal-london'],
      ['Guardian', '/providers/guardian']
    ], 'Existing customers', [
      ['Reconnect - Legal &amp; General Life insurance Policy', '/reconnect'],
      ['Consumer Duty', '/consumer-duty']
    ]]
  ];
  var CI = [
    ['Critical illness policies', [
      ['Critical illness cover', '/critical-illness'],
      ['Life and critical illness cover', '/critical-illness/life-and-critical-illness-cover'],
      ['Critical illness cover only', '/critical-illness/critical-illness-cover-only'],
      ['Decreasing life insurance with critical illness', '/critical-illness/decreasing-life-insurance-with-critical-illness-cover'],
      ['Critical illness cover for your mortgage', '/critical-illness/critical-illness-cover-for-your-mortgage'],
      ['Joint life and critical illness cover', '/critical-illness/joint-life-and-critical-illness-cover'],
      ['Children’s critical illness cover', '/critical-illness/childrens-critical-illness-cover']
    ]],
    ['Critical Illness Guides', [
      ['What is critical illness cover?', '/critical-illness/what-is-critical-illness-cover'],
      ['How much critical illness cover do I need?', '/critical-illness/how-much-critical-illness-cover-do-i-need'],
      ['What does critical illness cover?', '/critical-illness/what-does-critical-illness-cover'],
      ['Total permanent disability cover', '/critical-illness/total-permanent-disability-cover'],
      ['Do I need critical illness cover?', '/critical-illness/do-i-need-critical-illness-cover'],
      ['Is critical illness cover worth it?', '/critical-illness/is-critical-illness-cover-worth-it'],
      ['Critical illness cover cost UK', '/critical-illness/critical-illness-cover-cost-uk'],
      ['Critical illness cover vs income protection', '/critical-illness/critical-illness-cover-vs-income-protection']
    ]],
    ['Medical conditions', [
      ['Does critical illness cover cancer?', '/critical-illness/does-critical-illness-cover-cancer'],
      ['Critical illness cover with diabetes', '/critical-illness/critical-illness-cover-with-diabetes'],
      ['Critical illness cover with pre-existing conditions', '/critical-illness/critical-illness-cover-with-pre-existing-conditions'],
      ['Does critical illness cover multiple sclerosis?', '/critical-illness/does-critical-illness-cover-multiple-sclerosis'],
      ['Does critical illness cover heart attack and stroke?', '/critical-illness/does-critical-illness-cover-heart-attack-and-stroke'],
      ['Does critical illness cover mental health?', '/critical-illness/does-critical-illness-cover-mental-health'],
      ['Does critical illness cover arthritis?', '/critical-illness/does-critical-illness-cover-arthritis']
    ], 'Existing customers', [
      ['Reconnect - Legal &amp; General Life insurance Policy', '/reconnect'],
      ['Consumer Duty', '/consumer-duty']
    ]],
    ['Providers', [
      ['Aviva', '/providers/aviva'],
      ['Legal &amp; General', '/providers/legal-and-general'],
      ['Vitality', '/providers/vitality'],
      ['LV=', '/providers/lv'],
      ['Royal London', '/providers/royal-london'],
      ['Guardian', '/providers/guardian']
    ], 'More from TopQuote', [
      ['Kids Pass &amp; Popcorn Pass', '/kids-pass'],
      ['Blog', '/blog'],
      ['Careers', '/careers'],
      ['Find Us', '/find-us']
    ]]
  ];
  var IP = [
    ['Income protection guides', [
      ['Income protection insurance', '/income-protection'],
      ['What is income protection?', '/income-protection/what-is-income-protection'],
      ['How much does income protection cost?', '/income-protection/how-much-does-income-protection-cost'],
      ['Is income protection worth it?', '/income-protection/is-income-protection-worth-it'],
      ['Compare income protection insurance', '/income-protection/compare-income-protection-insurance'],
      ['Income protection vs critical illness', '/income-protection/income-protection-vs-critical-illness'],
      ['Income protection vs life insurance', '/income-protection/income-protection-vs-life-insurance'],
      ['Is income protection taxable?', '/income-protection/is-income-protection-taxable'],
      ['Does income protection cover redundancy?', '/income-protection/does-income-protection-cover-redundancy']
    ]],
    ['Types of income protection', [
      ['Short-term income protection', '/income-protection/short-term-income-protection'],
      ['Long-term income protection', '/income-protection/long-term-income-protection'],
      ['Own occupation income protection', '/income-protection/own-occupation-income-protection'],
      ['Executive income protection', '/income-protection/executive-income-protection'],
      ['Family income protection', '/income-protection/family-income-protection'],
      ['Mortgage income protection', '/income-protection/mortgage-income-protection']
    ], 'Medical conditions', [
      ['Income protection with pre-existing conditions', '/income-protection/income-protection-with-pre-existing-conditions'],
      ['Income protection and mental health', '/income-protection/income-protection-and-mental-health'],
      ['Income protection for diabetics', '/income-protection/income-protection-for-diabetics'],
      ['Income protection when pregnant', '/income-protection/income-protection-when-pregnant'],
      ['Smoker income protection', '/income-protection/income-protection-for-smokers']
    ]],
    ['Occupations', [
      ['Income protection for the self-employed', '/income-protection/income-protection-for-self-employed'],
      ['Income protection for contractors', '/income-protection/income-protection-for-contractors'],
      ['Income protection for doctors', '/income-protection/income-protection-for-doctors'],
      ['Income protection for dentists', '/income-protection/income-protection-for-dentists'],
      ['Income protection for nurses', '/income-protection/income-protection-for-nurses'],
      ['Income protection for teachers', '/income-protection/income-protection-for-teachers']
    ], 'Providers', [
      ['Aviva', '/providers/aviva'],
      ['Legal &amp; General', '/providers/legal-and-general'],
      ['Vitality', '/providers/vitality'],
      ['LV=', '/providers/lv'],
      ['Royal London', '/providers/royal-london'],
      ['Guardian', '/providers/guardian']
    ]],
    ['Existing customers', [
      ['Reconnect - Legal &amp; General Life insurance Policy', '/reconnect'],
      ['Consumer Duty', '/consumer-duty']
    ], 'More from TopQuote', [
      ['Kids Pass &amp; Popcorn Pass', '/kids-pass'],
      ['Blog', '/blog'],
      ['Careers', '/careers'],
      ['Find Us', '/find-us']
    ]]
  ];

  function cols(data) {
    var h = '';
    for (var i = 0; i < data.length; i++) {
      h += '<div class="tqmm-col">';
      for (var j = 0; j < data[i].length; j += 2) {
        h += '<div class="tqmm-group"><h4>' + data[i][j] + '</h4>';
        var items = data[i][j + 1];
        for (var k = 0; k < items.length; k++) h += '<a href="' + items[k][1] + '">' + items[k][0] + '</a>';
        h += '</div>';
      }
      h += '</div>';
    }
    return h;
  }
  function panel(title, desc, icon, data, colCount) {
    return '<div class="tqmm-panel"><div class="tqmm-panel-in">' +
      '<div class="tqmm-head"><span class="tqmm-ico">' + icon + '</span><div><div class="tqmm-title">' + title + '</div><div class="tqmm-desc">' + desc + '</div></div></div>' +
      '<div class="tqmm-grid" style="grid-template-columns:repeat(' + colCount + ',1fr);">' + cols(data) + '</div>' +
      '</div></div>';
  }

  var css = '\n.tqmm-bar{position:fixed;top:0;left:0;right:0;z-index:600;background:transparent;border-bottom:1px solid transparent;font-family:\'Mulish\',sans-serif;transition:background .25s ease,border-color .25s ease,box-shadow .25s ease;}\n' +
    '.tqmm-bar:hover,.tqmm-bar.tqmm-open,.tqmm-bar.tqmm-scrolled{background:#fff;border-bottom-color:#E3E8EE;box-shadow:0 14px 34px rgba(12,31,25,.14);}\n' +
    '.tqmm-inner{max-width:none;margin:0 auto;padding:0 clamp(24px,5vw,84px);display:flex;align-items:center;justify-content:space-between;gap:28px;height:66px;}\n' +
    '.tqmm-nav{display:flex;align-items:stretch;gap:26px;font-size:15.5px;font-weight:700;height:100%;}\n' +
    '.tqmm-top{display:flex;align-items:center;gap:6px;color:#fff;text-decoration:none;padding:0 6px;transition:color .25s ease;}\n' +
    '.tqmm-bar:hover .tqmm-top,.tqmm-bar.tqmm-open .tqmm-top,.tqmm-bar.tqmm-scrolled .tqmm-top{color:#173B33;}\n' +
    '.tqmm-bar:hover .tqmm-top:hover,.tqmm-bar.tqmm-open .tqmm-top:hover,.tqmm-bar.tqmm-scrolled .tqmm-top:hover{color:#1EBABB;}\n' +
    '.tqmm-caret{font-size:9px;opacity:.75;}\n.tqmm-logo-wrap{position:relative;height:32px;display:block;}\n.tqmm-logo-wrap img{height:32px;width:auto;display:block;}\n.tqmm-logo-dark{position:absolute;left:0;top:0;opacity:0;transition:opacity .25s ease;}\n.tqmm-bar:hover .tqmm-logo-dark,.tqmm-bar.tqmm-open .tqmm-logo-dark,.tqmm-bar.tqmm-scrolled .tqmm-logo-dark{opacity:1;}\n.tqmm-bar:hover .tqmm-logo-light,.tqmm-bar.tqmm-open .tqmm-logo-light,.tqmm-bar.tqmm-scrolled .tqmm-logo-light{opacity:0;}\n.tqmm-logo-light{transition:opacity .25s ease;}\n' +
    '.tqmm-item{display:flex;position:static;}\n' +
    '.tqmm-item.tqmm-sm{position:relative;}\n' +
    '.tqmm-dim{position:fixed;inset:0;background:rgba(12,31,25,.45);opacity:0;visibility:hidden;transition:opacity .22s ease;z-index:590;pointer-events:none;}\n.tqmm-dim.on{opacity:1;visibility:visible;}\n.tqmm-panel{position:absolute;left:0;right:0;top:100%;background:#fff;border-top:1px solid #E3E8EE;box-shadow:0 30px 60px rgba(12,31,25,.16);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease;z-index:610;pointer-events:none;}\n' +
    '.tqmm-item.tqmm-open .tqmm-panel,.tqmm-item:focus-within .tqmm-panel{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto;}\n' +
    '.tqmm-panel-in{max-width:none;margin:0;padding:26px clamp(24px,5vw,84px) 56px;}\n' +
    '.tqmm-head{display:flex;align-items:center;gap:18px;margin-bottom:26px;}\n' +
    '.tqmm-ico{width:46px;height:46px;border-radius:12px;background:#1EBABB;display:inline-flex;align-items:center;justify-content:center;color:#fff;flex:none;}\n' +
    '.tqmm-title{font-family:\'Playfair Display\',Georgia,serif;font-size:27px;font-weight:700;color:#173B33;line-height:1.15;}\n' +
    '.tqmm-desc{font-size:15px;color:#5B6B66;font-weight:500;margin-top:3px;}\n' +
    '.tqmm-grid{display:grid;gap:40px;width:100%;align-content:start;}\n' +
    '.tqmm-col+.tqmm-col{border-left:1px solid #E8ECF0;padding-left:34px;}\n' +
    '.tqmm-group+.tqmm-group{margin-top:32px;}\n' +
    '.tqmm-group h4{font-size:15px;font-weight:800;color:#173B33;margin:0 0 15px;}\n' +
    '.tqmm-group a{display:block;padding:8px 0;color:#4A5B55;text-decoration:none;font-size:14.5px;font-weight:500;line-height:1.45;white-space:normal;}\n' +
    '.tqmm-group a:hover{color:#1EBABB;text-decoration:underline;text-underline-offset:3px;}\n.tqmm-item.tqmm-open > .tqmm-top{color:#1EBABB !important;}\n' +
    '.tqmm-menu{position:absolute;left:0;top:100%;min-width:230px;background:#fff;border:1px solid #E3E8EE;border-radius:0 0 12px 12px;box-shadow:0 30px 60px rgba(12,31,25,.16);padding:12px 16px;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease;z-index:610;pointer-events:none;}\n' +
    '.tqmm-sm.tqmm-open .tqmm-menu,.tqmm-sm:focus-within .tqmm-menu{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto;}\n' +
    '.tqmm-menu a{display:block;padding:8px 4px;color:#31463F;text-decoration:none;font-size:14.5px;}\n' +
    '.tqmm-menu a:hover{color:#1EBABB;}\n' +
    '.tqmm-cta{background:#1EBABB;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;}\n' +
    '.tqmm-cta:hover{background:#159a9b;color:#fff;}\n' +
    '@media (max-width:980px){.tqmm-bar{display:none;}}\n' +
    '@media (min-width:981px){body[data-tqmm] section header, body[data-tqmm] div > header, body[data-tqmm] x-dc header{visibility:hidden !important;}body[data-tqmm] .tqmm-bar, body[data-tqmm] .tqmm-bar *{visibility:visible !important;}}\n@media (max-width:980px){.tqmm-bar{display:none;}}\n';

  var heart = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 14 2 2 4-4"/></svg>';
  var heartUnused = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>';
  var shield = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.5 12.5h5L10 9l2.5 6L15 11l1.5 1.5h4.5"/></svg>';
  var umb = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 6.2C15.8 5 14.6 4.3 13 4.3c-2.3 0-3.9 1.7-3.9 4.3V19"/><path d="M6.5 12h6.3"/><path d="M6.5 19h11"/></svg>';

  var bar = document.createElement('div');
  bar.className = 'tqmm-bar';
  bar.innerHTML = '<div class="tqmm-inner">' +
    '<a href="/" style="display:flex;align-items:center;"><span class="tqmm-logo-wrap"><img class="tqmm-logo-light" src="/assets/topquote-logo.png" alt="TopQuote"><img class="tqmm-logo-dark" src="/assets/topquote-logo-dark-masked.png" alt=""></span></a>' +
    '<nav class="tqmm-nav">' +
    '<div class="tqmm-item"><a class="tqmm-top" href="/life-insurance">Life insurance <span class="tqmm-caret">&#9662;</span></a>' + panel('Life Insurance', 'Provides your loved ones with a cash payout if you pass away during the policy term.', heart, LI, 5) + '</div>' +
    '<div class="tqmm-item"><a class="tqmm-top" href="/critical-illness">Critical illness <span class="tqmm-caret">&#9662;</span></a>' + panel('Critical Illness Cover', 'Pays a lump sum if you&rsquo;re diagnosed with one of the specific conditions listed by the insurer.', shield, CI, 4) + '</div>' +
    '<div class="tqmm-item"><a class="tqmm-top" href="/income-protection">Income protection <span class="tqmm-caret">&#9662;</span></a>' + panel('Income Protection', 'Pays a regular income if you can&rsquo;t work because of illness or injury.', umb, IP, 4) + '</div>' +
    '<div class="tqmm-item"><a class="tqmm-top" href="/about">About us</a></div>' +
    '<div class="tqmm-item"><a class="tqmm-top" href="/contact">Contact us</a></div>' +
    '</nav>' +
    '<div class="tqmm-right" style="display:flex;align-items:center;gap:14px;">' +
    '<a class="tqmm-top tqmm-phone" href="tel:01619743710" style="display:flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>0161 974 3710</a>' +
    '<a class="tqmm-cta" href="/get-a-quote">Get a quote</a>' +
    '</div>' +
    '</div>';

  function mount() {
    if (!document.body) return setTimeout(mount, 40);
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    document.body.setAttribute('data-tqmm', '1');
    document.body.insertBefore(bar, document.body.firstChild);
    var dim = document.createElement('div'); dim.className = 'tqmm-dim'; document.body.appendChild(dim);
    var openTimer = null, closeTimer = null, current = null;
    function openItem(it){ if (current === it) return; if (current) current.classList.remove('tqmm-open'); current = it; it.classList.add('tqmm-open'); bar.classList.add('tqmm-open'); dim.classList.add('on'); }
    function closeAll(){ if (current) current.classList.remove('tqmm-open'); current = null; bar.classList.remove('tqmm-open'); dim.classList.remove('on'); }
    bar.querySelectorAll('.tqmm-item').forEach(function(it){
      var hasPanel = it.querySelector('.tqmm-panel') || it.querySelector('.tqmm-menu');
      var top = it.querySelector('.tqmm-top');
      top.addEventListener('mouseenter', function(){
        clearTimeout(closeTimer);
        if (!hasPanel) { clearTimeout(openTimer); closeAll(); return; }
        clearTimeout(openTimer);
        openTimer = setTimeout(function(){ openItem(it); }, current ? 0 : 120);
      });
      top.addEventListener('mouseleave', function(){ clearTimeout(openTimer); });
      it.addEventListener('mouseleave', function(){
        clearTimeout(openTimer);
        closeTimer = setTimeout(closeAll, 140);
      });
      it.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); });
    });
    bar.addEventListener('mouseleave', function(){ clearTimeout(openTimer); closeTimer = setTimeout(closeAll, 120); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAll(); });
    document.addEventListener('click', function(e){ if (!bar.contains(e.target)) closeAll(); });
    if (STATIC_PAGE) { bar.style.position = 'absolute'; }
    else {
      var onScroll = function(){ if (LIGHT_PAGE || (window.scrollY||0) > 30) bar.classList.add('tqmm-scrolled'); else bar.classList.remove('tqmm-scrolled'); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
