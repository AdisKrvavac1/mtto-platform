/**
 * F2-06: jezici portala: bosanski (izvornik), hrvatski i engleski. Hrvatski dobija prevedeno sučelje
 * (riječi koje se razlikuju), engleski prevedeno sučelje i prijevod objava gdje postoji.
 */
export const LANGS = [
  { code: 'bs', label: 'BS', name: 'Bosanski', html: 'bs', prefix: 'bs' },
  { code: 'hr', label: 'HR', name: 'Hrvatski', html: 'hr', prefix: 'hr' },
  { code: 'en', label: 'EN', name: 'English', html: 'en', prefix: 'en' },
] as const;
export type Lang = (typeof LANGS)[number]['code'];
export const DEFAULT_LANG: Lang = 'bs';
export const LANG_COOKIE = 'mtto_lang';
export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);
export const byPrefix = (p: string) => LANGS.find((l) => l.prefix === p.toLowerCase());
/** Ranije podržani prefiksi (srpski, ćirilica): preusmjeravaju na stranicu bez prefiksa. */
export const RETIRED_PREFIXES = ['sr', 'sr-cyrl'];
/** Putanja bez prefiksa jezika (/en/vijesti → /vijesti). */
export function stripLang(path: string) {
  const [, first, ...rest] = path.split('/');
  return first && (byPrefix(first) || RETIRED_PREFIXES.includes(first.toLowerCase())) ? `/${rest.join('/')}` : path;
}
/** Jezik sadržaja za API (prijevod postoji samo za engleski). */
export const contentLang = (l: Lang) => (l === 'en' ? 'en' : null);

