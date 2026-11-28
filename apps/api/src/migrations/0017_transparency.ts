/**
 * F2-10: pristup informacijama (ZOSPI FBiH) i transparentnost.
 *
 * - Obrazac „Zahtjev za pristup informacijama“ (rok 15 dana, čl. 14 ZOSPI FBiH) kroz e-pisarnicu.
 * - Registri u registry builderu: budžet, javne nabavke i indeks-registar informacija (čl. 20 ZOSPI FBiH).
 *   Iznosi budžeta i nabavke su demo dok ih Ministarstvo ne upiše; indeks-registar je nacrt iz sadržaja portala.
 */
const J = (x: unknown) => `$j$${JSON.stringify(x)}$j$::jsonb`;

const reg = (id: string, slug: string, name: string, description: string, sector: string, fields: unknown[], titleField: string, legalBasis: string, isDemo: boolean) => `
INSERT INTO registries ("id","tenantId","slug","name","description","sector","fields","titleField","geo","public","legalBasis","isDemo")
SELECT '${id}','mtto','${slug}',$t$${name}$t$,$t$${description}$t$,'${sector}',${J(fields)},'${titleField}',false,true,$t$${legalBasis}$t$,${isDemo}
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;`;
const entries = (registryId: string, rows: Record<string, unknown>[], search: (r: any) => string, isDemo: boolean) => rows.map((r, i) => `
INSERT INTO registry_entries ("id","tenantId","registryId","data","searchText","isDemo")
SELECT '${registryId}-${i + 1}','mtto','${registryId}',${J(r)},$s$${search(r).toLowerCase()}$s$,${isDemo}
WHERE EXISTS (SELECT 1 FROM registries WHERE "id"='${registryId}') ON CONFLICT DO NOTHING;`).join('');

const BUDZET = [
  { key: 'godina', label: 'Godina', type: 'integer', required: true, public: true, filter: true, list: true },
  { key: 'pozicija', label: 'Pozicija / program', type: 'text', required: true, public: true, list: true, search: true },
  { key: 'vrsta', label: 'Vrsta', type: 'select', options: ['Plate i naknade', 'Materijalni troškovi', 'Grantovi i transferi', 'Kapitalni izdaci', 'Ostalo'], public: true, filter: true, list: true },
  { key: 'planirano', label: 'Planirano (KM)', type: 'number', required: true, public: true, list: true },
  { key: 'izvrseno', label: 'Izvršeno (KM)', type: 'number', public: true, list: true },
  { key: 'izvor', label: 'Izvor (službene novine, izvještaj)', type: 'url', public: true },
];
const budzet = [
  ['Plate i naknade zaposlenih', 'Plate i naknade', 1450000, 1418000],
  ['Materijalni troškovi i usluge', 'Materijalni troškovi', 320000, 287500],
  ['Sufinansiranje projekata u turizmu', 'Grantovi i transferi', 100000, 92000],
  ['Sufinansiranje projekata zaštite okoliša', 'Grantovi i transferi', 60000, 29700],
  ['Oprema i informatička oprema', 'Kapitalni izdaci', 40000, 12300],
].map(([pozicija, vrsta, planirano, izvrseno]) => ({ godina: 2026, pozicija, vrsta, planirano, izvrseno }));

