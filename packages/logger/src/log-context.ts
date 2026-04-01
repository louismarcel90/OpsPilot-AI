export interface LogContext {
  readonly correlationId?: string;
  readonly serviceName?: string;
  readonly operationName?: string;
  readonly actorId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
}
