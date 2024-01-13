import { useValidatedBody, useValidatedParams, z, zh } from "h3-zod";
import { prisma } from "~/server/utils/prisma";
import { useRuntimeConfig } from "#imports";
import { Point } from "@influxdata/influxdb-client";

export default defineEventHandler(async (event) => {
  const { deviceId } = await useValidatedParams(event, {
    deviceId: zh.intAsString
  });

  try {
    const device = await prisma.device.findUniqueOrThrow({
      where: {
        id: deviceId
      }
    });

    if (!device) {
      throw createError({
        status: 404,
        statusText: `Device ${deviceId} not found!`
      });
    }

    const requestKey = await useValidatedBody(event, z.object({ key: z.string() }));

    if (!requestKey || device.key !== requestKey.key) {
      throw createError({
        status: 401,
        statusText: "Unauthorized: Key is wrong!"
      });
    }

    const sensors = await prisma.deviceSensor.findMany({
      where: {
        deviceId: deviceId
      }
    });

    const sensorKeys = sensors.map(async (sensor) => {
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
    });

    const resolvedSensorKeys = await Promise.all(sensorKeys);

    const bodySchema = z.object(
      Object.fromEntries(
        resolvedSensorKeys.map((key) => {
          return [key, z.number()];
        })
      )
    );

    const jsonData = await useValidatedBody(event, bodySchema);

    const { influxBucket, influxOrg } = useRuntimeConfig(event as any);
    const writeClient = influxDB.getWriteApi(influxOrg, influxBucket);

    const point = new Point("measurement")
      .tag("tag", "test")

    for (const [key, value] of Object.entries(jsonData)) {
      point.floatField(key, value);
    }

    writeClient.writePoint(point);
    await writeClient.flush();
    await writeClient.close();

    return jsonData

  } catch (e) {
    console.log({ e });
    throw createError({
      status: 404,
      statusText: `Not found!`
    });
  }
});

