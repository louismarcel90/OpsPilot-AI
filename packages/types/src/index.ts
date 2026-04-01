export interface HealthCheckStatus {
  readonly serviceName: string;
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly checkedAtIso: string;
}
