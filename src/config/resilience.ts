export const resilienceConfig = {
  defaultTimeoutMs: parseInt(process.env.RESILIENCE_TIMEOUT_MS || '3000', 10),
  retries: parseInt(process.env.RESILIENCE_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.RESILIENCE_RETRY_DELAY_MS || '200', 10),
  breakerFailureThreshold: parseInt(process.env.RESILIENCE_BREAKER_FAILURE_THRESHOLD || '5', 10),
  breakerResetTimeoutMs: parseInt(process.env.RESILIENCE_BREAKER_RESET_TIMEOUT_MS || '10000', 10),
};
