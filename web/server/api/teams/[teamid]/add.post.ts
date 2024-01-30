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
      slug: teamid,
      deletedAt: null
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
  if (useAbility(event).cannot('read', subject('Team', team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const { email } = await useValidatedBody(
    event,
    z.object({
      email: z.string().email().min(5)
    })
  );

  const user = await prisma.user.findUnique({
    where: {
      email,
      deletedAt: null
    }
  });
  if (!user) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (team.users.some((u) => u.userId === user.id)) {
    throw createError({ status: 409, statusText: 'User already in team!' });
  }

  await prisma.teamUser.create({
    data: {
      teamId: team.id,
      userId: user.id
    }
  });

  return true;
});
