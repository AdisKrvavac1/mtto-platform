/* eslint-disable */
// Generisano iz Figma dizajna (fig/*.py) – ne uređivati ručno


export function PropisiBody(props: any) {
  return (
<><div className="bg-[#062343] flex flex-col items-start overflow-clip py-[40px] relative min-w-0 max-w-full w-full">
        <div className="absolute bg-[#0a3663] blur-[64px] opacity-40 right-[-96px] rounded-[12px] size-[384px] top-[-96px]" />
        <div className="absolute bg-[#006c4a] blur-[64px] bottom-[0.25px] h-[320px] left-[33.33%] opacity-20 right-[41.67%] rounded-[12px]" />
        <div className="flex flex-col gap-[40px] items-start px-[24px] relative min-w-0 max-w-full w-full">
          <div className="flex flex-col lg:flex-row items-start lg:justify-between relative min-w-0 max-w-full w-full flex-wrap">
            <div className="flex flex-col gap-[16px] items-start max-w-[768px] relative w-full lg:w-auto lg:flex-[642_1_0%] min-w-0">
              <div className="bg-[#0a3663] flex gap-[4px] items-center px-[12px] py-[4px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-[#85f8c4]" style={{ fontSize: 15 }}>gavel</span>
                <p className="font-space font-bold min-w-0 max-w-full text-[#85f8c4] text-[12px] tracking-[0.96px] uppercase leading-[16px]">NORMATIVNI OKVIR I E-UPRAVA</p>
              </div>
              <p className="font-pub font-bold min-w-full text-[30px] md:text-[38px] lg:text-[48px] text-white tracking-[-0.9px] w-[min-content] leading-[1.4]">Službeni Propisi, Zakoni i Obrasci Zahtjeva</p>
              <div className="flex flex-col font-rob font-normal justify-center relative min-w-0 max-w-full text-[18px] text-white max-lg:block">
                <p className="leading-[29.25px] mb-0 max-lg:inline max-lg:after:content-['_']">Svi važeći kantonalni zakoni, podzakonski akti, pravilnici, odluke Vlade i službeni</p>
                <p className="leading-[29.25px] mb-0 max-lg:inline max-lg:after:content-['_']">obrasci za građane i gospodarske subjekte u formatu spremnom za preuzimanje</p>
                <p className="leading-[29.25px] max-lg:inline">i digitalnu predaju.</p>
              </div>
            </div>
            <div className="flex items-center relative w-full lg:w-auto lg:flex-[235_1_0%] min-w-0 flex-wrap">
              <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.8)] flex gap-[16px] items-center px-[16px] py-[12px] relative rounded-[8px] min-w-0 max-w-full flex-wrap">
                <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
                <div className="bg-[#006c4a] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#a6c8fe]" style={{ fontSize: 24 }}>verified</span>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <div className="flex flex-col items-start mb-[-0.5px] relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#a6c8fe] text-[11px] tracking-[0.44px] uppercase leading-[14px]">AŽURIRANOST ARHIVA</p>
                  </div>
                  <p className="font-pub font-bold min-w-0 max-w-full text-[18px] text-white leading-[26px]">{props.updated}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-[16px] items-start justify-center pt-[16px] relative min-w-0 max-w-full w-full flex-wrap">
            <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.5)] flex flex-col gap-[4px] items-start pb-[20px] pt-[16px] px-[16px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full lg:w-auto lg:flex-[336_1_0%] min-w-0">
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#a6c8fe] text-[13px] leading-[20px]">Važećih zakona</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 20 }}>account_balance</span>
              </div>
              <div className="flex flex-col items-start pb-[2px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold text-[24px] text-white tracking-[-0.24px] w-full leading-[32px]">{props.n.zakoni}</p>
              </div>
              <p className="font-pub font-bold min-w-0 max-w-full text-[#85f8c4] text-[11px] tracking-[0.44px] leading-[14px]">Hercegovačko-neretvanska županija</p>
            </div>
            <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.5)] flex flex-col gap-[4px] items-start pb-[20px] pt-[16px] px-[16px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full lg:w-auto lg:flex-[336_1_0%] min-w-0">
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#a6c8fe] text-[13px] leading-[20px]">Pravilnika i akata</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 22 }}>menu_book</span>
              </div>
              <div className="flex flex-col items-start pb-[2px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold text-[24px] text-white tracking-[-0.24px] w-full leading-[32px]">{props.n.pravilnici}</p>
              </div>
              <p className="font-pub font-bold min-w-0 max-w-full text-[#a6c8fe] text-[11px] tracking-[0.44px] leading-[14px]">Sektor turizma, okoliša i trgovine</p>
            </div>
            <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.5)] flex flex-col gap-[4px] items-start pb-[20px] pt-[16px] px-[16px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full lg:w-auto lg:flex-[336_1_0%] min-w-0">
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#a6c8fe] text-[13px] leading-[20px]">E-Obrazaca</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 20 }}>download_for_offline</span>
              </div>
              <div className="flex flex-col items-start pb-[2px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold text-[24px] text-white tracking-[-0.24px] w-full leading-[32px]">{props.n.obrasci}</p>
              </div>
              <p className="font-pub font-bold min-w-0 max-w-full text-[#85f8c4] text-[11px] tracking-[0.44px] leading-[14px]">Spremni za digitalnu predaju</p>
            </div>
            <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.5)] flex flex-col gap-[4px] items-start pb-[20px] pt-[16px] px-[16px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full lg:w-auto lg:flex-[336_1_0%] min-w-0">
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#a6c8fe] text-[13px] leading-[20px]">Kontakt</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 20 }}>history_edu</span>
              </div>
              <div className="flex flex-col items-start pb-[2px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold min-w-0 max-w-full text-[24px] text-white tracking-[-0.24px] w-full leading-[32px]">036 551 823</p>
              </div>
              <p className="font-pub font-bold min-w-0 max-w-full text-[#a6c8fe] text-[11px] tracking-[0.44px] leading-[14px]">Rad sa strankama svaki radni dan</p>
            </div>
          </div>
        </div>
      </div>
<div className="flex flex-col gap-[24px] items-start px-[24px] py-[64px] relative min-w-0 max-w-full w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative min-w-0 max-w-full w-full flex-wrap">
          <div className="flex flex-col gap-[7px] items-start pt-px relative w-full lg:w-auto lg:flex-[447_1_0%] min-w-0">
            <div className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
              <span className="material-symbols-outlined shrink-0 leading-none text-[#006c4a]" style={{ fontSize: 16 }}>bolt</span>
              <p className="font-space font-bold min-w-0 max-w-full text-[#006c4a] text-[12px] tracking-[0.96px] uppercase leading-[16px]">HITNI I FREKVENTNI POSTUPCI</p>
            </div>
            <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[24px] tracking-[-0.24px] leading-[32px]">Najčešće traženi obrasci za preuzimanje</p>
          </div>
          <div className="flex flex-col items-start max-w-[448px] pr-[1.27px] relative w-full lg:w-auto lg:flex-[448_1_0%] min-w-0">
            <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#334155] text-[13px] max-lg:block">
              <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Standardizirani formulari usklađeni s upravnim postupkom HNŽ. Možete ih</p>
              <p className="leading-[20px] max-lg:inline">popuniti na računalu ili ispisati za predaju na protokolu.</p>
            </div>
          </div>
        </div>
        <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))]  relative min-w-0 max-w-full w-full">{props.forms}<div className="lg:col-3 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start justify-between justify-self-stretch p-[24px] relative rounded-[8px] lg:row-2 self-stretch min-w-0 max-w-full" style={{ backgroundImage: "linear-gradient(148.29857090530794deg, rgb(10, 54, 99) 0%, rgb(6, 35, 67) 100%)" }}>
            <div className="flex flex-col gap-[4px] items-start pb-[16px] relative min-w-0 max-w-full w-full">
              <div className="bg-[rgba(255,255,255,0.1)] flex items-center justify-center relative rounded-[4px] shrink-0 size-[48px] flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 29 }}>mark_email_read</span>
              </div>
              <div className="flex flex-col items-start pt-[12px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-semibold min-w-0 max-w-full text-[18px] text-white w-full leading-[26px]">Trebate specifičan obrazac ili takseni račun?</p>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#a6c8fe] text-[13px] w-full max-lg:block">
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Ukoliko traženi upravni akt nije naveden u skraćenom</p>
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">pregledu, preuzmite cjelovitu tarifu županijskih upravnih</p>
                  <p className="leading-[20px] max-lg:inline">pristojbi ili kontaktirajte pisarnicu.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center relative min-w-0 max-w-full w-full flex-wrap">
              <a href="#pravna-tablica" className="bg-[#006c4a] flex gap-[4px] items-center px-[16px] py-[8px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[14px] text-white tracking-[0.14px] leading-[20px]">Kompletna pravna baza</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 13 }}>arrow_downward</span>
              </a>
            </div>
          </div></div>
      </div>
