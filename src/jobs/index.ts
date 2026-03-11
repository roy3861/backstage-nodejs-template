import { jobsConfig } from '../config/jobs';
import { logger } from '../utils/logger';
import { JobScheduler } from './scheduler';
import { createSampleCleanupJob } from './sample.job';

let scheduler: JobScheduler | undefined;

export function startJobs(): void {
  if (scheduler) {
    return;
  }

  scheduler = new JobScheduler();
  scheduler.register(createSampleCleanupJob(jobsConfig.sampleJobIntervalMs));
  scheduler.startAll();

  logger.info('Jobs module started', {
    sampleJobIntervalMs: jobsConfig.sampleJobIntervalMs,
  });
}

export async function stopJobs(): Promise<void> {
  if (!scheduler) {
    return;
  }

  scheduler.stopAll();
  scheduler = undefined;
  logger.info('Jobs module stopped');
}

export { JobDefinition } from './types';
