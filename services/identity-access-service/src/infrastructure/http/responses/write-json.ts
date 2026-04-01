import type { ServerResponse } from 'node:http';

import { writeJsonResponse, type JsonResponse } from '@opspilot/http-kit';

export function writeJson<TBody>(response: ServerResponse, payload: JsonResponse<TBody>): void {
  writeJsonResponse(response, payload);
}
