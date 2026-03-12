import dotenv from 'dotenv';
dotenv.config();

function envFlag(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
}

export const serverConfig = {
  name: process.env.APP_NAME || 'example-service',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  // Feature flags — control which modules are initialised at startup
  enableSql: envFlag(process.env.ENABLE_SQL),
  enableMongo: envFlag(process.env.ENABLE_MONGO),
  enableKafka: envFlag(process.env.ENABLE_KAFKA),
  enableRedis: envFlag(process.env.ENABLE_REDIS),
  enableRabbitmq: envFlag(process.env.ENABLE_RABBITMQ),
  enableAuth: envFlag(process.env.ENABLE_AUTH),
  enableRateLimit: envFlag(process.env.ENABLE_RATE_LIMIT, true),
  enableResilience: envFlag(process.env.ENABLE_RESILIENCE),
  enableIntegrations: envFlag(process.env.ENABLE_INTEGRATIONS),
  enableJobs: envFlag(process.env.ENABLE_JOBS),
  enableCache: envFlag(process.env.ENABLE_CACHE),
  enableAuthz: envFlag(process.env.ENABLE_AUTHZ),
};
