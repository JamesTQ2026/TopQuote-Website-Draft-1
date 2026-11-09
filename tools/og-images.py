# -*- coding: utf-8 -*-
"""Per-page share images (og:image / twitter:image).

tools/og-images.json maps a page's clean URL to a source photo. Each is cropped
to 1200x630 (the size LinkedIn, Facebook and WhatsApp expect) into assets/og/,
and the page's og:image, og:image:alt and twitter:image tags are pointed at it.
Pages not listed keep assets/og-default.jpg.

Run from the repo root (needs Pillow):  python tools/og-images.py
"""
import io, os, re, json
from PIL import Image

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SITE = 'https://www.top-quote.co.uk'

js = io.open('tools/build-url-layer.js', encoding='utf-8').read()
blk = js[js.index('const PAGES'):js.index('};', js.index('const PAGES'))]
PAGES = dict(re.findall(r"'(/[a-z0-9-]*)':\s*'([^']+\.html)'", blk))
PAGES['/'] = 'Home Page.dc.html'

m = {k: v for k, v in json.load(io.open('tools/og-images.json', encoding='utf-8')).items() if not k.startswith('_')}
os.makedirs('assets/og', exist_ok=True)
done = 0
for path, src in m.items():
    f = PAGES.get(path)
    if not f or not os.path.exists(f) or not os.path.exists(src):
        print('skip', path, src)
        continue
    name = 'home' if path == '/' else path.strip('/')
    out = 'assets/og/%s.jpg' % name
    im = Image.open(src).convert('RGB')
    W, H = 1200, 630
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2
    y = max(0, min(im.height - H, int((im.height - H) * 0.35)))   # keep faces: crop a little above centre
    im.crop((x, y, x + W, y + H)).save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    s = io.open(f, encoding='utf-8', newline='').read()
    url = SITE + '/' + out
    s2 = re.sub(r'(<meta property="og:image" content=")[^"]*(">)', lambda mm: mm.group(1) + url + mm.group(2), s, count=1)
    s2 = re.sub(r'(<meta name="twitter:image" content=")[^"]*(">)', lambda mm: mm.group(1) + url + mm.group(2), s2, count=1)
    alt = re.search(r'<img[^>]*src="%s"[^>]*alt="([^"]*)"' % re.escape(src), s) or re.search(r'<img[^>]*alt="([^"]*)"[^>]*src="%s"' % re.escape(src), s)
    if alt and alt.group(1).strip():
        s2 = re.sub(r'(<meta property="og:image:alt" content=")[^"]*(">)', lambda mm: mm.group(1) + alt.group(1) + mm.group(2), s2, count=1)
        s2 = re.sub(r'(<meta name="twitter:image:alt" content=")[^"]*(">)', lambda mm: mm.group(1) + alt.group(1) + mm.group(2), s2, count=1)
    if s2 != s:
        io.open(f, 'w', encoding='utf-8', newline='').write(s2)
        done += 1
print('share images: %d pages' % done)
