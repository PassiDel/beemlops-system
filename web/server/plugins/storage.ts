import redisDriver from 'unstorage/drivers/redis';

export default defineNitroPlugin(async () => {
  const storage = useStorage();

  const { redisHost, redisPassword } = useRuntimeConfig();

  const redisOpts = {
    host: redisHost,
    password: redisPassword,
    port: 6379
  };

  const cacheDriver = redisDriver({
    base: 'cache',
    ...redisOpts
  });
  const memDriver = redisDriver({
    base: 'mem',
    ...redisOpts
  });
  await storage.unmount('cache');

  storage.mount('cache', cacheDriver);
  storage.mount('mem', memDriver);
});
