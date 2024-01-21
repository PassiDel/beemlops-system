import { useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { hiveDto } from '~/server/dto/hive';
import { slugString } from '~/server/utils/zod';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { hiveid } = await useValidatedParams(
    event,
    z.object({
      hiveid: slugString
    })
  );

  const hive = await prisma.hive.findUnique({
    where: {
      deletedAt: null,
      slug: hiveid
    },
    include: {
      location: {
        include: {
          team: {
            include: {
              users: {
                include: {
                  user: true
                }
              },
              creator: true
            }
          }
        }
      },
      device: {
        include: {
          DeviceSensor: {
            include: {
              sensor: true
            }
          }
        }
      }
    }
  });
  if (!hive) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('read', subject('Team', hive.location.team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const sensors = hive.device
    .flatMap((d) => d.DeviceSensor)
    .reduce(
      (a, ds) => {
        const index = a.findIndex((s) => s.id === ds.sensor.id);
        if (index < 0) {
          a.push({
            id: ds.sensor.id,
            name: ds.sensor.name,
            unit: ds.sensor.unit,
            devices: [
              {
                key: ds.key,
                id: ds.id,
                deviceId: ds.deviceId
              }
            ]
          });
          return a;
        }
        a[index].devices.push({
          key: ds.key,
          id: ds.id,
          deviceId: ds.deviceId
        });

        return a;
      },
      [] as {
        id: number;
        name: string;
        unit: string;
        devices: { key: string | null; id: number; deviceId: number }[];
      }[]
    );

  return {
    ...hiveDto(hive),
    sensors,
    isCreator: useAbility(event).can(
      'update',
      subject('Team', hive.location.team)
    )
  };
});
