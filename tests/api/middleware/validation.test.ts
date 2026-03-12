import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { validateRequest } from '../../../src/api/middleware/validation';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

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

const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('validateRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 with mapped validation details when validation fails', () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { msg: 'Name is required', path: 'name', value: '' },
        { msg: 'General validation error' },
      ],
    } as unknown as ReturnType<typeof validationResult>);

    const res = createMockResponse();
    const next = jest.fn();

    validateRequest({} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Validation failed',
        details: [
          { message: 'Name is required', field: 'name', value: '' },
          { message: 'General validation error' },
        ],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when validation passes', () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as unknown as ReturnType<typeof validationResult>);

    const res = createMockResponse();
    const next = jest.fn();

    validateRequest({} as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
