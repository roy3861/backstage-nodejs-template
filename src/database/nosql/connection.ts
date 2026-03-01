{% if values.nosqlDatabase == 'mongodb' -%}
import mongoose from 'mongoose';
import { databaseConfig } from '../../config/database';
import { logger } from '../../utils/logger';

export async function connectMongo(): Promise<typeof mongoose> {
  const mongoConfig = databaseConfig.mongo!;
  const uri = mongoConfig.options
    ? `${mongoConfig.uri}?${mongoConfig.options}`
    : mongoConfig.uri;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected', { uri: mongoConfig.uri });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  return mongoose.connect(uri);
}

export async function closeMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
}
{% else -%}
// MongoDB not configured. Re-run Backstage template to enable.
export {};
{% endif -%}
