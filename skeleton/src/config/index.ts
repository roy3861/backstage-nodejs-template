import { serverConfig } from './server';
import { databaseConfig } from './database';
import { pubsubConfig } from './pubsub';

export const config = {
  server: serverConfig,
  database: databaseConfig,
  pubsub: pubsubConfig,
};

export { serverConfig, databaseConfig, pubsubConfig };
