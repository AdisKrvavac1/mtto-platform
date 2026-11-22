import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type Permit } from '@/lib/api';
import { PERMIT_STATUS, dateLong, dateShort, daysUntil, fileExt, fileSize } from '@/lib/format';
import MapSection from '@/components/site/MapSection';
import { Badge, Button, Card, Container, Feature, Section, SectionHeader, TableCard, td, th } from '@/components/uui';
import { AlertTriangle, ArrowLeft, Building07, Calendar, ClipboardCheck, Download01, File06, Map01, MarkerPin02, Trash03, Wind01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { const p = await api<Permit>(`/permits/${encodeURIComponent(id)}`); return { title: `${p.registerNumber} – ${p.operator}` }; } catch { return { title: 'Okolišna dozvola' }; }
}

const TONE: Record<string, 'success' | 'warning' | 'error'> = { VAZECA: 'success', U_OBNOVI: 'warning', ISTEKLA: 'error' };

export default async function PermitDossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let p: Permit;
  try {
    p = await api<Permit>(`/permits/${encodeURIComponent(id)}`);
  } catch (e: any) {
    if (e.status === 404) notFound();
    throw e;
  }
  const st = PERMIT_STATUS[p.status] ?? PERMIT_STATUS.VAZECA;
  const left = daysUntil(p.validUntil)!;
  const m = Math.max(0, Math.round(left / 30.4));
  const docs = p.documents ?? [];

  const stats: [string, string, string, string?][] = [
    ['Broj rješenja', p.registerNumber, 'Upravni postupak MTTO'],
    ['Datum izdavanja', dateLong(p.issuedAt), 'Nakon javnog uvida'],
    ['Rok važenja', dateLong(p.validUntil), left < 0 ? 'Dozvola je istekla' : `Još ${Math.floor(m / 12)} god. ${m % 12} mj.`, left < 60 ? 'text-[#d92d20]' : undefined],
    ['Nadležno tijelo', 'MTTO HNK', 'Sektor za zaštitu okoliša'],
  ];

  return (
    <>
      <section className="bg-white pt-12 pb-12 md:pt-16 md:pb-16">
        <Container>
          <Link href="/registri/okolisne-dozvole" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#525252] hover:text-[#262626]"><ArrowLeft size={20} />Registar okolišnih dozvola</Link>
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[768px]">
              <div className="flex flex-wrap gap-2">
                <Badge tone={TONE[p.status] ?? 'success'} dot size="md">{st.label} do {dateShort(p.validUntil)}</Badge>
                <Badge tone="gray" size="md">{p.activity}</Badge>
                {p.isDemo && <Badge tone="warning" size="md">Demo</Badge>}
              </div>
              <h1 className="mt-4 text-[30px] leading-[38px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#171717]">{p.operator}</h1>
              <p className="mt-3 text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252]">{p.facility}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[16px] text-[#525252]"><MarkerPin02 size={20} className="text-[#a3a3a3]" />{p.address ? `${p.address}, ` : ''}{p.municipality}</p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button href="/eko-rizik/prijava" variant="secondary" size="lg" icon={AlertTriangle}>Prijavi nepravilnost</Button>
              {docs[0] && <Button href={`/api/documents/${docs[0].id}/file`} size="lg" icon={Download01} external>Preuzmi rješenje</Button>}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#e5e5e5] pt-8 lg:grid-cols-4">
            {stats.map(([k, v, n, c]) => (
              <div key={k}><p className="text-[14px] font-medium text-[#525252]">{k}</p><p className={`mt-1 text-[20px] leading-[30px] font-semibold text-[#171717] break-words ${c ?? ''}`}>{v}</p><p className="text-[14px] text-[#737373]">{n}</p></div>
            ))}
          </div>
        </Container>
      </section>

      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-7">
            {p.description && <Card className="p-6"><h2 className="text-[18px] font-semibold text-[#171717]">Opis postrojenja</h2><p className="mt-2 text-[16px] leading-6 text-[#525252]">{p.description}</p></Card>}
            <TableCard title="Dokumentacija" badge={<Badge tone="brand">{docs.length}</Badge>}>
              <div id="dokumenti" className="scroll-mt-24">
                {docs.length === 0 && <p className="px-6 py-5 text-[14px] text-[#525252]">Dokumenti za ovu dozvolu još nisu objavljeni.</p>}
                <ul className="divide-y divide-[#e5e5e5]">
                  {docs.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-6 py-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f9f5ff] text-[#7f56d9]"><File06 size={20} /></span>
                      <span className="min-w-0 flex-1"><b className="block truncate text-[14px] font-medium text-[#171717]">{d.title}</b><span className="text-[14px] text-[#525252]">{fileExt(d.fileName)} · {fileSize(d.size)}</span></span>
                      <Button href={`/api/documents/${d.id}/file`} variant="tertiary" size="sm" icon={Download01} external>Preuzmi</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </TableCard>
          </div>
          <Card className="flex flex-col gap-4 p-5 lg:col-span-5">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#171717]"><Map01 size={20} className="text-[#7f56d9]" />Lokacija postrojenja</h2><Badge tone="gray">GIS</Badge></div>
            {p.lat != null && p.lng != null ? (
              <>
                <div className="overflow-hidden rounded-[8px]"><MapSection compact title={false} height={280} points={[{ id: p.id, layer: 'DOZVOLA', name: p.operator, description: p.facility, lat: p.lat, lng: p.lng, link: null }]} /></div>
                <p className="text-[14px] text-[#737373]">{p.lat.toFixed(4)}° N, {p.lng.toFixed(4)}° E</p>
              </>
            ) : <p className="text-[14px] text-[#525252]">Lokacija nije unesena.</p>}
            <Button href="/mapa" variant="secondary" icon={Map01} className="w-full">Otvori interaktivnu kartu</Button>
          </Card>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Faza 2" title="Puni dosje postrojenja">Povezivanjem s monitoringom i Kantonalnom inspekcijom dosje dobija sljedeće sekcije. Primjer ispod pokazuje strukturu, ne stvarne podatke.</SectionHeader>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Building07} title="Tehnološki proces">Opis postrojenja, kapaciteti i primijenjene najbolje raspoložive tehnike.</Feature>
          <Feature icon={Wind01} title="Emisije i monitoring">Granične vrijednosti emisija u zrak i vodu, buka i rezultati mjerenja.</Feature>
          <Feature icon={Trash03} title="Otpad i nusproizvodi">Vrste otpada po katalogu, količine i ovlašteni preuzimači.</Feature>
          <Feature icon={ClipboardCheck} title="Inspekcijski nadzor">Kronologija nadzora, zapisnici i naložene mjere.</Feature>
        </div>
        <div className="mt-12">
          <TableCard title="Granične vrijednosti emisija" badge={<Badge tone="warning">Primjer podataka</Badge>} description="Ilustracija prikaza nakon povezivanja s monitoringom.">
            <table className="w-full min-w-[640px]">
              <thead><tr><th className={th}>Parametar</th><th className={th}>Mjerno mjesto</th><th className={th}>Propisana GVE</th><th className={th}>Zadnje mjerenje</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {[['Ukupne čestice', 'Emiter 1', '20,0 mg/Nm³', '4,8 mg/Nm³'], ['NOx', 'Glavni dimnjak', '350,0 mg/Nm³', '142,3 mg/Nm³'], ['pH otpadne vode', 'Ispust K-1', '6,5 – 8,5', '7,4']].map(([a, b, c, d]) => (
                  <tr key={a}><td className={`${td} font-medium text-[#171717]`}>{a}</td><td className={td}>{b}</td><td className={td}>{c}</td><td className={td}>{d}</td><td className={td}><Badge tone="success" dot>U granicama</Badge></td></tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>
        <p className="mt-8 flex items-center gap-2 text-[14px] text-[#737373]"><Calendar size={16} />Javnost ima pravo uvida u podatke o okolišu prema Aarhuškoj konvenciji. Zahtjev za uvid u spis šalje se putem <Link href="/o-nama#upit" className="font-semibold text-[#6941c6]">obrasca za upit</Link>.</p>
      </Section>
    </>
  );
}
