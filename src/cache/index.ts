import { cacheConfig } from '../config/cache';
import { logger } from '../utils/logger';
import { InMemoryCache } from './in-memory-cache';

let cache: InMemoryCache | undefined;

export function initializeCache(): InMemoryCache {
  if (!cache) {
    cache = new InMemoryCache(
      cacheConfig.maxItems,
      cacheConfig.cleanupIntervalMs,
    );

    logger.info('Cache module initialized', {
      defaultTtlSeconds: cacheConfig.defaultTtlSeconds,
      maxItems: cacheConfig.maxItems,
      cleanupIntervalMs: cacheConfig.cleanupIntervalMs,
    });
  }

  return cache;
}

export function getCache(): InMemoryCache {
  if (!cache) {
    throw new Error('Cache module is not initialized');
  }

  return cache;
}

export function shutdownCache(): void {
  if (!cache) {
    return;
  }

  cache.shutdown();
  cache = undefined;
  logger.info('Cache module stopped');
}

export { InMemoryCache };
