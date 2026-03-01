import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../utils/logger';

/**
 * Auth middleware stub.
 * Replace with your authentication strategy (JWT, API key, OAuth, etc.)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: { message: 'Missing Authorization header' },
    });
    return;
  }

  try {
    // TODO: Implement your authentication logic here
    // Example for JWT:
    //   const token = authHeader.replace('Bearer ', '');
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   (req as any).user = decoded;

    // Example for API Key:
    //   if (authHeader !== `Bearer ${process.env.API_KEY}`) {
    //     throw new Error('Invalid API key');
    //   }

    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: (error as Error).message });
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: { message: 'Invalid or expired credentials' },
    });
  }
}
