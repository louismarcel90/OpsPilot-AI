import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationAuditEventHistoryFilter } from '../../domain/authorization/authorization-audit-event-history-filter.js';

export interface AuthorizationAuditEventRepository {
  append(event: AuthorizationAuditEvent): Promise<void>;
  listRecent(filter: AuthorizationAuditEventHistoryFilter): Promise<AuthorizationAuditEvent[]>;
}
