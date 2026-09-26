import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { q } from '../db.js';
import { optionalAuth, createSession, destroySession, audit, clientIp } from '../auth.js';
import { HttpError } from '../lib/errors.js';
import { passwordIssue } from '../lib/password.js';
import { verifyTotp, hashCode } from '../lib/totp.js';
import { publicUser } from '../lib/user.js';
import * as v from '../lib/validate.js';

const r = Router();
const body = (req) => req.body || {};
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
// Compared against when the email does not exist, so login timing does not reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), 12);

r.post('/auth/register', async (req, res) => {
  const b = body(req);
  if (b.website) throw new HttpError(400, 'INVALID_INPUT'); // honeypot field: real people never fill it
  const name = v.str(b.name, { field: 'name', min: 2, max: 80 });
  const email = v.email(b.email);
  const password = String(b.password ?? '');
  const issue = passwordIssue(password, { email, name });
  if (issue) throw new HttpError(400, 'WEAK_PASSWORD', { reason: issue });
  const hash = await bcrypt.hash(password, 12);
  try {
    const u = (await q('INSERT INTO users(name,email,password_hash,locale) VALUES($1,$2,$3,$4) RETURNING *', [name, email, hash, b.locale === 'en' ? 'en' : 'ar'])).rows[0];
    await createSession(req, res, u);
    audit(u, 'REGISTER', 'user', u.id, { ip: clientIp(req) });
    res.status(201).json({ user: publicUser(u) });
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'EMAIL_EXISTS');
    throw e;
  }
});

r.post('/auth/login', async (req, res) => {
  const b = body(req);
  const identifier = String(b.email || b.admin_id || '').trim().slice(0, 254);
  const email = identifier.toLowerCase();
  const u = (await q('SELECT * FROM users WHERE email = $1 OR admin_id = $2 LIMIT 1', [email, identifier])).rows[0];

  if (u?.locked_until && new Date(u.locked_until) > new Date()) {
    throw new HttpError(429, 'ACCOUNT_LOCKED', { retry_after: Math.ceil((new Date(u.locked_until) - Date.now()) / 1000) });
  }
  const ok = await bcrypt.compare(String(b.password || '').slice(0, 200), u ? u.password_hash : DUMMY_HASH);

  // Five wrong attempts lock the account for 15 minutes — throttles password guessing even from many IP addresses.
  const fail = async (reason) => {
    if (u) {
      const f = (
        await q(
          `UPDATE users SET failed_logins = failed_logins + 1,
                  locked_until = CASE WHEN failed_logins + 1 >= $2::int THEN now() + ($3::text || ' minutes')::interval ELSE locked_until END
            WHERE id = $1 RETURNING failed_logins`,
          [u.id, MAX_FAILS, String(LOCK_MINUTES)]
        )
      ).rows[0];
      audit(u, 'LOGIN_FAILED', 'user', u.id, { ip: clientIp(req), reason, locked: f.failed_logins >= MAX_FAILS });
    }
    throw new HttpError(401, reason === 'code' ? 'INVALID_CODE' : 'INVALID_CREDENTIALS');
  };

  if (!u || !ok) return fail('password');
  if (!u.is_active) throw new HttpError(403, 'ACCOUNT_DISABLED');

  if (u.totp_enabled) {
    const code = String(b.code || '').trim();
    if (!code) throw new HttpError(401, 'TOTP_REQUIRED');
    let good = verifyTotp(u.totp_secret, code);
    if (!good) {
      const h = hashCode(code);
      const codes = Array.isArray(u.recovery_codes) ? u.recovery_codes : [];
      if (codes.includes(h)) {
        good = true;
        await q('UPDATE users SET recovery_codes = $2 WHERE id = $1', [u.id, JSON.stringify(codes.filter((x) => x !== h))]);
        audit(u, 'RECOVERY_CODE_USED', 'user', u.id, { ip: clientIp(req) });
      }
    }
    if (!good) return fail('code');
  }

  await q('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1', [u.id]);
  await createSession(req, res, u);
  audit(u, 'LOGIN', 'user', u.id, { ip: clientIp(req) });
  res.json({ user: publicUser(u) });
});

r.post('/auth/logout', optionalAuth, async (req, res) => {
  await destroySession(req, res);
  if (req.user) audit(req.user, 'LOGOUT', 'user', req.user.id);
  res.json({ ok: true });
});

export default r;
