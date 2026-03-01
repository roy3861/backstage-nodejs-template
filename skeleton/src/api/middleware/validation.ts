import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Validation failed',
        details: errors.array().map((err) => ({
          field: (err as any).path,
          message: err.msg,
          value: (err as any).value,
        })),
      },
    });
    return;
  }

  next();
}
