/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function PropisiHero(props: any) {
  return (
<><section className="relative bg-institutional-navy-deep text-on-primary py-space-xl overflow-hidden hero-theme">
<div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-40 pointer-events-none"></div>
<div className="absolute left-1/3 bottom-0 w-80 h-80 bg-secondary rounded-full blur-3xl opacity-20 pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-gutter relative z-10">
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
<div className="max-w-3xl">
<div className="inline-flex items-center gap-space-xs px-3 py-1 bg-primary-container text-secondary-fixed rounded mb-space-sm">
<span className="material-symbols-outlined text-[16px]">gavel</span>
<span className="font-label-kicker text-label-kicker uppercase">Normativni okvir i e-uprava</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight mb-space-sm">
            Službeni Propisi, Zakoni i Obrasci Zahtjeva
          </h1>
<p className="font-body-lead text-body-lead text-primary-fixed-dim max-w-2xl leading-relaxed">
            Svi važeći kantonalni zakoni, podzakonski akti, pravilnici, odluke Vlade i službeni obrasci za građane i gospodarske subjekte u formatu spremnom za preuzimanje i digitalnu predaju.
          </p>
</div>
<div className="flex items-center gap-space-md self-start lg:self-auto">
<div className="bg-primary-container/80 backdrop-blur px-space-md py-3 rounded-xl flex items-center gap-space-md shadow-md">
<div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-on-secondary">
<span className="material-symbols-outlined text-[22px]">verified</span>
</div>
<div>
<span className="block font-label-badge text-label-badge text-primary-fixed-dim uppercase">Ažuriranost arhiva</span>
<span className="font-title-md text-title-md text-on-primary font-bold">{props.updated}</span>
</div>
</div>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-xl pt-space-md">
<div className="bg-primary-container/50 backdrop-blur p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-body-sm text-body-sm text-primary-fixed-dim">Važećih zakona</span>
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">account_balance</span>
</div>
<p className="font-headline-md text-headline-md text-on-primary">{props.n.zakoni}</p>
<span className="font-label-badge text-label-badge text-secondary-fixed">Hercegovačko-neretvanska županija</span>
</div>
<div className="bg-primary-container/50 backdrop-blur p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-body-sm text-body-sm text-primary-fixed-dim">Pravilnika i akata</span>
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">menu_book</span>
</div>
<p className="font-headline-md text-headline-md text-on-primary">{props.n.pravilnici}</p>
<span className="font-label-badge text-label-badge text-primary-fixed-dim">Sektor turizma, okoliša i trgovine</span>
</div>
<div className="bg-primary-container/50 backdrop-blur p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-body-sm text-body-sm text-primary-fixed-dim">E-Obrazaca</span>
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">download_for_offline</span>
</div>
<p className="font-headline-md text-headline-md text-on-primary">{props.n.obrasci}</p>
<span className="font-label-badge text-label-badge text-secondary-fixed">Spremni za digitalnu predaju</span>
</div>
<div className="bg-primary-container/50 backdrop-blur p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-body-sm text-body-sm text-primary-fixed-dim">Pisarnica Mostar</span>
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">history_edu</span>
</div>
<p className="font-headline-md text-headline-md text-on-primary">08:30-14:00</p>
<span className="font-label-badge text-label-badge text-primary-fixed-dim">Rad sa strankama svaki radni dan</span>
</div>
</div>
</div>
</section></>
  );
}

export function PropisiForms(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full py-space-xl">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
<div>
<div className="inline-flex items-center gap-space-xs font-label-kicker text-label-kicker text-secondary uppercase mb-1">
<span className="material-symbols-outlined text-[16px]">bolt</span>
<span>Hitni i frekventni postupci</span>
</div>
<h2 className="font-headline-md text-headline-md text-primary">Najčešće traženi obrasci za preuzimanje</h2>
</div>
<p className="font-body-sm text-body-sm text-text-body max-w-md">
        Standardizirani formulari usklađeni s upravnim postupkom HNŽ. Možete ih popuniti na računalu ili ispisati za predaju na protokolu.
      </p>
</div>
{props.forms}
</section></>
  );
}

