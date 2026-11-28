/**
 * F2-08: informacijska arhitektura po životnim situacijama.
 * Situacija povezuje korake, obrasce, propise, registre i kontakte koji već postoje na portalu.
 * Sadržaj uređuje Ministarstvo u CMS-u; dok ga ne potvrdi, stranica nosi oznaku „u pripremi“ (verified=false).
 */
const rls = (t: string) => `
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`;
const J = (x: unknown) => `$j$${JSON.stringify(x)}$j$::jsonb`;
const T = (s: string) => `$t$${s}$t$`;

type Step = { title: string; text: string; links?: { label: string; url: string }[] };
type Seed = { id: string; slug: string; audience: 'PRIVREDA' | 'GRADJANI'; title: string; summary: string; icon: string; sector: string | null; steps: Step[]; links: { label: string; url: string }[]; contact: string; keywords: string };

const SEED: Seed[] = [
  {
    id: 'mtto-ls-ugostiteljstvo', slug: 'otvaram-ugostiteljski-objekat', audience: 'PRIVREDA', icon: 'restaurant', sector: 'Turizam',
    title: 'Otvaram ugostiteljski objekat', summary: 'Šta treba za kategorizaciju hotela, apartmana ili restorana i upis u registar ugostiteljskih objekata.',
    keywords: 'restoran hotel apartman smještaj motel kafić kategorizacija zvjezdice rješenje',
    steps: [
      { title: 'Registrujte djelatnost', text: 'Ugostiteljska djelatnost se registruje kod općine ili grada (obrt) ili u sudskom registru (privredno društvo). Uslove i nadležni organ provjerite prije podnošenja zahtjeva.' },
      { title: 'Podnesite zahtjev za kategorizaciju', text: 'Zahtjev s prilozima podnosite elektronski. Odmah dobijate broj predmeta i kod za praćenje.', links: [{ label: 'Zahtjev za kategorizaciju', url: '/e-usluge/obrasci/zahtjev-za-kategorizaciju' }] },
      { title: 'Komisija obilazi objekat', text: 'Komisija provjerava minimalne uslove i uslove za kategoriju prema pravilniku. Ako nešto nedostaje, predmet ide na dopunu i rok se zaustavlja.', links: [{ label: 'Status predmeta', url: '/e-usluge/status' }] },
      { title: 'Rješenje i upis u registar', text: 'Nakon rješenja objekat se upisuje u javni registar ugostiteljskih objekata s kategorijom i rokom važenja.', links: [{ label: 'Registar ugostiteljskih objekata', url: '/registri/ugostiteljski-objekti' }] },
    ],
    links: [{ label: 'Propisi o kategorizaciji', url: '/pretraga?q=kategorizacija&vrsta=DOKUMENT' }, { label: 'Boravišna taksa i prijava gostiju', url: '/turizam-i-bastina/boravisna-taksa' }],
    contact: 'Sektor za turizam i ugostiteljstvo',
  },
  {
    id: 'mtto-ls-smjestaj', slug: 'iznajmljujem-smjestaj', audience: 'PRIVREDA', icon: 'bed', sector: 'Turizam',
    title: 'Iznajmljujem smještaj gostima', summary: 'Kategorizacija privatnog smještaja, prijava gostiju i boravišna taksa.',
    keywords: 'privatni smještaj apartman soba kuća za odmor iznajmljivač gosti prijava boravišna taksa',
    steps: [
      { title: 'Kategorizacija smještaja', text: 'Prije iznajmljivanja smještaj mora biti kategoriziran. Zahtjev se podnosi elektronski.', links: [{ label: 'Zahtjev za kategorizaciju', url: '/e-usluge/obrasci/zahtjev-za-kategorizaciju' }] },
      { title: 'Prijava gostiju', text: 'Goste prijavljujete putem sistema prijava.ba, u roku koji propisuje zakon.', links: [{ label: 'Boravišna taksa i prijava gostiju', url: '/turizam-i-bastina/boravisna-taksa' }] },
      { title: 'Boravišna taksa', text: 'Taksu obračunavate i uplaćujete prema propisima kantona; turistička zajednica daje uputstva.', links: [{ label: 'Turističke zajednice', url: '/registri/turisticke-zajednice' }] },
    ],
    links: [{ label: 'Registar ugostiteljskih objekata', url: '/registri/ugostiteljski-objekti' }],
    contact: 'Sektor za turizam i ugostiteljstvo; turistička zajednica općine',
  },
  {
    id: 'mtto-ls-sufinansiranje', slug: 'trazim-sufinansiranje-projekta', audience: 'PRIVREDA', icon: 'payments', sector: null,
    title: 'Tražim sufinansiranje projekta ili manifestacije', summary: 'Javni pozivi Ministarstva za turizam i zaštitu okoliša: rokovi, online prijava i rezultati.',
    keywords: 'grant poticaj subvencija sufinansiranje manifestacija festival udruženje javni poziv natječaj',
    steps: [
      { title: 'Pronađite otvoren poziv', text: 'Svi pozivi s rokovima, uslovima i iznosima su na jednom mjestu.', links: [{ label: 'Javni pozivi', url: '/javni-pozivi' }] },
      { title: 'Prijavite se online', text: 'Dok je poziv otvoren, prijava se podnosi elektronski uz priloge. Dobijate broj predmeta za praćenje.' },
      { title: 'Pratite status i rezultate', text: 'Nakon ocjene na stranici poziva objavljuje se lista korisnika s iznosima.', links: [{ label: 'Status prijave', url: '/e-usluge/status' }] },
    ],
    links: [], contact: 'Sektor za turizam; Sektor za zaštitu okoliša',
  },
  {
    id: 'mtto-ls-trgovina', slug: 'radno-vrijeme-trgovine', audience: 'PRIVREDA', icon: 'storefront', sector: 'Trgovina',
    title: 'Vodim trgovinu: radno vrijeme i neradna nedjelja', summary: 'Kada trgovine ne smiju raditi, koji su izuzeci i šta kontroliše inspekcija.',
    keywords: 'trgovina prodavnica market radno vrijeme nedjelja praznik izuzetak benzinska pumpa apoteka',
    steps: [
      { title: 'Provjerite kalendar neradnih dana', text: 'Nedjelje i praznici kada trgovine ne rade, s kalendarom koji se može dodati u telefon.', links: [{ label: 'Neradna nedjelja i praznici', url: '/trgovina/neradni-dani' }] },
      { title: 'Provjerite izuzetke', text: 'Neke djelatnosti i lokacije smiju raditi i nedjeljom. Popis izuzetaka objavljuje Ministarstvo.', links: [{ label: 'Izuzeci', url: '/registri/izuzeci-neradne-nedjelje' }] },
      { title: 'Nadzor', text: 'Poštivanje radnog vremena kontroliše tržišna inspekcija; rezultati kontrola se objavljuju.', links: [{ label: 'Plan i izvještaj nadzora', url: '/inspekcija' }] },
    ],
    links: [{ label: 'Propisi o trgovini', url: '/pretraga?q=trgovina&vrsta=DOKUMENT' }], contact: 'Sektor za trgovinu',
  },
  {
    id: 'mtto-ls-vodic', slug: 'postajem-turisticki-vodic', audience: 'PRIVREDA', icon: 'tour', sector: 'Turizam',
    title: 'Postajem turistički vodič', summary: 'Stručni ispit, licenca i rad turističkog vodiča u kantonu.',
    keywords: 'vodič turistički vodič ispit licenca iskaznica polaganje',
    steps: [
      { title: 'Prijava za stručni ispit', text: 'Uslove, rokove i program ispita pogledajte na stranici turističkih vodiča.', links: [{ label: 'Turistički vodiči', url: '/turisticki-vodici' }] },
      { title: 'Polaganje ispita', text: 'Ispit se polaže pred komisijom Ministarstva.' },
      { title: 'Licenca i iskaznica', text: 'Nakon položenog ispita izdaje se iskaznica turističkog vodiča.' },
    ],
    links: [], contact: 'Sektor za turizam i ugostiteljstvo',
  },
  {
    id: 'mtto-ls-okolisna-dozvola', slug: 'trebam-okolisnu-dozvolu', audience: 'PRIVREDA', icon: 'factory', sector: 'Zaštita okoliša',
    title: 'Trebam okolišnu dozvolu', summary: 'Kada je potrebna okolišna dozvola, kako se podnosi zahtjev i gdje se objavljuju izdate dozvole.',
    keywords: 'okolišna dozvola pogon postrojenje emisije otpad procjena utjecaja na okoliš studija',
    steps: [
      { title: 'Provjerite da li vam treba dozvola', text: 'Obaveza zavisi od vrste i kapaciteta pogona prema propisima o zaštiti okoliša. Nadležnost kantona i Federacije provjerite prije podnošenja.' },
      { title: 'Podnesite zahtjev', text: 'Zahtjev s dokumentacijom podnosi se Ministarstvu; za dio postrojenja potrebna je i procjena utjecaja na okoliš.' },
      { title: 'Javni uvid i rješenje', text: 'Izdate dozvole upisuju se u javni registar s rokom važenja.', links: [{ label: 'Registar okolišnih dozvola', url: '/registri/okolisne-dozvole' }] },
    ],
    links: [{ label: 'Propisi o zaštiti okoliša', url: '/pretraga?q=okolis&vrsta=DOKUMENT' }], contact: 'Sektor za zaštitu okoliša',
  },
  {
    id: 'mtto-ls-zagadjenje', slug: 'prijavljujem-zagadenje', audience: 'GRADJANI', icon: 'report', sector: 'Zaštita okoliša',
    title: 'Želim prijaviti zagađenje ili divlju deponiju', summary: 'Prijava s fotografijom i lokacijom, praćenje postupanja i javna karta prijava.',
    keywords: 'deponija smeće otpad zagađenje voda rijeka zrak dim požar prijava',
    steps: [
      { title: 'Pošaljite prijavu', text: 'Označite lokaciju na karti, dodajte fotografiju i kratak opis. Ime nije obavezno.', links: [{ label: 'Prijava ekološkog incidenta', url: '/eko-rizik/prijava' }] },
      { title: 'Ministarstvo provjerava', text: 'Prijava ide nadležnom sektoru ili inspekciji. Potvrđene prijave se objavljuju na karti uz obrazloženje.' },
      { title: 'Pratite stanje', text: 'Na karti eko-rizika vidite prijave, požare, vodostaje i upozorenja.', links: [{ label: 'Eko-rizik', url: '/eko-rizik' }] },
    ],
    links: [{ label: 'Kvalitet zraka', url: '/zastita-okolisa/kvalitet-zraka' }], contact: 'Sektor za zaštitu okoliša',
  },
  {
    id: 'mtto-ls-nepravilnost', slug: 'prijavljujem-nepravilnost-u-trgovini', audience: 'GRADJANI', icon: 'gavel', sector: 'Inspekcija',
    title: 'Primijetio/la sam nepravilnost u trgovini ili ugostiteljstvu', summary: 'Pogrešne cijene, rad u neradnu nedjelju, neispravna roba ili usluga: kako prijaviti inspekciji.',
    keywords: 'cijena račun prevara reklamacija neispravna roba rad nedjeljom inspekcija prijava anonimno',
    steps: [
      { title: 'Prijavite inspekciji', text: 'Prijavu možete poslati s imenom ili anonimno. Kad pošaljete s imenom, identitet je zaštićen.', links: [{ label: 'Prijava inspekciji', url: '/e-usluge/prijava-inspekciji' }] },
      { title: 'Pratite status', text: 'Brojem predmeta i kodom pratite postupanje.', links: [{ label: 'Status predmeta', url: '/e-usluge/status' }] },
    ],
    links: [{ label: 'Neradna nedjelja i praznici', url: '/trgovina/neradni-dani' }, { label: 'Rezultati nadzora', url: '/inspekcija' }], contact: 'Inspekcija',
  },
  {
    id: 'mtto-ls-rizik', slug: 'pratim-zrak-pozare-i-poplave', audience: 'GRADJANI', icon: 'warning', sector: 'Zaštita okoliša',
    title: 'Pratim kvalitet zraka, požare i poplave', summary: 'Trenutno stanje i prognoza za kanton na jednom mjestu.',
    keywords: 'zrak smog prašina požar poplava vodostaj Neretva upozorenje meteoalarm klizište',
    steps: [
      { title: 'Kvalitet zraka', text: 'Indeks po općinama, prekoračenja pragova i prognoza za četiri dana.', links: [{ label: 'Kvalitet zraka', url: '/zastita-okolisa/kvalitet-zraka' }] },
      { title: 'Požari, rijeke i upozorenja', text: 'Satelitska žarišta, protok rijeka, upozorenja FHMZ-a i klizišta na karti.', links: [{ label: 'Eko-rizik', url: '/eko-rizik' }] },
    ],
    links: [], contact: 'Sektor za zaštitu okoliša',
  },
  {
    id: 'mtto-ls-informacija', slug: 'trazim-informaciju-od-ministarstva', audience: 'GRADJANI', icon: 'help', sector: null,
    title: 'Tražim informaciju od Ministarstva', summary: 'Upit Ministarstvu, pristup informacijama i dokumenti koji su već javni.',
    keywords: 'upit pitanje informacija pristup informacijama zahtjev dokument kontakt',
    steps: [
      { title: 'Provjerite da li je informacija već objavljena', text: 'Pretražite propise, registre i vijesti.', links: [{ label: 'Pretraga portala', url: '/pretraga' }] },
      { title: 'Pošaljite upit', text: 'Upit šaljete elektronski i dobijate broj predmeta.', links: [{ label: 'Upit Ministarstvu', url: '/e-usluge/obrasci/upit-ministarstvu' }] },
    ],
    links: [{ label: 'O Ministarstvu i kontakti', url: '/o-nama' }], contact: 'Protokol Ministarstva',
  },
];

