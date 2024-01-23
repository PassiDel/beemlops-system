import { Hive, HiveLocation } from '@mono/db';

export type FullHiveLocation = HiveLocation & { hives: Hive[] };

export function locationDto(location: HiveLocation) {
  const { id, name, slug, lat, lon, createdAt } = location;

  return { id, name, slug, lat, lon, createdAt };
}

export type LocationDto = ReturnType<typeof locationDto>;

export function locationHiveDto(location: FullHiveLocation) {
  return { ...locationDto(location), hives: location.hives.map(hiveDto) };
}

export type LocationHiveDto = ReturnType<typeof locationHiveDto>;

export function hiveDto(hive: Hive) {
  const { id, name, slug, desc, rawWeight, createdAt } = hive;

  return { id, name, slug, desc, rawWeight, createdAt };
}

export type HiveDto = ReturnType<typeof hiveDto>;
