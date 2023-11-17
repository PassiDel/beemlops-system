import { useValidatedBody, z } from 'h3-zod';
import { hash } from 'argon2';
import { useRuntimeConfig } from '#imports';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  const { passwordMinLength } = useRuntimeConfig(event).public;

  const { email, password, name } = await useValidatedBody(
    event,
    z.object({
      email: z.string().email().min(5),
      password: z.string().min(passwordMinLength),
      name: z.string().max(64),
      accept: z.literal(true)
    })
  );

  const exists = await prisma.user.findUnique({
    where: {
      email
    },
    select: { id: true }
  });

  if (exists !== null) {
    throw createError({
      status: 409,
      statusText: 'User with that email already exists!'
    });
  }

  const passwordHash = await hash(password);

  const { id } = await prisma.user.create({
    data: {
      password: passwordHash,
      name,
      email
    }
  });
  console.warn(`Successful register: ${email}`);

  await setUserSession(event, {
    user: {
      id,
      name
    },
    loggedInAt: new Date()
  });

  return { success: true, user: { id } };
});
