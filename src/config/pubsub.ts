type KafkaSasl =
  | { mechanism: 'plain'; username: string; password: string }
  | { mechanism: 'scram-sha-256'; username: string; password: string }
  | { mechanism: 'scram-sha-512'; username: string; password: string };

function parseKafkaSasl(): KafkaSasl | undefined {
  const mechanism = process.env.KAFKA_SASL_MECHANISM;
  const username = process.env.KAFKA_SASL_USERNAME || '';
  const password = process.env.KAFKA_SASL_PASSWORD || '';

  switch (mechanism) {
    case 'plain':
      return { mechanism: 'plain', username, password };
    case 'scram-sha-256':
      return { mechanism: 'scram-sha-256', username, password };
    case 'scram-sha-512':
      return { mechanism: 'scram-sha-512', username, password };
    default:
      return undefined;
  }
}

export const pubsubConfig = {
  provider: (process.env.PUBSUB_PROVIDER || 'kafka') as 'kafka' | 'redis' | 'rabbitmq',
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'example-service',
    groupId: process.env.KAFKA_GROUP_ID || 'example-service-group',
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: parseKafkaSasl(),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'example-service.exchange',
    queue: process.env.RABBITMQ_QUEUE || 'example-service.queue',
  },
};
