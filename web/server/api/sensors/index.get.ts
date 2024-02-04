import { prisma } from '~/server/utils/prisma';

export default defineCachedEventHandler(
  () =>
    prisma.sensor.findMany({
      select: {
        id: true,
        name: true,
        unit: true
      }
    }),
  {
    swr: true,
    maxAge: 24 * 60 * 60 // 24h
  }
);
