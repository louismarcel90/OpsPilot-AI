import type { AuthorizationParityTimelineByDiagnosticView } from '../../domain/diagnostics/authorization-parity-timeline-by-diagnostic-view.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';
import { mapAuthorizationAuditEventToTimelineEntry } from '../../infrastructure/diagnostics/map-authorization-audit-event-to-timeline-entry.js';
import type { GetAuthorizationParityByDiagnosticIdUseCase } from './get-authorization-parity-by-diagnostic-id.use-case.js';
import type { GetAuthorizationParityRuntimeStateUseCase } from './get-authorization-parity-runtime-state.use-case.js';

export class GetAuthorizationParityTimelineByDiagnosticIdUseCase {
  public constructor(
    private readonly getAuthorizationParityByDiagnosticIdUseCase: GetAuthorizationParityByDiagnosticIdUseCase,
    private readonly getAuthorizationParityRuntimeStateUseCase: GetAuthorizationParityRuntimeStateUseCase,
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
  ) {}

  public async execute(diagnosticId: string): Promise<AuthorizationParityTimelineByDiagnosticView> {
    const events = await this.getAuthorizationParityByDiagnosticIdUseCase.execute(diagnosticId);
    const timeline = events.map(mapAuthorizationAuditEventToTimelineEntry);
    const runtimeState = this.getAuthorizationParityRuntimeStateUseCase.execute();
    const currentDiagnostic = this.authorizationBootstrapValidationStore.getDiagnostic();

    const currentRuntimeMatch =
      currentDiagnostic !== null && currentDiagnostic.diagnosticId === diagnosticId;

    return {
      diagnosticId,
      entryCount: timeline.length,
      currentRuntimeMatch,
      ...(currentRuntimeMatch ? { runtimeState } : {}),
      timeline,
    };
  }
}
