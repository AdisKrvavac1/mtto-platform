'use client';
import { useCan } from '@/lib/adminApi';
import { PageTitle } from '@/components/admin/ui';
import RegistrySettings from '@/components/admin/RegistrySettings';

export default function NewRegistry() {
  const canPublish = useCan('registri', 'publish');
  return (
    <>
      <PageTitle kicker="Definišite polja; zapise dodajete ručno ili uvozom CSV-a nakon kreiranja." crumbs={['Javni registri', 'Novi registar']} title="Novi registar" />
      {canPublish ? <RegistrySettings canPublish /> : <p className="text-[16px] text-[#525252]">Registre kreira administrator.</p>}
    </>
  );
}
