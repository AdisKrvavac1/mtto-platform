/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function UsersF2(props: any) {
  return (
<><div className="-mx-space-md lg:-mx-space-lg -mt-space-xl"><div className="px-space-md lg:px-space-lg pt-space-lg"><div className="flex items-start gap-space-sm p-space-md mb-space-lg rounded-xl bg-surface-container-high border border-slate-border text-primary font-body-sm text-body-sm"><span className="material-symbols-outlined">schedule</span><span><strong>Faza 2 · prototip ekrana.</strong> Prikazan je odobreni dizajn modula s primjerom podataka. Funkcionalnost se razvija u drugoj fazi projekta.</span></div></div><div className="flex flex-col w-full">
<section className="px-space-lg py-space-md bg-surface-container-lowest shadow-sm">
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
<span className="font-label-kicker text-label-kicker uppercase tracking-widest text-primary-container">Sustav za upravljanje (CMS)</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="font-label-kicker text-label-kicker uppercase tracking-widest text-text-heading">Korisnici, Uloge & RBAC Sigurnost</span>
</div>
<div className="flex items-center gap-space-sm">
<h1 className="font-headline-md text-headline-md text-text-heading">Administracija Korisnika i Sigurnosne Permisije</h1>
<span className="px-2 py-0.5 rounded-lg bg-emerald-light text-secondary font-label-badge text-label-badge uppercase">Uloge i prava (RBAC)</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-xs">
<button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-primary-container font-button text-button hover:bg-surface-container hover:text-institutional-navy-deep transition-colors" id="btn-export-csv">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>Izvoz matrice (CSV)</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-primary-container font-button text-button hover:bg-surface-container hover:text-institutional-navy-deep transition-colors" id="btn-open-matrix">
<span className="material-symbols-outlined text-[18px]">table_chart</span>
<span>Matrica uloga</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-primary-container font-button text-button hover:bg-surface-container hover:text-institutional-navy-deep transition-colors" id="btn-audit-log">
<span className="material-symbols-outlined text-[18px]">history</span>
<span>Sigurnosni dnevnik</span>
</button>
<button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-button text-button shadow-sm hover:bg-institutional-navy-deep transition-all" id="btn-create-user">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span>+ Kreiraj novog službenika</span>
</button>
</div>
</div>
</section>
<section className="px-space-lg py-space-md">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Aktivni Računi</span>
<div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[18px]">badge</span>
</div>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="font-display text-[32px] font-bold text-text-heading leading-tight">28</span>
<span className="font-body-sm text-body-sm text-secondary font-semibold">100% aktivno</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">4 resorna odjela i pisarnica MTTO</p>
</div>
<div className="mt-3 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
<div className="bg-primary-container h-full w-full"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Super Administratori</span>
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
</div>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="font-display text-[32px] font-bold text-text-heading leading-tight">3</span>
<span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded-lg bg-surface-container text-primary-container">Nivo 5</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Kabinet ministra & IT sektor</p>
</div>
<div className="mt-3 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[10%]"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Inspektori & Referenti</span>
<div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
</div>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="font-display text-[32px] font-bold text-text-heading leading-tight">19</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Rješenja & uviđaji</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Unos, verifikacija i potpis akata</p>
</div>
<div className="mt-3 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary h-full w-[68%]"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Vanjska Povjerenstva</span>
<div className="w-8 h-8 rounded-lg bg-amber-light flex items-center justify-center text-on-tertiary-container">
<span className="material-symbols-outlined text-[18px]">assignment_ind</span>
</div>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="font-display text-[32px] font-bold text-text-heading leading-tight">6</span>
<span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded-lg bg-amber-light text-on-tertiary-container">Privremeno</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">MTU uviđaji i komisije za vodiče</p>
</div>
<div className="mt-3 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
<div className="bg-on-tertiary-container h-full w-[22%]"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-emerald-light/40">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">2FA / MFA Standard</span>
<div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary">
<span className="material-symbols-outlined text-[18px]">phonelink_lock</span>
</div>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="font-display text-[32px] font-bold text-secondary leading-tight">100%</span>
<span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary">Obvezno</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">FIDO2 tokeni ili TOTP hardver</p>
</div>
<div className="mt-3 flex items-center gap-1.5 text-secondary">
<span className="material-symbols-outlined text-[14px]">format_image_left</span>
<span className="font-label-badge text-[11px] font-bold">Nulta stopa neautentificiranih</span>
</div>
</div>
</div>
</section>
<section className="px-space-lg mb-space-sm">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md">
<div className="flex items-center justify-between flex-wrap gap-space-sm">
<div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
<button className="role-tab active px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-button text-button shadow-sm" data-filter-role="all">
            Svi računi (28)
          </button>
<button className="role-tab px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading font-button text-button transition-colors" data-filter-role="admin">
            Glavni administratori (3)
          </button>
<button className="role-tab px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading font-button text-button transition-colors" data-filter-role="inspector">
            Resorni inspektori (8)
          </button>
<button className="role-tab px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading font-button text-button transition-colors" data-filter-role="lead">
            Voditelji odsjeka (5)
          </button>
<button className="role-tab px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading font-button text-button transition-colors" data-filter-role="officer">
            Pisarnica & Arhiva (6)
          </button>
<button className="role-tab px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading font-button text-button transition-colors" data-filter-role="commission">
            Vanjska povjerenstva (6)
          </button>
</div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
<span>Aktivna sesija: 14 prijavljenih</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm pt-space-xs">
<div className="md:col-span-5 relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
<input className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container" id="user-search-input" placeholder="Pretraži po imenu, akademskoj tituli ili @mtto.gov.ba..." type="text" />
</div>
<div className="md:col-span-4">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer" id="department-select">
<option value="all">Svi resorni odjeli MTTO</option>
<option value="okolis">Sektor za zaštitu okoliša</option>
<option value="turizam">Sektor za turizam i ugostiteljstvo</option>
<option value="trgovina">Sektor za trgovinu</option>
<option value="pravni">Sektor za pravne i opće poslove</option>
<option value="kabinet">Kabinet ministra & IT centar</option>
<option value="vanjski">Vanjska ispitna povjerenstva</option>
</select>
</div>
<div className="md:col-span-2">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer" id="status-select">
<option value="all">Status: Svi</option>
<option value="active">Aktivan račun</option>
<option value="temp">Privremeno blokiran</option>
<option value="pending">Na čekanju certifikacije</option>
</select>
</div>
<div className="md:col-span-1 flex justify-end">
<button className="w-full h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-text-heading transition-colors" id="reset-filter-btn" title="Poništi filtere">
<span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
</button>
</div>
</div>
</div>
</section>
<section className="px-space-lg pb-space-xl">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
<div className="xl:col-span-8 flex flex-col space-y-space-md">
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="p-space-md bg-surface-container-lowest flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[20px]">group</span>
<h2 className="font-title-md text-title-md text-text-heading">Registar Ovlaštenih Službenika i Modulnih Prava</h2>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider">Prikazano: <span id="visible-count">6</span> od 28 zapisa</span>
</div>
<div className="overflow-x-auto w-full">
<table className="w-full text-left font-body-sm text-body-sm">
<thead className="bg-surface-container-low text-on-surface-variant font-label-kicker text-[11px] uppercase tracking-wider">
<tr>
<th className="py-3 px-4">Službenik / Kontakt</th>
<th className="py-3 px-3">Resorni Odjel</th>
<th className="py-3 px-3">Uloga & Nivo</th>
<th className="py-3 px-3">Modulna Matrica (Prava)</th>
<th className="py-3 px-3">2FA & Aktivnost</th>
<th className="py-3 px-4 text-right">Akcije</th>
</tr>
</thead>
<tbody className="text-text-body" id="rbac-table-body">
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="kabinet" data-id="1" data-role="admin" data-status="active">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        AK
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Administrator (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-primary-container font-medium">Kabinet ministra · Voditelj IT-a</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-surface-container text-primary font-medium text-[12px] whitespace-nowrap">
                      Kabinet & IT
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-primary font-bold">Glavni IT Admin</span>
<span className="font-label-badge text-label-badge text-on-surface-variant">NIVO 5 · Puni pristup</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Zaštita okoliša: Sve ovlasti">OKO:P/V/O</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Upravljanje otpadom: Sve ovlasti">OTP:P/V/O</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Turizam: Sve ovlasti">TUR:ALL</span>
<span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-mono text-[10px] font-bold" title="RBAC Korisnici: SuperAdmin">ADM:RW</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-secondary font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">key</span>
<span>FIDO2 Hardverski</span>
</div>
<span className="text-[11px] text-outline">Prije 4 min (Sarajevo IP)</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="okolis" data-id="2" data-role="lead" data-status="active">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        MK
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Rukovodilac okoliša (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-secondary font-medium">Pomoćnik ministra za zaštitu okoliša</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-emerald-light text-secondary font-medium text-[12px] whitespace-nowrap">
                      Sektor Okoliša
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-text-heading font-bold">Pomoćnik Ministra</span>
<span className="font-label-badge text-label-badge text-secondary">NIVO 4 · Signer & Approve</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-emerald-light text-secondary font-mono text-[10px] font-bold" title="Okoliš: Čitanje, unos, verifikacija, potpis">OKO:P/V/O</span>
<span className="px-1.5 py-0.5 rounded bg-emerald-light text-secondary font-mono text-[10px] font-bold" title="Otpad: Puno odobrenje">OTP:P/V/O</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[10px]" title="Turizam: Samo uvid">TUR:ČIT</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Korisnici: Nema pristup">ADM:—</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-secondary font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">shield</span>
<span>FIDO2 + E-Potpis</span>
</div>
<span className="text-[11px] text-outline">Prije 18 min (Mostar)</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="okolis" data-id="3" data-role="inspector" data-status="active">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        KB
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Inspektor (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-text-body">Viši kantonalni inspektor okoliša</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-emerald-light text-secondary font-medium text-[12px] whitespace-nowrap">
                      Sektor Okoliša / Insp.
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-text-heading font-bold">Kantonalni Inspektor</span>
<span className="font-label-badge text-label-badge text-on-surface-variant">NIVO 3 · Teren & Verifikacija</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Okoliš: Uviđaj i verifikacija nalaza">OKO:P/V</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Otpad: Inspekcijski nalozi">OTP:P/V</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Turizam: Nema prava">TUR:—</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Korisnici: Nema">ADM:—</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-secondary font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">smartphone</span>
<span>TOTP App (Aktivno)</span>
</div>
<span className="text-[11px] text-outline">Prije 1 sat (Konjic)</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="turizam" data-id="4" data-role="lead" data-status="active">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                        DP
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Rukovodilac turizma (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-primary-container font-medium">Voditelj odsjeka za turizam i ugostiteljstvo</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-surface-container text-primary-container font-medium text-[12px] whitespace-nowrap">
                      Sektor Turizma
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-text-heading font-bold">Voditelj Odsjeka</span>
<span className="font-label-badge text-label-badge text-primary-container">NIVO 4 · Certifikacija & MTU</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[10px]" title="Okoliš: Čitanje">OKO:ČIT</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Otpad: Nema">OTP:—</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold" title="Turizam: Puni unos i odobrenje vodiča">TUR:P/V/O</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Korisnici: Nema">ADM:—</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-secondary font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">phonelink_lock</span>
<span>FIDO2 Token</span>
</div>
<span className="text-[11px] text-outline">Prije 12 min (Mostar)</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="pravni" data-id="5" data-role="officer" data-status="active">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high text-text-heading flex items-center justify-center font-bold text-sm shrink-0">
                        IB
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Referent protokola (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-on-surface-variant">Referent za protokol, e-pisarnicu i arhivu</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-surface-container-low text-text-body font-medium text-[12px] whitespace-nowrap">
                      Pravni / Pisarnica
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-text-heading font-bold">Referent Pisarnice</span>
<span className="font-label-badge text-label-badge text-on-surface-variant">NIVO 2 · Djelovodnik & Unos</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-text-heading font-mono text-[10px] font-bold" title="Djelovodnik za sve resore">PROTOKOL:RW</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[10px]" title="Arhiva i propisi">PROP:RW</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[10px]" title="Rješenja okoliša: Uvid">OKO:ČIT</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]" title="Korisnici: Nema">ADM:—</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-secondary font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">smartphone</span>
<span>SMS + TOTP</span>
</div>
<span className="text-[11px] text-outline">Prije 3 sata (Mostar)</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
<tr className="user-row hover:bg-surface-container-low/60 transition-colors cursor-pointer" data-dept="vanjski" data-id="6" data-role="commission" data-status="pending">
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-amber-light text-on-tertiary-container flex items-center justify-center font-bold text-sm shrink-0">
                        SD
                      </div>
<div className="flex flex-col min-w-0">
<span className="font-button text-button font-bold text-text-heading truncate">Vanjski član (primjer)</span>
<span className="text-[12px] text-outline truncate">ime.prezime@mtto.gov.ba</span>
<span className="text-[11px] text-on-tertiary-container font-medium">Vanjski član ispitnog povjerenstva za vodiče</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<span className="px-2 py-1 rounded-lg bg-amber-light text-on-tertiary-container font-medium text-[12px] whitespace-nowrap">
                      Ispitno Povjerenstvo
                    </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-button text-button text-text-heading font-bold">Član Povjerenstva</span>
<span className="font-label-badge text-label-badge text-on-tertiary-container">NIVO 1 · Privremeni uvid</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-amber-light text-on-tertiary-container font-mono text-[10px] font-bold" title="Uvid u ispitne prijave turističkih vodiča">TUR:ISPITI</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]">OKO:—</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]">OTP:—</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-low text-outline-variant font-mono text-[10px]">ADM:—</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<div className="flex items-center gap-1 text-on-tertiary-container font-semibold text-[12px]">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span>Ističe za 14 dana</span>
</div>
<span className="text-[11px] text-outline">Zadnja prijava: Jučer</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-1">
<button className="btn-inspect-user p-1.5 rounded-lg hover:bg-surface-container text-primary-container" title="Uredi permisije">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
<button className="btn-reset-key p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="Sigurnosni reset tokena">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="font-body-sm text-body-sm text-on-surface-variant">Stranica 1 od 5 (Ukupno 28 službenika)</span>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded-lg bg-surface-container-low text-outline hover:text-text-heading text-body-sm font-button disabled:opacity-40" disabled>Prethodna</button>
<button className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary text-body-sm font-button">1</button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading text-body-sm font-button">2</button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading text-body-sm font-button">3</button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-text-heading text-body-sm font-button">Sljedeća</button>
</div>
</div>
<div className="flex items-center gap-space-xs text-[12px] text-outline">
<span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
<span>Sve promjene prava se digitalno potpisuju u ZOSPI revizijski trag.</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs text-primary-container">
<span className="material-symbols-outlined text-[20px]">policy</span>
<h3 className="font-title-md text-title-md text-text-heading">Službena hijerarhija prava (RBAC Normativ MTTO HNŽ)</h3>
</div>
<span className="font-label-badge text-label-badge text-outline">Akt br: UPI-07-02-49/24</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-5 gap-space-xs pt-1">
<div className="p-space-xs bg-surface-container-low rounded-lg">
<div className="flex items-center justify-between mb-1">
<span className="font-label-kicker text-[10px] text-on-surface-variant uppercase">Nivo 1</span>
<span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
</div>
<span className="font-button text-[12px] text-text-heading block font-bold leading-tight">Pregled (Read-Only)</span>
<p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">Uvid u javne registre, objavljene dozvole i statuse predmeta bez prava izmjene.</p>
</div>
<div className="p-space-xs bg-surface-container-low rounded-lg">
<div className="flex items-center justify-between mb-1">
<span className="font-label-kicker text-[10px] text-on-surface-variant uppercase">Nivo 2</span>
<span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim"></span>
</div>
<span className="font-button text-[12px] text-text-heading block font-bold leading-tight">Nacrt & Pisarnica</span>
<p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">Zaprimanje pošte, dodjela UPI broja, unošenje podataka i priprema radnih verzija.</p>
</div>
<div className="p-space-xs bg-surface-container-low rounded-lg">
<div className="flex items-center justify-between mb-1">
<span className="font-label-kicker text-[10px] text-on-surface-variant uppercase">Nivo 3</span>
<span className="w-1.5 h-1.5 rounded-full bg-on-primary-container"></span>
</div>
<span className="font-button text-[12px] text-text-heading block font-bold leading-tight">Verifikacija Nalaza</span>
<p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">Inspekcijski zapisnici na terenu, stručna ocjena elaborata i ovjera usklađenosti.</p>
</div>
<div className="p-space-xs bg-surface-container-low rounded-lg">
<div className="flex items-center justify-between mb-1">
<span className="font-label-kicker text-[10px] text-secondary uppercase">Nivo 4</span>
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
</div>
<span className="font-button text-[12px] text-text-heading block font-bold leading-tight">Konačni Potpis</span>
<p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">Digitalno potpisivanje rješenja sa službenim certifikatom i slanje u službeni glasnik.</p>
</div>
<div className="p-space-xs bg-surface-container-low rounded-lg">
<div className="flex items-center justify-between mb-1">
<span className="font-label-kicker text-[10px] text-primary uppercase">Nivo 5</span>
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
</div>
<span className="font-button text-[12px] text-text-heading block font-bold leading-tight">Sistemski Admin</span>
<p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">Upravljanje bazom, RBAC ulogama, revizijskim logovima i sigurnosnim ključevima.</p>
</div>
</div>
</div>
</div>
<div className="xl:col-span-4 flex flex-col space-y-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col" id="inspector-card">
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-xs">
<div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
<span className="font-label-kicker text-label-kicker uppercase text-primary-container tracking-wider">Aktivni Inspektor Prava</span>
</div>
<span className="font-label-badge text-label-badge px-2 py-0.5 rounded-lg bg-surface-container text-primary" id="active-user-badge">NIVO 4 (Signer)</span>
</div>
<div className="py-space-sm bg-surface-container-low px-space-sm rounded-lg mb-space-sm">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-base shrink-0 shadow-sm" id="inspector-avatar">
                MK
              </div>
<div className="flex flex-col min-w-0">
<h4 className="font-button text-button font-bold text-text-heading truncate" id="inspector-name">Rukovodilac okoliša (primjer)</h4>
<p className="font-body-sm text-[12px] text-on-surface-variant truncate" id="inspector-role">Pomoćnik ministra · Sektor za zaštitu okoliša</p>
<div className="flex items-center gap-2 mt-0.5">
<span className="text-[11px] text-outline font-mono" id="inspector-email">ime.prezime@mtto.gov.ba</span>
</div>
</div>
</div>
</div>
<div className="space-y-space-md">
<div>
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant block mb-2">Granularne Ovlasti po Modulima</span>
<div className="space-y-2">
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">nature_people</span>
<span className="font-button text-[13px] text-text-heading">Okolišne dozvole & Elaborati</span>
</div>
<span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-emerald-light text-secondary">Puni potpis</span>
</div>
<div className="grid grid-cols-4 gap-1 pt-1">
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Čitanje</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Unos</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Provjera</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-secondary font-semibold cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Potpis</span>
</label>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">recycling</span>
<span className="font-button text-[13px] text-text-heading">Planovi upravljanja otpadom</span>
</div>
<span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-emerald-light text-secondary">Puni potpis</span>
</div>
<div className="grid grid-cols-4 gap-1 pt-1">
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Čitanje</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Unos</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Provjera</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-secondary font-semibold cursor-pointer">
<input defaultChecked className="accent-secondary h-3.5 w-3.5" type="checkbox" />
<span>Potpis</span>
</label>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">travel_explore</span>
<span className="font-button text-[13px] text-text-heading">Turizam & Registri vodiča</span>
</div>
<span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Samo čitanje</span>
</div>
<div className="grid grid-cols-4 gap-1 pt-1">
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-primary-container h-3.5 w-3.5" type="checkbox" />
<span>Čitanje</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-outline cursor-pointer opacity-50">
<input className="accent-primary-container h-3.5 w-3.5" disabled type="checkbox" />
<span>Unos</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-outline cursor-pointer opacity-50">
<input className="accent-primary-container h-3.5 w-3.5" disabled type="checkbox" />
<span>Provjera</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-outline cursor-pointer opacity-50">
<input className="accent-primary-container h-3.5 w-3.5" disabled type="checkbox" />
<span>Potpis</span>
</label>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">gavel</span>
<span className="font-button text-[13px] text-text-heading">Javni uvidi & Propisi HNŽ</span>
</div>
<span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Čitanje + Komentari</span>
</div>
<div className="grid grid-cols-4 gap-1 pt-1">
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-primary-container h-3.5 w-3.5" type="checkbox" />
<span>Čitanje</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-text-body cursor-pointer">
<input defaultChecked className="accent-primary-container h-3.5 w-3.5" type="checkbox" />
<span>Nacrt</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-outline cursor-pointer opacity-50">
<input className="accent-primary-container h-3.5 w-3.5" disabled type="checkbox" />
<span>Provjera</span>
</label>
<label className="flex items-center gap-1 text-[11px] text-outline cursor-pointer opacity-50">
<input className="accent-primary-container h-3.5 w-3.5" disabled type="checkbox" />
<span>Potpis</span>
</label>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low/60 opacity-60 flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-outline">admin_panel_settings</span>
<span className="font-button text-[13px] text-text-heading">Administracija korisnika (RBAC)</span>
</div>
<span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline">Zaključano (Nivo 5)</span>
</div>
<p className="font-body-sm text-[11px] text-outline">Samo Glavni IT Administrator može mijenjati korisničke račune.</p>
</div>
</div>
</div>
<div className="pt-space-xs space-y-2">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant block">Sigurnosni Parametri i FIDO2 Zaštita</span>
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
<div className="flex flex-col">
<span className="font-button text-[12px] text-text-heading">Zahtijevaj FIDO2 Hardverski Token</span>
<span className="font-body-sm text-[11px] text-outline">YubiKey / PKI Pametna kartica MTTO</span>
</div>
<input defaultChecked className="accent-secondary h-4 w-4" type="checkbox" />
</div>
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
<div className="flex flex-col">
<span className="font-button text-[12px] text-text-heading">Geofencing & VPN Restrikcija</span>
<span className="font-body-sm text-[11px] text-outline">Dozvoljene IP adrese Vlade HNŽ / Kantona</span>
</div>
<input defaultChecked className="accent-secondary h-4 w-4" type="checkbox" />
</div>
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
<div className="flex flex-col">
<span className="font-button text-[12px] text-text-heading">Revocable Session (Trenutni prekid)</span>
<span className="font-body-sm text-[11px] text-outline">Odjavi sa svih aktivnih radnih stanica</span>
</div>
<button className="px-2 py-1 rounded bg-error-container text-on-error-container font-button text-[11px] hover:bg-error hover:text-on-error transition-colors">
                  Kill Session
                </button>
</div>
</div>
<div className="pt-space-xs flex flex-col gap-2">
<button className="w-full py-2.5 rounded-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep transition-all flex items-center justify-center gap-2 shadow-sm" id="btn-save-permissions">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Potvrdi & Digitalno Potpiši Izmjene</span>
</button>
<div className="flex items-center justify-between px-1">
<span className="text-[10px] text-outline font-mono">MD5 Sigurnosni pečat spreman</span>
<span className="text-[10px] text-secondary font-semibold">ZOSPI Audit Trail aktivan</span>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
<div className="flex items-center justify-between pb-1">
<div className="flex items-center gap-space-xs text-primary-container">
<span className="material-symbols-outlined text-[18px]">shield_person</span>
<h4 className="font-button text-button font-bold text-text-heading">Zadnji Sigurnosni Dnevnik (RBAC)</h4>
</div>
<a className="font-label-badge text-label-badge text-primary-container hover:underline" href="#">SVI ZAPISI</a>
</div>
<div className="space-y-2.5 pt-1">
<div className="flex items-start gap-2.5 text-body-sm text-[12px]">
<span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5"></span>
<div className="flex flex-col min-w-0">
<span className="text-text-heading font-medium truncate">Urednik MTTO dodijelio privremeni uvid mr. Senadu Dž.</span>
<span className="text-outline text-[11px]">Modul Turizam / Prijave vodiča · Prije 42 min</span>
</div>
</div>
<div className="flex items-start gap-2.5 text-body-sm text-[12px]">
<span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5"></span>
<div className="flex flex-col min-w-0">
<span className="text-text-heading font-medium truncate">Rukovodilac okoliša (primjer) digitalno potpisala Okolišnu Dozvolu</span>
<span className="text-outline text-[11px]">Predmet UPI-07/2-19-114/24 · Prije 1 sat</span>
</div>
</div>
<div className="flex items-start gap-2.5 text-body-sm text-[12px]">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container shrink-0 mt-1.5"></span>
<div className="flex flex-col min-w-0">
<span className="text-text-heading font-medium truncate">Neuspjela prijava s neautorizirane IP adrese</span>
<span className="text-outline text-[11px]">IP 195.222.38.12 (Blokirano WAF pravilom) · Prije 3 sata</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<div className="fixed inset-0 bg-institutional-navy-deep/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-space-md" id="create-user-modal">
<div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full p-space-lg space-y-space-md overflow-y-auto max-h-[921px]">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[24px]">person_add</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-heading">Kreiranje Novog Korisničkog Računa</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Uvođenje novog službenika u MTTO informacijski sustav</p>
</div>
</div>
<button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-text-heading" id="btn-close-modal">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<form className="space-y-space-md pt-space-xs" id="new-user-form">
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-kicker text-label-kicker uppercase text-on-surface-variant mb-1">Ime i Prezime sa Zvanjem</label>
<input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="npr. mr. sc. Goran M." required type="text" />
</div>
<div>
<label className="block font-label-kicker text-label-kicker uppercase text-on-surface-variant mb-1">Službena E-pošta (@mtto.gov.ba)</label>
<input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="ime.prezime@mtto.gov.ba" required type="email" />
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-kicker text-label-kicker uppercase text-on-surface-variant mb-1">Resorni Odjel MTTO</label>
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
<option>Sektor za zaštitu okoliša</option>
<option>Sektor za turizam i ugostiteljstvo</option>
<option>Sektor za trgovinu</option>
<option>Sektor za pravne i opće poslove</option>
<option>Kabinet ministra</option>
<option>Vanjsko ispitno povjerenstvo (privremeno)</option>
</select>
</div>
<div>
<label className="block font-label-kicker text-label-kicker uppercase text-on-surface-variant mb-1">Primarna Uloga & Nivo</label>
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-text-heading font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
<option>Nivo 1: Pregled javnih podataka (Read-only)</option>
<option>Nivo 2: Referent pisarnice / Unos nacrta</option>
<option>Nivo 3: Resorni inspektor / Verifikacija nalaza</option>
<option>Nivo 4: Voditelj odsjeka / Odobravanje i potpis</option>
<option>Nivo 5: Glavni IT Administrator</option>
</select>
</div>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low space-y-2">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant block">Autentifikacija & Kriptografski Ključ</span>
<div className="flex items-center gap-space-md flex-wrap">
<label className="flex items-center gap-2 font-body-sm text-body-sm text-text-heading cursor-pointer">
<input defaultChecked className="accent-secondary" name="mfa-type" type="radio" />
<span>FIDO2 / WebAuthn Token</span>
</label>
<label className="flex items-center gap-2 font-body-sm text-body-sm text-text-heading cursor-pointer">
<input className="accent-secondary" name="mfa-type" type="radio" />
<span>TOTP Autentifikator (RFC 6238)</span>
</label>
<label className="flex items-center gap-2 font-body-sm text-body-sm text-text-heading cursor-pointer">
<input className="accent-secondary" name="mfa-type" type="radio" />
<span>Službeni SMS OTP (Fallback)</span>
</label>
</div>
</div>
<div className="flex items-center justify-end gap-space-sm pt-space-sm">
<button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface-variant font-button text-button hover:text-text-heading" id="btn-cancel-modal" type="button">
            Odustani
          </button>
<button className="px-5 py-2 rounded-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep shadow-sm" id="btn-submit-modal" type="submit">
            Izdaj vjerodajnice i aktiviraj račun
          </button>
</div>
</form>
</div>
</div>
<div className="fixed bottom-6 right-6 z-50 bg-institutional-navy-deep text-on-primary px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none" id="toast-feedback">
<span className="material-symbols-outlined text-secondary text-[20px]" id="toast-icon">check_circle</span>
<span className="font-body-sm text-body-sm" id="toast-msg">Radnja uspješno evidentirana u sigurnosni dnevnik.</span>
</div>
</div></div></>
  );
}
