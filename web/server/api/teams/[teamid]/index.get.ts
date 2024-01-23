import { useValidatedParams, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { teamLocationHiveDto } from '~/server/dto/team';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { teamid } = await useValidatedParams(
    event,
    z.object({
      teamid: z.string().max(64)
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      deletedAt: null,
      slug: teamid
    },
    include: {
      users: {
        include: {
          user: true
        }
      },
      creator: true,
      locations: {
        include: {
          hives: true
        }
      }
    }
  });
  if (!team) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('read', subject('Team', team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  return teamLocationHiveDto(
    team,
    useAbility(event).can('update', subject('Team', team))
  );
});
