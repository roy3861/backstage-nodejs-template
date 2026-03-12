export const integrationsConfig = {
  exampleApiBaseUrl: process.env.INTEGRATIONS_EXAMPLE_API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  timeoutMs: parseInt(process.env.INTEGRATIONS_TIMEOUT_MS || '3000', 10),
  apiToken: process.env.INTEGRATIONS_API_TOKEN || '',
};
