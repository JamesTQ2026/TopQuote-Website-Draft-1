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
const names = [...used].sort();

const out = path.join(ROOT, 'vendor');
const tmp = path.join(PKG, '..', 'subset-entry.mjs');
const esm = path.join(PKG, 'dist/esm/lucide.mjs').replace(/\\/g, '/');
fs.writeFileSync(tmp, `
import { createIcons as create, createElement, ${names.join(', ')} } from '${esm}';
const subset = { ${names.join(', ')} };
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
  try { if (full && lastOpts) full.createIcons(Object.assign({}, lastOpts, { icons: full.icons })); } catch (e) {}
  try { if (window.__safeIcons) window.__safeIcons(); } catch (e) {}
}
function createIcons(opts) {
  opts = opts || {};
  lastOpts = opts;
  const attr = opts.nameAttr || 'data-lucide';
  const all = full ? full.icons : null;
  if (!all && missing(opts.root, attr)) loadFull().then(redraw);
  const o = Object.assign({}, opts, { icons: all || subset });
  // the subset draws what it has now; anything missing is drawn once the full library arrives
  const warn = console.warn; console.warn = function () {};
  try { return create(o); } finally { console.warn = warn; }
}
const api = { createIcons, createElement, icons, version: '${version}-subset' };
window.lucide = api;
`);
const esbuild = process.env.ESBUILD || 'esbuild';
const file = `lucide-subset-${version}.min.js`;
execFileSync(esbuild, [tmp, '--bundle', '--minify', '--format=iife', '--legal-comments=none',
  '--target=es2018', '--outfile=' + path.join(out, file)], { stdio: 'inherit', shell: process.platform === 'win32' });
fs.unlinkSync(tmp);
const banner = `/* Lucide v${version} (ISC licence, https://lucide.dev), subset of ${names.length} icons used on this site; built by tools/build-lucide-subset.js */\n`;
fs.writeFileSync(path.join(out, file), banner + fs.readFileSync(path.join(out, file), 'utf8'));
fs.copyFileSync(path.join(PKG, 'dist/umd/lucide.min.js'), path.join(out, `lucide-${version}.min.js`));
console.log(`${file}: ${names.length} icons, ${fs.statSync(path.join(out, file)).size} bytes`);
console.log(names.join(' '));
