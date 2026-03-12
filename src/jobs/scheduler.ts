import { logger } from '../utils/logger';
import { JobDefinition } from './types';

export class JobScheduler {
  private readonly jobs: JobDefinition[] = [];
  private readonly timers = new Map<string, NodeJS.Timeout>();

  register(job: JobDefinition): void {
    this.jobs.push(job);
  }

  startAll(): void {
    this.jobs.forEach((job) => {
      if (this.timers.has(job.name)) {
        return;
      }

      const timer = setInterval(async () => {
        const startedAt = Date.now();
        try {
          await job.run();
          logger.debug('Background job completed', {
            name: job.name,
            durationMs: Date.now() - startedAt,
          });
        } catch (error) {
          logger.error('Background job failed', {
            name: job.name,
            error: (error as Error).message,
          });
        }
      }, job.intervalMs);

      timer.unref();
      this.timers.set(job.name, timer);
      logger.info('Background job scheduled', { name: job.name, intervalMs: job.intervalMs });
    });
  }

  stopAll(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    logger.info('All background jobs stopped');
  }
}
