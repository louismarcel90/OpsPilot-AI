import type { IncomingMessage } from 'node:http';

export function resolveRuntimeActorId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const actorId = url.searchParams.get('actorId');

  if (!actorId || actorId.trim().length === 0) {
    return null;
  }

  return actorId.trim();
}