<div className="bg-[#eff4ff] flex flex-col items-start py-[64px] relative min-w-0 max-w-full w-full">
        <div className="flex flex-col gap-[16px] items-start px-[24px] relative min-w-0 max-w-full w-full">
          <div className="flex flex-col lg:flex-row items-end lg:justify-between relative min-w-0 max-w-full w-full flex-wrap">
            <div id="pravna-tablica" className="flex flex-col gap-[7px] items-start pt-px relative w-full lg:w-auto lg:flex-[626_1_0%] min-w-0">
              <div className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 16 }}>arrow_downward</span>
                <p className="font-space font-bold min-w-0 max-w-full text-[#002042] text-[12px] tracking-[0.96px] uppercase leading-[16px]">REGISTAR VAŽEĆIH AKATA HNŽ / HNK</p>
              </div>
              <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[22px] md:text-[29px] lg:text-[36px] tracking-[-0.54px] leading-[44px]">Službeni propisi po pravnim cjelinama</p>
            </div>
            <div className="flex items-center relative w-full lg:w-auto lg:flex-[320_1_0%] min-w-0 lg:justify-end">
              <div className="flex flex-col items-stretch relative min-w-0 w-full md:w-auto">
                {props.search}
              </div>
            </div>
          </div>
          {props.tabs}
          <div className="bg-white flex flex-col items-start overflow-clip relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] min-w-0 max-w-full w-full">
            <div className="flex flex-col items-start overflow-auto relative min-w-0 max-w-full w-full">
              <div className="hidden lg:flex bg-[#e5eeff] flex flex-col lg:flex-row lg:items-center lg:justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start px-[16px] py-[14px] relative w-full lg:w-auto lg:flex-[359_1_0%] min-w-0">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">Naziv pravnog akta</p>
                </div>
                <div className="flex flex-col items-start px-[16px] py-[14px] relative w-full lg:w-auto lg:flex-[194_1_0%] min-w-0">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">Službeno glasilo (SN HNŽ)</p>
                </div>
                <div className="flex flex-col items-start px-[16px] py-[14px] relative w-full lg:w-auto lg:flex-[186_1_0%] min-w-0">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">Datum stupanja na snagu</p>
                </div>
                <div className="flex flex-col items-start px-[16px] py-[14px] relative w-full lg:w-auto lg:flex-[323_1_0%] min-w-0">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">Sažetak primjene i nadležnost</p>
                </div>
                <div className="flex flex-col items-end px-[16px] py-[14px] relative shrink-0 w-[166.72px]">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] text-right leading-[20px]">Pročišćeni tekst</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">{props.rows}</div>
            </div>
            <div className="bg-[#eff4ff] flex flex-col lg:flex-row lg:items-center lg:justify-between p-[16px] relative min-w-0 max-w-full w-full flex-wrap">
              <div className="flex gap-[4px] items-center relative w-full lg:w-auto lg:flex-[349_1_0%] min-w-0 flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 18 }}>info</span>
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#334155] text-[13px]">
                    <p>
                      <span className="leading-[20px]">{`Prikazano je `}</span>
                      <span className="font-pub font-bold leading-[20px]">5</span>
                      <span className="leading-[20px]">{` službenih propisa u odabranoj kategoriji.`}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-[4px] items-center relative w-full lg:w-auto lg:flex-[338_1_0%] min-w-0 flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Trebate ovjereni izvod iz arhive?</p>
                </div>
                <a href="/o-nama#kontakt" className="flex gap-[2px] items-center relative min-w-0 max-w-full flex-wrap">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[13px] leading-[20px]">Kontaktirajte protokol</p>
                  </div>
                  <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 10 }}>gavel</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
