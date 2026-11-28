'use client';
import { useEffect, useRef, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { fmtTime } from '@/lib/risk';
import { Badge, Card, CardHeader, Field, btnPrimary, btnSecondary, input, td, th, tr, type useToast } from '@/components/admin/ui';
import { CheckCircle, RefreshCw01, UploadCloud02 } from '@untitledui/icons';

type Source = { key: string; label: string; okAt: string | null; checkedAt: string | null; error: string | null; failures: number; stale: boolean; alerted: boolean; items: number | null };
type ImportReport = { total: number; valid: number; errors: { line: number; message: string }[]; errorCount: number; imported: number; dryRun: boolean };

/** F2-18: stanje vanjskih izvora eko-rizika i kvaliteta zraka. */
export function SourcesPanel({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [list, setList] = useState<Source[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const canRefresh = useCan('eko', 'publish');
  const load = () => adminFetch<Source[]>('/admin/sources').then(setList).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function refresh(key: string) {
    setBusy(key);
    try {
      const s = await adminFetch<Source>('/admin/sources/refresh', { method: 'POST', body: JSON.stringify({ key }) });
      s.error ? toast.err(`${s.label}: ${s.error}`) : toast.ok(`${s.label}: podaci osvježeni`);
      await load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(null); }
  }

  const tone = (s: Source) => (s.error && s.stale ? 'error' : s.error || s.stale ? 'warning' : 'success');
  const label = (s: Source) => (s.error && s.stale ? 'Ne radi' : s.error ? 'Greška, prikazuju se zadnji podaci' : s.stale ? 'Zastarjelo' : 'Radi');

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader title="Izvori podataka" description="Portal prikazuje zadnje uspješne podatke iz baze; raspored ih osvježava u pozadini. Kad izvor ne odgovara tri puta zaredom, administratori dobiju e-mail." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead><tr><th className={th}>Izvor</th><th className={th}>Stanje</th><th className={th}>Zadnji uspješni podaci</th><th className={th}>Zadnja provjera</th><th className={th}>Zapisa</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
          <tbody>
            {(list ?? []).map((s) => (
              <tr key={s.key} className={tr}>
                <td className={`${td} font-medium text-[#171717]`}>{s.label}{s.error && <span className="mt-1 block max-w-[360px] truncate text-[12px] font-normal text-[#b42318]" title={s.error}>{s.error}</span>}</td>
                <td className={td}><Badge tone={tone(s)} dot>{label(s)}</Badge>{s.alerted && <span className="mt-1 block text-[12px] text-[#737373]">Upozorenje poslano</span>}</td>
                <td className={td}>{s.okAt ? fmtTime(s.okAt) : 'nikad'}</td>
                <td className={td}>{s.checkedAt ? fmtTime(s.checkedAt) : '—'}{s.failures > 0 && <span className="block text-[12px] text-[#737373]">{s.failures} neuspjelih zaredom</span>}</td>
                <td className={td}>{s.items ?? '—'}</td>
                <td className={`${td} text-right`}>{canRefresh && <button type="button" className={btnSecondary} disabled={busy === s.key} onClick={() => refresh(s.key)}><RefreshCw01 className={busy === s.key ? 'animate-spin' : ''} />Osvježi sada</button>}</td>
              </tr>
            ))}
            {list && !list.length && <tr><td className={td} colSpan={6}>Nema registrovanih izvora.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const SAMPLE = 'stanica;vrijeme;pm10;pm2.5;o3;no2;so2;co\nams-mostar-kampus;2026-11-28 13:00;32,4;18,1;41;22;4;0,4\nams-jablanica;2026-11-28 13:00;27;15;38;12;3;0,3';

/** F2-17: uvoz satnih mjerenja stanica (dok FHMZ ne omogući automatski pristup, P0-15). */
export function AirImport({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const canWrite = useCan('eko', 'write');

  async function send(dryRun: boolean) {
    setBusy(true);
    try {
      const r = await adminFetch<ImportReport>('/admin/air/import', { method: 'POST', body: JSON.stringify({ csv, dryRun }) });
      setReport(r);
      if (!dryRun) { toast.ok(`Uvezeno ${r.imported} satnih vrijednosti`); setCsv(''); }
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader title="Uvoz mjerenja stanica" description="Satne vrijednosti s AMS Mostar – Kampus i AMS Jablanica. Postojeći sat iste stanice se zamjenjuje novom vrijednošću." />
        <div className="space-y-4 p-4 md:p-6">
          <Field label="CSV" hint="Zalijepite sadržaj ili učitajte datoteku. Vrijeme je lokalno (Sarajevo); decimalni zarez ili tačka.">
            <textarea className={`${input} !h-56 font-mono text-[13px]`} value={csv} onChange={(e) => { setCsv(e.target.value); setReport(null); }} placeholder={SAMPLE} spellCheck={false} />
          </Field>
          <input ref={inp} type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setCsv(await f.text()); setReport(null); } e.target.value = ''; }} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnSecondary} onClick={() => inp.current?.click()}><UploadCloud02 />Učitaj datoteku</button>
            <button type="button" className={btnSecondary} disabled={!csv.trim() || busy} onClick={() => send(true)}><CheckCircle />Provjeri</button>
            {canWrite && <button type="button" className={btnPrimary} disabled={!report || report.errorCount > 0 || !report.valid || busy} onClick={() => send(false)}>Uvezi {report?.valid ? `${report.valid} redova` : ''}</button>}
          </div>
          {report && (
            <div className={`rounded-[8px] p-4 text-[14px] ring-1 ring-inset ${report.errorCount ? 'bg-[#fef3f2] ring-[#fecdca] text-[#b42318]' : 'bg-[#ecfdf3] ring-[#abefc6] text-[#067647]'}`} role="status">
              <p className="font-semibold">{report.dryRun ? 'Provjera' : 'Uvoz'}: {report.valid} od {report.total} redova ispravno{report.errorCount ? `, ${report.errorCount} s greškom` : ''}.</p>
              {report.errors.length > 0 && <ul className="mt-2 list-disc space-y-0.5 pl-5">{report.errors.map((e) => <li key={e.line}>Red {e.line}: {e.message}</li>)}</ul>}
              {report.errorCount > report.errors.length && <p className="mt-1">… i još {report.errorCount - report.errors.length}.</p>}
            </div>
          )}
        </div>
      </Card>
      <Card>
        <CardHeader title="Format" />
        <div className="space-y-3 p-4 text-[14px] leading-5 text-[#525252] md:p-6">
          <p>Obavezne kolone: <b>stanica</b> (<code>ams-mostar-kampus</code> ili <code>ams-jablanica</code>) i <b>vrijeme</b> (<code>2026-11-28 13:00</code> ili <code>28.11.2026 13:00</code>).</p>
          <p>Vrijednosti u µg/m³: <b>pm10</b>, <b>pm2.5</b>, <b>o3</b>, <b>no2</b>, <b>so2</b>; <b>co</b> u mg/m³. Prazno ili crtica znači da mjerenja nema.</p>
          <p>Indeks kvaliteta zraka računa se automatski iz koncentracija.</p>
          <pre className="overflow-x-auto rounded-[8px] bg-[#fafafa] p-3 text-[12px] ring-1 ring-inset ring-[#e5e5e5]">{SAMPLE}</pre>
        </div>
      </Card>
    </div>
  );
}
