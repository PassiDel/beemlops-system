import { Connection } from 'rabbitmq-client';
import { config } from 'dotenv';

config({ path: '../.env' });

// Initialize:
export const rabbit = new Connection(process.env.NUXT_RABBIT_URL);

rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err);
});
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established');
});
