import type {
  AuthorizationAuditEventSource,
  AuthorizationAuditEventType,
} from '../authorization/authorization-audit-event.js';

export interface AuthorizationParityTimelineEntry {
  readonly eventId: string;
  readonly eventType: AuthorizationAuditEventType;
  readonly source: AuthorizationAuditEventSource;
  readonly occurredAtIso: string;
  readonly correlationId: string;
  readonly requestId?: string;
  readonly diagnosticId: string;
  readonly isAligned: boolean;
  readonly summary: string;
}
