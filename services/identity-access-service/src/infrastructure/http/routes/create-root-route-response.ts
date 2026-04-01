import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE, type JsonResponse } from '@opspilot/http-kit';

export interface RootRouteResponseData {
  readonly service: string;
  readonly status: 'running';
  readonly timestampIso: string;
}

export function createRootRouteResponse(
  serviceName: string,
  correlationId: string,
): JsonResponse<ApiSuccessContract<RootRouteResponseData>> {
  return {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        service: serviceName,
        status: 'running',
        timestampIso: new Date().toISOString(),
      },
      correlationId,
    },
  };
}
