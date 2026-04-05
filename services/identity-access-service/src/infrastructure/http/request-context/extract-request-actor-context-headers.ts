import type { IncomingMessage } from 'node:http';

import type { RequestActorContextHeaders } from '../../../domain/identity/request-actor-context-headers.js';

function readSingleHeaderValue(request: IncomingMessage, headerName: string): string | null {
  const rawValue = request.headers[headerName];

  if (typeof rawValue !== 'string') {
    return null;
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  return trimmedValue;
}

export function extractRequestActorContextHeaders(
  request: IncomingMessage,
): RequestActorContextHeaders | null {
  const actorEmail = readSingleHeaderValue(request, 'x-actor-email');
  const tenantSlug = readSingleHeaderValue(request, 'x-tenant-slug');
  const workspaceSlug = readSingleHeaderValue(request, 'x-workspace-slug');

  if (actorEmail === null || tenantSlug === null || workspaceSlug === null) {
    return null;
  }

  return {
    actorEmail,
    tenantSlug,
    workspaceSlug,
  };
}
