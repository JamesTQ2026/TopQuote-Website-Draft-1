// Generates vercel.json, sitemap.xml and robots.txt for the TopQuote static site.
// Run from the repo root:  node tools/build-url-layer.js   (idempotent, re-run after every re-export)
//
// Why: the Claude Design export names pages "About Us.dc.html" etc, but Google has the old
// WordPress URLs indexed (/about/, /life-insurance/, /blog/<category>/<slug>/). This script
// makes every page answer on its clean URL and 301s the old URLs that moved.
//
// "/" is rewritten to Home Page.dc.html, and /Home Page.dc.html is 301'd to "/" so the homepage
// has one address. That redirect would LOOP if index.html (the export's JS bounce page to
// "Home Page.dc.html") were present, because "/" would then serve index.html instead of the
// rewrite. So this script refuses to run while index.html exists: delete it after each re-export.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://www.top-quote.co.uk';

if (fs.existsSync(path.join(ROOT, 'index.html'))) {
  throw new Error('index.html exists (the Claude Design bounce page). With the /Home Page.dc.html -> / redirect ' +
    'it would make the homepage loop forever. Delete it first:  git rm index.html');
}

// clean URL  ->  file in the repo root
const PAGES = {
  '/about': 'About Us.dc.html',
  '/blog': 'Blog.dc.html',
  '/careers': 'Careers.dc.html',
  '/consumer-duty': 'Consumer Duty.dc.html',
  '/contact': 'Contact.dc.html',
  '/contact-altrincham': 'Contact Altrincham.dc.html',
  '/contact-cheshire-east': 'Contact Cheshire East.dc.html',
  '/contact-knutsford': 'Contact Knutsford.dc.html',
  '/contact-macclesfield': 'Contact Macclesfield.dc.html',
  '/contact-manchester': 'Contact Manchester.dc.html',
  '/contact-salford': 'Contact Salford.dc.html',
  '/contact-stockport': 'Contact Stockport.dc.html',
  '/contact-wilmslow': 'Contact Wilmslow.dc.html',
  '/critical-illness': 'Critical Illness.dc.html',
  '/family-life-insurance': 'Family Life Insurance.dc.html',
  '/find-us': 'Find Us.dc.html',
  '/get-a-quote': 'Get a Quote.dc.html',
  '/income-protection': 'Income Protection.dc.html',
  '/life-insurance': 'Life Insurance.dc.html',
  '/life-insurance-after-divorce': 'Life Insurance After Divorce.dc.html',
  '/life-insurance-when-pregnant': 'Life Insurance When Pregnant.dc.html',
  '/life-insurance-for-dads': 'Life Insurance for Dads.dc.html',
  '/life-insurance-for-mums': 'Life Insurance for Mums.dc.html',
  '/life-insurance-for-parents': 'Life Insurance for Parents.dc.html',
  '/reconnect': 'Reconnect.dc.html',
  '/accessibility-statement': 'Accessibility Statement.html',
  '/complaints': 'Complaints.html',
  '/cookie-policy': 'Cookie Policy.html',
  '/privacy-notice': 'Privacy Notice.html',
  '/terms-of-use': 'Terms of Use.html',
  '/kids-pass': 'kids-pass.html',
};

// old WordPress URL -> clean URL, for pages whose slug changed or no longer exist
const MOVED = {
  '/home': '/',
  '/home-page': '/',
  '/home-2': '/',
  '/about-us': '/about',
  '/contact-us': '/contact',
  '/locational-page': '/find-us',
  '/topquote-privacy-policy': '/privacy-notice',
  '/privacy-policy': '/privacy-notice',
  '/life-insurance-parents': '/life-insurance-for-parents',
  '/life-insurance-mums': '/life-insurance-for-mums',
  '/life-insurance-dads': '/life-insurance-for-dads',
  '/life-insurance-pregnant': '/life-insurance-when-pregnant',
  '/life-insurance-divorce': '/life-insurance-after-divorce',
  '/heart-attack-critical-illness-cover': '/critical-illness',
  '/life-insurance-medical-conditions': '/life-insurance',
  '/over-50s-life-insurance': '/life-insurance',
  '/relevant-life-insurance': '/life-insurance',
  '/update-your-details': '/reconnect',
  '/home-insurance': '/',
  '/kids-pass-terms-and-conditions': '/kids-pass',
  '/referral-form': '/contact',
};

