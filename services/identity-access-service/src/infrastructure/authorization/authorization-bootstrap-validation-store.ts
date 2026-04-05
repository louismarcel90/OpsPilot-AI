import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';

export interface AuthorizationBootstrapValidationStore {
  setDiagnostic(diagnostic: AuthorizationParityDiagnostic): void;
  getDiagnostic(): AuthorizationParityDiagnostic | null;
}

export class InMemoryAuthorizationBootstrapValidationStore implements AuthorizationBootstrapValidationStore {
  private diagnostic: AuthorizationParityDiagnostic | null = null;

  public setDiagnostic(diagnostic: AuthorizationParityDiagnostic): void {
    this.diagnostic = diagnostic;
  }

  public getDiagnostic(): AuthorizationParityDiagnostic | null {
    return this.diagnostic;
  }
}
