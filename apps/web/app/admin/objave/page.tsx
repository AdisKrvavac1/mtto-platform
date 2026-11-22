'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { F2Badge, PageTitle, useToast } from '@/components/admin/ui';
import { dateShort, POST_TYPE } from '@/lib/format';

type Row = { id: string; slug: string; title: string; excerpt: string; status: string; type: string; category: string; publishedAt: string | null; updatedAt: string; views: number; authorName: string; coverImage: string | null; isDemo: boolean };

const ST: Record<string, [string, string, string]> = {
  OBJAVLJENO: ['Objavljeno', 'bg-secondary/15 text-secondary', 'bg-secondary'],
  NACRT: ['Nacrt', 'bg-surface-container-high text-on-surface-variant', 'bg-outline'],
  ZAKAZANO: ['Zakazano', 'bg-amber-light text-[#7a6100]', 'bg-on-tertiary-container'],
};
const CAT: Record<string, string> = { 'Zaštita okoliša': 'bg-emerald-light text-on-secondary-container', Turizam: 'bg-[#e0f6ff] text-[#007ba8]', Trgovina: 'bg-amber-light text-[#7a6100]', Opće: 'bg-surface-container-high text-primary' };
const sel = 'w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 text-body-sm text-text-heading focus:outline-none focus:ring-1 focus:ring-primary-container appearance-none cursor-pointer';

