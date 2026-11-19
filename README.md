# MTTO Digital Platform 2027 – MVP

Radni prototip nove web platforme Ministarstva trgovine, turizma i zaštite okoliša HNK.

- `apps/web` – Next.js 15 (javni portal + CMS na `/admin`), dizajn prema Stitch konceptu
- `apps/api` – NestJS 11 + PostgreSQL (objave, dokumenti, registri, mapa, prijava, audit log)

## Lokalno

```bash
npm install
# PostgreSQL: DATABASE_URL u apps/api/.env, plus ADMIN_PASSWORD i JWT_SECRET
npm run build
node scripts/start.js   # web na :3000, API na :4000 (interno)
```

Početni podaci (`apps/api/src/seed.ts`): stvarne objave i prilozi javnog poziva s mtto.gov.ba, te jasno označeni **demo** zapisi za registre i propise. `node apps/api/dist/seed.js --reset` vraća bazu na početno stanje.

## Render

`render.yaml` kreira jedan web servis i PostgreSQL bazu. Lozinka za CMS (`ADMIN_PASSWORD`) generiše se automatski i vidi se u Render → Environment. Google Maps se uključuje postavljanjem `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (bez ključa mapa koristi OpenStreetMap).
