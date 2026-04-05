import type { ServerResponse } from 'node:http';

import { createForbiddenErrorResponse } from '@opspilot/http-kit';

import { writeJson } from './write-json.js';

export function writeForbiddenResponse(
  response: ServerResponse,
  correlationId: string,
  message: string,
): void {
  writeJson(response, createForbiddenErrorResponse(correlationId, message));
}
