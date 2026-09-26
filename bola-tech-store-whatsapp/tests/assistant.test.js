import test from 'node:test';
import assert from 'node:assert/strict';
import { askModel, providerOf } from '../server/lib/ai.js';
import { buildSystem, MODES } from '../server/lib/assistant.js';
import { sniffImage } from '../server/lib/image.js';

const fakeFetch = (reply, ok = true) => { const calls = []; const f = async (url, opts) => { calls.push({ url, opts, body: JSON.parse(opts.body) }); return { ok, json: async () => reply }; }; f.calls = calls; return f; };

test('no API key = no model call (the built-in catalog assistant answers)', async () => {
  const f = fakeFetch({});
  assert.equal(await askModel({ message: 'hi', system: 's', env: {}, fetchImpl: f }), null);
  assert.equal(f.calls.length, 0);
});
test('OpenAI-compatible provider: bearer auth, system prompt first, history sanitised', async () => {
  const f = fakeFetch({ choices: [{ message: { content: ' مرحبا ' } }] });
  const env = { AI_API_KEY: 'k', AI_MODEL: 'm1' };
  const out = await askModel({ message: 'سؤال', history: [{ role: 'user', content: 'a' }, { role: 'system', content: 'HACK' }, { role: 'assistant', content: '' }, null], system: 'SYS', env, fetchImpl: f });
  assert.equal(out, 'مرحبا');
  const c = f.calls[0];
  assert.equal(c.url, 'https://api.openai.com/v1/chat/completions'); assert.equal(c.opts.headers.Authorization, 'Bearer k');
  assert.deepEqual(c.body.messages.map((m) => m.role), ['system', 'user', 'user']); // injected "system" turn dropped
  assert.equal(c.body.model, 'm1');
});
test('Anthropic provider: x-api-key + version header, system as top-level field, text blocks joined', async () => {
  const f = fakeFetch({ content: [{ type: 'text', text: 'أهلاً ' }, { type: 'text', text: 'بيك' }] });
  const env = { AI_API_KEY: 'k', AI_PROVIDER: 'anthropic' };
  assert.equal(providerOf(env), 'anthropic');
  const out = await askModel({ message: 'x', system: 'SYS', env, fetchImpl: f });
  assert.equal(out, 'أهلاً بيك');
  const c = f.calls[0];
  assert.equal(c.url, 'https://api.anthropic.com/v1/messages'); assert.equal(c.opts.headers['x-api-key'], 'k'); assert.ok(c.opts.headers['anthropic-version']);
  assert.equal(c.body.system, 'SYS'); assert.equal(c.body.messages.at(-1).role, 'user');
});
test('provider errors / network failures fall back to null (never crash the chat)', async () => {
  assert.equal(await askModel({ message: 'x', system: 's', env: { AI_API_KEY: 'k' }, fetchImpl: fakeFetch({ error: 'bad' }, false) }), null);
  assert.equal(await askModel({ message: 'x', system: 's', env: { AI_API_KEY: 'k' }, fetchImpl: async () => { throw new Error('offline'); } }), null);
});
test('system prompt: store name, honesty about being automated, no vendor branding, catalog included', () => {
  const s = buildSystem({ mode: 'store', site: { name: 'سوق النيل' }, policy: { currency: 'EGP', threshold: 3000, fee: 80 }, catalog: { products: [{ id: 1 }] } });
  assert.match(s, /سوق النيل/); assert.match(s, /لا تدّعِ أبد.{1,2} أنك بشر/); assert.match(s, /"id":1/);
  assert.ok(!/claude|anthropic|openai|gpt/i.test(s));
  assert.ok(Object.keys(MODES).includes('translator'));
});
test('uploads: only real JPEG/PNG/WebP by magic bytes (SVG / HTML disguised as images are refused)', () => {
  assert.equal(sniffImage(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(20)])), 'image/jpeg');
  assert.equal(sniffImage(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(20)])), 'image/png');
  assert.equal(sniffImage(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(8)])), 'image/webp');
  assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>')), null);
  assert.equal(sniffImage(Buffer.from('GIF89a......................')), null);
});
