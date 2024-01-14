import { subject } from '@casl/ability';
import { prisma } from '~/server/utils/prisma';
import { teamDto } from '~/server/dto/team';
import { useAbility } from '~/server/casl';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);

  const loggedInUser = (await getUserSession(event as any)).user;

  const teams = await prisma.team.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          creatorId: loggedInUser.id
        },
        {
          users: {
            some: {
              userId: loggedInUser.id
            }
          }
        }
      ]
    },
    include: {
      users: {
        include: {
          user: true
        }
      },
      creator: true
    }
  });

  return teams.map((t) => ({
    ...teamDto(t),
    isCreator: useAbility(event).can('update', subject('Team', t))
  }));
});
