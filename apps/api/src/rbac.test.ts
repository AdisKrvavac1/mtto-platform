import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATH_METADATA } from '@nestjs/common/constants';
import { CAN_KEY, MODULES, PERMISSIONS, ROLES, can } from './rbac';
import { diff, ipPrefix } from './audit';
import { passwordProblem } from './auth';
import { AdminController } from './admin.controller';
import { AdminRiskController } from './risk';
import { UsersController } from './users.controller';
import { AuditController } from './audit.controller';
import { PostsController } from './posts.controller';
import { DocumentsController } from './documents.controller';
import { SectorsController } from './sectors';
import { RegistriesController } from './registries.controller';
import { CasesController } from './cases.controller';
import { AdminAirController } from './air';
import { CallsController } from './calls.controller';
import { AdminSearchController } from './search';
import { LifeEventsController } from './life-events.controller';

test('svaka admin ruta ima @Can (ruta bez prava ne smije proći CI)', () => {
  const missing: string[] = [];
  for (const C of [AdminController, AdminRiskController, UsersController, AuditController, PostsController, DocumentsController, SectorsController, RegistriesController, CasesController, AdminAirController, CallsController, AdminSearchController, LifeEventsController] as any[]) {
    for (const name of Object.getOwnPropertyNames(C.prototype)) {
      const fn = C.prototype[name];
      if (name === 'constructor' || typeof fn !== 'function') continue;
      if (Reflect.getMetadata(PATH_METADATA, fn) === undefined) continue; // pomoćna metoda, nije ruta
      const need = Reflect.getMetadata(CAN_KEY, fn);
      if (!need || !MODULES.includes(need.module)) missing.push(`${C.name}.${name}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('matrica prava: administrator sve, pregled samo čitanje, korisnici samo administrator', () => {
  for (const m of MODULES) assert.ok(can('ADMIN', m, 'delete'));
  for (const [m, acts] of Object.entries(PERMISSIONS.PREGLED)) assert.deepEqual(acts, ['read'], m);
  for (const r of ROLES.filter((r) => r !== 'ADMIN')) {
    assert.equal(can(r, 'korisnici', 'read'), false, r);
    assert.equal(can(r, 'dnevnik', 'read'), false, r);
  }
  assert.equal(can('REFERENT', 'objave', 'write'), false);
  assert.equal(can('UREDNIK', 'registri', 'write'), false);
  assert.equal(can('NEPOSTOJECA', 'objave', 'read'), false);
});

test('dnevnik: razlika po poljima bez tajni i binarnih podataka', () => {
  const d = diff({ title: 'A', body: 'x', passwordHash: 'h1', data: Buffer.from('a'), updatedAt: new Date() }, { title: 'B', body: 'x', passwordHash: 'h2', data: Buffer.from('b'), updatedAt: new Date() });
  assert.deepEqual(d, { title: ['A', 'B'] });
  assert.equal(diff({ a: 1 }, { a: 1 }), null);
  assert.deepEqual(diff(null, { name: 'N' }), { name: [null, 'N'] });
  const long = diff({ body: '' }, { body: 'y'.repeat(1000) })!;
  assert.ok(String(long.body[1]).length < 400);
});

test('dnevnik: IP skraćen na mrežu', () => {
  assert.equal(ipPrefix('91.191.5.77'), '91.191.5.0/24');
  assert.equal(ipPrefix('::ffff:10.1.2.3'), '10.1.2.0/24');
  assert.equal(ipPrefix('2a02:27b0:4c01:1:2:3:4:5'), '2a02:27b0:4c01::/48');
});

test('lozinka: najmanje 12 znakova, bez e-maila i čestih nizova', () => {
  assert.ok(passwordProblem('kratka', 'ana@mtto.gov.ba'));
  assert.ok(passwordProblem('ana-lozinka-2026', 'ana@mtto.gov.ba'));
  assert.ok(passwordProblem('aaaaaaaaaaaaaa', 'x@y.ba'));
  assert.equal(passwordProblem('Neretva i Buna teku 2026', 'ana@mtto.gov.ba'), null);
});
