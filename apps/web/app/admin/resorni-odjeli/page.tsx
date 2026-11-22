'use client';
import F2Page from '@/components/admin/F2Page';
import { Building07, Dataflow03, Edit05, File06, Users01 } from '@untitledui/icons';

export default function Page() {
  return (
    <F2Page title="Resorni odjeli" sub="Organizaciona struktura, sektori i nadležnosti." icon={Building07}
      features={[
        [Building07, 'Sektori i službe', 'Trgovina, turizam i ugostiteljstvo, zaštita okoliša, pravni i opći poslovi.'],
        [Users01, 'Kontakt osobe', 'Rukovodioci i referenti s kontaktima, prikaz na stranici O nama.'],
        [Dataflow03, 'Nadležnosti', 'Koji sektor odgovara za koju e-uslugu i registar.'],
        [Edit05, 'Delegiranje potpisa', 'Ovlaštenja za potpisivanje rješenja u odsustvu.'],
        [File06, 'Pravilnik o sistematizaciji', 'Važeći pravilnik kao dokument za preuzimanje.'],
      ]}
      steps={['Unos postojeće strukture iz pravilnika o sistematizaciji.', 'Povezivanje sektora s registrima i e-uslugama.', 'Automatski prikaz kontakata na javnom portalu.']} />
  );
}
