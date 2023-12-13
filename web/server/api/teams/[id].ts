import { useValidatedParams, z, zh } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';
import { teamDto } from '~/server/dto/team';
import { subject } from '@casl/ability';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { id } = await useValidatedParams(
    event,
    z.object({
      id: zh.intAsString
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      deletedAt: null,
      id
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

  return teamDto(team);
});