export function PropisiTable(props: any) {
  return (
<><section className="bg-surface-container-low py-space-xl" id="pravna-tablica">
<div className="max-w-7xl mx-auto px-gutter w-full">
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
<div>
<div className="inline-flex items-center gap-space-xs font-label-kicker text-label-kicker text-primary uppercase mb-1">
<span className="material-symbols-outlined text-[16px]">library_books</span>
<span>Registar važećih akata HNŽ / HNK</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary">Službeni propisi po pravnim cjelinama</h2>
</div>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs">
<div className="relative">
{props.search}
<span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
</div>
</div>
</div>
{props.tabs}
<div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left" id="propisiTable">
<thead>
<tr className="bg-surface-container text-on-surface font-title-md text-body-sm">
<th className="py-3.5 px-space-md font-semibold">Naziv pravnog akta</th>
<th className="py-3.5 px-space-md font-semibold whitespace-nowrap">Službeno glasilo (SN HNŽ)</th>
<th className="py-3.5 px-space-md font-semibold whitespace-nowrap">Datum stupanja na snagu</th>
<th className="py-3.5 px-space-md font-semibold">Sažetak primjene i nadležnost</th>
<th className="py-3.5 px-space-md font-semibold text-right">Pročišćeni tekst</th>
</tr>
</thead>
{props.rows}
</table>
</div>
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-text-body">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-outline text-[18px]">info</span>
<span>Prikazano je <strong id="itemCount">5</strong> službenih propisa u odabranoj kategoriji.</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="text-outline">Trebate ovjereni izvod iz arhive?</span>
<a className="text-primary font-bold hover:underline inline-flex items-center gap-0.5" href="#pisarnica">
<span>Kontaktirajte protokol</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</a>
</div>
</div>
</div>
</div>
</section></>
  );
}

