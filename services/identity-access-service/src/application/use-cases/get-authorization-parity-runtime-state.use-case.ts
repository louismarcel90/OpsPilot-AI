import type { AuthorizationParityRuntimeState } from '../../domain/diagnostics/authorization-parity-runtime-state.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';

const DIAGNOSTIC_STALE_THRESHOLD_MILLISECONDS = 5 * 60 * 1000;

function resolveFreshnessStatus(checkedAtIso: string): 'fresh' | 'stale' {
  const checkedAtMilliseconds = Date.parse(checkedAtIso);

  if (Number.isNaN(checkedAtMilliseconds)) {
    return 'stale';
  }

  const ageMilliseconds = Date.now() - checkedAtMilliseconds;

  return ageMilliseconds <= DIAGNOSTIC_STALE_THRESHOLD_MILLISECONDS ? 'fresh' : 'stale';
}

export class GetAuthorizationParityRuntimeStateUseCase {
  public constructor(
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
  ) {}

  public execute(): AuthorizationParityRuntimeState {
    const diagnostic = this.authorizationBootstrapValidationStore.getDiagnostic();

    if (diagnostic === null) {
      return {
        availabilityStatus: 'not_available',
        freshnessStatus: 'missing',
      };
    }

    return {
      availabilityStatus: 'available',
      freshnessStatus: resolveFreshnessStatus(diagnostic.checkedAtIso),
      checkedAtIso: diagnostic.checkedAtIso,
      diagnostic,
    };
  }
}