// Older-generation URLs Google may still know (found via the Internet Archive, 25 Sep 2026).
// 2016 WordPress put posts at the root or under /charity/ and /donations/, and the
// 2009-2014 site used .html pages. Specific entries first; the :path* catch-alls last.
// Deliberately NOT redirected (a 404 is correct): /test, /esigndocuments,
// /forwardable-message-page, /get-a-quote-claude-test-test (test/utility pages).
const LEGACY = {
  // 2016 posts that still exist
  '/a-life-of-worry-2': '/blog-a-life-of-worry',
  '/acceptance': '/blog-acceptance',
  '/anger': '/blog-anger',
  '/bargaining-stage-of-grief': '/blog-bargaining-stage-of-grief',
  '/denial': '/blog-denial',
  '/depression': '/blog-depression',
  '/do-you-think-you-overthink': '/blog-do-you-think-you-overthink',
  '/expecting-expectations': '/blog-expecting-expectations',
  '/family-always-comes-first': '/blog-family-always-comes-first',
  '/holidays-are-coming': '/blog-holidays-are-coming',
  '/janes-experience-unexpected-death': '/blog-janes-experience-unexpected-death',
  '/mindfulness-mumbo-jumbo': '/blog-mindfulness-mumbo-jumbo',
  '/self-esteem': '/blog-self-esteem',
  '/six-weeks-of-sun-sea-sand-or-stress': '/blog-six-weeks-of-sun-sea-sand-or-stress',
  '/stress': '/blog-stress',
  '/this-doesnt-happen-to-me': '/blog-this-doesnt-happen-to-me',
  '/charity/2015-christmas-toy-drop': '/blog-2015-christmas-toy-drop',
  '/charity/charity-update': '/blog-charity-update',
  '/charity/charity-video': '/blog-charity-video',
  '/charity/easter-2016': '/blog-easter-2016',
  '/charity/francis-house-childrens-hospice': '/blog-francis-house-childrens-hospice',
  '/charity/marathon-des-sables-2012': '/blog-marathon-des-sables-2012',
  '/charity/toy-drop': '/blog-toy-drop',
  '/charity/wood-street-mission': '/blog-wood-street-mission',
  '/donations/francis-house-childrens-hospice': '/blog-francis-house-childrens-hospice',
  '/donations/francis-house-childrens-hospice-2': '/blog-francis-house-childrens-hospice',
  '/donations/wood-st-mission': '/blog-wood-street-mission',
  '/to-blog-or-not-to-blog-that-is-the-question': '/blog',
  // older site sections / pages -> nearest current page
  '/news': '/blog',
  '/charity': '/blog',
  '/awards': '/about',
  '/life-assurance': '/life-insurance',
  '/services/life-assurance': '/life-insurance',
  '/services/critical-illness': '/critical-illness',
  '/services/income-insurance': '/income-protection',
  '/services/home-insurance': '/',
  '/terms-and-conditions': '/terms-of-use',
  '/terms-conditions': '/terms-of-use',
  '/wp/cookie-policy': '/cookie-policy',
  '/sitemap': '/',
  '/useful-links': '/',
  '/skyman': '/',
  '/enquiry/1': '/contact',
  '/enquiry/5': '/contact',
  '/Referral-scheme/1.html': '/contact',
  // 2009-2011 .html site
  '/index.html': '/',
  '/home.html': '/',
  '/building.html': '/',
  '/notice.html': '/',
  '/products.html': '/',
  '/careers.html': '/careers',
  '/contact.html': '/contact',
  '/quote.html': '/get-a-quote',
  '/life.html': '/life-insurance',
  '/lifeAssurance.html': '/life-insurance',
  '/level.html': '/life-insurance',
  '/decreasing.html': '/life-insurance',
  '/decreasingFaq.html': '/life-insurance',
  '/decreasingMore.html': '/life-insurance',
  '/mortgage.html': '/life-insurance',
  // catch-alls for the rest of those old sections (must stay last)
  '/award/:path*': '/about',
  '/charity/:path*': '/blog',
  '/donations/:path*': '/blog',
};

const enc = (f) => '/' + encodeURIComponent(f).replace(/%2F/g, '/');