export function PropisiHowTo(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full py-space-xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
<div className="lg:col-span-5 relative">
<div className="relative rounded-xl overflow-hidden shadow-lg aspect-4/3">
<img className="w-full h-full object-cover" data-alt="Official government administrative records and digital archives office in Mostar, historic architectural details mixed with contemporary office technology, soft natural light streaming onto organized legal binders and citizen documents in deep navy and warm tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0yBrRKIukSQHYnpip68rCQfTAT4QlEESLSLgG38qr4_OuYm_ZCxjIKvUV8eRzhKXLFYNv0cbqX6PazfWJruI1dfP741NTK6vihBsOGrBGmzfMyVHocSWUI5FZ8FEn94mzQ0G1OvGYHqTaDukk1I5RAAgHaCe2XA7tIE7vF2ZznJeLveiY4KS_xejsdHT4UtgQu3kT5bkelklecS0tqINRzXxvre5RO7XJm6_6Opo" />
<div className="absolute inset-0 bg-gradient-to-t from-institutional-navy-deep/80 via-institutional-navy-deep/20 to-transparent"></div>
<div className="absolute bottom-4 left-4 right-4 text-on-primary">
<span className="font-label-badge text-label-badge bg-secondary px-2 py-0.5 rounded text-on-secondary mb-1 inline-block">PISARNICA I PROTOKOL</span>
<p className="font-body-regular text-body-regular font-bold">Glavni kantonalni protokol za prijem podnesaka</p>
<p className="font-body-sm text-body-sm text-primary-fixed-dim">Braće Fejića bb, 88000 Mostar</p>
</div>
</div>
<div className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-space-md rounded-xl shadow-md hidden sm:flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-emerald-light text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">task_alt</span>
</div>
<div>
<p className="font-label-badge text-label-badge text-outline">Prosječno rješavanje</p>
<p className="font-title-md text-title-md font-bold text-primary">15 radnih dana</p>
</div>
</div>
</div>
<div className="lg:col-span-7 flex flex-col gap-space-md">
<div>
<span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider block mb-1">Standardizacija predaje</span>
<h2 className="font-headline-lg text-headline-lg text-primary leading-tight">
            Kako ispravno podnijeti zahtjev Ministarstvu?
          </h2>
<p className="font-body-lead text-body-lead text-text-body mt-space-xs">
            Svaki građanin ili gospodarski subjekt može podnijeti zahtjev na dva ravnopravna zakonska načina propisana Zakonom o upravnom postupku.
          </p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[22px]">devices</span>
</div>
<h3 className="font-title-md text-title-md text-primary mb-1">1. Putem e-Pisarnice</h3>
<p className="font-body-sm text-body-sm text-text-body mb-space-sm">
              Ispunite digitalni PDF/Word obrazac, potpišite kvalificiranim certifikatom i pošaljite uz dokaz o taksi na službeni e-protokol.
            </p>
<span className="font-label-badge text-label-badge text-secondary font-bold inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">bolt</span> Preporučeni brzi postupak
            </span>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[22px]">store</span>
</div>
<h3 className="font-title-md text-title-md text-primary mb-1">2. Fizički na protokolu</h3>
<p className="font-body-sm text-body-sm text-text-body mb-space-sm">
              Predajte originalni ispisani zahtjev sa svim prilozima direktno u centralnoj pisarnici u Mostaru svaki radni dan od 08:30 do 14:00 sati.
            </p>
<span className="font-label-badge text-label-badge text-primary font-bold inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check</span> Trenutno izdavanje prijemnog štambilja
            </span>
</div>
</div>
<div className="bg-amber-light text-on-tertiary-fixed p-space-md rounded-xl shadow-sm flex items-start gap-space-sm"><span className="material-symbols-outlined text-[#926304] text-[24px] mt-0.5">account_balance_wallet</span>
<div>
<h4 className="font-title-md text-body-regular font-bold text-on-tertiary-fixed font-headline-sm">Uplata županijske upravne pristojbe (takse)</h4>
<p className="font-body-sm text-body-sm text-on-tertiary-fixed leading-relaxed mt-0.5">
    Za većinu upravnih zahtjeva obvezna je pristojba od <strong className="condensed-text text-[14px]">15,00 KM</strong> (tarifni broj 1.). Primjer uplate (demo): <strong className="condensed-text text-[15px] font-bold text-[#1e3a7c]">XXXX-XXXX-XXXX</strong> (UniCredit Bank d.d.), Vrsta prihoda: <strong className="condensed-text text-[14px]">722121</strong>, Općina: <strong className="condensed-text text-[14px]">180 (Mostar)</strong>.
  </p>
</div></div>
</div>
</div>
</section></>
  );
}

