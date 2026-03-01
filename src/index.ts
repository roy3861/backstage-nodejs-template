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
import { logger } from './utils/logger';

{% if values.sqlDatabase != 'none' -%}
import { sqlConnection, closeSqlConnection } from './database/sql/connection';
{% endif -%}
{% if values.nosqlDatabase == 'mongodb' -%}
import { connectMongo, closeMongo } from './database/nosql/connection';
{% endif -%}

const app = express();

// --------------- Security & Parsing Middleware ---------------
app.use(helmet());
app.use(cors(serverConfig.cors));
app.use(compression());
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use(
  rateLimit({
    windowMs: serverConfig.rateLimit.windowMs,
    max: serverConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// --------------- Routes ---------------
app.use(createApiRouter());

// --------------- Error Handler (must be last) ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
async function start(): Promise<void> {
  try {
{% if values.sqlDatabase != 'none' %}
    // Initialize SQL connection
    sqlConnection();
    logger.info('SQL database initialized');
{% endif %}
{% if values.nosqlDatabase == 'mongodb' %}
    // Initialize MongoDB connection
    await connectMongo();
    logger.info('MongoDB initialized');
{% endif %}

    app.listen(serverConfig.port, () => {
      logger.info(`🚀 ${{ values.name }} running on port ${serverConfig.port}`, {
        env: serverConfig.env,
        port: serverConfig.port,
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

{% if values.sqlDatabase != 'none' %}
  await closeSqlConnection();
{% endif %}
{% if values.nosqlDatabase == 'mongodb' %}
  await closeMongo();
{% endif %}

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

export { app };
