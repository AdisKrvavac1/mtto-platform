import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { clientIp, newAltchaChallenge, verifyAltcha } from './security';

test('clientIp uzima zadnju javnu adresu, ne onu koju je klijent izmislio', () => {
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '6.6.6.6, 91.191.10.20, 10.0.0.5' } }), '91.191.10.20');
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '91.191.10.20' } }), '91.191.10.20');
  assert.equal(clientIp({ headers: {}, ip: '127.0.0.1' }), '127.0.0.1');
});

test('ALTCHA: ispravno rješenje prolazi jednom, ponovljeno i izmijenjeno ne prolaze', async () => {
  const challenge = await newAltchaChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  assert.ok(solution);
  const payload = Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
  assert.equal(await verifyAltcha(payload), true);
  assert.equal(await verifyAltcha(payload), false, 'isto rješenje ne smije proći dvaput');
  const c2 = await newAltchaChallenge();
  const s2 = await solveChallenge({ challenge: c2, deriveKey });
  const bad = Buffer.from(JSON.stringify({ challenge: c2, solution: { ...s2!, derivedKey: s2!.derivedKey.replace(/^./, (c) => (c === 'a' ? 'b' : 'a')) } })).toString('base64');
  assert.equal(await verifyAltcha(bad), false);
  assert.equal(await verifyAltcha('nije-base64-json'), false);
});
