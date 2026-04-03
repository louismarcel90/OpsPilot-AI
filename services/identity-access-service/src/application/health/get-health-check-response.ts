import type { HealthCheckResponseContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE, type JsonResponse } from '@opspilot/http-kit';
import type { HealthCheckStatus } from '@opspilot/types';

import type { HealthStatus } from '../../domain/health/health-status.js';

export function getHealthCheckResponse(
  serviceName: string,
  databaseIsHealthy: boolean,
): JsonResponse<HealthCheckResponseContract> {
  const overallStatus: HealthStatus = databaseIsHealthy ? 'healthy' : 'unhealthy';

  const checks: HealthCheckStatus[] = [
    {
      serviceName,
      status: overallStatus,
      checkedAtIso: new Date().toISOString(),
    },
  ];

  return {
    statusCode: databaseIsHealthy ? HTTP_STATUS_CODE.ok : HTTP_STATUS_CODE.internalServerError,
    body: {
      overallStatus,
      checks,
    },
  };
}
