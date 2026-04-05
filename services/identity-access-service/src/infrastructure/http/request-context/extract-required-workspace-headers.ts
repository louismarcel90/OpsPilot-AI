import type { ProtectedWorkspaceRequest } from '../../../domain/request/protected-workspace-request.js';
import type { RequestContext } from '../../../domain/request/request-context.js';

export function extractRequiredWorkspaceHeaders(
  requestContext: RequestContext,
): ProtectedWorkspaceRequest | null {
  if (!requestContext.actorEmail) {
    return null;
  }

  if (!requestContext.tenantSlug) {
    return null;
  }

  if (!requestContext.workspaceSlug) {
    return null;
  }

  return {
    requestContext,
    actorEmail: requestContext.actorEmail,
    tenantSlug: requestContext.tenantSlug,
    workspaceSlug: requestContext.workspaceSlug,
  };
}
