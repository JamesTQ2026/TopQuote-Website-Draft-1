# Saved widgets (not deployed)

This folder is listed in `.vercelignore`, so nothing here is published to
www.top-quote.co.uk. Move a widget into a page when it is ready to go live.

## insurers-widget.html (saved 2026-11-06)

"We work with some of the UK's leading insurers" with six logos: Aviva,
Legal & General, Royal London, LV=, Vitality, Guardian. Plain HTML/CSS, no
scripts or forms; Playfair Display + Mulish from Google Fonts (already on
the site).

Before it goes live:
- The logos are embedded as base64 (the file is ~625KB). Swap them for the
  site's existing files in assets/ (logo-aviva.webp, logo-lg.webp,
  logo-royal-london.webp, logo-lv.webp, logo-vitality.webp,
  logo-guardian.webp) so the page doesn't carry 600KB of inline images.
- The insurer logo carousel on the quote form is hidden pending insurer
  permission to use their logos; the same question applies here.
