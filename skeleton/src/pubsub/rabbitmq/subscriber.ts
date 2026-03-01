{% if values.pubsubProvider == 'rabbitmq' -%}
import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

export type RabbitMessageHandler = (message: ConsumeMessage) => Promise<void>;

/**
 * RabbitMQ Subscriber - consume messages from RabbitMQ queues.
 *
 * Usage:
 *   const subscriber = new RabbitSubscriber();
 *   await subscriber.connect();
 *   await subscriber.subscribe('routing.key.#', async (msg) => {
 *     console.log(JSON.parse(msg.content.toString()));
 *   });
 */
export class RabbitSubscriber {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private exchange: string;
  private queue: string;

  constructor() {
    this.exchange = pubsubConfig.rabbitmq!.exchange;
    this.queue = pubsubConfig.rabbitmq!.queue;
  }

  async connect(): Promise<void> {
    const url = pubsubConfig.rabbitmq!.url;

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.queue, { durable: true });

    logger.info('RabbitMQ subscriber connected', { exchange: this.exchange, queue: this.queue });
  }

  async subscribe(routingKey: string, handler: RabbitMessageHandler): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ subscriber not connected');

    await this.channel.bindQueue(this.queue, this.exchange, routingKey);

    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;

      try {
        await handler(msg);
        this.channel!.ack(msg);
      } catch (error) {
        logger.error('Error processing RabbitMQ message', { error: (error as Error).message });
        this.channel!.nack(msg, false, true); // requeue
      }
    });

    logger.info('RabbitMQ consuming', { queue: this.queue, routingKey });
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    logger.info('RabbitMQ subscriber disconnected');
  }
}
{% else -%}
export {};
{% endif -%}
