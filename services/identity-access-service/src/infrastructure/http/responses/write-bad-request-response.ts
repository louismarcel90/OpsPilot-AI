import type { ServerResponse } from 'node:http';

import { createBadRequestErrorResponse } from '@opspilot/http-kit';

import { writeJson } from './write-json.js';

export function writeBadRequestResponse(
  response: ServerResponse,
  correlationId: string,
  message: string,
): void {
  writeJson(response, createBadRequestErrorResponse(correlationId, message));
}
