import { useValidatedParams, z, zh } from 'h3-zod';
import { subject } from '@casl/ability';
import { slugString } from '~/server/utils/zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { emitRedis } from '~/server/utils/sse';

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
  if (useAbility(event).cannot('update', subject('Team', team))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  if (!team.users.some((u) => u.userId === userid)) {
    throw createError({ status: 409, statusText: 'User not in team!' });
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { creatorId: userid }
  });
  emitRedis(`sse:event:${userid}`, 'notify', {
    title: 'sse.notify.team_promote.title',
    message: 'sse.notify.team_promote.message',
    color: 'success',
    link: `/teams/${team.slug}`
  });
  return true;
});
