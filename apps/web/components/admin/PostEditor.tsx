'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { adminFetch, getUser, inMySectors, useCan, useSectors } from '@/lib/adminApi';
import { dateTime } from '@/lib/format';
import { Badge, Card, CardHeader, F2Badge, Field, PageTitle, StatusChip, btnPrimary, btnSecondary, btnTertiary, iconBtn, input, useToast } from '@/components/admin/ui';
import { AlertTriangle, Archive, ClockRewind, FlipBackward, Send01, Bold01, Calendar, CheckCircle, Clock, Download01, Edit01, Eye, Globe01, Heading01, Heading02, Image01, Italic01, LinkExternal01, Link01, Lock01, Paperclip, Dotpoints01, List, MessageTextSquare01, Save01, ShieldTick, Strikethrough01, Table, Trash01, UploadCloud02, XClose, File06 } from '@untitledui/icons';
import { fileSize } from '@/lib/format';
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false, loading: () => <div className="h-[440px] animate-pulse bg-[#fafafa]" /> });

type Post = {
  id?: string; slug?: string; type: string; category: string; title: string; excerpt: string; body: string; coverImage: string | null;
  status: string; publishedAt: string | null; deadline: string | null; formUrl: string | null; authorName?: string;
  unpublishAt?: string | null; reviewNote?: string | null; withdrawnReason?: string | null; submittedAt?: string | null;
  createdBy?: string | null; submittedBy?: string | null; version?: number; fourEyes?: boolean;
  documents?: { id: string; title: string; fileName: string; size: number; docType: string }[];
  translations?: { en?: { title?: string; excerpt?: string; body?: string } };
};
type Ver = { version: number; status: string; userName: string; note: string | null; createdAt: string };
type Wf = 'submit' | 'return' | 'publish' | 'schedule' | 'withdraw' | 'draft';
const LIVE = ['OBJAVLJENO', 'ZAKAZANO'];
const FIELD_LABEL: Record<string, string> = { title: 'Naslov', excerpt: 'Sažetak', body: 'Tekst', type: 'Vrsta', category: 'Resor', coverImage: 'Naslovna fotografija', publishedAt: 'Datum objave', deadline: 'Rok za prijave', formUrl: 'Link na prijavu', unpublishAt: 'Automatsko povlačenje' };

