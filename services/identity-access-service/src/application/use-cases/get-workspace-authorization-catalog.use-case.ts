import type { AuthorizationCatalogReadRepository } from '../repositories/authorization-catalog-read-repository.js';
import type { WorkspaceAuthorizationCatalogSnapshot } from '../../domain/authorization/workspace-authorization-catalog-snapshot.js';

export class GetWorkspaceAuthorizationCatalogUseCase {
  public constructor(
    private readonly authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
  ) {}

  public async execute(): Promise<WorkspaceAuthorizationCatalogSnapshot> {
    const [roles, scopes, roleScopes] = await Promise.all([
      this.authorizationCatalogReadRepository.listWorkspaceRoles(),
      this.authorizationCatalogReadRepository.listWorkspaceScopes(),
      this.authorizationCatalogReadRepository.listWorkspaceRoleScopes(),
    ]);

    return {
      roles,
      scopes,
      roleScopes,
    };
  }
}
