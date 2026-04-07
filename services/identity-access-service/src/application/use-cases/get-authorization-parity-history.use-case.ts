import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';
import type { AuthorizationDiagnosticsHistoryStore } from '../../infrastructure/authorization/authorization-diagnostics-history-store.js';

export class GetAuthorizationParityHistoryUseCase {
  public constructor(
    private readonly authorizationDiagnosticsHistoryStore: AuthorizationDiagnosticsHistoryStore,
  ) {}

  public async execute(limit: number): Promise<AuthorizationParityDiagnostic[]> {
    return this.authorizationDiagnosticsHistoryStore.listRecent(limit);
  }
}
