import type { ApiSuccessContract } from '@opspilot/contracts';

export interface RootRouteResponseData {
  readonly service: string;
  readonly status: 'running';
}

export function createRootRouteResponse(
  serviceName: string,
  correlationId: string,
): ApiSuccessContract<RootRouteResponseData> {
  return {
    data: {
      service: serviceName,
      status: 'running',
    },
    correlationId,
  };
}
