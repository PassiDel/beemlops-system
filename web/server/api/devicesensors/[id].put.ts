import { useValidatedBody, useValidatedParams, z, zh } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { id } = await useValidatedParams(
    event,
    z.object({
      id: zh.intAsString
    })
  );

  const deviceSensor = await prisma.deviceSensor.findUnique({
    where: {
      id
    },
    include: {
      device: {
        include: {
          hive: {
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
          }
        }
      }
    }
  });
  if (!deviceSensor) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (
    useAbility(event).cannot(
      'update',
      subject('Team', deviceSensor.device.hive.location.team)
    )
  ) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const { name } = await useValidatedBody(
    event,
    z.object({
      name: z.string().max(64).trim()
    })
  );

  await prisma.deviceSensor.update({
    where: {
      id: deviceSensor.id
    },
    data: {
      name
    }
  });

  return true;
});
