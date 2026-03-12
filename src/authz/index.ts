import { authzConfig } from '../config/authz';
import { logger } from '../utils/logger';

let initialized = false;

export function initializeAuthz(): void {
  if (initialized) {
    return;
  }

  initialized = true;
  logger.info('Authz module initialized', {
    defaultRole: authzConfig.defaultRole,
    tenantHeader: authzConfig.tenantHeader,
  });
}

export function shutdownAuthz(): void {
  if (!initialized) {
    return;
  }

  initialized = false;
  logger.info('Authz module stopped');
}

export * from './types';
export * from './policies';
