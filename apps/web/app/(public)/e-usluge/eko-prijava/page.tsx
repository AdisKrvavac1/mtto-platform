import { permanentRedirect } from 'next/navigation';

// Stara adresa – prijava incidenta je preseljena pod Eko-rizik HNK.
export default function Page() {
  permanentRedirect('/eko-rizik/prijava');
}
