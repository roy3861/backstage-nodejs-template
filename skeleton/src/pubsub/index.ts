{% if values.pubsubProvider == 'kafka' -%}
export { KafkaProducer } from './kafka/producer';
export { KafkaConsumer } from './kafka/consumer';
{% elif values.pubsubProvider == 'redis' -%}
export { RedisPublisher } from './redis/publisher';
export { RedisSubscriber } from './redis/subscriber';
{% elif values.pubsubProvider == 'rabbitmq' -%}
export { RabbitPublisher } from './rabbitmq/publisher';
export { RabbitSubscriber } from './rabbitmq/subscriber';
{% else -%}
// No pub/sub provider configured.
export {};
{% endif -%}
