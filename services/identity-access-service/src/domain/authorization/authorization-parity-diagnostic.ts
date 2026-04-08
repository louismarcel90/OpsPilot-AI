import type { AuthorizationBootstrapParityReport } from './authorization-bootstrap-parity-report.js';
import type { AuthorizationValidationSource } from './authorization-validation-source.js';

export interface AuthorizationParityDiagnostic {
  readonly diagnosticId: string;
  readonly checkedAtIso: string;
  readonly isAligned: boolean;
  readonly source: AuthorizationValidationSource;
  readonly parityReport: AuthorizationBootstrapParityReport;
}
