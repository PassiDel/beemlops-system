import { prisma } from '~/server/utils/prisma';

async function getHives(userId: number) {
  const hives = await prisma.hive.findMany({
    where: {
      deletedAt: null,
      location: {
        deletedAt: null,
        team: {
          deletedAt: null,
          OR: [
            {
              creatorId: userId
            },
            {
              users: {
                some: {
                  userId
                }
              }
            }
          ]
        }
      }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      location: {
        select: {
          slug: true,
          team: {
            select: {
              slug: true
            }
          }
        }
      }
    }
  });

  return hives.map(({ id, slug, name, location }) => ({
    id,
    slug,
    name,
    location: location.slug,
    team: location.team.slug
  }));
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);

  const loggedInUser = (await getUserSession(event as any)).user;

  const hives = await getHives(loggedInUser.id);

  // TODO: add more data for other cards
  return {
    hives
  };
});
