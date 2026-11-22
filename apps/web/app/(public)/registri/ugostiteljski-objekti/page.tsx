import { apiSafe, type Facility } from '@/lib/api';
import { dateShort, dateLong } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar kategoriziranih ugostiteljskih objekata' };

const KINDS = ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp'];
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const fmt = (n: number) => n.toLocaleString('bs-BA');
const Icon = ({ name, size = 18, className = '', fill = false }: { name: string; size?: number; className?: string; fill?: boolean }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${className}`} style={{ fontSize: size, ...(fill ? { fontVariationSettings: "'FILL' 1" } : {}) }}>{name}</span>
);
const sel = 'w-full appearance-none bg-[#eff4ff] rounded-[8px] pl-[12px] pr-[32px] py-[10px] font-pub text-[13px] leading-[20px] text-[#0b1c30] border-0 focus:outline-none focus:ring-2 focus:ring-[#00abeb] cursor-pointer';
const COLS = 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,0.6fr)_minmax(0,0.85fr)_minmax(0,0.8fr)_72px]';

function Kpi({ label, icon, value, sub, bar, pct, accent }: { label: string; icon: string; value: string; sub: string; bar: string; pct: number; accent?: boolean }) {
  return (
    <div className="bg-white flex flex-col gap-[10px] p-[16px] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] min-w-0">
      <div className="flex items-center justify-between gap-2"><p className="font-rob font-bold text-[#43474f] text-[12px] tracking-[0.96px] uppercase leading-[16px]">{label}</p><Icon name={icon} className="text-[#002042]" /></div>
      <div className="py-[4px]">
        <p className={`font-rob font-extrabold text-[30px] md:text-[36px] tracking-[-0.9px] leading-[44px] ${accent ? 'text-[#006c4a]' : 'text-[#002042]'}`}>{value}</p>
        <p className="font-pub text-[#43474f] text-[13px] leading-[20px]">{sub}</p>
      </div>
      <div className="bg-[#e5eeff] h-[6px] overflow-hidden rounded-[12px] mt-auto"><div className={`h-full rounded-[12px] ${bar}`} style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} /></div>
    </div>
  );
}

export default async function FacilitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'kind', 'municipality', 'stars']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows, all] = await Promise.all([apiSafe<Facility[]>(`/facilities?${qs}`, []), apiSafe<Facility[]>('/facilities', [])]);
  const total = all.length || 1;
  const beds = all.reduce((s, f) => s + (f.beds || 0), 0);
  const hotels = all.filter((f) => f.kind === 'Hotel' && (f.stars ?? 0) >= 4).length;
  const motels = all.filter((f) => ['Motel', 'Pansion'].includes(f.kind)).length;
  const priv = all.filter((f) => ['Apartmani', 'Kamp'].includes(f.kind)).length;
  const demo = all.some((f) => f.isDemo);
  const csv = `/registri/ugostiteljski-objekti/csv${qs.toString() ? `?${qs}` : ''}`;

  return (
    <div className="bg-[#f8f9ff] w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#062343] pt-[40px] pb-[72px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <div aria-hidden className="absolute bg-[#006c4a] blur-[64px] opacity-10 -right-[64px] rounded-[12px] size-[384px] -top-[96px]" />
        <div aria-hidden className="absolute bg-[#0a3663] blur-[40px] bottom-0 h-[128px] left-1/3 opacity-20 right-[41.67%]" />
        <div className="relative px-[16px] md:px-[24px] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-[24px]">
          <div className="flex flex-col gap-[16px] max-w-[760px]">
            <p className="self-start bg-[rgba(0,108,74,0.2)] flex gap-[4px] items-center px-[10px] py-[4px] rounded-[2px] font-pub font-bold text-[#85f8c4] text-[11px] tracking-[0.44px] leading-[14px]"><Icon name="hotel" size={14} />JAVNI REGISTAR SMJEŠTAJA HNK</p>
            <h1 className="font-pub font-bold text-white text-[32px] md:text-[40px] lg:text-[48px] tracking-[-0.9px] leading-[40px] md:leading-[48px] lg:leading-[56px]">Registar kategoriziranih ugostiteljskih objekata</h1>
            <p className="font-pub text-white text-[16px] md:text-[18px] leading-[26px] md:leading-[28px] max-w-[667px]">Službeni registar hotela, motela, pansiona, kampova i objekata za iznajmljivanje s dodijeljenom kategorijom na području 9 općina i gradova Hercegovačko-neretvanskog kantona.</p>
          </div>
          <div className="self-start lg:self-auto backdrop-blur-[8px] bg-[rgba(0,32,66,0.6)] flex gap-[8px] p-[8px] rounded-[4px]">
            <a href={csv} className="bg-white hover:bg-[#ecfdf5] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[4px] items-center px-[16px] py-[8px] rounded-[2px] font-pub font-semibold text-[#006c4a] text-[14px] tracking-[0.14px] leading-[20px]"><Icon name="download" size={16} />Preuzmi CSV</a>
            <a href={csv} className="bg-white hover:bg-[#ecfdf5] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[4px] items-center px-[16px] py-[8px] rounded-[2px] font-pub font-semibold text-[#006c4a] text-[14px] tracking-[0.14px] leading-[20px]"><Icon name="table_view" size={16} />Za Excel</a>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="relative px-[16px] md:px-[24px] -mt-[32px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[16px]">
          <Kpi label="Ukupno objekata" icon="domain" value={fmt(all.length)} sub="Upisanih rješenja MTTO" bar="bg-[#002042]" pct={100} />
          <Kpi label="Ležajni kapacitet" icon="bed" value={fmt(beds)} sub="Registriranih ležaja" bar="bg-[#0a3663]" pct={80} />
          <Kpi label="Hoteli 4★ i 5★" icon="hotel_class" value={fmt(hotels)} sub="Visoka kategorija" bar="bg-[#eb851c]" pct={(hotels / total) * 100} />
          <Kpi label="Moteli i pansioni" icon="night_shelter" value={fmt(motels)} sub="Prolazni i hodočasnički turizam" bar="bg-[#3d608f]" pct={(motels / total) * 100} />
          <Kpi label="Apartmani i kampovi" icon="cottage" value={fmt(priv)} sub="Ruralni turizam i privatni smještaj" bar="bg-[#006c4a]" pct={(priv / total) * 100} accent />
        </div>
      </section>

      {demo && (
        <div className="px-[16px] md:px-[24px] pt-[24px]">
          <p className="flex items-start gap-[8px] p-[16px] rounded-[8px] bg-[#fffde6] border border-[#fadc12] text-[#786000] font-pub text-[13px] leading-[20px]"><Icon name="science" />Prikazani su demo objekti. Stvarni popis kategoriziranih objekata uvozi se iz evidencije Sektora za turizam pri migraciji.</p>
        </div>
      )}

      {/* FILTER */}
      <section className="px-[16px] md:px-[24px] pt-[24px] lg:pt-[40px]">
        <form action="/registri/ugostiteljski-objekti" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] p-[16px] md:p-[24px] rounded-[8px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[12px]">
            <label className="relative w-full lg:w-[389px]">
              <span className="sr-only">Pretraga</span>
              <Icon name="search" size={18} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#737780]" />
              <input name="q" defaultValue={sp.q} placeholder="Pretraži po nazivu objekta ili naselju…" className="w-full bg-[#eff4ff] rounded-[8px] pl-[44px] pr-[16px] py-[13px] font-pub text-[15px] text-[#0b1c30] placeholder:text-[#737780] border-0 focus:outline-none focus:ring-2 focus:ring-[#00abeb]" />
            </label>
            <div className="flex flex-wrap gap-[8px] items-center lg:justify-end">
              <label className="relative min-w-[170px] flex-1 sm:flex-none"><span className="sr-only">Općina</span><select name="municipality" defaultValue={sp.municipality ?? ''} className={sel}><option value="">Sve općine/gradovi (9)</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select><Icon name="expand_more" className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#43474f] pointer-events-none" /></label>
              <label className="relative min-w-[150px] flex-1 sm:flex-none"><span className="sr-only">Zvjezdice</span><select name="stars" defaultValue={sp.stars ?? ''} className={sel}><option value="">Sve zvjezdice</option>{[5, 4, 3, 2].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</select><Icon name="expand_more" className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#43474f] pointer-events-none" /></label>
              <label className="relative min-w-[160px] flex-1 sm:flex-none"><span className="sr-only">Vrsta</span><select name="kind" defaultValue={sp.kind ?? ''} className={sel}><option value="">Sve vrste objekata</option>{KINDS.map((m) => <option key={m}>{m}</option>)}</select><Icon name="expand_more" className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#43474f] pointer-events-none" /></label>
              <button className="bg-[#002042] hover:bg-[#062343] text-white flex gap-[4px] items-center px-[16px] py-[10px] rounded-[8px] font-pub font-semibold text-[14px] leading-[20px]"><Icon name="filter_alt" />Primijeni</button>
              <a href="/registri/ugostiteljski-objekti" title="Poništi filtere" aria-label="Poništi filtere" className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002042] p-[10px] rounded-[8px]"><Icon name="restart_alt" /></a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[8px] border-t border-[#eff4ff] pt-[16px] font-rob text-[#737780] text-[13px] leading-[20px]">
            <p>Prikazano: <b className="text-[#002042]">{rows.length}</b> od <b>{fmt(all.length)}</b> rješenja <span className="mx-[8px]">|</span> Podaci ažurirani: {dateLong(new Date())}</p>
            <p className="flex gap-[4px] items-center"><Icon name="gavel" size={15} />Evidencija prema Zakonu o ugostiteljskoj djelatnosti HNK</p>
          </div>
        </form>
      </section>

      {/* TABLICA */}
      <section className="px-[16px] md:px-[24px] pt-[16px] pb-[48px]">
        <div className="bg-white rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className={`hidden lg:grid ${COLS} gap-[16px] bg-[#eff4ff] px-[16px] py-[14px] font-rob font-bold text-[#43474f] text-[12px] tracking-[0.96px] uppercase leading-[16px]`}>
            <span>Naziv objekta i reg. broj</span><span>Jedinica / adresa</span><span>Kategorija i vrsta</span><span>Kapacitet</span><span>Službeno rješenje</span><span>Status</span><span className="text-right">Radnje</span>
          </div>
          {rows.length === 0 && <p className="py-[40px] text-center font-pub text-[14px] text-[#737780]">Nema objekata za odabrane kriterije.</p>}
          {rows.map((f, i) => (
            <div key={f.id} className={`grid grid-cols-2 ${COLS} gap-x-[16px] gap-y-[12px] lg:items-center p-[16px] border-t border-[#eff4ff] first:border-0 hover:bg-[#f8f9ff]`}>
              <div className="col-span-2 lg:col-span-1 flex flex-col gap-[4px] min-w-0">
                <p className="font-rob font-bold text-[#002042] text-[16px] leading-[26px]">{f.name}</p>
                <div className="flex flex-wrap gap-[6px] items-center">
                  <span className="bg-[#e5eeff] px-[6px] py-[2px] rounded-[2px] font-rob font-bold text-[#002042] text-[11px] tracking-[0.44px] leading-[14px]">Reg: HNK-UG-{String(i + 1).padStart(3, '0')}</span>
                  {f.isDemo && <span className="px-[6px] py-[1px] rounded-[2px] bg-[#fffde6] border border-[#fadc12] text-[#786000] text-[10px] font-bold uppercase">Demo</span>}
                </div>
              </div>
              <div className="flex flex-col min-w-0 font-rob text-[13px] leading-[20px]"><span className="font-bold text-[#0b1c30]">{f.municipality}</span><span className="text-[#737780]">{f.address}</span></div>
              <div className="flex flex-col gap-[2px]">
                <span className="flex" aria-label={f.stars ? `${f.stars} zvjezdica` : 'Bez kategorije'}>{[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={15} fill={n <= (f.stars ?? 0)} className={n <= (f.stars ?? 0) ? 'text-[#eb851c]' : 'text-[#c3c6d0]'} />)}</span>
                <span className="font-rob font-semibold text-[#0a3663] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{f.kind}{f.stars ? ` (${f.stars}★)` : ''}</span>
              </div>
              <div className="flex flex-col font-rob text-[13px] leading-[20px]"><span className="font-semibold text-[#002042]">{f.rooms ?? '—'} jedinica</span><span className="text-[#737780]">{f.beds ?? '—'} ležaja</span></div>
              <div className="flex flex-col font-rob text-[13px] leading-[20px]"><span className="font-semibold text-[#0b1c30]">{f.decisionNumber || '—'}</span><span className="text-[#737780]">Izdano: {dateShort(f.decisionDate)}</span></div>
              <div><span className="bg-[#82f5c1] px-[8px] py-[2px] rounded-[2px] font-rob font-bold text-[#00714e] text-[11px] tracking-[0.44px] leading-[14px]">AKTIVNO</span></div>
              <div className="col-span-2 lg:col-span-1 flex lg:justify-end gap-[4px]">
                {f.lat != null && <a href="/mapa" title="Prikaži na mapi" aria-label={`${f.name} na mapi`} className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002042] p-[6px] rounded-[4px]"><Icon name="location_on" /></a>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
