/**
 * F2-07: pretraga cijelog portala s fasetama, tolerantna na dijakritike i ćirilicu.
 *
 * - SearchIndexer gradi search_docs po instituciji iz javnog sadržaja. Svake minute uporedi „potpis“ izvora
 *   (broj i zadnja izmjena objavljenih zapisa) i, ako se promijenio, ponovo izgradi indeks (jedna transakcija).
 *   Tako indeks prati sve izmjene bez kukica u svakom kontroleru.
 * - Upit: riječi se svode na mala slova bez dijakritika (mtto_fold), ćirilica se presloví u latinicu,
 *   svaka riječ traži se kao prefiks (pretraga „turist“ nađe „turistički“). Kad nema pogodaka, slične
 *   riječi u naslovima (trigrami) daju pogotke za tipfelere i prijedlog „Da li ste mislili“.
 * - Fasete: vrsta sadržaja, sektor, godina; broj uz svaku vrijednost računa se uz ostale odabrane filtere.
 */
import { Controller, Get, Injectable, OnModuleInit, Query, UseGuards } from '@nestjs/common';
import { Db, withTenant } from './db';
import { AuthGuard } from './auth';
import { Can } from './rbac';
import { logJson } from './observability';

export const KINDS: Record<string, string> = {
  STRANICA: 'Stranice i usluge', SITUACIJA: 'Životne situacije', VIJEST: 'Vijesti i obavještenja', DOKUMENT: 'Dokumenti i propisi',
  REGISTAR: 'Registri', POZIV: 'Javni pozivi', USLUGA: 'Elektronski zahtjevi',
};

/** Ključne stranice portala koje nisu zapis u bazi (naslov, opis, ključne riječi). */
export const PAGES: { url: string; title: string; body: string; sector?: string }[] = [
  { url: '/trgovina', title: 'Trgovina', body: 'radno vrijeme trgovina, neradna nedjelja, zaštita potrošača, cijene, trgovinske djelatnosti', sector: 'Trgovina' },
  { url: '/trgovina/neradni-dani', title: 'Neradna nedjelja i praznici', body: 'kada rade trgovine, nedjelja, praznik, izuzeci, kalendar, ics, radno vrijeme trgovina nedjeljom', sector: 'Trgovina' },
  { url: '/turizam-i-bastina', title: 'Turizam i baština', body: 'kategorizacija, ugostiteljstvo, turističke agencije, vodiči, smještaj, kulturna baština', sector: 'Turizam' },
  { url: '/turizam-i-bastina/boravisna-taksa', title: 'Boravišna taksa i prijava gostiju', body: 'boravišna taksa, prijava gostiju, prijava.ba, turistička zajednica, iznajmljivači', sector: 'Turizam' },
  { url: '/turisticki-vodici', title: 'Turistički vodiči', body: 'stručni ispit za turističkog vodiča, licenca, iskaznica, polaganje ispita', sector: 'Turizam' },
  { url: '/zastita-okolisa', title: 'Zaštita okoliša', body: 'okolišna dozvola, otpad, zrak, vode, zaštićena područja, procjena utjecaja na okoliš', sector: 'Zaštita okoliša' },
  { url: '/zastita-okolisa/kvalitet-zraka', title: 'Kvalitet zraka', body: 'zagađenje zraka, indeks kvaliteta zraka, PM10, PM2.5, čestice, ozon, smog, prognoza, mjerne stanice', sector: 'Zaštita okoliša' },
  { url: '/eko-rizik', title: 'Eko-rizik: požari, poplave, klizišta', body: 'požar, šumski požar, poplava, vodostaj, rijeka Neretva, klizište, upozorenja, meteoalarm, krizna situacija', sector: 'Zaštita okoliša' },
  { url: '/eko-rizik/prijava', title: 'Prijava ekološkog incidenta', body: 'prijaviti divlju deponiju, otpad, zagađenje vode, zagađenje zraka, požar, fotografija, lokacija', sector: 'Zaštita okoliša' },
  { url: '/inspekcija', title: 'Inspekcija: plan i izvještaj nadzora', body: 'inspekcijski nadzor, tržišna inspekcija, turistička inspekcija, okolišna inspekcija, kontrole, kazne', sector: 'Inspekcija' },
  { url: '/e-usluge/prijava-inspekciji', title: 'Prijava inspekciji', body: 'prijaviti nepravilnost, anonimna prijava, prevara, cijene, radno vrijeme, inspektor', sector: 'Inspekcija' },
  { url: '/e-usluge', title: 'E-usluge', body: 'elektronski zahtjev, online prijava, obrasci, status predmeta', sector: undefined },
  { url: '/e-usluge/obrasci', title: 'Elektronski zahtjevi', body: 'podnijeti zahtjev online, obrazac, prilozi', sector: undefined },
  { url: '/e-usluge/status', title: 'Status predmeta', body: 'praćenje predmeta, broj predmeta, kod za praćenje, dopuna zahtjeva', sector: undefined },
  { url: '/javni-pozivi', title: 'Javni pozivi', body: 'sufinansiranje, grant, poticaji, subvencije, natječaj, lista korisnika, dodijeljena sredstva', sector: undefined },
  { url: '/registri', title: 'Javni registri', body: 'registar, upisnik, otvoreni podaci, CSV, preuzimanje', sector: undefined },
  { url: '/propisi', title: 'Propisi i obrasci', body: 'zakon, pravilnik, uredba, odluka, službene novine, obrasci zahtjeva', sector: undefined },
  { url: '/mapa', title: 'GIS karta', body: 'karta, lokacije, dozvole, objekti, zaštićena područja', sector: undefined },
  { url: '/o-nama', title: 'O Ministarstvu', body: 'ministar, kontakt, adresa, telefon, e-mail, sektori, organizacija, radno vrijeme ministarstva', sector: undefined },
  { url: '/vijesti', title: 'Vijesti', body: 'novosti, saopćenja, obavještenja, aktuelnosti', sector: undefined },
  { url: '/zivotne-situacije', title: 'Životne situacije', body: 'šta mi treba, kako da, korak po korak, vodič, upute za građane i privredu', sector: undefined },
];

