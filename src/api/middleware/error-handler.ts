import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (err instanceof AppError) {
    logger.warn('Application error', {
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    });

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
}
