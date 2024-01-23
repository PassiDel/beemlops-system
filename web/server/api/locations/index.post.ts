import { useValidatedBody, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { slugString } from '~/server/utils/zod';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const {
    slug,
    name,
    team: teamSlug
  } = await useValidatedBody(
    event,
    z.object({
      slug: slugString,
      team: slugString,
      name: z.string().max(64).trim()
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      deletedAt: null,
      slug: teamSlug
    },
    include: {
      users: {
        include: {
          user: true
        }
      },
      creator: true
    }
  });

  if (!team) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('update', subject('Team', team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  try {
    return await prisma.hiveLocation.create({
      data: {
        slug,
        name,
        teamId: team.id
      },
      select: {
        slug: true
      }
    });
  } catch (_) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }
});
