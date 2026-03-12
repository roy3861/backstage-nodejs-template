import { resilienceConfig } from '../config/resilience';
import { logger } from '../utils/logger';

type AsyncOperation<T> = () => Promise<T>;
type CircuitState = 'closed' | 'open' | 'half-open';

interface RetryOptions {
  retries: number;
  delayMs: number;
  backoffFactor: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  operationName: string,
  operation: AsyncOperation<T>,
  timeoutMs = resilienceConfig.defaultTimeoutMs,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function withRetry<T>(
  operationName: string,
  operation: AsyncOperation<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const retries = options.retries ?? resilienceConfig.retries;
  const delayMs = options.delayMs ?? resilienceConfig.retryDelayMs;
  const backoffFactor = options.backoffFactor ?? 2;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }

      const waitMs = delayMs * Math.pow(backoffFactor, attempt);
      logger.warn('Retrying operation after failure', {
        operation: operationName,
        attempt: attempt + 1,
        waitMs,
        error: (error as Error).message,
      });
      await sleep(waitMs);
      attempt += 1;
    }
  }

  throw lastError;
}

class SimpleCircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number,
  ) {}

  private prepareStateForExecution(): void {
    if (this.state !== 'open') {
      return;
    }

    const now = Date.now();
    if (now - this.openedAt >= this.resetTimeoutMs) {
      this.state = 'half-open';
      return;
    }

    throw new Error('Circuit is open');
  }

  private markSuccess(): void {
    this.state = 'closed';
    this.failures = 0;
  }

  private markFailure(error: Error): void {
    this.failures += 1;
    const shouldOpenCircuit = this.state === 'half-open' || this.failures >= this.failureThreshold;

    if (shouldOpenCircuit) {
      this.state = 'open';
      this.openedAt = Date.now();
      logger.warn('Circuit opened', {
        failures: this.failures,
        threshold: this.failureThreshold,
        error: error.message,
      });
    }
  }

  async execute<T>(operationName: string, operation: AsyncOperation<T>): Promise<T> {
    this.prepareStateForExecution();

    try {
      const result = await withTimeout(operationName, operation);
      this.markSuccess();
      return result;
    } catch (error) {
      this.markFailure(error as Error);
      throw error;
    }
  }
}

let circuitBreaker: SimpleCircuitBreaker | undefined;

export function initializeResilience(): void {
  if (circuitBreaker) {
    return;
  }

  circuitBreaker = new SimpleCircuitBreaker(
    resilienceConfig.breakerFailureThreshold,
    resilienceConfig.breakerResetTimeoutMs,
  );

  logger.info('Resilience module initialized', {
    timeoutMs: resilienceConfig.defaultTimeoutMs,
    retries: resilienceConfig.retries,
    retryDelayMs: resilienceConfig.retryDelayMs,
    breakerFailureThreshold: resilienceConfig.breakerFailureThreshold,
    breakerResetTimeoutMs: resilienceConfig.breakerResetTimeoutMs,
  });
}

export async function executeWithResilience<T>(
  operationName: string,
  operation: AsyncOperation<T>,
): Promise<T> {
  if (!circuitBreaker) {
    throw new Error('Resilience module is not initialized');
  }

  return withRetry(operationName, () => circuitBreaker!.execute(operationName, operation));
}

export function shutdownResilience(): void {
  if (!circuitBreaker) {
    return;
  }

  circuitBreaker = undefined;
  logger.info('Resilience module stopped');
}
