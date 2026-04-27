import type { WorkflowRuntimeTimelineCursor } from '../../domain/workflows/workflow-runtime-timeline-cursor.js';

function isCursorPayload(value: {
  readonly occurredAtIso?: string;
  readonly eventId?: string;
}): value is WorkflowRuntimeTimelineCursor {
  return (
    typeof value.occurredAtIso === 'string' &&
    value.occurredAtIso.trim().length > 0 &&
    typeof value.eventId === 'string' &&
    value.eventId.trim().length > 0
  );
}

export function encodeWorkflowRuntimeTimelineCursor(cursor: WorkflowRuntimeTimelineCursor): string {
  const serializedCursor = JSON.stringify(cursor);

  return Buffer.from(serializedCursor, 'utf8').toString('base64url');
}

export function decodeWorkflowRuntimeTimelineCursor(
  encodedCursor: string,
): WorkflowRuntimeTimelineCursor {
  const decodedCursor = Buffer.from(encodedCursor, 'base64url').toString('utf8');

  const parsedCursor: {
    readonly occurredAtIso?: string;
    readonly eventId?: string;
  } = JSON.parse(decodedCursor) as {
    readonly occurredAtIso?: string;
    readonly eventId?: string;
  };

  if (!isCursorPayload(parsedCursor)) {
    throw new Error('Invalid workflow runtime timeline cursor payload.');
  }

  return {
    occurredAtIso: parsedCursor.occurredAtIso,
    eventId: parsedCursor.eventId,
  };
}
