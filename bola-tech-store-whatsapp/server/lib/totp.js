import crypto from 'node:crypto';

// RFC 6238 time-based one-time passwords (Google Authenticator, Microsoft Authenticator, Authy, 1Password...). No dependencies.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32(buf) {
  let bits = '', out = '';
  for (const b of buf) bits += b.toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  return out;
}
export function base32Decode(s) {
  let bits = '';
  for (const c of String(s).replace(/=+$/, '').replace(/\s/g, '').toUpperCase()) {
    const v = B32.indexOf(c);
    if (v < 0) throw new Error('bad base32');
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
export const generateSecret = () => base32(crypto.randomBytes(20));

export function hotp(secret, counter, digits = 6) {
  const c = Buffer.alloc(8);
  c.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', secret).update(c).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 10 ** digits).padStart(digits, '0');
}
export const totp = (secretB32, time = Date.now(), digits = 6) => hotp(base32Decode(secretB32), Math.floor(time / 30000), digits);

export function verifyTotp(secretB32, code, { time = Date.now(), window = 1 } = {}) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  const key = base32Decode(secretB32);
  const step = Math.floor(time / 30000);
  let ok = false;
  for (let w = -window; w <= window; w++) {
    if (crypto.timingSafeEqual(Buffer.from(hotp(key, step + w)), Buffer.from(c))) ok = true;
  }
  return ok;
}
export const otpauthUri = (secret, account, issuer) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;

// One-time recovery codes (shown once, stored only as SHA-256 hashes).
export const newRecoveryCodes = (n = 8) => Array.from({ length: n }, () => crypto.randomBytes(5).toString('hex').replace(/(.{5})(.{5})/, '$1-$2'));
export const hashCode = (c) => crypto.createHash('sha256').update(String(c).toLowerCase().replace(/\s/g, '')).digest('hex');
