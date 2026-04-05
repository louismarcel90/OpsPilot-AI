import type { AuthorizationBootstrapParityReport } from './authorization-bootstrap-parity-report.js';

export interface AuthorizationParityDiagnostic {
  readonly checkedAtIso: string;
  readonly isAligned: boolean;
  readonly parityReport: AuthorizationBootstrapParityReport;
}