<div id="kako-podnijeti" className="flex flex-col items-start px-[24px] py-[64px] relative min-w-0 max-w-full w-full">
        <div className="flex flex-col lg:flex-row gap-[24px] items-start relative min-w-0 max-w-full w-full flex-wrap">
          <div className="flex flex-col gap-[16px] items-start relative w-full lg:w-auto lg:flex-[684_1_0%] min-w-0">
            <div className="flex flex-[1_0_auto] flex-col gap-[4px] items-start min-h-px relative w-full">
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <p className="font-space font-bold min-w-0 max-w-full text-[#006c4a] text-[12px] tracking-[0.6px] uppercase w-full leading-[16px]">STANDARDIZACIJA PREDAJE</p>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[22px] md:text-[29px] lg:text-[36px] tracking-[-0.54px] w-full max-lg:block">
                  <p className="leading-[45px] mb-0 max-lg:inline max-lg:after:content-['_']">Kako ispravno podnijeti zahtjev</p>
                  <p className="leading-[45px] max-lg:inline">Ministarstvu?</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#334155] text-[18px] w-full max-lg:block">
                  <p className="leading-[28px] mb-0 max-lg:inline max-lg:after:content-['_']">Svaki građanin ili gospodarski subjekt može podnijeti zahtjev na dva ravnopravna</p>
                  <p className="leading-[28px] max-lg:inline">zakonska načina propisana Zakonom o upravnom postupku.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-[16px] items-start justify-center relative min-w-0 max-w-full w-full flex-wrap">
              <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start pb-[23px] pt-[16px] px-[16px] relative rounded-[8px] w-full lg:w-auto lg:flex-[334_1_0%] min-w-0">
                <div className="bg-[#dce9ff] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 22 }}>devices</span>
                </div>
                <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[18px] w-full leading-[26px]">1. Putem e-Pisarnice</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#334155] text-[13px] w-full max-lg:block">
                    <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Ispunite digitalni PDF/Word obrazac, potpišite</p>
                    <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">kvalificiranim certifikatom i pošaljite uz dokaz o</p>
                    <p className="leading-[20px] max-lg:inline">taksi na službeni e-protokol.</p>
                  </div>
                </div>
                <div className="flex gap-[3.99px] items-center pt-[7px] relative min-w-0 max-w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#006c4a]" style={{ fontSize: 14 }}>bolt</span>
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">Preporučeni brzi postupak</p>
                </div>
              </div>
              <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start pb-[23px] pt-[16px] px-[16px] relative rounded-[8px] w-full lg:w-auto lg:flex-[334_1_0%] min-w-0">
                <div className="bg-[#dce9ff] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>store</span>
                </div>
                <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[18px] w-full leading-[26px]">2. Fizički na protokolu</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] w-full leading-[20px]">Predajte originalni ispisani zahtjev sa svim prilozima direktno u centralnoj pisarnici u Mostaru svaki radni dan od 08:30 do 14:00 sati.</p>
                </div>
                <div className="flex gap-[3.99px] items-center pt-[7px] relative min-w-0 max-w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 11 }}>check</span>
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[11px] tracking-[0.44px] leading-[14px]">Trenutno izdavanje prijemnog štambilja</p>
                </div>
              </div>
            </div>
            <div className="bg-[#fffbeb] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[7.99px] items-start p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full flex-wrap">
              <span className="material-symbols-outlined shrink-0 leading-none text-[#926304]" style={{ fontSize: 24 }}>account_balance_wallet</span>
              <div className="flex flex-col gap-[2px] items-start relative min-w-0 max-w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#2f1500] text-[15px] leading-[24px]">Uplata županijske upravne pristojbe (takse) <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#2f1500] text-[13px]">
                    <p className="mb-0">
                      <span className="leading-[21.13px]">{`Za većinu upravnih zahtjeva obvezna je pristojba od `}</span>
                      <span className="font-pub font-bold leading-[21.13px]">15,00 KM</span>
                      <span className="leading-[21.13px]">{` (tarifni broj 1.). Broj depozitnog računa HNŽ:`}</span>
                    </p>
                    <p>
                      <span className="font-pub font-bold leading-[21.13px]">XXXX-XXXX-XXXX</span>
                      <span className="leading-[21.13px]">{` (banka (primjer)), Vrsta prihoda: `}</span>
                      <span className="font-pub font-bold leading-[21.13px]">722121</span>
                      <span className="leading-[21.13px]">{`, Općina: `}</span>
                      <span className="font-pub font-bold leading-[21.13px]">180 (Mostar)</span>
                      <span className="leading-[21.13px]">.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col h-[545px] items-start relative w-full lg:w-auto lg:flex-[684_1_0%] min-w-0">
            <div className="bg-[rgba(255,255,255,0)] flex flex-[1_0_auto] flex-col items-start justify-center min-h-px overflow-clip relative rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full">
              <div className="flex-[1_0_auto] min-h-px relative w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#062343] flex flex-col justify-end gap-[16px] p-[32px] text-white overflow-hidden"><span aria-hidden className="material-symbols-outlined absolute -right-[24px] -top-[24px] text-[220px] leading-none text-white/[0.04]">account_balance</span><span aria-hidden className="material-symbols-outlined text-[40px] text-[#4edea3]">inventory_2</span><p className="font-pub font-bold text-[24px] leading-[32px]">Protokol Ministarstva</p><p className="font-pub text-[15px] leading-[24px] text-[#c3c6d0]">Braće Fejića bb, 88000 Mostar<br/>Telefon centrale: +387 36 551 823<br/>E-pošta: info@mtto.gov.ba</p><a href="/o-nama#kontakt" className="self-start bg-[#006c4a] hover:bg-[#005339] px-[16px] py-[10px] rounded-[2px] font-pub font-semibold text-[14px]">Kontakti sektora</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
