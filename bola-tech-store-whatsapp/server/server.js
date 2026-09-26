import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, q } from './db.js';
import { isProd, optionalAuth } from './auth.js';
import { cspDirectives } from './csp.js';
import { HttpError } from './lib/errors.js';
import { migrate } from './migrate.js';
import shop from './routes/shop.js';
import authRoutes from './routes/auth.js';
import security from './routes/security.js';
import { adminMedia, serveMedia } from './routes/media.js';
import { importRoutes } from './routes/import.js';
import { jsonCompression, staticAssets, htmlPages } from './lib/compress.js';
import admin from './routes/admin.js';
import ai from './routes/ai.js';
import support from './routes/support.js';
import passkeys from './routes/passkeys.js';

const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
const app = express();
app.disable('x-powered-by');

// Behind Render / Railway / Nginx / Cloudflare set TRUST_PROXY=1 so rate-limits see the real visitor IP.
const trust = process.env.TRUST_PROXY;
if (trust) app.set('trust proxy', /^\d+$/.test(trust) ? Number(trust) : trust === 'true' ? 1 : trust);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { ...cspDirectives, ...(isProd ? { upgradeInsecureRequests: [] } : {}) }
    }
  })
);
app.use(cookieParser());
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

/* ───── CSRF hardening: state-changing API calls must come from our own site ───── */
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean));
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients (curl, server-to-server)
  let host = '';
  try {
    host = new URL(origin).host;
  } catch {
    return res.status(403).json({ error: 'BAD_ORIGIN' });
  }
  const own = [req.get('host'), req.get('x-forwarded-host')].filter(Boolean);
  if (own.includes(host) || allowedOrigins.has(origin)) return next();
  res.status(403).json({ error: 'BAD_ORIGIN' });
});

/* ───── image upload: its own (larger) JSON limit, admin-only, mounted BEFORE the global 100 kb parser ───── */
app.use('/api/admin/media', rateLimit({ windowMs: 60 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false, handler: (_q, r) => r.status(429).json({ error: 'RATE_LIMITED' }) }), express.json({ limit: '5mb' }), adminMedia);
app.use('/api/admin/import', express.json({ limit: '1mb' }), importRoutes);
app.use(express.json({ limit: '100kb' }));
app.use('/api', jsonCompression());

/* ───── rate limits ───── */
const limiter = (windowMs, limit, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
    ...extra
  });
app.use('/api/auth/login', limiter(15 * 60 * 1000, 10, { skipSuccessfulRequests: true }));
app.use('/api/auth/register', limiter(60 * 60 * 1000, 10));
app.use('/api/account/password', limiter(15 * 60 * 1000, 10));
app.use('/api/account/2fa', limiter(15 * 60 * 1000, 20));
app.use('/api/assistant', limiter(60 * 1000, 20));
app.use('/api/support', limiter(60 * 1000, 20));
app.post('/api/support/tickets', limiter(60 * 60 * 1000, 6));
app.post('/api/orders', limiter(60 * 60 * 1000, 40));
app.post('/api/inquiries', limiter(60 * 60 * 1000, 8));
app.use('/api/passkeys', limiter(15 * 60 * 1000, 30));
app.use('/api/admin/lessons', limiter(60 * 60 * 1000, 20));
app.use('/api', limiter(60 * 1000, 240));

/* ───── API ───── */
app.get('/api/health', async (_req, res) => {
  try {
    await q('SELECT 1');
    res.json({ ok: true, db: true, version: 'V22-STORE' });
  } catch {
    res.status(503).json({ ok: false, db: false });
  }
});
app.get('/media/:id', serveMedia);
app.use('/api/admin', admin);
app.use('/api/assistant', ai);
app.use('/api/support', support);
app.use('/api', passkeys);
app.get('/api/session', optionalAuth, (req,res)=>res.json({user:req.user||null}));
app.use('/api', authRoutes);
app.use('/api', security);
app.use('/api', shop);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API_NOT_FOUND' }));

/* ───── static site: hashed + gzipped assets, then anything else (images...) ───── */
app.use(htmlPages(PUBLIC));
app.use(staticAssets(PUBLIC));
app.use(
  express.static(PUBLIC, {
    extensions: ['html'],
    setHeaders: (res, file) => {
      if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    }
  })
);
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) return res.sendFile(path.join(PUBLIC, '404.html'));
  res.json({ error: 'NOT_FOUND' });
});

/* ───── central error handler: JSON in, JSON out, never leaks stack traces ───── */
app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  let status = 500;
  let code = 'SERVER_ERROR';
  let data = {};
  if (err instanceof HttpError) {
    ({ status, code, data } = err);
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'BAD_JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'TOO_LARGE';
  } else if (err.code === '23505') {
    status = 409;
    code = 'DUPLICATE';
  } else if (err.code === '23503') {
    status = 409;
    code = 'REFERENCE_ERROR';
  } else if (['22P02', '22003', '23514', '23502'].includes(err.code)) {
    status = 400;
    code = 'INVALID_INPUT';
  } else {
    console.error(err);
  }
  res.status(status).json({ error: code, ...data });
});

/* ───── boot ───── */
try {
  await migrate();
} catch (e) {
  console.error('✖ Database migration failed:', e.message);
  process.exit(1);
}
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => console.log(`BOLA TECH V20 → http://localhost:${port}`));

const shutdown = (sig) => {
  console.log(`${sig} received, shutting down...`);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
