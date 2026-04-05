export interface AuthorizationBootstrapParityReport {
  readonly isAligned: boolean;
  readonly missingPersistedRoles: string[];
  readonly unexpectedPersistedRoles: string[];
  readonly missingPersistedScopes: string[];
  readonly unexpectedPersistedScopes: string[];
  readonly missingPersistedRoleScopes: string[];
  readonly unexpectedPersistedRoleScopes: string[];
}