const CYR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};
/** Ćirilica → latinica (srpska azbuka). */
export const latin = (s: string) => s.replace(/[Ѐ-ӿ]/g, (c) => { const l = CYR[c.toLowerCase()]; return l == null ? c : c === c.toLowerCase() ? l : l[0].toUpperCase() + l.slice(1); });
/** Isto što i mtto_fold u bazi, plus ćirilica. Za poziciju isječka koristi foldChars (ista dužina). */
export const fold = (s: string) => foldChars(latin(s)).replace(/dj/g, 'd');
const foldChars = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/** Riječi upita (najviše 8, bar 2 znaka). */
export function terms(q: string) {
  return [...new Set(fold(q).split(/[^a-z0-9]+/).filter((t) => t.length >= 2))].slice(0, 8);
}
/** Lagano skraćivanje padežnih nastavaka (turistička → turistick:*, pa nađe i turističkih, turističke). */
const SUFFIX = ['ama', 'ima', 'oga', 'ome', 'ih', 'om', 'em', 'og', 'oj', 'im', 'a', 'e', 'i', 'o', 'u'];
export function stem(t: string) {
  if (t.length < 6 || /^\d+$/.test(t)) return t;
  for (const s of SUFFIX) if (t.endsWith(s) && t.length - s.length >= 5) return t.slice(0, -s.length);
  return t;
}

export function stripHtml(h: string) {
  return h.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, ' ').trim();
}

