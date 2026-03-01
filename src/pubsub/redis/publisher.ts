{% if values.pubsubProvider == 'redis' -%}
import Redis from 'ioredis';
import { pubsubConfig } from '../../config/pubsub';
import { logger } from '../../utils/logger';

/**
 * Redis Publisher - publish messages to Redis channels.
 *
 * Usage:
 *   const publisher = new RedisPublisher();
 *   await publisher.publish('my-channel', { event: 'created', data: { id: 1 } });
 *   await publisher.disconnect();
 */
export class RedisPublisher {
  private client: Redis;

  constructor() {
    const redisConfig = pubsubConfig.redis!;

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
    });

    this.client.on('connect', () => logger.info('Redis publisher connected'));
    this.client.on('error', (err) => logger.error('Redis publisher error', { error: err.message }));
  }

  async publish(channel: string, message: Record<string, unknown>): Promise<number> {
    const payload = JSON.stringify(message);
    const result = await this.client.publish(channel, payload);
    logger.debug('Redis message published', { channel, subscribers: result });
    return result;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    logger.info('Redis publisher disconnected');
  }
}
{% else -%}
export {};
{% endif -%}
