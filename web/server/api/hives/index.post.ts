import { useValidatedBody, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const {
    slug,
    name,
    desc,
    location: locationSlug
  } = await useValidatedBody(
    event,
    z.object({
      slug: z
        .string()
        .min(7)
        .max(64)
        .regex(/^[a-z0-9-]{7,64}$/),
      location: z
        .string()
        .min(7)
        .max(64)
        .regex(/^[a-z0-9-]{7,64}$/),
      name: z.string().max(64).trim(),
      desc: z.string().max(4096).trim()
    })
  );

  const location = await prisma.hiveLocation.findUnique({
    where: {
      deletedAt: null,
      slug: locationSlug
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

  try {
    return await prisma.hive.create({
      data: {
        slug,
        name,
        desc,
        locationId: location.id
      },
      select: {
        slug: true
      }
    });
  } catch (_) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }
});
