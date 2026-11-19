'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { adminFetch } from '@/lib/adminApi';
import { Card, Field, PageTitle, StatusChip, btnGreen, btnPrimary, btnSecondary, input, useToast } from '@/components/admin/ui';
import { fileSize } from '@/lib/format';

type Post = {
  id?: string; slug?: string; type: string; category: string; title: string; excerpt: string; body: string; coverImage: string | null;
  status: string; publishedAt: string | null; deadline: string | null; formUrl: string | null; authorName?: string;
  documents?: { id: string; title: string; fileName: string; size: number; docType: string }[];
};

const EMPTY: Post = { type: 'VIJEST', category: 'Turizam', title: '', excerpt: '', body: '', coverImage: null, status: 'NACRT', publishedAt: null, deadline: null, formUrl: null, documents: [] };

function toLocal(d: string | null) {
  if (!d) return '';
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export default function PostEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [p, setP] = useState<Post>(EMPTY);
  const [loaded, setLoaded] = useState(!id);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    adminFetch<Post>(`/admin/posts/${id}`).then((x) => { setP(x); setLoaded(true); }).catch((e) => toast.err(e.message));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Post>(k: K, v: Post[K]) => setP((s) => ({ ...s, [k]: v }));
  const html = useMemo(() => marked.parse(p.body || '', { async: false, breaks: true }) as string, [p.body]);

  function wrap(before: string, after = before, placeholder = 'tekst') {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    set('body', next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }
  function linePrefix(prefix: string) {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const ls = value.lastIndexOf('\n', s - 1) + 1;
    set('body', value.slice(0, ls) + prefix + value.slice(ls));
    requestAnimationFrame(() => el.focus());
  }

  async function save(status?: string) {
    if (!p.title.trim()) { toast.err('Naslov je obavezan'); return; }
    setBusy(true);
    const body = {
      type: p.type, category: p.category, title: p.title, excerpt: p.excerpt, body: p.body, coverImage: p.coverImage ?? '',
      status: status ?? p.status, publishedAt: p.publishedAt, deadline: p.deadline, formUrl: p.formUrl ?? '',
    };
    try {
      if (p.id) {
        const r = await adminFetch<Post>(`/admin/posts/${p.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setP((s) => ({ ...s, ...r, documents: s.documents }));
      } else {
        const r = await adminFetch<Post>('/admin/posts', { method: 'POST', body: JSON.stringify(body) });
        setP((s) => ({ ...s, ...r }));
        window.history.replaceState(null, '', `/admin/objave/${r.id}`);
      }
      toast.ok(status === 'OBJAVLJENO' ? 'Objavljeno na portalu' : 'Sačuvano');
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCover(f: File) {
    const fd = new FormData();
    fd.append('file', f);
    try {
      const r = await adminFetch<{ url: string }>('/admin/media', { method: 'POST', body: fd });
      set('coverImage', r.url);
      toast.ok('Fotografija učitana');
    } catch (e: any) { toast.err(e.message); }
  }

  async function uploadDoc(f: File) {
    if (!p.id) { toast.err('Prvo sačuvajte objavu, pa dodajte priloge'); return; }
    const fd = new FormData();
    fd.append('file', f);
    fd.append('title', f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    fd.append('docType', /obrazac/i.test(f.name) ? 'OBRAZAC' : 'OSTALO');
    fd.append('sector', p.category === 'Turizam' ? 'Turizam i ugostiteljstvo' : p.category);
    fd.append('postId', p.id);
    try {
      const d = await adminFetch<any>('/admin/documents', { method: 'POST', body: fd });
      setP((s) => ({ ...s, documents: [...(s.documents ?? []), d] }));
      toast.ok('Prilog dodan');
    } catch (e: any) { toast.err(e.message); }
  }

  async function removeDoc(docId: string) {
    try {
      await adminFetch(`/admin/documents/${docId}`, { method: 'DELETE' });
      setP((s) => ({ ...s, documents: (s.documents ?? []).filter((d) => d.id !== docId) }));
    } catch (e: any) { toast.err(e.message); }
  }

  async function remove() {
    if (!p.id || !confirm('Obrisati ovu objavu? Ova radnja se ne može poništiti.')) return;
    await adminFetch(`/admin/posts/${p.id}`, { method: 'DELETE' });
    router.replace('/admin/objave');
  }

  if (!loaded) return <div className="h-64 rounded-xl bg-surface-container-low animate-pulse" />;
  const tool = 'h-8 min-w-8 px-2 rounded hover:bg-surface-container-high font-button text-button text-text-heading inline-flex items-center justify-center';

  return (
    <>
      <PageTitle kicker={p.id ? 'Uređivanje objave' : 'Nova objava'} title={p.title || 'Bez naslova'}>
        <StatusChip status={p.status} />
        {p.id && p.status === 'OBJAVLJENO' && p.slug && <a href={`/vijesti/${p.slug}`} target="_blank" rel="noopener" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">open_in_new</span>Na portalu</a>}
        <button type="button" disabled={busy} onClick={() => save()} className={btnSecondary}><span className="material-symbols-outlined text-[18px]">save</span>Sačuvaj</button>
        <button type="button" disabled={busy} onClick={() => save('OBJAVLJENO')} className={btnGreen}><span className="material-symbols-outlined text-[18px]">publish</span>{p.status === 'OBJAVLJENO' ? 'Ažuriraj objavu' : 'Objavi'}</button>
      </PageTitle>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <div className="xl:col-span-8 space-y-space-lg">
          <Card className="p-space-md md:p-space-lg space-y-space-md">
            <Field label="Glavni naslov objave" required>
              <input className={`${input} h-12 text-[18px] font-bold`} value={p.title} onChange={(e) => set('title', e.target.value)} placeholder="Naslov koji se prikazuje na portalu" />
            </Field>
            <Field label="Sažetak (za naslovnu i društvene mreže)" hint={`${p.excerpt.length}/260`}>
              <textarea className={`${input} h-auto py-2`} rows={3} maxLength={260} value={p.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Sadržaj članka</span>
                <button type="button" onClick={() => setPreview(!preview)} className="font-button text-button text-mtto-primary inline-flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">{preview ? 'edit' : 'visibility'}</span>{preview ? 'Uređivanje' : 'Pregled'}</button>
              </div>
              <div className="rounded border border-[#cbd5e1] overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 px-2 py-1 bg-slate-surface border-b border-[#cbd5e1]">
                  <button type="button" className={tool} onClick={() => wrap('**')} title="Podebljano"><b>B</b></button>
                  <button type="button" className={tool} onClick={() => wrap('*')} title="Kurziv"><i>I</i></button>
                  <button type="button" className={tool} onClick={() => linePrefix('## ')} title="Podnaslov">H2</button>
                  <button type="button" className={tool} onClick={() => linePrefix('### ')} title="Manji podnaslov">H3</button>
                  <button type="button" className={tool} onClick={() => linePrefix('- ')} title="Lista"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                  <button type="button" className={tool} onClick={() => linePrefix('1. ')} title="Numerisana lista"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
                  <button type="button" className={tool} onClick={() => wrap('[', '](https://)', 'tekst linka')} title="Link"><span className="material-symbols-outlined text-[18px]">link</span></button>
                  <button type="button" className={tool} onClick={() => linePrefix('> ')} title="Citat"><span className="material-symbols-outlined text-[18px]">format_quote</span></button>
                </div>
                {preview ? (
                  <div className="prose-mtto p-space-md min-h-[360px] bg-white" dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <textarea ref={ta} className="w-full min-h-[360px] p-space-md border-0 focus:ring-0 font-body-regular text-body-regular leading-7" value={p.body} onChange={(e) => set('body', e.target.value)} placeholder="Tekst objave. Koristite alatnu traku za podnaslove, liste i linkove." />
                )}
              </div>
            </div>
          </Card>

          <Card className="p-space-md md:p-space-lg space-y-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-title-md text-title-md font-bold text-text-heading flex items-center gap-2"><span className="material-symbols-outlined text-mtto-primary">attach_file</span>Priloženi službeni dokumenti</h2>
              <label className={`${btnSecondary} cursor-pointer ${!p.id ? 'opacity-50' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">upload_file</span>Dodaj prilog
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
              </label>
            </div>
            {!p.id && <p className="font-body-sm text-body-sm text-on-surface-variant">Prilozi se dodaju nakon prvog snimanja objave.</p>}
            <div className="grid gap-space-xs">
              {(p.documents ?? []).map((d) => (
                <div key={d.id} className="flex items-center gap-space-sm p-space-sm rounded-lg border border-slate-border">
                  <span className="w-9 h-9 rounded bg-error-container text-on-error-container flex items-center justify-center font-label-badge text-[10px] font-bold">{d.fileName.split('.').pop()?.toUpperCase()}</span>
                  <span className="flex-1 min-w-0"><span className="block font-button text-button text-text-heading truncate">{d.title}</span><span className="font-body-sm text-[12px] text-on-surface-variant">{d.fileName} · {fileSize(d.size)}</span></span>
                  <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Otvori"><span className="material-symbols-outlined text-[18px]">visibility</span></a>
                  <button type="button" onClick={() => removeDoc(d.id)} className="w-8 h-8 rounded bg-error-container text-on-error-container inline-flex items-center justify-center" title="Ukloni"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-space-lg xl:sticky xl:top-20">
          <Card className="p-space-md md:p-space-lg space-y-space-md">
            <h2 className="font-title-md text-title-md font-bold text-text-heading">Status i vidljivost</h2>
            <Field label="Status">
              <select className={input} value={p.status} onChange={(e) => set('status', e.target.value)}>
                <option value="NACRT">Nacrt</option>
                <option value="OBJAVLJENO">Objavljeno</option>
                <option value="ZAKAZANO">Zakazano</option>
              </select>
            </Field>
            <Field label="Datum objave" hint={p.status === 'ZAKAZANO' ? 'objavljuje se automatski' : undefined}>
              <input type="datetime-local" className={input} value={toLocal(p.publishedAt)} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
            </Field>
          </Card>
          <Card className="p-space-md md:p-space-lg space-y-space-md">
            <h2 className="font-title-md text-title-md font-bold text-text-heading">Kategorija i resor</h2>
            <Field label="Vrsta objave">
              <select className={input} value={p.type} onChange={(e) => set('type', e.target.value)}>
                <option value="VIJEST">Vijest</option>
                <option value="JAVNI_POZIV">Javni poziv</option>
                <option value="SAOPCENJE">Saopćenje</option>
              </select>
            </Field>
            <Field label="Resor">
              <select className={input} value={p.category} onChange={(e) => set('category', e.target.value)}>
                {['Turizam', 'Zaštita okoliša', 'Trgovina', 'Opće'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            {p.type === 'JAVNI_POZIV' && (
              <>
                <Field label="Rok za prijave"><input type="datetime-local" className={input} value={toLocal(p.deadline)} onChange={(e) => set('deadline', e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
                <Field label="Link na online prijavu" hint="https://"><input className={input} value={p.formUrl ?? ''} onChange={(e) => set('formUrl', e.target.value)} placeholder="https://mtto.gov.ba/..." /></Field>
              </>
            )}
          </Card>
          <Card className="p-space-md md:p-space-lg space-y-space-sm">
            <h2 className="font-title-md text-title-md font-bold text-text-heading">Naslovna fotografija</h2>
            <div className="aspect-video rounded-lg bg-surface-container bg-cover bg-center border border-slate-border flex items-center justify-center" style={p.coverImage ? { backgroundImage: `url('${p.coverImage}')` } : undefined}>
              {!p.coverImage && <span className="material-symbols-outlined text-[36px] text-outline">image</span>}
            </div>
            <div className="flex gap-space-xs">
              <label className={`${btnSecondary} flex-1 cursor-pointer`}><span className="material-symbols-outlined text-[18px]">upload</span>Učitaj sliku<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} /></label>
              {p.coverImage && <button type="button" className={btnSecondary} onClick={() => set('coverImage', null)} title="Ukloni"><span className="material-symbols-outlined text-[18px]">close</span></button>}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">JPG, PNG ili WEBP, najviše 5 MB. Preporučeno 1200×675 px.</p>
          </Card>
          {p.id && <button type="button" onClick={remove} className="w-full font-button text-button text-error inline-flex items-center justify-center gap-1 py-2"><span className="material-symbols-outlined text-[18px]">delete</span>Obriši objavu</button>}
        </div>
      </div>
      {toast.node}
    </>
  );
}
