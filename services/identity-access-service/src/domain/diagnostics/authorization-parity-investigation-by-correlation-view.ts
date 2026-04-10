import type { AuthorizationAuditEvent } from '../authorization/authorization-audit-event.js';

export interface AuthorizationParityInvestigationByCorrelationView {
  readonly correlationId: string;
  readonly eventCount: number;
  readonly diagnosticIds: string[];
  readonly events: AuthorizationAuditEvent[];
}
