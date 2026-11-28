import { redirect } from 'next/navigation';

/** Kratka adresa za prijavu inspekciji (F2-12, F2-19). */
export default function InspectionReport() {
  redirect('/e-usluge/obrasci/prijava-inspekciji');
}
