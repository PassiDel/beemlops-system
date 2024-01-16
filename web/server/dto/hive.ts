import { Hive, HiveLocation } from '@mono/db';

export type FullHiveLocation = HiveLocation & { hives: Hive[] };

export function locationDto(location: FullHiveLocation) {
  const { id, name, slug, hives, lat, lon, createdAt } = location;

  return { id, name, slug, lat, lon, createdAt, hives: hives.map(hiveDto) };
}

export function hiveDto(hive: Hive) {
  const { id, name, slug, desc, rawWeight, createdAt } = hive;

  return { id, name, slug, desc, rawWeight, createdAt };
}

export type HiveDto = ReturnType<typeof hiveDto>;
