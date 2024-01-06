import { useValidatedParams, z, zh } from 'h3-zod';
import { prisma } from '~/server/utils/prisma';
import { subject } from '@casl/ability';
import { userDto, userFullDto } from '~/server/dto/user';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { id } = await useValidatedParams(
    event,
    z.object({
      id: zh.intAsString.or(z.literal('me'))
    })
  );

  const loggedInUser = (await getUserSession(event as any)).user;

  const user = await prisma.user.findUnique({
    where: {
      deletedAt: null,
      id: typeof id === 'number' ? id : loggedInUser.id
    }
  });
  if (!user) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('read', subject('User', user))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }
  return useAbility(event).can('read:full', subject('User', user))
    ? userFullDto(user)
    : userDto(user);
});