/** Isječak oko prvog pogotka; vraća tekst i raspone za isticanje. */
export function snippet(text: string, ts: string[], len = 220) {
  if (!text) return { text: '', marks: [] as [number, number][] };
  const f = foldChars(latin(text));
  const hits = ts.map((t) => f.indexOf(t)).filter((i) => i >= 0);
  const first = hits.length ? Math.min(...hits) : 0;
  let start = Math.max(0, first - 60);
  if (start > 0) { const sp = text.indexOf(' ', start); if (sp > 0 && sp < first) start = sp + 1; }
  let end = Math.min(text.length, start + len);
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > start + 80) end = sp; }
  const cut = text.slice(start, end), fc = f.slice(start, end);
  const marks: [number, number][] = [];
  for (const t of ts) { let i = fc.indexOf(t); while (i >= 0 && marks.length < 12) { marks.push([i, i + t.length]); i = fc.indexOf(t, i + t.length); } }
  marks.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const m of marks) { const l = merged.at(-1); if (l && m[0] <= l[1]) l[1] = Math.max(l[1], m[1]); else merged.push([...m]); }
  const pre = start > 0 ? '… ' : '', post = end < text.length ? ' …' : '';
  return { text: pre + cut + post, marks: merged.map(([a, b]) => [a + pre.length, b + pre.length] as [number, number]) };
}

type Doc = { key: string; kind: string; title: string; body: string; url: string; meta: string | null; sector: string | null; date: Date | null; isDemo: boolean };

const PUBLISHED_POST = `"status" IN ('OBJAVLJENO','ZAKAZANO') AND "publishedAt" <= now() AND ("unpublishAt" IS NULL OR "unpublishAt" > now())`;
const PUBLIC_DOC = `"accessLevel"='JAVNO' AND "disposedAt" IS NULL`;
const POST_TYPE: Record<string, string> = { VIJEST: 'Vijest', JAVNI_POZIV: 'Obavještenje o pozivu', SAOPCENJE: 'Saopćenje' };
const DOC_TYPE: Record<string, string> = { ZAKON: 'Zakon', PRAVILNIK: 'Pravilnik', ODLUKA: 'Odluka / rješenje', OBRAZAC: 'Obrazac', UPUTSTVO: 'Uputstvo', IZVJESTAJ: 'Izvještaj', OSTALO: 'Dokument' };