<div className="bg-[#e5eeff] flex flex-col items-start px-[24px] py-[64px] relative min-w-0 max-w-full w-full">
        <div className="bg-white flex flex-col items-start overflow-clip relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] min-w-0 max-w-full w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(12,minmax(0,1fr))] lg:grid-rows-[_416px] relative min-w-0 max-w-full w-full">
            <div className="lg:col-[1/span_7] flex flex-col items-start justify-between justify-self-stretch p-[40px] relative lg:row-1 self-start min-w-0 max-w-full">
              <div className="flex flex-col gap-[4px] items-start pb-[24px] relative min-w-0 max-w-full w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-space font-bold min-w-0 max-w-full text-[#002042] text-[12px] tracking-[0.96px] uppercase w-full leading-[16px]">IZRAVAN KONTAKT S REFERENTIMA</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[24px] tracking-[-0.24px] w-full leading-[32px]">Centralna Pisarnica i Služba za odnose sa strankama</p>
                </div>
                <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                  <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#334155] text-[15px] w-full max-lg:block">
                    <p className="leading-[24px] mb-0 max-lg:inline max-lg:after:content-['_']">Ukoliko imate dilemu oko potrebne dokumentacije za izdavanje dozvola ili želite provjeriti</p>
                    <p className="leading-[24px] max-lg:inline">status ranije predanog predmeta pod brojem protokola:</p>
                  </div>
                </div>
                <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-1 lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-rows-[__64px_64px] pt-[20px] relative min-w-0 max-w-full w-full">
                  <div className="lg:col-1 flex gap-[8px] h-[64px] items-start justify-self-stretch relative lg:row-1 min-w-0 max-w-full flex-wrap">
                    <div className="flex flex-col h-[40px] items-start pt-[4px] relative shrink-0 w-[36px]">
                      <div className="bg-[#e5eeff] flex items-center justify-center relative rounded-[2px] shrink-0 size-[36px] flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>location_on</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[15px] leading-[24px]">Adresa pisarnice</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] leading-[20px]">Braće Fejića bb, prizemlje</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">88000 Mostar, BiH</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-2 flex gap-[8px] h-[64px] items-start justify-self-stretch relative lg:row-1 min-w-0 max-w-full flex-wrap">
                    <div className="flex flex-col h-[40px] items-start pt-[4px] relative shrink-0 w-[36px]">
                      <div className="bg-[#e5eeff] flex items-center justify-center relative rounded-[2px] shrink-0 size-[36px] flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>schedule</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[15px] leading-[24px]">Radno vrijeme</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] leading-[20px]">Ponedjeljak – Petak</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[13px] leading-[20px]">radnim danom</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-1 flex gap-[8px] h-[64px] items-start justify-self-stretch relative lg:row-2 min-w-0 max-w-full flex-wrap">
                    <div className="flex flex-col h-[40px] items-start pt-[4px] relative shrink-0 w-[36px]">
                      <div className="bg-[#e5eeff] flex items-center justify-center relative rounded-[2px] shrink-0 size-[36px] flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 18 }}>phone_in_talk</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[15px] leading-[24px]">Telefonski protokol</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] leading-[20px]">+387 36 551 823</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Centrala Ministarstva</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-2 flex gap-[8px] h-[64px] items-start justify-self-stretch relative lg:row-2 min-w-0 max-w-full flex-wrap">
                    <div className="flex flex-col h-[40px] items-start pt-[4px] relative shrink-0 w-[36px]">
                      <div className="bg-[#e5eeff] flex items-center justify-center relative rounded-[2px] shrink-0 size-[36px] flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>mark_email_unread</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[15px] leading-[24px]">E-pisarnica i protokoli</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] leading-[20px]">info@mtto.gov.ba</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Kabinet: ministar@mtto.gov.ba</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#e5eeff] flex items-center justify-between p-[8px] relative rounded-[4px] min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#334155] text-[13px] leading-[20px]">Trebate službeni obrazac u drugom pristupačnom formatu?</p>
                </div>
                <a href="mailto:info@mtto.gov.ba" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Zatražite asistenciju</p>
                  </div>
                  <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 16 }}>mail</span>
                </a>
              </div>
            </div>
            <div className="bg-[#dce9ff] lg:col-[8/span_5] flex flex-col gap-[28px] items-start justify-self-stretch p-[24px] relative lg:row-1 self-start min-w-0 max-w-full">
              <div className="flex flex-col gap-[4px] items-start pt-[2px] relative min-w-0 max-w-full w-full">
                <div className="bg-[#002042] flex items-start px-[10px] py-[4px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[11px] text-white tracking-[0.44px] leading-[14px]">BRZA E-PROVJERA</p>
                </div>
                <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[18px] w-full leading-[26px]">Pretraga statusa Vašeg podneska <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></p>
                </div>
                <div className="h-[42px] leading-[0] relative min-w-0 max-w-full text-[13px] w-full">
                  <div className="-translate-y-1/2 absolute flex flex-col font-pub font-normal justify-center left-0 text-[#334155] top-[9.5px]">
                    <p className="leading-[20px]">{`Unesite djelovodni broj dodijeljen pri predaji na protokolu (npr. `}</p>
                  </div>
                  <div className="-translate-y-1/2 absolute flex flex-col font-pub justify-center left-[374.57px] not-italic text-[#002042] top-[10.5px]">
                    <p className="leading-[20px]">UP/I-07-</p>
                  </div>
                  <div className="-translate-y-1/2 absolute flex flex-col font-pub justify-center left-0 not-italic text-[#002042] top-[31.5px]">
                    <p className="leading-[20px]">24/26</p>
                  </div>
                  <div className="-translate-y-1/2 absolute flex flex-col font-pub font-normal justify-center left-[39.01px] text-[#334155] top-[30.5px]">
                    <p className="leading-[20px]">) kako biste provjerili zaduženog referenta i stupanj rješavanja.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-[8px] items-start pt-[12px] relative min-w-0 max-w-full w-full">
                  <div className="flex flex-col gap-[4px] items-start relative min-w-0 max-w-full w-full">
                    <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                      <p className="font-pub font-bold min-w-0 max-w-full text-[#43474f] text-[11px] tracking-[0.44px] uppercase w-full leading-[14px]">BROJ PREDMETA</p>
                    </div>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                      <div className="bg-white flex items-start justify-center overflow-clip pb-[11px] pt-[10px] px-[12px] relative rounded-[2px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] min-w-0 max-w-full w-full flex-wrap">
                        <div className="flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative">
                          <p className="font-pub font-normal min-w-0 max-w-full text-[#9ca3af] text-[13px] w-full leading-[1.17]">Npr. UP/I-07-128/26</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 16 }}>tag</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[4px] items-start relative min-w-0 max-w-full w-full">
                    <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                      <p className="font-pub font-bold min-w-0 max-w-full text-[#43474f] text-[11px] tracking-[0.44px] uppercase w-full leading-[14px]">JIB PODNOSITELJA / OIB TVRTKE</p>
                    </div>
                    <div className="bg-white flex items-start justify-center overflow-clip pb-[11px] pt-[10px] px-[12px] relative rounded-[2px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] min-w-0 max-w-full w-full flex-wrap">
                      <div className="flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#9ca3af] text-[13px] w-full leading-[1.17]">13-znamenkasti identifikator</p>
                      </div>
                    </div>
                  </div>
                  <button type="button" disabled title="Praćenje predmeta: Faza 2" className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                    <div className="bg-[#002042] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center justify-center py-[10px] relative rounded-[8px] min-w-0 max-w-full w-full flex-wrap">
                      <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 16 }}>search</span>
                      <div className="flex flex-col items-center relative min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Provjeri status u pisarnici</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[16px] relative min-w-0 max-w-full w-full">
                <div className="flex items-center justify-between pr-[0.01px] pt-[16px] relative min-w-0 max-w-full w-full flex-wrap">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Sustav e-Protokola HNŽ</p>
                  </div>
                  <div className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                    <div className="bg-[#006c4a] relative rounded-[12px] shrink-0 size-[8px]" />
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[13px] leading-[20px]">Sustav online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></>
  );
}
