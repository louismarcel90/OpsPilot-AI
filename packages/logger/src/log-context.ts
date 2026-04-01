export interface LogContext {
  readonly correlationId?: string;
  readonly serviceName?: string;
  readonly operationName?: string;
  readonly actorId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly httpMethod?: string;
  readonly httpPath?: string;
  readonly httpStatusCode?: number;
  readonly signalName?: string;
  readonly errorMessage?: string;
}
