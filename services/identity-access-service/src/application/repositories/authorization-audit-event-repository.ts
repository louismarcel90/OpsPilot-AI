import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';

export interface AuthorizationAuditEventRepository {
  append(event: AuthorizationAuditEvent): Promise<void>;
  listRecent(limit: number): Promise<AuthorizationAuditEvent[]>;
}
