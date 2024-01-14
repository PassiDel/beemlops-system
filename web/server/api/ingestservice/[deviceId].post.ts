import { useValidatedBody, useValidatedParams, z, zh } from 'h3-zod';
import { Point } from '@influxdata/influxdb-client';
import { prisma } from '~/server/utils/prisma';
import { useRuntimeConfig } from '#imports';

async function validateDevice(deviceId) {
  const device = await prisma.device.findUniqueOrThrow({
    where: {
      id: deviceId
    }
  });

  if (!device) {
    throw createError({
      status: HTTP_NOT_FOUND,
      statusText: `Device ${deviceId} not found!`
    });
  }

  return device;
}

async function validateKey(event, device) {
  const requestKey = await useValidatedBody(
    event,
    z.object({ key: z.string() })
  );

  if (!requestKey || device.key !== requestKey.key) {
    throw createError({
      status: HTTP_UNAUTHORIZED,
      statusText: 'Unauthorized: Key is wrong!'
    });
  }
}

async function resolveSensorKeys(deviceId) {
  const sensors = await prisma.deviceSensor.findMany({
    where: {
      deviceId
    }
  });

  return Promise.all(
    sensors.map(async (sensor) => {
      if (sensor.key) {
        return sensor.key;
      } else {
        const sensorEntity = await prisma.sensor.findUniqueOrThrow({
          where: {
            id: sensor.sensorId
          }
        });
        return sensorEntity.name;
      }
    })
  );
}

async function writeToInflux(event: any, jsonData) {
  const { influxBucket, influxOrg } = useRuntimeConfig(event as any);
  const writeClient = influxDB.getWriteApi(influxOrg, influxBucket);

  const point = new Point('measurement').tag('tag', 'test');

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

  try {
    const device = await validateDevice(deviceId);
    await validateKey(event, device);

    const sensorKeys = await resolveSensorKeys(deviceId);
    const bodySchema = z.object(
      Object.fromEntries(
        sensorKeys.map((key) => {
          return [key, z.number()];
        })
      )
    );
    const jsonData = await useValidatedBody(event, bodySchema);

    await writeToInflux(event, jsonData);

    return jsonData;
  } catch (e) {
    console.log({ e });
    throw createError({
      status: 404,
      statusText: `Not found!`
    });
  }
});
