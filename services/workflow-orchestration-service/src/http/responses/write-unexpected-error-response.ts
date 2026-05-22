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

export function writeUnexpectedErrorResponse(
  response: ServerResponse,
  correlationId: string,
): void {
  writeJson(response, {
    statusCode: 500,
    body: {
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred.',
      },
      correlationId,
    },
  });
}
