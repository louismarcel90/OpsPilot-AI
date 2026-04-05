import type { ApiErrorContract } from '@opspilot/contracts';

import { HTTP_STATUS_CODE, type JsonResponse } from './http-status-code.js';

export function createBadRequestErrorResponse(
  correlationId: string,
  message: string = 'The request is invalid.',
): JsonResponse<ApiErrorContract> {
  return {
    statusCode: HTTP_STATUS_CODE.badRequest,
    body: {
      code: 'BAD_REQUEST',
      message,
      correlationId,
    },
  };
}

export function createForbiddenErrorResponse(
  correlationId: string,
  message: string = 'Access to the requested resource is forbidden.',
): JsonResponse<ApiErrorContract> {
  return {
    statusCode: HTTP_STATUS_CODE.forbidden,
    body: {
      code: 'FORBIDDEN',
      message,
      correlationId,
    },
  };
}

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
