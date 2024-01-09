import { useValidatedBody, z } from 'h3-zod';
import Influx from 'influx';

// InfluxDB-Verbindungskonfiguration
/*const influx = new Influx.InfluxDB({
  host: 'http://system_influx:8086',
  database: 'your_influxdb_database',
  schema: [
    {
      measurement: 'sensor_data',
      fields: {
        temperature: Influx.FieldType.FLOAT,
        humidity: Influx.FieldType.FLOAT,
        pressure: Influx.FieldType.FLOAT,
        weight_kg: Influx.FieldType.FLOAT,
        rssi: Influx.FieldType.INTEGER
      },
      tags: ['sensorId']
    }
  ]
});*/

export default defineEventHandler(async (event) => {
  const { t1, t2, t3, t4, t5, t, h, p, weight_kg, rssi } =
    await useValidatedBody(
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
    await Influx.writePoints([
      {
        measurement: 'measured_values',
        tags: { sensorId: 'your_sensor_id' },
        fields: {
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
      }
    ]);

    console.log(`Data received and stored successfully for device ID: ${t1}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw createError({
      status: 500,
      statusText: 'Error storing data in the database'
    });
  }
});
