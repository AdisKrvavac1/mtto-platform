/** F2-10: transparentnost – zbirni podaci za javnu stranicu (budžet, nabavke, zahtjevi za pristup informacijama). */
import { Controller, Get } from '@nestjs/common';
import { Db } from './db';

const N = (x: string) => `coalesce(nullif(e."data"->>'${x}','')::numeric,0)`;
const ACTIVE = (slug: string) => `FROM registry_entries e JOIN registries r ON r."id"=e."registryId" WHERE r."slug"='${slug}' AND r."public" AND e."status"='AKTIVAN'`;

@Controller('transparency')
export class TransparencyController {
  constructor(private db: Db) {}

  @Get()
  async overview() {
    const [budgetYears, budgetKinds, procStatus, procLatest, foi, docs] = await Promise.all([
      this.db.q<any>(`SELECT (e."data"->>'godina')::int "year", sum(${N('planirano')})::float "planned", sum(${N('izvrseno')})::float "spent", count(*)::int "items", bool_or(e."isDemo") "demo" ${ACTIVE('budzet')} GROUP BY 1 ORDER BY 1 DESC`),
      this.db.q<any>(`SELECT (e."data"->>'godina')::int "year", coalesce(e."data"->>'vrsta','Ostalo') "kind", sum(${N('planirano')})::float "planned", sum(${N('izvrseno')})::float "spent" ${ACTIVE('budzet')} GROUP BY 1,2 ORDER BY 1 DESC, 3 DESC`),
      this.db.q<any>(`SELECT (e."data"->>'godina')::int "year", e."data"->>'status' "status", count(*)::int "count", sum(${N('procijenjeno')})::float "estimated", sum(${N('ugovoreno')})::float "contracted", bool_or(e."isDemo") "demo" ${ACTIVE('javne-nabavke')} GROUP BY 1,2 ORDER BY 1 DESC`),
      this.db.q<any>(`SELECT e."id", e."data", e."isDemo" ${ACTIVE('javne-nabavke')} ORDER BY coalesce(e."data"->>'datumUgovora','') DESC, e."createdAt" DESC LIMIT 6`),
      this.db.q<any>(`SELECT extract(year FROM k."receivedAt" AT TIME ZONE 'Europe/Sarajevo')::int "year", count(*)::int "received",
          count(*) FILTER (WHERE k."closedAt" IS NOT NULL)::int "closed",
          count(*) FILTER (WHERE k."closedAt" IS NOT NULL AND k."closedAt" <= k."dueAt")::int "onTime",
          count(*) FILTER (WHERE k."status"='ODBIJEN')::int "refused"
        FROM cases k JOIN forms f ON f."id"=k."formId" WHERE f."slug"='zahtjev-za-pristup-informacijama' AND NOT k."isDemo" GROUP BY 1 ORDER BY 1 DESC`),
      this.db.q<any>(`SELECT "id","title","docType","issuedAt","fileName","size","isDemo" FROM documents WHERE "accessLevel"='JAVNO' AND "disposedAt" IS NULL AND "docType" IN ('IZVJESTAJ') ORDER BY "issuedAt" DESC NULLS LAST LIMIT 8`),
    ]);
    const latest = budgetYears[0]?.year ?? null;
    return {
      budget: { years: budgetYears, latest, kinds: budgetKinds.filter((k) => k.year === latest) },
      procurement: { byStatus: procStatus, latest: procLatest.map((p) => ({ id: p.id, ...p.data, isDemo: p.isDemo })) },
      foi, reports: docs,
    };
  }
}
