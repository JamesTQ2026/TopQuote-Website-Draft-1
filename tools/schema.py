# -*- coding: utf-8 -*-
"""Write JSON-LD into every page's <head>.

Only facts the pages themselves state are used: the company number and address
from the footer, the phone, email and opening hours from Find Us, the social
links from the footer, each post's own byline, and each page's own visible
breadcrumb trail. No FCA firm reference number: 408285 belongs to Openwork, the
principal, not to Top Quote Limited, and an appointed-representative
relationship is not a parent/subsidiary one, so neither is asserted here.
"""
import io, os, re, glob, json, datetime
os.chdir(r"C:/Users/james.evans/Downloads/TopQuote-Website-Draft-1")

SITE = "https://www.top-quote.co.uk"
ORG = SITE + "/#organisation"
WEB = SITE + "/#website"
MARK = "<!-- structured data"
DRY = os.environ.get("DRY") == "1"

CRUMB_SEP = re.compile(r'&raquo;|\u00bb')
A_RE = re.compile(r'<a\s+href="([^"]+)"[^>]*>([^<]{1,60})</a>')
SPAN_RE = re.compile(r'<span[^>]*>([^<]{1,60})</span>')


def crumbs(s):
    i = s.find('>Home</a>')
    if i == -1:
        return None
    start = s.rfind('<', 0, s.rfind('<a', 0, i))
    j = -1
    for close in ('</nav>', '</div>'):
        j = s.find(close, i)
        if j != -1:
            break
    if j == -1:
        return None
    seg = s[start:j]
    if not CRUMB_SEP.search(seg):
        return None
    out = [{'name': t.strip(), 'url': h} for h, t in A_RE.findall(seg)]
    for t in SPAN_RE.findall(seg):
        t = t.strip()
        if t and not CRUMB_SEP.search(t):
            out.append({'name': t, 'url': None})
    return out if len(out) > 1 else None


def byline(s):
    m = re.search(r'<div style="font-weight:700;font-size:15px;color:#fff;">([^<]+)</div>'
                  r'<div style="font-size:13px;color:rgba\(255,255,255,\.85\);">([^<]+)</div>', s)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip().replace('&amp;', '&')


def one(s, pat):
    m = re.search(pat, s)
    return m.group(1) if m else None


def title_of(s):
    t = one(s, r'<title>([^<]*)</title>') or ''
    return re.sub(r'\s*\|\s*TopQuote\s*$', '', t).strip()


def unescape(t):
    for a, b in (('&amp;', '&'), ('&#39;', '\u2019'), ('&rsquo;', '\u2019'),
                 ('&quot;', '"'), ('&ndash;', '\u2013'), ('&nbsp;', ' ')):
        t = t.replace(a, b)
    return t


def org_node():
    return {
        "@type": ["FinancialService", "Organization"],
        "@id": ORG,
        "name": "TopQuote",
        "legalName": "Top Quote Limited",
        "url": SITE + "/",
        "logo": {"@type": "ImageObject", "url": SITE + "/assets/topquote-logo-dark.png"},
        "telephone": "+44 161 974 3710",
        "email": "hello@topquote.uk.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Alderley Park, Suite 3, Glasshouse, Congleton Road, Nether Alderley",
            "addressLocality": "Macclesfield",
            "addressRegion": "Cheshire",
            "postalCode": "SK10 4TG",
            "addressCountry": "GB"
        },
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:30",
            "closes": "17:00"
        }],
        "areaServed": {"@type": "Country", "name": "United Kingdom"},
        "identifier": {
            "@type": "PropertyValue",
            "name": "Companies House company number",
            "value": "04648763"
        },
        "sameAs": [
            "https://www.facebook.com/TopQuoteInsurance/",
            "https://uk.linkedin.com/company/topquoteuk",
            "https://www.instagram.com/topquoteuk/"
        ]
    }


def website_node():
    return {"@type": "WebSite", "@id": WEB, "url": SITE + "/", "name": "TopQuote",
            "inLanguage": "en-GB", "publisher": {"@id": ORG}}


def crumb_node(cs, page_url):
    items = []
    for n, c in enumerate(cs, 1):
        it = {"@type": "ListItem", "position": n, "name": unescape(c['name'])}
        if c['url']:
            it["item"] = SITE + c['url'] if c['url'].startswith('/') else c['url']
        items.append(it)
    return {"@type": "BreadcrumbList", "@id": page_url + "#breadcrumb", "itemListElement": items}


