import { useValidatedParams, z, zh } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { deviceid } = await useValidatedParams(
    event,
    z.object({
      deviceid: zh.intAsString
    })
  );

  const device = await prisma.device.findUnique({
    where: {
      deletedAt: null,
      id: deviceid
    },
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
  });
  if (!device) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (
    useAbility(event).cannot(
      'update',
      subject('Team', device.hive.location.team)
    )
  ) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  await prisma.device.update({
    where: {
      id: device.id
    },
    data: {
      deletedAt: new Date()
    }
  });

  return true;
});
