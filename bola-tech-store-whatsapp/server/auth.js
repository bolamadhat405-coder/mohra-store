import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { q } from './db.js';
import { HttpError } from './lib/errors.js';

const DEV_SECRET = 'dev-only-change-me';
export const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || DEV_SECRET;
const SESSION_DAYS = 7;
const SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd;
// "__Host-" cookies are only accepted over HTTPS, for the whole site, with no Domain attribute — much harder to overwrite from a subdomain.
export const COOKIE = SECURE ? '__Host-bola_session' : 'bola_session';
export const REQUIRE_ADMIN_2FA = process.env.REQUIRE_ADMIN_2FA === 'true';
export const REQUIRE_ADMIN_PASSKEY = process.env.REQUIRE_ADMIN_PASSKEY === 'true';

const weakSecret = JWT_SECRET === DEV_SECRET || JWT_SECRET.startsWith('CHANGE_ME') || JWT_SECRET.length < 32;
if (weakSecret && isProd) {
  console.error('\n✖ JWT_SECRET is missing or too weak. Set a random value of 32+ characters in .env.\n');
  process.exit(1);
}
if (weakSecret) console.warn('⚠ JWT_SECRET is weak — fine for local development, NEVER for production.');

export const clientIp = (req) => String(req.ip || req.socket?.remoteAddress || '').slice(0, 64);

// Server-side sessions: the cookie only proves "I hold session X"; whether X is still valid (not revoked, not expired,
// user not disabled, role as it is NOW) is decided by the database on every request.
export async function createSession(req, res, user, authMethod = 'password') {
  const sid = crypto.randomBytes(24).toString('hex');
  await q(
    `INSERT INTO sessions(id,user_id,ip,user_agent,expires_at,auth_method) VALUES($1,$2,$3,$4, now() + ($5::text || ' days')::interval,$6)`,
    [sid, user.id, clientIp(req), String(req.get('user-agent') || '').slice(0, 200), String(SESSION_DAYS), authMethod]
  );
  q(`DELETE FROM sessions WHERE expires_at < now() - interval '1 day'`).catch(() => {});
  const token = jwt.sign({ sid, id: user.id }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE, token, { httpOnly: true, secure: SECURE, sameSite: 'lax', maxAge: SESSION_DAYS * 86400000, path: '/' });
  return sid;
}

export async function destroySession(req, res) {
  if (req.user?.sid) await q('DELETE FROM sessions WHERE id = $1', [req.user.sid]);
  res.clearCookie(COOKIE, { path: '/' });
}
export const destroyOtherSessions = (userId, keepSid) => q('DELETE FROM sessions WHERE user_id = $1 AND id <> $2', [userId, keepSid || '']);
export const destroyAllSessions = (userId) => q('DELETE FROM sessions WHERE user_id = $1', [userId]);

async function loadUser(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  let p;
  try {
    p = jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
  if (!p.sid) return null;
  const r = await q(
    `SELECT u.id,u.name,u.email,u.phone,u.avatar_url,u.locale,u.role,u.totp_enabled, s.id AS sid, s.auth_method
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.user_id = $2 AND s.expires_at > now() AND u.is_active`,
    [p.sid, p.id]
  );
  const u = r.rows[0];
  if (!u) return null;
  q(`UPDATE sessions SET last_seen = now() WHERE id = $1 AND last_seen < now() - interval '5 minutes'`, [p.sid]).catch(() => {});
  return u;
}

export async function optionalAuth(req, res, next) {
  req.user = await loadUser(req);
  next();
}
export async function requireAuth(req, res, next) {
  req.user = await loadUser(req);
  if (!req.user) throw new HttpError(401, 'AUTH_REQUIRED');
  next();
}
export async function requireAdmin(req, res, next) {
  req.user = await loadUser(req);
  if (!req.user) throw new HttpError(401, 'AUTH_REQUIRED');
  if (req.user.role !== 'admin') throw new HttpError(403, 'ADMIN_ONLY');
  if (REQUIRE_ADMIN_PASSKEY && req.user.auth_method !== 'passkey') throw new HttpError(403, 'ADMIN_PASSKEY_REQUIRED');
  if (REQUIRE_ADMIN_2FA && !req.user.totp_enabled) throw new HttpError(403, 'TWO_FACTOR_REQUIRED');
  next();
}

// Fire-and-forget audit trail. Never breaks the request if logging fails.
export async function audit(user, action, entity = '', entityId = '', meta = {}) {
  try {
    await q('INSERT INTO audit_logs(user_id,action,entity,entity_id,meta) VALUES($1,$2,$3,$4,$5)', [
      user?.id || null, action, entity, String(entityId ?? ''), JSON.stringify(meta)
    ]);
  } catch (e) {
    console.warn('audit failed:', e.message);
  }
}
