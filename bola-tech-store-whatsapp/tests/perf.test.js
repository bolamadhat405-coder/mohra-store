import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { jsonCompression, staticAssets, htmlPages } from '../server/lib/compress.js';

const mkRes = () => {
  const r = { statusCode: 200, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; this.done = true; }, json(o) { this.body = o; } };
  return r;
};
const run = (mw, req, res) => new Promise((resolve) => { const t = setTimeout(resolve, 60); Promise.resolve(mw(req, res, () => { clearTimeout(t); resolve('next'); })).then(() => {}); });

test('API JSON: gzip for big bodies, ETag + 304 on repeat, small/uncompressed untouched', async () => {
  const big = { items: Array.from({ length: 200 }, (_, i) => ({ id: i, name: 'منتج رقم ' + i })) };
  const res = mkRes(); const mw = jsonCompression();
  mw({ headers: { 'accept-encoding': 'gzip, deflate' } }, res, () => {});
  res.json(big); await new Promise((r) => setTimeout(r, 30));
  assert.equal(res.headers['Content-Encoding'], 'gzip');
  assert.deepEqual(JSON.parse(zlib.gunzipSync(res.body).toString()), big);
  assert.ok(res.body.length < JSON.stringify(big).length / 3, 'compressed to under a third');
  const etag = res.headers.ETag; assert.ok(etag);

  const again = mkRes(); mw({ headers: { 'accept-encoding': 'gzip', 'if-none-match': etag } }, again, () => {}); again.json(big);
  assert.equal(again.statusCode, 304); assert.equal(again.body, undefined);

  const small = mkRes(); mw({ headers: { 'accept-encoding': 'gzip' } }, small, () => {}); small.json({ ok: true });
  assert.equal(small.headers['Content-Encoding'], undefined); assert.equal(Buffer.from(small.body).toString(), '{"ok":true}');
  const plain = mkRes(); mw({ headers: {} }, plain, () => {}); plain.json(big);
  assert.equal(plain.headers['Content-Encoding'], undefined);
  const created = mkRes(); created.statusCode = 201; mw({ headers: { 'accept-encoding': 'gzip' } }, created, () => {}); created.json({ id: 1 });
  assert.deepEqual(created.body, { id: 1 }, 'non-200 responses are left to Express');
});

test('static assets + HTML: hashed URLs, immutable cache only for hashed URLs, gzip, no path traversal', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pub-'));
  fs.mkdirSync(path.join(root, 'js')); fs.mkdirSync(path.join(root, 'css'));
  fs.writeFileSync(path.join(root, 'js', 'app.js'), 'console.log("hello");'.repeat(50));
  fs.writeFileSync(path.join(root, 'css', 'app.css'), 'body{color:red}'.repeat(50));
  fs.writeFileSync(path.join(root, 'index.html'), '<link rel="stylesheet" href="/css/app.css"><script src="/js/app.js"></script>');
  fs.writeFileSync(path.join(root, 'secret.txt'), 'nope');

  const page = mkRes(); await run(htmlPages(root), { method: 'GET', path: '/', headers: {} }, page); await new Promise((r) => setTimeout(r, 20));
  const html = page.body.toString();
  const v = /\/js\/app\.js\?v=([A-Za-z0-9]+)/.exec(html)?.[1]; assert.ok(v, 'js link got a content hash: ' + html);
  assert.match(html, /\/css\/app\.css\?v=[A-Za-z0-9]+/); assert.equal(page.headers['Cache-Control'], 'no-cache');

  const js = mkRes(); await run(staticAssets(root), { method: 'GET', path: '/js/app.js', query: { v }, headers: { 'accept-encoding': 'gzip' } }, js); await new Promise((r) => setTimeout(r, 20));
  assert.match(js.headers['Cache-Control'], /immutable/); assert.equal(js.headers['Content-Encoding'], 'gzip'); assert.match(zlib.gunzipSync(js.body).toString(), /hello/);
  const noV = mkRes(); await run(staticAssets(root), { method: 'GET', path: '/js/app.js', query: {}, headers: {} }, noV); await new Promise((r) => setTimeout(r, 20));
  assert.equal(noV.headers['Cache-Control'], 'no-cache');
  const e304 = mkRes(); await run(staticAssets(root), { method: 'GET', path: '/js/app.js', query: {}, headers: { 'if-none-match': noV.headers.ETag } }, e304); await new Promise((r) => setTimeout(r, 20));
  assert.equal(e304.statusCode, 304);

  for (const evil of ['/../secret.txt', '/js/../../secret.txt', '/%2e%2e/secret.txt']) {
    const r = mkRes(); const out = await run(staticAssets(root), { method: 'GET', path: evil + '.css', query: {}, headers: {} }, r);
    assert.ok(out === 'next' || r.body == null, 'traversal must not be served');
  }
  const txt = mkRes(); assert.equal(await run(staticAssets(root), { method: 'GET', path: '/secret.txt', query: {}, headers: {} }, txt), 'next');
  const post = mkRes(); assert.equal(await run(htmlPages(root), { method: 'POST', path: '/', headers: {} }, post), 'next');
});
