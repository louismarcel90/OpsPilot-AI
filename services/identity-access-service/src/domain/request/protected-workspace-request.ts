import type { RequestContext } from './request-context.js';

export interface ProtectedWorkspaceRequest {
  readonly requestContext: RequestContext;
  readonly actorEmail: string;
  readonly tenantSlug: string;
  readonly workspaceSlug: string;
}
