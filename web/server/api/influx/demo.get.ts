import { Point } from '@influxdata/influxdb-client';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const { influxBucket, influxOrg } = useRuntimeConfig(event as any);
  const ping = await pingAPI
    .getPing()
    .then(() => true)
    .catch((e) => {
      console.error(e);
      return false;
    });

  const writeClient = influxDB.getWriteApi(influxOrg, influxBucket);

  // TODO: data structure
  const point = new Point('measurement')
    .tag('tag', 'test')
    .floatField('val', Math.random());

  writeClient.writePoint(point);
  await writeClient.flush();
  await writeClient.close();

  const queryClient = influxDB.getQueryApi(influxOrg);
  const query = `from(bucket: "${influxBucket}")
 |> range(start: -30m)
 |> mean()`;

  const res = await queryClient.collectRows(query, (values, tableMeta) =>
    tableMeta.toObject(values)
  );

  return {
    ping,
    point,
    res
  };
});
