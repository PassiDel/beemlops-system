import { defineAbilityFor } from '~/server/casl';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event as any);

  event.context.ability =
    session && session.user
      ? defineAbilityFor(session.user)
      : defineAbilityFor(null);
});
