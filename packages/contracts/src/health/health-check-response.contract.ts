import type { HealthCheckStatus } from '@opspilot/types';

export interface HealthCheckResponseContract {
  readonly overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  readonly checks: HealthCheckStatus[];
}
