import amqplib, { Channel, ChannelModel } from 'amqplib';
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
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private exchange: string;
  private url: string;

  constructor() {
    this.exchange = pubsubConfig.rabbitmq.exchange;
    this.url = pubsubConfig.rabbitmq.url;
  }

  async connect(): Promise<void> {
    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();

    this.connection = connection;
    this.channel = channel;

    await channel.assertExchange(this.exchange, 'topic', { durable: true });
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
