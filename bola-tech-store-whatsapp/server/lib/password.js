// Password policy for accounts. Returns a reason code, or null when the password is acceptable.
const COMMON = new Set([
  '12345678', '123456789', '1234567890', '12341234', '123123123', '11111111', '00000000', '01234567', '987654321', '000000000',
  'password', 'password1', 'password123', 'passw0rd', 'p@ssw0rd', 'qwertyuiop', 'qwerty123', 'qwertyui', '1q2w3e4r', 'asdfghjkl',
  'iloveyou', 'admin123', 'admin1234', 'abc12345', 'abcd1234', 'letmein123', 'welcome1', 'welcome123', 'changeme', 'change_me_now',
  'bolatech', 'bolatech123', 'bolatech1', 'monkey123', 'dragon123', 'football1', 'baseball1', 'master123', 'shadow123', 'sunshine1'
]);

export function passwordIssue(pw, { email = '', name = '' } = {}) {
  const s = String(pw ?? '');
  if (s.length < 8) return 'short';
  if (Buffer.byteLength(s) > 72) return 'long';
  const l = s.toLowerCase();
  if (COMMON.has(l)) return 'common';
  const local = String(email).split('@')[0].toLowerCase();
  if (local.length >= 4 && l.includes(local)) return 'contains_email';
  const first = String(name).trim().split(/\s+/)[0].toLowerCase();
  if (first.length >= 4 && l === first) return 'contains_name';
  if (/^(.)\1+$/.test(s)) return 'repeated';
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9\u0600-\u06FF]/, /[\u0600-\u06FF]/].filter((r) => r.test(s)).length;
  if (classes < 2) return 'simple';
  return null;
}
