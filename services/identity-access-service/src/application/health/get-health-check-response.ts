import type { HealthCheckResponseContract } from '@opspilot/contracts';
import type { HealthCheckStatus } from '@opspilot/types';

import type { HealthStatus } from '../../domain/health/health-status.js';

export function getHealthCheckResponse(
  serviceName: string,
  status: HealthStatus = 'healthy',
): HealthCheckResponseContract {
  const check: HealthCheckStatus = {
    serviceName,
    status,
    checkedAtIso: new Date().toISOString(),
  };

  return {
    overallStatus: status,
    checks: [check],
  };
}
