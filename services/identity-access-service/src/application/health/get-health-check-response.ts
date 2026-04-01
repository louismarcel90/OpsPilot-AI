import type { HealthCheckResponseContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE, type JsonResponse } from '@opspilot/http-kit';
import type { HealthCheckStatus } from '@opspilot/types';

import type { HealthStatus } from '../../domain/health/health-status.js';

export function getHealthCheckResponse(
  serviceName: string,
  status: HealthStatus = 'healthy',
): JsonResponse<HealthCheckResponseContract> {
  const check: HealthCheckStatus = {
    serviceName,
    status,
    checkedAtIso: new Date().toISOString(),
  };

  return {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      overallStatus: status,
      checks: [check],
    },
  };
}
