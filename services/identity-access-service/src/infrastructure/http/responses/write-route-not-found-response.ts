import type { ServerResponse } from 'node:http';

import { createNotFoundErrorResponse } from '@opspilot/http-kit';

import { writeJson } from './write-json.js';

export function writeRouteNotFoundResponse(response: ServerResponse, correlationId: string): void {
  writeJson(response, createNotFoundErrorResponse(correlationId));
}
