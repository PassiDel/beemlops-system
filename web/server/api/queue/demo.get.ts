import { pub, rpcClient } from '~/server/utils/queue';

export default defineEventHandler(async () => {
  // Send message into queue, no response
  await pub.send(
    {
      exchange: 'my-events',
      routingKey: 'users.visit'
    },
    { id: 0, name: 'Alan Turing', date: new Date() }
  );

  // RPC-Call: send body into queue, receive message back
  const res = await rpcClient
    .send('my-rpc-queue', 'ping')
    .then<string>((b) => b.body);

  return {
    res
  };
});