const NABAVKE = [
  { key: 'godina', label: 'Godina', type: 'integer', required: true, public: true, filter: true, list: true },
  { key: 'predmet', label: 'Predmet nabavke', type: 'text', required: true, public: true, list: true, search: true },
  { key: 'postupak', label: 'Vrsta postupka', type: 'select', options: ['Otvoreni postupak', 'Konkurentski zahtjev', 'Pregovarački postupak', 'Direktni sporazum'], public: true, filter: true, list: true },
  { key: 'procijenjeno', label: 'Procijenjena vrijednost (KM bez PDV-a)', type: 'number', public: true, list: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Planirano', 'U toku', 'Ugovoreno', 'Poništeno'], required: true, public: true, filter: true, list: true },
  { key: 'dobavljac', label: 'Dobavljač', type: 'text', public: true, search: true },
  { key: 'ugovoreno', label: 'Ugovorena vrijednost (KM bez PDV-a)', type: 'number', public: true },
  { key: 'datumUgovora', label: 'Datum ugovora', type: 'date', public: true },
  { key: 'link', label: 'Obavještenje na e-Nabavkama', type: 'url', public: true },
];
const nabavke = [
  { godina: 2026, predmet: 'Uredski materijal', postupak: 'Konkurentski zahtjev', procijenjeno: 18000, status: 'Ugovoreno', dobavljac: 'Primjer d.o.o. (demo)', ugovoreno: 16450, datumUgovora: '2026-03-12' },
  { godina: 2026, predmet: 'Održavanje službenih vozila', postupak: 'Direktni sporazum', procijenjeno: 6000, status: 'Ugovoreno', dobavljac: 'Auto-servis Primjer (demo)', ugovoreno: 5800, datumUgovora: '2026-02-03' },
  { godina: 2026, predmet: 'Stručna podloga za zaštićeno područje (primjer)', postupak: 'Otvoreni postupak', procijenjeno: 45000, status: 'U toku' },
];

const INDEKS = [
  { key: 'informacija', label: 'Vrsta informacije', type: 'text', required: true, public: true, list: true, search: true },
  { key: 'opis', label: 'Opis', type: 'longtext', public: true, search: true },
  { key: 'oblik', label: 'Oblik', type: 'select', options: ['Elektronski', 'Papirni', 'Elektronski i papirni'], public: true, filter: true, list: true },
  { key: 'gdje', label: 'Gdje je dostupna', type: 'text', public: true, list: true },
  { key: 'dostupnost', label: 'Dostupnost', type: 'select', options: ['Javno objavljeno', 'Na zahtjev', 'Ograničeno (izuzetak po zakonu)'], public: true, filter: true, list: true },
];
const indeks = [
  ['Propisi iz nadležnosti Ministarstva', 'Zakoni, pravilnici, odluke i uputstva.', 'Elektronski', '/propisi', 'Javno objavljeno'],
  ['Vijesti, saopćenja i obavještenja', 'Informacije o radu Ministarstva.', 'Elektronski', '/vijesti', 'Javno objavljeno'],
  ['Javni pozivi i liste korisnika sredstava', 'Uslovi poziva, rokovi i dodijeljena sredstva.', 'Elektronski', '/javni-pozivi', 'Javno objavljeno'],
  ['Registar ugostiteljskih objekata', 'Kategorizirani objekti s kategorijom i rokom važenja.', 'Elektronski', '/registri/ugostiteljski-objekti', 'Javno objavljeno'],
  ['Registar okolišnih dozvola', 'Izdate okolišne dozvole i rok važenja.', 'Elektronski', '/registri/okolisne-dozvole', 'Javno objavljeno'],
  ['Plan i izvještaj inspekcijskog nadzora', 'Planirani i izvršeni nadzori po područjima.', 'Elektronski', '/inspekcija', 'Javno objavljeno'],
  ['Budžet i izvršenje budžeta Ministarstva', 'Planirana i utrošena sredstva po pozicijama.', 'Elektronski i papirni', '/registri/budzet', 'Javno objavljeno'],
  ['Javne nabavke Ministarstva', 'Plan nabavki, postupci i zaključeni ugovori.', 'Elektronski i papirni', '/registri/javne-nabavke', 'Javno objavljeno'],
  ['Spisi predmeta i rješenja', 'Predmeti stranaka u upravnom postupku.', 'Elektronski i papirni', 'Pisarnica Ministarstva', 'Na zahtjev'],
  ['Lični podaci stranaka i zaposlenih', 'Podaci zaštićeni propisima o zaštiti ličnih podataka.', 'Elektronski i papirni', 'Ministarstvo', 'Ograničeno (izuzetak po zakonu)'],
].map(([informacija, opis, oblik, gdje, dostupnost]) => ({ informacija, opis, oblik, gdje, dostupnost }));

const ZOSPI = 'Zakon o slobodi pristupa informacijama u FBiH (Sl. novine FBiH 32/01, 48/11)';

export const m0017_transparency = {
  id: '0017_transparency',
  up: `
INSERT INTO forms ("id","tenantId","slug","title","description","sector","fields","slaDays","attachments","attachmentHint","legalBasis","active","isDemo")
SELECT 'mtto-obrazac-zospi','mtto','zahtjev-za-pristup-informacijama','Zahtjev za pristup informacijama',
  $t$Svako fizičko i pravno lice ima pravo pristupa informacijama koje su pod kontrolom Ministarstva. Odgovor dobijate u roku od 15 dana. Za ličnu informaciju o sebi Ministarstvo može tražiti dokaz identiteta.$t$,
  'Opće', ${J([
    { key: 'vrsta', label: 'Vrsta informacije', type: 'select', options: ['Informacija o radu Ministarstva', 'Lična informacija o meni'], required: true },
    { key: 'opis', label: 'Koju informaciju tražite', type: 'longtext', required: true, help: 'Opišite informaciju dovoljno da je Ministarstvo može pronaći: naziv dokumenta, period, predmet.' },
    { key: 'nacin', label: 'Kako želite dobiti informaciju', type: 'select', options: ['E-mailom', 'Poštom', 'Uvid u prostorijama Ministarstva'], required: true },
    { key: 'adresa', label: 'Adresa za dostavu poštom', type: 'text', help: 'Samo ako ste odabrali dostavu poštom.' },
  ])}, 15, 'OPCIONO', 'Prilog nije obavezan (npr. kopija ranijeg dopisa).',
  $t$${ZOSPI}, čl. 11 (zahtjev) i čl. 14 (rok od 15 dana)$t$, true, false
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;

${reg('mtto-budzet', 'budzet', 'Budžet Ministarstva', 'Planirana i izvršena sredstva Ministarstva po pozicijama i godinama.', 'Opće', BUDZET, 'pozicija', 'Zakon o budžetima u FBiH; budžet HNK za tekuću godinu', true)}
${entries('mtto-budzet', budzet, (r) => r.pozicija, true)}
${reg('mtto-nabavke', 'javne-nabavke', 'Javne nabavke Ministarstva', 'Plan nabavki, postupci i zaključeni ugovori. Obavještenja o nabavkama objavljuju se i na portalu e-Nabavke.', 'Opće', NABAVKE, 'predmet', 'Zakon o javnim nabavkama BiH (Sl. glasnik BiH 39/14, 59/22)', true)}
${entries('mtto-nabavke', nabavke, (r) => `${r.predmet} ${r.dobavljac ?? ''}`, true)}
${reg('mtto-indeks-registar', 'indeks-registar', 'Indeks-registar informacija', 'Vrste informacija koje Ministarstvo posjeduje, njihov oblik i gdje su dostupne. Nacrt iz sadržaja portala; potvrđuje službenik za informisanje.', 'Opće', INDEKS, 'informacija', `${ZOSPI}, čl. 20`, false)}
${entries('mtto-indeks-registar', indeks, (r) => `${r.informacija} ${r.opis}`, false)}

-- životna situacija „Tražim informaciju“ dobija obrazac ZOSPI (samo ako je nije neko već uredio)
UPDATE life_events SET "steps" = ${J([
    { title: 'Provjerite da li je informacija već objavljena', text: 'Pretražite propise, registre i vijesti; indeks-registar pokazuje koje informacije Ministarstvo posjeduje i gdje su dostupne.', links: [{ label: 'Pretraga portala', url: '/pretraga' }, { label: 'Indeks-registar informacija', url: '/registri/indeks-registar' }] },
    { title: 'Podnesite zahtjev za pristup informacijama', text: 'Zahtjev šaljete elektronski i odmah dobijate broj predmeta. Ministarstvo odgovara u roku od 15 dana.', links: [{ label: 'Zahtjev za pristup informacijama', url: '/e-usluge/obrasci/zahtjev-za-pristup-informacijama' }] },
    { title: 'Kratko pitanje bez formalnog zahtjeva', text: 'Za opće pitanje ili savjet pošaljite upit Ministarstvu.', links: [{ label: 'Upit Ministarstvu', url: '/e-usluge/obrasci/upit-ministarstvu' }] },
  ])}, "links" = ${J([{ label: 'Transparentnost i pristup informacijama', url: '/transparentnost' }, { label: 'O Ministarstvu i kontakti', url: '/o-nama' }])}
WHERE "id"='mtto-ls-informacija' AND "updatedAt" = "createdAt";
`,
};
