import type { IncomingMessage } from 'node:http';

import type { RequestContext } from '../../../domain/request/request-context.js';

function readOptionalHeader(request: IncomingMessage, headerName: string): string | undefined {
  const rawValue = request.headers[headerName];

  if (typeof rawValue === 'string') {
    const trimmedValue = rawValue.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (Array.isArray(rawValue)) {
    const firstValue = rawValue[0];
    if (firstValue) {
      const trimmedValue = firstValue.trim();
      return trimmedValue.length > 0 ? trimmedValue : undefined;
    }
  }

  return undefined;
}

export function extractRequestContext(
  request: IncomingMessage,
  correlationId: string,
): RequestContext {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const actorEmail = readOptionalHeader(request, 'x-actor-email');
  const tenantSlug = readOptionalHeader(request, 'x-tenant-slug');
  const workspaceSlug = readOptionalHeader(request, 'x-workspace-slug');

  return {
    correlationId,
    httpMethod: request.method ?? 'GET',
    httpPath: url.pathname,
    ...(actorEmail !== undefined ? { actorEmail } : {}),
    ...(tenantSlug !== undefined ? { tenantSlug } : {}),
    ...(workspaceSlug !== undefined ? { workspaceSlug } : {}),
  };
}
