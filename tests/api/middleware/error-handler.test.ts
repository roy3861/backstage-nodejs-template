import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../../../src/api/middleware/error-handler';
import { AppError } from '../../../src/utils/errors';

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

function createMockResponse(): MockResponse {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as MockResponse;
}

describe('errorHandler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns AppError details and stack in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new AppError('Invalid payload', StatusCodes.BAD_REQUEST);
    const res = createMockResponse();

    errorHandler(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Invalid payload',
        stack: expect.any(String),
      }),
    });
  });

  it('returns AppError without stack in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    const res = createMockResponse();

    errorHandler(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Unauthorized' },
    });
  });

  it('returns generic internal error in production', () => {
    process.env.NODE_ENV = 'production';
    const res = createMockResponse();

    errorHandler(new Error('database down'), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error' },
    });
  });

  it('returns generic error message outside production', () => {
    process.env.NODE_ENV = 'development';
    const res = createMockResponse();

    errorHandler(new Error('database down'), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'database down' },
    });
  });
});