export const m0016_life_events = {
  id: '0016_life_events',
  up: `
CREATE TABLE IF NOT EXISTS life_events (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "slug" text NOT NULL,
  "audience" text NOT NULL DEFAULT 'GRADJANI' CHECK ("audience" IN ('GRADJANI','PRIVREDA')),
  "title" text NOT NULL,
  "summary" text NOT NULL DEFAULT '',
  "icon" text NOT NULL DEFAULT 'help',
  "sector" text,
  "steps" jsonb NOT NULL DEFAULT '[]',
  "links" jsonb NOT NULL DEFAULT '[]',
  "contact" text NOT NULL DEFAULT '',
  "keywords" text NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT true,
  "verified" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","slug")
);
${rls('life_events')}

INSERT INTO life_events ("id","tenantId","slug","audience","title","summary","icon","sector","steps","links","contact","keywords","position")
SELECT v.* FROM (VALUES
${SEED.map((s, i) => `  (${T(s.id)},'mtto',${T(s.slug)},'${s.audience}',${T(s.title)},${T(s.summary)},${T(s.icon)},${s.sector ? T(s.sector) : 'NULL'},${J(s.steps)},${J(s.links)},${T(s.contact)},${T(s.keywords)},${i + 1})`).join(',\n')}
) AS v WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto')
ON CONFLICT DO NOTHING;
`,
};
