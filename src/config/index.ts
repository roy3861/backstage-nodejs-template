import { serverConfig } from './server';
import { databaseConfig } from './database';
import { pubsubConfig } from './pubsub';
import { resilienceConfig } from './resilience';
import { integrationsConfig } from './integrations';
import { jobsConfig } from './jobs';
import { cacheConfig } from './cache';
import { authzConfig } from './authz';

export const config = {
  server: serverConfig,
  database: databaseConfig,
  pubsub: pubsubConfig,
  resilience: resilienceConfig,
  integrations: integrationsConfig,
  jobs: jobsConfig,
  cache: cacheConfig,
  authz: authzConfig,
};

export {
  serverConfig,
  databaseConfig,
  pubsubConfig,
  resilienceConfig,
  integrationsConfig,
  jobsConfig,
  cacheConfig,
  authzConfig,
};
