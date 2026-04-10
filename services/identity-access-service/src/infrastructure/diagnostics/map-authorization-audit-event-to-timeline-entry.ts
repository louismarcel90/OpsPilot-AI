import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationParityTimelineEntry } from '../../domain/diagnostics/authorization-parity-timeline-entry.js';

function createSummary(event: AuthorizationAuditEvent): string {
  if (event.eventType === 'bootstrap_validation_completed') {
    return event.isAligned
      ? 'Bootstrap validation completed with an aligned authorization parity state.'
      : 'Bootstrap validation completed with a non-aligned authorization parity state.';
  }

  if (event.eventType === 'manual_revalidation_completed') {
    return event.isAligned
      ? 'Manual revalidation completed with an aligned authorization parity state.'
      : 'Manual revalidation completed with a non-aligned authorization parity state.';
  }

  if (event.eventType === 'authorization_catalog_parity_check') {
    return 'Authorization catalog parity check event recorded.';
  }

  if (event.eventType === 'workspace_access_check') {
    return 'Workspace access check event recorded.';
  }

  return 'Workspace capability check event recorded.';
}

export function mapAuthorizationAuditEventToTimelineEntry(
  event: AuthorizationAuditEvent,
): AuthorizationParityTimelineEntry {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    source: event.source,
    occurredAtIso: event.createdAt.toISOString(),
    correlationId: event.correlationId,
    ...(event.requestId !== undefined ? { requestId: event.requestId } : {}),
    diagnosticId: event.diagnosticId,
    isAligned: event.isAligned,
    summary: createSummary(event),
  };
}
