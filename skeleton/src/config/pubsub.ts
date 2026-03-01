export const pubsubConfig = {
{% if values.pubsubProvider == 'kafka' -%}
  provider: 'kafka' as const,
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || '${{ values.name }}',
    groupId: process.env.KAFKA_GROUP_ID || '${{ values.name }}-group',
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: process.env.KAFKA_SASL_MECHANISM
      ? {
          mechanism: process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512',
          username: process.env.KAFKA_SASL_USERNAME || '',
          password: process.env.KAFKA_SASL_PASSWORD || '',
        }
      : undefined,
  },
{% elif values.pubsubProvider == 'redis' -%}
  provider: 'redis' as const,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
{% elif values.pubsubProvider == 'rabbitmq' -%}
  provider: 'rabbitmq' as const,
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || '${{ values.name }}-exchange',
    queue: process.env.RABBITMQ_QUEUE || '${{ values.name }}-queue',
  },
{% else -%}
  provider: 'none' as const,
{% endif -%}
};
