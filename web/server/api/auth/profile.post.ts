import { useValidatedBody, z } from 'h3-zod';
import { prisma, useRuntimeConfig } from '#imports';
import { useAbility } from '~/server/casl';
import { subject } from '@casl/ability';
import { hash } from 'argon2';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { passwordMinLength } = useRuntimeConfig(event as any).public;

  const loggedInUser = (await getUserSession(event as any)).user;

  const user = await prisma.user.findUnique({
    where: {
      deletedAt: null,
      id: loggedInUser.id
    }
  });
  if (!user) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (useAbility(event).cannot('update', subject('User', user))) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  const { email, password, name } = await useValidatedBody(
    event,
    z.object({
      email: z.string().email().min(5).default(user.email),
      password: z
        .string()
        .min(passwordMinLength)
        .nullish()
        .or(z.string().max(0)),
      name: z.string().max(64).default(user.name)
    })
  );

  await prisma.user.update({
    where: { id: loggedInUser.id },
    data: {
      email,
      name,
      password: password ? await hash(password) : undefined
    }
  });
  return true;
});
