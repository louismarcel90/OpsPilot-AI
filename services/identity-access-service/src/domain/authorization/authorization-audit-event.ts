import type { AuthorizationBootstrapParityReport } from './authorization-bootstrap-parity-report.js';

export type AuthorizationAuditEventType =
  | 'workspace_access_check'
  | 'workspace_capability_check'
  | 'authorization_catalog_parity_check'
  | 'manual_revalidation_completed'
  | 'bootstrap_validation_completed';

export type AuthorizationAuditEventSource =
  | 'bootstrap'
  | 'http_request'
  | 'background_process'
  | 'manual_revalidation';

export interface AuthorizationAuditEvent {
  readonly eventId: string;
  readonly eventType: AuthorizationAuditEventType;
  readonly source: AuthorizationAuditEventSource;
  readonly isAligned: boolean;
  readonly createdAt: Date;
  readonly parityReport: AuthorizationBootstrapParityReport;
}
