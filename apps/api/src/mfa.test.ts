import { test } from 'node:test';
import assert from 'node:assert/strict';
import { base32Decode, base32Encode, hashRecovery, newRecoveryCodes, openSecret, sealSecret, totp, verifyTotp } from './mfa';

// RFC 6238, Dodatak B (SHA1, tajna "12345678901234567890"): zadnjih 6 cifara 8-cifrenih vrijednosti
const SECRET = base32Encode(Buffer.from('12345678901234567890'));
const VECTORS: [number, string][] = [[59, '287082'], [1111111109, '081804'], [1111111111, '050471'], [1234567890, '005924'], [2000000000, '279037']];

test('TOTP odgovara RFC 6238 test vektorima', () => {
  for (const [t, code] of VECTORS) assert.equal(totp(SECRET, Math.floor(t / 30)), code);
});

test('base32 kodiranje je reverzibilno', () => {
  const b = Buffer.from('mtto-hnk-2027');
  assert.deepEqual(base32Decode(base32Encode(b)), b);
});

test('verifikacija prihvata ±1 korak i odbija ponovljeni korak', () => {
  const now = 1_800_000_000_000;
  const step = Math.floor(now / 30000);
  assert.equal(verifyTotp(SECRET, totp(SECRET, step), 0, now), step);
  assert.equal(verifyTotp(SECRET, totp(SECRET, step - 1), 0, now), step - 1);
  assert.equal(verifyTotp(SECRET, totp(SECRET, step - 2), 0, now), null);
  assert.equal(verifyTotp(SECRET, totp(SECRET, step), step, now), null, 'isti kod se ne smije iskoristiti dvaput');
  assert.equal(verifyTotp(SECRET, 'abc123', 0, now), null);
});

test('tajna se šifrira i dešifrira, a izmjena se otkriva', () => {
  const sealed = sealSecret('JBSWY3DPEHPK3PXP');
  assert.notEqual(sealed, 'JBSWY3DPEHPK3PXP');
  assert.equal(openSecret(sealed), 'JBSWY3DPEHPK3PXP');
  const parts = sealed.split('.'); parts[3] = Buffer.from('xxxxxxxx').toString('base64');
  assert.throws(() => openSecret(parts.join('.')));
});

test('rezervni kodovi su jedinstveni i hash ne zavisi od crtice ni velikih slova', () => {
  const codes = newRecoveryCodes();
  assert.equal(new Set(codes).size, 8);
  assert.match(codes[0], /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(hashRecovery(codes[0]), hashRecovery(codes[0].toLowerCase().replace('-', '')));
});
