import { H3Event } from 'h3';
import { createHooks } from 'hookable';
import { Redis } from 'ioredis';
import { z } from 'h3-zod';

export interface Events {
  notify: {
    title: string;
    message: string;
    color?: string;
    link?: string;
  };
}

type ServerSentEvent = Record<
  'sse:event' | `sse:event:${number}`,
  <K extends keyof Events>(eventName: K, data: Events[K]) => void
>;

export const sseHooks = createHooks<ServerSentEvent>();

export const useSSE = (
  event: H3Event,
  userId: number | undefined,
  addGlobal = true,
  pingIntervalMs = 10_000
) => {
  setHeader(event, 'content-type', 'text/event-stream');
  setHeader(event, 'cache-control', 'no-cache');
  setHeader(event, 'connection', 'keep-alive');
  setResponseStatus(event, 200);
  event.node.res.write(`retry: ${Math.ceil(pingIntervalMs * 1.5)}\n\n`);
  event.node.res.flushHeaders();
  console.log(`Start SSE for id=${userId || '/'}`);

  let id = 0;

  const send: ServerSentEvent[keyof ServerSentEvent] = (eventName, data) => {
    event.node.res.write(`id: ${id++}\n`);
    if (eventName) {
      event.node.res.write(`event: ${eventName}\n`);
    }
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
    event.node.res.flushHeaders();
  };
  if (userId) {
    sseHooks.hook(`sse:event:${userId}`, send);
  }
  if (addGlobal) {
    sseHooks.hook('sse:event', send);
  }

  const close = () => {
    event.node.res.end();
    clearInterval(interval);
  };

  event._handled = true;
  event.node.req.on('close', close);

  const interval = setInterval(() => {
    event.node.res.write(`:\n`);
    event.node.res.flushHeaders();
  }, pingIntervalMs);

  return { close };
};

const { redisHost, redisPassword } = useRuntimeConfig();
const redisSub = new Redis(6379, redisHost, { password: redisPassword });
const redisPub = redisSub.duplicate();

redisSub.subscribe('sse', (err, count) => {
  if (!err) {
    console.log('Redis pub/sub connected, sub count: ', count);
    return;
  }
  console.error('Redis pub/sub error: ', err);
});
redisSub.on('message', async (_, message) => {
  try {
    const { hook, eventName, payload } = z
      .object({
        hook: z.string().transform((s) => s as keyof ServerSentEvent),
        eventName: z.string().transform((s) => s as keyof Events),
        payload: z.any()
      })
      .parse(JSON.parse(message));
    // Emit event to all clients, connected to this app server
    await sseHooks.callHook(hook, eventName, payload);
  } catch (_) {}
});

// Emit event to redis, to all app servers
export const emitRedis = <K extends keyof Events>(
  hook: keyof ServerSentEvent,
  eventName: K,
  payload: Events[K]
) => {
  console.log(`Publish ${eventName} for ${hook}`);
  redisPub.publish('sse', JSON.stringify({ hook, eventName, payload }));
};
