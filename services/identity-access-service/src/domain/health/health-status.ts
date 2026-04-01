export const HEALTH_STATUS_VALUES = ['healthy', 'degraded', 'unhealthy'] as const;

export type HealthStatus = (typeof HEALTH_STATUS_VALUES)[number];
