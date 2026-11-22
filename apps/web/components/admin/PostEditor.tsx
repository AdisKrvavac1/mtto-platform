'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { adminFetch } from '@/lib/adminApi';
import { Badge, Card, CardHeader, F2Badge, Field, PageTitle, StatusChip, btnPrimary, btnSecondary, btnTertiary, iconBtn, input, useToast } from '@/components/admin/ui';
import { Bold01, Calendar, CheckCircle, Clock, Download01, Edit01, Eye, Globe01, Heading01, Heading02, Image01, Italic01, LinkExternal01, Link01, Lock01, Paperclip, Dotpoints01, List, MessageTextSquare01, Save01, ShieldTick, Strikethrough01, Table, Trash01, UploadCloud02, XClose, File06 } from '@untitledui/icons';
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

  if (!loaded) return <div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]" />;
  const words = (p.body.match(/\S+/g) ?? []).length;
  const tb = iconBtn + ' !size-8';
  const fileTone = (n: string) => /\.pdf$/i.test(n) ? ['PDF', 'bg-[#d92d20]'] : /\.xlsx?$/i.test(n) ? ['XLS', 'bg-[#079455]'] : ['DOC', 'bg-[#155eef]'];
  const toggleRow = (label: string, Ico: any) => (
    <label className="flex items-center justify-between gap-3 text-[14px] text-[#737373]"><span className="flex items-center gap-2"><Ico size={16} className="text-[#a3a3a3]" />{label}</span><span className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-[#f5f5f5] ring-1 ring-inset ring-[#e5e5e5]"><span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm" /></span></label>
  );
  const CATLABEL: Record<string, string> = { Turizam: 'Turizam i ugostiteljstvo', 'Zaštita okoliša': 'Zaštita okoliša', Trgovina: 'Trgovina', 'Opće': 'Opće informacije' };

  return (
    <>
      <PageTitle kicker={p.id ? 'Uređivanje postojeće objave' : 'Nova vijest, javni poziv ili saopćenje'} crumbs={['Objave i vijesti', p.id ? 'Uredi objavu' : 'Nova objava']} title={p.id ? 'Uredi objavu' : 'Nova objava'} badge={<StatusChip status={p.status} />}>
        {p.id && p.status === 'OBJAVLJENO' && <a className={btnTertiary} href={`/vijesti/${p.slug}`} target="_blank" rel="noopener"><LinkExternal01 />Na portalu</a>}
        <button className={btnSecondary} type="button" onClick={() => setPreview(!preview)}>{preview ? <Edit01 /> : <Eye />}{preview ? 'Uređivanje' : 'Pretpregled'}</button>
        <button className={btnSecondary} type="button" disabled={busy} onClick={() => save(p.status === 'OBJAVLJENO' ? undefined : 'NACRT')}><Save01 />{p.status === 'OBJAVLJENO' ? 'Spremi izmjene' : 'Spremi nacrt'}</button>
        <div className="inline-flex">
          <button className={`${btnPrimary} rounded-r-none`} type="button" disabled={busy} onClick={() => save('OBJAVLJENO')}><UploadCloud02 />{p.status === 'OBJAVLJENO' ? 'Ažuriraj' : 'Objavi'}</button>
          <button className={`${btnPrimary} rounded-l-none border-l border-l-white/20 !px-3`} type="button" title="Zakaži objavu za odabrani datum" aria-label="Zakaži objavu" disabled={busy} onClick={() => { if (!p.publishedAt || new Date(p.publishedAt) <= new Date()) { toast.err('Odaberite budući datum objave u kartici Objava'); return; } save('ZAKAZANO'); }}><Clock /></button>
        </div>
      </PageTitle>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col gap-5">
              <Field label="Naslov" required hint={`${p.title.length}/140`}>
                <textarea id="post-title" className={`${input} resize-none py-2.5 text-[18px] leading-7 font-semibold`} rows={2} maxLength={140} placeholder="Naslov vijesti ili javnog poziva" value={p.title} onChange={(e) => set('title', e.target.value)} />
              </Field>
              <Field label="Sažetak" hint={`${p.excerpt.length}/260`}>
                <textarea id="post-lead" className={`${input} py-2.5`} rows={3} maxLength={260} placeholder="Kratki sažetak za naslovnu i društvene mreže" value={p.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] text-[#525252]">
                <span className="inline-flex rounded-[8px] ring-1 ring-inset ring-[#d4d4d4]"><span className="rounded-l-[8px] bg-[#fafafa] px-3 py-2 font-semibold text-[#262626]">Bosanski / Hrvatski</span><span className="flex items-center gap-2 border-l border-[#d4d4d4] px-3 py-2 text-[#a3a3a3]">English <F2Badge /></span></span>
                <span className="flex items-center gap-1.5">{savedAt ? <CheckCircle size={16} className="text-[#079455]" /> : <Clock size={16} className="text-[#a3a3a3]" />}{savedAt ? `Spremljeno u ${savedAt}` : p.id ? 'Učitano iz baze' : 'Nije spremljeno'}</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 border-b border-[#e5e5e5] px-3 py-2">
              <button className={tb} title="Podebljano" type="button" onClick={() => wrap('**')}><Bold01 /></button>
              <button className={tb} title="Kurziv" type="button" onClick={() => wrap('*')}><Italic01 /></button>
              <button className={tb} title="Precrtano" type="button" onClick={() => wrap('~~')}><Strikethrough01 /></button>
              <span className="mx-1 h-5 w-px bg-[#e5e5e5]" />
              <button className={tb} title="Naslov H2" type="button" onClick={() => linePrefix('## ')}><Heading01 /></button>
              <button className={tb} title="Naslov H3" type="button" onClick={() => linePrefix('### ')}><Heading02 /></button>
              <button className={tb} title="Citat" type="button" onClick={() => linePrefix('> ')}><MessageTextSquare01 /></button>
              <span className="mx-1 h-5 w-px bg-[#e5e5e5]" />
              <button className={tb} title="Lista" type="button" onClick={() => linePrefix('- ')}><Dotpoints01 /></button>
              <button className={tb} title="Brojčana lista" type="button" onClick={() => linePrefix('1. ')}><List /></button>
              <button className={tb} title="Poveznica" type="button" onClick={() => wrap('[', '](https://)', 'tekst linka')}><Link01 /></button>
              <button className={tb} title="Tablica" type="button" onClick={() => wrap('\n| Stavka | Vrijednost |\n|---|---|\n| ', ' |  |\n', 'tekst')}><Table /></button>
              <button className={`${tb} ml-auto`} title={preview ? 'Uređivanje' : 'Pregled'} type="button" onClick={() => setPreview(!preview)}>{preview ? <Edit01 /> : <Eye />}</button>
            </div>
            {preview
              ? <div className="prose-uui min-h-[380px] p-6" dangerouslySetInnerHTML={{ __html: html }} />
              : <textarea ref={ta} className="min-h-[380px] w-full resize-y border-0 bg-transparent p-6 text-[16px] leading-7 text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-0" value={p.body} onChange={(e) => set('body', e.target.value)} placeholder="Tekst objave. Alatna traka dodaje podnaslove, liste, tablice i poveznice." />}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e5e5] bg-[#fafafa] px-6 py-3 text-[14px] text-[#525252]">
              <span>{words} riječi · {Math.max(1, Math.round(words / 200))} min čitanja</span>
              <span className="flex items-center gap-1.5"><ShieldTick size={16} className="text-[#079455]" />Sadržaj se čisti pri prikazu</span>
            </div>
          </Card>

          <Card>
            <CardHeader title="Naslovna fotografija" description="Za zaglavlje članka i dijeljenje na društvenim mrežama, omjer 16:9." badge={<Badge tone="gray">Maks. 5 MB</Badge>} />
            <div className="p-4 md:p-6">
              {p.coverImage ? (
                <div className="group relative overflow-hidden rounded-[12px]">
                  <img src={p.coverImage} alt="" className="h-72 w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <label className={`${btnSecondary} cursor-pointer`}><Image01 />Zamijeni<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} /></label>
                    <button className={btnSecondary} type="button" onClick={() => set('coverImage', null)}><Trash01 />Ukloni</button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[12px] px-6 py-8 text-center ring-1 ring-inset ring-[#e5e5e5] hover:ring-2 hover:ring-[#7f56d9]">
                  <span className="flex size-10 items-center justify-center rounded-[8px] text-[#525252] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><UploadCloud02 size={20} /></span>
                  <span className="text-[14px] text-[#525252]"><b className="font-semibold text-[#6941c6]">Kliknite za učitavanje</b> fotografije</span>
                  <span className="text-[12px] text-[#737373]">JPG, PNG ili WEBP</span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} />
                </label>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Prilozi" badge={<Badge tone="brand">{(p.documents ?? []).length}</Badge>} description="Obrasci i dokumentacija za preuzimanje." actions={
              <label className={`${btnSecondary} ${p.id ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}><Paperclip />Dodaj prilog<input type="file" className="hidden" disabled={!p.id} accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} /></label>
            } />
            <div className="flex flex-col gap-3 p-4 md:p-6">
              {!p.id && <p className="text-[14px] text-[#525252]">Prilozi se dodaju nakon prvog spremanja objave.</p>}
              {p.id && (p.documents ?? []).length === 0 && <p className="text-[14px] text-[#525252]">Nema priloženih dokumenata.</p>}
              {(p.documents ?? []).map((d) => {
                const [kind, bg] = fileTone(d.fileName);
                return (
                  <div key={d.id} className="flex items-center gap-3 rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]">
                    <span className="relative flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] bg-white ring-1 ring-inset ring-[#d4d4d4]"><span className={`mb-1 rounded-[2px] px-0.5 text-[9px] font-bold leading-[12px] text-white ${bg}`}>{kind}</span></span>
                    <span className="min-w-0 flex-1"><b className="block truncate text-[14px] font-medium text-[#404040]">{d.title}</b><span className="text-[14px] text-[#525252]">{fileSize(d.size)} · {d.fileName}</span></span>
                    <a className={iconBtn} title="Preuzmi" href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener"><Download01 /></a>
                    <button className={`${iconBtn} hover:!text-[#d92d20]`} title="Ukloni prilog" type="button" onClick={() => removeDoc(d.id)}><Trash01 /></button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-span-4">
          <Card>
            <CardHeader title="Objava" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
              <Field label="Status">
                <select className={input} value={p.status} onChange={(e) => set('status', e.target.value)}><option value="NACRT">Nacrt</option><option value="ZAKAZANO">Zakazano</option><option value="OBJAVLJENO">Objavljeno</option></select>
              </Field>
              <div className="space-y-1.5">
                <span className="text-[14px] font-medium text-[#404040]">Vidljivost</span>
                <div className="grid grid-cols-2 rounded-[8px] ring-1 ring-inset ring-[#d4d4d4]">
                  <span className="flex items-center justify-center gap-1.5 rounded-l-[8px] bg-[#fafafa] py-2 text-[14px] font-semibold text-[#262626]"><Globe01 size={16} className="text-[#737373]" />Javno</span>
                  <span className="flex items-center justify-center gap-1.5 border-l border-[#d4d4d4] py-2 text-[14px] font-semibold text-[#a3a3a3]" title="Zaštićene objave: Faza 2"><Lock01 size={16} />Zaštićeno</span>
                </div>
              </div>
              <Field label="Datum i vrijeme objave" hint="Budući datum + sat zakazuje">
                <input type="datetime-local" className={input} value={toLocal(p.publishedAt)} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </Field>
              <div className="flex items-center gap-3 rounded-[8px] bg-[#fafafa] p-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f9f5ff] text-[12px] font-semibold text-[#7f56d9]">{(p.authorName ?? 'Urednik MTTO').split(' ').map((x) => x[0]).join('').slice(0, 2)}</span>
                <span className="flex flex-col"><span className="text-[14px] font-semibold text-[#171717]">{p.authorName ?? 'Urednik MTTO'}</span><span className="text-[12px] text-[#525252]">Autor</span></span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Vrsta i resor" badge={<Badge tone="brand">Obavezno</Badge>} />
            <div className="flex flex-col gap-5 p-4 md:p-6">
              <Field label="Vrsta objave">
                <select className={input} value={p.type} onChange={(e) => set('type', e.target.value)}><option value="VIJEST">Vijest</option><option value="JAVNI_POZIV">Javni poziv</option><option value="SAOPCENJE">Saopćenje</option></select>
              </Field>
              <div className="space-y-2">
                <span className="text-[14px] font-medium text-[#404040]">Resor</span>
                {Object.keys(CATLABEL).map((c) => (
                  <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-[12px] p-3 ring-inset ${p.category === c ? 'bg-[#f9f5ff] ring-2 ring-[#7f56d9]' : 'ring-1 ring-[#e5e5e5] hover:bg-[#fafafa]'}`}>
                    <input type="radio" name="cat" className="size-4 border-[#d4d4d4] text-[#7f56d9] focus:ring-[#9e77ed]" checked={p.category === c} onChange={() => set('category', c)} />
                    <span className={`text-[14px] font-medium ${p.category === c ? 'text-[#53389e]' : 'text-[#404040]'}`}>{CATLABEL[c]}</span>
                  </label>
                ))}
              </div>
              {p.type === 'JAVNI_POZIV' && (
                <div className="flex flex-col gap-5 border-t border-[#e5e5e5] pt-5">
                  <Field label="Rok za prijave"><input type="datetime-local" className={input} value={toLocal(p.deadline)} onChange={(e) => set('deadline', e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
                  <Field label="Link na online prijavu"><input className={input} value={p.formUrl ?? ''} onChange={(e) => set('formUrl', e.target.value)} placeholder="https://mtto.gov.ba/…" /></Field>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Istaknuto i obavijesti" badge={<F2Badge />} />
            <div className="flex flex-col gap-4 p-4 md:p-6">
              {toggleRow('Zakači na vrh naslovnice', Calendar)}
              {toggleRow('Pošalji e-bilten pretplatnicima', File06)}
            </div>
          </Card>

          <Card>
            <CardHeader title="Pregled u pretraživaču" badge={p.title && p.excerpt ? <Badge tone="success" dot>Spremno</Badge> : <Badge tone="warning" dot>Nepotpuno</Badge>} />
            <div className="flex flex-col gap-4 p-4 md:p-6">
              <div className="flex overflow-hidden rounded-[8px] text-[14px] ring-1 ring-inset ring-[#d4d4d4]"><span className="border-r border-[#d4d4d4] bg-[#fafafa] px-3 py-2 text-[#525252]">/vijesti/</span><span className="truncate px-3 py-2 text-[#171717]">{p.slug ?? 'generira se pri spremanju'}</span></div>
              <div className="space-y-0.5 rounded-[8px] bg-[#fafafa] p-3">
                <p className="truncate text-[15px] leading-snug text-[#1a0dab]">{p.title || 'Naslov objave'} | MTTO HNK</p>
                <p className="truncate text-[12px] text-[#006621]">mtto.gov.ba › vijesti › {p.slug ?? '…'}</p>
                <p className="line-clamp-2 text-[12px] text-[#545454]">{p.excerpt || 'Sažetak objave prikazuje se kao meta opis u Google rezultatima.'}</p>
              </div>
            </div>
          </Card>

          {p.id && <button type="button" onClick={remove} className={`${btnTertiary} !text-[#b42318] [&_svg]:!text-[#d92d20]`}><Trash01 />Obriši objavu</button>}
        </div>
      </div>
      {toast.node}
    </>
  );
}
