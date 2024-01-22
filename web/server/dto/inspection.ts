import { Hive, Inspection } from '@mono/db';
import { hiveDto } from '~/server/dto/hive';

type InspectionHive = Inspection & { hive: Hive };

export function inspectionDto(inspection: Inspection) {
  const { id, impression, timestamp, notes, verifiedByUser, createdAt } =
    inspection;

  return { id, impression, timestamp, notes, verifiedByUser, createdAt };
}

export type InspectionDto = ReturnType<typeof inspectionDto>;

export function inspectionHiveDto(inspection: InspectionHive) {
  const { hive } = inspection;

  return { ...inspectionDto(inspection), hive: hiveDto(hive) };
}

export type InspectionHiveDto = ReturnType<typeof inspectionHiveDto>;
