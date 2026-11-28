/**
 * Sprint 8 (trgovina, inspekcija, turističke informacije).
 *
 * F2-12 / F2-19: obrasci dobijaju anonimnu prijavu, zaštitu identiteta i pravila usmjeravanja;
 *   predmet može biti proslijeđen nadležnom organu (novi status PROSLIJEDJEN).
 * F2-11: registri „neradni-dani“ (kalendar) i „izuzeci-neradne-nedjelje“ u registry builderu.
 * F2-14: registar „turisticke-zajednice“.
 * F2-20: registri „plan-nadzora“ i „izvjestaj-nadzora“ (strukturirani plan i izvještaj inspekcije).
 *
 * Sadržaj koji nije potvrđen iz službenog izvora označen je kao demo ili „provjeriti s Ministarstvom“.
 */
const J = (x: unknown) => `$j$${JSON.stringify(x)}$j$::jsonb`;
const OPCINE = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];

const reg = (id: string, slug: string, name: string, description: string, sector: string, fields: unknown[], titleField: string, opts: { geo?: boolean; public?: boolean; legalBasis?: string; isDemo?: boolean } = {}) => `
INSERT INTO registries ("id","tenantId","slug","name","description","sector","fields","titleField","geo","public","legalBasis","isDemo")
SELECT '${id}','mtto','${slug}',$t$${name}$t$,$t$${description}$t$,'${sector}',${J(fields)},'${titleField}',${!!opts.geo},${opts.public ?? true},$t$${opts.legalBasis ?? ''}$t$,${!!opts.isDemo}
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;`;

const entries = (registryId: string, rows: Record<string, unknown>[], search: (r: any) => string, isDemo = false) => rows.map((r, i) => `
INSERT INTO registry_entries ("id","tenantId","registryId","data","searchText","isDemo")
SELECT '${registryId}-${i + 1}','mtto','${registryId}',${J(r)},$s$${search(r).toLowerCase()}$s$,${isDemo}
WHERE EXISTS (SELECT 1 FROM registries WHERE "id"='${registryId}') ON CONFLICT DO NOTHING;`).join('');

/* ── F2-11 kalendar: nedjelje računa portal; ovdje praznici i posebni dani ── */
const NERADNI_FIELDS = [
  { key: 'datum', label: 'Datum', type: 'date', required: true, public: true, list: true, unique: false },
  { key: 'naziv', label: 'Naziv', type: 'text', required: true, public: true, list: true, search: true },
  { key: 'vrsta', label: 'Vrsta', type: 'select', options: ['Državni praznik', 'Neradni dan', 'Izmijenjeno radno vrijeme'], required: true, public: true, filter: true, list: true },
  { key: 'napomena', label: 'Napomena za trgovce', type: 'longtext', public: true },
  { key: 'potvrdjeno', label: 'Potvrdilo Ministarstvo', type: 'boolean', public: true, list: true },
];
const praznici = [2026, 2027].flatMap((y) => [
  [`${y}-01-01`, 'Nova godina'], [`${y}-01-02`, 'Nova godina, drugi dan'], [`${y}-03-01`, 'Dan nezavisnosti BiH'],
  [`${y}-05-01`, 'Praznik rada'], [`${y}-05-02`, 'Praznik rada, drugi dan'], [`${y}-11-25`, 'Dan državnosti BiH'],
]).map(([datum, naziv]) => ({ datum, naziv, vrsta: 'Državni praznik', potvrdjeno: false, napomena: 'Rad trgovina na ovaj dan provjeriti s Ministarstvom.' }));

const IZUZECI_FIELDS = [
  { key: 'vrstaObjekta', label: 'Vrsta objekta ili djelatnosti', type: 'text', required: true, public: true, list: true, search: true },
  { key: 'uslov', label: 'Uslov / ograničenje', type: 'longtext', public: true, list: true },
  { key: 'osnov', label: 'Pravni osnov', type: 'text', public: true, list: true },
];

