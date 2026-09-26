import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { q } from '../db.js';
import { requireAuth, audit, destroyOtherSessions, clientIp } from '../auth.js';
import { HttpError } from '../lib/errors.js';
import { generateSecret, verifyTotp, otpauthUri, newRecoveryCodes, hashCode } from '../lib/totp.js';
import { getSite } from '../lib/site.js';

const r = Router();
r.use('/account/sessions', requireAuth);
r.use('/account/2fa', requireAuth);
const body = (req) => req.body || {};

/* ───────── active sessions ("where am I logged in?") ───────── */
r.get('/account/sessions', async (req, res) => {
  const rows = (await q('SELECT id, ip, user_agent, created_at, last_seen FROM sessions WHERE user_id = $1 AND expires_at > now() ORDER BY last_seen DESC', [req.user.id])).rows;
  res.json({ items: rows.map((s) => ({ ...s, id: s.id.slice(0, 12), current: s.id === req.user.sid })) }); // never expose full session ids
});
r.delete('/account/sessions/:short', async (req, res) => {
  const short = String(req.params.short || '');
  if (!/^[a-f0-9]{12}$/.test(short)) throw new HttpError(400, 'INVALID_INPUT');
  await q(`DELETE FROM sessions WHERE user_id = $1 AND left(id, 12) = $2 AND id <> $3`, [req.user.id, short, req.user.sid]);
  res.json({ ok: true });
});
r.post('/account/sessions/revoke-others', async (req, res) => {
  await destroyOtherSessions(req.user.id, req.user.sid);
  audit(req.user, 'SESSIONS_REVOKED', 'user', req.user.id, { ip: clientIp(req) });
  res.json({ ok: true });
});

/* ───────── two-factor authentication (authenticator app) ───────── */
r.post('/account/2fa/setup', async (req, res) => {
  if (req.user.totp_enabled) throw new HttpError(409, 'TWO_FACTOR_ALREADY');
  const secret = generateSecret();
  await q('UPDATE users SET totp_secret = $1 WHERE id = $2', [secret, req.user.id]);
  const { site } = await getSite();
  res.json({ secret, uri: otpauthUri(secret, req.user.email, site.name) });
});
r.post('/account/2fa/enable', async (req, res) => {
  const u = (await q('SELECT totp_secret, totp_enabled FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (u.totp_enabled) throw new HttpError(409, 'TWO_FACTOR_ALREADY');
  if (!u.totp_secret || !verifyTotp(u.totp_secret, body(req).code)) throw new HttpError(400, 'INVALID_CODE');
  const codes = newRecoveryCodes(8);
  await q('UPDATE users SET totp_enabled = true, recovery_codes = $2 WHERE id = $1', [req.user.id, JSON.stringify(codes.map(hashCode))]);
  await destroyOtherSessions(req.user.id, req.user.sid);
  audit(req.user, 'TWO_FACTOR_ENABLED', 'user', req.user.id, { ip: clientIp(req) });
  res.json({ ok: true, recovery_codes: codes }); // shown ONCE
});
r.post('/account/2fa/disable', async (req, res) => {
  const b = body(req);
  const u = (await q('SELECT password_hash, totp_secret, totp_enabled FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!u.totp_enabled) throw new HttpError(409, 'TWO_FACTOR_OFF');
  if (!(await bcrypt.compare(String(b.password || '').slice(0, 200), u.password_hash)) || !verifyTotp(u.totp_secret, b.code)) throw new HttpError(401, 'INVALID_CREDENTIALS');
  await q(`UPDATE users SET totp_enabled = false, totp_secret = NULL, recovery_codes = '[]' WHERE id = $1`, [req.user.id]);
  audit(req.user, 'TWO_FACTOR_DISABLED', 'user', req.user.id, { ip: clientIp(req) });
  res.json({ ok: true });
});

export default r;
