import { useValidatedParams, z, zh } from 'h3-zod';
import { subject } from '@casl/ability';
import { useAbility } from '~/server/casl';
import { inspectionHiveDto } from '~/server/dto/inspection';

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { inspectionid } = await useValidatedParams(
    event,
    z.object({
      inspectionid: zh.intAsString
    })
  );

  const inspection = await prisma.inspection.findUnique({
    where: {
      id: inspectionid
    },
    include: {
      hive: {
        include: {
          location: {
            include: {
              team: {
                include: {
                  users: {
                    include: {
                      user: true
                    }
                  },
                  creator: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!inspection) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (
    useAbility(event).cannot(
      'read',
      subject('Team', inspection.hive.location.team)
    )
  ) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }

  return inspectionHiveDto(inspection);
});
