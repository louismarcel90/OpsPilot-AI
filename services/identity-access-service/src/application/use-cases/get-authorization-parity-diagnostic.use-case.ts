import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';

export class GetAuthorizationParityDiagnosticUseCase {
  public constructor(
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
  ) {}

  public execute(): AuthorizationParityDiagnostic | null {
    return this.authorizationBootstrapValidationStore.getDiagnostic();
  }
}
