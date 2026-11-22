/* eslint-disable */
// Generisano iz Figma dizajna (fig/*.py) – ne uređivati ručno


export function EUslugeBody(props: any) {
  return (
<><div className="bg-[#062343] flex flex-col items-start overflow-clip py-[48px] relative min-w-0 max-w-full w-full">
        <div className="absolute bg-[rgba(10,54,99,0.4)] blur-[64px] right-[-80px] rounded-[12px] size-[384px] top-[-96px]" />
        <div className="absolute bg-[rgba(0,108,74,0.2)] blur-[40px] bottom-[-79.5px] h-[320px] left-[36.94%] right-[38.06%] rounded-[12px]" />
        <div className="flex flex-col gap-[24px] items-start px-4 md:px-[32px] relative min-w-0 max-w-full w-full">
          <div className="flex flex-col lg:flex-row items-end lg:justify-between pb-[8px] relative min-w-0 max-w-full w-full flex-wrap">
            <div className="flex flex-col gap-[16px] items-start max-w-[768px] relative w-full lg:w-auto lg:flex-[740_1_0%] min-w-0">
              <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] flex gap-[8px] items-center px-[12px] py-[4px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-[#85f8c4]" style={{ fontSize: 17 }}>folder_managed</span>
                <p className="font-space font-bold min-w-0 max-w-full text-[#85f8c4] text-[12px] tracking-[0.6px] uppercase leading-[16px]">REGULATORNI HUB • HERCEGOVAČKO-NERETVANSKA ŽUPANIJA / KANTON</p>
              </div>
              <div className="flex flex-col items-start pt-[3px] relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-rob font-extrabold justify-center relative min-w-0 max-w-full text-[30px] md:text-[38px] lg:text-[48px] text-white tracking-[-1.2px] max-lg:block">
                  <p className="leading-[56px] mb-0 max-lg:inline max-lg:after:content-['_']">Digitalni Centar E-Usluga i Javnih</p>
                  <p className="leading-[56px] max-lg:inline">Registara</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-rob font-normal justify-center relative min-w-0 max-w-full text-[#dce9ff] text-[18px] max-lg:block">
                  <p className="leading-[29.25px] mb-0 max-lg:inline max-lg:after:content-['_']">Jedinstvena službena točka pristupa bazama podataka, elektronskim obrascima, licencama i</p>
                  <p className="leading-[29.25px] max-lg:inline">javnim uvidima Ministarstva trgovine, turizma i zaštite okoliša HNŽ / HNK.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-[8px] items-center relative w-full lg:w-auto lg:flex-[391_1_0%] min-w-0 flex-wrap">
              <button type="button" className="bg-[#006c4a] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center px-[16px] py-[10px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 20 }}>verified</span>
                <div className="flex flex-col items-center relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Provjeri vjerodostojnost akta</p>
                </div>
              </button>
              <button type="button" className="bg-[rgba(255,255,255,0.15)] flex gap-[8px] items-center px-[16px] py-[10px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 18 }}>help_outline</span>
                <div className="flex flex-col items-center relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Upute i FAQ</p>
                </div>
              </button>
            </div>
          </div>
          {props.search}
          <div className="flex flex-col lg:flex-row gap-[16px] items-start justify-center relative min-w-0 max-w-full w-full flex-wrap">
            <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] flex gap-[12px] items-center p-[16px] relative rounded-[4px] w-full lg:w-auto lg:flex-[332_1_0%] min-w-0 flex-wrap">
              <div className="bg-[rgba(0,108,74,0.2)] flex items-center justify-center relative rounded-[2px] shrink-0 size-[40px] flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 19 }}>verified</span>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[24px] text-white tracking-[-0.24px] leading-[32px]">{props.n.permits}</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] leading-[20px]">Aktivne okolišne dozvole</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] flex gap-[12px] items-center p-[16px] relative rounded-[4px] w-full lg:w-auto lg:flex-[332_1_0%] min-w-0 flex-wrap">
              <div className="bg-[rgba(166,200,254,0.2)] flex items-center justify-center relative rounded-[2px] shrink-0 size-[40px] flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 24 }}>description</span>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[24px] text-white tracking-[-0.24px] leading-[32px]">{props.n.docs}</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] leading-[20px]">Dokumenata i obrazaca</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] flex gap-[12px] items-center p-[16px] relative rounded-[4px] w-full lg:w-auto lg:flex-[332_1_0%] min-w-0 flex-wrap">
              <div className="bg-[rgba(255,183,125,0.2)] flex items-center justify-center relative rounded-[2px] shrink-0 size-[40px] flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 24 }}>campaign</span>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[24px] text-white tracking-[-0.24px] leading-[32px]">{props.n.uvidi}</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] leading-[20px]">Objava iz oblasti okoliša</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] flex gap-[12px] items-center p-[16px] relative rounded-[4px] w-full lg:w-auto lg:flex-[332_1_0%] min-w-0 flex-wrap">
              <div className="bg-[rgba(130,245,193,0.2)] flex items-center justify-center relative rounded-[2px] shrink-0 size-[40px] flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 24 }}>badge</span>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[24px] text-white tracking-[-0.24px] leading-[32px]">Faza 2</p>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] leading-[20px]">Online prijave za vodiče</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
