'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import type { CmsForm } from '@/lib/cases';
import { Badge, PageTitle, btnSecondary, useToast } from '@/components/admin/ui';
import FormSettings from '@/components/admin/FormSettings';
import { LinkExternal01 } from '@untitledui/icons';

export default function FormPage() {
  const { id } = useParams<{ id: string }>();
  const canPublish = useCan('predmeti', 'publish');
  const toast = useToast();
  const [f, setF] = useState<CmsForm | null>(null);
  useEffect(() => { adminFetch<CmsForm>(`/admin/forms/${id}`).then(setF).catch((e) => toast.err(e.message)); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!f) return <><div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]" />{toast.node}</>;
  return (
    <>
      <PageTitle kicker={`Rok ${f.slaDays} dana · adresa /e-usluge/obrasci/${f.slug}`} crumbs={['E-pisarnica', 'Obrasci', f.title]} title={f.title}
        badge={f.active ? <Badge tone="success" dot>Aktivan</Badge> : <Badge tone="gray">Isključen</Badge>}>
        {f.active && <a className={btnSecondary} href={`/e-usluge/obrasci/${f.slug}`} target="_blank" rel="noopener"><LinkExternal01 />Na portalu</a>}
      </PageTitle>
      <FormSettings key={f.updatedAt} form={f} canPublish={canPublish} onSaved={setF} />
    </>
  );
}
