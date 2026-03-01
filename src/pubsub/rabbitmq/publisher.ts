{% if values.pubsubProvider == 'rabbitmq' -%}
import amqplib, { Channel, Connection } from 'amqplib';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

/**
 * RabbitMQ Publisher - publish messages to RabbitMQ exchanges.
 *
 * Usage:
 *   const publisher = new RabbitPublisher();
 *   await publisher.connect();
 *   await publisher.publish('routing.key', { event: 'created', data: { id: 1 } });
 *   await publisher.disconnect();
 */
export class RabbitPublisher {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private exchange: string;

  constructor() {
    this.exchange = pubsubConfig.rabbitmq!.exchange;
  }

  async connect(): Promise<void> {
    const url = pubsubConfig.rabbitmq!.url;

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    logger.info('RabbitMQ publisher connected', { exchange: this.exchange });
  }

  async publish(routingKey: string, message: Record<string, unknown>): Promise<boolean> {
    if (!this.channel) throw new Error('RabbitMQ publisher not connected');

    const payload = Buffer.from(JSON.stringify(message));
    const result = this.channel.publish(this.exchange, routingKey, payload, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.debug('RabbitMQ message published', { exchange: this.exchange, routingKey });
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    logger.info('RabbitMQ publisher disconnected');
  }
}
{% else -%}
export {};
{% endif -%}