<div className="flex flex-col gap-[24px] items-start px-4 md:px-[32px] py-[64px] relative min-w-0 max-w-full w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative min-w-0 max-w-full w-full flex-wrap">
          <div className="flex flex-col font-bold gap-[3px] items-start leading-[0] pt-[5px] relative w-full lg:w-auto lg:flex-[601_1_0%] min-w-0">
            <div className="flex flex-col font-space justify-center relative min-w-0 max-w-full text-[#006c4a] text-[12px] tracking-[0.6px] uppercase">
              <p className="leading-[16px]">SLUŽBENE JAVNE EVIDENCIJE</p>
            </div>
            <div className="flex flex-col font-pub justify-center relative min-w-0 max-w-full text-[#002042] text-[22px] md:text-[29px] lg:text-[36px] tracking-[-0.54px]">
              <p className="leading-[44px]">Temeljni Registri Županije / Kantona</p>
            </div>
          </div>
          <div className="flex gap-[6px] items-center relative w-full lg:w-auto lg:flex-[415_1_0%] min-w-0 flex-wrap">
            <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 14 }}>update</span>
            <p className="font-pub font-normal min-w-0 max-w-full text-[#43474f] text-[13px] leading-[20px]">Podaci se objavljuju izravno iz CMS-a Ministarstva-a Ministarstva</p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-[24px] items-start justify-center relative min-w-0 max-w-full w-full flex-wrap">
          <div className="bg-white flex flex-col items-start justify-between overflow-clip p-[20px] relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full lg:w-auto lg:flex-[326_1_0%] min-w-0">
            <div className="flex flex-col gap-[8px] items-start pb-[16px] relative min-w-0 max-w-full w-full">
              <div className="flex items-center justify-between pt-[4px] relative min-w-0 max-w-full w-full flex-wrap">
                <div className="bg-[#ecfdf5] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-on-tertiary-container" style={{ fontSize: 19 }}>eco</span>
                </div>
                <div className="bg-[#e5eeff] flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{props.n.permits} AKATA</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[20px] w-full max-lg:block">
                  <p className="leading-[28px] mb-0 max-lg:inline max-lg:after:content-['_']">Registar Okolišnih</p>
                  <p className="leading-[28px] max-lg:inline">Dozvola</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">Službena baza važećih, obnovljenih i</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">oduzetih okolišnih dozvola za</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">industrijske pogone, energetske objekte</p>
                  <p className="leading-[19.5px] max-lg:inline">i kamenolome.</p>
                </div>
              </div>
              <div className="bg-[#eff4ff] flex flex-col gap-[8px] items-start pb-[12px] pt-[20px] px-[12px] relative rounded-[2px] min-w-0 max-w-full w-full">
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-space font-medium min-w-0 max-w-full text-[#737780] text-[11px] tracking-[0.55px] uppercase w-full leading-[16.5px]">BRZI FILTER OPĆINA</p>
                </div>
                {props.towns}
              </div>
            </div>
            <div className="flex items-center justify-between pt-[12px] relative min-w-0 max-w-full w-full flex-wrap">
              <a href="/registri/okolisne-dozvole" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[14px] tracking-[0.14px] leading-[20px]">Pretraži bazu</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 13 }}>arrow_forward</span>
              </a>
              <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 16 }}>storage</span>
            </div>
            <div className="absolute bg-[#006c4a] h-[6px] left-0 right-0 top-0" />
          </div>
          <div className="bg-white flex flex-col gap-[30.5px] items-start overflow-clip p-[20px] relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full lg:w-auto lg:flex-[326_1_0%] min-w-0">
            <div className="flex flex-col gap-[8px] items-start pb-[16px] relative min-w-0 max-w-full w-full">
              <div className="flex items-center justify-between pt-[4px] relative min-w-0 max-w-full w-full flex-wrap">
                <div className="bg-[#dce9ff] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 22 }}>recycling</span>
                </div>
                <div className="bg-[#e5eeff] flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px]">FAZA 2</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[20px] w-full leading-[28px]">Upravljanje Otpadom</p>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">Registar pravnih osoba ovlaštenih za</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">sakupljanje, skladištenje, zbrinjavanje i</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">prekogranični promet neopasnog i</p>
                  <p className="leading-[19.5px] max-lg:inline">opasnog otpada.</p>
                </div>
              </div>
              <p className="font-rob text-[13px] leading-[20px] text-[#444651] w-full">Registar ovlaštenih operatera otpadom digitalizira se u Fazi 2.</p>
            </div>
            <div className="flex items-center justify-between pt-[12px] relative min-w-0 max-w-full w-full flex-wrap">
              <a href="/registri/okolisne-dozvole" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Uvid u rješenja</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 13 }}>arrow_forward</span>
              </a>
              <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 20 }}>fact_check</span>
            </div>
            <div className="absolute bg-[#062343] h-[6px] left-0 right-0 top-0" />
          </div>
          <div className="bg-white flex flex-col gap-[30.5px] items-start overflow-clip p-[20px] relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full lg:w-auto lg:flex-[326_1_0%] min-w-0">
            <div className="flex flex-col gap-[8px] items-start pb-[16px] relative min-w-0 max-w-full w-full">
              <div className="flex items-center justify-between pt-[4px] relative min-w-0 max-w-full w-full flex-wrap">
                <div className="bg-[#fffbeb] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 24 }}>hotel</span>
                </div>
                <div className="bg-[#e5eeff] flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{props.n.facilities} OBJEKATA</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[20px] w-full leading-[28px]">Kategorizacija Objekata</p>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">Službena evidencija zvjezdica za hotele,</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">motele, pansione, kampove i privatne</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">iznajmljivače uz digitalni izračun</p>
                  <p className="leading-[19.5px] max-lg:inline">boravišnih pristojbi.</p>
                </div>
              </div>
              {props.facilityTypes}
            </div>
            <div className="flex items-center justify-between pt-[12px] relative min-w-0 max-w-full w-full flex-wrap">
              <a href="/registri/ugostiteljski-objekti" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#552b00] text-[14px] tracking-[0.14px] leading-[20px]">{`Kalkulator & Evidencija`}</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 14 }}>calculate</span>
              </a>
              <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 18 }}>travel_explore</span>
            </div>
            <div className="absolute bg-[#552b00] h-[6px] left-0 right-0 top-0" />
          </div>
          <div className="bg-white flex flex-col gap-[2.5px] items-start overflow-clip p-[20px] relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full lg:w-auto lg:flex-[326_1_0%] min-w-0">
            <div className="flex flex-col gap-[8px] items-start pb-[16px] relative min-w-0 max-w-full w-full">
              <div className="flex items-center justify-between pt-[4px] relative min-w-0 max-w-full w-full flex-wrap">
                <div className="bg-[#e5eeff] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#00714e]" style={{ fontSize: 24 }}>record_voice_over</span>
                </div>
                <div className="bg-[#82f5c1] flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#00714e] text-[11px] tracking-[0.44px] uppercase leading-[14px]">FAZA 2</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[20px] w-full max-lg:block">
                  <p className="leading-[28px] mb-0 max-lg:inline max-lg:after:content-['_']">Registar Turističkih</p>
                  <p className="leading-[28px] max-lg:inline">Vodiča</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">Baza certificiranih vodiča s verifikacijom</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">jezičnih kompetencija, registrom</p>
                  <p className="leading-[19.5px] mb-0 max-lg:inline max-lg:after:content-['_']">legitimacija te online prijavama za</p>
                  <p className="leading-[19.5px] max-lg:inline">stručni ispit.</p>
                </div>
              </div>
              <p className="font-rob text-[13px] leading-[20px] text-[#444651] w-full">Termini ispitnih rokova objavljuju se u vijestima Ministarstva.</p>
            </div>
            <div className="flex items-center justify-between pt-[12px] relative min-w-0 max-w-full w-full flex-wrap">
              <a href="/turisticki-vodici" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Online Prijava za Ispit</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 13 }}>arrow_forward</span>
              </a>
              <span className="material-symbols-outlined shrink-0 leading-none " style={{ fontSize: 18 }}>arrow_forward</span>
            </div>
            <div className="absolute bg-[#002042] h-[6px] left-0 right-0 top-0" />
          </div>
        </div>
      </div>
