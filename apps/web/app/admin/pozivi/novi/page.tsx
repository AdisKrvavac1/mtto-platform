'use client';
import { PageTitle } from '@/components/admin/ui';
import { CallSettings } from '@/components/admin/CallEditor';

export default function NewCall() {
  return (
    <>
      <PageTitle kicker="Poziv ostaje nacrt dok ga urednik ne objavi." crumbs={['Javni pozivi', 'Novi poziv']} title="Novi javni poziv" />
      <CallSettings />
    </>
  );
}
