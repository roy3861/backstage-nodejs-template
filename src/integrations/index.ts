import { integrationsConfig } from '../config/integrations';
import { logger } from '../utils/logger';
import { ExampleApiClient } from './example-api.client';
import { HttpClient } from './http-client';

let exampleApiClient: ExampleApiClient | undefined;

export function initializeIntegrations(): void {
  if (exampleApiClient) {
    return;
  }

  const defaultHeaders = integrationsConfig.apiToken
    ? { Authorization: `Bearer ${integrationsConfig.apiToken}` }
    : undefined;

  const httpClient = new HttpClient({
    baseUrl: integrationsConfig.exampleApiBaseUrl,
    timeoutMs: integrationsConfig.timeoutMs,
    defaultHeaders,
  });

  exampleApiClient = new ExampleApiClient(httpClient);

  logger.info('Integrations module initialized', {
    exampleApiBaseUrl: integrationsConfig.exampleApiBaseUrl,
    timeoutMs: integrationsConfig.timeoutMs,
  });
}

export function getExampleApiClient(): ExampleApiClient {
  if (!exampleApiClient) {
    throw new Error('Integrations module is not initialized');
  }

  return exampleApiClient;
}

export function shutdownIntegrations(): void {
  if (!exampleApiClient) {
    return;
  }

  exampleApiClient = undefined;
  logger.info('Integrations module stopped');
}

export { ExampleApiClient };
