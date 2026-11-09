# -*- coding: utf-8 -*-
"""Visible 'Last updated' dates, kept in step with the sitemap.

  core pages  tools/page-dates.json -> "Last updated 9 November 2026" at the end
              of the page's breadcrumb row
  posts       blog-data/manifest.json 'updated' (else the publish date) -> a
              "Last updated ..." label in the post banner, next to the publish
              date (the publish-date label is hidden by CSS when the two match)

Re-running is safe: existing labels are replaced, not duplicated.
tools/build-url-layer.js reads the same two files for the sitemap <lastmod>,
and tools/schema.py for dateModified, so the three always agree.

Run from the repo root:  python -I tools/freshness.py
"""
import io, os, re, json, datetime

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def long_date(iso):
    d = datetime.date.fromisoformat(iso)
    return '%d %s %d' % (d.day, d.strftime('%B'), d.year)


def rd(f):
    return io.open(f, encoding='utf-8', newline='').read()


def wr(f, s):
    io.open(f, 'w', encoding='utf-8', newline='').write(s)


# clean URL -> file, from the same table the URL builder uses
js = rd('tools/build-url-layer.js')
pages_block = js[js.index('const PAGES'):js.index('};', js.index('const PAGES'))]
PAGES = dict(re.findall(r"'(/[a-z0-9-]*)':\s*'([^']+\.html)'", pages_block))
PAGES['/'] = 'Home Page.dc.html'

dates = {k: v for k, v in json.load(io.open('tools/page-dates.json', encoding='utf-8')).items() if not k.startswith('_')}

# ---- core pages: label at the end of the breadcrumb row -----------------------
UPD_RX = re.compile(r'<span class="tq-updated"[^>]*>[^<]*</span>')
core = 0
for path, iso in dates.items():
    f = PAGES.get(path)
    if not f or not os.path.exists(f):
        continue
    s = rd(f)
    label = ('<span class="tq-updated" style="margin-left:auto;color:#8A94A6;font-weight:600;">'
             'Last updated %s</span>' % long_date(iso))
    if UPD_RX.search(s):
        s = UPD_RX.sub(label, s, count=1)
    else:
        m = re.search(r'(<nav aria-label="Breadcrumb"[^>]*>[\s\S]*?)(</nav>)', s)
        if not m:
            continue           # no breadcrumb (home, quote form, policy pages carry their own date)
        s = s[:m.end(1)] + label + s[m.end(1):]
    wr(f, s)
    core += 1

# ---- posts: label in the banner ------------------------------------------------
manifest = json.load(io.open('blog-data/manifest.json', encoding='utf-8'))
CAL = re.compile(r'(<span [^>]*><i data-lucide="calendar"[^>]*></i>\s*([0-9]{1,2} [A-Z][a-z]+ [0-9]{4})</span>)'
                 r'(<span class="tq-post-updated"[^>]*>[\s\S]*?</span></span>)?')
posts = 0
for p in manifest:
    f = 'blog-%s.html' % p['slug']
    if not os.path.exists(f):
        continue
    s = rd(f)
    m = CAL.search(s)
    if not m:
        continue
    upd = p.get('updated') or p['date']
    same = ' data-same' if upd <= p['date'] else ''
    label = ('<span class="tq-post-updated"%s style="display:flex;align-items:center;gap:7px;font-size:14px;color:rgba(255,255,255,.92);">'
             '<span><i data-lucide="refresh-cw" style="width:15px;height:15px;color:#fff;"></i></span>'
             '<span>Last updated %s</span></span>' % (same, long_date(upd)))
    s = s[:m.end(1)] + label + s[m.end():]
    wr(f, s)
    posts += 1

print('freshness: %d core pages, %d posts' % (core, posts))
