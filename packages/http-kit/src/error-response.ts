import type { ApiErrorContract } from '@opspilot/contracts';

import { HTTP_STATUS_CODE, type JsonResponse } from './http-status-code.js';

export function createNotFoundErrorResponse(
  correlationId: string,
  message: string = 'The requested route does not exist.',
): JsonResponse<ApiErrorContract> {
  return {
    statusCode: HTTP_STATUS_CODE.notFound,
    body: {
      code: 'ROUTE_NOT_FOUND',
      message,
      correlationId,
    },
  };
}

export function createInternalServerErrorResponse(
  correlationId: string,
  message: string = 'An unexpected internal server error occurred.',
): JsonResponse<ApiErrorContract> {
  return {
    statusCode: HTTP_STATUS_CODE.internalServerError,
    body: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      correlationId,
    },
  };
}
