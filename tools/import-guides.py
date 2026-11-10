"""Import the Openwork-approved guide pages (Claude Design export) into the demo site.

Faithful import: each page is the export's reference file (pages/<section>/<slug>.html) unchanged,
except for:
  - image paths  ../../assets/  ->  /assets/
  - <head>: site stylesheet, favicon, canonical, and noindex (demo site only)
  - the site header placed in the hero, in the slot the export left empty (where the
    original Claude Design page had its header)
  - the site footer and the site scripts (mobile menu, services menu, cookie banner/GA)

RULE 1 (James): never replace a page that already exists on the site. Rows whose page already
exists (see EXISTING) are skipped; the menu points at the existing page instead.

usage:  py -X utf8 -I tools/import-guides.py <export-dir> [slug ...]   (no slugs = all pages)
"""
import csv, io, os, re, sys

EXPORT = sys.argv[1]
ONLY = set(sys.argv[2:])
SITE = 'https://www.top-quote.co.uk'
# guide URL in the export -> page already on the site (Rule 1: keep ours, never replace)
EXISTING = {
    '/life-insurance/family-life-insurance': '/family-life-insurance',
    '/life-insurance/life-insurance-for-mums': '/life-insurance-for-mums',
    '/life-insurance/life-insurance-for-dads': '/life-insurance-for-dads',
    '/life-insurance/life-insurance-for-parents': '/life-insurance-for-parents',
    '/life-insurance/life-insurance-when-pregnant': '/life-insurance-when-pregnant',
    '/life-insurance/life-insurance-after-divorce': '/life-insurance-after-divorce',
}
GUIDE_OWN_ASSETS = ['topquote-logo-dark.png', 'platinum-trusted-service-award-2026.svg']
SOURCE_PAGE = 'Life Insurance for Dads.dc.html'   # header + footer are taken from a live page


def rd(p):
    return io.open(p, encoding='utf-8-sig', newline='').read()


src = rd(SOURCE_PAGE)
HEADER = re.search(r'<header style="position:relative;z-index:5;[\s\S]*?</header>', src).group(0)
FOOTER = re.search(r'<footer[\s\S]*?</footer>', src).group(0)
# the live page sits at the site root and uses relative paths; the guides live one folder down
def absolute(html):
    return re.sub(r'(\s(?:src|href)=")(?!https?:|/|#|mailto:|tel:)([^"]+)"', r'\1/\2"', html)
HEADER, FOOTER = absolute(HEADER), absolute(FOOTER)
SCRIPTS = ('<script src="/services-menu.js" defer></script>\n'
           '<script src="/mobile-nav.js" defer></script>\n'
           '<script src="/cookie-banner.js" defer></script>\n')


def build(row):
    path = row['URL path'].strip()
    ref = os.path.join(EXPORT, 'pages', path.strip('/') + '.html')
    s = rd(ref)
    s = s.replace('../../assets/', '/assets/')
    # two images exist on the site in a different version: the guides keep the export's own copy
    for name in GUIDE_OWN_ASSETS:
        s = s.replace('/assets/' + name, '/assets/guides/' + name)
    head_add = ('<link rel="stylesheet" href="/mobile-responsive.css">\n'
                '<link rel="icon" href="/favicon.ico" sizes="any">\n'
                '<link rel="canonical" href="%s%s">\n'
                '<meta name="robots" content="noindex, nofollow">\n' % (SITE, path))
    m = re.search(r'<meta name="viewport"[^>]*>\r?\n', s)
    s = s[:m.end()] + head_add + s[m.end():]
    # header goes where the export removed it: just before the hero's content column
    hero = s.index('<!-- HERO -->')
    slot = s.index('<div style="position:relative;z-index:4;', hero)
    ind = s[s.rfind('\n', 0, slot) + 1:slot]
    s = s[:slot] + HEADER + '\n' + ind + s[slot:]
    # footer after the page content, before the page's own trailing styles/scripts
    body = s.index('<body')
    ends = [i for i in (s.find('<style>html{scroll-behavior', body), s.find('<script', body)) if i > 0]
    end = min(ends) if ends else s.rindex('</body>')
    s = s[:end] + '\n  ' + FOOTER + '\n' + s[end:]
    s = s.replace('</body>', SCRIPTS + '</body>', 1)
    out = path.strip('/') + '.html'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    io.open(out, 'w', encoding='utf-8', newline='').write(s)
    return out


rows = list(csv.DictReader(io.open(os.path.join(EXPORT, 'pages.csv'), encoding='utf-8-sig')))
done, skipped = [], []
for r in rows:
    path = r['URL path'].strip()
    slug = path.rsplit('/', 1)[-1]
    if ONLY and slug not in ONLY:
        continue
    if path in EXISTING:
        skipped.append(path); continue
    done.append(build(r))
print('built %d page(s); skipped %d existing: %s' % (len(done), len(skipped), ', '.join(skipped) or '-'))
for d in done[:5]:
    print('  ', d)
