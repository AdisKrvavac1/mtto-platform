import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { Db, id } from './db';

/** Uvoz vijesti sa postojećeg portala mtto.gov.ba (WordPress REST API). */
const WP = process.env.MTTO_WP_URL || 'https://mtto.gov.ba';
const MAX_PAGES = Number(process.env.MTTO_WP_PAGES || 4); // 4 × 50 najnovijih

const ENT: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#8220;': '“', '&#8221;': '”', '&#8222;': '„', '&#8211;': '–', '&#8212;': '—', '&#8216;': '‘', '&#8217;': '’', '&#038;': '&', '&hellip;': '…', '&#8230;': '…', '&lt;': '<', '&gt;': '>' };
export const decode = (s: string) => s.replace(/&#?\w+;/g, (e) => ENT[e] ?? (e.startsWith('&#') ? String.fromCharCode(parseInt(e.slice(2, -1), 10)) : e));
const strip = (h: string) => decode(sanitizeHtml(h, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, ' ').trim();

export function classify(title: string, cats: string[]) {
  const t = `${title} ${cats.join(' ')}`.toLowerCase();
  const type = /javni poziv|javni konkurs|natje[cč]aj|konkurs|poziv za/.test(t) ? 'JAVNI_POZIV' : /saop[cćš]enje|obavijest|obavje[sš]tenje|upozorenje/.test(t) ? 'SAOPCENJE' : 'VIJEST';
  const category = /turiz|ugostitelj|festival|vodi[cč]/.test(t) ? 'Turizam' : /okoli[sš]|priro|otpad|ekolo|klim|zrak|voda|park|bio/.test(t) ? 'Zaštita okoliša' : /trgov|tr[zž]i[sš]|potro[sš]a|cijen|nedjelj|inspekc/.test(t) ? 'Trgovina' : 'Opće';
  return { type, category };
}

@Injectable()
export class MttoImporter implements OnApplicationBootstrap {
  private log = new Logger('MttoImporter');
  running = false;
  constructor(private db: Db) {}

  onApplicationBootstrap() {
    if (process.env.MTTO_IMPORT_ON_START === '0') return;
    // u pozadini, ne blokira pokretanje
    setTimeout(() => this.run().catch((e) => this.log.warn(`Uvoz nije uspio: ${e.message}`)), 3000);
  }

  async run(pages = MAX_PAGES) {
    if (this.running) return { imported: 0, updated: 0, skipped: 0, running: true };
    this.running = true;
    let imported = 0, updated = 0, skipped = 0;
    try {
      for (let page = 1; page <= pages; page++) {
        const res = await fetch(`${WP}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed=wp:featuredmedia,wp:term`, { headers: { 'User-Agent': 'MTTO-platforma/1.0 (+uvoz vijesti)' }, signal: AbortSignal.timeout(20000) });
        if (!res.ok) { if (page === 1) throw new Error(`HTTP ${res.status}`); break; }
        const items: any[] = await res.json();
        if (!items.length) break;
        for (const w of items) {
          const ext = `wp:${w.id}`;
          const title = decode(strip(w.title?.rendered ?? ''));
          const cats: string[] = (w._embedded?.['wp:term']?.[0] ?? []).map((c: any) => decode(c.name));
          const { type, category } = classify(title, cats);
          const body = sanitizeHtml(w.content?.rendered ?? '', {
            allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption'],
            allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt'] },
            allowedSchemes: ['https', 'http', 'mailto', 'tel'],
            transformTags: { h1: 'h2' },
          }).trim();
          const media = w._embedded?.['wp:featuredmedia']?.[0];
          const cover = media?.media_details?.sizes?.large?.source_url ?? media?.source_url ?? null;
          const row = {
            title, excerpt: strip(w.excerpt?.rendered ?? '').slice(0, 300), body, coverImage: cover, type, category,
            status: 'OBJAVLJENO', publishedAt: new Date(w.date_gmt ? `${w.date_gmt}Z` : w.date), authorName: 'MTTO HNK', isDemo: false,
            externalId: ext, sourceUrl: w.link,
          };
          const byExt = await this.db.one(`SELECT "id" FROM posts WHERE "externalId"=$1`, [ext]);
          if (byExt) { skipped++; continue; }
          const bySlug = await this.db.one(`SELECT "id" FROM posts WHERE "slug"=$1`, [w.slug]);
          if (bySlug) {
            // ručno unesena vijest s istim slugom: samo poveži izvor, sadržaj ostaje
            await this.db.q(`UPDATE posts SET "externalId"=$1, "sourceUrl"=$2, "coverImage"=COALESCE("coverImage",$3) WHERE "id"=$4`, [ext, w.link, cover, bySlug.id]);
            updated++; continue;
          }
          await this.db.insert('posts', { id: id(), slug: String(w.slug).slice(0, 120), ...row });
          imported++;
        }
        const total = Number(res.headers.get('x-wp-totalpages') || 1);
        if (page >= total) break;
      }
      this.log.log(`Uvoz mtto.gov.ba: novih ${imported}, povezanih ${updated}, postojećih ${skipped}`);
      return { imported, updated, skipped };
    } finally {
      this.running = false;
    }
  }
}
