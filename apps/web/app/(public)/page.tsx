import Link from 'next/link';
import { apiSafe, type PostListItem, type MapPoint } from '@/lib/api';
import { IMG } from '@/lib/images';
import { PostCard, PostCardLarge, CallItem, Kicker, EmptyState } from '@/components/site/ui';
import MapSection from '@/components/site/MapSection';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };

export default async function HomePage() {
  const [news, calls, stats, points] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=5', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
  ]);
  const [lead, ...rest] = news.items.filter((p) => p.type !== 'JAVNI_POZIV').concat(news.items.filter((p) => p.type === 'JAVNI_POZIV'));
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());

  const services = [
    { icon: 'gavel', title: 'Javni pozivi', text: 'Sufinansiranja i grantovi', href: '/vijesti?type=JAVNI_POZIV', badge: stats.calls ? `${stats.calls} otvoren${stats.calls === 1 ? '' : 'a'}` : null },
    { icon: 'description', title: 'Propisi i obrasci', text: 'Zakoni, pravilnici, obrasci zahtjeva', href: '/propisi', badge: `${stats.documents} dok.` },
    { icon: 'eco', title: 'Registar dozvola', text: 'Izdane okolišne dozvole', href: '/registri/okolisne-dozvole', badge: `${stats.permits} zapisa` },
    { icon: 'hotel', title: 'Ugostiteljski objekti', text: 'Kategorizirani objekti za smještaj', href: '/registri/ugostiteljski-objekti', badge: `${stats.facilities} objekata` },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-institutional-navy-deep text-on-primary">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-fixed-dim/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-xl pb-space-2xl relative z-10">
          <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded bg-surface-container-lowest/10 backdrop-blur-sm text-surface-container-high mb-space-md">
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">verified_user</span>
            <span className="font-label-kicker text-label-kicker tracking-widest uppercase">Službeni portal Ministarstva</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-8 space-y-space-md">
              <h1 className="font-display text-display-mobile md:text-display text-on-primary tracking-tight leading-tight">
                Trgovina, turizam i zaštita prirode: <span className="text-secondary-fixed">od Makljena do Jadranskog mora</span>
              </h1>
              <p className="font-body-lead text-body-lead text-surface-container-high max-w-3xl leading-relaxed">
                Ministarstvo trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona. Javni pozivi, propisi, registri i usluge za građane i privredu na jednom mjestu.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                <Link className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-secondary text-on-secondary font-button text-button shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all" href="/vijesti?type=JAVNI_POZIV">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>Aktuelni javni pozivi
                </Link>
                <Link className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-button text-button hover:bg-surface-container-lowest/25 transition-all" href="/mapa">
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">map</span>Interaktivna mapa
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4 bg-surface-container-lowest/10 backdrop-blur-md rounded-xl p-space-lg shadow-xl space-y-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-kicker text-label-kicker text-surface-container-high uppercase tracking-wider">Platforma u brojkama</span>
                <span className="material-symbols-outlined text-secondary-fixed text-[22px]">monitoring</span>
              </div>
              <div className="grid grid-cols-2 gap-space-md">
                {[
                  [stats.posts, 'Objava'],
                  [stats.documents, 'Propisa i obrazaca'],
                  [stats.permits, 'Dozvola u registru'],
                  [stats.locations + stats.permits + stats.facilities, 'Lokacija na mapi'],
                ].map(([n, l], i) => (
                  <div key={i} className="p-space-sm rounded bg-surface-container-lowest/5">
                    <span className={`font-display text-headline-lg font-bold ${i % 3 ? 'text-secondary-fixed' : 'text-on-primary'}`}>{n}</span>
                    <p className="font-body-sm text-body-sm text-surface-variant">{l}</p>
                  </div>
                ))}
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-high flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed" />Podaci se čitaju uživo iz CMS-a
              </p>
            </div>
          </div>
          <div className="mt-space-xl grid grid-cols-2 lg:grid-cols-4 gap-space-md">
            {[
              [IMG.neretva, 'Hidrološki biser', 'Kanjon Neretve'],
              [IMG.prenj, 'Visokogorje', 'Prenj i Rujišta'],
              [IMG.hutovo, 'Ramsarsko područje', 'Hutovo blato'],
              [IMG.neum, 'Jadranska obala', 'Neum'],
            ].map(([src, k, t]) => (
              <div key={t} className="relative group h-32 md:h-40 rounded-xl overflow-hidden shadow-md">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${src}')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-institutional-navy-deep/90 via-institutional-navy-deep/30 to-transparent p-space-md flex flex-col justify-end">
                  <span className="font-label-badge text-label-badge text-secondary-fixed uppercase">{k}</span>
                  <h4 className="font-title-md text-title-md text-on-primary font-bold">{t}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRZI SERVISI */}
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin w-full -mt-8 relative z-20">
        <div className="bg-surface-container-lowest rounded-xl shadow-lg p-space-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {services.map((s) => (
            <Link key={s.title} href={s.href} className="flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low transition-colors group">
              <span className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">{s.icon}</span>
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-title-md text-title-md font-bold text-primary">{s.title}</span>
                  {s.badge && <span className="px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary font-label-badge text-label-badge uppercase">{s.badge}</span>}
                </span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">{s.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* VIJESTI + POZIVI */}
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-xl pb-space-lg w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 space-y-space-lg">
            <div className="flex items-center justify-between pb-space-xs">
              <div>
                <Kicker>Informativni bilten MTTO</Kicker>
                <h2 className="font-headline-md text-headline-md text-primary font-bold">Aktuelnosti i vijesti</h2>
              </div>
              <Link className="inline-flex items-center gap-1 font-button text-button text-primary hover:text-secondary transition-colors" href="/vijesti">
                Sve vijesti<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            {lead ? <PostCardLarge p={lead} /> : <EmptyState title="Još nema objava" text="Objave iz CMS-a pojavit će se ovdje." />}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {rest.slice(0, 4).map((p) => <PostCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
          <aside className="lg:col-span-4 space-y-space-md lg:sticky lg:top-44">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md space-y-space-md">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <h3 className="font-title-md text-title-md font-bold text-primary">Javni pozivi</h3>
                </div>
                {stats.calls > 0 && <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-badge text-label-badge uppercase">Aktivno</span>}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Pozivi za sufinansiranje, grantovi i javne rasprave Ministarstva.</p>
              {calls.items.length ? calls.items.map((c) => <CallItem key={c.id} p={c} />) : <p className="font-body-sm text-body-sm text-outline">Trenutno nema otvorenih poziva.</p>}
              <Link href="/vijesti?type=JAVNI_POZIV" className="block w-full text-center py-2 rounded-lg bg-surface-container text-primary font-button text-button hover:bg-surface-container-high">Arhiva poziva</Link>
            </div>
            <div className="bg-institutional-navy-deep text-on-primary rounded-xl p-space-lg shadow-md space-y-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed">support_agent</span>
                <h3 className="font-title-md text-title-md font-bold">Rad sa strankama</h3>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-high">Braće Fejića bb, 88000 Mostar</p>
              <a href="tel:+38736551823" className="block font-title-md text-title-md font-bold text-secondary-fixed">+387 36 551 823</a>
              <a href="mailto:info@mtto.gov.ba" className="block font-body-sm text-body-sm underline">info@mtto.gov.ba</a>
            </div>
          </aside>
        </div>
      </section>

      {/* ZAŠTIĆENA PODRUČJA + MAPA */}
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl w-full space-y-space-xl" id="zasticena-podrucja">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <Kicker>Resor zaštite prirode i okoliša</Kicker>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">Prirodna baština kantona</h2>
          </div>
          <p className="font-body-regular text-body-regular text-text-body max-w-md">Zaštićena područja, turističke lokacije, projekti Ministarstva i izdane okolišne dozvole na jednoj mapi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          {[
            [IMG.hutovo2, 'Park prirode', 'Hutovo blato', 'Submediteranska močvara i ornitološki rezervat, Ramsarsko područje.'],
            [IMG.blidinje, 'Park prirode', 'Blidinje', 'Planinski plato između Čvrsnice i Vrana, s endemskim borom munikom.'],
            [IMG.vjetrenica, 'Speleološki objekt', 'Vjetrenica', 'Pećina u Popovom polju poznata po izuzetnoj podzemnoj bioraznolikosti.'],
            [IMG.boracko, 'Glacijalno jezero', 'Boračko jezero', 'Planinsko jezero na padinama Prenja kod Konjica.'],
          ].map(([src, k, t, d]) => (
            <div key={t} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md group hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={src} alt="" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-primary text-on-primary font-label-badge text-label-badge uppercase">{k}</span>
              </div>
              <div className="p-space-md space-y-space-xs">
                <h4 className="font-title-md text-title-md font-bold text-primary">{t}</h4>
                <p className="font-body-sm text-body-sm text-text-body">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <MapSection points={points} />

        {/* REGISTRI */}
        <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm space-y-space-md" id="registri">
          <div>
            <span className="font-label-kicker text-label-kicker text-primary uppercase">Administrativne baze podataka</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Službeni registri i evidencije</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {[
              ['hotel', 'Kategorizirani ugostiteljski objekti', 'Rješenja o kategorizaciji hotela, motela, pansiona i kampova.', '/registri/ugostiteljski-objekti', 'Pretraži registar'],
              ['eco', 'Registar okolišnih dozvola', 'Izdane okolišne dozvole s rokovima važenja, lokacijom i rješenjima.', '/registri/okolisne-dozvole', 'Uvid u dozvole'],
              ['description', 'Propisi i obrasci', 'Zakoni, pravilnici i obrasci zahtjeva za preuzimanje.', '/propisi', 'Otvori biblioteku'],
            ].map(([icon, t, d, href, cta]) => (
              <div key={t} className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between gap-space-xs">
                <div>
                  <div className="flex items-center gap-space-xs text-primary font-bold"><span className="material-symbols-outlined text-[20px]">{icon}</span><span>{t}</span></div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{d}</p>
                </div>
                <Link className="font-button text-button text-primary font-bold hover:text-secondary inline-flex items-center gap-1 pt-space-xs" href={href}>{cta}<span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
              </div>
            ))}
          </div>
        </div>

        {openCall && (
          <div className="bg-gradient-to-r from-primary to-institutional-navy-deep text-on-primary rounded-xl p-space-lg md:p-space-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-2xl">
              <span className="px-2.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge uppercase font-bold">Otvoren javni poziv</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-primary">{openCall.title}</h3>
              <p className="font-body-regular text-body-regular text-surface-container-high">{openCall.excerpt}</p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-space-md">
              <Link className="px-space-lg py-3 rounded-lg bg-secondary text-on-secondary font-button text-button shadow-md hover:bg-secondary/90 transition-all text-center" href={`/vijesti/${openCall.slug}`}>Detalji i prijava</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
