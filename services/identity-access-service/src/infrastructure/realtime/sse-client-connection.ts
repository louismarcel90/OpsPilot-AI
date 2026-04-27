import type { IncomingMessage, ServerResponse } from 'node:http';

export function prepareSseConnection(response: ServerResponse): void {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  response.write(': connected\n\n');
}

export function registerSseHeartbeat(input: {
  readonly request: IncomingMessage;
  readonly response: ServerResponse;
  readonly intervalMs: number;
  readonly onClose: () => void;
}): void {
  const heartbeat = setInterval(() => {
    input.response.write(': heartbeat\n\n');
  }, input.intervalMs);

  input.request.on('close', () => {
    clearInterval(heartbeat);
    input.onClose();
  });
}
