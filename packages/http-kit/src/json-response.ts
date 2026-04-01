import type { ServerResponse } from 'node:http';

import type { JsonResponse } from './http-status-code.js';

export function writeJsonResponse<TBody>(
  response: ServerResponse,
  payload: JsonResponse<TBody>,
): void {
  response.statusCode = payload.statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload.body));
}
