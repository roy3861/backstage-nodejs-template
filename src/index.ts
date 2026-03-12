import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import { serverConfig } from './config/server';
import { createApiRouter } from './api';
import { errorHandler } from './api/middleware/error-handler';
import { requestLogger } from './api/middleware/logging';
import { authMiddleware } from './api/middleware/auth';
import { logger } from './utils/logger';

const app = express();

// --------------- Security & Parsing Middleware ---------------
app.use(helmet());
app.use(cors(serverConfig.cors));
app.use(compression());
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

if (serverConfig.enableRateLimit) {
  app.use(
    rateLimit({
      windowMs: serverConfig.rateLimit.windowMs,
      max: serverConfig.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}

if (serverConfig.enableAuth) {
  // Keep health probes unauthenticated; protect API routes only.
  app.use('/api', authMiddleware);
}

// --------------- Routes ---------------
app.use(createApiRouter());

// --------------- Error Handler (must be last) ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
async function start(): Promise<void> {
  try {
    if (serverConfig.enableSql) {
      const { sqlConnection } = await import('./database/sql/connection');
      sqlConnection();
      logger.info('SQL database initialized');
    }

    if (serverConfig.enableMongo) {
      const { connectMongo } = await import('./database/nosql/connection');
      await connectMongo();
      logger.info('MongoDB initialized');
    }

    if (serverConfig.enableResilience) {
      const { initializeResilience } = await import('./resilience');
      initializeResilience();
    }

    if (serverConfig.enableIntegrations) {
      const { initializeIntegrations } = await import('./integrations');
      initializeIntegrations();
    }

    if (serverConfig.enableCache) {
      const { initializeCache } = await import('./cache');
      initializeCache();
    }

    if (serverConfig.enableAuthz) {
      const { initializeAuthz } = await import('./authz');
      initializeAuthz();
    }

    if (serverConfig.enableJobs) {
      const { startJobs } = await import('./jobs');
      startJobs();
    }

    app.listen(serverConfig.port, () => {
      logger.info(`🚀 example-service running on port ${serverConfig.port}`, {
        env: serverConfig.env,
        port: serverConfig.port,
        sql: serverConfig.enableSql,
        mongo: serverConfig.enableMongo,
        kafka: serverConfig.enableKafka,
        redis: serverConfig.enableRedis,
        rabbitmq: serverConfig.enableRabbitmq,
        auth: serverConfig.enableAuth,
        resilience: serverConfig.enableResilience,
        integrations: serverConfig.enableIntegrations,
        cache: serverConfig.enableCache,
        authz: serverConfig.enableAuthz,
        jobs: serverConfig.enableJobs,
        rateLimit: serverConfig.enableRateLimit,
      });
    });
  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

// --------------- Graceful Shutdown ---------------
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);

  if (serverConfig.enableSql) {
    const { closeSqlConnection } = await import('./database/sql/connection');
    await closeSqlConnection();
  }
  if (serverConfig.enableMongo) {
    const { closeMongo } = await import('./database/nosql/connection');
    await closeMongo();
  }
  if (serverConfig.enableJobs) {
    const { stopJobs } = await import('./jobs');
    await stopJobs();
  }
  if (serverConfig.enableCache) {
    const { shutdownCache } = await import('./cache');
    shutdownCache();
  }
  if (serverConfig.enableIntegrations) {
    const { shutdownIntegrations } = await import('./integrations');
    shutdownIntegrations();
  }
  if (serverConfig.enableResilience) {
    const { shutdownResilience } = await import('./resilience');
    shutdownResilience();
  }
  if (serverConfig.enableAuthz) {
    const { shutdownAuthz } = await import('./authz');
    shutdownAuthz();
  }

  process.exit(0);
}

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  void start();
}

export { app };
