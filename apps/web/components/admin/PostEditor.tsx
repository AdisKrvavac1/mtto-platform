'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { adminFetch } from '@/lib/adminApi';
import { F2Badge, PageTitle, useToast } from '@/components/admin/ui';
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
  const [savedAt, setSavedAt] = useState<string | null>(null);
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
      setSavedAt(new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }));
      toast.ok(status === 'OBJAVLJENO' ? 'Objavljeno na portalu' : status === 'ZAKAZANO' ? 'Objava zakazana' : 'Sačuvano');
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
  const tb = 'p-1.5 rounded hover:bg-surface-container text-text-heading flex items-center justify-center';
  const tbOff = 'p-1.5 rounded text-outline-variant flex items-center justify-center cursor-not-allowed';
  const group = 'flex items-center bg-surface-container-lowest rounded-lg p-0.5 shadow-xs';
  const card = 'bg-surface-container-lowest rounded-xl shadow-sm';
  const kick = 'font-label-kicker text-label-kicker uppercase tracking-wider text-outline';
  const field = 'w-full px-3 py-2 rounded-lg bg-surface-container-low text-text-heading font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container';
  const words = (p.body.match(/\S+/g) ?? []).length;
  const STATUS: Record<string, [string, string]> = { NACRT: ['Radna verzija', 'bg-surface-container-high text-on-surface-variant'], ZAKAZANO: ['Zakazano', 'bg-amber-light text-[#7a6100]'], OBJAVLJENO: ['Objavljeno na portalu', 'bg-emerald-light text-secondary'] };
  const [stl, stc] = STATUS[p.status] ?? STATUS.NACRT;
  const ext = (n: string) => n.split('.').pop()?.toLowerCase() ?? '';
  const icon = (n: string) => (ext(n) === 'pdf' ? ['picture_as_pdf', 'bg-error-container/40 text-error', 'PDF dokument'] : /docx?/.test(ext(n)) ? ['description', 'bg-surface-container-highest text-primary-container', 'MS Word obrazac'] : /xlsx?/.test(ext(n)) ? ['table_view', 'bg-amber-light text-tertiary-container', 'MS Excel tablica'] : ['draft', 'bg-surface-container-high text-primary', 'Dokument']);
  const radio = (on: boolean) => `w-4 h-4 rounded ${on ? 'text-primary-container' : ''} border-slate-border`;

  return (
    <>
      <PageTitle
        kicker="Vijesti i obavijesti"
        crumbs={['Vijesti i obavijesti', p.id ? 'Uređivanje objave' : 'Nova objava']}
        id={p.id ? p.id.slice(0, 8).toUpperCase() : undefined}
        title={p.id ? 'Uredi službenu objavu' : 'Nova službena objava'}
        badge={<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-badge text-label-badge uppercase tracking-wider ${stc}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{stl}</span>}
      >
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-outline font-button text-button cursor-not-allowed" type="button" title="Verzioniranje objava: Faza 2" disabled><span className="material-symbols-outlined text-[18px]">history</span><span>Verzije</span></button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary-container font-button text-button transition-colors disabled:opacity-50" type="button" disabled={busy} onClick={() => save(p.status === 'OBJAVLJENO' ? undefined : 'NACRT')}><span className="material-symbols-outlined text-[18px]">save</span><span>{p.status === 'OBJAVLJENO' ? 'Spremi izmjene' : 'Spremi nacrt'}</span></button>
        {p.id && p.status === 'OBJAVLJENO' && p.slug ? (
          <a className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-primary font-button text-button hover:bg-surface-container-high transition-colors" href={`/vijesti/${p.slug}`} target="_blank" rel="noopener"><span className="material-symbols-outlined text-[18px]">open_in_new</span><span>Na portalu</span></a>
        ) : (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-primary font-button text-button hover:bg-surface-container-high transition-colors" type="button" onClick={() => setPreview(!preview)}><span className="material-symbols-outlined text-[18px]">{preview ? 'edit' : 'visibility'}</span><span>{preview ? 'Nastavi uređivanje' : 'Pretpregled objave'}</span></button>
        )}
        <div className="relative inline-flex shadow-sm rounded-lg">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-l-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep transition-colors disabled:opacity-50" type="button" disabled={busy} onClick={() => save('OBJAVLJENO')}><span className="material-symbols-outlined text-[18px]">publish</span><span>{p.status === 'OBJAVLJENO' ? 'Ažuriraj objavu' : 'Objavi na portalu'}</span></button>
          <button className="px-2.5 py-2 rounded-r-lg bg-institutional-navy-deep text-on-primary hover:bg-primary transition-colors flex items-center justify-center disabled:opacity-50" type="button" title="Zakaži objavu za odabrani datum" disabled={busy} onClick={() => { if (!p.publishedAt || new Date(p.publishedAt) <= new Date()) { toast.err('Odaberite budući datum objave u kartici Status i vidljivost'); return; } save('ZAKAZANO'); }}><span className="material-symbols-outlined text-[18px]">schedule</span></button>
        </div>
      </PageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className={`${card} p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm`}>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-button text-button shadow-xs flex items-center gap-1.5" type="button"><span className="w-2 h-2 rounded-full bg-secondary" />Bosanski / Hrvatski (izvornik)</button>
              <button className="px-3 py-1.5 rounded-lg text-outline font-button text-button flex items-center gap-1.5 cursor-not-allowed" type="button" disabled title="Višejezičnost: Faza 2"><span className="w-2 h-2 rounded-full bg-outline-variant" />English <F2Badge /></button>
            </div>
            <div className="flex items-center gap-3 text-body-sm text-outline">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">{savedAt ? 'cloud_done' : 'cloud'}</span>{savedAt ? `Spremljeno: ${savedAt}` : p.id ? 'Učitano iz baze' : 'Nije još spremljeno'}</span>
            </div>
          </div>

          <div className={`${card} p-space-lg flex flex-col gap-space-md`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between"><label className={kick} htmlFor="post-title">Glavni naslov objave (H1) <span className="text-error">*</span></label><span className="font-mono text-body-sm text-outline">{p.title.length} / 140 znakova</span></div>
              <textarea className="w-full p-3 rounded-lg bg-surface-container-low text-text-heading font-headline-md text-headline-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all resize-none border-0" id="post-title" placeholder="Unesite formalni naziv javnog poziva ili vijesti..." rows={2} maxLength={140} value={p.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between"><label className={kick} htmlFor="post-lead">Podnaslov / sažetak (kartica na naslovnoj i društvene mreže)</label><span className="font-mono text-body-sm text-outline">{p.excerpt.length} / 260</span></div>
              <textarea className="w-full p-3 rounded-lg bg-surface-container-low text-text-body font-body-lead text-body-lead focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border-0" id="post-lead" placeholder="Kratki sažetak namijenjen građanima i medijima..." rows={3} maxLength={260} value={p.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </div>
          </div>

          <div className={`${card} overflow-hidden flex flex-col`}>
            <div className="bg-surface-container-low px-space-md py-space-sm flex flex-wrap items-center gap-1">
              <div className={group}>
                <button className={tb} title="Podebljano" type="button" onClick={() => wrap('**')}><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                <button className={tb} title="Kurziv" type="button" onClick={() => wrap('*')}><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                <button className={tb} title="Precrtano" type="button" onClick={() => wrap('~~')}><span className="material-symbols-outlined text-[18px]">strikethrough_s</span></button>
              </div>
              <div className={group}>
                <button className="px-2 py-1 rounded text-body-sm font-bold hover:bg-surface-container text-text-heading" title="Naslov H2" type="button" onClick={() => linePrefix('## ')}>H2</button>
                <button className="px-2 py-1 rounded text-body-sm font-bold hover:bg-surface-container text-text-heading" title="Naslov H3" type="button" onClick={() => linePrefix('### ')}>H3</button>
                <button className={tb} title="Citat" type="button" onClick={() => linePrefix('> ')}><span className="material-symbols-outlined text-[18px]">format_quote</span></button>
              </div>
              <div className={group}>
                <button className={tb} title="Grafičke točke" type="button" onClick={() => linePrefix('- ')}><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                <button className={tb} title="Brojčani popis" type="button" onClick={() => linePrefix('1. ')}><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
              </div>
              <div className={group}>
                <button className={tb} title="Umetni poveznicu" type="button" onClick={() => wrap('[', '](https://)', 'tekst linka')}><span className="material-symbols-outlined text-[18px]">link</span></button>
                <button className={tb} title="Umetni tablicu" type="button" onClick={() => wrap('\n| Stavka | Vrijednost |\n|---|---|\n| ', ' |  |\n', 'tekst')}><span className="material-symbols-outlined text-[18px]">table_chart</span></button>
                <button className={tbOff} title="Informativni okvir: Faza 2" type="button" disabled><span className="material-symbols-outlined text-[18px]">call_to_action</span></button>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button className={tb} title={preview ? 'Uređivanje' : 'Pregled'} type="button" onClick={() => setPreview(!preview)}><span className="material-symbols-outlined text-[18px]">{preview ? 'edit_note' : 'preview'}</span></button>
              </div>
            </div>
            {preview ? (
              <div className="prose-mtto p-space-lg min-h-[380px]" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <textarea ref={ta} className="w-full min-h-[380px] p-space-lg border-0 focus:ring-0 focus:outline-none text-text-body font-body-regular text-body-regular leading-7 resize-y bg-transparent" value={p.body} onChange={(e) => set('body', e.target.value)} placeholder="Tekst objave. Alatna traka dodaje podnaslove, liste, tablice i poveznice." />
            )}
            <div className="bg-surface-container-low px-space-md py-2 text-body-sm text-outline flex items-center justify-between">
              <div className="flex items-center gap-4"><span>Broj riječi: <strong>{words}</strong></span><span>Predviđeno vrijeme čitanja: <strong>{Math.max(1, Math.round(words / 200))} min</strong></span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span><span>Sadržaj se čisti pri prikazu (XSS zaštita)</span></div>
            </div>
          </div>

          <div className={`${card} p-space-lg flex flex-col gap-space-md`}>
            <div className="flex items-center justify-between">
              <div><h2 className="font-title-md text-title-md text-text-heading font-bold">Naslovna fotografija objave</h2><p className="font-body-sm text-body-sm text-outline">Glavna fotografija za zaglavlje članka i dijeljenje na društvenim mrežama (preporučeno 16:9).</p></div>
              <span className="font-label-badge text-label-badge bg-surface-container text-primary px-2.5 py-1 rounded-lg">Maks. 5 MB</span>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-low group">
              {p.coverImage ? <div className="bg-cover bg-center w-full h-72" style={{ backgroundImage: `url('${p.coverImage}')` }} /> : (
                <label className="w-full h-72 flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[40px]">add_photo_alternate</span><span className="font-button text-button">Učitaj naslovnu fotografiju</span><span className="font-body-sm text-body-sm">JPG, PNG ili WEBP</span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} />
                </label>
              )}
              {p.coverImage && (
                <div className="absolute inset-0 bg-institutional-navy-deep/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-space-sm">
                  <label className="px-3 py-2 rounded-lg bg-surface-container-lowest text-text-heading font-button text-button shadow-md flex items-center gap-1.5 hover:bg-surface-container transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">sync_alt</span>Zamijeni sliku<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} /></label>
                  <button className="px-3 py-2 rounded-lg bg-error text-on-error font-button text-button shadow-md flex items-center gap-1.5 hover:bg-error/90 transition-colors" type="button" onClick={() => set('coverImage', null)}><span className="material-symbols-outlined text-[18px]">delete</span>Ukloni</button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-1"><span className={kick}>Prateća fotogalerija uz članak</span><F2Badge /></div>
          </div>

          <div className={`${card} p-space-lg flex flex-col gap-space-md`}>
            <div className="flex items-center justify-between gap-space-sm">
              <div><h2 className="font-title-md text-title-md text-text-heading font-bold">Priloženi službeni dokumenti</h2><p className="font-body-sm text-body-sm text-outline">Obrasci i dokumentacija dostupni građanima za preuzimanje.</p></div>
              <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-button text-button hover:bg-surface-container-high transition-colors shrink-0 ${p.id ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                <span className="material-symbols-outlined text-[18px]">attachment</span>Dodaj prilog
                <input type="file" className="hidden" disabled={!p.id} accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
              </label>
            </div>
            {!p.id && <p className="font-body-sm text-body-sm text-outline">Prilozi se dodaju nakon prvog spremanja objave.</p>}
            <div className="flex flex-col gap-2">
              {(p.documents ?? []).map((d) => {
                const [ic, cls, kind] = icon(d.fileName);
                return (
                  <div key={d.id} className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cls}`}><span className="material-symbols-outlined text-[22px]">{ic}</span></div>
                      <div className="flex flex-col min-w-0"><span className="font-button text-button text-text-heading font-bold truncate">{d.title}</span><div className="flex items-center gap-2 font-mono text-body-sm text-outline"><span>{kind}</span><span>•</span><span>{fileSize(d.size)}</span><span>•</span><span className="truncate">{d.fileName}</span></div></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a className="p-2 text-outline hover:text-text-heading rounded-lg hover:bg-surface-container-lowest" title="Preuzmi" href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener"><span className="material-symbols-outlined text-[18px]">download</span></a>
                      <button className="p-2 text-outline hover:text-error rounded-lg hover:bg-surface-container-lowest" title="Ukloni prilog" type="button" onClick={() => removeDoc(d.id)}><span className="material-symbols-outlined text-[18px]">close</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-20">
          <div className={`${card} p-space-md flex flex-col gap-space-md`}>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container"><span className="font-title-md text-title-md text-text-heading font-bold">Status i vidljivost</span><span className="material-symbols-outlined text-outline">tune</span></div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1"><label className={kick}>Status dokumenta</label>
                <select className={`${field} font-button text-button`} value={p.status} onChange={(e) => set('status', e.target.value)}><option value="NACRT">Radna verzija (nacrt)</option><option value="ZAKAZANO">Zakazano za objavu</option><option value="OBJAVLJENO">Objavljeno na portalu</option></select>
              </div>
              <div className="flex flex-col gap-1"><label className={kick}>Razina pristupa / vidljivost</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 rounded-lg bg-primary-container text-on-primary font-button text-button flex items-center justify-center gap-1.5 shadow-xs" type="button"><span className="material-symbols-outlined text-[18px]">public</span>Javno</button>
                  <button className="px-3 py-2 rounded-lg bg-surface-container-low text-outline font-button text-button flex items-center justify-center gap-1.5 cursor-not-allowed" type="button" disabled title="Zaštićene objave: Faza 2"><span className="material-symbols-outlined text-[18px]">lock</span>Zaštićeno</button>
                </div>
              </div>
              <div className="flex flex-col gap-1"><label className={kick}>Datum i vrijeme objave</label>
                <input type="datetime-local" className={`${field} font-mono`} value={toLocal(p.publishedAt)} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                <span className="font-body-sm text-[11px] text-outline">Budući datum + dugme <span className="material-symbols-outlined text-[13px] align-middle">schedule</span> zakazuje objavu.</span>
              </div>
              <div className="flex flex-col gap-1"><label className={kick}>Autor i odgovorni referent</label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-body-sm font-bold">{(p.authorName ?? 'Urednik MTTO').split(' ').map((x) => x[0]).join('').slice(0, 2)}</div>
                  <div className="flex flex-col"><span className="font-button text-button text-text-heading leading-tight">{p.authorName ?? 'Urednik MTTO'}</span><span className="font-body-sm text-[11px] text-outline">{p.category}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${card} p-space-md flex flex-col gap-space-md`}>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container"><span className="font-title-md text-title-md text-text-heading font-bold">Kategorije i resor</span><span className="font-label-badge text-label-badge bg-surface-container px-2 py-0.5 rounded text-primary">Obavezno</span></div>
            <div className="flex flex-col gap-2.5">
              {[['JAVNI_POZIV', 'Javni pozivi i natječaji'], ['VIJEST', 'Službene vijesti'], ['SAOPCENJE', 'Saopćenja za javnost']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2.5 text-body-sm text-text-heading cursor-pointer"><input type="radio" name="type" className={radio(p.type === v)} checked={p.type === v} onChange={() => set('type', v)} /><span className={p.type === v ? 'font-semibold text-primary' : 'text-text-body'}>{l}</span></label>
              ))}
              {['Zaštita okoliša', 'Turizam', 'Trgovina', 'Opće'].map((c) => (
                <label key={c} className="flex items-center gap-2.5 text-body-sm cursor-pointer pl-4"><input type="radio" name="cat" className={radio(p.category === c)} checked={p.category === c} onChange={() => set('category', c)} /><span className={p.category === c ? 'font-semibold text-secondary' : 'text-text-body'}>↳ {c === 'Turizam' ? 'Turizam i ugostiteljstvo' : c === 'Zaštita okoliša' ? 'Zaštita okoliša i prirode' : c === 'Trgovina' ? 'Tržišni nadzor i trgovina' : 'Opće informacije'}</span></label>
              ))}
            </div>
            {p.type === 'JAVNI_POZIV' && (
              <div className="flex flex-col gap-space-sm pt-space-sm border-t border-surface-container">
                <div className="flex flex-col gap-1"><label className={kick}>Rok za prijave</label><input type="datetime-local" className={`${field} font-mono`} value={toLocal(p.deadline)} onChange={(e) => set('deadline', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
                <div className="flex flex-col gap-1"><label className={kick}>Link na online prijavu</label><input className={field} value={p.formUrl ?? ''} onChange={(e) => set('formUrl', e.target.value)} placeholder="https://mtto.gov.ba/..." /></div>
              </div>
            )}
          </div>

          <div className={`${card} p-space-md flex flex-col gap-space-sm`}>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container"><span className="font-title-md text-title-md text-text-heading font-bold">Oznake i istaknuto</span><F2Badge /></div>
            <div className="flex flex-wrap gap-1.5">{['#' + p.category.replace(/\s+/g, ''), p.type === 'JAVNI_POZIV' ? '#JavniPoziv' : '#Vijesti'].map((t) => <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-mono text-body-sm">{t}</span>)}</div>
            <label className="flex items-center justify-between gap-2 text-body-sm text-outline"><span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">campaign</span>Zakači na vrh naslovnice</span><input type="checkbox" disabled /></label>
            <label className="flex items-center justify-between gap-2 text-body-sm text-outline"><span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">mail</span>Pošalji e-bilten pretplatnicima</span><input type="checkbox" disabled /></label>
          </div>

          <div className={`${card} p-space-md flex flex-col gap-space-sm`}>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container"><span className="font-title-md text-title-md text-text-heading font-bold">SEO i poveznica</span><span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-emerald-light text-secondary">{p.title && p.excerpt ? 'Spremno' : 'Nepotpuno'}</span></div>
            <div className="flex flex-col gap-1"><label className={kick}>URL putanja (slug)</label><div className="flex items-center rounded-lg bg-surface-container-low px-3 py-2 font-mono text-body-sm text-outline overflow-hidden"><span>/vijesti/</span><span className="text-text-heading truncate">{p.slug ?? '(generira se pri spremanju)'}</span></div></div>
            <div className="p-space-sm rounded-lg bg-surface-container-low space-y-0.5">
              <p className="text-[#1a0dab] text-[15px] leading-snug truncate">{p.title || 'Naslov objave'} | MTTO HNK</p>
              <p className="text-[#006621] text-[12px] font-mono truncate">mtto.gov.ba › vijesti › {p.slug ?? '…'}</p>
              <p className="text-[#545454] text-[12px] line-clamp-2">{p.excerpt || 'Sažetak objave prikazuje se kao meta opis u Google rezultatima.'}</p>
            </div>
          </div>

          {p.id && <button type="button" onClick={remove} className="w-full font-button text-button text-error inline-flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-error-container/40"><span className="material-symbols-outlined text-[18px]">delete</span>Obriši objavu</button>}
        </div>
      </div>
      {toast.node}
    </>
  );
}
