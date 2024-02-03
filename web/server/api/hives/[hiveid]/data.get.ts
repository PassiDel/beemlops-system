import { useValidatedParams, useValidatedQuery, z } from 'h3-zod';
import { subject } from '@casl/ability';
import { subDays } from 'date-fns';
import { prisma } from '~/server/utils/prisma';
import { useAbility } from '~/server/casl';
import { useRuntimeConfig } from '#imports';
import { slugString, ufoDate } from '~/server/utils/zod';

export function restructureGraphData(
  res: { _time: any; _field: any; device: any; _value: any }[]
) {
  return res.reduce(
    (a, r) => {
      const did = parseInt(r.device);
      const data = { x: r._time, y: r._value };
      const dI = a.findIndex((d) => d.id === did);
      const key = r._field;
      if (dI < 0) {
        a.push({
          id: did,
          keys: [
            {
              key,
              data: [data]
            }
          ]
        });
        return a;
      }
      const kI = a[dI].keys.findIndex((k) => k.key === key);
      if (kI < 0) {
        a[dI].keys.push({
          key,
          data: [data]
        });
        return a;
      }

      a[dI].keys[kI].data.push(data);

      return a;
    },
    [] as {
      id: number;
      keys: { key: string; data: { x: string; y: number }[] }[];
    }[]
  );
}

export default defineCachedEventHandler(
  async (event) => {
    await requireUserSession(event as any);
    const { hiveid } = await useValidatedParams(
      event as any,
      z.object({
        hiveid: slugString
      })
    );

    const hive = await prisma.hive.findUnique({
      where: {
        deletedAt: null,
        slug: hiveid
      },
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
        },
        device: true
      }
    });
    if (!hive) {
      throw createError({ status: 404, statusText: 'Not found!' });
    }
    if (
      useAbility(event as any).cannot(
        'read',
        subject('Team', hive.location.team)
      )
    ) {
      throw createError({ status: 403, statusText: 'Not allowed!' });
    }
    const { influxBucket, influxOrg } = useRuntimeConfig(event as any);

    const { start, end } = await useValidatedQuery(
      event as any,
      z.object({
        start: ufoDate.default(subDays(new Date(), 1).toISOString()),
        end: ufoDate.default(new Date().toISOString())
      })
    );

    // TODO: make dynamic / calculate from window
    const every = '1m';
    const deviceFilter = hive.device
      .map((d) => `r["device"] == "${d.id}"`)
      .join(' or ');
    const queryClient = influxDB.getQueryApi(influxOrg);
    const query = `from(bucket: "${influxBucket}")
 |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => r["_measurement"] == "measurement")
  |> filter(fn: (r) => ${deviceFilter})
  |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)`;

    return await queryClient
      .collectRows(query, (values, tableMeta) => {
        const { _time, _field, device, _value } = tableMeta.toObject(values);
        return { _time, _field, device, _value };
      })
      .catch(() => [])
      .then(restructureGraphData);
  },
  { swr: true, maxAge: 60 }
);
