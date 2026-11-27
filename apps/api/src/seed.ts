/* Početni podaci za MVP. Stvarne objave s mtto.gov.ba (naslovi, slike, prilozi javnog poziva)
 * i jasno označeni DEMO zapisi za registre i propise. Pokretanje: node dist/seed.js [--if-empty] [--reset] */
import { Db, id, SYSTEM_TENANT, withTenant } from './db';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const db = new Db();
const FILES = path.join(__dirname, '..', 'seed-files');
const WP = 'https://mtto.gov.ba/wp-content/uploads/2026/11/';

function demoPdf(title: string): Buffer {
  const esc = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'dj').replace(/[()\\]/g, '');
  const lines = [esc(title), 'DEMO - primjer dokumenta za prezentaciju MTTO platforme', 'Ovo nije sluzbeni dokument Ministarstva.'];
  const content = 'BT /F1 16 Tf 60 760 Td ' + lines.map((l, i) => `${i ? '0 -28 Td ' : ''}(${l}) Tj`).join(' ') + ' ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offs: number[] = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--if-empty') && (await db.count('SELECT count(*) n FROM users')) > 0) {
    console.log('Baza već ima podatke, seed preskočen.');
    return;
  }
  if (args.includes('--reset')) {
    await db.q('TRUNCATE documents, posts, permits, facilities, registry_entries, map_locations, media, audit_log, users');
  }

  // ---- Korisnik ----
  const email = (process.env.ADMIN_EMAIL || 'urednik@mtto.demo').toLowerCase();
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = crypto.randomBytes(9).toString('base64url');
    console.log(`ADMIN_PASSWORD nije postavljen. Privremena lozinka za ${email}: ${password}`);
  }
  if (!(await db.one('SELECT 1 FROM users WHERE "email"=$1', [email]))) {
    await db.insert('users', { id: id(), email, name: process.env.ADMIN_NAME || 'Urednik MTTO', role: 'ADMIN', passwordHash: await bcrypt.hash(password, 10) });
  }

  // ---- Objave (stvarne, s mtto.gov.ba) ----
  const src = (slug: string) => `\n\nIzvorni članak: [mtto.gov.ba](https://mtto.gov.ba/${slug}/)`;
  const poziv = await db.insert('posts', {
    id: id(),
    ...{
      slug: 'javni-poziv-udruzenjima-festivali-2026', type: 'JAVNI_POZIV', category: 'Turizam', status: 'OBJAVLJENO',
      title: 'Javni poziv udruženjima za sufinansiranje festivala i sličnih aktivnosti od značaja za razvoj turizma',
      excerpt: 'Ministarstvo poziva udruženja da podnesu prijave za sufinansiranje festivala i sličnih aktivnosti od značaja za razvoj turizma. Prijave se podnose online do 3. decembra 2026.',
      body: [
        '## O javnom pozivu',
        'Javni poziv se raspisuje na osnovu Odluke Vlade HNK o usvajanju Izmijenjenog programa utroška novčanih sredstava utvrđenih Budžetom HNK. Pravo učešća imaju udruženja koja organizuju festivale i slične aktivnosti od značaja za razvoj turizma.',
        '## Kako se prijaviti',
        '1. Preuzmite tekst javnog poziva, uputstvo i obrasce u prilogu.',
        '2. Popunite online prijavu i učitajte potrebnu dokumentaciju.',
        '3. Nakon slanja dobijate potvrdu s protokolnim brojem prijave na e-mail.',
        '## Rok',
        'Rok za podnošenje prijava je **3. decembar 2026. u 23:59**. Forma se nakon isteka roka automatski zatvara.',
      ].join('\n\n') + src('javni-poziv-udruzenjima-festivali-2026'),
      coverImage: WP + 'javni-poziv-festivali-2026-naslovna-1200x675.jpg',
      publishedAt: new Date('2026-11-18T13:29:48Z'), deadline: new Date('2026-12-03T22:59:00Z'),
      formUrl: 'https://mtto.gov.ba/javni-poziv-za-dodjelu-bespovratnih-finansijskih-sredstava-za-sufinansiranje-festivala/',
      views: 0,
    },
  });
  const files: [string, string, string][] = [
    ['Javni-poziv-neprofitne-2026-BOS.pdf', 'Tekst javnog poziva', 'ODLUKA'],
    ['Uputstvo-za-podnosioce-prijava-BOS.pdf', 'Uputstvo za podnosioce prijava', 'UPUTSTVO'],
    ['Obrazac-1-Prijava-na-Javni-poziv-BOS.docx', 'Obrazac 1 – Prijava na javni poziv', 'OBRAZAC'],
    ['Obrazac-2-Program-projekta-BOS.docx', 'Obrazac 2 – Program projekta', 'OBRAZAC'],
    ['Obrazac-3-Budzet-projekta-BOS.docx', 'Obrazac 3 – Budžet projekta', 'OBRAZAC'],
    ['Obrazac-4-Izjava-podnosioca-prijave-BOS.docx', 'Obrazac 4 – Izjava podnosioca prijave', 'OBRAZAC'],
  ];
  for (const [fn, title, docType] of files) {
    const p = path.join(FILES, fn);
    if (!fs.existsSync(p)) continue;
    const data = fs.readFileSync(p);
    await db.insert('documents', { id: id(), ...{ title, docType, sector: 'Turizam i ugostiteljstvo', issuedAt: new Date('2026-11-18'), fileName: fn, mimeType: MIME[fn.split('.').pop()!], size: data.length, data, postId: poziv.id } });
  }

  const news: any[] = [
    {
      slug: 'od-mocvare-do-mora-prirodna-bastina-kao-osnova-odrzivog-turizma', category: 'Turizam', publishedAt: '2026-11-18T08:50:05Z',
      title: 'Od močvare do mora: prirodna baština kao osnova održivog turizma', coverImage: WP + 'coastrust-neum-zavrsna-konferencija-1-1200x800.jpg',
      excerpt: 'Predstavnici Ministarstva učestvovali su na završnoj konferenciji projekta COASTRUST u Neumu.',
    },
    {
      slug: 'ministar-balavac-na-otvaranju-pravne-klinike-za-ekolosko-pravo-bez-snaznog-pravnog-okvira-nema-odrzivog-razvoja', category: 'Zaštita okoliša', publishedAt: '2026-11-17T09:48:33Z',
      title: 'Ministar Balavac na otvaranju Pravne klinike za ekološko pravo: bez snažnog pravnog okvira nema održivog razvoja', coverImage: WP + 'viber_image_2026-11-17_09-00-57-466-1200x900.jpg',
      excerpt: 'Na Pravnom fakultetu Univerziteta „Džemal Bijedić“ u Mostaru svečano je otvorena Pravna klinika za ekološko pravo.',
    },
    {
      slug: 'ministar-balavac-odrzivi-razvoj-digitalizacija-i-klimatska-otpornost-od-mora-do-planina-buducnost-turizma-u-hnz', category: 'Turizam', publishedAt: '2026-11-11T19:12:38Z',
      title: 'Ministar Balavac: održivi razvoj, digitalizacija i klimatska otpornost od mora do planina – budućnost turizma u HNŽ', coverImage: WP + 'Naslovnica-16-9@1x-1200x675.png',
      excerpt: 'Strategije prilagodbe klimatskim promjenama i jačanje otpornosti destinacija u fokusu završne konferencije.',
    },
    {
      slug: 'ocuvanje-prirode-u-fokusu-potpisan-sporazum-za-zastitu-zemljisnihresursa-u-hnz', category: 'Zaštita okoliša', publishedAt: '2026-11-10T07:01:15Z',
      title: 'Očuvanje prirode u fokusu: potpisan sporazum za zaštitu zemljišnih resursa u HNŽ', coverImage: null,
      excerpt: 'Potpisan je sporazum o saradnji na zaštiti zemljišnih resursa u Hercegovačko-neretvanskom kantonu.',
    },
  ];
  for (const n of news) {
    await db.insert('posts', { id: id(), ...n, type: 'VIJEST', status: 'OBJAVLJENO', publishedAt: new Date(n.publishedAt), body: n.excerpt + src(n.slug) });
  }
  await db.insert('posts', {
    id: id(), ...{
      slug: 'nacrt-demo-obavijest', type: 'SAOPCENJE', category: 'Opće', status: 'NACRT', isDemo: true,
      title: 'Obavijest o radnom vremenu pisarnice (nacrt za demonstraciju)', excerpt: 'Nacrt koji se na prezentaciji objavljuje uživo iz CMS-a.',
      body: 'Primjer obavijesti za demonstraciju objave iz CMS-a.',
    },
  });

  // ---- Propisi i obrasci (DEMO) ----
  const docs: [string, string, string][] = [
    ['Zakon o turizmu (primjer)', 'ZAKON', 'Turizam i ugostiteljstvo'],
    ['Zakon o ugostiteljskoj djelatnosti (primjer)', 'ZAKON', 'Turizam i ugostiteljstvo'],
    ['Zakon o zaštiti okoliša (primjer)', 'ZAKON', 'Zaštita okoliša'],
    ['Zakon o unutrašnjoj trgovini (primjer)', 'ZAKON', 'Trgovina'],
    ['Pravilnik o kategorizaciji ugostiteljskih objekata (primjer)', 'PRAVILNIK', 'Turizam i ugostiteljstvo'],
    ['Pravilnik o pogonima i postrojenjima za koje je obavezna okolišna dozvola (primjer)', 'PRAVILNIK', 'Zaštita okoliša'],
    ['Zahtjev za izdavanje okolišne dozvole (obrazac, primjer)', 'OBRAZAC', 'Zaštita okoliša'],
    ['Zahtjev za kategorizaciju ugostiteljskog objekta (obrazac, primjer)', 'OBRAZAC', 'Turizam i ugostiteljstvo'],
    ['Prijava za stručni ispit za turističkog vodiča (obrazac, primjer)', 'OBRAZAC', 'Turizam i ugostiteljstvo'],
    ['Izvještaj o radu Ministarstva za 2025. godinu (primjer)', 'IZVJESTAJ', 'Opće'],
  ];
  let i = 0;
  for (const [title, docType, sector] of docs) {
    const data = demoPdf(title);
    await db.insert('documents', {
      id: id(), title, docType, sector, number: `DEMO-${String(++i).padStart(3, '0')}`, issuedAt: new Date(2024 + (i % 3), i % 12, 10 + i), fileName: `demo-${i}.pdf`, mimeType: 'application/pdf', size: data.length, data, isDemo: true, description: 'Demo zapis za prezentaciju. Stvarni propisi se unose prilikom migracije sadržaja.',
    });
  }

  // ---- Registar okolišnih dozvola (DEMO, izmišljeni operateri) ----
  const permits = [
    ['UPI/05-23-001/26', 'Primjer Energija d.o.o. (demo)', 'Mala hidroelektrana Primjer', 'Energetika', 'Konjic', 43.651, 17.961, '2023-04-15', '2028-04-15', 'VAZECA'],
    ['UPI/05-23-014/25', 'Demo Metal d.o.o. (demo)', 'Pogon za preradu metala', 'Industrija', 'Mostar', 43.318, 17.836, '2021-03-02', '2026-12-31', 'U_OBNOVI'],
    ['UPI/05-23-027/24', 'Eko-Primjer d.o.o. (demo)', 'Reciklažno dvorište', 'Otpad', 'Čapljina', 43.112, 17.705, '2024-05-14', '2029-05-14', 'VAZECA'],
    ['UPI/05-23-033/24', 'Kamenolom Primjer d.o.o. (demo)', 'Površinski kop tehničkog kamena', 'Industrija', 'Jablanica', 43.660, 17.758, '2022-09-01', '2027-09-01', 'VAZECA'],
    ['UPI/05-23-041/23', 'Hotel Primjer d.o.o. (demo)', 'Hotelski kompleks s bazenom', 'Turizam', 'Neum', 42.924, 17.618, '2023-06-20', '2026-12-20', 'U_OBNOVI'],
    ['UPI/05-23-052/22', 'Primjer Farma d.o.o. (demo)', 'Farma za uzgoj peradi', 'Ostalo', 'Čitluk', 43.229, 17.701, '2020-02-11', '2025-02-11', 'ISTEKLA'],
    ['UPI/05-23-060/25', 'Demo Komunalno d.o.o. (demo)', 'Postrojenje za tretman otpadnih voda', 'Otpad', 'Stolac', 43.084, 17.959, '2025-01-28', '2030-01-28', 'VAZECA'],
    ['UPI/05-23-071/24', 'Primjer Solar d.o.o. (demo)', 'Solarna elektrana', 'Energetika', 'Ravno', 42.887, 17.968, '2024-10-03', '2029-10-03', 'VAZECA'],
  ] as const;
  for (const [registerNumber, operator, facility, activity, municipality, lat, lng, issued, valid, status] of permits) {
    const p = await db.insert('permits', {
      id: id(), ...{
        registerNumber, operator, facility, activity, municipality, lat, lng, status, issuedAt: new Date(issued), validUntil: new Date(valid),
        address: `${municipality}, HNK`, description: 'Demo zapis registra za prezentaciju. Stvarni podaci se unose iz evidencije Sektora za zaštitu okoliša.',
      },
    });
    const data = demoPdf(`Rjesenje o okolisnoj dozvoli ${registerNumber}`);
    await db.insert('documents', { id: id(), ...{ title: `Rješenje o okolišnoj dozvoli ${registerNumber}`, docType: 'ODLUKA', sector: 'Zaštita okoliša', number: registerNumber, issuedAt: new Date(issued), fileName: `rjesenje-${p.id}.pdf`, mimeType: 'application/pdf', size: data.length, data, permitId: p.id, isDemo: true } });
  }

  // ---- Ugostiteljski objekti (DEMO) ----
  const fac = [
    ['Hotel Primjer Neum (demo)', 'Hotel', 4, 'Neum', 120, 240, 42.925, 17.615],
    ['Hotel Demo Mostar (demo)', 'Hotel', 4, 'Mostar', 64, 128, 43.343, 17.807],
    ['Pansion Primjer (demo)', 'Pansion', 3, 'Blagaj', 9, 20, 43.257, 17.881],
    ['Motel Demo Jablanica (demo)', 'Motel', 2, 'Jablanica', 18, 36, 43.659, 17.762],
    ['Apartmani Primjer Počitelj (demo)', 'Apartmani', 3, 'Čapljina', 6, 18, 43.134, 17.733],
    ['Eko-kamp Demo Neretva (demo)', 'Kamp', 2, 'Konjic', 40, 120, 43.652, 17.968],
    ['Hotel Primjer Prozor (demo)', 'Hotel', 3, 'Prozor-Rama', 32, 66, 43.822, 17.611],
  ] as const;
  for (const [name, kind, stars, municipality, rooms, beds, lat, lng] of fac) {
    // F2-13: objekti žive u registru „ugostiteljski-objekti“ (registry builder, migracija 0010)
    const opcina = municipality === 'Blagaj' ? 'Mostar' : municipality;
    const data = { naziv: name, vrsta: kind, kategorija: String(stars), opcina, adresa: `${municipality}, HNK`, jedinice: rooms, lezaji: beds, rjesenje: `DEMO-MTU-${Math.round(lat * 100)}`, datumRjesenja: '2025-03-15', vrijediDo: '2029-03-15', status: 'Važeća' };
    if (await db.one(`SELECT 1 FROM registries WHERE "id"='mtto-smjestaj'`)) {
      await db.insert('registry_entries', { id: id(), registryId: 'mtto-smjestaj', data: JSON.stringify(data), searchText: `${name} ${data.adresa} ${data.rjesenje}`.toLowerCase(), lat, lng, isDemo: true });
    }
  }

  // ---- Mapa: stvarne lokacije ----
  const locs = [
    ['Park prirode Hutovo blato', 'ZASTICENO', 'Zaštićeno močvarno područje i Ramsarski lokalitet', 43.060, 17.775],
    ['Park prirode Blidinje', 'ZASTICENO', 'Planinsko područje između Čvrsnice i Vrana', 43.620, 17.505],
    ['Boračko jezero', 'ZASTICENO', 'Glacijalno jezero kod Konjica', 43.556, 18.024],
    ['Stari most, Mostar', 'TURIZAM', 'UNESCO svjetska baština', 43.3373, 17.8150],
    ['Vodopad Kravica', 'TURIZAM', 'Vodopad na rijeci Trebižat', 43.156, 17.608],
    ['Počitelj', 'TURIZAM', 'Historijsko naselje na Neretvi', 43.135, 17.731],
    ['Blagaj – vrelo Bune', 'TURIZAM', 'Vrelo rijeke Bune i tekija', 43.257, 17.886],
    ['COASTRUST – Neum', 'PROJEKT', 'Projekat održivog obalnog turizma (završna konferencija novembar 2026.)', 42.923, 17.616],
    ['NaTour4CChange – Čapljina', 'PROJEKT', 'Projekat prilagodbe turizma klimatskim promjenama', 43.121, 17.684],
  ] as const;
  for (const [name, layer, description, lat, lng] of locs) await db.insert('map_locations', { id: id(), name, layer, description, lat, lng });

  await db.insert('audit_log', { id: id(), userName: 'Sistem', action: 'Početni podaci učitani', target: 'MVP seed' });
  console.log('Seed završen.');
}

withTenant(SYSTEM_TENANT, main).catch((e) => { console.error(e); process.exit(1); }).finally(() => db.pool.end());
