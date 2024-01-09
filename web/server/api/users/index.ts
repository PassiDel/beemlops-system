import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  if (useAbility(event).cannot('list', 'User')) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }
  return await prisma.user.findMany({
    where: {
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: { teams: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
});
