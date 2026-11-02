# -*- coding: utf-8 -*-
"""Publish posts that Openwork has approved, in one step.

Approving a post touches five things, and doing three of them and forgetting
the other two leaves a page that is live but invisible, or indexed but with no
share card. So they go together:

  1. the slug comes out of tools/pending-approval.txt
  2. build-url-layer.js      the 302 to /blog becomes 301s from its old URLs,
                             the sitemap gains it, the all-articles list gains it
  3. schema.py               BlogPosting JSON-LD with its date and byline
  4. og-tags.py              Open Graph and Twitter card tags
  5. the report below        confirms all four actually landed

Usage, from the repo root:

    python -I tools/approve.py <slug> [<slug> ...]
    python -I tools/approve.py --list          # what is still waiting
    python -I tools/approve.py --check         # verify what is already live

The slug is the bit after "blog-", as written in pending-approval.txt.
Commit and push afterwards; nothing here touches git.
"""
import io, os, re, sys, json, glob, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)
PENDING = 'tools/pending-approval.txt'


def pending_slugs():
    out = []
    for line in io.open(PENDING, encoding='utf-8'):
        t = line.strip()
        if t and not t.startswith('#'):
            out.append(t.split('#')[0].strip())
    return out


def report(slugs):
    """What each artefact says about these posts right now."""
    sm = io.open('sitemap.xml', encoding='utf-8').read()
    vercel = json.load(io.open('vercel.json', encoding='utf-8'))
    blog = io.open('Blog.dc.html', encoding='utf-8', newline='').read()
    to_index = set(e['source'] for e in vercel['redirects'] if e['destination'] == '/blog')
    rows = []
    for s in slugs:
        f = 'blog-%s.html' % s
        h = io.open(f, encoding='utf-8', newline='').read() if os.path.exists(f) else ''
        rows.append((s, {
            'page exists': bool(h),
            'sitemap': ('/blog-' + s + '<') in sm,
            'JSON-LD': 'application/ld+json' in h,
            'share tags': 'og:title' in h,
            'listed': ('href="/blog-%s"' % s) in blog,
            'still 302s to /blog': ('/blog-' + s) in to_index,
        }))
    return rows


def show(rows, title):
    print('\n%s' % title)
    cols = ['page exists', 'sitemap', 'JSON-LD', 'share tags', 'listed', 'still 302s to /blog']
    print('  %-46s %s' % ('slug', '  '.join(c[:11] for c in cols)))
    for slug, r in rows:
        print('  %-46s %s' % (slug[:46], '  '.join(
            ('yes' if r[c] else 'NO ').ljust(11) for c in cols)))


def run(cmd, label):
    print('\n> %s' % ' '.join(cmd))
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = (p.stdout or '').strip()
    if out:
        print('\n'.join('    ' + l for l in out.splitlines()))
    if p.returncode != 0:
        print('    FAILED (%s): %s' % (label, (p.stderr or '').strip()[:400]))
        sys.exit(1)


def main():
    args = [a for a in sys.argv[1:]]
    waiting = pending_slugs()

    if not args or args[0] == '--list':
        print('%d posts awaiting approval:' % len(waiting))
        for s in waiting:
            print('  %s' % s)
        print('\nTo publish:  python -I tools/approve.py <slug> [<slug> ...]')
        return

    if args[0] == '--check':
        live = [f[len('blog-'):-len('.html')] for f in sorted(glob.glob('blog-*.html'))]
        live = [s for s in live if s not in waiting]
        bad = [(s, r) for s, r in report(live)
               if not (r['sitemap'] and r['JSON-LD'] and r['share tags'] and r['listed'])
               or r['still 302s to /blog']]
        if bad:
            show(bad, '%d published posts are missing something:' % len(bad))
            sys.exit(1)
        print('all %d published posts have their redirect, sitemap entry, JSON-LD, '
              'share tags and listing' % len(live))
        return

    unknown = [s for s in args if s not in waiting]
    if unknown:
        print('not in %s:' % PENDING)
        for s in unknown:
            print('  %s' % s)
        print('\nRun --list to see what is waiting. Nothing changed.')
        sys.exit(1)

    show(report(args), 'before:')

    # 1. out of the pending list
    lines = io.open(PENDING, encoding='utf-8', newline='').readlines()
    keep = [l for l in lines
            if not (l.strip() and not l.strip().startswith('#')
                    and l.split('#')[0].strip() in args)]
    io.open(PENDING, 'w', encoding='utf-8', newline='').write(''.join(keep))
    print('\n%d slug(s) removed from %s' % (len(lines) - len(keep), PENDING))

    # 2-4. the generators, in the order their outputs depend on each other
    run(['node', 'tools/build-url-layer.js'], 'url layer')
    run([sys.executable, '-I', 'tools/schema.py'], 'structured data')
    run([sys.executable, '-I', 'tools/og-tags.py'], 'share tags')

    rows = report(args)
    show(rows, 'after:')
    ok = all(r['page exists'] and r['sitemap'] and r['JSON-LD'] and r['share tags']
             and r['listed'] and not r['still 302s to /blog'] for _, r in rows)
    print('\n%s' % ('all five in place; commit and push.' if ok else
                    'SOMETHING IS MISSING above. Do not push until it is sorted.'))
    if not ok:
        sys.exit(1)


main()
