import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

/**
 * Kafka Producer - publish messages to Kafka topics.
 *
 * Usage:
 *   const producer = new KafkaProducer();
 *   await producer.connect();
 *   await producer.publish('my-topic', { key: 'id', value: JSON.stringify(data) });
 *   await producer.disconnect();
 */
export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    const kafkaConfig = pubsubConfig.kafka!;

    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
      ...(kafkaConfig.ssl && { ssl: true }),
      ...(kafkaConfig.sasl && { sasl: kafkaConfig.sasl }),
    });

    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    logger.info('Kafka producer connected');
  }

  async publish(topic: string, messages: ProducerRecord['messages']): Promise<void> {
    await this.producer.send({ topic, messages });
    logger.debug('Kafka message published', { topic, count: messages.length });
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    logger.info('Kafka producer disconnected');
  }
}
