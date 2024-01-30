import { useValidatedBody, useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { slugString } from '~/server/utils/zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { teamid } = await useValidatedParams(
    event,
    z.object({
      teamid: slugString
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      slug: teamid
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

  const data = await useValidatedBody(
    event,
    z.object({
      name: z.string().max(64).trim(),
      slug: slugString
    })
  );

  const teamSlug = await prisma.team.findUnique({
    where: {
      slug: data.slug,
      NOT: {
        id: team.id
      }
    },
    select: {
      id: true
    }
  });
  if (teamSlug) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }

  await prisma.team.update({
    where: {
      slug: teamid
    },
    data
  });

  return true;
});
