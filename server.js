const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const DATA = path.join(__dirname, 'data.json');
const PUB = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function load() {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
  catch { return { names: [], rig: { alwaysIndex: 2, forceNext: null } }; }
}
let state = load();
const save = () => fs.writeFileSync(DATA, JSON.stringify(state, null, 2));
const names = () => state.names.map(x => x.name);
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(resolve => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 1e5) req.destroy(); });
  req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
});
const isAdmin = req => req.headers['x-admin-key'] === ADMIN_KEY;

function pick() {
  const n = state.names, { alwaysIndex, forceNext } = state.rig;
  if (n.length < 2) return -1;
  if (Number.isInteger(forceNext) && n[forceNext]) { state.rig.forceNext = null; return forceNext; }
  if (Number.isInteger(alwaysIndex) && n[alwaysIndex]) return alwaysIndex;
  const total = n.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return Math.floor(Math.random() * n.length);
  let r = Math.random() * total;
  for (let i = 0; i < n.length; i++) { r -= n[i].w; if (r < 0) return i; }
  return n.length - 1;
}

http.createServer(async (req, res) => {
  const p = new URL(req.url, 'http://x').pathname;

  if (p.startsWith('/api/')) {
    if (req.method === 'GET' && p === '/api/names') return send(res, 200, names());
    if (req.method === 'POST' && p === '/api/names') {
      const b = await body(req);
      (Array.isArray(b.names) ? b.names : [])
        .map(s => String(s).trim().slice(0, 40)).filter(Boolean)
        .forEach(name => state.names.push({ name, w: 1 }));
      save(); return send(res, 200, names());
    }
    if (req.method === 'DELETE' && p === '/api/names') { state.names = []; save(); return send(res, 200, []); }
    const m = p.match(/^\/api\/names\/(\d+)$/);
    if (req.method === 'DELETE' && m) { state.names.splice(Number(m[1]), 1); save(); return send(res, 200, names()); }
    if (req.method === 'POST' && p === '/api/spin') {
      const i = pick();
      if (i < 0) return send(res, 400, { error: 'Add at least 2 names' });
      save(); return send(res, 200, { index: i, name: state.names[i].name });
    }
    if (p === '/api/admin/rig') {
      if (!isAdmin(req)) return send(res, 404, { error: 'not found' });
      if (req.method === 'GET') return send(res, 200, { rig: state.rig, weights: state.names.map(x => x.w) });
      if (req.method === 'PUT') {
        const b = await body(req);
        if ('alwaysIndex' in b) state.rig.alwaysIndex = Number.isInteger(b.alwaysIndex) ? b.alwaysIndex : null;
        if ('forceNext' in b) state.rig.forceNext = Number.isInteger(b.forceNext) ? b.forceNext : null;
        if (Array.isArray(b.weights)) b.weights.forEach((w, i) => { if (state.names[i]) state.names[i].w = Math.max(0, Number(w) || 0); });
        save(); return send(res, 200, { ok: true });
      }
    }
    return send(res, 404, { error: 'not found' });
  }

  const f = path.normalize(path.join(PUB, p === '/' ? 'index.html' : p));
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(PORT, () => console.log('Running on http://localhost:' + PORT));
