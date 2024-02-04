import { useValidatedBody, useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { slugString } from '~/server/utils/zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

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
      }
    }
  });
  if (!location) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('update', subject('Team', location.team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const data = await useValidatedBody(
    event,
    z.object({
      name: z.string().max(64).trim(),
      slug: slugString,
      lat: z.number().min(-90).max(90).nullable(),
      lon: z.number().min(-180).max(180).nullable()
    })
  );

  if (location.slug !== data.slug) {
    const locationSlug = await prisma.hiveLocation.findUnique({
      where: {
        slug: data.slug,
        NOT: {
          id: location.id
        }
      },
      select: {
        id: true
      }
    });
    if (locationSlug) {
      throw createError({ status: 409, statusText: 'Slug already in use!' });
    }
  }

  await prisma.hiveLocation.update({
    where: {
      id: location.id
    },
    data
  });

  return true;
});
