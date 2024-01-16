import { useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { locationDto } from '~/server/dto/hive';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { locationid } = await useValidatedParams(
    event,
    z.object({
      locationid: z.string().max(64)
    })
  );

  const location = await prisma.hiveLocation.findUnique({
    where: {
      deletedAt: null,
      slug: locationid
    },
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
      },
      hives: true
    }
  });
  if (!location) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('read', subject('Team', location.team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  return {
    ...locationDto(location),
    isCreator: useAbility(event).can('update', subject('Team', location.team))
  };
});