/* ── sučelje ── */
type Tr = { hr?: string; en: string };
const D: Record<string, Tr> = {
  'Naslovna': { en: 'Home' }, 'Vijesti': { en: 'News' }, 'O nama': { en: 'About us' }, 'Kontakt': { en: 'Contact' },
  'E-usluge i registri': { en: 'E-services & registers' }, 'E-usluge': { en: 'E-services' }, 'Registri': { en: 'Registers' },
  'Natječaji': { en: 'Calls' }, 'Javni pozivi': { en: 'Public calls' }, 'Propisi i obrasci': { en: 'Laws & forms' },
  'Trgovina': { en: 'Trade' }, 'Turizam i baština': { en: 'Tourism & heritage' }, 'Turizam': { en: 'Tourism' }, 'Zaštita okoliša': { hr: 'Zaštita okoliša', en: 'Environment' },
  'Okoliš': { en: 'Environment' }, 'Rizici': { en: 'Risks' }, 'Brzi pristup': { en: 'Quick access' },
  'Centar e-usluga': { en: 'E-service centre' }, 'Elektronski zahtjevi': { hr: 'Elektronički zahtjevi', en: 'Online applications' },
  'Životne situacije': { en: 'Life situations' }, 'Transparentnost': { en: 'Transparency' }, 'Svi registri': { en: 'All registers' },
  'Okolišne dozvole': { en: 'Environmental permits' }, 'Ugostiteljski objekti': { en: 'Hospitality establishments' },
  'Turistički vodiči': { en: 'Tourist guides' }, 'Turističke zajednice': { en: 'Tourist boards' }, 'Upravljanje otpadom': { en: 'Waste management' },
  'Boravišna taksa': { en: 'Tourist tax' }, 'Kvalitet zraka': { hr: 'Kvaliteta zraka', en: 'Air quality' },
  'Eko-rizik HNK': { en: 'Eco-risk HNK' }, 'Krizni prikaz': { en: 'Crisis view' }, 'GIS karta': { hr: 'GIS karta', en: 'GIS map' },
  'Interaktivna GIS karta': { en: 'Interactive GIS map' }, 'Prijava incidenta': { en: 'Report an incident' }, 'Prijavi incident': { en: 'Report an incident' },
  'Prijava ekološkog incidenta': { en: 'Report an environmental incident' }, 'Zaštićena područja': { en: 'Protected areas' },
  'Foto albumi': { en: 'Photo albums' }, 'Foto album': { en: 'Photo album' }, 'Destinacije': { en: 'Destinations' }, 'Sve destinacije': { en: 'All destinations' },
  'Baština i priroda': { en: 'Heritage & nature' }, 'Saznaj više': { hr: 'Saznaj više', en: 'Learn more' }, 'Otvori kartu': { en: 'Open the map' },
  'Otvori Eko-rizik': { en: 'Open Eco-risk' }, 'Uživo': { en: 'Live' }, 'Eko-alarm': { en: 'Eco-alarm' },
  'Prijava za službenike': { en: 'Staff sign-in' }, 'Glavna navigacija': { en: 'Main navigation' }, 'Jezik': { en: 'Language' }, 'Meni': { en: 'Menu' },
  'Otvori meni': { en: 'Open menu' }, 'Zatvori meni': { en: 'Close menu' }, 'Preskoči na sadržaj': { hr: 'Preskoči na sadržaj', en: 'Skip to content' },
  'Pretraga portala': { en: 'Search the portal' }, 'Pretraga vijesti, propisa, registara, usluga': { en: 'Search news, laws, registers, services' }, 'Traži': { en: 'Search' },
  'Službeni portal Ministarstva': { en: 'Official portal of the Ministry' }, 'Hercegovačko-neretvanski kanton': { en: 'Herzegovina-Neretva Canton' },
  'Zrak Mostar': { en: 'Air Mostar' }, 'Eko-rizik': { en: 'Eco-risk' }, 'uobičajeno stanje': { en: 'normal' }, 'pojačan oprez': { en: 'increased caution' }, 'visok rizik': { en: 'high risk' },
  // podnaslovi u meniju
  'Registri, obrasci i javni uvidi na jednom mjestu.': { en: 'Registers, forms and public consultations in one place.' },
  'Podnesite zahtjev i pratite status predmeta.': { en: 'Apply online and track your case.' },
  'Otvoreni pozivi, rokovi i online prijava.': { en: 'Open calls, deadlines and online applications.' },
  'Zakoni, pravilnici i obrasci zahtjeva.': { en: 'Laws, regulations and application forms.' },
  'Budžet, nabavke i pristup informacijama.': { en: 'Budget, procurement and access to information.' },
  'Šta vam treba, korak po korak.': { hr: 'Što vam treba, korak po korak.', en: 'What you need, step by step.' },
  'Pretraga, CSV i otvoreni podaci.': { en: 'Search, CSV and open data.' }, 'Javni registar izdatih dozvola.': { en: 'Public register of issued permits.' },
  'Kategorizirani smještaj, izvoz u CSV.': { en: 'Categorised accommodation, CSV export.' }, 'Stručni ispit i licenciranje.': { en: 'Exam and licensing.' },
  'Upisnik i kontakti.': { en: 'Directory and contacts.' }, 'Registar operatera otpada.': { en: 'Register of waste operators.' },
  'Indeks po općinama, pragovi i prognoza.': { en: 'Index by municipality, thresholds and forecast.' },
  'Prijavite deponiju, požar ili zagađenje.': { en: 'Report a dump site, fire or pollution.' },
  'Požari, poplave, klizišta i kvalitet zraka.': { en: 'Fires, floods, landslides and air quality.' },
  'Dozvole, objekti i zaštićena područja na jednoj karti.': { en: 'Permits, establishments and protected areas on one map.' },
  'Deponija, požar ili zagađenje vode: pošaljite lokaciju i fotografiju.': { en: 'Dump site, fire or water pollution: send the location and a photo.' },
  // podnožje
  'Resori i područja': { en: 'Areas of work' }, 'Unutarnja trgovina': { en: 'Domestic trade' },
  'Turizam i ugostiteljstvo': { en: 'Tourism & hospitality' }, 'Zaštita okoliša i prirode': { en: 'Environment & nature' },
  'Javni pozivi i natječaji': { en: 'Public calls' }, 'Eko-alarm prijava incidenta': { en: 'Eco-alarm incident report' },
  'Transparentnost i pristup informacijama': { en: 'Transparency & access to information' }, 'Sjedište i kontakt': { en: 'Address & contact' },
  'Pon – pet, 08:00 – 16:00': { en: 'Mon – Fri, 08:00 – 16:00' }, 'Uvjeti korištenja': { en: 'Terms of use' },
  'Politika privatnosti': { en: 'Privacy policy' }, 'Karta portala': { en: 'Site map' }, 'Sva prava zadržana.': { en: 'All rights reserved.' },
  'Ministarstvo trgovine, turizma i zaštite okoliša HNK': { en: 'Ministry of Trade, Tourism and Environmental Protection of HNC' },
  'Službeni portal Ministarstva nadležnog za unutarnju trgovinu, razvoj održivog turizma i očuvanje prirodne baštine sliva Neretve i jadranskog primorja.': {
    en: 'Official portal of the Ministry responsible for domestic trade, sustainable tourism and the natural heritage of the Neretva basin and the Adriatic coast.',
  },
  // sadržaj objava
  'Ovaj tekst je dostupan samo na bosanskom jeziku.': { en: 'This article is available in Bosnian only.' },
  'Pročitajte na engleskom': { en: 'Read in English' },
};

/** Prijevod teksta sučelja; nepoznat tekst ostaje izvorni. */
export function t(lang: Lang, bs: string): string {
  if (lang === 'bs') return bs;
  const e = D[bs];
  if (lang === 'en') return e?.en ?? bs;
  return e?.hr ?? bs;
}
export const translator = (lang: Lang) => (s: string) => t(lang, s);
export const htmlLang = (l: Lang) => LANGS.find((x) => x.code === l)!.html;
