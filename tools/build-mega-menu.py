"""Build mega-menu.js for the Openwork demo.

Design + behaviour: the August Openwork review site's mega-menu.js (JamesTQ2026/TopQuote-Openwork-Review-Site),
which is the menu in James's target screenshots. Menu content: the export's menu.json (labels, groups, column
order unchanged), plus the 'Existing customers' and 'More from TopQuote' groups placed as in the screenshots.
Links use the site's clean URLs; RULE 1: the 6 guides that already exist on the site link to the existing pages.

usage: py -X utf8 -I tools/build-mega-menu.py <august-mega-menu.js> <menu.json>
"""
import io, json, re, sys
from html import escape

src_js, menu_json = sys.argv[1], sys.argv[2]
js = io.open(src_js, encoding='utf-8').read()
menu = json.load(io.open(menu_json, encoding='utf-8'))

EXISTING = {
    '/life-insurance/family-life-insurance': '/family-life-insurance',
    '/life-insurance/life-insurance-for-mums': '/life-insurance-for-mums',
    '/life-insurance/life-insurance-for-dads': '/life-insurance-for-dads',
    '/life-insurance/life-insurance-for-parents': '/life-insurance-for-parents',
    '/life-insurance/life-insurance-when-pregnant': '/life-insurance-when-pregnant',
    '/life-insurance/life-insurance-after-divorce': '/life-insurance-after-divorce',
}
EXISTING_CUSTOMERS = [['Reconnect - Legal & General Life insurance Policy', '/reconnect'], ['Consumer Duty', '/consumer-duty']]
MORE = [['Kids Pass & Popcorn Pass', '/kids-pass'], ['Blog', '/blog'], ['Careers', '/careers'], ['Find Us', '/find-us']]
# where the two site groups sit in each panel (column index), as in James's screenshots
EXTRA = {
    'Life insurance': {1: [('More from TopQuote', MORE)], 4: [('Existing customers', EXISTING_CUSTOMERS)]},
    'Critical illness': {2: [('Existing customers', EXISTING_CUSTOMERS)], 3: [('More from TopQuote', MORE)]},
    'Income protection': {3: [('Existing customers', EXISTING_CUSTOMERS), ('More from TopQuote', MORE)]},
}


def js_str(s):
    return "'" + escape(s, quote=False).replace("\\", "\\\\").replace("'", "\\'") + "'"


def panel_data(name):
    cols = [[(g['heading'], [[l['label'], EXISTING.get(l['url'], l['url'])] for l in g['links']]) for g in col]
            for col in menu[name]['columns']]
    extra = EXTRA[name]
    for ci, groups in extra.items():
        while len(cols) <= ci:
            cols.append([])
        cols[ci].extend(groups)
    out = '[\n'
    for col in cols:
        parts = []
        for heading, links in col:
            parts.append(js_str(heading) + ', [\n' + ',\n'.join('      [%s, %s]' % (js_str(a), js_str(b)) for a, b in links) + '\n    ]')
        out += '    [' + ', '.join(parts) + '],\n'
    return out.rstrip(',\n') + '\n  ]', len(cols)


for var, name in (('LI', 'Life insurance'), ('CI', 'Critical illness'), ('IP', 'Income protection')):
    data, n = panel_data(name)
    m = re.search(r'  var %s = \[[\s\S]*?\n  \];\n' % var, js)
    assert m, var
    js = js[:m.start()] + '  var %s = %s;\n' % (var, data) + js[m.end():]

# page file names -> the site's clean URLs (for the bar's own links)
CLEAN = {'Home Page.dc.html': '/', 'Life Insurance.dc.html': '/life-insurance', 'Critical Illness.dc.html': '/critical-illness',
         'Income Protection.dc.html': '/income-protection', 'About Us.dc.html': '/about', 'Contact.dc.html': '/contact',
         'Get a Quote.dc.html': '/get-a-quote'}
for a, b in CLEAN.items():
    js = js.replace("'" + a + "'", "'" + b + "'").replace('"' + a + '"', '"' + b + '"')
js = js.replace('src="assets/', 'src="/assets/')
left = re.findall(r'[A-Za-z0-9 &;-]+\.dc\.html', js)
assert not left, 'unconverted links: %s' % sorted(set(left))
# page modes went by file name; the site uses clean URLs
js = js.replace("var STATIC_PAGE = /home page/i.test(decodeURIComponent(location.pathname.split('/').pop() || ''));",
                "var STATIC_PAGE = location.pathname === '/' || /home page/i.test(decodeURIComponent(location.pathname));")
js = js.replace("var LIGHT_PAGE = /get a quote/i.test(decodeURIComponent(location.pathname.split('/').pop() || ''));",
                "var LIGHT_PAGE = /^\\/get-a-quote|get a quote/i.test(decodeURIComponent(location.pathname));")
assert 'location.pathname ===' in js and 'get-a-quote|' in js
io.open('mega-menu.js', 'w', encoding='utf-8').write(js)
print('mega-menu.js written:', len(js), 'bytes')
