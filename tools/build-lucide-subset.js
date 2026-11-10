// Builds vendor/lucide-subset-<version>.min.js: only the Lucide icons this site uses, instead of
// the full 485 KB library (~1,700 icons).
//
// The page code is unchanged: window.lucide.createIcons(), .icons and .createElement behave
// as before. If a page ever asks for an icon that is not in the subset, the full library
// (vendor/lucide-<version>.min.js) is loaded once and the icons are drawn from that, so a
// missing icon can never stay blank.
//
// usage:  node tools/build-lucide-subset.js <unpacked lucide npm package dir>
//   (npm pack lucide@<version> && tar -xzf lucide-<version>.tgz  gives ./package)
// Re-run after adding a new icon anywhere on the site.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PKG = path.resolve(process.argv[2] || 'package');
const version = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8')).version;

// every icon name the full library knows (icons and aliases)
const sandbox = { window: {}, self: {}, globalThis: {} };
vm.runInNewContext(fs.readFileSync(path.join(PKG, 'dist/umd/lucide.min.js'), 'utf8'), sandbox);
const full = sandbox.lucide || sandbox.window.lucide || sandbox.self.lucide || sandbox.globalThis.lucide;
if (!full || !full.icons) throw new Error('could not load the full lucide build');
const known = new Set(Object.keys(full.icons));
const pascal = s => s.replace(/^([A-Z])|[\s-_]+(\w)/g, (m, p1, p2) => (p2 ? p2.toUpperCase() : p1.toLowerCase()))
  .replace(/^./, c => c.toUpperCase());

