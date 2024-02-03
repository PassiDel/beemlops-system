import { useValidatedBody, useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
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
      }
    }
  });
  if (!hive) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('read', subject('Team', hive.location.team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const device = await useValidatedBody(
    event,
    z.object({
      key: z.string().max(64).trim(),
      name: z.string().max(64).trim(),
      sensors: z
        .array(
          z.object({
            name: z.string().max(64).trim(),
            key: z.string().max(64).trim(),
            sensor: z.object({
              id: z.number().int().min(1)
            })
          })
        )
        .min(1)
    })
  );

  const sensors = await prisma.sensor.findMany({
    where: {
      id: {
        in: device.sensors.map((s) => s.sensor.id)
      }
    },
    select: {
      id: true
    }
  });

  if (
    !device.sensors.every((s) => sensors.some((ss) => s.sensor.id === ss.id))
  ) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }

  if (
    device.sensors.some(
      (e, i, arr) => arr.findIndex((f) => f.key === e.key) !== i
    )
  ) {
    throw createError({ status: 409, statusText: 'Key duplicate!' });
  }

  return await prisma.device.create({
    data: {
      hiveId: hive.id,
      key: device.key,
      name: device.name,
      DeviceSensor: {
        create: device.sensors.map((s) => ({
          key: s.key,
          name: s.name,
          sensorId: s.sensor.id
        }))
      }
    },
    select: {
      id: true
    }
  });
});
