import { useValidatedBody, z } from 'h3-zod';
import { useRuntimeConfig } from '#imports';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) = {
  const { t1, t2, t3, t4, t5 , temperature, humidity, pressure, weight_kg, rssi } = await useValidatedBody(
    event,
    z.object({
      t1: z.number(),
      t2: z.number(),
      t3: z.number(),
      t4: z.number(),
      t5: z.number(),
      // temperature
      t: z.number(),
      // humidity
      h: z.number(),
      // pressure
      p: z.number(),
      weight_kg: z.number(),
      rssi: z.number()
    })
  );

  try {
    const sensorData = await prisma.sensorData.create({
      data: {
        temperature1: t1,
        temperature2: t2,
        temperature3: t3,
        temperature4: t4,
        temperature5: t5,
        temperature: t,
        humidity: h,
        pressure: p,
        weightKg: weight_kg,
        rssi: rssi
      }
    });

    console.log(`Data received and stored successfully for sensor ID: ${sensorData.sensorId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw createError({
      status: 500,
      statusText: 'Error storing data in the database'
    });
  }

})