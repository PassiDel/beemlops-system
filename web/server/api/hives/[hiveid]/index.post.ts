import { useValidatedBody, useValidatedParams, z, zh } from 'h3-zod';
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
  if (useAbility(event).cannot('update', subject('Team', hive.location.team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const data = await useValidatedBody(
    event,
    z.object({
      name: z.string().max(64).trim(),
      slug: slugString,
      desc: z.string().max(4096).trim(),
      rawWeight: zh.numAsString.optional()
    })
  );

  const hiveSlug = await prisma.hive.findUnique({
    where: {
      slug: data.slug,
      NOT: {
        id: hive.id
      }
    },
    select: {
      id: true
    }
  });
  if (hiveSlug) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }

  await prisma.hive.update({
    where: {
      id: hive.id
    },
    data
  });

  return true;
});