export default function PostsAdmin() {
  const [all, setAll] = useState<Row[] | null>(null);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const toast = useToast();

  const load = () => adminFetch<Row[]>('/admin/posts').then(setAll).catch((e) => toast.err(e.message));
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get('q') ?? ''); load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => (all ?? []).filter((r) => (!status || r.status === status) && (!type || r.type === type) && (!cat || r.category === cat) && (!q || r.title.toLowerCase().includes(q.toLowerCase()))), [all, status, type, cat, q]);
  const n = (s: string) => (all ?? []).filter((r) => r.status === s).length;
  const views = (all ?? []).reduce((s, r) => s + r.views, 0);
  const total = all?.length || 1;
  const focus = (all ?? []).find((r) => r.type === 'JAVNI_POZIV' && r.status === 'OBJAVLJENO') ?? (all ?? [])[0];

  async function setStatusOf(ids: string[], s: string) {
    try {
      await Promise.all(ids.map((id) => adminFetch(`/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ status: s }) })));
      toast.ok(s === 'OBJAVLJENO' ? 'Objavljeno na portalu' : 'Vraćeno u nacrt');
      setPicked(new Set());
      load();
    } catch (e: any) { toast.err(e.message); }
  }
  async function removeMany(ids: string[]) {
    if (!ids.length || !confirm(`Trajno obrisati ${ids.length} objav${ids.length === 1 ? 'u' : 'e'}? Ova radnja se ne može poništiti.`)) return;
    try {
      await Promise.all(ids.map((id) => adminFetch(`/admin/posts/${id}`, { method: 'DELETE' })));
      toast.ok('Obrisano');
      setPicked(new Set());
      load();
    } catch (e: any) { toast.err(e.message); }
  }
  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Naslov', 'Vrsta', 'Resor', 'Status', 'Objavljeno', 'Pregleda'].join(';'), ...rows.map((r) => [r.title, POST_TYPE[r.type], r.category, ST[r.status]?.[0], dateShort(r.publishedAt), r.views].map(esc).join(';'))];
    const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    Object.assign(document.createElement('a'), { href: url, download: 'mtto-objave.csv' }).click();
    URL.revokeObjectURL(url);
  }
  const toggle = (id: string) => setPicked((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allPicked = rows.length > 0 && rows.every((r) => picked.has(r.id));

  const stat = (label: string, icon: string, iconCls: string, value: string | number, note: React.ReactNode, bar: string, pct: number) => (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between"><span className="font-label-kicker text-label-kicker uppercase tracking-wider text-outline">{label}</span><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}><span className="material-symbols-outlined text-[18px]">{icon}</span></div></div>
      <div className="my-space-sm"><div className="font-headline-lg text-headline-lg text-text-heading">{value}</div>{note}</div>
      <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden"><div className={`${bar} h-full rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} /></div>
    </div>
  );

  return (
    <>
      <PageTitle kicker="Vijesti i obavijesti" crumbs={['Vijesti i obavijesti', 'Pregled svih objava']} title="Upravljanje objavama, vijestima i priopćenjima">
        <button type="button" onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-text-heading hover:bg-surface-container font-button text-button transition-colors"><span className="material-symbols-outlined text-[18px]">download</span><span>Izvoz (CSV)</span></button>
        <button type="button" disabled title="Upravljanje kategorijama i tagovima: Faza 2" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-outline font-button text-button cursor-not-allowed"><span className="material-symbols-outlined text-[18px]">label</span><span>Kategorije i tagovi</span></button>
        <Link href="/admin/objave/nova" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary hover:brightness-110 font-button text-button shadow-sm transition-all"><span className="material-symbols-outlined text-[19px]">add_circle</span><span>Nova objava / članak</span></Link>
      </PageTitle>

      <div className="flex flex-col gap-space-lg">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {stat('Ukupno objavljeno', 'newspaper', 'bg-surface-container-low text-primary', n('OBJAVLJENO'), <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 font-semibold mt-1"><span className="material-symbols-outlined text-[16px]">public</span>Vidljivo na portalu</p>, 'bg-primary', (n('OBJAVLJENO') / total) * 100)}
          {stat('Radne verzije', 'edit_note', 'bg-amber-light text-on-tertiary-container', n('NACRT'), <p className="font-body-sm text-body-sm text-outline mt-1">Čeka uređivanje ili odobrenje</p>, 'bg-on-tertiary-container', (n('NACRT') / total) * 100)}
          {stat('Zakazano za objavu', 'schedule_send', 'bg-surface-container-high text-primary', n('ZAKAZANO'), <p className="font-body-sm text-body-sm text-primary flex items-center gap-1 font-semibold mt-1"><span className="material-symbols-outlined text-[16px]">sync</span>Automatsko objavljivanje</p>, 'bg-surface-tint', (n('ZAKAZANO') / total) * 100)}
          {stat('Pregledi građana', 'visibility', 'bg-emerald-light text-secondary', views.toLocaleString('bs-BA'), <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 font-semibold mt-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span>Ukupno od pokretanja</p>, 'bg-secondary', 92)}
        </section>

        {focus && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row gap-space-md">
              <div className="w-full md:w-56 h-36 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-low bg-cover bg-center" style={focus.coverImage ? { backgroundImage: `url('${focus.coverImage}')` } : undefined}>
                <span className="absolute top-2 left-2 font-label-badge text-label-badge px-2 py-0.5 rounded bg-institutional-navy-deep/80 text-on-primary uppercase">CMS fokus</span>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-1">
                <span className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary">Aktualna objava · {POST_TYPE[focus.type]}</span>
                <h3 className="font-title-md text-title-md font-bold text-text-heading leading-snug">{focus.title}</h3>
                <p className="font-body-sm text-body-sm text-outline line-clamp-2">{focus.excerpt}</p>
                <div className="flex items-center gap-space-sm pt-1">
                  <Link href={`/admin/objave/${focus.id}`} className="font-button text-button text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">edit</span>Uredi</Link>
                  {focus.status === 'OBJAVLJENO' && <a href={`/vijesti/${focus.slug}`} target="_blank" rel="noopener" className="font-button text-button text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">open_in_new</span>Na portalu</a>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-primary rounded-xl p-space-md text-on-primary shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between"><span className="font-label-kicker text-label-kicker uppercase tracking-wider text-primary-fixed">Angažman čitatelja</span><span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-white/15">Uživo</span></div>
              <div className="my-2"><div className="font-headline-lg text-headline-lg">{(focus.views ?? 0).toLocaleString('bs-BA')}</div><p className="font-body-sm text-body-sm text-primary-fixed">pregleda fokus objave · {views.toLocaleString('bs-BA')} ukupno</p></div>
              <div className="flex items-end gap-1 h-12">{(all ?? []).slice(0, 12).map((r) => <div key={r.id} className="flex-1 bg-white/30 rounded-t" style={{ height: `${Math.max(8, (r.views / Math.max(1, ...(all ?? []).map((x) => x.views))) * 100)}%` }} />)}</div>
            </div>
          </div>
        )}

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm">
            <div className="lg:col-span-6 relative flex items-center"><span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span><input className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border-0 text-body-sm text-text-heading placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container" placeholder="Pretraži naslove objava..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="lg:col-span-2"><select className={sel} value={type} onChange={(e) => setType(e.target.value)}><option value="">Sve vrste</option>{Object.entries(POST_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="lg:col-span-2"><select className={sel} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Svi resori</option>{Object.keys(CAT).map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="lg:col-span-2"><select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Svi statusi</option><option value="OBJAVLJENO">Objavljeno</option><option value="NACRT">Nacrt</option><option value="ZAKAZANO">Zakazano</option></select></div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-space-sm pt-2">
            <div className="flex items-center flex-wrap gap-2 text-body-sm font-body-sm">
              <span className="text-outline">Aktivni filtri:</span>
              {[[status && ST[status]?.[0], () => setStatus('')], [type && POST_TYPE[type], () => setType('')], [cat, () => setCat('')], [q && `„${q}”`, () => setQ('')]].filter(([l]) => l).map(([l, f], i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-primary text-body-sm"><span>{l as string}</span><button type="button" onClick={f as () => void} className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[14px]">close</span></button></span>
              ))}
              {!(status || type || cat || q) && <span className="text-outline">nema</span>}
              {(status || type || cat || q) && <button type="button" onClick={() => { setStatus(''); setType(''); setCat(''); setQ(''); }} className="text-primary hover:underline text-body-sm ml-1 font-semibold">Očisti sve filtre</button>}
            </div>
            <span className="text-body-sm text-outline font-body-sm">Prikazano: <strong className="text-text-heading">{rows.length}</strong> od {all?.length ?? 0} zapisa</span>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
          <div className="flex items-center gap-space-md">
            <label className="flex items-center gap-2 cursor-pointer"><input className="w-4 h-4 rounded accent-primary cursor-pointer" type="checkbox" checked={allPicked} onChange={() => setPicked(allPicked ? new Set() : new Set(rows.map((r) => r.id)))} /><span className="font-button text-button text-text-heading select-none">Označi sve na stranici</span></label>
            <span className="h-4 w-[1px] bg-outline-variant hidden sm:block" />
            <span className="text-body-sm font-body-sm text-outline">Odabrano: {picked.size} objava</span>
          </div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <button type="button" disabled={!picked.size} onClick={() => setStatusOf([...picked], 'OBJAVLJENO')} className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-text-heading hover:bg-surface-container transition-all font-button text-button shadow-sm flex items-center gap-1.5 disabled:opacity-50"><span className="material-symbols-outlined text-[16px] text-secondary">publish</span><span>Objavi odabrano</span></button>
            <button type="button" disabled={!picked.size} onClick={() => setStatusOf([...picked], 'NACRT')} className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-text-heading hover:bg-surface-container transition-all font-button text-button shadow-sm flex items-center gap-1.5 disabled:opacity-50"><span className="material-symbols-outlined text-[16px] text-tertiary">archive</span><span>Povuci u nacrt</span></button>
            <button type="button" disabled={!picked.size} onClick={() => removeMany([...picked])} className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-all font-button text-button shadow-sm flex items-center gap-1.5 disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">delete</span><span>Obriši odabrano</span></button>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-surface-container-low text-outline font-label-kicker text-[11px] uppercase tracking-wider select-none">
                <th className="p-space-md w-12 text-center"><span className="sr-only">Odabir</span></th><th className="p-space-md min-w-[280px]">Naslov i sažetak</th><th className="p-space-md min-w-[170px]">Kategorija</th><th className="p-space-md min-w-[160px]">Autor</th><th className="p-space-md min-w-[150px]">Datum i status</th><th className="p-space-md min-w-[130px]">Pregledi</th><th className="p-space-md w-44 text-right pr-space-lg">Brze akcije</th>
              </tr></thead>
              <tbody className="text-text-body font-body-regular text-body-regular">
                {all === null && <tr><td colSpan={7} className="p-space-lg"><div className="h-24 rounded-lg bg-surface-container-low animate-pulse" /></td></tr>}
                {all && rows.length === 0 && <tr><td colSpan={7} className="p-space-lg text-center text-outline">Nema objava za odabrane filtre.</td></tr>}
                {rows.map((r) => {
                  const [sl, sc, sd] = ST[r.status] ?? ST.NACRT;
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low/60 transition-colors group">
                      <td className="p-space-md text-center align-top pt-5"><input className="w-4 h-4 rounded accent-primary cursor-pointer" type="checkbox" checked={picked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                      <td className="p-space-md align-top">
                        <div className="flex items-start gap-3">
                          {r.coverImage && <div className="hidden xl:block w-16 h-12 rounded-lg bg-surface-container bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${r.coverImage}')` }} />}
                          <div className="min-w-0">
                            <Link href={`/admin/objave/${r.id}`} className="font-title-md text-title-md font-bold text-primary group-hover:text-secondary transition-colors block leading-snug">{r.title}</Link>
                            {r.excerpt && <p className="font-body-sm text-body-sm text-outline mt-1 line-clamp-2">{r.excerpt}</p>}
                            {r.isDemo && <span className="inline-flex mt-1 font-label-badge text-label-badge text-[#786000] bg-herzeg-gold-soft px-2 py-0.5 rounded-lg uppercase">Demo</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-space-md align-top"><span className={`font-label-badge text-label-badge px-2.5 py-1 rounded-lg uppercase tracking-wider font-semibold inline-block ${CAT[r.category] ?? CAT['Opće']}`}>{POST_TYPE[r.type]}</span><span className="block font-body-sm text-body-sm text-outline mt-1">{r.category}</span></td>
                      <td className="p-space-md align-top"><div className="flex flex-col"><span className="font-button text-button font-bold text-text-heading">{r.authorName || 'Urednik MTTO'}</span><span className="font-body-sm text-body-sm text-outline">Izmijenjeno {dateShort(r.updatedAt)}</span></div></td>
                      <td className="p-space-md align-top"><div className="flex flex-col gap-1"><span className="font-body-sm text-body-sm font-semibold text-text-heading">{dateShort(r.publishedAt)}</span><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-label-badge font-label-badge font-bold uppercase w-max ${sc}`}><span className={`w-1.5 h-1.5 rounded-full ${sd}`} />{sl}</span></div></td>
                      <td className="p-space-md align-top"><span className="font-button text-button font-bold text-text-heading flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-outline">visibility</span>{r.views.toLocaleString('bs-BA')}</span></td>
                      <td className="p-space-md align-top text-right pr-space-lg">
                        <div className="flex flex-wrap items-center justify-end gap-1 max-w-[112px] ml-auto opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/objave/${r.id}`} className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary transition-colors" title="Uredi objavu"><span className="material-symbols-outlined text-[19px]">edit</span></Link>
                          {r.status === 'OBJAVLJENO' && <a href={`/vijesti/${r.slug}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary transition-colors" title="Otvori na portalu"><span className="material-symbols-outlined text-[19px]">open_in_new</span></a>}
                          <button type="button" onClick={() => setStatusOf([r.id], r.status === 'OBJAVLJENO' ? 'NACRT' : 'OBJAVLJENO')} className={`px-2 py-1 rounded-lg font-label-badge text-label-badge font-bold ${r.status === 'OBJAVLJENO' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-secondary text-on-secondary'}`}>{r.status === 'OBJAVLJENO' ? 'Povuci' : 'Objavi'}</button>
                          <button type="button" onClick={() => removeMany([r.id])} className="p-1.5 rounded-lg hover:bg-error-container text-outline hover:text-error transition-colors" title="Obriši"><span className="material-symbols-outlined text-[19px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[['policy', 'bg-surface-container-high text-primary', 'Pravila za javne pozive', 'Svaki javni poziv treba imati prijavni obrazac, rok i kontakt odgovornog sektora.'], ['translate', 'bg-emerald-light text-secondary', 'Jezična ravnopravnost', 'Prije objave provjerite usklađenost jezičkih verzija teksta.'], ['history', 'bg-amber-light text-on-tertiary-container', 'Automatska revizija (audit)', 'Svako kreiranje, izmjena, objava i brisanje bilježi se s korisnikom i vremenom.']].map(([ic, c, t, d]) => (
            <div key={t} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm"><div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c}`}><span className="material-symbols-outlined">{ic}</span></div><div><h4 className="font-button text-button font-bold text-text-heading">{t}</h4><p className="font-body-sm text-body-sm text-outline">{d}</p></div></div>
          ))}
        </div>
      </div>
      {toast.node}
    </>
  );
}
