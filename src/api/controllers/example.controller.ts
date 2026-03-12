import { Request, Response, NextFunction } from 'express';
import { ExampleService } from '../../services/example.service';
import { logger } from '../../utils/logger';
import { StatusCodes } from 'http-status-codes';

export class ExampleController {
  private service: ExampleService;

  constructor() {
    this.service = new ExampleService();
  }

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.findAll();
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.findById(req.params.id);
      if (!item) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
        return;
      }
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      logger.info('Created example item', { id: item.id });
      res.status(StatusCodes.CREATED).json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.update(req.params.id, req.body);
      if (!item) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
        return;
      }
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const success = await this.service.delete(req.params.id);
      if (!success) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
        return;
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
