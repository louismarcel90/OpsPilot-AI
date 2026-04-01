import type { ServerResponse } from 'node:http';

import { createInternalServerErrorResponse } from '@opspilot/http-kit';

import { writeJson } from './write-json.js';

export function writeUnexpectedErrorResponse(
  response: ServerResponse,
  correlationId: string,
): void {
  writeJson(response, createInternalServerErrorResponse(correlationId));
}
