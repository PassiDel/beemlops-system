import { useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { slugString } from '~/server/utils/zod';
import { hiveDevicesDto } from '~/server/dto/hive';

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
        },
        where: {
          deletedAt: null
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

  return {
    ...hiveDevicesDto(hive),
    isCreator: useAbility(event).can(
      'update',
      subject('Team', hive.location.team)
    )
  };
});
