import type { AuthorizationParityInvestigationByDiagnosticView } from '../../domain/diagnostics/authorization-parity-investigation-by-diagnostic-view.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';
import type { GetAuthorizationParityByDiagnosticIdUseCase } from './get-authorization-parity-by-diagnostic-id.use-case.js';
import type { GetAuthorizationParityRuntimeStateUseCase } from './get-authorization-parity-runtime-state.use-case.js';

export class GetAuthorizationParityInvestigationByDiagnosticIdUseCase {
  public constructor(
    private readonly getAuthorizationParityByDiagnosticIdUseCase: GetAuthorizationParityByDiagnosticIdUseCase,
    private readonly getAuthorizationParityRuntimeStateUseCase: GetAuthorizationParityRuntimeStateUseCase,
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
  ) {}

  public async execute(
    diagnosticId: string,
  ): Promise<AuthorizationParityInvestigationByDiagnosticView> {
    const events = await this.getAuthorizationParityByDiagnosticIdUseCase.execute(diagnosticId);
    const runtimeState = this.getAuthorizationParityRuntimeStateUseCase.execute();
    const currentDiagnostic = this.authorizationBootstrapValidationStore.getDiagnostic();

    const currentRuntimeMatch =
      currentDiagnostic !== null && currentDiagnostic.diagnosticId === diagnosticId;

    return {
      diagnosticId,
      eventCount: events.length,
      currentRuntimeMatch,
      ...(currentRuntimeMatch ? { runtimeState } : {}),
      events,
    };
  }
}
