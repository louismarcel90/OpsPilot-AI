import type { AuthorizationParityDiagnostic } from '../authorization/authorization-parity-diagnostic.js';
import type { DiagnosticAvailabilityStatus } from './diagnostic-availability-status.js';
import type { DiagnosticFreshnessStatus } from './diagnostic-freshness-status.js';

export interface AuthorizationParityRuntimeState {
  readonly availabilityStatus: DiagnosticAvailabilityStatus;
  readonly freshnessStatus: DiagnosticFreshnessStatus;
  readonly checkedAtIso?: string;
  readonly diagnostic?: AuthorizationParityDiagnostic;
}
