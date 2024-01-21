import { useValidatedBody, z } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { slugString } from '~/server/utils/zod';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  if (useAbility(event).cannot('create', 'Team')) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }
  const { slug, name } = await useValidatedBody(
    event,
    z.object({
      slug: slugString,
      name: z.string().max(64).trim()
    })
  );

  const loggedInUser = (await getUserSession(event as any)).user;

  try {
    return await prisma.team.create({
      data: {
        slug,
        name,
        creatorId: loggedInUser.id,
        users: {
          create: {
            userId: loggedInUser.id
          }
        }
      },
      select: {
        slug: true
      }
    });
  } catch (_) {
    throw createError({ status: 409, statusText: 'Slug already in use!' });
  }
});
