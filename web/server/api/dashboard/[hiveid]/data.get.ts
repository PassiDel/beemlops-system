import { prisma } from '~/server/utils/prisma';
import { useValidatedParams, z } from 'h3-zod';
import { useAbility } from '~/server/casl';
import { subject } from '@casl/ability';
import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';
import { QueryApi } from '@influxdata/influxdb-client';
import { restructureGraphData } from '~/server/api/hives/[hiveid]/data.get';

const getTotal = defineCachedFunction(
  async (
    hive: { id: number },
    influxBucket: string,
    deviceFilter: string,
    sensorFilter: string,
    queryClient: QueryApi
  ) => {
    const query = `from(bucket: "${influxBucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r["_measurement"] == "measurement")
  |> filter(fn: (r) => ${deviceFilter})
  |> filter(fn: (r) => ${sensorFilter})
  |> count()`;

    console.log(`Calculate dashboard total for hive=${hive.id}`);

    return await queryClient
      .collectRows(query, (values, tableMeta) => {
        const { _value } = tableMeta.toObject(values);
        return { _value };
      })
      .catch(() => [{ _value: 0 }])
      .then((res) =>
        res.length > 0 ? res.sort((a, b) => a._value - b._value)[0]._value : 0
      );
  },
  {
    maxAge: 60 * 60,
    name: 'hiveDashboardTotal',
    getKey: (hive: { id: number }) => hive.id.toString()
  }
);
const getLast = defineCachedFunction(
  async (
    hive: { id: number },
    influxBucket: string,
    deviceFilter: string,
    sensorFilter: string,
    queryClient: QueryApi
  ) => {
    const query = `from(bucket: "${influxBucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r["_measurement"] == "measurement")
  |> filter(fn: (r) => ${deviceFilter})
  |> filter(fn: (r) => ${sensorFilter})
  |> last()`;

    console.log(`Calculate dashboard last for hive=${hive.id}`);

    return await queryClient
      .collectRows(query, (values, tableMeta) => {
        const { _time, _field, device, _value } = tableMeta.toObject(values);
        return { _time, _field, device, _value };
      })
      .catch(() => [])
      .then((res) =>
        res.length > 0
          ? res
              .map((r) => new Date(r._time as string))
              .sort((a, b) => b.getTime() - a.getTime())[0]
          : null
      );
  },
  {
    maxAge: 60,
    name: 'hiveDashboardLast',
    getKey: (hive: { id: number }) => hive.id.toString()
  }
);
const get24 = defineCachedFunction(
  async (
    hive: { id: number },
    influxBucket: string,
    deviceFilter: string,
    sensorFilter: string,
    queryClient: QueryApi
  ) => {
    const query = `from(bucket: "${influxBucket}")
  |> range(start: -1d)
  |> filter(fn: (r) => r["_measurement"] == "measurement")
  |> filter(fn: (r) => ${deviceFilter})
  |> filter(fn: (r) => ${sensorFilter})
  |> count()`;

    console.log(`Calculate dashboard 24h total for hive=${hive.id}`);

    return await queryClient
      .collectRows(query, (values, tableMeta) => {
        const { _value } = tableMeta.toObject(values);
        return { _value };
      })
      .catch(() => [{ _value: 0 }])
      .then((res) =>
        res.length > 0 ? res.sort((a, b) => a._value - b._value)[0]._value : 0
      );
  },
  {
    maxAge: 60,
    name: 'hiveDashboard24',
    getKey: (hive: { id: number }) => hive.id.toString()
  }
);
const getGraph = defineCachedFunction(
  async (
    hive: { id: number },
    influxBucket: string,
    deviceFilter: string,
    sensorFilter: string,
    queryClient: QueryApi
  ) => {
    const query = `from(bucket: "${influxBucket}")
  |> range(start: -1d)
  |> filter(fn: (r) => r["_measurement"] == "measurement")
  |> filter(fn: (r) => ${deviceFilter})
  |> filter(fn: (r) => ${sensorFilter})
  |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)`;

    console.log(`Calculate dashboard 24h total for hive=${hive.id}`);

    return await queryClient
      .collectRows(query, (values, tableMeta) => {
        const { _time, _field, device, _value } = tableMeta.toObject(values);
        return { _time, _field, device, _value };
      })
      .catch(() => [])
      .then(restructureGraphData);
  },
  {
    maxAge: 60 * 5,
    name: 'hiveDashboard24Graph',
    getKey: (hive: { id: number }) => hive.id.toString()
  }
);

async function getLastDate(
  hive: { id: number; device: { id: number }[] },
  sensors: {
    id: number;
    name: string | null;
    deviceId: number;
    sensorId: number;
    key: string;
    sensor: { id: number; name: string; unit: string };
  }[],
  event: H3Event
) {
  const { influxBucket, influxOrg } = useRuntimeConfig(event as any);

  const queryClient = influxDB.getQueryApi(influxOrg);
  const deviceFilter = hive.device
    .map((d) => `r["device"] == "${d.id}"`)
    .join(' or ');
  const sensorFilter = sensors
    .map((d) => `r["_field"] == "${d.key}"`)
    .join(' or ');

  const [last, last24, total, data] = await Promise.all([
    getLast(hive, influxBucket, deviceFilter, sensorFilter, queryClient).catch(
      () => null
    ),
    get24(hive, influxBucket, deviceFilter, sensorFilter, queryClient).catch(
      () => 0
    ),
    getTotal(hive, influxBucket, deviceFilter, sensorFilter, queryClient).catch(
      () => 0
    ),
    getGraph(hive, influxBucket, deviceFilter, sensorFilter, queryClient).catch(
      () => []
    )
  ]);

  const sensor = {
    ...(sensors[0] || { sensor: { id: 0, name: '', unit: '' } }).sensor,
    devices: sensors.map(({ id, name, key, deviceId }) => ({
      id,
      name,
      key,
      deviceId
    }))
  };
  return { total: { last, last24, total }, data, sensor };
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event as any);
  const { hiveid } = await useValidatedParams(
    event as any,
    z.object({
      hiveid: z.string().max(64)
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
      device: {
        where: {
          DeviceSensor: {
            some: {
              sensor: {
                name: {
                  startsWith: 'temp'
                }
              }
            }
          }
        },
        include: {
          DeviceSensor: {
            include: {
              sensor: true
            }
          }
        }
      }
    }
  });
  if (!hive) {
    throw createError({ status: 404, statusText: 'Not found!' });
  }
  if (
    useAbility(event as any).cannot('read', subject('Team', hive.location.team))
  ) {
    throw createError({ status: 403, statusText: 'Not allowed!' });
  }
  const sensors = hive.device.flatMap((d) =>
    d.DeviceSensor.filter((ds) => ds.sensor.name.startsWith('temp'))
  );
  return await getLastDate(hive, sensors, event as any);
});
