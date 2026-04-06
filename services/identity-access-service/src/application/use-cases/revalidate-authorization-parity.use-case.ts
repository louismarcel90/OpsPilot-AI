import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';
import { createAuthorizationRuntimeCatalog } from '../../domain/authorization/authorization-runtime-catalog.js';
import { compareAuthorizationCatalogParity } from '../../domain/authorization/authorization-runtime-parity.js';
import type { AuthorizationCatalogReadRepository } from '../repositories/authorization-catalog-read-repository.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';

export class RevalidateAuthorizationParityUseCase {
  public constructor(
    private readonly authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
  ) {}

  public async execute(): Promise<AuthorizationParityDiagnostic> {
    const [roles, scopes, roleScopes] = await Promise.all([
      this.authorizationCatalogReadRepository.listWorkspaceRoles(),
      this.authorizationCatalogReadRepository.listWorkspaceScopes(),
      this.authorizationCatalogReadRepository.listWorkspaceRoleScopes(),
    ]);

    const runtimeCatalog = createAuthorizationRuntimeCatalog();

    const parityReport = compareAuthorizationCatalogParity(runtimeCatalog, {
      roles,
      scopes,
      roleScopes,
    });

    const diagnostic: AuthorizationParityDiagnostic = {
      checkedAtIso: new Date().toISOString(),
      isAligned: parityReport.isAligned,
      source: 'manual_revalidation',
      parityReport,
    };

    this.authorizationBootstrapValidationStore.setDiagnostic(diagnostic);

    return diagnostic;
  }
}
