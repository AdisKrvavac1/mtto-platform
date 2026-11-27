'use client';
// F1-04: korisnici, uloge i dnevnik aktivnosti. Vidi samo administrator; server provjerava svako pravo.
import { Fragment, useCallback, useEffect, useState } from 'react';
import { adminFetch, can, getUser, type CmsUser } from '@/lib/adminApi';
import { dateTime } from '@/lib/format';
import { Avatar, Badge, Card, CardHeader, EmptyState, Field, PageTitle, btnPrimary, btnSecondary, btnTertiary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';
import { AlertTriangle, ChevronDown, Copy01, Download01, Lock01, Plus, RefreshCw01, ShieldTick, UserPlus01, Users01, XClose } from '@untitledui/icons';

type U = { id: string; email: string; name: string; role: string; active: boolean; mfaEnabled: boolean; lastLoginAt: string | null; createdAt: string; invitePending: boolean; inviteExpires: string | null };
type Role = { value: string; label: string };
type A = { seq: number; id: string; createdAt: string; userId: string | null; userName: string; action: string; entity: string | null; entityId: string | null; target: string; changes: Record<string, [unknown, unknown]> | null; ip: string | null };
type Verify = { ok: boolean; total: number; brokenAt: number[] };
type Invite = { link: string; expiresInHours: number; email: string };

/** Šta svaka uloga može (isto kao matrica prava na serveru, src/rbac.ts). */
const ROLE_INFO: Record<string, string> = {
  ADMIN: 'Sve, uključujući korisnike i dnevnik aktivnosti.',
  UREDNIK: 'Objave (i objavljivanje), dokumenti, slike, uvoz vijesti. Registre samo čita.',
  REFERENT: 'Registri dozvola i objekata, lokacije, klizišta i eko-prijave. Objave samo čita.',
  PREGLED: 'Samo čitanje sadržaja i registara, bez izmjena.',
};
const ENTITIES: Record<string, string> = { objava: 'Objave', dokument: 'Dokumenti', medij: 'Slike', dozvola: 'Dozvole', lokacija: 'Lokacije', objekt: 'Ugostiteljski objekti', 'klizište': 'Klizišta', 'eko-prijava': 'Eko-prijave', korisnik: 'Korisnici i prijave', uvoz: 'Uvoz vijesti' };

const FIELDS: Record<string, string> = {
  title: 'Naslov', excerpt: 'Sažetak', body: 'Tekst', status: 'Status', type: 'Vrsta', category: 'Kategorija', slug: 'Adresa', coverImage: 'Naslovna slika',
  publishedAt: 'Objavljeno', deadline: 'Rok', formUrl: 'Link na obrazac', authorName: 'Autor', name: 'Naziv / ime', email: 'E-mail', role: 'Uloga', active: 'Aktivan',
  docType: 'Vrsta dokumenta', sector: 'Sektor', number: 'Broj', issuedAt: 'Datum izdavanja', validUntil: 'Važi do', description: 'Opis', fileName: 'Datoteka',
  registerNumber: 'Broj rješenja', operator: 'Operater', facility: 'Postrojenje', activity: 'Djelatnost', municipality: 'Općina', address: 'Adresa', lat: 'Geogr. širina', lng: 'Geogr. dužina',
  isPublic: 'Javno', note: 'Interna bilješka', publicNote: 'Javno obrazloženje', photosPublic: 'Javne fotografije', risk: 'Rizik', isDemo: 'Demo zapis', sha256: 'Otisak datoteke (sha256)',
};
const ROLE_NAMES: Record<string, string> = { ADMIN: 'Administrator', UREDNIK: 'Urednik', REFERENT: 'Referent registra', PREGLED: 'Samo pregled' };

function show(v: unknown, field?: string) {
  if (field === 'role' && typeof v === 'string') return ROLE_NAMES[v] ?? v;
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'da' : 'ne';
  if (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v)) return dateTime(v);
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

function UserStatus({ u }: { u: U }) {
  if (!u.active) return <Badge tone="gray">Neaktivan</Badge>;
  if (u.invitePending) return <Badge tone="warning" dot>Čeka aktivaciju</Badge>;
  return <Badge tone="success" dot>Aktivan</Badge>;
}

function InviteLink({ inv, onClose }: { inv: Invite; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-5 text-[#525252]">Pošaljite ovaj link korisniku <strong className="text-[#171717]">{inv.email}</strong> službenim e-mailom. Link važi {inv.expiresInHours} sata i može se iskoristiti samo jednom. Nakon aktivacije korisnik će morati uključiti dvofaktorsku prijavu.</p>
      <div className="flex items-center gap-2 rounded-[8px] bg-[#fafafa] p-3 ring-1 ring-inset ring-[#e5e5e5]">
        <code className="min-w-0 flex-1 break-all text-[13px] leading-5 text-[#171717]">{inv.link}</code>
        <button type="button" className={btnSecondary} onClick={() => { navigator.clipboard?.writeText(inv.link); setCopied(true); }}><Copy01 />{copied ? 'Kopirano' : 'Kopiraj'}</button>
      </div>
      <p className="flex items-start gap-2 rounded-[8px] bg-[#fffaeb] p-3 text-[14px] leading-5 text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><AlertTriangle size={20} className="shrink-0" />Link se prikazuje samo sada. Ako se izgubi, napravite novi.</p>
      <div className="flex justify-end"><button type="button" className={btnPrimary} onClick={onClose}>Gotovo</button></div>
    </div>
  );
}

function Users({ me, toast, onChange }: { me: CmsUser | null; toast: ReturnType<typeof useToast>; onChange: () => void }) {
  const [users, setUsers] = useState<U[] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<{ name: string; email: string; role: string } | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => adminFetch<{ users: U[]; roles: Role[] }>('/admin/users').then((d) => { setUsers(d.users); setRoles(d.roles); onChange(); }).catch((e) => toast.err(e.message)), [toast, onChange]);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function patch(u: U, body: Partial<U>, ok: string) {
    try { await adminFetch(`/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify(body) }); toast.ok(ok); load(); } catch (e: any) { toast.err(e.message); load(); }
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      const r = await adminFetch<{ link: string; expiresInHours: number }>('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setInvite({ ...r, email: form.email.trim().toLowerCase() });
      load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function reinvite(u: U) {
    if (!confirm(`Napraviti novi link za aktivaciju za ${u.name}?\n\nTrenutna lozinka i dvofaktorska prijava korisnika prestaju važiti, a sve njegove sesije se odjavljuju.`)) return;
    try {
      const r = await adminFetch<{ link: string; expiresInHours: number }>(`/admin/users/${u.id}/invite`, { method: 'POST', body: JSON.stringify({ resetMfa: true }) });
      setForm(null); setInvite({ ...r, email: u.email }); load();
    } catch (e: any) { toast.err(e.message); }
  }
  const close = () => { setForm(null); setInvite(null); };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader title="Korisnici" badge={users && <Badge tone="gray">{users.filter((u) => u.active).length} aktivnih</Badge>}
          description="Promjena uloge ili deaktivacija odmah odjavljuje korisnika sa svih uređaja."
          actions={<button type="button" className={btnPrimary} onClick={() => { setInvite(null); setForm({ name: '', email: '', role: 'UREDNIK' }); }}><Plus />Dodaj korisnika</button>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead><tr><th className={th}>Korisnik</th><th className={th}>Uloga</th><th className={th}>Status</th><th className={th}>Dvofaktorska</th><th className={th}>Zadnja prijava</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
            <tbody>
              {users === null && <tr><td colSpan={6} className={td}><div className="h-12 animate-pulse rounded-[8px] bg-[#f5f5f5]" /></td></tr>}
              {users?.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className={`${tr} ${u.active ? '' : 'opacity-60'}`}>
                    <td className={td}><span className="flex items-center gap-3"><Avatar name={u.name} size={40} /><span className="min-w-0"><span className="block font-medium text-[#171717]">{u.name}{self && <span className="ml-2 text-[12px] font-normal text-[#737373]">(vi)</span>}</span><span className="block truncate">{u.email}</span></span></span></td>
                    <td className={td}>
                      <select aria-label={`Uloga: ${u.name}`} className={`${input} !h-9 !w-[190px] !py-1 !text-[14px]`} value={u.role} disabled={self || !u.active}
                        onChange={(e) => { const r = roles.find((x) => x.value === e.target.value); if (confirm(`Promijeniti ulogu za ${u.name} u „${r?.label}”? Korisnik će biti odjavljen.`)) patch(u, { role: e.target.value }, 'Uloga je promijenjena'); else load(); }}>
                        {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className={td}><UserStatus u={u} /></td>
                    <td className={td}>{u.mfaEnabled ? <Badge tone="success"><ShieldTick size={12} className="mr-1" />Uključena</Badge> : <Badge tone="warning">Nije uključena</Badge>}</td>
                    <td className={`${td} whitespace-nowrap`}>{u.lastLoginAt ? dateTime(u.lastLoginAt) : '—'}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      {!self && <span className="flex justify-end gap-1">
                        <button type="button" className={iconBtn} onClick={() => reinvite(u)} title="Novi link za aktivaciju (izgubljena lozinka ili telefon)" aria-label={`Novi link za aktivaciju: ${u.name}`}><RefreshCw01 /></button>
                        {u.active
                          ? <button type="button" className={iconBtn} onClick={() => confirm(`Deaktivirati nalog ${u.name}? Korisnik se odmah odjavljuje i ne može se prijaviti.`) && patch(u, { active: false }, 'Nalog je deaktiviran')} title="Deaktiviraj nalog" aria-label={`Deaktiviraj: ${u.name}`}><Lock01 /></button>
                          : <button type="button" className={btnTertiary} onClick={() => patch(u, { active: true }, 'Nalog je ponovo aktivan')}>Aktiviraj</button>}
                      </span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Uloge i prava" description="Prava po sektoru (npr. urednik samo za turizam) dodajemo kad Ministarstvo potvrdi organizacionu šemu." />
        <dl className="grid gap-px overflow-hidden rounded-b-[12px] bg-[#e5e5e5] md:grid-cols-2">
          {roles.map((r) => <div key={r.value} className="bg-white px-6 py-4"><dt className="text-[14px] font-semibold text-[#171717]">{r.label}</dt><dd className="mt-1 text-[14px] leading-5 text-[#525252]">{ROLE_INFO[r.value]}</dd></div>)}
        </dl>
      </Card>

      {(form || invite) && (
        <>
          <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={close} />
          <div role="dialog" aria-modal="true" aria-labelledby="user-dlg" className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[520px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-4 py-5 md:px-6">
              <div className="flex items-start gap-4"><span className="flex size-12 items-center justify-center rounded-[10px] text-[#525252] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><UserPlus01 size={24} /></span>
                <div><h2 id="user-dlg" className="text-[18px] leading-7 font-semibold text-[#171717]">{invite ? 'Link za aktivaciju' : 'Novi korisnik'}</h2><p className="text-[14px] text-[#525252]">{invite ? 'Korisnik sam postavlja lozinku.' : 'Korisnik dobija link i sam postavlja lozinku.'}</p></div></div>
              <button type="button" onClick={close} className={iconBtn} aria-label="Zatvori"><XClose /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
              {invite ? <InviteLink inv={invite} onClose={close} /> : form && (
                <form id="user-form" onSubmit={create} className="space-y-5">
                  <Field label="Ime i prezime" required><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus /></Field>
                  <Field label="Službeni e-mail" required><input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ime.prezime@mtto.gov.ba" required /></Field>
                  <fieldset className="space-y-2">
                    <legend className="mb-1.5 text-[14px] font-medium text-[#404040]">Uloga</legend>
                    {roles.map((r) => (
                      <label key={r.value} className={`flex cursor-pointer gap-3 rounded-[12px] p-4 ring-1 ring-inset ${form.role === r.value ? 'bg-[#f9f5ff] ring-2 ring-[#7f56d9]' : 'ring-[#e5e5e5] hover:bg-[#fafafa]'}`}>
                        <input type="radio" name="role" className="mt-0.5 accent-[#7f56d9]" checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} />
                        <span><span className="block text-[14px] font-semibold text-[#171717]">{r.label}</span><span className="block text-[14px] leading-5 text-[#525252]">{ROLE_INFO[r.value]}</span></span>
                      </label>
                    ))}
                  </fieldset>
                </form>
              )}
            </div>
            {!invite && <div className="flex justify-end gap-3 border-t border-[#e5e5e5] px-4 py-4 md:px-6">
              <button type="button" className={btnSecondary} onClick={close}>Odustani</button>
              <button form="user-form" className={btnPrimary} disabled={busy}>{busy ? 'Kreiranje…' : 'Kreiraj i napravi link'}</button>
            </div>}
          </div>
        </>
      )}
    </>
  );
}

function AuditLog({ users, toast, rev }: { users: { id: string; name: string }[]; toast: ReturnType<typeof useToast>; rev: number }) {
  const [f, setF] = useState({ q: '', entity: '', user: '', from: '', to: '' });
  const [items, setItems] = useState<A[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [verify, setVerify] = useState<Verify | null>(null);
  const qs = (extra: Record<string, string> = {}) => new URLSearchParams(Object.entries({ ...f, ...extra }).filter(([, v]) => v)).toString();

  const load = useCallback(async (more = false) => {
    try {
      const d = await adminFetch<{ items: A[]; nextCursor: string | null }>(`/admin/audit?${qs(more && cursor ? { cursor } : {})}`);
      setItems((cur) => (more && cur ? [...cur, ...d.items] : d.items));
      setCursor(d.nextCursor);
    } catch (e: any) { toast.err(e.message); setItems([]); }
  }, [f, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(() => load(false), 250); return () => clearTimeout(t); }, [f, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { adminFetch<Verify>('/admin/audit/verify').then(setVerify).catch(() => {}); }, [rev]);

  const chain = verify && (verify.ok
    ? <Badge tone="success" dot>Lanac ispravan, {verify.total} zapisa</Badge>
    : <Badge tone="error" dot>Otkrivena izmjena kod zapisa #{verify.brokenAt.join(', #')}</Badge>);

  return (
    <Card className="mt-6 overflow-hidden">
      <div id="dnevnik" className="scroll-mt-24">
        <CardHeader title="Dnevnik aktivnosti" badge={chain}
          description="Svaka prijava i izmjena, s vrijednostima prije i poslije. Zapisi se ne mogu mijenjati ni brisati; svaki nosi otisak prethodnog, pa se naknadna izmjena u bazi otkriva."
          actions={<a className={btnSecondary} href={`/api/admin/audit/export.csv?${qs()}`}><Download01 />Izvoz CSV</a>} />
        <div className="grid gap-3 border-b border-[#e5e5e5] px-4 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-6">
          <input className={`${input} md:col-span-2 xl:col-span-2`} placeholder="Pretraga radnje, zapisa ili korisnika" aria-label="Pretraga dnevnika" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          <select className={input} aria-label="Vrsta zapisa" value={f.entity} onChange={(e) => setF({ ...f, entity: e.target.value })}><option value="">Sve vrste zapisa</option>{Object.entries(ENTITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select className={input} aria-label="Korisnik" value={f.user} onChange={(e) => setF({ ...f, user: e.target.value })}><option value="">Svi korisnici</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          <input type="date" className={input} aria-label="Od datuma" title="Od datuma" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
          <input type="date" className={input} aria-label="Do datuma" title="Do datuma" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead><tr><th className={th}>#</th><th className={th}>Korisnik</th><th className={th}>Radnja</th><th className={th}>Zapis</th><th className={th}>Vrijeme</th><th className={th}><span className="sr-only">Detalji</span></th></tr></thead>
            <tbody>
              {items === null && <tr><td colSpan={6} className={td}><div className="h-12 animate-pulse rounded-[8px] bg-[#f5f5f5]" /></td></tr>}
              {items?.length === 0 && <tr><td colSpan={6} className={`${td} text-center`}>Nema zapisa za odabrane filtere.</td></tr>}
              {items?.map((a) => {
                const has = !!a.changes && Object.keys(a.changes).length > 0;
                const isOpen = open === a.seq;
                return (
                  <Fragment key={a.id}>
                    <tr className={tr}>
                      <td className={`${td} tabular-nums text-[#737373]`}>{a.seq}</td>
                      <td className={td}><span className="flex items-center gap-3 whitespace-nowrap"><Avatar name={a.userName} size={32} /><span className="font-medium text-[#171717]">{a.userName}</span></span></td>
                      <td className={td}>{a.action}{a.entity && <span className="ml-2"><Badge tone="gray">{ENTITIES[a.entity] ?? a.entity}</Badge></span>}</td>
                      <td className={td}><span className="line-clamp-1 max-w-[280px]" title={a.target}>{a.target || '—'}</span></td>
                      <td className={`${td} whitespace-nowrap`} title={a.ip ? `Mreža ${a.ip}` : undefined}>{dateTime(a.createdAt)}</td>
                      <td className={`${td} text-right`}>{has && <button type="button" className={btnTertiary} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.seq)}>Izmjene<ChevronDown className={isOpen ? 'rotate-180' : ''} /></button>}</td>
                    </tr>
                    {isOpen && a.changes && (
                      <tr><td colSpan={6} className="border-b border-[#e5e5e5] bg-[#fafafa] px-6 py-4">
                        <table className="w-full text-[14px] leading-5"><thead><tr className="text-left text-[12px] font-semibold text-[#525252]"><th className="w-[180px] pb-2">Polje</th><th className="pb-2">Prije</th><th className="pb-2">Poslije</th></tr></thead>
                          <tbody>{Object.entries(a.changes).map(([k, [b, c]]) => <tr key={k} className="align-top"><td className="py-1 pr-4 font-medium text-[#404040]">{FIELDS[k] ?? k}</td><td className="py-1 pr-4 text-[#b42318] [overflow-wrap:anywhere]">{show(b, k)}</td><td className="py-1 text-[#067647] [overflow-wrap:anywhere]">{show(c, k)}</td></tr>)}</tbody></table>
                      </td></tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {cursor && <div className="flex justify-center border-t border-[#e5e5e5] px-6 py-4"><button type="button" className={btnSecondary} onClick={() => load(true)}>Učitaj starije zapise</button></div>}
      </div>
    </Card>
  );
}

export default function Page() {
  const toast = useToast();
  const [me, setMe] = useState<CmsUser | null>(null);
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [rev, setRev] = useState(0);
  const bump = useCallback(() => setRev((r) => r + 1), []);
  useEffect(() => {
    const u = getUser(); setMe(u);
    const sync = () => setMe(getUser());
    window.addEventListener('mtto-user', sync);
    return () => window.removeEventListener('mtto-user', sync);
  }, []);
  useEffect(() => { if (can(me, 'korisnici')) adminFetch<{ users: U[] }>('/admin/users').then((d) => setPeople(d.users)).catch(() => {}); }, [me]);

  if (me && me.permissions && !can(me, 'korisnici') && !can(me, 'dnevnik')) {
    return <EmptyState icon={Lock01} title="Nemate pristup">Korisnike i dnevnik aktivnosti vidi samo administrator.</EmptyState>;
  }
  return (
    <>
      <PageTitle kicker="Nalozi urednika, uloge i trag svih izmjena u CMS-u." crumbs={['Korisnici i dnevnik']} title="Korisnici i dnevnik" badge={<Badge tone="brand"><Users01 size={12} className="mr-1" />Samo administrator</Badge>} />
      {can(me, 'korisnici') && <Users me={me} toast={toast} onChange={bump} />}
      {can(me, 'dnevnik') && <AuditLog users={people} toast={toast} rev={rev} />}
      {toast.node}
    </>
  );
}
