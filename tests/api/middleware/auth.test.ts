import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authMiddleware } from '../../../src/api/middleware/auth';

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

describe('authMiddleware', () => {
  it('returns 401 when authorization header is missing', () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Missing Authorization header' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when authorization header is present', () => {
    const req = { headers: { authorization: 'Bearer token' } } as Request;
    const res = createMockResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when downstream auth logic throws', () => {
    const req = { headers: { authorization: 'Bearer token' } } as Request;
    const res = createMockResponse();
    const next = jest.fn(() => {
      throw new Error('Token invalid');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Invalid or expired credentials' },
    });
  });
});
