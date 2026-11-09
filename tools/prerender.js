// Write the page framework's static lists into the HTML itself.
//
// The .dc.html pages draw their reviews, FAQs, article lists, providers, areas, steps
// and stats from <sc-for list="{{ ... }}"> templates filled in by support.js after the
// page loads. Crawlers that read the raw HTML saw "{{ r.quote }}" instead of content.
// This runs each page's own renderVals() in a sandbox and replaces every template whose
// data is static with the HTML the framework would have drawn. Interactive templates
// (the blog's filter chips, page numbers and paged article grid) are left alone: they
// are rebuilt on every click, and the blog page already carries a plain list of every
// article for crawlers.
//
// Run from the repo root:  node tools/prerender.js        (DRY=1 to preview)
// After this, a page's static lists live in its HTML; renderVals() keeps the data the
// framework still needs, but editing a review or FAQ means editing the HTML.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DRY = process.env.DRY === '1';
const LEAVE = new Set(['filterChips', 'pages', 'pagedArticles']);   // interactive

const decode = (s) => String(s)
  .replace(/&nbsp;/g, '\u00a0').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&middot;/g, '\u00b7')
  .replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018').replace(/&ldquo;/g, '\u201c')
  .replace(/&rdquo;/g, '\u201d').replace(/&hellip;/g, '\u2026').replace(/&amp;/g, '&');
const esc = (s) => decode(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function stub() {
  const f = function () { return p; };
  const p = new Proxy(f, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : p), apply: () => p, construct: () => p, set: () => true });
  return p;
}

function valsOf(html, file) {
  const at = html.indexOf('class Component extends DCLogic');
  if (at < 0) return null;
  const sOpen = html.lastIndexOf('<script', at);
  const sBody = html.indexOf('>', sOpen) + 1;
  const sEnd = html.indexOf('</script>', at);
  const m = [null, html.slice(sBody, sEnd)];
  const sandbox = { window: stub(), document: stub(), navigator: stub(), localStorage: stub(), console,
    setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, clearInterval: () => 0,
    requestAnimationFrame: () => 0, IntersectionObserver: stub(), ResizeObserver: stub(), Swiper: stub(), lucide: stub(), Math, JSON, Date, Object, Array, String, Number };
  vm.createContext(sandbox);
  const code = 'class DCLogic { constructor(p){ this.props = p || {}; this.state = {}; } setState(o){ Object.assign(this.state, o || {}); } forceUpdate(){} }\n'
    + m[1].replace(/export\s+default\s+/g, '') + '\n;(function(){ const c = new Component({}); return c.renderVals ? c.renderVals() : null; })()';
  try {
    return vm.runInContext(code, sandbox, { timeout: 2000, filename: file });
  } catch (e) {
    console.log('  ! ' + file + ': renderVals failed (' + e.message.split('\n')[0] + ')');
    return null;
  }
}

function lookup(expr, scope) {
  let v = scope;
  for (const k of expr.trim().split('.')) {
    if (v == null || !(k in Object(v))) return undefined;
    v = v[k];
  }
  return v;
}

// find "<tag ...>" ... matching "</tag>" from index i, honouring nesting
function matchBlock(s, tag, i) {
  const open = new RegExp('<' + tag + '\\b[^>]*>|</' + tag + '>', 'g');
  open.lastIndex = i;
  let depth = 0, m, start = -1, headEnd = -1;
  while ((m = open.exec(s))) {
    if (m[0][1] !== '/') { if (depth === 0) { start = m.index; headEnd = open.lastIndex; } depth++; }
    else { depth--; if (depth === 0) return { start, headEnd, end: m.index, close: open.lastIndex }; }
  }
  return null;
}

let unresolved = 0;
// expand templates in `tpl` against `scope`; returns [html, leftAlone]
function expand(tpl, scope) {
  let out = '', i = 0;
  const rx = /<sc-(for|if)\b([^>]*)>/g;
  let m;
  while ((m = rx.exec(tpl))) {
    if (m.index < i) continue;
    const kind = m[1], attrs = m[2];
    const blk = matchBlock(tpl, 'sc-' + kind, m.index);
    if (!blk) break;
    const inner = tpl.slice(blk.headEnd, blk.end);
    if (kind === 'for') {
      const list = (attrs.match(/list="\{\{\s*([^}]+?)\s*\}\}"/) || [])[1];
      const as = (attrs.match(/\bas="(\w+)"/) || [])[1];
      const arr = list && lookup(list, scope);
      if (!list || !as || LEAVE.has(list.split('.')[0]) || !Array.isArray(arr) || /\{\{\s*\w+\.on[A-Z]/.test(inner)) {
        out += tpl.slice(i, blk.close); i = blk.close; rx.lastIndex = blk.close; continue;
      }
      out += tpl.slice(i, blk.start);
      out += arr.map((item) => fill(expand(inner, Object.assign(Object.create(scope), { [as]: item })), Object.assign(Object.create(scope), { [as]: item }))).join('');
    } else {
      const cond = (attrs.match(/value="\{\{\s*([^}]+?)\s*\}\}"/) || [])[1];
      let v = cond && lookup(cond, scope);
      // a missing field on a list item (e.g. a testimonial card has no isStat) means "off"
      if (v === undefined && cond && cond.includes('.') && lookup(cond.split('.')[0], scope) !== undefined) v = false;
      if (v === undefined) { out += tpl.slice(i, blk.close); i = blk.close; rx.lastIndex = blk.close; continue; }
      out += tpl.slice(i, blk.start);
      if (v) out += expand(inner, scope);
    }
    i = blk.close; rx.lastIndex = blk.close;
  }
  return out + tpl.slice(i);
}

// replace {{ path }} whose value is a plain string/number in scope
function fill(html, scope) {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (all, expr) => {
    const v = lookup(expr, scope);
    if (typeof v === 'string' || typeof v === 'number') return esc(v);
    if (v !== undefined) return all;
    unresolved++;
    return all;
  });
}

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.dc.html') && f !== 'Mega Menu Test.dc.html');
let changed = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  const html = fs.readFileSync(p, 'utf8');
  if (!/<sc-(for|if)\b/.test(html)) continue;
  const vals = valsOf(html, f);
  if (!vals) continue;
  // expand only inside <body>, outside <script> blocks
  const bodyStart = html.indexOf('<body');
  const head = html.slice(0, bodyStart);
  const parts = html.slice(bodyStart).split(/(<script[\s\S]*?<\/script>)/);
  const before = (html.match(/\{\{/g) || []).length;
  const body = parts.map((part) => (part.startsWith('<script') ? part : expand(part, vals))).join('');
  const next = head + body;
  const after = (next.match(/\{\{/g) || []).length;
  if (next !== html) {
    changed++;
    console.log(`${f}: {{ }} ${before} -> ${after}`);
    if (after && process.env.SHOW) console.log('    left: ' + [...new Set(next.slice(next.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '').match(/\{\{[^}]*\}\}/g))].join(' '));
    if (!DRY) fs.writeFileSync(p, next);
  }
}
console.log(`${DRY ? 'DRY RUN, ' : ''}${changed} pages prerendered`);
