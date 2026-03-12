import { logger } from '../utils/logger';
import { JobDefinition } from './types';

export function createSampleCleanupJob(intervalMs: number): JobDefinition {
  return {
    name: 'sample-cleanup',
    intervalMs,
    run: async () => {
      logger.info('Sample cleanup job tick');
    },
  };
}
