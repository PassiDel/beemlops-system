export default cachedEventHandler(
  () => `Response generated at ${new Date().toISOString()}`,
  {
    swr: true,
    maxAge: 10
  }
);
