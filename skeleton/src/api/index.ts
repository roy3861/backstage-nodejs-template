import { Router } from 'express';
import { healthRoutes } from './routes/health.routes';
import { exampleRoutes } from './routes/example.routes';

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRoutes);
  router.use('/api/v1/examples', exampleRoutes);

  return router;
}

export { healthRoutes, exampleRoutes };
