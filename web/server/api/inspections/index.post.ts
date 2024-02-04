import { useValidatedBody, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { slugString } from '~/server/utils/zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { timestamp, hiveId, verifiedByUser, notes, impression } =
    await useValidatedBody(
      event,
      z.object({
        timestamp: z
          .string()
          .datetime({ offset: true })
          .refine((d) => new Date(d).getTime() < Date.now(), {
            message: 'Date needs to be in the past'
          }),
        hiveId: slugString,
        verifiedByUser: z.boolean(),
        notes: z.string().max(4096).trim(),
        impression: z.number().int().min(0).max(5)
      })
    );

  const hive = await prisma.hive.findUnique({
    where: {
      deletedAt: null,
      slug: hiveId
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

  return await prisma.inspection.create({
    data: {
      timestamp,
      hiveId: hive.id,
      verifiedByUser,
      notes,
      impression
    },
    select: {
      id: true
    }
  });
});
