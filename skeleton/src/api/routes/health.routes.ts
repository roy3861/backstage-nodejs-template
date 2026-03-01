import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: '${{ values.name }}',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  // TODO: Add readiness checks (DB connections, external dependencies)
  res.json({ status: 'ready' });
});

router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

export { router as healthRoutes };
