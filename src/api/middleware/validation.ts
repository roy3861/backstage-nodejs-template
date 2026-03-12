import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Validation failed',
        details: errors.array().map((err) => {
          const detail: { field?: string; message: string; value?: unknown } = {
            message: err.msg,
          };

          if ('path' in err) {
            detail.field = err.path;
          }

          if ('value' in err) {
            detail.value = err.value;
          }

          return detail;
        }),
      },
    });
    return;
  }

  next();
}