@Injectable()
export class SearchIndexer implements OnModuleInit {
  constructor(private db: Db) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    const run = () => this.refreshAll().catch((e) => logJson('error', 'Indeks pretrage nije osvježen', { error: e?.message }));
    setTimeout(run, 8_000).unref();
    setInterval(run, 60_000).unref();
  }

  /** Za svaku instituciju: ako se potpis izvora promijenio, izgradi indeks ponovo. */
  async refreshAll() {
    await this.db.withLock(727031, async () => {
      const tenants = await this.db.system(() => this.db.q<{ id: string }>(`SELECT "id" FROM tenants`));
      for (const t of tenants) await this.refresh(t.id);
    });
  }

  async refresh(tenantId: string, force = false) {
    return withTenant(tenantId, async () => {
      const sig = await this.signature();
      const st = await this.db.one<{ signature: string }>(`SELECT "signature" FROM search_state WHERE "tenantId"=$1`, [tenantId]);
      if (!force && st?.signature === sig) return null;
      const docs = await this.collect();
      await this.db.tx(async (c) => {
        await c.query(`DELETE FROM search_docs WHERE "tenantId"=$1`, [tenantId]);
        for (let i = 0; i < docs.length; i += 200) {
          const ch = docs.slice(i, i + 200);
          const col = <K extends keyof Doc>(k: K) => ch.map((d) => d[k]);
          await c.query(
            `INSERT INTO search_docs ("tenantId","key","kind","title","body","url","meta","sector","date","isDemo","foldTitle","tsv")
             SELECT $1, k, kind, title, body, url, meta, sector, date, demo, mtto_fold(title),
               setweight(to_tsvector('simple', mtto_fold(title)), 'A') || setweight(to_tsvector('simple', mtto_fold(coalesce(meta,''))), 'B') || setweight(to_tsvector('simple', mtto_fold(left(body, 20000))), 'C')
             FROM unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::text[], $9::timestamptz[], $10::boolean[]) AS x(k, kind, title, body, url, meta, sector, date, demo)
             ON CONFLICT DO NOTHING`,
            [tenantId, col('key'), col('kind'), col('title'), col('body'), col('url'), col('meta'), col('sector'), col('date'), col('isDemo')],
          );
        }
        await c.query(`INSERT INTO search_state ("tenantId","signature","builtAt","docs") VALUES ($1,$2,now(),$3) ON CONFLICT ("tenantId") DO UPDATE SET "signature"=EXCLUDED."signature","builtAt"=now(),"docs"=EXCLUDED."docs"`, [tenantId, sig, docs.length]);
      });
      logJson('info', 'Indeks pretrage izgrađen', { tenant: tenantId, docs: docs.length });
      return docs.length;
    });
  }

  /** Broj i zadnja izmjena javnih zapisa po izvoru; mijenja se i kad zakazana objava postane javna. */
  private async signature() {
    const r = await this.db.one<any>(`SELECT
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM posts WHERE ${PUBLISHED_POST}) p,
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM documents WHERE ${PUBLIC_DOC}) d,
      (SELECT count(*)||'/'||coalesce(max(e."updatedAt")::text,'')||'/'||coalesce(max(r."updatedAt")::text,'') FROM registry_entries e JOIN registries r ON r."id"=e."registryId" WHERE r."public" AND e."status"='AKTIVAN') r,
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM permits) pe,
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM calls WHERE "published") c,
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM forms WHERE "active") f,
      (SELECT count(*)||'/'||coalesce(max("updatedAt")::text,'') FROM life_events WHERE "published") l`);
    return `v2|${PAGES.length}|${Object.values(r).join('|')}`;
  }

  private async collect(): Promise<Doc[]> {
    const out: Doc[] = PAGES.map((p) => ({ key: `page:${p.url}`, kind: 'STRANICA', title: p.title, body: p.body, url: p.url, meta: null, sector: p.sector ?? null, date: null, isDemo: false }));
    const posts = await this.db.q<any>(`SELECT "id","slug","type","title","excerpt","body","publishedAt","isDemo" FROM posts WHERE ${PUBLISHED_POST}`);
    for (const p of posts) out.push({ key: `post:${p.id}`, kind: 'VIJEST', title: p.title, body: stripHtml(`${p.excerpt ?? ''} ${p.body ?? ''}`), url: `/vijesti/${p.slug}`, meta: POST_TYPE[p.type] ?? 'Vijest', sector: null, date: p.publishedAt, isDemo: p.isDemo });
    const docs = await this.db.q<any>(`SELECT "id","title","docType","sector","number","issuedAt","description","keywords","publisher","gazette","isDemo" FROM documents WHERE ${PUBLIC_DOC}`);
    for (const d of docs) out.push({
      key: `doc:${d.id}`, kind: 'DOKUMENT', title: d.title, url: `/api/documents/${d.id}/file`,
      body: [d.description, (d.keywords ?? []).join(' '), d.publisher, d.gazette].filter(Boolean).join(' '),
      meta: [DOC_TYPE[d.docType] ?? 'Dokument', d.number].filter(Boolean).join(' '), sector: d.sector, date: d.issuedAt, isDemo: d.isDemo,
    });
    const regs = await this.db.q<any>(`SELECT "id","slug","name","description","sector","titleField","isDemo" FROM registries WHERE "public"`);
    for (const r of regs) out.push({ key: `reg:${r.id}`, kind: 'REGISTAR', title: r.name, body: r.description ?? '', url: `/registri/${r.slug}`, meta: 'Registar', sector: r.sector, date: null, isDemo: false });
    const entries = await this.db.q<any>(`SELECT e."id",e."data",e."isDemo",e."updatedAt",r."slug",r."name",r."sector",r."titleField",r."fields" FROM registry_entries e JOIN registries r ON r."id"=e."registryId" WHERE r."public" AND e."status"='AKTIVAN'`);
    for (const e of entries) {
      const title = String(e.data?.[e.titleField] ?? '').trim() || e.name;
      const body = (e.fields ?? []).filter((f: any) => f.public !== false && f.key !== e.titleField && e.data?.[f.key] != null && e.data[f.key] !== '')
        .map((f: any) => typeof e.data[f.key] === 'boolean' ? (e.data[f.key] ? f.label : '') : String(e.data[f.key])).filter(Boolean).join(' · ');
      out.push({ key: `entry:${e.id}`, kind: 'REGISTAR', title, body, url: `/registri/${e.slug}/${e.id}`, meta: e.name, sector: e.sector, date: null, isDemo: e.isDemo });
    }
    const permits = await this.db.q<any>(`SELECT "id","registerNumber","operator","facility","activity","municipality","issuedAt","isDemo" FROM permits`);
    for (const p of permits) out.push({ key: `permit:${p.id}`, kind: 'REGISTAR', title: `${p.operator}${p.facility ? ` – ${p.facility}` : ''}`, body: [p.registerNumber, p.activity, p.municipality].filter(Boolean).join(' '), url: `/registri/okolisne-dozvole/${p.id}`, meta: `Okolišna dozvola ${p.registerNumber ?? ''}`.trim(), sector: 'Zaštita okoliša', date: p.issuedAt, isDemo: p.isDemo });
    const calls = await this.db.q<any>(`SELECT "id","slug","title","summary","body","eligibility","sector","opensAt","isDemo" FROM calls WHERE "published"`);
    for (const c of calls) out.push({ key: `call:${c.id}`, kind: 'POZIV', title: c.title, body: [c.summary, c.body, c.eligibility].join(' '), url: `/javni-pozivi/${c.slug}`, meta: 'Javni poziv', sector: c.sector, date: c.opensAt, isDemo: c.isDemo });
    const forms = await this.db.q<any>(`SELECT f."id",f."slug",f."title",f."description",f."sector",f."isDemo" FROM forms f WHERE f."active" AND NOT EXISTS (SELECT 1 FROM calls c WHERE c."formId"=f."id")`);
    for (const f of forms) out.push({ key: `form:${f.id}`, kind: 'USLUGA', title: f.title, body: f.description ?? '', url: f.slug === 'prijava-inspekciji' ? '/e-usluge/prijava-inspekciji' : `/e-usluge/obrasci/${f.slug}`, meta: 'Elektronski zahtjev', sector: f.sector, date: null, isDemo: f.isDemo });
    const life = await this.db.q<any>(`SELECT "id","slug","title","summary","steps","keywords","sector","audience" FROM life_events WHERE "published"`);
    for (const l of life) out.push({ key: `life:${l.id}`, kind: 'SITUACIJA', title: l.title, body: [l.summary, ...(l.steps ?? []).map((s: any) => `${s.title}. ${s.text}`), l.keywords].join(' '), url: `/zivotne-situacije/${l.slug}`, meta: l.audience === 'PRIVREDA' ? 'Za privredu' : 'Za građane', sector: l.sector, date: null, isDemo: false });
    return out.filter((d) => d.title);
  }
}

