import { AboutCrumb, AboutProfile, AboutCabinet, AboutSectors, AboutOffice, AboutContact, AboutLinks } from '@/components/stitch/About';

export const metadata = { title: 'O nama i kontakti' };

export default function AboutPage() {
  return (
    <>
      <AboutCrumb />
      <AboutProfile />
      <AboutCabinet />
      <AboutSectors />
      <AboutOffice />
      <AboutContact />
      <AboutLinks />
    </>
  );
}
