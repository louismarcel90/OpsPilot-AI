import type {
  AuthorizationAuditEventSource,
  AuthorizationAuditEventType,
} from './authorization-audit-event.js';

export interface AuthorizationAuditEventHistoryFilter {
  readonly limit: number;
  readonly eventType?: AuthorizationAuditEventType;
  readonly source?: AuthorizationAuditEventSource;
  readonly correlationId?: string;
  readonly diagnosticId?: string;
}