for (const f of Object.values(PAGES)) {
  if (!fs.existsSync(path.join(ROOT, f))) throw new Error('Missing page file: ' + f);
}

const blogSlugs = fs.readdirSync(ROOT)
  .filter((f) => /^blog-.+\.html$/.test(f))
  .map((f) => f.replace(/^blog-/, '').replace(/\.html$/, ''))
  .sort();

// posts awaiting Openwork approval (tools/pending-approval.txt): kept off the live site
const pending = new Set(
  (fs.existsSync(path.join(__dirname, 'pending-approval.txt')) ? fs.readFileSync(path.join(__dirname, 'pending-approval.txt'), 'utf8') : '')
    .split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean));
for (const s of pending) if (!blogSlugs.includes(s)) throw new Error('pending-approval.txt lists a post that does not exist: ' + s);
const liveSlugs = blogSlugs.filter((s) => !pending.has(s));

const redirects = [];
const rewrites = [];
const r301 = (source, destination) => redirects.push({ source, destination, statusCode: 301 });

// 0. unapproved posts: temporary redirect to the blog index (302, so they can go live later)
for (const slug of pending) {
  for (const src of [`/blog-${slug}`, `/blog-${slug}.html`, `/blog/:cat/${slug}`, `/blog/${slug}`]) {
    redirects.push({ source: src, destination: '/blog', statusCode: 302 });
  }
}

// 1. old WP pages that moved, then older-generation URLs
for (const [from, to] of Object.entries(MOVED)) r301(from, to);
for (const [from, to] of Object.entries(LEGACY)) {
  const post = to.match(/^\/blog-(.+)$/);
  if (post && !liveSlugs.includes(post[1])) throw new Error(`LEGACY ${from} points at a missing or unapproved post: ${to}`);
  r301(from, to);
}

// 2. export filenames -> clean URL, so internal links ("About Us.dc.html") land on /about.
//    Both the raw and the %20 form are listed because the match is done on the request path.
for (const [clean, file] of Object.entries(PAGES).concat([['/', 'Home Page.dc.html']])) {
  r301(enc(file), clean);
  if (file.includes(' ')) r301('/' + file, clean);
}
r301('/(blog-[^/.]+)\\.html', '/$1');

// 3. old blog posts: /blog/<category>/<slug>/ (and /blog/<slug>/) -> /blog-<slug>
for (const slug of liveSlugs) {
  r301(`/blog/:cat/${slug}`, `/blog-${slug}`);
  r301(`/blog/${slug}`, `/blog-${slug}`);
}
// anything else under /blog/ (categories, pagination, date archives, retired posts) -> blog index
r301('/blog/:path+', '/blog');

// rewrites: clean URL -> actual file
rewrites.push({ source: '/', destination: '/Home%20Page.dc.html' });
for (const [clean, file] of Object.entries(PAGES)) rewrites.push({ source: clean, destination: enc(file) });
rewrites.push({ source: '/(blog-[^/.]+)', destination: '/$1.html' });

if (redirects.length > 1000) throw new Error('Too many redirects for Vercel (limit 1024): ' + redirects.length);

const vercel = { trailingSlash: false, redirects, rewrites };
fs.writeFileSync(path.join(ROOT, 'vercel.json'), JSON.stringify(vercel, null, 1) + '\n');

// Legal pages still marked "Draft, pending legal & compliance review": kept noindex and out of
// the sitemap. Once a page's wording is signed off (draft notice + date placeholder removed),
// delete it from this list and re-run the script.
const DRAFT_PAGES = ['/complaints', '/cookie-policy', '/privacy-notice', '/terms-of-use', '/accessibility-statement'];
const NOINDEX = '<meta name="robots" content="noindex">';
for (const clean of Object.keys(PAGES)) {
  const fp = path.join(ROOT, PAGES[clean]);
  let html = fs.readFileSync(fp, 'utf8');
  const has = html.includes(NOINDEX);
  if (DRAFT_PAGES.includes(clean) && !has) html = html.replace(/<head>/i, '<head>\n' + NOINDEX);
  else if (!DRAFT_PAGES.includes(clean) && has) html = html.replace(NOINDEX + '\n', '').replace(NOINDEX, '');
  else continue;
  fs.writeFileSync(fp, html);
}

