'use client';
import { useRef, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { type Registry, show } from '@/lib/registry';
import { Badge, Card, CardHeader, btnPrimary, btnSecondary, td, th, type useToast } from '@/components/admin/ui';
import { AlertTriangle, CheckCircle, Download01, File06, UploadCloud02 } from '@untitledui/icons';

type Report = {
  total: number; valid: number; invalid: number; toCreate: number; toUpdate: number; unknownColumns: string[]; missingRequired: string[];
  errors: { row: number; field?: string; label?: string; message: string }[]; errorCount: number; mode: string; committed: boolean;
  preview: { row: number; update: boolean; data: Record<string, any> }[];
};

/** Uvoz CSV-a u dva koraka: provjera (izvještaj po redu i polju), pa upis u jednoj transakciji. */
export default function RegistryImport({ reg, toast, onDone }: { reg: Registry; toast: ReturnType<typeof useToast>; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'append' | 'upsert'>(reg.fields.some((f) => f.unique) ? 'upsert' : 'append');
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const uniq = reg.fields.find((f) => f.unique);

  async function send(commit: boolean, skipInvalid = false) {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file); fd.append('mode', mode);
    if (commit) fd.append('commit', '1');
    if (skipInvalid) fd.append('skipInvalid', '1');
    setBusy(true);
    try {
      const r = await adminFetch<Report>(`/admin/registries/${reg.id}/import`, { method: 'POST', body: fd });
      setReport(r);
      if (r.committed) { toast.ok(`Uvezeno: ${r.toCreate} novih, ${r.toUpdate} ažuriranih zapisa`); onDone(); }
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  const pick = (f: File | undefined) => { if (f) { setFile(f); setReport(null); } };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader title="Uvoz iz CSV-a" description="Prvo se datoteka provjerava; ništa se ne upisuje dok ne potvrdite uvoz." />
        <div className="space-y-5 p-6">
          <div
            className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-[#d4d4d4] px-6 py-8 text-center"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          >
            <span className="flex size-10 items-center justify-center rounded-[8px] ring-1 ring-inset ring-[#e5e5e5]"><UploadCloud02 size={20} className="text-[#525252]" /></span>
            {file ? <p className="text-[14px] text-[#404040]"><File06 size={16} className="mr-1 inline text-[#737373]" />{file.name} · {file.size < 1024 ? '< 1' : (file.size / 1024).toFixed(0)} KB</p>
              : <p className="text-[14px] text-[#525252]"><button type="button" className="font-semibold text-[#6941c6] hover:underline" onClick={() => inp.current?.click()}>Odaberite datoteku</button> ili je prevucite ovdje</p>}
            <p className="text-[12px] text-[#737373]">CSV (UTF-8), razdjelnik točka-zarez ili zarez, do 5.000 redova i 2 MB</p>
            {file && <button type="button" className={btnSecondary} onClick={() => inp.current?.click()}>Druga datoteka</button>}
            <input ref={inp} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          </div>

          <fieldset>
            <legend className="mb-2 text-[14px] font-medium text-[#404040]">Postojeći zapisi</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([['append', 'Samo dodaj nove', 'Red čija se vrijednost već nalazi u registru javlja se kao greška.'],
                ['upsert', 'Dodaj i ažuriraj', uniq ? `Red s istim poljem „${uniq.label}“ (ili kolonom id) ažurira postojeći zapis.` : 'Red s kolonom id ažurira postojeći zapis (id iz internog izvoza).']] as const).map(([v, t, d]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-[12px] p-4 ring-1 ring-inset ${mode === v ? 'bg-[#f9f5ff] ring-[#d6bbfb]' : 'ring-[#e5e5e5]'}`}>
                  <input type="radio" name="mode" className="mt-1 accent-[#7f56d9]" checked={mode === v} onChange={() => { setMode(v); setReport(null); }} />
                  <span><span className="block text-[14px] font-medium text-[#404040]">{t}</span><span className="block text-[14px] text-[#525252]">{d}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end"><button type="button" className={btnPrimary} disabled={!file || busy} onClick={() => send(false)}>Provjeri datoteku</button></div>
        </div>

        {report && (
          <div className="border-t border-[#e5e5e5] p-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[['Redova', report.total], ['Novih', report.toCreate], ['Ažuriranja', report.toUpdate], ['S greškom', report.invalid]].map(([l, v]) => (
                <div key={l as string} className="rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]"><p className="text-[14px] text-[#525252]">{l}</p><p className={`text-[24px] font-semibold ${l === 'S greškom' && report.invalid ? 'text-[#d92d20]' : 'text-[#171717]'}`}>{v as number}</p></div>
              ))}
            </div>
            {(report.unknownColumns.length > 0 || report.missingRequired.length > 0) && (
              <div className="mt-4 space-y-1 rounded-[8px] bg-[#fffcf5] p-3 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]">
                {report.unknownColumns.length > 0 && <p>Kolone koje se ne uvoze (nema takvog polja): {report.unknownColumns.join(', ')}</p>}
                {report.missingRequired.length > 0 && <p>Nedostaju obavezne kolone: {report.missingRequired.join(', ')}</p>}
              </div>
            )}
            {report.errors.length > 0 && (
              <div className="mt-4 max-h-[320px] overflow-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                <table className="w-full"><thead className="sticky top-0"><tr><th className={th}>Red</th><th className={th}>Polje</th><th className={th}>Greška</th></tr></thead>
                  <tbody>{report.errors.map((e, i) => <tr key={i}><td className={`${td} tabular-nums`}>{e.row}</td><td className={td}>{e.label ?? '—'}</td><td className={`${td} text-[#b42318]`}>{e.message}</td></tr>)}</tbody></table>
                {report.errorCount > report.errors.length && <p className="px-6 py-3 text-[14px] text-[#525252]">… i još {report.errorCount - report.errors.length} grešaka</p>}
              </div>
            )}
            {report.preview.length > 0 && !report.committed && (
              <div className="mt-4">
                <p className="mb-2 text-[14px] font-medium text-[#404040]">Prvi ispravni redovi</p>
                <ul className="space-y-1 text-[14px] text-[#525252]">{report.preview.map((p) => <li key={p.row}><Badge tone={p.update ? 'blue' : 'success'} className="mr-2">{p.update ? 'Ažurira' : 'Novi'}</Badge>red {p.row}: {reg.fields.filter((f) => p.data[f.key] !== undefined).slice(0, 3).map((f) => show(f, p.data[f.key])).join(' · ')}</li>)}</ul>
              </div>
            )}
            {report.committed ? (
              <p className="mt-4 flex items-center gap-2 text-[14px] font-medium text-[#067647]"><CheckCircle size={20} />Uvoz je završen i upisan u dnevnik.</p>
            ) : (
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                {report.invalid > 0 && report.valid > 0 && <button type="button" className={btnSecondary} disabled={busy} onClick={() => send(true, true)}><AlertTriangle />Uvezi samo ispravne ({report.valid})</button>}
                {report.invalid === 0 && report.valid > 0 && <button type="button" className={btnPrimary} disabled={busy} onClick={() => send(true)}>Uvezi {report.valid} redova</button>}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="h-fit">
        <CardHeader title="Predložak" />
        <div className="space-y-4 p-6 text-[14px] text-[#525252]">
          <p>Prvi red su nazivi kolona. Kolone se prepoznaju po nazivu ili ključu polja, bez obzira na velika slova i dijakritiku.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Datum: <code>15.03.2026.</code> ili <code>2026-03-15</code></li>
            <li>Broj: <code>1.234,5</code> ili <code>1234.5</code></li>
            <li>Izbor s liste: tačna opcija iz polja</li>
            {reg.geo && <li>Lokacija: kolone <code>lat</code> i <code>lng</code></li>}
          </ul>
          <p>U Excelu: Datoteka → Sačuvaj kao → <span className="font-medium">CSV UTF-8</span>.</p>
          <div className="flex flex-col gap-2">
            <a className={btnSecondary} href={`/api/admin/registries/${reg.id}/template.csv`}><Download01 />Prazan predložak</a>
            <a className={btnSecondary} href={`/api/admin/registries/${reg.id}/export.csv`}><Download01 />Interni izvoz (s id-om)</a>
          </div>
        </div>
      </Card>
    </div>
  );
}

