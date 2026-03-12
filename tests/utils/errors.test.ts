import { StatusCodes } from 'http-status-codes';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../../src/utils/errors';

describe('AppError hierarchy', () => {
  it('creates AppError with default status and operational flag', () => {
    const err = new AppError('Something went wrong');

    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(err.isOperational).toBe(true);
  });

  it('creates AppError with custom status and operational flag', () => {
    const err = new AppError('Boom', StatusCodes.BAD_REQUEST, false);

    expect(err.message).toBe('Boom');
    expect(err.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(err.isOperational).toBe(false);
  });

  it('creates specialized errors with default messages and statuses', () => {
    expect(new NotFoundError().message).toBe('Resource not found');
    expect(new NotFoundError().statusCode).toBe(StatusCodes.NOT_FOUND);

    expect(new ValidationError().message).toBe('Validation failed');
    expect(new ValidationError().statusCode).toBe(StatusCodes.BAD_REQUEST);

    expect(new UnauthorizedError().message).toBe('Unauthorized');
    expect(new UnauthorizedError().statusCode).toBe(StatusCodes.UNAUTHORIZED);

    expect(new ForbiddenError().message).toBe('Forbidden');
    expect(new ForbiddenError().statusCode).toBe(StatusCodes.FORBIDDEN);

    expect(new ConflictError().message).toBe('Resource conflict');
    expect(new ConflictError().statusCode).toBe(StatusCodes.CONFLICT);
  });

  it('creates specialized errors with custom messages', () => {
    expect(new NotFoundError('Record').message).toBe('Record not found');
    expect(new ValidationError('Bad input').message).toBe('Bad input');
    expect(new UnauthorizedError('Bad token').message).toBe('Bad token');
    expect(new ForbiddenError('No access').message).toBe('No access');
    expect(new ConflictError('Duplicate').message).toBe('Duplicate');
  });
});
