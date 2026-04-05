export interface RequestContext {
  readonly correlationId: string;
  readonly httpMethod: string;
  readonly httpPath: string;
  readonly actorEmail?: string;
  readonly tenantSlug?: string;
  readonly workspaceSlug?: string;
}
