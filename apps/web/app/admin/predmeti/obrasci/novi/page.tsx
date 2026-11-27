'use client';
import { useCan } from '@/lib/adminApi';
import { PageTitle } from '@/components/admin/ui';
import FormSettings from '@/components/admin/FormSettings';

export default function NewForm() {
  const canPublish = useCan('predmeti', 'publish');
  return (
    <>
      <PageTitle kicker="Obrazac postaje dostupan na portalu kad ga označite kao aktivan." crumbs={['E-pisarnica', 'Obrasci', 'Novi obrazac']} title="Novi obrazac" />
      {canPublish ? <FormSettings canPublish /> : <p className="text-[16px] text-[#525252]">Obrasce kreira administrator.</p>}
    </>
  );
}
