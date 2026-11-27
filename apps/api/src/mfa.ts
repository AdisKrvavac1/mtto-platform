import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Dvofaktorska prijava (TOTP, RFC 6238): 6 cifara, korak 30 s, HMAC-SHA1 —
 * radi s Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden.
 */
const STEP = 30;
const DIGITS = 6;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0, value = 0; const out: number[] = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error('Neispravan base32');
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const newSecret = () => base32Encode(randomBytes(20));
export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP);

export function totp(secretB32: string, step: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', base32Decode(secretB32)).update(msg).digest();
  const off = h[h.length - 1] & 15;
  const code = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(code % 10 ** DIGITS).padStart(DIGITS, '0');
}

/** Vraća korak koji odgovara kodu (±1 korak zbog razlike satova) ili null. Korak ≤ lastStep se odbija (zaštita od ponavljanja). */
export function verifyTotp(secretB32: string, code: string, lastStep = 0, now = Date.now()): number | null {
  const c = String(code ?? '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(c)) return null;
  const s = currentStep(now);
  for (const st of [s, s - 1, s + 1]) {
    if (st <= lastStep) continue;
    const a = Buffer.from(totp(secretB32, st)), b = Buffer.from(c);
    if (a.length === b.length && timingSafeEqual(a, b)) return st;
  }
  return null;
}

export function otpauthUri(secretB32: string, account: string, issuer = 'MTTO CMS') {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP}`;
}

/* Tajna se u bazi čuva šifrirana (AES-256-GCM), ključ iz MFA_KEY ili JWT_SECRET. */
function key() {
  const base = process.env.MFA_KEY || process.env.JWT_SECRET || 'dev-only-secret-dev-only-secret-0000';
  return createHash('sha256').update(`mtto-mfa:${base}`).digest();
}

export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}

export function openSecret(sealed: string): string {
  const [v, iv, tag, enc] = sealed.split('.');
  if (v !== 'v1') throw new Error('Nepoznat format tajne');
  const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(enc, 'base64')), d.final()]).toString('utf8');
}

/** 8 rezervnih kodova oblika XXXX-XXXX (bez slova koja se lako zamijene). */
export function newRecoveryCodes(n = 8): string[] {
  const alpha = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: n }, () => {
    const b = randomBytes(8);
    const s = Array.from(b, (x) => alpha[x % alpha.length]).join('');
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}

export const normalizeRecovery = (s: string) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const hashRecovery = (s: string) => createHash('sha256').update(`mtto-rc:${normalizeRecovery(s)}`).digest('hex');
