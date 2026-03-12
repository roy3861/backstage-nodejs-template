import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

/**
 * Kafka Consumer - subscribe to Kafka topics and process messages.
 *
 * Usage:
 *   const consumer = new KafkaConsumer();
 *   await consumer.connect();
 *   await consumer.subscribe('my-topic');
 *   await consumer.consume(async ({ topic, message }) => {
 *     console.log(message.value?.toString());
 *   });
 */
export class KafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    const kafkaConfig = pubsubConfig.kafka!;

    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
      ...(kafkaConfig.ssl && { ssl: true }),
      ...(kafkaConfig.sasl && { sasl: kafkaConfig.sasl }),
    });

    this.consumer = this.kafka.consumer({ groupId: kafkaConfig.groupId });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    logger.info('Kafka consumer connected');
  }

  async subscribe(topic: string, fromBeginning = false): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning });
    logger.info('Kafka consumer subscribed', { topic });
  }

  async consume(handler: MessageHandler): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await handler(payload);
        } catch (error) {
          logger.error('Error processing Kafka message', {
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            error: (error as Error).message,
          });
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  }
}
