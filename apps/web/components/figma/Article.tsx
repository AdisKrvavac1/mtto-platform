/* eslint-disable */
// Generisano iz Figma dizajna (fig/*.py) – ne uređivati ručno


export function ArticleBody(props: any) {
  return (
<>
<div className="hidden lg:block">
<div className="bg-[#f8f9ff] flex flex-col items-start relative min-w-0 max-w-full w-full">
        <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
          <div className="bg-[#eff4ff] flex flex-col items-center py-[8px] relative min-w-0 max-w-full w-full">
            <div className="content-center flex flex-col lg:flex-row flex-wrap gap-y-[8px] lg:items-center lg:justify-between max-w-[1280px] px-[24px] relative min-w-0 max-w-full w-full">
              <div className="content-center flex flex-wrap gap-[4px] items-center relative w-full lg:w-auto lg:flex-[498_1_0%] min-w-0">
                <a href="/" className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#43474f]" style={{ fontSize: 14 }}>home</span>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full">
                    <p className="font-pub font-normal min-w-0 max-w-full text-[#43474f] text-[13px] leading-[20px]">Naslovna</p>
                  </div>
                </a>
                <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 8 }}>chevron_right</span>
                <a href="/vijesti" className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#43474f] text-[13px] leading-[20px]">Vijesti i obavijesti</p>
                </a>
                <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 8 }}>chevron_right</span>
                <a href="/vijesti?type=JAVNI_POZIV" className="flex flex-col items-start relative min-w-0 max-w-full">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#43474f] text-[13px] leading-[20px]">{props.crumbType}</p>
                </a>
                <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 8 }}>chevron_right</span>
                <div className="flex flex-col items-start max-w-[448px] overflow-clip relative min-w-0 max-w-full">
                  <p className="font-pub font-semibold min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">{props.crumbTitle}</p>
                </div>
              </div>
              <div className="flex gap-[8px] items-center relative w-full lg:w-auto lg:flex-[431_1_0%] min-w-0 flex-wrap">
                <div className="bg-[#ecfdf5] flex gap-[4px] items-center px-[10px] py-[2px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                  <div className="bg-[#006c4a] relative rounded-[12px] shrink-0 size-[8px]" />
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">{props.statusText}</p>
                </div>
                <div className="flex items-start relative min-w-0 max-w-full flex-wrap">
                  <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">|</p>
                </div>
                <div className="flex gap-[4px] items-center relative min-w-0 max-w-full flex-wrap">
                  <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 16 }}>verified</span>
                  <p className="font-pub font-bold min-w-0 max-w-full text-[#43474f] text-[11px] tracking-[0.44px] leading-[14px]">SLUŽBENA OBJAVA MTTO</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start px-[24px] py-[40px] relative min-w-0 max-w-full w-full">
            <div className="gap-x-[40px] gap-y-[40px] grid grid-cols-1 lg:grid-cols-[repeat(12,minmax(0,1fr))] lg:grid-rows-[_3061.62px] relative min-w-0 max-w-full w-full">
              <div className="lg:col-[1/span_8] flex flex-col gap-[24px] items-start justify-self-stretch relative lg:row-1 self-start min-w-0 max-w-full">
                <div className="flex flex-col gap-[16px] items-start relative min-w-0 max-w-full w-full">
                  <div className="content-center flex flex-wrap gap-[8px] items-center relative min-w-0 max-w-full w-full">
                    <div className="bg-[#006c4a] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                      <p className="font-pub font-bold min-w-0 max-w-full text-[11px] text-white tracking-[0.55px] uppercase leading-[14px]">{props.tag1}</p>
                    </div>
                    <div className="bg-[#0a3663] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                      <p className="font-pub font-bold min-w-0 max-w-full text-[#d3e4fe] text-[11px] tracking-[0.55px] uppercase leading-[14px]">SLUŽBENA OBJAVA</p>
                    </div>
                    <div className="bg-[#dce9ff] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                      <p className="font-pub font-bold min-w-0 max-w-full text-[#062343] text-[11px] tracking-[0.44px] leading-[14px]">{props.tag3}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <h1 className="font-pub font-bold text-[#062343] text-[26px] md:text-[30px] lg:text-[36px] tracking-[-0.9px] leading-[1.22] w-full">{props.title}</h1>
                  </div>
                  <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full">
                    <div className="gap-x-[16px] gap-y-[8px] grid grid-cols-1 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-rows-[__20px_20px] relative min-w-0 max-w-full w-full">
                      <div className="lg:col-1 flex gap-[8px] h-[20px] items-center justify-self-stretch relative lg:row-1 min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 18 }}>calendar_today</span>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px]">
                            <p>
                              <span className="leading-[20px]">{`Objavljeno: `}</span>
                              <span className="font-pub font-semibold leading-[20px] text-[#0b1c30]">{props.published}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-2 flex gap-[8px] h-[20px] items-center justify-self-stretch relative lg:row-1 min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 18 }}>schedule</span>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px]">
                            <p>
                              <span className="leading-[20px]">{`Vrijeme čitanja: `}</span>
                              <span className="font-pub font-semibold leading-[20px] text-[#0b1c30]">{props.readMin} min</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-3 flex gap-[8px] h-[20px] items-center justify-self-stretch relative lg:row-1 min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 16 }}>update</span>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px]">
                            <p>
                              <span className="leading-[20px]">{`Ažurirano: `}</span>
                              <span className="font-pub font-semibold leading-[20px] text-[#0b1c30]">{props.updated}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-1 flex gap-[8px] h-[20px] items-center justify-self-stretch relative lg:row-2 min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 19 }}>folder_managed</span>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px]">
                            <p>
                              <span className="leading-[20px]">{`Broj: `}</span>
                              <span className="font-pub font-semibold leading-[20px] text-[#0b1c30]">{props.number}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-[2/span_2] flex gap-[8px] h-[20px] items-center justify-self-stretch relative lg:row-2 min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 16 }}>account_box</span>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px]">
                            <p>
                              <span className="leading-[20px]">{`Autor: `}</span>
                              <span className="font-pub font-semibold leading-[20px] text-[#0b1c30]">{props.author}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {props.share}
                </div>
                {props.figure}
                <div className="flex flex-col gap-[24px] items-start relative min-w-0 max-w-full w-full">
                  {props.lead && (<div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start p-[24px] relative rounded-[8px] min-w-0 max-w-full w-full">
                    <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                      <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[18px] w-full leading-[29.25px]">{props.lead}</p>
                    </div>
                  </div>)}
                  {props.body}
                  
                  {props.deadline}
                  
                  {props.docs}
                  <div className="bg-[#e5eeff] flex flex-col lg:flex-row lg:items-center lg:justify-between p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full flex-wrap">
                    <div className="flex gap-[16px] items-center relative w-full lg:w-auto lg:flex-[383_1_0%] min-w-0 flex-wrap">
                      <div className="bg-[#002042] flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px] flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#062343]" style={{ fontSize: 24 }}>support_agent</span>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full">
                        <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                          <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[18px] leading-[26px]">Trebate dodatna pojašnjenja?</p>
                        </div>
                        <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                          <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] max-lg:block">
                            <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Ministarstvo stoji na raspolaganju radnim danom.</p>
                            <p className="leading-[20px] max-lg:inline"></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-[8px] items-center relative w-full lg:w-auto lg:flex-[346_1_0%] min-w-0 flex-wrap">
                      <a href="tel:+38736551823" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[6px] items-center px-[12px] py-[8px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#062343]" style={{ fontSize: 14 }}>call</span>
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[13px] leading-[20px]">+387 36 551 823</p>
                      </a>
                      <a href="mailto:info@mtto.gov.ba" className="bg-[#002042] flex gap-[6px] items-center px-[12px] py-[8px] relative rounded-[2px] min-w-0 max-w-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-white" style={{ fontSize: 16 }}>mail</span>
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[13px] text-white leading-[20px]">info@mtto.gov.ba</p>
                      </a>
                    </div>
                  </div>
                  
                </div>
                <div className="flex flex-col items-start pt-[16px] relative min-w-0 max-w-full w-full">
                  <div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-between p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full flex-wrap">
                    <div className="flex gap-[8px] items-center relative min-w-0 max-w-full flex-wrap">
                      <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 21 }}>thumb_up</span>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#0b1c30] text-[13px] leading-[20px]">Je li ovaj članak bio koristan za vašu instituciju?</p>
                      </div>
                    </div>
                    <div className="flex gap-[8px] items-center relative min-w-0 max-w-full flex-wrap">
                      <button type="button" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#006c4a] text-[14px] text-center tracking-[0.14px] leading-[20px]">Da, potpuno</p>
                      </button>
                      <button type="button" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[2px] min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#43474f] text-[14px] text-center tracking-[0.14px] leading-[20px]">Djelomično</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-[9/span_4] flex flex-col gap-[24px] items-start justify-self-stretch relative lg:row-1 self-start min-w-0 max-w-full">
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] items-start p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full">
                  <div className="flex items-center justify-between relative min-w-0 max-w-full w-full flex-wrap">
                    <div className="flex gap-[8px] items-center relative min-w-0 max-w-full flex-wrap">
                      <div className="bg-[#006c4a] relative rounded-[12px] shrink-0 size-[8px]" />
                      <div className="flex flex-col items-start relative min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[18px] leading-[26px]">{props.relatedTitle}</p>
                      </div>
                    </div>
                    <a href="/vijesti?type=JAVNI_POZIV" className="flex flex-col items-start relative min-w-0 max-w-full">
                      <p className="font-pub font-semibold min-w-0 max-w-full text-[#006c4a] text-[13px] leading-[20px]">Svi pozivi</p>
                    </a>
                  </div>
                  <div className="flex flex-col gap-[8px] items-start relative min-w-0 max-w-full w-full">{props.related}</div>
                </div>
                <div className="bg-[#002042] flex flex-col gap-[8px] items-start overflow-clip p-[24px] relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] min-w-0 max-w-full w-full">
                  <div className="flex gap-[8px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                    <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 24 }}>mark_email_unread</span>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <p className="font-space font-bold min-w-0 max-w-full text-[#a6c8fe] text-[12px] tracking-[0.6px] uppercase leading-[16px]">E-OBVIJESTI</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <p className="font-pub font-semibold min-w-0 max-w-full text-[20px] text-white w-full leading-[25px]">Pretplatite se na e-Bilten MTTO <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></p>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#a6c8fe] text-[13px] w-full max-lg:block">
                      <p className="leading-[21.13px] mb-0 max-lg:inline max-lg:after:content-['_']">Primajte obavijesti o novim grantovima, okolišnim</p>
                      <p className="leading-[21.13px] mb-0 max-lg:inline max-lg:after:content-['_']">dozvolama i zakonskim izmjenama izravno u vaš</p>
                      <p className="leading-[21.13px] max-lg:inline">pretinac.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                    <div className="flex flex-col gap-[4px] items-start relative min-w-0 max-w-full w-full">
                      <div className="bg-white flex flex-col items-start overflow-clip pb-[13px] pt-[12px] px-[12px] relative rounded-[2px] min-w-0 max-w-full w-full">
                        <div className="flex flex-col items-start overflow-clip relative min-w-0 max-w-full w-full">
                          <p className="font-pub font-normal min-w-0 max-w-full text-[#9ca3af] text-[13px] w-full leading-[1.17]">Unesite vašu e-mail adresu...</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                        <div className="flex gap-[8px] items-start relative min-w-0 max-w-full w-full flex-wrap">
                          <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full">
                            <div className="bg-white border border-[#767676] border-solid relative rounded-[2.5px] shrink-0 size-[13px]" />
                          </div>
                          <div className="h-[32.5px] relative shrink-0 w-[315px]">
                            <div className="-translate-y-1/2 absolute flex flex-col font-pub font-normal justify-center leading-[0] left-0 text-[#a6c8fe] text-[13px] top-[15.63px] max-lg:block">
                              <p className="leading-[16.25px] mb-0 max-lg:inline max-lg:after:content-['_']">Prihvaćam uvjete obrade podataka u svrhu primanja</p>
                              <p className="leading-[16.25px] max-lg:inline">biltena MTTO.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button type="button" disabled title="E-bilten: Faza 2" className="flex flex-col items-start pt-[8px] relative min-w-0 max-w-full w-full">
                        <div className="bg-[#006c4a] flex flex-col items-center justify-center px-[16px] py-[10px] relative rounded-[2px] min-w-0 max-w-full w-full">
                          <p className="font-pub font-bold min-w-0 max-w-full text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Prijavi se na bilten</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="absolute bg-[rgba(0,108,74,0.2)] right-[-31.67px] rounded-[12px] size-[128px] top-[-32px]" />
                </div>
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[8px] items-start p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full">
                  <div className="flex gap-[8px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                    <div className="bg-[#fef2f2] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px] flex-wrap">
                      <span className="material-symbols-outlined shrink-0 leading-none text-[#062343]" style={{ fontSize: 24 }}>fmd_bad</span>
                    </div>
                    <div className="flex flex-col gap-[2.5px] items-start leading-[0] pb-[1.5px] relative min-w-0 max-w-full">
                      <div className="flex flex-col font-pub font-semibold justify-center relative min-w-0 max-w-full text-[#062343] text-[18px]">
                        <p className="leading-[26px]">Prijavi ekološki incident</p>
                      </div>
                      <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#737780] text-[13px]">
                        <p className="leading-[20px]">Anonimna građanska prijava</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                    <div className="flex flex-col font-pub font-normal justify-center relative min-w-0 max-w-full text-[#43474f] text-[13px] w-full max-lg:block">
                      <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Uočili ste divlju deponiju, ispuštanje otpadnih voda u</p>
                      <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Neretvu ili bespravnu sječu šuma? Prijavite izravno</p>
                      <p className="leading-[20px] max-lg:inline">kantonalnoj inspekciji.</p>
                    </div>
                  </div>
                  <a href="/eko-rizik/prijava" className="bg-[#fef2f2] flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative rounded-[2px] min-w-0 max-w-full w-full flex-wrap">
                    <span className="material-symbols-outlined shrink-0 leading-none text-[#ba1a1a]" style={{ fontSize: 20 }}>report_problem</span>
                    <div className="flex flex-col items-start relative min-w-0 max-w-full">
                      <p className="font-pub font-semibold min-w-0 max-w-full text-[#ba1a1a] text-[14px] tracking-[0.14px] leading-[20px]">Otvori Eko-alarm prijavu</p>
                    </div>
                  </a>
                </div>
                <div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[8px] items-start p-[16px] relative rounded-[8px] min-w-0 max-w-full w-full">
                  <div className="border-[#e5eeff] border-b border-solid flex items-center justify-between pb-[5px] relative min-w-0 max-w-full w-full flex-wrap">
                    <div className="relative min-w-0 max-w-full">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid flex flex-col items-start relative size-full">
                        <p className="font-space font-bold min-w-0 max-w-full text-[#737780] text-[12px] tracking-[0.96px] uppercase leading-[16px]">AUTENTIČNOST OBJAVE</p>
                      </div>
                    </div>
                    <div className="relative min-w-0 max-w-full">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid flex gap-[3.99px] items-center relative size-full flex-wrap">
                        <span className="material-symbols-outlined shrink-0 leading-none text-[#006c4a]" style={{ fontSize: 13 }}>format_image_left</span>
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">VALIDIRANO</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[4px] items-start relative min-w-0 max-w-full w-full">
                    <div className="flex items-start justify-between relative min-w-0 max-w-full w-full flex-wrap">
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Ukupno pregleda:</p>
                      </div>
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[13px] leading-[20px]">{props.views}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between relative min-w-0 max-w-full w-full flex-wrap">
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Preuzetih dokumenata:</p>
                      </div>
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#062343] text-[13px] leading-[20px]">{props.downloads}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between relative min-w-0 max-w-full w-full flex-wrap">
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#737780] text-[13px] leading-[20px]">Status poziva:</p>
                      </div>
                      <div className="flex flex-col items-start relative self-stretch min-w-0 max-w-full">
                        <p className="font-pub font-semibold min-w-0 max-w-full text-[#006c4a] text-[13px] leading-[20px]">{props.callStatus}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                    <div className="bg-white flex flex-col gap-[2px] items-start p-[8px] relative rounded-[2px] min-w-0 max-w-full w-full">
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <p className="font-pub font-bold min-w-0 max-w-full text-[#737780] text-[11px] tracking-[0.44px] uppercase w-full leading-[14px]">SHA-256 VERIFIKACIJSKI KOD:</p>
                      </div>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full w-full">
                        <div className="flex flex-col font-pub justify-center not-italic relative min-w-0 max-w-full text-[#062343] text-[12px] w-full max-lg:block">
                          <p className="leading-[16px] mb-0 max-lg:inline max-lg:after:content-['_']">{props.hash1}</p>
                          <p className="leading-[16px] max-lg:inline">{props.hash2}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a href="#dokumenti" className="flex flex-col items-start pt-[4px] relative min-w-0 max-w-full w-full">
                    <div className="flex gap-[4px] items-center relative min-w-0 max-w-full w-full flex-wrap">
                      <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 15 }}>verified_user</span>
                      <div className="flex flex-col items-start relative min-w-0 max-w-full">
                        <p className="font-pub font-normal min-w-0 max-w-full text-[#002042] text-[13px] leading-[20px]">Provjeri vjerodostojnost u registru</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
