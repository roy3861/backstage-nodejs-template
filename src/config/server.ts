import dotenv from 'dotenv';
dotenv.config();

export const serverConfig = {
  name: process.env.APP_NAME || '${{ values.name }}',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${{ values.port }}', 10),
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
};
