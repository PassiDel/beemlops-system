import { useValidatedParams, z, zh } from 'h3-zod';
import { subject } from '@casl/ability';
import { slugString } from '~/server/utils/zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { teamid: teamSlug, userid } = await useValidatedParams(
    event,
    z.object({
      teamid: slugString,
      userid: zh.intAsString
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      slug: teamSlug,
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
  const loggedInUser = (await getUserSession(event as any)).user;
  if (
    useAbility(event).cannot('update', subject('Team', team)) ||
    loggedInUser.id === userid
  ) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  await prisma.teamUser.delete({
    where: {
      userId_teamId: {
        teamId: team.id,
        userId: userid
      }
    }
  });

  return true;
});
