import { useValidatedBody, z } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { slug } = await useValidatedBody(
    event,
    z.object({
      slug: z
        .string()
        .min(7)
        .max(64)
        .regex(/^[a-z0-9-]{7,64}$/)
    })
  );

  const hive = await prisma.hive.findUnique({
    where: {
      slug
    },
    select: {
      id: true
    }
  });
  if (hive) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }
  return { available: true };
});
