import { InfluxDB } from '@influxdata/influxdb-client';
import { PingAPI } from '@influxdata/influxdb-client-apis';
import { useRuntimeConfig } from '#imports';

const { influxUrl, influxToken } = useRuntimeConfig();
export const influxDB = new InfluxDB({
  url: influxUrl,
  timeout: 10_000,
  token: influxToken
});

export const pingAPI = new PingAPI(influxDB);
