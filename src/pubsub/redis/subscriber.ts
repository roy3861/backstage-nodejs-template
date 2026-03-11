import Redis from 'ioredis';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

export type RedisMessageHandler = (channel: string, message: string) => void;

/**
 * Redis Subscriber - subscribe to Redis channels.
 *
 * Usage:
 *   const subscriber = new RedisSubscriber();
 *   subscriber.subscribe('my-channel', (channel, message) => {
 *     console.log(`Received on ${channel}:`, JSON.parse(message));
 *   });
 */
export class RedisSubscriber {
  private client: Redis;

  constructor() {
    const redisConfig = pubsubConfig.redis;

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      ...(redisConfig.tls && { tls: {} }),
    });

    this.client.on('connect', () => logger.info('Redis subscriber connected'));
    this.client.on('error', (err) => logger.error('Redis subscriber error', { error: err.message }));
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    this.client.on('message', handler);
    await this.client.subscribe(channel);
    logger.info('Redis subscribed to channel', { channel });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.client.unsubscribe(channel);
    logger.info('Redis unsubscribed from channel', { channel });
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    logger.info('Redis subscriber disconnected');
  }
}
