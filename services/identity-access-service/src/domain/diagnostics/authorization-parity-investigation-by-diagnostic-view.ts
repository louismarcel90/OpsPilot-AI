import type { AuthorizationAuditEvent } from '../authorization/authorization-audit-event.js';
import type { AuthorizationParityRuntimeState } from './authorization-parity-runtime-state.js';

export interface AuthorizationParityInvestigationByDiagnosticView {
  readonly diagnosticId: string;
  readonly eventCount: number;
  readonly currentRuntimeMatch: boolean;
  readonly runtimeState?: AuthorizationParityRuntimeState;
  readonly events: AuthorizationAuditEvent[];
}
