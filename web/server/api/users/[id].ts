import { useValidatedParams, z, zh } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const { id } = await useValidatedParams(
    event,
    z.object({
      id: zh.intAsString
    })
  );
  try {
    return await prisma.user.findUniqueOrThrow({
      where: {
        deletedAt: null,
        id
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
  } catch (e) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
});
