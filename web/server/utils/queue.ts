import { Connection } from 'rabbitmq-client';
import { useRuntimeConfig } from '#imports';

const { rabbitUrl } = useRuntimeConfig();
export const rabbit = new Connection(rabbitUrl);

rabbit.on('error', (err) => {
  console.error('RabbitMQ connection error', err);
});
rabbit.on('connection', () => {
  console.log('RabbitMQ Connection successfully (re)established');
});

export const pub = rabbit.createPublisher({
  // Enable publish confirmations, similar to consumer acknowledgements
  confirm: true,
  // Enable retries
  maxAttempts: 2,
  // Optionally ensure the existence of an exchange before we use it
  exchanges: [{ exchange: 'my-events', type: 'topic' }]
});

export const rpcClient = rabbit.createRPCClient({ confirm: true });
