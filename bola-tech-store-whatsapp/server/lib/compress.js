import zlib from 'node:zlib';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const wantsGzip = (req) => /\bgzip\b/.test(String(req.headers?.['accept-encoding'] || ''));
const etagOf = (buf) => 'W/"' + crypto.createHash('sha1').update(buf).digest('base64url') + '"';

// API responses: gzip when it pays off, plus an ETag so repeat requests get a tiny "304 Not Modified".
export function jsonCompression() {
  return (req, res, next) => {
    const original = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode !== 200) return original(body);
      const raw = Buffer.from(JSON.stringify(body));
      const etag = etagOf(raw);
      res.setHeader('ETag', etag);
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Cache-Control', 'no-cache'); // always revalidate: the ETag makes that almost free
      if (req.headers?.['if-none-match'] === etag) { res.statusCode = 304; return res.end(); }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (raw.length < 1024 || !wantsGzip(req)) return res.end(raw);
      zlib.gzip(raw, (err, gz) => {
        if (err) return res.end(raw);
        res.setHeader('Content-Encoding', 'gzip');
        res.end(gz);
      });
      return res;
    };
    next();
  };
}

const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.html': 'text/html; charset=utf-8' };
const fileCache = new Map(); // absolute path -> { mtime, raw, gz, etag }

async function load(file) {
  const st = await fs.promises.stat(file);
  if (!st.isFile()) return null;
  const hit = fileCache.get(file);
  if (hit && hit.mtime === st.mtimeMs) return hit;
  const raw = await fs.promises.readFile(file);
  const entry = { mtime: st.mtimeMs, raw, gz: zlib.gzipSync(raw, { level: 9 }), etag: etagOf(raw) };
  fileCache.set(file, entry);
  return entry;
}
export const contentHash = async (file) => (await load(file)).etag.slice(3, 11).replace(/[^A-Za-z0-9]/g, 'x');

function send(req, res, entry, type, cacheControl, body = entry.raw) {
  res.setHeader('Content-Type', type);
  res.setHeader('ETag', entry.etag);
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('Cache-Control', cacheControl);
  if (req.headers?.['if-none-match'] === entry.etag) { res.statusCode = 304; return res.end(); }
  if (wantsGzip(req) && body === entry.raw) { res.setHeader('Content-Encoding', 'gzip'); return res.end(entry.gz); }
  return res.end(body);
}

const safeFile = (root, urlPath) => {
  const base = path.resolve(root) + path.sep;
  const file = path.resolve(root, '.' + decodeURIComponent(urlPath));
  return file.startsWith(base) ? file : null;
};

// JS / CSS / SVG: gzip cached in memory. URLs carrying ?v=<hash> are cached for a year (they change when the file changes).
export function staticAssets(root) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !TYPES[path.extname(req.path)] || path.extname(req.path) === '.html') return next();
    try {
      const file = safeFile(root, req.path);
      const entry = file && (await load(file));
      if (!entry) return next();
      const immutable = typeof req.query?.v === 'string' && /^[A-Za-z0-9]{4,16}$/.test(req.query.v);
      return send(req, res, entry, TYPES[path.extname(file)], immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
    } catch {
      return next();
    }
  };
}

// HTML pages: /js/*.js and /css/*.css links get "?v=<content hash>" so browsers keep them forever and still update instantly on deploy.
export function htmlPages(root) {
  const cache = new Map();
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    let p = req.path;
    if (p === '/' || p.endsWith('/')) p += 'index.html';
    else if (!path.extname(p)) p += '.html';
    if (path.extname(p) !== '.html') return next();
    try {
      const file = safeFile(root, p);
      const st = file && (await fs.promises.stat(file));
      if (!st || !st.isFile()) return next();
      let hit = cache.get(file);
      if (!hit || hit.mtime !== st.mtimeMs) {
        let html = await fs.promises.readFile(file, 'utf8');
        const links = [...new Set([...html.matchAll(/(?:src|href)="(\/(?:js|css)\/[^"?]+)"/g)].map((m) => m[1]))];
        for (const l of links) {
          const asset = safeFile(root, l);
          if (asset) html = html.split(`"${l}"`).join(`"${l}?v=${await contentHash(asset)}"`);
        }
        const raw = Buffer.from(html);
        hit = { mtime: st.mtimeMs, raw, gz: zlib.gzipSync(raw, { level: 9 }), etag: etagOf(raw) };
        cache.set(file, hit);
      }
      return send(req, res, hit, TYPES['.html'], 'no-cache');
    } catch {
      return next();
    }
  };
}
