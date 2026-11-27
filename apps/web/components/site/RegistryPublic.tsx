// F2-04: javni prikaz registra napravljenog u registry builderu (lista s filterima i dosje zapisa).
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { dateLong, dateShort } from '@/lib/format';
import { type PublicRegistry, type RegEntry, type RegField, listFields, show, titleOf } from '@/lib/registry';
import MapSection from '@/components/site/MapSection';
import { GRAD, HB1, HB2, Badge, Button, Card, Container, FilterField, PageHero, TableCard, inputCls, td, th } from '@/components/uui';
import { ArrowLeft, Code02, Download01, FilterLines, MarkerPin02, SearchLg, Table, XClose } from '@untitledui/icons';

type Page = { items: RegEntry[]; total: number; page: number; limit: number };
const fmt = (n: number) => n.toLocaleString('bs-BA');
const PER_PAGE = 25;

export async function loadRegistry(slug: string) {
  try { return await api<PublicRegistry>(`/registries/${encodeURIComponent(slug)}`); } catch (e: any) { if (e.status === 404) notFound(); throw e; }
}

/** Sloj karte prema sektoru registra (boja i legenda). */
const layerOf = (sector: string | null) => (sector === 'Turizam' ? 'TURIZAM' : sector === 'Zaštita okoliša' ? 'ZASTICENO' : 'PROJEKT') as 'TURIZAM' | 'ZASTICENO' | 'PROJEKT';