// any quoted kebab-case word anywhere in the site's pages and scripts that is an icon name:
// covers data-lucide="clock" and icon names kept in page data (icon:'shield')
const SKIP = new Set(['vendor', 'node_modules', '.git', 'tools', 'blog-data', 'exports', 'uploads', '.github']);
const used = new Set();
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) scan(path.join(dir, e.name)); continue; }
    if (!/\.(html|js)$/.test(e.name)) continue;
    const s = fs.readFileSync(path.join(dir, e.name), 'utf8');
    for (const m of s.matchAll(/["'`]([a-z][a-z0-9]*(?:-[a-z0-9]+)*)["'`]/g)) {
      const p = pascal(m[1]);
      if (known.has(p)) used.add(p);
    }
  }
})(ROOT);
// TopQuote's own icon set (James, 10 Nov 2026): wherever the site asks for one of these Lucide
// names, the TopQuote icon is drawn instead. Lucide still draws anything not in the set yet
// (arrows, chevrons, close, share...). Bump TQ_SET when the sprite changes (the file name must
// change too, /vendor is cached for a year).
const TQ_SET = 1;
const SPRITE = path.join(ROOT, 'assets', 'icons', `topquote-icons-v${TQ_SET}.svg`);
const TQ_FOR = {   // Lucide name used on the site -> TopQuote symbol
  'phone': 'phone', 'phone-call': 'phone-call', 'headset': 'headset', 'mail': 'mail', 'map-pin': 'map-pin',
  'clock': 'clock', 'calendar': 'calendar', 'refresh-cw': 'refresh', 'shield': 'shield', 'shield-check': 'shield-check',
  'lock': 'lock', 'user-check': 'user-check', 'check': 'check', 'check-circle': 'check-circle', 'circle-check': 'check-circle',
  'user': 'user', 'users': 'couple', 'baby': 'baby', 'home': 'home', 'house': 'home', 'briefcase': 'briefcase',
  'heart': 'heart', 'heart-pulse': 'heart-pulse', 'heart-handshake': 'heart-handshake', 'hand-heart': 'hand-heart',
  'pound-sterling': 'pound', 'coins': 'coins', 'hand-coins': 'hand-coins', 'percent': 'percent', 'badge-percent': 'badge-percent',
  'credit-card': 'credit-card', 'trending-up': 'trending-up', 'trending-down': 'trending-down', 'bar-chart-2': 'bar-chart',
  'cigarette': 'cigarette', 'cross': 'medical-cross', 'activity': 'activity', 'file-check': 'file-check', 'file-check-2': 'file-check',
  'layers': 'layers', 'bell': 'bell', 'gift': 'gift', 'wrench': 'wrench', 'search': 'search', 'quote': 'quote', 'accessibility': 'accessibility',
};
const sprite = fs.readFileSync(SPRITE, 'utf8');
const symbols = {};
for (const m of sprite.matchAll(/<symbol id="tq-([a-z0-9-]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)) symbols[m[1]] = { vb: m[2], inner: m[3] };
const TQ = {};   // by Lucide PascalCase name
for (const [luc, tq] of Object.entries(TQ_FOR)) {
  if (!symbols[tq]) throw new Error('sprite has no tq-' + tq);
  TQ[pascal(luc)] = { name: luc, vb: symbols[tq].vb, inner: symbols[tq].inner.replace(/\s+/g, ' ') };
}
const names = [...used].filter((n) => !TQ[n]).sort();   // Lucide still needed for these

const out = path.join(ROOT, 'vendor');
const tmp = path.join(PKG, '..', 'subset-entry.mjs');
const esm = path.join(PKG, 'dist/esm/lucide.mjs').replace(/\\/g, '/');
fs.writeFileSync(tmp, `
import { createIcons as create, createElement as lucideElement, ${names.join(', ')} } from '${esm}';
const TQ = ${JSON.stringify(TQ)};
const subset = { ${names.join(', ')} };
for (const k in TQ) subset[k] = { __tq: k };   // TopQuote icons answer for these names
const NS = 'http://www.w3.org/2000/svg';
let tqN = 0;
// a TopQuote icon as an <svg>, carrying over the placeholder's class, style and other attributes;
// mask ids get a per-icon suffix so several copies on one page never clash
function tqSvg(key, attrs) {
  const d = TQ[key], n = ++tqN;
  const svg = document.createElementNS(NS, 'svg');
  const base = { xmlns: NS, width: '24', height: '24', viewBox: d.vb, fill: 'none', 'aria-hidden': 'true' };
  for (const a in base) svg.setAttribute(a, base[a]);
  for (const a in (attrs || {})) if (a !== 'data-lucide' && a !== 'class') svg.setAttribute(a, attrs[a]);
  svg.setAttribute('class', ['lucide', 'lucide-' + d.name, 'tq-icon', (attrs && attrs.class) || ''].join(' ').trim());
  svg.setAttribute('data-tq-icon', d.name);
  svg.innerHTML = d.inner.replace(/(id="|url\\(#)(tq-[a-z0-9-]+-cut)/g, function (m, a, b) { return a + b + '-' + n; });
  return svg;
}
function createElement(node, attrs) { return node && node.__tq ? tqSvg(node.__tq, attrs) : lucideElement(node, attrs); }
const toPascal = function (s) { return String(s).replace(/^([A-Z])|[\\s-_]+(\\w)/g, function (m, a, b) { return b ? b.toUpperCase() : a.toLowerCase(); }).replace(/^./, function (c) { return c.toUpperCase(); }); };
// replace each placeholder that has a TopQuote icon (the same way Lucide replaces its own)
function drawTQ(root, attr) {
  Array.prototype.forEach.call((root || document).querySelectorAll('[' + attr + ']'), function (el) {
    const key = toPascal(el.getAttribute(attr) || '');
    if (!TQ[key] || !el.parentNode) return;
    const attrs = {};
    for (let i = 0; i < el.attributes.length; i++) attrs[el.attributes[i].name] = el.attributes[i].value;
    el.parentNode.replaceChild(tqSvg(key, attrs), el);
  });
}
const FULL = '/vendor/lucide-${version}.min.js';
let full = null, loading = null;
function loadFull() {
  if (!loading) loading = new Promise(function (ok) {
    const s = document.createElement('script');
    s.src = FULL; s.async = true;
    s.onload = function () { full = window.lucide; window.lucide = api; ok(full); };
    s.onerror = function () { ok(null); };
    document.head.appendChild(s);
  });
  return loading;
}
// icons not in the subset: fetch the full library, then draw them with it
const icons = new Proxy(subset, {
  get(t, k) {
    if (typeof k !== 'string') return t[k];
    if (k in t) return t[k];
    if (full && full.icons[k]) return full.icons[k];
    if (/^[A-Z][A-Za-z0-9]*$/.test(k)) loadFull().then(redraw);
    return undefined;
  }
});
function missing(root, attr) {
  return Array.prototype.some.call((root || document).querySelectorAll('[' + attr + ']'), function (el) {
    const n = el.getAttribute(attr) || '';
    return !(n.replace(/^([A-Z])|[\\s-_]+(\\w)/g, function (m, a, b) { return b ? b.toUpperCase() : a.toLowerCase(); })
      .replace(/^./, function (c) { return c.toUpperCase(); }) in subset);
  });
}
let lastOpts;
function redraw() {
  try { if (lastOpts) drawTQ(lastOpts.root, lastOpts.nameAttr || 'data-lucide'); } catch (e) {}
  try { if (full && lastOpts) full.createIcons(Object.assign({}, lastOpts, { icons: full.icons })); } catch (e) {}
  try { if (window.__safeIcons) window.__safeIcons(); } catch (e) {}
}
function createIcons(opts) {
  opts = opts || {};
  lastOpts = opts;
  const attr = opts.nameAttr || 'data-lucide';
  drawTQ(opts.root, attr);   // TopQuote icons first; Lucide draws whatever is left
  const all = full ? full.icons : null;
  if (!all && missing(opts.root, attr)) loadFull().then(redraw);
  const o = Object.assign({}, opts, { icons: all || subset });
  // the subset draws what it has now; anything missing is drawn once the full library arrives
  const warn = console.warn; console.warn = function () {};
  try { return create(o); } finally { console.warn = warn; }
}
const api = { createIcons, createElement, icons, version: '${version}-subset-tq${TQ_SET}' };
window.lucide = api;
`);
const esbuild = process.env.ESBUILD || 'esbuild';
const file = `lucide-subset-${version}-tq${TQ_SET}.min.js`;
execFileSync(esbuild, [tmp, '--bundle', '--minify', '--format=iife', '--legal-comments=none',
  '--target=es2018', '--outfile=' + path.join(out, file)], { stdio: 'inherit', shell: process.platform === 'win32' });
fs.unlinkSync(tmp);
const banner = `/* Lucide v${version} (ISC licence, https://lucide.dev), subset of ${names.length} icons used on this site + ${Object.keys(TQ).length} TopQuote icons (assets/icons/topquote-icons-v${TQ_SET}.svg); built by tools/build-lucide-subset.js */\n`;
fs.writeFileSync(path.join(out, file), banner + fs.readFileSync(path.join(out, file), 'utf8'));
fs.copyFileSync(path.join(PKG, 'dist/umd/lucide.min.js'), path.join(out, `lucide-${version}.min.js`));
console.log(`${file}: ${Object.keys(TQ).length} TopQuote + ${names.length} Lucide icons, ${fs.statSync(path.join(out, file)).size} bytes`);
console.log(names.join(' '));
