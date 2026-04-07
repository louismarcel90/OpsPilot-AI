import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';

export interface AuthorizationDiagnosticsHistoryStore {
  append(diagnostic: AuthorizationParityDiagnostic): void;
  listRecent(limit: number): AuthorizationParityDiagnostic[];
}

export class InMemoryAuthorizationDiagnosticsHistoryStore implements AuthorizationDiagnosticsHistoryStore {
  private readonly diagnostics: AuthorizationParityDiagnostic[] = [];

  public append(diagnostic: AuthorizationParityDiagnostic): void {
    this.diagnostics.unshift(diagnostic);
  }

  public listRecent(limit: number): AuthorizationParityDiagnostic[] {
    return this.diagnostics.slice(0, limit);
  }
}