/* ── F2-14 turističke zajednice ── */
const TZ_FIELDS = [
  { key: 'naziv', label: 'Naziv', type: 'text', required: true, public: true, list: true, search: true, unique: true },
  { key: 'razina', label: 'Razina', type: 'select', options: ['Kanton', 'Grad', 'Općina'], required: true, public: true, filter: true, list: true },
  { key: 'opcina', label: 'Područje', type: 'select', options: ['Cijeli kanton', ...OPCINE], required: true, public: true, filter: true, list: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Aktivna', 'U osnivanju', 'Provjeriti s Ministarstvom'], required: true, public: true, filter: true, list: true },
  { key: 'aktOsnivanja', label: 'Akt o osnivanju', type: 'text', public: true },
  { key: 'adresa', label: 'Adresa', type: 'text', public: true, search: true },
  { key: 'web', label: 'Web stranica', type: 'url', public: true },
  { key: 'email', label: 'E-mail', type: 'email', public: true },
  { key: 'telefon', label: 'Telefon', type: 'text', public: true },
  { key: 'izvor', label: 'Izvor podatka', type: 'url', public: false },
];
const TZ = [
  { naziv: 'Turistička zajednica Hercegovačko-neretvanskog kantona', razina: 'Kanton', opcina: 'Cijeli kanton', status: 'Aktivna', web: 'https://hercegovina.ba', izvor: 'https://hercegovina.ba/wp-content/uploads/2026/06/Uredba-o-clanarinama-u-Turistickim-zajednicama-HNK.pdf' },
  { naziv: 'Turistička zajednica Općine Čitluk', razina: 'Općina', opcina: 'Čitluk', status: 'Aktivna', izvor: 'https://brotnjo.info/?p=110533' },
  { naziv: 'Turistička zajednica Grada Konjica', razina: 'Grad', opcina: 'Konjic', status: 'U osnivanju', aktOsnivanja: 'Nacrt odluke Gradskog vijeća Konjic (2025)', izvor: 'https://konjic.ba/ba/oglasi/download/858_d25aea50c31adde80099f16e77d5029a.html' },
];

/* ── F2-20 plan i izvještaj nadzora ── */
const PODRUCJA = ['Neradna nedjelja i praznici', 'Radno vrijeme', 'Isticanje cijena', 'Izdavanje računa', 'Ugostiteljstvo', 'Smještaj i kategorizacija', 'Zaštita potrošača', 'Zaštita okoliša'];
const PLAN_FIELDS = [
  { key: 'godina', label: 'Godina', type: 'integer', required: true, public: true, filter: false, list: true },
  { key: 'podrucje', label: 'Područje nadzora', type: 'select', options: PODRUCJA, required: true, public: true, filter: true, list: true, search: true },
  { key: 'inspekcija', label: 'Inspekcija', type: 'select', options: ['Tržišna', 'Turistička / ugostiteljska', 'Okolišna'], required: true, public: true, filter: true, list: true },
  { key: 'kvartal', label: 'Period', type: 'select', options: ['Cijela godina', 'I kvartal', 'II kvartal', 'III kvartal', 'IV kvartal', 'Turistička sezona'], public: true, list: true },
  { key: 'planirano', label: 'Planirani broj nadzora', type: 'integer', required: true, public: true, list: true },
  { key: 'propis', label: 'Propis', type: 'text', public: true },
  { key: 'cilj', label: 'Cilj nadzora', type: 'longtext', public: true },
];
const IZVJ_FIELDS = [
  { key: 'godina', label: 'Godina', type: 'integer', required: true, public: true, list: true },
  { key: 'period', label: 'Period', type: 'text', public: true, list: true },
  { key: 'podrucje', label: 'Područje nadzora', type: 'select', options: PODRUCJA, required: true, public: true, filter: true, list: true, search: true },
  { key: 'inspekcija', label: 'Inspekcija', type: 'select', options: ['Tržišna', 'Turistička / ugostiteljska', 'Okolišna'], required: true, public: true, filter: true, list: true },
  { key: 'nadzora', label: 'Izvršeno nadzora', type: 'integer', public: true, list: true },
  { key: 'subjekataNepravilnosti', label: 'Subjekata s nepravilnostima', type: 'integer', public: true, list: true },
  { key: 'prekrsajnihNaloga', label: 'Prekršajnih naloga', type: 'integer', public: true, list: true },
  { key: 'iznosKazni', label: 'Iznos kazni (KM)', type: 'number', public: true, list: true },
  { key: 'mjere', label: 'Ostale mjere', type: 'longtext', public: true },
  { key: 'izvor', label: 'Izvor', type: 'url', public: true },
];
const PLAN_DEMO = [
  ['Neradna nedjelja i praznici', 'Tržišna', 'Cijela godina', 120], ['Radno vrijeme', 'Tržišna', 'Cijela godina', 80],
  ['Isticanje cijena', 'Tržišna', 'Cijela godina', 150], ['Izdavanje računa', 'Tržišna', 'Cijela godina', 100],
  ['Ugostiteljstvo', 'Turistička / ugostiteljska', 'Turistička sezona', 90], ['Smještaj i kategorizacija', 'Turistička / ugostiteljska', 'Turistička sezona', 60],
  ['Zaštita potrošača', 'Tržišna', 'Cijela godina', 70], ['Zaštita okoliša', 'Okolišna', 'Cijela godina', 40],
].map(([podrucje, inspekcija, kvartal, planirano]) => ({ godina: 2027, podrucje, inspekcija, kvartal, planirano, cilj: 'Demo vrijednost; plan donosi Ministarstvo.' }));

export const m0013_sprint8 = {
  id: '0013_sprint8',
  up: `
ALTER TABLE forms ADD COLUMN IF NOT EXISTS "allowAnonymous" boolean NOT NULL DEFAULT false;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS "protectIdentity" boolean NOT NULL DEFAULT false;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS "routing" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS "anonymous" boolean NOT NULL DEFAULT false;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS "routedTo" text;
ALTER TABLE cases ALTER COLUMN "applicantName" DROP NOT NULL;
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check CHECK ("status" IN ('ZAPRIMLJEN','U_OBRADI','DOPUNA','RIJESEN','ODBIJEN','PROSLIJEDJEN'));

INSERT INTO sectors ("id","tenantId","key","name","sort")
SELECT 'mtto-inspekcija','mtto','Inspekcija','Inspekcijski nadzor',5
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;

INSERT INTO forms ("id","tenantId","slug","title","description","sector","fields","slaDays","attachments","attachmentHint","legalBasis","active","isDemo","allowAnonymous","protectIdentity","routing")
SELECT 'mtto-obrazac-inspekcija','mtto','prijava-inspekciji','Prijava inspekciji',
  'Prijavite rad nedjeljom ili praznikom, radno vrijeme, cijene, račun ili drugo kršenje propisa u trgovini, ugostiteljstvu ili smještaju. Možete prijaviti i anonimno. Prijava koja nije u nadležnosti Ministarstva prosljeđuje se nadležnom organu.',
  'Inspekcija', ${J([
    { key: 'vrsta', label: 'Šta prijavljujete', type: 'select', options: ['Rad nedjeljom ili praznikom', 'Radno vrijeme', 'Cijene (istaknuta i naplaćena)', 'Račun nije izdan', 'Ugostiteljstvo ili smještaj', 'Zaštita okoliša', 'Drugo'], required: true },
    { key: 'opcina', label: 'Općina / grad', type: 'select', options: OPCINE, required: true },
    { key: 'subjekt', label: 'Naziv trgovine ili objekta', type: 'text', required: true },
    { key: 'adresa', label: 'Adresa ili lokacija', type: 'text', required: true },
    { key: 'datum', label: 'Datum zapažanja', type: 'date', required: true },
    { key: 'vrijeme', label: 'Približno vrijeme', type: 'text', help: 'npr. 10:30' },
    { key: 'opis', label: 'Opis', type: 'longtext', required: true, help: 'Šta ste vidjeli; bez ličnih podataka trećih osoba.' },
  ])}, 30, 'OPCIONO', 'Fotografija police, računa ili radnog vremena (ako ih imate).',
  'Zakon o unutrašnjoj trgovini FBiH; Zakon o inspekcijama (nadležnost provjeriti s Ministarstvom)', true, true, true, true,
  ${J([
    { field: 'vrsta', equals: 'Zaštita okoliša', sector: 'Zaštita okoliša', label: 'Okolišna inspekcija' },
    { field: 'vrsta', equals: 'Ugostiteljstvo ili smještaj', sector: 'Inspekcija', label: 'Turistička / ugostiteljska inspekcija' },
    { field: 'vrsta', equals: '*', sector: 'Inspekcija', label: 'Tržišna inspekcija' },
  ])}
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;

${reg('mtto-neradni-dani', 'neradni-dani', 'Neradni dani u trgovini', 'Državni praznici i drugi dani kada prodajni objekti ne rade ili rade po posebnom rasporedu. Nedjelje su neradne po zakonu i nisu posebno upisane.', 'Trgovina', NERADNI_FIELDS, 'naziv', { legalBasis: 'Zakon o unutrašnjoj trgovini FBiH, član 18 (rad nedjeljom i praznikom)' })}
${entries('mtto-neradni-dani', praznici, (r) => r.naziv)}
${reg('mtto-izuzeci-nedjelja', 'izuzeci-neradne-nedjelje', 'Izuzeci od neradne nedjelje', 'Objekti i djelatnosti koji smiju raditi nedjeljom i praznikom, prema zakonu i odlukama nadležnih organa. Popis objavljuje Ministarstvo.', 'Trgovina', IZUZECI_FIELDS, 'vrstaObjekta', { legalBasis: 'Zakon o unutrašnjoj trgovini FBiH, član 18' })}
${reg('mtto-tz', 'turisticke-zajednice', 'Upisnik turističkih zajednica', 'Turistička zajednica kantona te turističke zajednice gradova i općina na području kantona, s kontaktima i statusom.', 'Turizam', TZ_FIELDS, 'naziv', { legalBasis: 'Zakon o turističkim zajednicama i unapređenju turizma u HNK („Službene novine HNK“, br. 5/00 i 3/22)' })}
${entries('mtto-tz', TZ, (r) => `${r.naziv} ${r.opcina}`)}
${reg('mtto-plan-nadzora', 'plan-nadzora', 'Godišnji plan inspekcijskog nadzora', 'Planirani nadzori po područjima i inspekcijama za tekuću godinu.', 'Inspekcija', PLAN_FIELDS, 'podrucje', { isDemo: true, legalBasis: 'Plan rada inspekcije (donosi Ministarstvo)' })}
${entries('mtto-plan-nadzora', PLAN_DEMO, (r) => r.podrucje, true)}
${reg('mtto-izvjestaj-nadzora', 'izvjestaj-nadzora', 'Izvještaj o inspekcijskom nadzoru', 'Izvršeni nadzori, utvrđene nepravilnosti, prekršajni nalozi i iznosi kazni po područjima.', 'Inspekcija', IZVJ_FIELDS, 'podrucje', { legalBasis: 'Izvještaj o radu inspekcije' })}
${entries('mtto-izvjestaj-nadzora', [{
    godina: 2024, period: 'Novembar 2024. (prvi nadzori nakon početka primjene)', podrucje: 'Neradna nedjelja i praznici', inspekcija: 'Tržišna',
    subjekataNepravilnosti: 28, prekrsajnihNaloga: 52, iznosKazni: 62000,
    mjere: 'Broj izvršenih nadzora nije objavljen; upisan je broj prekršajnih naloga. Ponovljeni nadzori pokazali su usklađivanje radnog vremena.',
    izvor: 'https://www.hercegovina.info/vijesti/bih/neradna-nedjelja-ostaje-na-snazi-iz-hnz-a-najavili-nastavak-kontrola-trgovina/264237/',
  }], (r) => r.podrucje)}
`,
};
