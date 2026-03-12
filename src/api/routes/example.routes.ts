import { Router } from 'express';
import { ExampleController } from '../controllers/example.controller';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();
const controller = new ExampleController();

// GET /api/v1/examples
router.get('/', controller.getAll);

// GET /api/v1/examples/:id
router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  validateRequest,
  controller.getById,
);

// POST /api/v1/examples
router.post(
  '/',
  [
    body('name').isString().notEmpty().trim(),
    body('description').optional().isString().trim(),
  ],
  validateRequest,
  controller.create,
);

// PUT /api/v1/examples/:id
router.put(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString().trim(),
    body('description').optional().isString().trim(),
  ],
  validateRequest,
  controller.update,
);

// DELETE /api/v1/examples/:id
router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  validateRequest,
  controller.delete,
);

export { router as exampleRoutes };
