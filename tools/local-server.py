"""Local preview server that follows vercel.json (redirects + rewrites), so clean URLs
(/, /about, /life-insurance/<guide>, /blog-<post>) work exactly as they do on Vercel.

usage:  py -X utf8 -I tools/local-server.py [port]     (default 5250), run from the site folder
"""
import http.server, json, os, re, sys, urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5250
ROOT = os.getcwd()
cfg = json.load(open('vercel.json', encoding='utf-8'))


def compile_source(src):
    """Vercel/path-to-regexp source -> (regex, param names)."""
    names, out, i = [], '', 0
    while i < len(src):
        c = src[i]
        if c == ':':
            m = re.match(r':([A-Za-z_]\w*)(\([^)]*\))?([*+?])?', src[i:])
            name, rx, mod = m.group(1), m.group(2), m.group(3)
            names.append(name)
            if mod in ('*', '+'):
                body = '.+' if mod == '+' else '.*'
                out += '(?P<%s>%s)' % (name, body)
            else:
                out += '(?P<%s>%s)' % (name, rx[1:-1] if rx else '[^/]+')
            i += m.end()
        elif src.startswith('{/}?', i):
            out += '/?'; i += 4
        elif c == '(':
            j = src.index(')', i)
            names.append(str(len(names)))
            out += '(' + src[i + 1:j] + ')'; i = j + 1
        else:
            out += re.escape(c); i += 1
    return re.compile('^' + out + '$')


def fill(dest, m):
    def sub_named(mm):
        try:
            return m.group(mm.group(1)) or ''
        except (IndexError, error):
            return mm.group(0)
    s = re.sub(r':([A-Za-z_]\w*)[*+?]?', sub_named, dest)
    s = re.sub(r'\$(\d+)', lambda mm: m.group(int(mm.group(1))) or '', s)
    return s


error = re.error
REDIRECTS = [(compile_source(r['source']), r['destination'], r.get('statusCode', 308 if r.get('permanent', True) else 307)) for r in cfg.get('redirects', [])]
REWRITES = [(compile_source(r['source']), r['destination']) for r in cfg.get('rewrites', [])]


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        url = urllib.parse.urlsplit(self.path)
        path = urllib.parse.unquote(url.path)
        for rx, dest, code in REDIRECTS:
            m = rx.match(path)
            if m:
                self.send_response(code)
                self.send_header('Location', fill(dest, m))
                self.end_headers()
                return None
        fs = os.path.join(ROOT, path.lstrip('/'))
        if not (os.path.isfile(fs)):
            for rx, dest in REWRITES:
                m = rx.match(path)
                if m:
                    self.path = urllib.parse.quote(urllib.parse.unquote(fill(dest, m)))
                    break
        return super().send_head()

    def log_message(self, *a):
        pass


os.chdir(ROOT)
print('serving %s on http://localhost:%d' % (ROOT, PORT))
http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