/** Razlika po redovima (LCS) za poređenje verzija teksta. */
function diffLines(a: string, b: string): { t: ' ' | '-' | '+'; s: string }[] {
  const A = a.split('\n'), B = b.split('\n');
  const m = A.length, n = B.length;
  const L = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: { t: ' ' | '-' | '+'; s: string }[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) { out.push({ t: ' ', s: A[i] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: '-', s: A[i++] });
    else out.push({ t: '+', s: B[j++] });
  }
  while (i < m) out.push({ t: '-', s: A[i++] });
  while (j < n) out.push({ t: '+', s: B[j++] });
  return out;
}

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
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const toast = useToast();
  const canPublishRole = useCan('objave', 'publish');
  const sectorList = useSectors();
  const canDelete = useCan('objave', 'delete');
  const [dirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState<null | { action: Wf; title: string; label: string; required: boolean; placeholder: string }>(null);
  const [note, setNote] = useState('');
  const [versions, setVersions] = useState<Ver[]>([]);
  const [compare, setCompare] = useState<null | { v: Ver; snap: Record<string, any> }>(null);
  const me = typeof window !== 'undefined' ? getUser()?.id : undefined;

  const loadVersions = (pid = p.id) => pid && adminFetch<Ver[]>(`/admin/posts/${pid}/versions`).then(setVersions).catch(() => {});
  useEffect(() => {
    const mine = getUser()?.sectors;
    if (!id && mine?.length && getUser()?.role !== 'ADMIN') setP((s) => ({ ...s, category: mine[0] }));
    if (!id) return;
    adminFetch<Post>(`/admin/posts/${id}`).then((x) => { setP(x); setLoaded(true); }).catch((e) => toast.err(e.message));
    loadVersions(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Post>(k: K, v: Post[K]) => { setP((s) => ({ ...s, [k]: v })); setDirty(true); };
  // F2-06: izvornik (bs) ili prijevod na engleski
  const [editLang, setEditLang] = useState<'bs' | 'en'>('bs');
  type TF = 'title' | 'excerpt' | 'body';
  const val = (f: TF) => (editLang === 'bs' ? p[f] : p.translations?.en?.[f] ?? '');
  const setVal = (f: TF, v: string) => {
    if (editLang === 'bs') return set(f, v);
    setP((s) => ({ ...s, translations: { ...s.translations, en: { ...s.translations?.en, [f]: v } } })); setDirty(true);
  };
  // F2-22: objava tuđeg sektora je samo za čitanje
  const outOfScope = !!p.id && !inMySectors(getUser(), p.category);
  const publisher = canPublishRole && !outOfScope;
  const locked = outOfScope || ((p.status === 'NA_ODOBRENJU' || LIVE.includes(p.status) || p.status === 'POVUCENO') && !publisher);
  const ownWork = !!me && (p.createdBy === me || p.submittedBy === me);
  const needsSecondPair = !!p.fourEyes && ownWork && getUser()?.role !== 'ADMIN';

  /** Sprema sadržaj (svaka izmjena postaje nova verzija). Vraća id objave ili null. */
  async function save(quiet = false): Promise<string | null> {
    if (!p.title.trim()) { toast.err('Naslov je obavezan'); return null; }
    setBusy(true);
    const body = {
      type: p.type, category: p.category, title: p.title, excerpt: p.excerpt, body: p.body, coverImage: p.coverImage ?? '',
      publishedAt: p.publishedAt, deadline: p.deadline, formUrl: p.formUrl ?? '', unpublishAt: p.unpublishAt ?? null,
      translations: p.translations ?? {},
    };
    try {
      let r: Post;
      if (p.id) {
        r = await adminFetch<Post>(`/admin/posts/${p.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setP((s) => ({ ...s, ...r, documents: s.documents, fourEyes: s.fourEyes }));
      } else {
        r = await adminFetch<Post>('/admin/posts', { method: 'POST', body: JSON.stringify(body) });
        setP((s) => ({ ...s, ...r }));
        window.history.replaceState(null, '', `/admin/objave/${r.id}`);
      }
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }));
      if (!quiet) toast.ok('Sačuvano');
      loadVersions(r.id);
      return r.id!;
    } catch (e: any) {
      toast.err(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  /** Radnja uredničkog toka; nespremljene izmjene se prvo spreme. */
  async function act(action: Wf, extra: { note?: string; publishedAt?: string | null } = {}) {
    if (action === 'schedule' && (!p.publishedAt || new Date(p.publishedAt) <= new Date())) { toast.err('Odaberite budući datum i sat u kartici Objava'); return; }
    const pid = !p.id || (dirty && !locked) ? await save(true) : p.id;
    if (!pid) return;
    setBusy(true);
    try {
      const r = await adminFetch<Post>(`/admin/posts/${pid}/workflow`, { method: 'POST', body: JSON.stringify({ action, ...extra, publishedAt: action === 'schedule' ? p.publishedAt : undefined }) });
      setP((s) => ({ ...s, ...r, documents: s.documents, fourEyes: s.fourEyes }));
      setDialog(null); setNote('');
      loadVersions(pid);
      toast.ok({ submit: 'Poslano uredniku na odobrenje', return: 'Vraćeno autoru na doradu', publish: 'Objavljeno na portalu', schedule: 'Objava zakazana', withdraw: 'Povučeno s portala', draft: 'Vraćeno u nacrt' }[action]);
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function openCompare(v: Ver) {
    if (!p.id) return;
    try {
      const r = await adminFetch<{ snapshot: Record<string, any> }>(`/admin/posts/${p.id}/versions/${v.version}`);
      setCompare({ v, snap: r.snapshot });
    } catch (e: any) { toast.err(e.message); }
  }
  async function restore(v: Ver) {
    if (!p.id || !confirm(`Vratiti sadržaj iz verzije ${v.version}? Trenutni sadržaj ostaje sačuvan kao prethodna verzija.`)) return;
    try {
      const r = await adminFetch<Post>(`/admin/posts/${p.id}/versions/${v.version}/restore`, { method: 'POST' });
      setP((s) => ({ ...s, ...r, documents: s.documents, fourEyes: s.fourEyes }));
      setCompare(null); setDirty(false); loadVersions();
      toast.ok(`Vraćen sadržaj iz verzije ${v.version}`);
    } catch (e: any) { toast.err(e.message); }
  }

  async function uploadImage(f: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', f);
    try { return (await adminFetch<{ url: string }>('/admin/media', { method: 'POST', body: fd })).url; } catch (e: any) { toast.err(e.message); return null; }
  }

  /** Link za pregled prije objave (72 h), otvara se u novom tabu. */
  async function openPreview() {
    const pid = !p.id || (dirty && !locked) ? await save(true) : p.id;
    if (!pid) return;
    const w = window.open('about:blank', '_blank');
    try {
      const r = await adminFetch<{ url: string }>(`/admin/posts/${pid}/preview-link`, { method: 'POST' });
      if (w) w.location.href = r.url; else window.location.href = r.url;
    } catch (e: any) { w?.close(); toast.err(e.message); }
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
  const fileTone = (n: string) => /\.pdf$/i.test(n) ? ['PDF', 'bg-[#d92d20]'] : /\.xlsx?$/i.test(n) ? ['XLS', 'bg-[#079455]'] : ['DOC', 'bg-[#155eef]'];
  const toggleRow = (label: string, Ico: any) => (
    <label className="flex items-center justify-between gap-3 text-[14px] text-[#737373]"><span className="flex items-center gap-2"><Ico size={16} className="text-[#a3a3a3]" />{label}</span><span className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-[#f5f5f5] ring-1 ring-inset ring-[#e5e5e5]"><span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm" /></span></label>
  );
  const CATLABEL: Record<string, string> = { Turizam: 'Turizam i ugostiteljstvo', 'Zaštita okoliša': 'Zaštita okoliša', Trgovina: 'Trgovina', 'Opće': 'Opće informacije' };

  return (
    <>
      <PageTitle kicker={p.id ? 'Uređivanje postojeće objave' : 'Nova vijest, javni poziv ili saopćenje'} crumbs={['Objave i vijesti', p.id ? 'Uredi objavu' : 'Nova objava']} title={p.id ? 'Uredi objavu' : 'Nova objava'} badge={<StatusChip status={p.status} />}>
        {p.id && p.status === 'OBJAVLJENO' && <a className={btnTertiary} href={`/vijesti/${p.slug}`} target="_blank" rel="noopener"><LinkExternal01 />Na portalu</a>}
        <button className={btnSecondary} type="button" disabled={busy} onClick={openPreview} title="Otvara stranicu kako će izgledati na portalu (link važi 72 sata i može se poslati na provjeru)"><Eye />Pregled</button>
        {!locked && <button className={btnSecondary} type="button" disabled={busy || (!!p.id && !dirty)} onClick={() => save()}><Save01 />{LIVE.includes(p.status) ? 'Spremi izmjene' : 'Spremi'}</button>}
        {/* autor (ili urednik kad važi pravilo četiri oka) šalje na odobrenje */}
        {['NACRT', 'VRACENO'].includes(p.status) && !outOfScope && (!publisher || needsSecondPair) && (
          <button className={btnPrimary} type="button" disabled={busy} onClick={() => act('submit')}><Send01 />Pošalji na odobrenje</button>
        )}
        {publisher && p.status === 'NA_ODOBRENJU' && (
          <button className={btnSecondary} type="button" disabled={busy} onClick={() => { setNote(''); setDialog({ action: 'return', title: 'Vrati autoru na doradu', label: 'Šta treba doraditi', required: true, placeholder: 'Npr. dodajte rok za prijave i kontakt osobu.' }); }}><FlipBackward />Vrati na doradu</button>
        )}
        {publisher && ['NACRT', 'VRACENO', 'NA_ODOBRENJU', 'POVUCENO', 'ZAKAZANO'].includes(p.status) && !needsSecondPair && (
          <div className="inline-flex">
            <button className={`${btnPrimary} rounded-r-none`} type="button" disabled={busy} onClick={() => act('publish')}><UploadCloud02 />{p.status === 'NA_ODOBRENJU' ? 'Odobri i objavi' : p.status === 'POVUCENO' ? 'Objavi ponovo' : p.status === 'ZAKAZANO' ? 'Objavi odmah' : 'Objavi'}</button>
            <button className={`${btnPrimary} rounded-l-none border-l border-l-white/20 !px-3`} type="button" title="Zakaži objavu za datum iz kartice Objava" aria-label="Zakaži objavu" disabled={busy} onClick={() => act('schedule')}><Clock /></button>
          </div>
        )}
        {publisher && LIVE.includes(p.status) && (
          <button className={`${btnSecondary} !text-[#b42318] [&_svg]:!text-[#d92d20]`} type="button" disabled={busy} onClick={() => { setNote(''); setDialog({ action: 'withdraw', title: 'Povuci objavu s portala', label: 'Razlog povlačenja', required: true, placeholder: 'Npr. pogrešan iznos u javnom pozivu; ispravljena verzija slijedi.' }); }}><Archive />Povuci</button>
        )}
      </PageTitle>

      {outOfScope && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5]"><Lock01 size={20} className="mt-0.5 shrink-0 text-[#737373]" /><p className="text-[14px] leading-5 text-[#404040]"><b className="font-semibold">Objava pripada sektoru „{sectorList.find((x) => x.key === p.category)?.name ?? p.category}”.</b> Možete je čitati; mijenjaju je i objavljuju urednici tog sektora.</p></div>
      )}
      {p.status === 'VRACENO' && p.reviewNote && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fef3f2] p-4 ring-1 ring-inset ring-[#fecdca]"><AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#d92d20]" /><div><p className="text-[14px] font-semibold text-[#b42318]">Urednik je vratio objavu na doradu</p><p className="mt-1 text-[14px] leading-5 text-[#b42318]">{p.reviewNote}</p></div></div>
      )}
      {p.status === 'NA_ODOBRENJU' && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fffaeb] p-4 ring-1 ring-inset ring-[#fedf89]"><Clock size={20} className="mt-0.5 shrink-0 text-[#dc6803]" /><p className="text-[14px] leading-5 text-[#b54708]"><b className="font-semibold">Čeka odobrenje urednika</b>{p.submittedAt ? ` od ${dateTime(p.submittedAt)}` : ''}. {publisher ? (needsSecondPair ? 'Poslali ste je vi, pa je po pravilu četiri oka odobrava drugi urednik.' : 'Pregledajte sadržaj, pa je objavite ili vratite autoru s napomenom.') : 'Dok čeka, sadržaj se ne može mijenjati.'}</p></div>
      )}
      {p.status === 'POVUCENO' && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5]"><Archive size={20} className="mt-0.5 shrink-0 text-[#737373]" /><p className="text-[14px] leading-5 text-[#404040]"><b className="font-semibold">Povučeno s portala.</b> {p.withdrawnReason}</p></div>
      )}
      {needsSecondPair && ['NACRT', 'VRACENO'].includes(p.status) && publisher && (
        <p className="mb-6 text-[14px] text-[#525252]">Uključeno je pravilo četiri oka: objavu koju napišete objavljuje drugi urednik.</p>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <fieldset disabled={locked} className="flex min-w-0 flex-col gap-6 lg:col-span-8 disabled:opacity-90">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col gap-5">
              <Field label={editLang === 'en' ? 'Naslov (engleski)' : 'Naslov'} required={editLang === 'bs'} hint={`${val('title').length}/140`}>
                <textarea id="post-title" className={`${input} resize-none py-2.5 text-[18px] leading-7 font-semibold`} rows={2} maxLength={140} placeholder={editLang === 'en' ? 'Title in English' : 'Naslov vijesti ili javnog poziva'} lang={editLang} value={val('title')} onChange={(e) => setVal('title', e.target.value)} />
              </Field>
              <Field label={editLang === 'en' ? 'Sažetak (engleski)' : 'Sažetak'} hint={`${val('excerpt').length}/260`}>
                <textarea id="post-lead" className={`${input} py-2.5`} rows={3} maxLength={260} placeholder="Kratki sažetak za naslovnu i društvene mreže" lang={editLang} value={val('excerpt')} onChange={(e) => setVal('excerpt', e.target.value)} />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] text-[#525252]">
                <span className="inline-flex rounded-[8px] ring-1 ring-inset ring-[#d4d4d4]" role="group" aria-label="Jezik sadržaja">
                  {([['bs', 'Bosanski / Hrvatski / Srpski'], ['en', 'English']] as const).map(([l, label], i) => (
                    <button key={l} type="button" aria-pressed={editLang === l} onClick={() => setEditLang(l)} className={`flex items-center gap-2 px-3 py-2 font-semibold ${i ? 'border-l border-[#d4d4d4] rounded-r-[8px]' : 'rounded-l-[8px]'} ${editLang === l ? 'bg-[#fafafa] text-[#262626]' : 'text-[#737373] hover:text-[#262626]'}`}>
                      {label}{l === 'en' && <Badge tone={p.translations?.en?.title ? 'success' : 'gray'}>{p.translations?.en?.title ? 'preveden' : 'nema'}</Badge>}
                    </button>
                  ))}
                </span>
                <span className="flex items-center gap-1.5">{savedAt ? <CheckCircle size={16} className="text-[#079455]" /> : <Clock size={16} className="text-[#a3a3a3]" />}{savedAt ? `Spremljeno u ${savedAt}` : p.id ? 'Učitano iz baze' : 'Nije spremljeno'}</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <RichEditor key={editLang} value={val('body')} onChange={(html) => setVal('body', html)} docs={p.documents ?? []} onUpload={uploadImage} onError={(m) => toast.err(m)} disabled={locked} />
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
        </fieldset>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-span-4">
          <Card>
            <CardHeader title="Objava" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
              <div className="flex items-center justify-between gap-3"><span className="text-[14px] font-medium text-[#404040]">Status</span><span className="flex items-center gap-2"><StatusChip status={p.status} />{p.version ? <span className="text-[12px] text-[#525252]">verzija {p.version}</span> : null}</span></div>
              <div className="space-y-1.5">
                <span className="text-[14px] font-medium text-[#404040]">Vidljivost</span>
                <div className="grid grid-cols-2 rounded-[8px] ring-1 ring-inset ring-[#d4d4d4]">
                  <span className="flex items-center justify-center gap-1.5 rounded-l-[8px] bg-[#fafafa] py-2 text-[14px] font-semibold text-[#262626]"><Globe01 size={16} className="text-[#737373]" />Javno</span>
                  <span className="flex items-center justify-center gap-1.5 border-l border-[#d4d4d4] py-2 text-[14px] font-semibold text-[#a3a3a3]" title="Zaštićene objave: Faza 2"><Lock01 size={16} />Zaštićeno</span>
                </div>
              </div>
              <Field label="Datum i vrijeme objave" hint="Budući datum + dugme sa satom zakazuje">
                <input type="datetime-local" className={input} disabled={locked} value={toLocal(p.publishedAt)} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </Field>
              <Field label="Automatski povuci s portala" hint="Npr. nakon isteka javnog poziva">
                <input type="datetime-local" className={input} disabled={locked} value={toLocal(p.unpublishAt ?? null)} onChange={(e) => set('unpublishAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
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
                {(sectorList.length ? sectorList.filter((x) => x.active || x.key === p.category).map((x) => [x.key, x.name] as const) : Object.entries(CATLABEL)).map(([c, label]) => {
                  const allowed = inMySectors(getUser(), c) && !locked;
                  return (
                    <label key={c} className={`flex items-center gap-3 rounded-[12px] p-3 ring-inset ${allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${p.category === c ? 'bg-[#f9f5ff] ring-2 ring-[#7f56d9]' : 'ring-1 ring-[#e5e5e5] hover:bg-[#fafafa]'}`}>
                      <input type="radio" name="cat" disabled={!allowed} className="size-4 border-[#d4d4d4] text-[#7f56d9] focus:ring-[#9e77ed]" checked={p.category === c} onChange={() => set('category', c)} />
                      <span className={`text-[14px] font-medium ${p.category === c ? 'text-[#53389e]' : 'text-[#404040]'}`}>{label}</span>
                    </label>
                  );
                })}
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

          {p.id && (
            <Card>
              <CardHeader title="Historija verzija" badge={<Badge tone="gray">{versions.length}</Badge>} description="Svako spremanje i promjena statusa." />
              <ol className="max-h-[360px] divide-y divide-[#e5e5e5] overflow-y-auto">
                {versions.map((v) => (
                  <li key={v.version} className="flex items-start gap-3 px-4 py-3 md:px-6">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[12px] font-semibold text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">{v.version}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-[#171717]">{v.note || 'Izmjena sadržaja'}</span>
                      <span className="block text-[12px] text-[#525252]">{v.userName} · {dateTime(v.createdAt)}</span>
                    </span>
                    {v.version !== p.version && <button type="button" className={`${iconBtn} !size-8`} title={`Uporedi verziju ${v.version} s trenutnom`} aria-label={`Uporedi verziju ${v.version}`} onClick={() => openCompare(v)}><ClockRewind /></button>}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {p.id && canDelete && <button type="button" onClick={remove} className={`${btnTertiary} !text-[#b42318] [&_svg]:!text-[#d92d20]`}><Trash01 />Obriši objavu</button>}
        </div>
      </div>
      {dialog && (
        <>
          <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={() => setDialog(null)} />
          <form role="dialog" aria-modal="true" aria-labelledby="wf-title" onSubmit={(e) => { e.preventDefault(); if (dialog.required && note.trim().length < 3) return; act(dialog.action, { note }); }}
            className="fixed left-1/2 top-1/2 z-[56] w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] bg-white p-6 shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
            <h2 id="wf-title" className="text-[18px] font-semibold leading-7 text-[#171717]">{dialog.title}</h2>
            <p className="mt-1 text-[14px] text-[#525252]">Napomena se upisuje u historiju verzija i dnevnik aktivnosti.</p>
            <label className="mt-5 block"><span className="mb-1.5 block text-[14px] font-medium text-[#404040]">{dialog.label}</span>
              <textarea autoFocus rows={4} className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder={dialog.placeholder} required={dialog.required} minLength={3} /></label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className={btnSecondary} onClick={() => setDialog(null)}>Odustani</button>
              <button className={dialog.action === 'withdraw' ? `${btnPrimary} !bg-[#d92d20] hover:!bg-[#b42318]` : btnPrimary} disabled={busy || (dialog.required && note.trim().length < 3)}>{dialog.action === 'withdraw' ? 'Povuci s portala' : 'Vrati autoru'}</button>
            </div>
          </form>
        </>
      )}

      {compare && (
        <>
          <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={() => setCompare(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby="cmp-title" className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[720px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
              <div><h2 id="cmp-title" className="text-[18px] font-semibold leading-7 text-[#171717]">Verzija {compare.v.version} naspram trenutne</h2><p className="text-[14px] text-[#525252]">{compare.v.userName} · {dateTime(compare.v.createdAt)}{compare.v.note ? ` · ${compare.v.note}` : ''}</p></div>
              <button type="button" className={iconBtn} aria-label="Zatvori" onClick={() => setCompare(null)}><XClose /></button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {(() => {
                const cur: Record<string, any> = { ...p };
                const keys = Object.keys(FIELD_LABEL).filter((k) => k !== 'body' && JSON.stringify(compare.snap[k] ?? null) !== JSON.stringify(cur[k] ?? null));
                const bodyDiff = diffLines(compare.snap.body ?? '', p.body ?? '');
                const bodyChanged = bodyDiff.some((d) => d.t !== ' ');
                if (!keys.length && !bodyChanged) return <p className="text-[14px] text-[#525252]">Sadržaj je isti kao trenutni.</p>;
                return (
                  <>
                    {keys.length > 0 && (
                      <table className="w-full text-[14px] leading-5"><thead><tr className="text-left text-[12px] font-semibold text-[#525252]"><th className="w-[160px] pb-2">Polje</th><th className="pb-2">U verziji {compare.v.version}</th><th className="pb-2">Trenutno</th></tr></thead>
                        <tbody>{keys.map((k) => <tr key={k} className="align-top"><td className="py-1.5 pr-4 font-medium text-[#404040]">{FIELD_LABEL[k]}</td><td className="py-1.5 pr-4 text-[#b42318] [overflow-wrap:anywhere]">{String(compare.snap[k] ?? '—')}</td><td className="py-1.5 text-[#067647] [overflow-wrap:anywhere]">{String(cur[k] ?? '—')}</td></tr>)}</tbody></table>
                    )}
                    {bodyChanged && (
                      <div><h3 className="mb-2 text-[14px] font-semibold text-[#171717]">Tekst</h3>
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-[8px] bg-[#fafafa] p-3 font-sans text-[14px] leading-6 ring-1 ring-inset ring-[#e5e5e5]">
                          {bodyDiff.map((d, i) => <span key={i} className={`block ${d.t === '-' ? 'bg-[#fef3f2] text-[#b42318] line-through decoration-[#f04438]/50' : d.t === '+' ? 'bg-[#ecfdf3] text-[#067647]' : 'text-[#525252]'}`}><span aria-hidden className="mr-2 select-none">{d.t === ' ' ? ' ' : d.t}</span><span className="sr-only">{d.t === '-' ? 'Uklonjeno: ' : d.t === '+' ? 'Dodano: ' : ''}</span>{d.s || ' '}</span>)}
                        </pre></div>
                    )}
                  </>
                );
              })()}
            </div>
            {!locked && <div className="flex justify-end gap-3 border-t border-[#e5e5e5] px-6 py-4"><button type="button" className={btnSecondary} onClick={() => setCompare(null)}>Zatvori</button><button type="button" className={btnPrimary} onClick={() => restore(compare.v)}><FlipBackward />Vrati sadržaj iz verzije {compare.v.version}</button></div>}
          </div>
        </>
      )}
      {toast.node}
    </>
  );
}
