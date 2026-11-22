import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { EMPTY, LEVEL, LS_STATUS, REPORT_STATUS, WARN_COLOR, fireConfidence, fireTime, fmtTime, peakForecast, type RiskSummary } from '@/lib/risk';
import RiverChart from '@/components/risk/RiverChart';
import RiskMap from '@/components/risk/RiskMapLazy';


export const dynamic = 'force-dynamic';
export const metadata = { title: 'Eko-rizik HNK – požari, poplave i klizišta', description: 'Pregled rizika od požara, poplava i klizišta na području Hercegovačko-neretvanskog kantona: satelitska žarišta, meteo upozorenja, protok Neretve i prijave građana.' };

const Icon = ({ n, s = 20, c = '' }: { n: string; s?: number; c?: string }) => <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${c}`} style={{ fontSize: s }}>{n}</span>;
const Eyebrow = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => <p className={`font-space font-bold text-[12px] tracking-[1.2px] uppercase leading-[16px] ${light ? 'text-[#85f8c4]' : 'text-[#006c4a]'}`}>{children}</p>;
const SourceNote = ({ err, at, src }: { err: string | null; at: string; src: string }) => (
  <p className="flex items-center gap-[6px] font-rob text-[12px] leading-[18px] text-[#737780]">
    <Icon n={err ? 'cloud_off' : 'sync'} s={14} c={err ? 'text-[#ba1a1a]' : 'text-[#006c4a]'} />
    {err ? `${src}: izvor trenutno nedostupan` : `${src} · osvježeno ${fmtTime(at)}`}
  </p>
);

export default async function EkoRizikPage() {
  const d = await apiSafe<RiskSummary>('/risk/summary', EMPTY);
  const lv = LEVEL[d.level] ?? LEVEL[1];
  const mostar = d.rivers.items.find((r) => r.key === 'mostar') ?? d.rivers.items[0];
  const activeLs = d.landslides.filter((l) => l.status !== 'SANIRANO').length;
  const warn = d.warnings.items;
  const fires = d.fires.items;

  const kpis = [
    { icon: 'local_fire_department', label: 'Satelitska žarišta (72 h)', value: d.fires.error ? '—' : String(fires.length), sub: d.fires.error ? 'NASA FIRMS nedostupan' : `${d.fires.last24h} u zadnja 24 sata`, tone: fires.length ? 'text-[#ba1a1a]' : 'text-[#002042]' },
    { icon: 'thunderstorm', label: 'Meteo upozorenja', value: d.warnings.error ? '—' : String(warn.length), sub: warn[0] ? `${warn[0].event} · ${warn[0].region}` : 'Nema aktivnih upozorenja', tone: warn.some((w) => w.level >= 3) ? 'text-[#ba1a1a]' : warn.length ? 'text-[#8a4a00]' : 'text-[#002042]' },
    { icon: 'water', label: 'Neretva kod Mostara', value: mostar ? `${Math.round(mostar.discharge[mostar.todayIndex] ?? 0)} m³/s` : '—', sub: mostar ? `Vrh prognoze ${peakForecast(mostar)} m³/s (10 dana)` : 'Model GloFAS', tone: mostar?.status === 'VISOKO' ? 'text-[#ba1a1a]' : mostar?.status === 'POVISENO' ? 'text-[#8a4a00]' : 'text-[#002042]' },
    { icon: 'landslide', label: 'Klizišta u registru', value: String(d.landslides.length), sub: `${activeLs} aktivno ili u praćenju`, tone: activeLs ? 'text-[#8a4a00]' : 'text-[#002042]' },
  ];

  return (
    <div className="bg-[#f8f9ff] w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#062343] px-[16px] md:px-[32px] pt-[40px] pb-[72px]">
        <div aria-hidden className="absolute -right-[80px] -top-[120px] size-[420px] rounded-full bg-[#ba1a1a] opacity-[0.12] blur-[80px]" />
        <div aria-hidden className="absolute left-1/3 bottom-0 h-[140px] w-1/3 bg-[#00abeb] opacity-[0.12] blur-[60px]" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-[24px]">
          <div className="flex flex-col gap-[16px] max-w-[760px]">
            <Eyebrow light>Sistem ranog informisanja · Hercegovačko-neretvanski kanton</Eyebrow>
            <h1 className="font-pub font-bold text-white text-[34px] md:text-[44px] lg:text-[52px] tracking-[-0.9px] leading-[1.1]">Eko-rizik HNK</h1>
            <p className="font-pub text-[#d3e4fe] text-[16px] md:text-[18px] leading-[28px]">Požari, poplave i klizišta na jednom mjestu: satelitska žarišta, upozorenja Federalnog hidrometeorološkog zavoda, prognoza protoka Neretve i prijave građana.</p>
            <div className="flex flex-wrap gap-[8px] pt-[4px]">
              <Link href="/eko-rizik/prijava" className="bg-[#ba1a1a] hover:bg-[#93000a] text-white flex gap-[8px] items-center px-[20px] py-[12px] rounded-[4px] font-pub font-semibold text-[15px]"><Icon n="campaign" s={18} />Prijavi incident</Link>
              <Link href="/eko-rizik/krizni" className="bg-white/10 hover:bg-white/20 text-white flex gap-[8px] items-center px-[20px] py-[12px] rounded-[4px] font-pub font-semibold text-[15px]"><Icon n="monitor_heart" s={18} />Krizni prikaz</Link>
            </div>
          </div>
          <div className={`self-start lg:self-auto flex items-center gap-[16px] rounded-[8px] bg-white p-[16px] pr-[24px] ring-4 ${lv.ring}`} role="status" aria-live="polite">
            <span className={`flex items-center justify-center rounded-[8px] size-[56px] text-white ${lv.bg}`}><Icon n={lv.icon} s={30} /></span>
            <span className="flex flex-col">
              <span className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Procjena stanja</span>
              <span className={`font-pub font-bold text-[22px] leading-[28px] ${lv.text}`}>{lv.label}</span>
              <span className="font-rob text-[12px] text-[#737780]">Ažurirano {fmtTime(d.generatedAt)}</span>
            </span>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="relative px-[16px] md:px-[32px] -mt-[40px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-[8px] p-[16px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] flex flex-col gap-[6px] min-w-0">
              <div className="flex items-center justify-between gap-2"><p className="font-rob font-bold text-[#43474f] text-[12px] tracking-[0.96px] uppercase leading-[16px]">{k.label}</p><Icon n={k.icon} c="text-[#002042]" /></div>
              <p className={`font-rob font-extrabold text-[32px] tracking-[-0.9px] leading-[40px] ${k.tone}`}>{k.value}</p>
              <p className="font-pub text-[#43474f] text-[13px] leading-[20px] truncate" title={k.sub}>{k.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KARTA */}
      <section className="px-[16px] md:px-[32px] pt-[40px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-[8px] mb-[16px]">
          <div className="flex flex-col gap-[4px]"><Eyebrow>Karta rizika</Eyebrow><h2 className="font-pub font-bold text-[#002042] text-[24px] tracking-[-0.24px] leading-[32px]">Šta se trenutno dešava na terenu</h2></div>
          <p className="font-pub text-[#43474f] text-[13px] leading-[20px] max-w-[520px]">Uključite ili isključite slojeve iznad karte. Klik na oznaku otvara detalje. Satelitska žarišta su toplotne anomalije i ne moraju biti potvrđeni požari.</p>
        </div>
        <RiskMap data={d} />
      </section>

      {/* UPOZORENJA + RIJEKE */}
      <section className="px-[16px] md:px-[32px] pt-[40px] grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        <div className="lg:col-span-5 flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]"><Eyebrow>Meteoalarm · FHMZ BiH</Eyebrow><h2 className="font-pub font-bold text-[#002042] text-[24px] leading-[32px]">Meteorološka upozorenja</h2></div>
          <div className="flex flex-col gap-[8px]">
            {warn.length === 0 && (
              <div className="bg-white rounded-[8px] p-[16px] flex gap-[12px] items-center shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <Icon n={d.warnings.error ? 'cloud_off' : 'check_circle'} c={d.warnings.error ? 'text-[#737780]' : 'text-[#006c4a]'} />
                <p className="font-pub text-[14px] text-[#43474f]">{d.warnings.error ? 'Upozorenja trenutno nije moguće preuzeti. Provjerite meteoalarm.org.' : 'Za regije Mostar, Livno i Trebinje trenutno nema aktivnih upozorenja.'}</p>
              </div>
            )}
            {warn.slice(0, 5).map((w, i) => (
              <article key={i} className="bg-white rounded-[8px] p-[16px] flex gap-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border-l-[6px]" style={{ borderLeftColor: WARN_COLOR[w.color] ?? '#fadc12' }}>
                <div className="flex flex-col gap-[4px] min-w-0">
                  <p className="font-pub font-bold text-[#002042] text-[15px] leading-[22px]">{w.event}</p>
                  <p className="font-rob text-[12px] text-[#737780]">Regija {w.region} · {fmtTime(w.onset)} – {fmtTime(w.expires)}</p>
                  {w.description && <p className="font-pub text-[13px] leading-[20px] text-[#334155]">{w.description}</p>}
                  {w.instruction && <p className="font-pub text-[13px] leading-[20px] text-[#006c4a]">{w.instruction}</p>}
                </div>
              </article>
            ))}
            {warn.length > 5 && (
              <details className="group">
                <summary className="cursor-pointer font-pub font-semibold text-[14px] text-[#002042] py-[6px]">Prikaži još {warn.length - 5} upozorenja</summary>
                <div className="flex flex-col gap-[8px] pt-[8px]">
                {warn.slice(5).map((w, i) => (
              <article key={i} className="bg-white rounded-[8px] p-[16px] flex gap-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border-l-[6px]" style={{ borderLeftColor: WARN_COLOR[w.color] ?? '#fadc12' }}>
                <div className="flex flex-col gap-[4px] min-w-0">
                  <p className="font-pub font-bold text-[#002042] text-[15px] leading-[22px]">{w.event}</p>
                  <p className="font-rob text-[12px] text-[#737780]">Regija {w.region} · {fmtTime(w.onset)} – {fmtTime(w.expires)}</p>
                  {w.description && <p className="font-pub text-[13px] leading-[20px] text-[#334155]">{w.description}</p>}
                  {w.instruction && <p className="font-pub text-[13px] leading-[20px] text-[#006c4a]">{w.instruction}</p>}
                </div>
              </article>
                ))}
                </div>
              </details>
            )}
            <SourceNote err={d.warnings.error} at={d.warnings.updatedAt} src="Meteoalarm" />
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]"><Eyebrow>Copernicus GloFAS · Open-Meteo</Eyebrow><h2 className="font-pub font-bold text-[#002042] text-[24px] leading-[32px]">Protok Neretve i Bune</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {d.rivers.items.map((r) => <RiverChart key={r.key} r={r} />)}
            {d.rivers.items.length === 0 && <p className="font-pub text-[14px] text-[#43474f]">Model protoka trenutno nije dostupan.</p>}
          </div>
          <p className="font-pub text-[12px] leading-[18px] text-[#737780]">Vrijednosti su procjena hidrološkog modela GloFAS (rezolucija ~5 km), a ne mjerenja vodomjernih stanica. Status se računa u odnosu na protok iz zadnjih 60 dana. Službene informacije o vodostajima daju FHMZ i Agencija za vodno područje Jadranskog mora.</p>
          <SourceNote err={d.rivers.error} at={d.rivers.updatedAt} src="GloFAS" />
        </div>
      </section>

      {/* ŽARIŠTA + KLIZIŠTA */}
      <section className="px-[16px] md:px-[32px] pt-[40px] grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <div className="bg-white rounded-[8px] p-[24px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[12px]">
          <div className="flex items-center justify-between gap-2"><h2 className="flex gap-[8px] items-center font-pub font-semibold text-[#002042] text-[20px] leading-[28px]"><Icon n="local_fire_department" c="text-[#ba1a1a]" />Satelitska žarišta</h2><span className="font-rmono text-[12px] text-[#737780]">VIIRS 375 m</span></div>
          {fires.length === 0 ? (
            <p className="font-pub text-[14px] text-[#43474f]">{d.fires.error ? 'Podaci NASA FIRMS trenutno nisu dostupni.' : 'U posljednja 72 sata sateliti nisu zabilježili toplotne anomalije na području kantona.'}</p>
          ) : (
            <ul className="divide-y divide-[#eff4ff]">
              {fires.slice(0, 8).map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-[12px] py-[8px] font-rob text-[13px]">
                  <span className="flex flex-col"><span className="font-semibold text-[#002042]">{fireTime(f)}</span><span className="text-[#737780]">{f.lat.toFixed(3)}° N, {f.lng.toFixed(3)}° E</span></span>
                  <span className="text-right text-[#43474f]">pouzdanost {fireConfidence(f.confidence)}<br />{f.frp != null ? `${f.frp} MW` : ''}</span>
                </li>
              ))}
            </ul>
          )}
          <SourceNote err={d.fires.error} at={d.fires.updatedAt} src="NASA FIRMS" />
        </div>
        <div className="bg-white rounded-[8px] p-[24px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[12px]">
          <div className="flex items-center justify-between gap-2"><h2 className="flex gap-[8px] items-center font-pub font-semibold text-[#002042] text-[20px] leading-[28px]"><Icon n="landslide" c="text-[#7a4a1f]" />Registar klizišta</h2><span className="font-rmono text-[12px] text-[#737780]">CMS · MTTO</span></div>
          {d.landslides.length === 0 && <p className="font-pub text-[14px] text-[#43474f]">Registar je prazan.</p>}
          <ul className="divide-y divide-[#eff4ff]">
            {d.landslides.map((l) => {
              const st = LS_STATUS[l.status] ?? LS_STATUS.PRACENJE;
              return (
                <li key={l.id} className="flex items-start justify-between gap-[12px] py-[10px]">
                  <span className="flex flex-col min-w-0">
                    <span className="font-pub font-semibold text-[#002042] text-[14px] leading-[20px]">{l.name}{l.isDemo && <span className="ml-[6px] align-middle px-[6px] py-[1px] rounded-[2px] bg-[#fffde6] border border-[#fadc12] text-[#786000] text-[10px] font-bold uppercase">Demo</span>}</span>
                    <span className="font-rob text-[12px] text-[#737780]">{l.municipality} · rizik {l.risk}/3</span>
                  </span>
                  <span className={`shrink-0 px-[8px] py-[2px] rounded-[2px] font-pub font-bold text-[11px] tracking-[0.44px] uppercase leading-[14px] ${st.cls}`}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* PRIJAVE GRAĐANA */}
      <section className="px-[16px] md:px-[32px] pt-[40px]">
        <div className="bg-white rounded-[8px] p-[24px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[16px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[12px]">
            <div className="flex flex-col gap-[4px]"><Eyebrow>Građani kao senzori</Eyebrow><h2 className="font-pub font-bold text-[#002042] text-[24px] leading-[32px]">Potvrđene prijave građana</h2></div>
            <Link href="/eko-rizik/prijava" className="self-start bg-[#002042] hover:bg-[#062343] text-white flex gap-[8px] items-center px-[16px] py-[10px] rounded-[4px] font-pub font-semibold text-[14px]"><Icon n="add_location_alt" s={18} />Nova prijava</Link>
          </div>
          {d.reports.length === 0 ? (
            <p className="font-pub text-[14px] text-[#43474f]">Prijave se ovdje prikazuju nakon što ih službenik Ministarstva provjeri, bez ličnih podataka prijavitelja.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
              {d.reports.slice(0, 9).map((r) => (
                <article key={r.id} className="rounded-[8px] bg-[#f8f9ff] p-[16px] flex flex-col gap-[6px]">
                  <div className="flex items-center justify-between gap-2"><span className="font-rmono text-[12px] text-[#737780]">{r.code}</span><span className="px-[8px] py-[2px] rounded-[2px] bg-[#eff4ff] text-[#002042] font-pub font-bold text-[11px] uppercase">{REPORT_STATUS[r.status] ?? r.status}</span></div>
                  <p className="font-pub font-semibold text-[#002042] text-[15px] leading-[22px]">{r.kindLabel}</p>
                  <p className="font-rob text-[12px] text-[#737780]">{r.municipality}{r.location ? ` · ${r.location}` : ''} · {fmtTime(r.createdAt)}</p>
                  <p className="font-pub text-[13px] leading-[20px] text-[#334155] line-clamp-3">{r.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ŠTA RADITI */}
      <section className="px-[16px] md:px-[32px] py-[40px]">
        <div className="flex flex-col gap-[4px] mb-[16px]"><Eyebrow>Priprema i postupanje</Eyebrow><h2 className="font-pub font-bold text-[#002042] text-[24px] leading-[32px]">Šta učiniti u slučaju opasnosti</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {[
            { icon: 'local_fire_department', t: 'Požar', c: 'bg-[#ffdad6] text-[#ba1a1a]', items: ['Odmah pozovite vatrogasce na 123.', 'Ne palite vatru na otvorenom tokom sušnog perioda.', 'Udaljite se niz vjetar i ne vraćajte se po stvari.'] },
            { icon: 'flood', t: 'Poplava i bujica', c: 'bg-[#dce9ff] text-[#002042]', items: ['Pratite upozorenja i ne prelazite preko poplavljenih puteva.', 'Isključite struju i plin ako voda ulazi u objekat.', 'Za pomoć pozovite Civilnu zaštitu na 121.'] },
            { icon: 'landslide', t: 'Klizište i odron', c: 'bg-[#fffbeb] text-[#8a4a00]', items: ['Uočene pukotine u tlu ili na zidovima prijavite općinskoj službi civilne zaštite.', 'Izbjegavajte kosine i puteve ispod njih nakon jakih kiša.', 'Prijavite lokaciju Ministarstvu putem Eko-prijave.'] },
          ].map((b) => (
            <div key={b.t} className="bg-white rounded-[8px] p-[24px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[12px]">
              <span className={`flex items-center justify-center rounded-[4px] size-[44px] ${b.c}`}><Icon n={b.icon} s={24} /></span>
              <h3 className="font-pub font-semibold text-[#0f172a] text-[20px] leading-[28px]">{b.t}</h3>
              <ul className="flex flex-col gap-[6px]">{b.items.map((it) => <li key={it} className="flex gap-[8px] font-pub text-[14px] leading-[22px] text-[#334155]"><span className="mt-[9px] size-[6px] rounded-full bg-[#006c4a] shrink-0" />{it}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-[16px] bg-[#062343] rounded-[8px] p-[20px] md:p-[24px] flex flex-col md:flex-row md:items-center md:justify-between gap-[16px]">
          <p className="font-pub font-semibold text-white text-[16px] leading-[24px]">Hitni brojevi</p>
          <div className="flex flex-wrap gap-[8px]">
            {[['121', 'Civilna zaštita'], ['123', 'Vatrogasci'], ['124', 'Hitna pomoć'], ['122', 'Policija']].map(([n, l]) => (
              <a key={n} href={`tel:${n}`} className="bg-white/10 hover:bg-white/20 rounded-[4px] px-[14px] py-[8px] flex items-baseline gap-[8px] text-white"><span className="font-rob font-extrabold text-[20px]">{n}</span><span className="font-pub text-[13px] text-[#d3e4fe]">{l}</span></a>
            ))}
          </div>
        </div>
        <p className="mt-[16px] font-pub text-[12px] leading-[18px] text-[#737780] max-w-[900px]">Izvori: NASA FIRMS (VIIRS), EFFIS – Copernicus Emergency Management Service, Meteoalarm / Federalni hidrometeorološki zavod, Copernicus GloFAS putem Open-Meteo, registar klizišta i prijave građana MTTO. Stranica služi za informisanje i ne zamjenjuje službena upozorenja nadležnih službi.</p>
      </section>
    </div>
  );
}
