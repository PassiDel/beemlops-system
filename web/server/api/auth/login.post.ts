import { useValidatedBody, z } from 'h3-zod';
import { verify } from 'argon2';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const { passwordMinLength } = useRuntimeConfig(event as any).public;

  const { email, password } = await useValidatedBody(
    event,
    z.object({
      email: z.string().email().min(5),
      password: z.string().min(passwordMinLength)
    })
  );

  let user: { id: number; password: string; name: string };
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        deletedAt: null,
        email
      },
      select: {
        id: true,
        password: true,
        name: true
      }
    });
  } catch (e) {
    console.warn(`Failed login attempted: Unknown email: ${email}`);
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (!(await verify(user.password, password))) {
    console.warn(`Failed login attempted: Wrong password: ${email}`);
    throw createError({ status: 404, statusText: 'Not found!' });
  }

  console.warn(`Successful login attempted: ${email}`);
  await setUserSession(event as any, {
    user: {
      id: user.id,
      name: user.name
    },
    loggedInAt: new Date()
  });

  return { success: true, user: { id: user.id } };
});