export function PropisiContact(props: any) {
  return (
<><section className="bg-surface-container py-space-xl" id="pisarnica">
<div className="max-w-7xl mx-auto px-gutter w-full">
<div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
<div className="grid grid-cols-1 lg:grid-cols-12">
<div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-between">
<div>
<span className="font-label-kicker text-label-kicker text-primary uppercase mb-1 block">Izravan kontakt s referentima</span>
<h2 className="font-headline-md text-headline-md text-primary mb-space-sm">
                Centralna Pisarnica i Služba za odnose sa strankama
              </h2>
<p className="font-body-regular text-body-regular text-text-body mb-space-lg">
                Ukoliko imate dilemu oko potrebne dokumentacije za izdavanje dozvola ili želite provjeriti status ranije predanog predmeta pod brojem protokola:
              </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mt-1">
<span className="material-symbols-outlined text-[20px]">location_on</span>
</div>
<div>
<span className="block font-title-md text-body-regular font-bold text-primary">Adresa pisarnice</span>
<p className="font-body-sm text-body-sm text-text-body">Braće Fejića bb, prizemlje</p>
<p className="font-body-sm text-body-sm text-outline">88000 Mostar, BiH</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mt-1">
<span className="material-symbols-outlined text-[20px]">schedule</span>
</div>
<div>
<span className="block font-title-md text-body-regular font-bold text-primary">Radno vrijeme</span>
<p className="font-body-sm text-body-sm text-text-body">Ponedjeljak – Petak</p>
<p className="font-body-sm text-body-sm text-secondary font-bold condensed-text">08:30 – 14:00 (sa strankama)</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mt-1">
<span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
</div>
<div>
<span className="block font-title-md text-body-regular font-bold text-primary">Telefonski protokol</span>
<p className="font-body-sm text-body-sm text-text-body">+387 36 551 823</p>
<p className="font-body-sm text-body-sm text-outline">Lokal: 104 (Prijemna kancelarija)</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mt-1">
<span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
</div>
<div>
<span className="block font-title-md text-body-regular font-bold text-primary">E-pisarnica i protokoli</span>
<p className="font-body-sm text-body-sm text-text-body">info@mtto.gov.ba</p>
<p className="font-body-sm text-body-sm text-outline">ZOSPI: kabinetministarstva@mtto.gov.ba</p>
</div>
</div>
</div>
</div>
<div className="p-space-sm bg-surface-container rounded-lg flex items-center justify-between">
<span className="font-body-sm text-body-sm text-text-body">Trebate službeni obrazac u drugom pristupačnom formatu?</span>
<a className="text-primary font-bold font-button text-button hover:underline inline-flex items-center gap-1" href="mailto:info@mtto.gov.ba">
<span>Zatražite asistenciju</span>
<span className="material-symbols-outlined text-[16px]">mail</span>
</a>
</div>
</div>
<div className="lg:col-span-5 bg-surface-container-high p-space-lg flex flex-col justify-between">
<div>
<span className="font-label-badge text-label-badge bg-primary text-on-primary px-2.5 py-1 rounded inline-block mb-space-sm">BRZA E-PROVJERA</span>
<h3 className="font-title-md text-title-md text-primary mb-space-xs">Pretraga statusa Vašeg podneska <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></h3>
<p className="font-body-sm text-body-sm text-text-body mb-space-md">
                Unesite djelovodni broj dodijeljen pri predaji na protokolu (npr. <span className="font-mono text-primary font-bold">UP/I-07-24/26</span>) kako biste provjerili zaduženog referenta i stupanj rješavanja.
              </p>
<form className="flex flex-col gap-space-sm">
<div>
<label className="block font-label-badge text-label-badge text-on-surface-variant uppercase mb-1" htmlFor="protocolNumber">Djelovodni broj predmeta</label>
<div className="relative">
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded text-on-surface font-body-sm text-body-sm shadow-sm focus:outline-none" id="protocolNumber" placeholder="Npr. UP/I-07-128/26" required type="text" />
<span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-[18px]">tag</span>
</div>
</div>
<div>
<label className="block font-label-badge text-label-badge text-on-surface-variant uppercase mb-1" htmlFor="applicantPin">JIB Podnositelja / OIB tvrtke</label>
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded text-on-surface font-body-sm text-body-sm shadow-sm focus:outline-none" id="applicantPin" placeholder="13-znamenkasti identifikator" required type="text" />
</div>
<button className="w-full mt-space-xs py-2.5 bg-primary text-on-primary rounded font-button text-button hover:bg-institutional-navy-deep transition-colors inline-flex items-center justify-center gap-2 shadow-sm btn-primary-ds" type="submit">
<span className="material-symbols-outlined text-[18px]">search</span>
<span>Provjeri status u pisarnici</span>
</button>
</form>
<div className="hidden mt-space-md p-space-sm bg-surface-container-lowest rounded-lg shadow-sm" id="searchResult">
<div className="flex items-center gap-space-xs text-secondary font-bold font-body-sm text-body-sm mb-1">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Predmet u radu • Stručni referent dodijeljen</span>
</div>
<p className="font-body-sm text-body-sm text-text-body">
                  Podnesak zaprimljen 04. 04. 2026. Predviđeno donošenje rješenja u zakonskom roku do 25. 04. 2026.
                </p>
</div>
</div>
<div className="pt-space-md mt-space-md flex items-center justify-between text-outline font-body-sm text-body-sm">
<span>Sustav e-Protokola HNŽ</span>
<span className="flex items-center gap-1 text-secondary font-bold">
<span className="w-2 h-2 rounded-full bg-secondary"></span> Sustav online
              </span>
</div>
</div>
</div>
</div>
</div>
</section></>
  );
}