export async function RegistryList({ slug, sp }: { slug: string; sp: Record<string, string | undefined> }) {
  const reg = await loadRegistry(slug);
  const filters = reg.fields.filter((f) => f.filter);
  const qs = new URLSearchParams({ limit: String(PER_PAGE), page: sp.page ?? '1' });
  if (sp.q) qs.set('q', sp.q);
  for (const f of filters) if (sp[f.key]) qs.set(`f.${f.key}`, sp[f.key]!);
  const [res, mapRes] = await Promise.all([
    api<Page>(`/registries/${slug}/entries?${qs}`),
    reg.geo ? api<Page>(`/registries/${slug}/entries?limit=500`) : Promise.resolve(null),
  ]);
  const base = `/registri/${slug}`;
  const csvQs = new URLSearchParams(qs); csvQs.delete('limit'); csvQs.delete('page');
  const csv = `/api/registries/${slug}/export.csv${csvQs.toString() ? `?${csvQs}` : ''}`;
  const active = ['q', ...filters.map((f) => f.key)].filter((k) => sp[k]);
  const label = (k: string) => (k === 'q' ? 'Pojam' : reg.fields.find((f) => f.key === k)?.label ?? k);
  const link = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const k of ['q', ...filters.map((f) => f.key), 'page']) if (sp[k]) p.set(k, sp[k]!);
    for (const [k, v] of Object.entries(patch)) (v === null ? p.delete(k) : p.set(k, v));
    return `${base}?${p}#rezultati`;
  };
  const cols = listFields(reg.fields);
  const titleField = reg.fields.find((f) => f.key === reg.titleField) ?? cols[0];
  const pages = Math.max(1, Math.ceil(res.total / PER_PAGE));
  const page = Number(sp.page ?? 1);
  const points = (mapRes?.items ?? []).filter((e) => e.lat != null && e.lng != null).map((e) => ({
    id: e.id, layer: layerOf(reg.sector), name: titleOf(reg, e), description: cols.slice(1, 3).map((f) => show(f, e.data[f.key])).join(' · '), lat: e.lat!, lng: e.lng!, link: `${base}/${e.id}`,
  }));
  const stats = [
    { label: 'Ukupno zapisa', value: fmt(reg.count) },
    ...(reg.geo ? [{ label: 'Na karti', value: fmt(points.length) }] : []),
    { label: 'Ažurirano', value: dateShort(reg.updatedAt) },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Registri', href: '/registri' }, { label: reg.name }]}
        eyebrow="Javni registar" title={reg.name} stats={stats}
        actions={<><a href={csv} className={HB2}><Table size={20} />Za Excel</a><a href={csv} className={HB1}><Download01 size={20} />Preuzmi CSV</a></>}
      >
        {reg.description}
      </PageHero>

      <section id="rezultati" className="scroll-mt-24 bg-white py-12 md:py-16">
        <Container>
          {reg.isDemo && (
            <div className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] leading-5 text-[#b54708] ring-1 ring-inset ring-[#fedf89]">
              <Badge tone="warning">Demo</Badge><span>Registar sadrži demo zapise. Stvarna evidencija uvozi se iz Excela nadležnog sektora.</span>
            </div>
          )}
          <Card className="p-5 md:p-6">
            <form action={`${base}#rezultati`} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <FilterField label="Pretraga" className={filters.length > 1 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <span className="relative"><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input name="q" defaultValue={sp.q} placeholder={`npr. ${titleField?.label.toLowerCase() ?? 'naziv'}`} className={`${inputCls} pl-10`} /></span>
              </FilterField>
              {filters.map((f) => (
                <FilterField key={f.key} label={f.label}>
                  <select name={f.key} defaultValue={sp[f.key] ?? ''} className={inputCls}>
                    <option value="">Sve</option>
                    {(reg.facets?.[f.key] ?? []).map((o) => <option key={o.value} value={o.value}>{f.type === 'boolean' ? (o.value === 'true' ? 'Da' : 'Ne') : o.value} ({o.count})</option>)}
                  </select>
                </FilterField>
              ))}
              <div className="flex gap-3 lg:col-span-4 lg:justify-end">
                {active.length > 0 && <Button href={`${base}#rezultati`} variant="tertiary">Očisti filtere</Button>}
                <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-[14px] text-[14px] font-semibold text-white hover:bg-[var(--br-700)]"><FilterLines size={20} />Primijeni</button>
              </div>
            </form>
          </Card>

          {active.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {active.map((k) => (
                <Link key={k} href={link({ [k]: null, page: null })} className="inline-flex items-center gap-1 rounded-[6px] bg-white py-0.5 pl-2 pr-1 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]" title="Ukloni filter">
                  {label(k)}: {sp[k]}<XClose size={14} className="text-[#a3a3a3]" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6">
            <TableCard title="Zapisi" badge={<Badge tone="brand">{fmt(res.total)}{res.total !== reg.count ? ` od ${fmt(reg.count)}` : ''}</Badge>} description={reg.legalBasis || undefined}
              footer={pages > 1 ? (
                <div className="flex items-center justify-between text-[14px] text-[#525252]">
                  <span>Stranica {page} od {pages}</span>
                  <span className="flex gap-2">
                    {page > 1 && <Button href={link({ page: String(page - 1) })} variant="secondary" size="sm">Prethodna</Button>}
                    {page < pages && <Button href={link({ page: String(page + 1) })} variant="secondary" size="sm">Sljedeća</Button>}
                  </span>
                </div>
              ) : undefined}>
              <table className="w-full min-w-[720px]">
                <thead><tr>{cols.map((f) => <th key={f.key} className={th}>{f.label}</th>)}</tr></thead>
                <tbody>
                  {res.items.length === 0 && <tr><td colSpan={cols.length} className={`${td} py-12 text-center`}>Nema zapisa za odabrane kriterije.</td></tr>}
                  {res.items.map((e) => (
                    <tr key={e.id} className="hover:bg-[#fafafa]">
                      {cols.map((f, i) => (
                        <td key={f.key} className={`${td} ${i === 0 ? 'font-medium text-[#171717]' : ''}`}>
                          {i === 0 ? <Link href={`${base}/${e.id}`} className="hover:underline">{show(f, e.data[f.key])}</Link> : show(f, e.data[f.key])}
                          {i === 0 && e.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          </div>

          {points.length > 0 && <div className="mt-12"><MapSection points={points} height={460} /></div>}
          <OpenData slug={slug} csv={csv} />
        </Container>
      </section>
    </>
  );
}

export function OpenData({ slug, csv }: { slug: string; csv: string }) {
  return (
    <div className="mt-12 flex flex-col gap-4 rounded-[16px] bg-[#fafafa] p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[16px] font-semibold text-[#171717]"><Code02 size={20} className="text-[#737373]" />Otvoreni podaci</p>
        <p className="mt-1 text-[14px] text-[#525252]">Registar je dostupan i kao JSON za aplikacije i istraživače: <code className="rounded bg-white px-1.5 py-0.5 text-[13px] ring-1 ring-inset ring-[#e5e5e5]">/api/registries/{slug}/entries</code> (filteri <code>f.polje=vrijednost</code>, <code>q</code>, <code>page</code>).</p>
      </div>
      <div className="flex shrink-0 gap-3">
        <Button href={`/api/registries/${slug}/entries?limit=50`} variant="secondary" external>JSON</Button>
        <Button href={csv} variant="secondary" icon={Download01}>CSV</Button>
      </div>
    </div>
  );
}

export async function RegistryDossier({ slug, id, back }: { slug: string; id: string; back?: string }) {
  const reg = await loadRegistry(slug);
  let e: RegEntry;
  try { e = await api<RegEntry>(`/registries/${slug}/entries/${encodeURIComponent(id)}`); } catch (err: any) { if (err.status === 404) notFound(); throw err; }
  const title = titleOf(reg, e);
  const rest = reg.fields.filter((f) => f.key !== reg.titleField);
  const chips = reg.fields.filter((f) => f.filter && e.data[f.key] !== undefined);
  return (
    <>
      <section className={`relative isolate overflow-hidden pb-12 pt-10 text-white md:pb-14 md:pt-14 ${GRAD}`}>
        <Container>
          <Link href={back ?? `/registri/${slug}`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-200)] hover:text-white"><ArrowLeft size={20} />{reg.name}</Link>
          <div className="mt-8 max-w-[820px]">
            <div className="flex flex-wrap gap-2">{chips.map((f) => <Badge key={f.key} tone="gray" size="md">{f.options?.every((o) => /^\d+$/.test(o)) ? `${f.label}: ${e.data[f.key]}` : show(f, e.data[f.key])}</Badge>)}{e.isDemo && <Badge tone="warning" size="md">Demo</Badge>}</div>
            <h1 className="mt-4 text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-white md:text-[48px] md:leading-[60px]">{title}</h1>
            <p className="mt-3 text-[16px] text-[var(--br-100)]">Zapis u registru ažuriran {dateLong(e.updatedAt).replace(/\.$/, '')}.</p>
          </div>
        </Container>
      </section>
      <section className="bg-[#fafafa] py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <Card className={`p-6 md:p-8 ${e.lat != null ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <h2 className="text-[20px] font-semibold text-[#171717]">Podaci iz registra</h2>
              <dl className="mt-6 divide-y divide-[#e5e5e5]">
                {rest.map((f: RegField) => (
                  <div key={f.key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
                    <dt className="text-[14px] font-medium text-[#525252]">{f.label}</dt>
                    <dd className="text-[16px] text-[#171717] break-words">{f.type === 'url' && e.data[f.key] ? <a className="text-[var(--br-700)] underline" href={e.data[f.key]} rel="noopener nofollow" target="_blank">{e.data[f.key]}</a> : show(f, e.data[f.key])}</dd>
                  </div>
                ))}
              </dl>
              {reg.legalBasis && <p className="mt-6 text-[14px] text-[#737373]">Pravni osnov: {reg.legalBasis}</p>}
            </Card>
            {e.lat != null && e.lng != null && (
              <Card className="overflow-hidden p-6 lg:col-span-5">
                <h2 className="flex items-center gap-2 text-[20px] font-semibold text-[#171717]"><MarkerPin02 size={20} className="text-[#737373]" />Lokacija</h2>
                <div className="mt-4 overflow-hidden rounded-[8px]"><MapSection compact title={false} height={320} points={[{ id: e.id, layer: layerOf(reg.sector), name: title, description: reg.name, lat: e.lat, lng: e.lng, link: null }]} /></div>
                <p className="mt-3 text-[14px] text-[#525252]">{e.lat.toFixed(5)}, {e.lng.toFixed(5)}</p>
              </Card>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