type Hit = { key: string; kind: string; sector: string | null; year: number | null; rank: number };

@Controller('search')
export class SearchController {
  constructor(private db: Db) {}

  @Get()
  async search(@Query() q: any) {
    const raw = String(q.q ?? '').trim().slice(0, 200);
    const ts = terms(raw);
    const page = Math.max(1, Math.min(50, parseInt(q.page, 10) || 1));
    const size = 20;
    const empty = { q: raw, total: 0, page, pages: 0, items: [], facets: { kind: [], sector: [], year: [] }, suggestion: null as string | null, fuzzy: false };
    if (!ts.length) return empty;

    let hits = await this.match(ts, raw);
    let fuzzy = false;
    if (!hits.length) { hits = await this.fuzzy(raw); fuzzy = hits.length > 0; }
    await this.log(raw, hits.length);
    if (!hits.length) return { ...empty, suggestion: await this.suggest(raw) };

    const f = { kind: q.vrsta ? String(q.vrsta) : null, sector: q.sektor ? String(q.sektor) : null, year: q.godina ? Number(q.godina) : null };
    const pass = (h: Hit, skip?: keyof typeof f) => (skip === 'kind' || !f.kind || h.kind === f.kind) && (skip === 'sector' || !f.sector || h.sector === f.sector) && (skip === 'year' || !f.year || h.year === f.year);
    const count = <T,>(skip: keyof typeof f, val: (h: Hit) => T | null) => {
      const m = new Map<T, number>();
      for (const h of hits) if (pass(h, skip)) { const v = val(h); if (v != null) m.set(v, (m.get(v) ?? 0) + 1); }
      return m;
    };
    const kinds = count('kind', (h) => h.kind), sectors = count('sector', (h) => h.sector), years = count('year', (h) => h.year);
    const filtered = hits.filter((h) => pass(h));
    const slice = filtered.slice((page - 1) * size, page * size);
    const rows = slice.length ? await this.db.q<any>(`SELECT "key","kind","title","body","url","meta","sector","date","isDemo" FROM search_docs WHERE "key" = ANY($1)`, [slice.map((h) => h.key)]) : [];
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const items = slice.map((h) => byKey.get(h.key)).filter(Boolean).map((r) => {
      const st = ts.map(stem);
      const t = snippet(r.title, st, 300);
      return { kind: r.kind, kindLabel: KINDS[r.kind] ?? r.kind, title: r.title, titleMarks: t.marks, url: r.url, meta: r.meta, sector: r.sector, date: r.date, isDemo: r.isDemo, snippet: snippet(r.body, st) };
    });
    return {
      q: raw, total: filtered.length, page, pages: Math.ceil(filtered.length / size), items, fuzzy, suggestion: fuzzy ? await this.suggest(raw) : null,
      facets: {
        kind: Object.keys(KINDS).filter((k) => kinds.has(k)).map((k) => ({ key: k, label: KINDS[k], count: kinds.get(k)! })),
        sector: [...sectors.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, label: k, count: n })),
        year: [...years.entries()].sort((a, b) => b[0] - a[0]).map(([k, n]) => ({ key: String(k), label: String(k), count: n })),
      },
    };
  }

  /** Brzi prijedlozi dok korisnik kuca (do 6). */
  @Get('suggest')
  async suggestions(@Query('q') q = '') {
    const ts = terms(String(q).slice(0, 100));
    if (!ts.length) return [];
    const hits = (await this.match(ts, q)).slice(0, 6);
    if (!hits.length) return [];
    const rows = await this.db.q<any>(`SELECT "key","kind","title","url","meta" FROM search_docs WHERE "key" = ANY($1)`, [hits.map((h) => h.key)]);
    const by = new Map(rows.map((r) => [r.key, r]));
    return hits.map((h) => by.get(h.key)).filter(Boolean).map((r) => ({ kind: r.kind, kindLabel: KINDS[r.kind], title: r.title, url: r.url, meta: r.meta }));
  }

  /** Sve riječi moraju se pojaviti (kao prefiks). Rang: naslov > opis > tekst, uz blagu prednost novijem. */
  private async match(ts: string[], raw: string): Promise<Hit[]> {
    const tsq = ts.map((t) => `${stem(t)}:*`).join(' & ');
    return this.db.q<Hit>(
      `SELECT "key","kind","sector", extract(year FROM "date" AT TIME ZONE 'Europe/Sarajevo')::int "year",
         ts_rank("tsv", q, 1) * 10
         + CASE WHEN "foldTitle" = $2 THEN 6 WHEN "foldTitle" LIKE $2 || '%' THEN 3 ELSE 0 END
         + CASE "kind" WHEN 'SITUACIJA' THEN 2 WHEN 'STRANICA' THEN 1.5 WHEN 'USLUGA' THEN 1.2 WHEN 'POZIV' THEN 1 ELSE 0 END
         + CASE WHEN "date" IS NULL THEN 0 ELSE greatest(0, 1 - extract(epoch FROM now() - "date") / (86400 * 730)) END
         - CASE WHEN "isDemo" THEN 0.5 ELSE 0 END AS "rank"
       FROM search_docs, to_tsquery('simple', $1) q
       WHERE "tsv" @@ q ORDER BY "rank" DESC, "date" DESC NULLS LAST LIMIT 1000`,
      [tsq, fold(raw).trim()],
    );
  }

  /** Bez tačnog pogotka: naslovi slični upitu (tipfeleri). */
  private async fuzzy(raw: string): Promise<Hit[]> {
    return this.db.q<Hit>(
      `SELECT "key","kind","sector", extract(year FROM "date" AT TIME ZONE 'Europe/Sarajevo')::int "year", word_similarity($1, "foldTitle") "rank"
       FROM search_docs WHERE word_similarity($1, "foldTitle") >= 0.45 ORDER BY "rank" DESC LIMIT 50`, [fold(raw)]);
  }

  /** „Da li ste mislili“: riječ iz naslova najbliža svakoj riječi upita. */
  private async suggest(raw: string): Promise<string | null> {
    const words = raw.split(/\s+/).filter(Boolean).slice(0, 8);
    const out: string[] = []; let changed = false;
    for (const w of words) {
      const f = fold(w).replace(/[^a-z0-9]/g, '');
      if (f.length < 3) { out.push(w); continue; }
      const r = await this.db.one<{ word: string }>(
        `SELECT word FROM (SELECT DISTINCT unnest(regexp_split_to_array(lower("title"), '[^[:alnum:]]+')) word FROM search_docs) w
         WHERE length(word) >= 3 AND similarity(mtto_fold(word), $1) >= 0.25 ORDER BY similarity(mtto_fold(word), $1) DESC, length(word) LIMIT 1`, [f]);
      if (r && fold(r.word) !== f) { out.push(r.word); changed = true; } else out.push(w);
    }
    return changed ? out.join(' ') : null;
  }

  private async log(raw: string, hits: number) {
    const qf = fold(raw).replace(/\s+/g, ' ').trim().slice(0, 100);
    if (qf.length < 2) return;
    await this.db.q(
      `INSERT INTO search_queries ("day","query","count","hits") VALUES ((now() AT TIME ZONE 'Europe/Sarajevo')::date, $1, 1, $2)
       ON CONFLICT ("tenantId","day","query") DO UPDATE SET "count"=search_queries."count"+1, "hits"=EXCLUDED."hits"`, [qf, hits]).catch(() => {});
  }
}

