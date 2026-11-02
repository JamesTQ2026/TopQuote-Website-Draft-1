# -*- coding: utf-8 -*-
"""Add Plausible to every page, and correct the wording that says we have none.

Plausible sets no cookies and reads nothing from the device, so PECR's consent
rule is not engaged the way it is for the Google map. What the rules do require
is that visitors are told and can object, so the Cookie Policy explains it and
carries a switch that sets plausible_ignore, the opt-out Plausible documents.

The banner currently states "We use no analytics, advertising or tracking
cookies". Adding analytics without changing that line would put the banner back
to promising something untrue, which is the fault this replaced.
"""
import io, os, glob

os.chdir(r"C:/Users/james.evans/Downloads/TopQuote-Website-Draft-1")

TAG = '<script defer data-domain="top-quote.co.uk" src="https://plausible.io/js/script.js"></script>'
DRY = os.environ.get("DRY") == "1"

# ---- 1. the script, beside the consent script that is already on every page
anchors = ['<script src="cookie-banner.js" defer></script>',
           '<script src="cookie-banner.js"></script>']
added, already, missed = 0, 0, []
for fn in sorted(glob.glob('*.html')):
    s = io.open(fn, encoding='utf-8', newline='').read()
    if 'plausible.io' in s:
        already += 1
        continue
    hit = next((a for a in anchors if s.count(a) == 1), None)
    if not hit:
        missed.append(fn)
        continue
    eol = "\r\n" if "\r\n" in s else "\n"
    if not DRY:
        io.open(fn, 'w', encoding='utf-8', newline='').write(
            s.replace(hit, hit + eol + TAG, 1))
    added += 1
print('pages given the Plausible tag: %d (already had it: %d)' % (added, already))
if missed:
    print('  no anchor, skipped: %s' % ', '.join(missed))

# ---- 2. the banner line, which currently denies having analytics
p = 'cookie-banner.js'
js = io.open(p, encoding='utf-8', newline='').read()
old_line = ("      'so it stays off unless you allow it. We use no analytics, advertising or tracking cookies. ' +")
new_line = ("      'so it stays off unless you allow it. We count page views with Plausible, which sets no ' +" "\n"
            "      'cookies and collects nothing personal, and you can switch it off in the policy. We use no ' +" "\n"
            "      'advertising or tracking cookies. ' +")
assert js.count(old_line) == 1, 'banner analytics line not found'
js = js.replace(old_line, new_line, 1)

old_note = """   There is no analytics, tag manager, advertising or social pixel anywhere on
   the site, so there is nothing else to ask about. If any is ever added, give
   it its own category here and gate it: do not let it ride along on the embed
   consent, which was not given for it."""
new_note = """   Plausible counts page views. It sets no cookies and reads nothing from the
   device, so it is not gated here; visitors are told about it in the banner and
   can switch it off from the Cookie Policy, which is what the rules ask for.
   There is no tag manager, advertising or social pixel anywhere on the site. If
   any is ever added, give it its own category here and gate it: do not let it
   ride along on the embed consent, which was not given for it."""
assert js.count(old_note) == 1, 'header note not found'
js = js.replace(old_note, new_note, 1)
if not DRY:
    io.open(p, 'w', encoding='utf-8', newline='').write(js)
print('cookie-banner.js: banner wording and header note corrected')

# ---- 3. the Cookie Policy: describe it, and give them the switch
p = 'Cookie Policy.html'
h = io.open(p, encoding='utf-8', newline='').read()
eol = "\r\n" if "\r\n" in h else "\n"
start = h.find('<h3>Analytics</h3>')
end = h.find('<h3>Advertising and social tracking</h3>')
assert start != -1 and end > start, 'analytics section not found'

section = eol.join([
 '<h3>Analytics</h3>',
 '<p>We count page views using <a href="https://plausible.io/privacy-focused-web-analytics" target="_blank" rel="noopener">Plausible</a>,'
 ' which tells us how many people read each page and which site they came from. It sets no cookies, stores nothing on your device,'
 ' and collects nothing that identifies you: no profile is built, and nothing follows you to other sites. The figures are counts, not people.</p>',
 '<p>Because nothing is stored on or read from your device, this does not need your consent. What the rules do require is that we tell you'
 ' and let you opt out, so:</p>',
 '<div id="an-opt" style="background:#F6F7FB;border:1px solid #E7EAF2;border-radius:12px;padding:18px 20px;margin:0 0 16px;">',
 '  <p style="margin:0 0 12px;"><strong>Counting page views:</strong> <span id="an-state">on</span></p>',
 '  <button id="an-btn" type="button" style="cursor:pointer;font-family:inherit;font-weight:700;font-size:15px;border:0;border-radius:999px;padding:11px 22px;background:#1EBABB;color:#0C1F19;">Turn it off</button>',
 '  <p style="margin:12px 0 0;font-size:14px;color:#6B7280;">Your choice is kept on this device only, in this browser.</p>',
 '</div>',
 '<script>',
 '(function () {',
 '  var KEY = "plausible_ignore";   // the opt-out Plausible itself reads',
 '  var state = document.getElementById("an-state");',
 '  var btn = document.getElementById("an-btn");',
 '  function read() { try { return localStorage.getItem(KEY) === "true"; } catch (e) { return false; } }',
 '  function paint() {',
 '    var off = read();',
 '    state.textContent = off ? "off" : "on";',
 '    btn.textContent = off ? "Turn it back on" : "Turn it off";',
 '  }',
 '  btn.addEventListener("click", function () {',
 '    try { read() ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, "true"); } catch (e) {}',
 '    paint();',
 '  });',
 '  paint();',
 '})();',
 '</script>',
 '',
 '',
])
h = h[:start] + section + h[end:]
if not DRY:
    io.open(p, 'w', encoding='utf-8', newline='').write(h)
print('Cookie Policy.html: analytics section rewritten with a working opt-out')

# the short version at the top also says we run none
old_short = 'We run no analytics, no advertising and no tracking of any kind.'
new_short = ('We count page views with Plausible, which sets no cookies and collects nothing personal, '
             'and you can switch that off below. We run no advertising and no tracking of any kind.')
h2 = io.open(p, encoding='utf-8', newline='').read() if not DRY else h
assert h2.count(old_short) == 1, 'summary line not found'
h2 = h2.replace(old_short, new_short, 1)
if not DRY:
    io.open(p, 'w', encoding='utf-8', newline='').write(h2)
print('Cookie Policy.html: summary line corrected')
