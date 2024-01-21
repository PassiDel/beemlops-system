import { useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { locationHiveDto } from '~/server/dto/hive';
import { slugString } from '~/server/utils/zod';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { locationid } = await useValidatedParams(
    event,
    z.object({
      locationid: slugString
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
    ...locationHiveDto(location),
    isCreator: useAbility(event).can('update', subject('Team', location.team))
  };
});
