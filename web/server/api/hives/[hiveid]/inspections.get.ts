import { useValidatedParams, useValidatedQuery, z, zh } from 'h3-zod';
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

  const { by, order, skip } = await useValidatedQuery(
    event,
    z.object({
      skip: zh.intAsString.catch(1).transform((v) => v - 1),
      order: z.enum(['asc', 'desc']).catch('desc'),
      by: z
        .enum(['verifiedByUser', 'impression', 'timestamp'])
        .catch('timestamp')
    })
  );

  const take = 10;

  const where = {
    hive: {
      slug: hiveid
    },
    deletedAt: null
  };
  const [data, total] = await Promise.all([
    prisma.inspection.findMany({
      where,
      take,
      skip,
      orderBy: {
        [by]: order
      }
    }),
    prisma.inspection.count({
      where
    })
  ]);

  return { data, total, perPage: take };
});