<div id="e-potpis" className="flex flex-col items-start px-4 md:px-[32px] py-[64px] relative min-w-0 max-w-full w-full">
        <div className="flex flex-col lg:flex-row gap-[24px] items-start relative min-w-0 max-w-full w-full flex-wrap">
          <div className="flex flex-col gap-[24px] items-start pb-[128.5px] relative w-full lg:w-auto lg:flex-[960_1_0%] min-w-0">
            <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
              <div className="flex flex-col gap-[4px] items-start relative min-w-0 max-w-full">
                <div className="flex gap-[8px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                  <div className="bg-[#006c4a] relative rounded-[12px] shrink-0 size-[12px]" />
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-space font-bold min-w-0 max-w-full text-[#006c4a] text-[12px] tracking-[0.6px] uppercase leading-[16px]">DEMOKRATSKO SUDJELOVANJE JAVNOSTI</p>
                  </div>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[24px] tracking-[-0.24px] leading-[32px]">Aktivni Javni Uvidi i Javne Rasprave</p>
                </div>
              </div>
              <a href="/vijesti?category=Za%C5%A1tita%20okoli%C5%A1a" className="flex gap-[3.99px] items-center relative min-w-0 max-w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Svi arhivirani uvidi</p>
                </div>
                <span className="material-symbols-outlined shrink-0 leading-none text-[#43474f]" style={{ fontSize: 13 }}>arrow_forward</span>
              </a>
            </div>
            <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
              <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[15px] w-full max-lg:block">
                <p className="leading-[24px] mb-0 max-lg:inline max-lg:after:content-['_']">U skladu sa Zakonom o zaštiti okoliša HNŽ/K, Ministarstvo osigurava pravo građanima, nevladinim organizacijama i</p>
                <p className="leading-[24px] max-lg:inline">stručnoj javnosti na uvid u studije utjecaja i podnošenje službenih primjedbi.</p>
              </div>
            </div>
            <div className="flex flex-col gap-[16px] items-start relative min-w-0 max-w-full w-full">{props.uvidi}</div>
            <div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] items-start p-[20px] relative rounded-[8px] min-w-0 max-w-full w-full">
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[18px] leading-[26px]">Status obrade okolišnih predmeta u tekućem kvartalu <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></p>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-normal min-w-0 max-w-full text-[#43474f] text-[13px] leading-[20px]">Mjesečni prikaz riješenih vs. novoprimljenih zahtjeva u HNŽ/HNK</p>
                  </div>
                </div>
                <div className="bg-[#ecfdf5] flex flex-col items-start px-[10px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[11px] tracking-[0.44px] uppercase leading-[14px]">EFIKASNOST 91.4%</p>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-[16px] items-start justify-center relative min-w-0 max-w-full w-full flex-wrap">
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start p-[12px] relative rounded-[2px] w-full lg:w-auto lg:flex-[296_1_0%] min-w-0">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-space font-medium min-w-0 max-w-full text-[#737780] text-[12px] uppercase w-full leading-[18px]">ZAHTJEVI U OBRADI</p>
                  </div>
                  <div className="flex flex-col items-start pb-[4px] relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[20px] w-full leading-[28px]">24</p>
                  </div>
                  <div className="bg-[#dce9ff] h-[6px] relative rounded-[12px] shrink-0 w-full">
                    <div className="absolute bg-[#552b00] h-[6px] left-0 right-[76%] rounded-[12px] top-0" />
                  </div>
                </div>
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start p-[12px] relative rounded-[2px] w-full lg:w-auto lg:flex-[296_1_0%] min-w-0">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-space font-medium min-w-0 max-w-full text-[#737780] text-[12px] uppercase w-full leading-[18px]">IZDANO NOVIH DOZVOLA</p>
                  </div>
                  <div className="flex flex-col items-start pb-[4px] relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[20px] w-full leading-[28px]">39</p>
                  </div>
                  <div className="bg-[#dce9ff] h-[6px] relative rounded-[12px] shrink-0 w-full">
                    <div className="absolute bg-[#006c4a] h-[6px] left-0 right-[22%] rounded-[12px] top-0" />
                  </div>
                </div>
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start p-[12px] relative rounded-[2px] w-full lg:w-auto lg:flex-[296_1_0%] min-w-0">
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-space font-medium min-w-0 max-w-full text-[#737780] text-[12px] uppercase w-full leading-[18px]">ODBIJENO / VRAĆENO NA DORADU</p>
                  </div>
                  <div className="flex flex-col items-start pb-[4px] relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#ba1a1a] text-[20px] w-full leading-[28px]">4</p>
                  </div>
                  <div className="bg-[#dce9ff] h-[6px] relative rounded-[12px] shrink-0 w-full">
                    <div className="absolute bg-[#ba1a1a] h-[6px] left-0 right-[88%] rounded-[12px] top-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[24px] items-start relative w-full lg:w-auto lg:flex-[392_1_0%] min-w-0">
            <div className="bg-white flex flex-col gap-[16px] items-start p-[20px] relative rounded-[8px] min-w-0 max-w-full w-full">
              <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.5px_0] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
              <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                <div className="flex gap-[8px] items-center relative min-w-0 max-w-full flex-wrap">
                  <div className="bg-[#002042] flex items-center justify-center relative rounded-[2px] shrink-0 size-[32px] flex-wrap">
                    <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 18 }}>expand_more</span>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[18px] leading-[26px]">Službeni Obrasci</p>
                  </div>
                </div>
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{props.formsYear}</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Preuzmite standardizirane formulare za podnošenje</p>
                  <p className="leading-[20px] max-lg:inline">službenih zahtjeva prema nadležnim odjelima.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-[10px] items-start relative min-w-0 max-w-full w-full">{props.forms}</div>
              <a href="/propisi" className="bg-[#eff4ff] flex flex-col items-center py-[10px] relative rounded-[2px] min-w-0 max-w-full w-full">
                <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[14px] text-center tracking-[0.14px] leading-[20px]">Pregledaj sve propise i obrasce</p>
              </a>
            </div>
            <div className="flex flex-col gap-[8px] items-start p-[20px] relative rounded-[8px] min-w-0 max-w-full w-full" style={{ backgroundImage: "linear-gradient(142.8195582208184deg, rgb(6, 35, 67) 0%, rgb(10, 54, 99) 100%)" }}>
              <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.33px_0] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
              <div className="flex gap-[8px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 26 }}>verified</span>
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[18px] text-white leading-[26px]">Verifikacija E-Potpisa <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></p>
                </div>
              </div>
              <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#dce9ff] text-[13px] w-full max-lg:block">
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Provjerite digitalni potpis, vremenski žig i autentičnost</p>
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">rješenja izdanog od strane Ministarstva u formatu eIDAS</p>
                  <p className="leading-[20px] max-lg:inline">/ BiH kvalificiranog certifikata.</p>
                </div>
              </div>
              <div className="backdrop-blur-[8px] bg-[rgba(255,255,255,0.1)] flex flex-col items-start pb-[16px] pt-[20px] px-[12px] relative rounded-[2px] min-w-0 max-w-full w-full">
                <div className="flex flex-col gap-[4px] items-center pb-[1.5px] relative min-w-0 max-w-full w-full">
                  <div className="flex flex-col items-center pb-[2.5px] relative min-w-0 max-w-full w-full">
                    <span className="material-symbols-outlined shrink-0 leading-none text-[#dce9ff]" style={{ fontSize: 28 }}>upload_file</span>
                  </div>
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] text-center leading-[20px]">Povucite potpisan PDF dokument ovdje ili kliknite za</p>
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#dce9ff] text-[13px] text-center leading-[20px]">odabir</p>
                </div>
              </div>
              <button type="button" disabled title="Verifikacija e-potpisa: Faza 2" className="bg-[#006c4a] flex items-center justify-center py-[8px] relative rounded-[2px] min-w-0 max-w-full w-full flex-wrap">
                <p className="font-pub font-semibold min-w-0 max-w-full text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Potvrdi valjanost dokumenta</p>
              </button>
            </div>
            <div className="bg-white flex flex-col gap-[12px] items-start p-[20px] relative rounded-[8px] min-w-0 max-w-full w-full">
              <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
              <div className="flex gap-[8px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 22 }}>desk</span>
                <div className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#002042] text-[18px] leading-[26px]">{`Šalter Sala & Prijem Podnesaka`}</p>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] items-start relative min-w-0 max-w-full w-full">
                <div className="flex gap-[10px] items-start relative min-w-0 max-w-full w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>account_balance</span>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[13px] max-lg:block">
                      <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Sjedište Ministarstva:</p>
                      <p className="font-pub font-normal leading-[20px] text-[#43474f]">Braće Fejića bb, 88000 Mostar</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-[10px] items-start relative min-w-0 max-w-full w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 20 }}>schedule</span>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[13px] max-lg:block">
                      <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Rad sa strankama:</p>
                      <p className="font-pub font-normal leading-[20px] mb-0 text-[#43474f]">radnim danom, prema dogovoru</p>
                      
                    </div>
                  </div>
                </div>
                <div className="flex gap-[10px] items-start relative min-w-0 max-w-full w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 19 }}>phone_in_talk</span>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <div className="flex flex-col font-pub font-bold justify-center relative min-w-0 max-w-full text-[#002042] text-[13px] max-lg:block">
                      <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Izravni e-kontakti pisarnice:</p>
                      <p className="font-pub font-normal leading-[20px] mb-0 text-[#43474f]">Tel: +387 36 551 823</p>
                      <p className="font-pub font-normal leading-[20px]">info@mtto.gov.ba</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-[16px] relative min-w-0 max-w-full w-full flex-wrap">
                
                <a href="https://maps.google.com/?q=Bra%C4%87e+Fej%C4%87a+bb+Mostar" className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Upute za dolazak</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div></>
  );
}
