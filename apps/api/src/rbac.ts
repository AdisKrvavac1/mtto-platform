/**
 * F1-04: uloge i prava po modulu CMS-a.
 * Svaka admin ruta mora imati @Can(modul, radnja); test rbac.test.ts to provjerava, pa nova ruta bez prava ne prolazi CI.
 * Prava po sektoru (npr. urednik samo za turizam) čekaju organizacionu šemu Ministarstva (provjeriti s Ministarstvom).
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES = ['ADMIN', 'UREDNIK', 'SARADNIK', 'REFERENT', 'PREGLED'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  UREDNIK: 'Urednik',
  SARADNIK: 'Saradnik (autor)',
  REFERENT: 'Referent registra',
  PREGLED: 'Samo pregled',
};

export const MODULES = ['kontrolna', 'objave', 'dokumenti', 'mediji', 'registri', 'eko', 'uvoz', 'korisnici', 'dnevnik', 'predmeti'] as const;
export type Module = (typeof MODULES)[number];
export type Action = 'read' | 'write' | 'delete' | 'publish';

const R: Action[] = ['read'];
const RW: Action[] = ['read', 'write'];
const RWD: Action[] = ['read', 'write', 'delete'];
const ALL: Action[] = ['read', 'write', 'delete', 'publish'];

/** Matrica prava. Šta nije navedeno, nije dozvoljeno. */
export const PERMISSIONS: Record<Role, Partial<Record<Module, Action[]>>> = {
  ADMIN: Object.fromEntries(MODULES.map((m) => [m, ALL])) as Record<Module, Action[]>,
  UREDNIK: { kontrolna: R, objave: ALL, dokumenti: RWD, mediji: RW, uvoz: RW, registri: R, eko: R, predmeti: R },
  SARADNIK: { kontrolna: R, objave: RW, dokumenti: RW, mediji: RW },
  REFERENT: { kontrolna: R, registri: RWD, eko: RWD, dokumenti: RW, mediji: RW, objave: R, predmeti: RW },
  PREGLED: { kontrolna: R, objave: R, dokumenti: R, registri: R, eko: R, predmeti: R },
};

export function can(role: string | undefined, module: Module, action: Action): boolean {
  const p = PERMISSIONS[role as Role];
  return !!p?.[module]?.includes(action);
}

/** Prava za prikaz u sučelju: { objave: ['read','write',...], ... } */
export function permissionsFor(role: string): Partial<Record<Module, Action[]>> {
  return PERMISSIONS[role as Role] ?? {};
}

export const CAN_KEY = 'mtto:can';
export const Can = (module: Module, action: Action) => SetMetadata(CAN_KEY, { module, action });
