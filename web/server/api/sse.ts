export default defineEventHandler(async (event) => {
  const session = await getUserSession(event as any);
  useSSE(event, session?.user?.id);
});
