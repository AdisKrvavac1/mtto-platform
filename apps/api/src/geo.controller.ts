import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { sql } from 'kysely';
import { Db } from './db';
import { toFloat } from './util';

/**
 * F1-01: prostorni upiti. Lokacije s javne karte u zadanom radijusu, od najbliže.
 * S PostGIS-om koristi GiST indeks; bez njega računa udaljenost formulom (haversine) — isti rezultat, sporije.
 */
@Controller('map')
export class GeoController {
  constructor(private db: Db) {}

  @Get('nearby')
  async nearby(@Query('lat') qlat: string, @Query('lng') qlng: string, @Query('km') qkm?: string, @Query('layer') layer?: string) {
    const lat = toFloat(qlat), lng = toFloat(qlng);
    if (lat == null || lng == null || lat < 42 || lat > 45 || lng < 16 || lng > 19.5) throw new BadRequestException('Koordinate moraju biti u regiji');
    const km = Math.min(Math.max(toFloat(qkm) ?? 10, 0.1), 100);
    const k = await this.db.k();
    const meters = km * 1000;
    let q = k.selectFrom('map_locations').select(['id', 'name', 'layer', 'description', 'lat', 'lng', 'link']);
    if (layer) q = q.where('layer', '=', layer);
    if (await this.db.geoEnabled()) {
      const pt = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
      const rows = await q
        .select(sql<number>`round(ST_Distance("geom", ${pt}))`.as('distanceM'))
        .where(sql<boolean>`ST_DWithin("geom", ${pt}, ${meters})`)
        .orderBy(sql`"geom" <-> ${pt}`)
        .limit(50)
        .execute();
      return { engine: 'postgis', km, items: rows };
    }
    const dist = sql<number>`round(6371000 * 2 * asin(sqrt(power(sin(radians("lat" - ${lat}) / 2), 2) + cos(radians(${lat})) * cos(radians("lat")) * power(sin(radians("lng" - ${lng}) / 2), 2))))`;
    const rows = await k.selectFrom(q.select(dist.as('distanceM')).as('x')).selectAll().where('distanceM', '<=', meters).orderBy('distanceM').limit(50).execute();
    return { engine: 'haversine', km, items: rows };
  }
}
