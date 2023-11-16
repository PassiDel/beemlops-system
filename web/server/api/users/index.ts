import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async () => {
  return await prisma.user.findMany({
    where: {
      deletedAt: null
    },
    select: {
      id: true,
      name: true
    }
  });
});
