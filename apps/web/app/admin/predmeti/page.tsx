'use client';
import F2Page from '@/components/admin/F2Page';
import { BarChartSquare02, FileCheck02, Inbox01, Mail01, SearchLg, Signal01 } from '@untitledui/icons';

export default function Page() {
  return (
    <F2Page title="E-pisarnica" sub="Elektronski protokol, predmeti i praćenje zahtjeva." icon={Inbox01}
      features={[
        [Inbox01, 'Urudžbiranje', 'Zaprimanje podnesaka s brojem predmeta i datumom prijema.'],
        [Signal01, 'Radni tok', 'Dodjela referentu, rokovi i odobrenja po koracima.'],
        [SearchLg, 'Praćenje statusa', 'Građanin vidi status zahtjeva putem broja predmeta.'],
        [FileCheck02, 'Rješenja i prilozi', 'Spis predmeta s rješenjem i povezanim dokumentima.'],
        [Mail01, 'Obavijesti', 'E-mail obavijest podnosiocu pri promjeni statusa.'],
        [BarChartSquare02, 'Izvještaji', 'Broj predmeta i prosječno vrijeme rješavanja po sektoru.'],
      ]}
      steps={['Usklađivanje s postojećom knjigom protokola Ministarstva.', 'Definisanje uloga referenata i rukovodilaca.', 'Pilot za zahtjeve za okolišne dozvole.', 'Javno praćenje statusa na portalu.']} />
  );
}
