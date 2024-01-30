import { useValidatedBody, z } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';
import { slugString } from '~/server/utils/zod';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { slug, id } = await useValidatedBody(
    event,
    z.object({
      slug: slugString,
      id: z.number().int().optional()
    })
  );

  const team = await prisma.team.findUnique({
    where: {
      slug,
      NOT: {
        id
      }
    },
    select: {
      id: true
    }
  });
  if (team) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }
  return { available: true };
});
