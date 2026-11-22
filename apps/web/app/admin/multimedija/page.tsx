'use client';
import F2Page from '@/components/admin/F2Page';
import { Camera01, Download01, Folder, Image01, Lightning01, UploadCloud02 } from '@untitledui/icons';

export default function Page() {
  return (
    <F2Page title="Multimedija" sub="Fotogalerije, albumi i press materijali." icon={Image01}
      features={[
        [UploadCloud02, 'Grupno učitavanje', 'Više fotografija odjednom, s automatskim smanjenjem za web.'],
        [Folder, 'Tematski albumi', 'Turističke destinacije, zaštićena područja, protokol i događaji.'],
        [Camera01, 'Autorska prava', 'Autor i licenca uz svaku fotografiju, prikaz na portalu.'],
        [Lightning01, 'WebP i AVIF', 'Automatska konverzija za brže učitavanje stranica.'],
        [Download01, 'Press kit', 'Paket fotografija i logotipa za medije u jednom preuzimanju.'],
      ]}
      steps={['Prijenos postojećih galerija s mtto.gov.ba.', 'Kategorizacija albuma po resorima.', 'Povezivanje galerija s objavama i stranicama resora.']} />
  );
}