@Controller('admin/search')
@UseGuards(AuthGuard)
export class AdminSearchController {
  constructor(private db: Db, private idx: SearchIndexer) {}

  /** Šta građani traže (zadnjih N dana) i šta ne nalaze. */
  @Get('stats')
  @Can('kontrolna', 'read')
  async stats(@Query('days') days = '30') {
    const n = Math.min(365, Math.max(1, parseInt(days, 10) || 30));
    const [top, zero, total, state] = await Promise.all([
      this.db.q(`SELECT "query", sum("count")::int "count", (array_agg("hits" ORDER BY "day" DESC))[1] "hits" FROM search_queries WHERE "day" > current_date - $1::int GROUP BY 1 ORDER BY 2 DESC LIMIT 30`, [n]),
      this.db.q(`SELECT "query", sum("count")::int "count" FROM search_queries WHERE "day" > current_date - $1::int GROUP BY 1 HAVING (array_agg("hits" ORDER BY "day" DESC))[1] = 0 ORDER BY 2 DESC LIMIT 30`, [n]),
      this.db.one<any>(`SELECT coalesce(sum("count"),0)::int "searches", count(DISTINCT "query")::int "distinct", coalesce(sum("count") FILTER (WHERE "hits"=0),0)::int "zero" FROM search_queries WHERE "day" > current_date - $1::int`, [n]),
      this.db.one<any>(`SELECT "builtAt","docs" FROM search_state WHERE "tenantId"=mtto_current_tenant()`),
    ]);
    return { days: n, top, zero, total, index: state };
  }
}