// sitemap
let manifest = [];
try { manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog-data', 'manifest.json'), 'utf8')); } catch (e) {}
const dateBySlug = Object.fromEntries(manifest.map((p) => [p.slug, p.date]));
const urls = [{ loc: '/', pri: '1.0' }]
  .concat(Object.keys(PAGES).filter((p) => !DRAFT_PAGES.includes(p)).map((p) => ({ loc: p, pri: '0.8' })))
  .concat(liveSlugs.map((s) => ({ loc: '/blog-' + s, pri: '0.5', lastmod: dateBySlug[s] })));
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `<url><loc>${ORIGIN}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);

fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /Mega%20Menu%20Test.dc.html\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

// canonical tags: tell Google the clean URL is the official one for each file
let tagged = 0;
const canon = Object.entries(PAGES).map(([clean, file]) => [file, clean])
  .concat([['Home Page.dc.html', '/']])
  .concat(blogSlugs.map((s) => [`blog-${s}.html`, '/blog-' + s]));
for (const [file, clean] of canon) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (/<link[^>]+rel=["']canonical["']/i.test(html) || !/<\/head>/i.test(html)) continue;
  html = html.replace(/<\/head>/i, `<link rel="canonical" href="${ORIGIN}${clean}">
</head>`);
  fs.writeFileSync(fp, html);
  tagged++;
}

// "All articles" list on the blog index: plain <a> links to every approved post, so each one is
// reachable by a crawlable link (the paged grid above it is JavaScript-only). Pending posts never appear.
{
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? `${+m[3]} ${MON[+m[2] - 1]} ${m[1]}` : ''; };
  const bySlug = Object.fromEntries(manifest.map((p) => [p.slug, p]));
  const posts = liveSlugs.map((s) => ({ slug: s, title: (bySlug[s] && bySlug[s].title) || s, date: (bySlug[s] && bySlug[s].date) || '' }))
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  const items = posts.map((p) =>
    `        <li style="break-inside:avoid;padding:9px 0;border-bottom:1px solid #E7EAF2;"><a href="/blog-${p.slug}" style="color:#173B33;font-weight:600;font-size:15px;line-height:1.45;text-decoration:none;">${esc(p.title)}</a>` +
    (p.date ? `<span style="display:block;color:#8A94A6;font-size:12.5px;margin-top:2px;">${fmt(p.date)}</span>` : '') + `</li>`).join('\n');
  const block = `<!-- ALL-POSTS:START (generated by tools/build-url-layer.js, do not edit by hand) -->
  <section id="all-articles" style="background:#fff;padding:70px clamp(24px,5vw,40px) 80px;">
    <div style="max-width:1320px;margin:0 auto;">
      <h2 class="arva-h" style="font-size:clamp(24px,2.6vw,34px);font-weight:700;color:#173B33;margin-bottom:8px;">All articles</h2>
      <p style="color:#7A867F;font-size:15px;margin-bottom:22px;">Every guide and article from the TopQuote team, newest first.</p>
      <details>
        <summary style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;background:#1EBABB;color:#fff;font-weight:700;font-size:15px;padding:13px 24px;border-radius:8px;list-style:none;">Browse all ${posts.length} articles</summary>
        <ul style="list-style:none;margin:26px 0 0;padding:0;columns:3 300px;column-gap:44px;">
${items}
        </ul>
      </details>
    </div>
  </section>
  <!-- ALL-POSTS:END -->`;
  const bf = path.join(ROOT, 'Blog.dc.html');
  const bh = fs.readFileSync(bf, 'utf8');
  const re = /<!-- ALL-POSTS:START[\s\S]*?<!-- ALL-POSTS:END -->/;
  if (!re.test(bh)) throw new Error('Blog.dc.html is missing the ALL-POSTS markers (re-add them under the article grid after a re-export)');
  fs.writeFileSync(bf, bh.replace(re, () => block));
  console.log(`blog index: ${posts.length} approved posts listed as plain links`);
}

console.log(`canonical tags added: ${tagged}`);
console.log(`vercel.json: ${redirects.length} redirects, ${rewrites.length} rewrites | sitemap: ${urls.length} urls | pending approval (hidden): ${pending.size}`);
