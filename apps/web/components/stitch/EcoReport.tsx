/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function EcoReportF2(props: any) {
  return (
<><div className="max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-md"><div className="flex items-start gap-space-sm p-space-md rounded-xl bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm"><span className="material-symbols-outlined">science</span><span><strong>Prototip ekrana (Faza 2).</strong> Prikazani su dizajn i primjer podataka. Modul se povezuje sa stvarnom evidencijom u drugoj fazi projekta.</span></div></div><div className="max-w-xl mx-auto py-space-lg px-margin-mobile"><div className="rounded-2xl bg-surface shadow-md p-space-md"><div className="flex flex-col w-full pb-8">
<div className="bg-surface-container-low rounded-xl p-space-md shadow-sm mb-space-md">
<div className="flex items-center justify-between gap-space-xs mb-space-sm">
<div className="flex items-center gap-space-xs min-w-0">
<span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-badge text-label-badge flex items-center justify-center flex-shrink-0">2</span>
<span className="font-label-kicker text-label-kicker uppercase text-primary truncate font-bold">Korak 2 od 4</span>
</div>
<span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary bg-emerald-light px-2 py-0.5 rounded-lg flex-shrink-0 font-bold">50% Dovršeno</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-space-xs">
<div className="bg-secondary h-full rounded-full transition-all duration-500" style={{width: '50%'}}></div>
</div>
<p className="font-headline-sm text-headline-sm text-institutional-navy-deep mt-space-xs truncate">Lokacija i podaci o incidentu</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Unesite precizne parametre terenskog zapažanja za hitni inspekcijski uviđaj.</p>
</div>
<div className="bg-emerald-light rounded-xl p-space-md shadow-sm mb-space-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
<div className="min-w-0 flex-1">
<p className="font-label-kicker text-label-kicker uppercase text-secondary font-bold tracking-wider">PROTOKOL HITNOSTI (UPI-e)</p>
<p className="font-body-sm text-body-sm text-on-secondary-container mt-0.5 leading-snug">
        Vaša prijava automatski dobiva UPI djelovodni broj i prosljeđuje se dežurnom kantonalnom inspektoru u roku od 15 minuta.
      </p>
</div>
</div>
<form className="flex flex-col gap-space-lg" id="incidentWizardForm">
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">category</span>
<label className="font-title-md text-title-md text-institutional-navy-deep font-bold">Kategorija zahtjeva</label>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Odaberite pravni osnov i prirodu ekološkog događaja.</p>
<div className="grid grid-cols-1 gap-space-sm mt-space-xs">
<label className="cursor-pointer">
<input defaultChecked className="peer sr-only" name="tip_zahtjeva" type="radio" defaultValue="voda_otpad" />
<div className="p-space-md rounded-xl bg-surface-container-low peer-checked:bg-primary peer-checked:text-on-primary transition-all shadow-sm flex items-start gap-space-sm">
<span className="material-symbols-outlined text-[24px] text-primary peer-checked:text-on-primary flex-shrink-0">water_drop</span>
<div className="flex flex-col min-w-0">
<span className="font-title-md text-title-md font-bold leading-tight">Onečišćenje Neretve / Divlji deponij</span>
<span className="font-body-sm text-body-sm opacity-90 mt-0.5">Izljev tvari, mutnoća korita, ilegalno odlaganje glomaznog otpada</span>
</div>
</div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="tip_zahtjeva" type="radio" defaultValue="zrak_buka" />
<div className="p-space-md rounded-xl bg-surface-container-low peer-checked:bg-primary peer-checked:text-on-primary transition-all shadow-sm flex items-start gap-space-sm">
<span className="material-symbols-outlined text-[24px] text-primary peer-checked:text-on-primary flex-shrink-0">air</span>
<div className="flex flex-col min-w-0">
<span className="font-title-md text-title-md font-bold leading-tight">Emisije u zrak i prekoračenje buke</span>
<span className="font-body-sm text-body-sm opacity-90 mt-0.5">Industrijska postrojenja, mirisi i prašina iznad graničnih vrijednosti</span>
</div>
</div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="tip_zahtjeva" type="radio" defaultValue="obnova_dozvole" />
<div className="p-space-md rounded-xl bg-surface-container-low peer-checked:bg-primary peer-checked:text-on-primary transition-all shadow-sm flex items-start gap-space-sm">
<span className="material-symbols-outlined text-[24px] text-primary peer-checked:text-on-primary flex-shrink-0">assignment_turned_in</span>
<div className="flex flex-col min-w-0">
<span className="font-title-md text-title-md font-bold leading-tight">Zahtjev za obnovu okolišne dozvole</span>
<span className="font-body-sm text-body-sm opacity-90 mt-0.5">Redovni postupak produženja ili izmjene okolišne suglasnosti</span>
</div>
</div>
</label>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between gap-space-xs">
<div className="flex items-center gap-space-xs min-w-0">
<span className="material-symbols-outlined text-secondary text-[20px]">pin_drop</span>
<label className="font-title-md text-title-md text-institutional-navy-deep font-bold truncate">Lokacija incidenta</label>
</div>
<span className="font-label-badge text-label-badge uppercase bg-amber-light text-on-tertiary-container px-2 py-0.5 rounded-lg flex-shrink-0 font-bold">OBVEZNO</span>
</div>
<button className="w-full py-3 px-space-md bg-secondary text-on-secondary rounded-lg font-button text-button flex items-center justify-center gap-space-sm shadow-sm active:scale-95 transition-all" id="gpsBtn" type="button">
<span className="material-symbols-outlined text-[20px]">my_location</span>
<span>Detektiraj moju trenutnu GPS lokaciju</span>
</button>
<div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-space-sm" id="gpsStatusCard">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary">
<span className="material-symbols-outlined text-[18px]">satellite_alt</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant font-bold">Očitane koordinate</span>
<span className="font-body-sm text-body-sm text-institutional-navy-deep font-bold truncate" id="coordsDisplay">43.3438° N, 17.8078° E (Mostar Sjever)</span>
</div>
</div>
<span className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0 animate-ping"></span>
</div>
<div className="flex flex-col gap-space-xs">
<div className="w-full h-44 rounded-xl bg-cover bg-center shadow-inner relative overflow-hidden" data-location="Neretva river, Mostar, Bosnia and Herzegovina" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHmM_yj6umq_NsexvyuatDctARhBCY93JAPV791uIL6KeonwhArSgQFH6J9K7r6Xw5jLJYaSYh85hc_buzhvGwBp9U4AEWrZqlz5azruq-B8vdnuGE6jmtrQclN2B8L8Ow3e2UidD7n6PtbSrvLNGymBUGdliWqg1Ug9ZPGX5xvR7_B8wub2pWsml4SKIaFb7o4zGdhQg1xoW28m4oqjGNRlTHWfGrF1FDRna4WiM')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-institutional-navy-deep/80 via-transparent to-transparent pointer-events-none"></div>
<div className="absolute top-2 left-2 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
<span className="material-symbols-outlined text-secondary text-[16px]">radar</span>
<span className="font-label-kicker text-label-kicker uppercase text-institutional-navy-deep font-bold">Terenski radar HNŽ</span>
</div>
<div className="absolute bottom-2 left-2 right-2 bg-surface-container-lowest/95 backdrop-blur px-3 py-2 rounded-lg shadow-sm flex items-center justify-between">
<div className="flex items-center gap-2 min-w-0">
<span className="material-symbols-outlined text-error text-[18px] flex-shrink-0">location_on</span>
<p className="font-body-sm text-body-sm text-institutional-navy-deep font-semibold truncate">Sektor: Kanjon Neretve - dionica Vrapčići</p>
</div>
<span className="font-label-badge text-label-badge uppercase text-secondary font-bold">Točnost ±4m</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-outline">Karta koristi službene GIS slojeve vodotoka HNŽ i zaštićenih područja.</p>
</div>
<div className="flex flex-col gap-space-xs">
<label className="font-body-sm text-body-sm text-institutional-navy-deep font-bold" htmlFor="opcinaSelect">Općina / Grad u HNŽ</label>
<div className="relative w-full">
<select className="w-full h-11 px-3 bg-surface-container-low text-institutional-navy-deep rounded-lg font-body-regular text-body-regular appearance-none pr-10 focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="opcinaSelect">
<option value="mostar">Grad Mostar</option>
<option value="konjic">Grad Konjic</option>
<option value="jablanica">Općina Jablanica</option>
<option value="capljina">Grad Čapljina</option>
<option value="stolac">Grad Stolac</option>
<option value="neum">Općina Neum</option>
<option value="citluk">Općina Čitluk</option>
<option value="prozor">Općina Prozor-Rama</option>
<option value="ravno">Općina Ravno</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
<span className="material-symbols-outlined text-[20px]">expand_more</span>
</div>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<label className="font-body-sm text-body-sm text-institutional-navy-deep font-bold" htmlFor="adresaInput">Ulica / Mikrolokacija / Katastarska čestica</label>
<input className="w-full h-11 px-3 bg-surface-container-low text-institutional-navy-deep rounded-lg font-body-regular text-body-regular placeholder-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="adresaInput" placeholder="npr. Maršala Tita bb, most kod Sjevernog logora" type="text" defaultValue="Magistralni put M-17, lokalitet Salakovac" />
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">notes</span>
<label className="font-title-md text-title-md text-institutional-navy-deep font-bold" htmlFor="opisZapazanja">Opis zapažanja na terenu</label>
</div>
<span className="font-label-badge text-label-badge text-outline font-bold" id="charCounter">67 / 500</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Navedite boju vode, intezitet mirisa, izvor ispusta ili registarske oznake teretnih vozila ako su uočena.</p>
<textarea className="w-full p-3 bg-surface-container-low text-institutional-navy-deep rounded-lg font-body-regular text-body-regular placeholder-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm resize-none" id="opisZapazanja" maxLength={500} placeholder="Opišite detalje incidenta..." rows={4} defaultValue={'Uočeno zamućenje vode i neugodan miris nizvodno od industrijske zone.'}></textarea>
<div className="flex flex-wrap gap-space-xs mt-space-xs">
<button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-badge text-label-badge uppercase hover:bg-surface-variant transition-colors" type="button">+ Pjena na površini</button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-badge text-label-badge uppercase hover:bg-surface-variant transition-colors" type="button">+ Miris kemikalija</button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-badge text-label-badge uppercase hover:bg-surface-variant transition-colors" type="button">+ Uginule ribe</button>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px]">add_a_photo</span>
<label className="font-title-md text-title-md text-institutional-navy-deep font-bold">Dokazni materijali</label>
</div>
<span className="font-label-badge text-label-badge text-secondary font-bold uppercase bg-emerald-light px-2 py-0.5 rounded-lg">Maksimalno 5 slika</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Službena inspekcija automatski validira EXIF vremenske i prostorne podatke sa snimke.</p>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-space-xs cursor-pointer hover:bg-surface-container active:scale-[0.99] transition-all">
<div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">camera_enhance</span>
</div>
<span className="font-title-md text-title-md text-institutional-navy-deep font-bold">Snimi ili priloži s mobitela</span>
<span className="font-body-sm text-body-sm text-outline">Dodirnite za otvaranje kamere ili galerije (JPG, PNG, PDF do 15MB)</span>
</div>
<div className="grid grid-cols-2 gap-space-sm">
<div className="bg-surface-container-low rounded-xl p-2 flex flex-col gap-1.5 shadow-sm">
<div className="relative w-full h-24 rounded-lg overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Clear photographic evidence of murky green-blue foam along rocky limestone riverbanks of the Neretva River in Herzegovina, under bright Mediterranean daylight with clear water contrast." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBniHdiOSziZawHBSGhUhYAgp740hTaLOoqrl5AilXxb4fqjUlV5HihO95AgeYXUh0u3qTqyviz4fRU-yurBqKcBy1EjO6OE6EpzsqjDXpjJHMQhDZ8DzDhDvgzWlLIOdfR6VvOfp72-5n91xUr0OJONQ955sb4Cykyy3gASQMIQULND6boBcWkZWnA6x2lGGzgCRZFLb6k6OzlFK0BbrjITZiuxHeKp2jvhdotJUk" />
<button aria-label="Ukloni sliku" className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-institutional-navy-deep/80 text-on-primary flex items-center justify-center" type="button">
<span className="material-symbols-outlined text-[16px]">close</span>
</button>
<span className="absolute bottom-1 left-1 bg-surface-container-lowest/90 text-primary font-label-badge text-label-badge px-1.5 py-0.5 rounded uppercase font-bold">IMG_0821.JPG</span>
</div>
<div className="flex items-center gap-1 text-secondary">
<span className="material-symbols-outlined text-[14px]">gps_fixed</span>
<span className="font-label-badge text-label-badge text-secondary font-bold uppercase truncate">EXIF: 43.344°N, 17.807°E</span>
</div>
</div>
<div className="bg-surface-container-low rounded-xl p-2 flex flex-col gap-1.5 shadow-sm">
<div className="relative w-full h-24 rounded-lg overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Direct view of a drainage pipe spilling sediment into mountain river runoff near Mostar Herzegovina, capturing detailed environmental pollution evidence." src="https://lh3.googleusercontent.com/aida-public/AB6AXuByY4Gh2J4aAOy1e8q2aaJXS3JLaMeGkQp2Lc3NKsL_GEY98OsP4eHYUD_6g26RWqmQ_cR52EqczHGGx7NGl05ABwTabAsaTuqryPmJWJsPQuyiMVQFclG0vHm04CQFhRtEUwEbPqiGXyeQFHHiyUYIhHtzEs6yIy1kMp3ePD-N6IMCcOjPW7YrJRNH_bsse8VmeR6aF-JFwfXrbL4_trtAqTS0PTk8_hM3Pfvbs9A" />
<button aria-label="Ukloni sliku" className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-institutional-navy-deep/80 text-on-primary flex items-center justify-center" type="button">
<span className="material-symbols-outlined text-[16px]">close</span>
</button>
<span className="absolute bottom-1 left-1 bg-surface-container-lowest/90 text-primary font-label-badge text-label-badge px-1.5 py-0.5 rounded uppercase font-bold">IMG_0822.JPG</span>
</div>
<div className="flex items-center gap-1 text-secondary">
<span className="material-symbols-outlined text-[14px]">gps_fixed</span>
<span className="font-label-badge text-label-badge text-secondary font-bold uppercase truncate">EXIF: 14:22 CET Valid</span>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div className="flex items-start justify-between gap-space-sm">
<div className="flex flex-col min-w-0 flex-1">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">shield</span>
<span className="font-title-md text-title-md text-institutional-navy-deep font-bold">Želim ostati anoniman</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
            Vaši identifikacijski podaci bit će kriptirani i skriveni od javnog uvida i prijavljenog subjekta sukladno Zakonu o zaštiti okoliša HNŽ/K.
          </span>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
<input defaultChecked className="sr-only peer" id="anonimnostToggle" type="checkbox" />
<div className="w-13 h-7 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<div className="bg-surface-container-low rounded-lg p-2.5 mt-space-xs flex items-center gap-space-xs" id="anonimnostAlert">
<span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
<span className="font-label-kicker text-label-kicker uppercase text-secondary font-bold">Status: Anonimna prijava aktivna</span>
</div>
</div>
<div className="flex flex-col gap-space-sm pt-space-xs">
<button className="w-full py-3.5 px-space-lg bg-secondary text-on-secondary rounded-lg font-button text-button flex items-center justify-center gap-space-sm shadow-md active:scale-95 transition-all" id="submitNextBtn" type="button">
<span>Nastavi na pregled i slanje (Korak 3)</span>
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
<button className="w-full py-3 px-space-md bg-surface-container-low text-institutional-navy-deep hover:bg-surface-container rounded-lg font-button text-button flex items-center justify-center gap-space-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
<span>Natrag (Korak 1: Osnovni podaci)</span>
</button>
</div>
</form>
</div></div></div></>
  );
}
