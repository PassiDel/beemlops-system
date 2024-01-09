import { rabbit } from '../connection.js';
import { prisma } from '../prisma.js';

const sub = rabbit.createConsumer(
  {
    queue: 'user-register',
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
    exchanges: [{ exchange: 'my-events', type: 'topic' }],
    queueBindings: [{ exchange: 'my-events', routingKey: 'user.register' }]
  },
  async (msg) => {
    const { id } = msg.body as { id: number };
    const { email } = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: { email: true }
    });

    console.log('received user register email:', email);
    // TODO: send email verification
  }
);

sub.on('error', (err) => {
  // Maybe the consumer was cancelled, or the connection was reset before a
  // message could be acknowledged.
  console.log('consumer error (user-register)', err);
});

process.on('SIGINT', sub.close);
process.on('SIGTERM', sub.close);
