import type { ServerResponse } from 'node:http';

type JsonBody = Record<string, string | number | boolean | null | object>;

function writeJson(
  response: ServerResponse,
  payload: {
    readonly statusCode: number;
    readonly body: JsonBody;
  },
): void {
  response.writeHead(payload.statusCode, {
    'Content-Type': 'application/json',
  });

  response.end(JSON.stringify(payload.body));
}

export function writeNotFoundResponse(response: ServerResponse, correlationId: string): void {
  writeJson(response, {
    statusCode: 404,
    body: {
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Route was not found.',
      },
      correlationId,
    },
  });
}
