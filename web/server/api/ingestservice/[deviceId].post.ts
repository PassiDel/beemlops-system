import { useValidatedBody, useValidatedParams, z, zh } from 'h3-zod';
import { Point } from '@influxdata/influxdb-client';
import type { H3Event } from 'h3';
import { prisma } from '~/server/utils/prisma';
import { useRuntimeConfig } from '#imports';

async function validateDevice(deviceId: number) {
  const device = await prisma.device.findUnique({
    where: {
      id: deviceId,
      deletedAt: null
    },
    select: {
      key: true,
      DeviceSensor: {
        select: {
          key: true
        }
      }
    }
  });

  if (!device) {
    throw createError({
      status: 404,
      statusText: `Device ${deviceId} not found!`
    });
  }

  return device;
}

async function validateKey(event: H3Event, device: { key: string }) {
  const requestKey = await useValidatedBody(
    event,
    z.object({ key: z.string() })
  );

  if (!requestKey || device.key !== requestKey.key) {
    throw createError({
      status: 403,
      statusText: 'Unauthorized: Key is wrong!'
    });
  }
}

async function writeToInflux(
  event: H3Event,
  deviceId: number,
  jsonData: Record<string, number>
) {
  const { influxBucket, influxOrg } = useRuntimeConfig(event as any);
  const writeClient = influxDB.getWriteApi(influxOrg, influxBucket);

  const point = new Point('measurement').tag('device', deviceId.toString());

  for (const [key, value] of Object.entries(jsonData)) {
    point.floatField(key, value);
  }

  writeClient.writePoint(point);
  await writeClient.flush();
  await writeClient.close();
}

export default defineEventHandler(async (event) => {
  const { deviceId } = await useValidatedParams(event, {
    deviceId: zh.intAsString
  });

  const device = await validateDevice(deviceId);
  await validateKey(event, device);

  const sensorKeys = device.DeviceSensor.map(
    (deviceSensor) => deviceSensor.key
  );
  const bodySchema = z.object(
    Object.fromEntries(
      sensorKeys.map((key: string) => {
        return [key, z.number()];
      })
    )
  );
  const jsonData = await useValidatedBody(event, bodySchema);

  await writeToInflux(event, deviceId, jsonData);

  return jsonData;
});
