import type { AuthorizationBootstrapParityReport } from '../../domain/authorization/authorization-bootstrap-parity-report.js';
import { createAuthorizationRuntimeCatalog } from '../../domain/authorization/authorization-runtime-catalog.js';
import { compareAuthorizationCatalogParity } from '../../domain/authorization/authorization-runtime-parity.js';
import type { AuthorizationCatalogReadRepository } from '../repositories/authorization-catalog-read-repository.js';

export interface WorkspaceAuthorizationBootstrapValidationResult {
  readonly parityReport: AuthorizationBootstrapParityReport;
}

export class ValidateWorkspaceAuthorizationBootstrapUseCase {
  public constructor(
    private readonly authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
  ) {}

  public async execute(): Promise<WorkspaceAuthorizationBootstrapValidationResult> {
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

    return {
      parityReport,
    };
  }
}