<div className="lg:hidden">
{props.lead && (<div className="bg-[#f8f9ff] flex flex-col items-start min-h-[780px] pt-[16px] relative shrink-0 w-full">
        <div className="flex flex-col items-start pb-[40px] relative shrink-0 w-full">
          <div className="flex flex-col gap-[4px] items-start pt-[16px] px-[16px] relative shrink-0 w-full">
            <div className="flex gap-[6px] items-center overflow-auto py-[4px] relative shrink-0 w-full">
              <div className="flex flex-col items-start relative shrink-0">
                <p className="font-pub font-bold text-[#43474f] text-[11px] tracking-[0.44px] leading-[14px]">Naslovna</p>
              </div>
              <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 8 }}>chevron_right</span>
              <div className="flex flex-col items-start relative shrink-0">
                <p className="font-pub font-bold text-[#43474f] text-[11px] tracking-[0.44px] leading-[14px]">Vijesti i obavijesti</p>
              </div>
              <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 8 }}>chevron_right</span>
              <div className="flex flex-col items-start relative shrink-0">
                <p className="font-pub font-bold text-[#002042] text-[11px] tracking-[0.44px] leading-[14px]">{props.crumbType}</p>
              </div>
            </div>
            <div className="content-center flex flex-wrap gap-[8px] items-center relative shrink-0 w-full overflow-x-auto snap-x [scrollbar-width:none]">
              <div className="bg-[#006c4a] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] shrink-0">
                <p className="font-pub font-bold text-[11px] text-white tracking-[0.55px] uppercase leading-[14px]">{props.tag1}</p>
              </div>
              <div className="bg-[#0a3663] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] shrink-0">
                <p className="font-pub font-bold text-[#d3e4fe] text-[11px] tracking-[0.55px] uppercase leading-[14px]">SLUŽBENA OBJAVA</p>
              </div>
              <div className="bg-[#dce9ff] flex flex-col items-start px-[8px] py-[4px] relative rounded-[2px] shrink-0">
                <p className="font-pub font-bold text-[#062343] text-[11px] tracking-[0.44px] leading-[14px]">{props.tag3}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-start px-[16px] relative shrink-0 w-full">
            <div className="flex flex-col items-start py-[16px] relative shrink-0 w-full">
              <h1 className="font-pub font-bold text-[#062343] text-[26px] md:text-[30px] lg:text-[36px] tracking-[-0.9px] leading-[1.22] w-full">{props.title}</h1>
            </div>
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] items-start p-[8px] relative rounded-[4px] shrink-0 w-full">
              <div className="flex items-center justify-between relative shrink-0 w-full">
                <div className="flex gap-[6px] items-center relative shrink-0">
                  <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 16 }}>calendar_today</span>
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-pub font-normal text-[#43474f] leading-[1.17] text-[12px]">
                        <span className="leading-[20px]">{`Objavljeno: `}</span>
                        <span className="font-pub font-bold leading-[20px]">{props.published}</span>
                      </p>
                  </div>
                </div>
                <div className="flex gap-[4px] items-center relative shrink-0">
                  <span className="material-symbols-outlined shrink-0 leading-none text-outline" style={{ fontSize: 16 }}>schedule</span>
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-pub font-normal text-[#43474f] text-[12px] leading-[20px]">{props.readMin} min čitanja</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-[4px] relative shrink-0 w-full">
                <div className="flex gap-[6px] items-center relative shrink-0">
                  <span className="material-symbols-outlined shrink-0 leading-none text-primary" style={{ fontSize: 16 }}>verified_user</span>
                  <div className="flex flex-col items-start max-w-[200px] overflow-clip relative shrink-0">
                    <p className="font-pub font-normal text-[#0b1c30] text-[12px] leading-[20px]">{props.number}</p>
                  </div>
                </div>
                <div className="bg-[#ecfdf5] flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0">
                  <p className="font-pub font-semibold text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">{props.statusShort}</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[2px] relative shrink-0 w-full">
                <div className="flex flex-col items-start relative shrink-0 w-full">
                  <p className="font-pub font-normal text-[#334155] leading-[1.17] w-full text-[12px]">
                      <span className="leading-[20px]">{`Izdao: `}</span>
                      <span className="font-pub font-medium leading-[20px] text-[#062343]">{props.author}</span>
                    </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start pt-[8px] px-[16px] relative shrink-0 w-full">
            {props.share}
          </div>
          <div className="flex flex-col items-start overflow-clip pt-[16px] px-[16px] relative shrink-0 w-full">
            {props.figure}
          </div>
          <div className="flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full">
            <div className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start py-[13px] relative rounded-[8px] shrink-0 w-full">
              <div className="flex flex-col items-start relative shrink-0 w-full">
                <p className="font-pub font-semibold text-[#062343] text-[15px] w-full leading-[1.4]">{props.lead}</p>
              </div>
            </div>
            {props.body}
            
            {props.deadline}
            
          </div>
          {props.docs}
          <div className="flex flex-col items-start pt-[16px] px-[16px] relative shrink-0 w-full">
            <div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] items-start p-[16px] relative rounded-[8px] shrink-0 w-full">
              <div className="flex gap-[16px] items-start relative shrink-0">
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary" style={{ fontSize: 28 }}>thumb_up</span>
                <div className="flex flex-col items-start relative shrink-0">
                  <p className="font-pub font-normal text-[#0b1c30] text-[15px] w-[290px] leading-[20px]">Je li ovaj članak bio koristan za vašu instituciju?</p>
                </div>
              </div>
              <div className="flex gap-[8px] items-center relative shrink-0 w-full">
                <button type="button" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-[1_0_0] flex-col items-center justify-center min-w-px px-[12px] py-[4px] relative rounded-[2px]">
                  <p className="font-pub font-semibold text-[#006c4a] text-[14px] text-center tracking-[0.14px] leading-[20px]">Da, potpuno</p>
                </button>
                <button type="button" className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-[1_0_0] flex-col items-center justify-center min-w-px px-[12px] py-[4px] relative rounded-[2px]">
                  <p className="font-pub font-semibold text-[#43474f] text-[14px] text-center tracking-[0.14px] leading-[20px]">Djelomično</p>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start pt-[16px] px-[16px] relative shrink-0 w-full">
            
          </div>
          <div className="flex flex-col gap-[24px] items-start py-[16px] relative shrink-0 w-full">
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] items-start p-[16px] relative rounded-[8px] shrink-0 w-full">
              <div className="flex items-center justify-between relative shrink-0 w-full">
                <div className="flex gap-[8px] items-center relative shrink-0">
                  <div className="bg-[#006c4a] relative rounded-[12px] shrink-0 size-[8px]" />
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-pub font-semibold text-[#062343] text-[18px] leading-[26px]">{props.relatedTitle}</p>
                  </div>
                </div>
                <a href="/vijesti?type=JAVNI_POZIV" className="flex flex-col items-start relative shrink-0">
                  <p className="font-pub font-semibold text-[#006c4a] text-[13px] leading-[20px]">Svi pozivi</p>
                </a>
              </div>
              <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">{props.related}</div>
            </div>
            <div className="bg-[#002042] flex flex-col gap-[8px] items-start overflow-clip p-[24px] relative shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] shrink-0 w-full">
              <div className="flex gap-[8px] items-center relative shrink-0 w-full">
                <span className="material-symbols-outlined shrink-0 leading-none text-secondary-fixed" style={{ fontSize: 24 }}>mark_email_unread</span>
                <div className="flex flex-col items-start relative shrink-0">
                  <p className="font-space font-bold text-[#a6c8fe] text-[12px] tracking-[0.6px] uppercase leading-[16px]">E-OBVIJESTI</p>
                </div>
              </div>
              <div className="flex flex-col items-start relative shrink-0 w-full">
                <p className="font-pub font-semibold text-[20px] text-white w-full leading-[25px]">Pretplatite se na e-Bilten MTTO <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></p>
              </div>
              <div className="flex flex-col items-start relative shrink-0 w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative shrink-0 text-[#a6c8fe] text-[13px] w-full max-lg:block">
                  <p className="leading-[21.13px] mb-0 max-lg:inline max-lg:after:content-['_']">Primajte obavijesti o novim grantovima, okolišnim</p>
                  <p className="leading-[21.13px] mb-0 max-lg:inline max-lg:after:content-['_']">dozvolama i zakonskim izmjenama izravno u vaš</p>
                  <p className="leading-[21.13px] max-lg:inline">pretinac.</p>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative shrink-0 w-full">
                <div className="flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="bg-white flex flex-col items-start overflow-clip pb-[13px] pt-[12px] px-[12px] relative rounded-[2px] shrink-0 w-full">
                    <div className="flex flex-col items-start overflow-clip relative shrink-0 w-full">
                      <p className="font-pub font-normal text-[#9ca3af] text-[13px] w-full leading-[1.17]">Unesite vašu e-mail adresu...</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start pt-[4px] relative shrink-0 w-full">
                    <div className="flex gap-[8px] items-start relative shrink-0 w-full">
                      <div className="flex flex-col items-start pt-[4px] relative shrink-0">
                        <div className="bg-white border border-[#767676] border-solid relative rounded-[2.5px] shrink-0 size-[13px]" />
                      </div>
                      <div className="h-[32.5px] relative shrink-0 w-[315px]">
                        <div className="-translate-y-1/2 absolute flex flex-col font-pub font-normal justify-center leading-[0] left-0 text-[#a6c8fe] text-[13px] top-[15.63px] max-lg:block">
                          <p className="leading-[16.25px] mb-0 max-lg:inline max-lg:after:content-['_']">Prihvaćam uvjete obrade podataka u svrhu primanja</p>
                          <p className="leading-[16.25px] max-lg:inline">biltena MTTO.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" disabled title="E-bilten: Faza 2" className="flex flex-col items-start pt-[8px] relative shrink-0 w-full">
                    <div className="bg-[#006c4a] flex flex-col items-center justify-center px-[16px] py-[10px] relative rounded-[2px] shrink-0 w-full">
                      <p className="font-pub font-bold text-[14px] text-center text-white tracking-[0.14px] leading-[20px]">Prijavi se na bilten</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="absolute bg-[rgba(0,108,74,0.2)] right-[-32px] rounded-[12px] size-[128px] top-[-32px]" />
            </div>
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[8px] items-start p-[16px] relative rounded-[8px] shrink-0 w-full">
              <div className="flex gap-[8px] items-center relative shrink-0 w-full">
                <div className="bg-[#fef2f2] flex items-center justify-center relative rounded-[4px] shrink-0 size-[40px]">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#062343]" style={{ fontSize: 24 }}>fmd_bad</span>
                </div>
                <div className="flex flex-col gap-[2.5px] items-start leading-[0] pb-[1.5px] relative shrink-0">
                  <div className="flex flex-col font-pub font-semibold justify-center relative shrink-0 text-[#062343] text-[18px]">
                    <p className="leading-[26px]">Prijavi ekološki incident</p>
                  </div>
                  <div className="flex flex-col font-pub font-normal justify-center relative shrink-0 text-[#737780] text-[13px]">
                    <p className="leading-[20px]">Anonimna građanska prijava</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start relative shrink-0 w-full">
                <div className="flex flex-col font-pub font-normal justify-center relative shrink-0 text-[#43474f] text-[13px] w-full max-lg:block">
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Uočili ste divlju deponiju, ispuštanje otpadnih voda u</p>
                  <p className="leading-[20px] mb-0 max-lg:inline max-lg:after:content-['_']">Neretvu ili bespravnu sječu šuma? Prijavite izravno</p>
                  <p className="leading-[20px] max-lg:inline">kantonalnoj inspekciji.</p>
                </div>
              </div>
              <a href="/eko-rizik/prijava" className="bg-[#fef2f2] flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative rounded-[2px] shrink-0 w-full">
                <span className="material-symbols-outlined shrink-0 leading-none text-[#ba1a1a]" style={{ fontSize: 20 }}>report_problem</span>
                <div className="flex flex-col items-start relative shrink-0">
                  <p className="font-pub font-semibold text-[#ba1a1a] text-[14px] tracking-[0.14px] leading-[20px]">Otvori Eko-alarm prijavu</p>
                </div>
              </a>
            </div>
            <div className="bg-[#eff4ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[8px] items-start p-[16px] relative rounded-[8px] shrink-0 w-full">
              <div className="border-[#e5eeff] border-b border-solid flex items-center justify-between pb-[5px] relative shrink-0 w-full">
                <div className="relative shrink-0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid flex flex-col items-start relative size-full">
                    <p className="font-space font-bold text-[#737780] text-[12px] tracking-[0.96px] uppercase leading-[16px]">AUTENTIČNOST OBJAVE</p>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid flex gap-[3.99px] items-center relative size-full">
                    <span className="material-symbols-outlined shrink-0 leading-none text-[#006c4a]" style={{ fontSize: 13 }}>format_image_left</span>
                    <p className="font-pub font-bold text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">VALIDIRANO</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                <div className="flex items-start justify-between relative shrink-0 w-full">
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-normal text-[#737780] text-[13px] leading-[20px]">Ukupno pregleda:</p>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-semibold text-[#062343] text-[13px] leading-[20px]">{props.views}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between relative shrink-0 w-full">
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-normal text-[#737780] text-[13px] leading-[20px]">Preuzetih dokumenata:</p>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-semibold text-[#062343] text-[13px] leading-[20px]">{props.downloads}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between relative shrink-0 w-full">
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-normal text-[#737780] text-[13px] leading-[20px]">Status poziva:</p>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch shrink-0">
                    <p className="font-pub font-semibold text-[#006c4a] text-[13px] leading-[20px]">{props.callStatus}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start pt-[4px] relative shrink-0 w-full">
                <div className="bg-white flex flex-col gap-[2px] items-start p-[8px] relative rounded-[2px] shrink-0 w-full">
                  <div className="flex flex-col items-start relative shrink-0 w-full">
                    <p className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase w-full leading-[14px]">SHA-256 VERIFIKACIJSKI KOD:</p>
                  </div>
                  <div className="flex flex-col items-start relative shrink-0 w-full">
                    <div className="flex flex-col font-pub justify-center not-italic relative shrink-0 text-[#062343] text-[12px] w-full max-lg:block">
                      <p className="leading-[16px] mb-0 max-lg:inline max-lg:after:content-['_']">{props.hash1}</p>
                      <p className="leading-[16px] max-lg:inline">{props.hash2}</p>
                    </div>
                  </div>
                </div>
              </div>
              <a href="#dokumenti" className="flex flex-col items-start pt-[4px] relative shrink-0 w-full">
                <div className="flex gap-[4px] items-center relative shrink-0 w-full">
                  <span className="material-symbols-outlined shrink-0 leading-none text-[#002042]" style={{ fontSize: 15 }}>verified_user</span>
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-pub font-normal text-[#002042] text-[13px] leading-[20px]">Provjeri vjerodostojnost u registru</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>)}
</div>
</>
  );
}