posts = {p['file']: p for p in json.load(io.open('exports/blog-index.json', encoding='utf-8'))}
pending = set()
for line in io.open('tools/pending-approval.txt', encoding='utf-8'):
    line = line.strip()
    if line and not line.startswith('#'):
        pending.add(line.split('#')[0].strip())


DATE_RE = re.compile(r'data-lucide="calendar"[^>]*></i>\s*([0-9]{1,2} [A-Z][a-z]+ [0-9]{4})')


def published(s, fallback_ms):
    """The date the post itself displays, so the markup cannot contradict the
    page. The index's epoch values are UK local midnight, which under UTC land
    on the previous day for 125 of the 227 posts, and one post's index date
    disagrees with its page outright."""
    m = DATE_RE.search(s)
    if m:
        return datetime.datetime.strptime(m.group(1).strip(), '%d %B %Y').strftime('%Y-%m-%d')
    return datetime.datetime.fromtimestamp(
        fallback_ms / 1000.0, datetime.timezone.utc).strftime('%Y-%m-%d')


report = {'article': 0, 'breadcrumb': 0, 'page_only': 0, 'pending': 0, 'skipped': []}
authors = {}

for fn in sorted(glob.glob('*.html')):
    if fn == 'Mega Menu Test.dc.html':
        report['skipped'].append(fn + ' (internal test page)')
        continue
    s = io.open(fn, encoding='utf-8', newline='').read()
    if MARK in s:
        report['skipped'].append(fn + ' (already carries it)')
        continue
    url = one(s, r'<link rel="canonical" href="([^"]+)"')
    if not url:
        report['skipped'].append(fn + ' (no canonical)')
        continue

    slug = url.rstrip('/').rsplit('/', 1)[-1]
    if fn.startswith('blog-') and slug.replace('blog-', '', 1) in pending:
        report['pending'] += 1
        continue

    graph = [org_node(), website_node()]

    cs = crumbs(s)
    if cs:
        graph.append(crumb_node(cs, url))
        report['breadcrumb'] += 1

    if fn.startswith('blog-') and fn in posts:
        who = byline(s)
        art = {
            "@type": "BlogPosting",
            "@id": url + "#article",
            "headline": unescape(title_of(s))[:110],
            "url": url,
            "datePublished": published(s, posts[fn]['t']),
            "inLanguage": "en-GB",
            "isPartOf": {"@id": WEB},
            "publisher": {"@id": ORG},
            "mainEntityOfPage": url
        }
        desc = one(s, r'<meta name="description" content="([^"]*)"')
        if desc and unescape(desc).strip().lower() != unescape(title_of(s)).strip().lower():
            art["description"] = unescape(desc)
        if who:
            art["author"] = {"@type": "Person", "name": who[0], "jobTitle": who[1],
                             "worksFor": {"@id": ORG}}
            authors[who[0]] = authors.get(who[0], 0) + 1
        graph.append(art)
        report['article'] += 1
    elif not cs:
        report['page_only'] += 1

    eol = "\r\n" if "\r\n" in s else "\n"
    note = (MARK + " -- generated; no FCA firm reference number is asserted, "
            "since 408285 is Openwork's, not Top Quote Limited's -->")
    block = (note + eol + '<script type="application/ld+json">' + eol +
             json.dumps({"@context": "https://schema.org", "@graph": graph},
                        indent=1, ensure_ascii=False) + eol + '</script>' + eol)
    assert s.count('</head>') == 1, fn
    if not DRY:
        io.open(fn, 'w', encoding='utf-8', newline='').write(s.replace('</head>', block + '</head>', 1))

print(("DRY RUN -- nothing written" + os.linesep) if DRY else "")
print("BlogPosting nodes : %d" % report['article'])
print("BreadcrumbList    : %d" % report['breadcrumb'])
print("org + website only: %d" % report['page_only'])
print("left alone, pending Openwork approval: %d" % report['pending'])
for k, v in sorted(authors.items(), key=lambda x: -x[1]):
    print("  author %-18s %d posts" % (k, v))
for x in report['skipped']:
    print("  skipped: " + x)
