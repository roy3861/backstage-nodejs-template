export const cacheConfig = {
  defaultTtlSeconds: parseInt(process.env.CACHE_DEFAULT_TTL_SECONDS || '60', 10),
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  cleanupIntervalMs: parseInt(process.env.CACHE_CLEANUP_INTERVAL_MS || '30000', 10),
};
