import type { WorkspaceAuthorizationCatalogSnapshot } from './workspace-authorization-catalog-snapshot.js';
import type { AuthorizationBootstrapParityReport } from './authorization-bootstrap-parity-report.js';
import type { AuthorizationRuntimeCatalog } from './authorization-runtime-catalog.js';

function toSortedUniqueValues(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function createRoleScopeKey(roleCode: string, scopeCode: string): string {
  return `${roleCode}::${scopeCode}`;
}

function computeMissingValues(expected: string[], actual: string[]): string[] {
  const actualSet = new Set(actual);
  return expected.filter((value) => !actualSet.has(value));
}

function computeUnexpectedValues(expected: string[], actual: string[]): string[] {
  const expectedSet = new Set(expected);
  return actual.filter((value) => !expectedSet.has(value));
}

export function compareAuthorizationCatalogParity(
  runtimeCatalog: AuthorizationRuntimeCatalog,
  persistedCatalog: WorkspaceAuthorizationCatalogSnapshot,
): AuthorizationBootstrapParityReport {
  const runtimeRoles = toSortedUniqueValues(runtimeCatalog.roles);
  const persistedRoles = toSortedUniqueValues(persistedCatalog.roles.map((role) => role.code));

  const runtimeScopes = toSortedUniqueValues(runtimeCatalog.scopes);
  const persistedScopes = toSortedUniqueValues(persistedCatalog.scopes.map((scope) => scope.code));

  const runtimeRoleScopes = toSortedUniqueValues(
    runtimeCatalog.roleScopes.map((entry) => createRoleScopeKey(entry.roleCode, entry.scopeCode)),
  );
  const persistedRoleScopes = toSortedUniqueValues(
    persistedCatalog.roleScopes.map((entry) => createRoleScopeKey(entry.roleCode, entry.scopeCode)),
  );

  const missingPersistedRoles = computeMissingValues(runtimeRoles, persistedRoles);
  const unexpectedPersistedRoles = computeUnexpectedValues(runtimeRoles, persistedRoles);

  const missingPersistedScopes = computeMissingValues(runtimeScopes, persistedScopes);
  const unexpectedPersistedScopes = computeUnexpectedValues(runtimeScopes, persistedScopes);

  const missingPersistedRoleScopes = computeMissingValues(runtimeRoleScopes, persistedRoleScopes);
  const unexpectedPersistedRoleScopes = computeUnexpectedValues(
    runtimeRoleScopes,
    persistedRoleScopes,
  );

  const isAligned =
    missingPersistedRoles.length === 0 &&
    unexpectedPersistedRoles.length === 0 &&
    missingPersistedScopes.length === 0 &&
    unexpectedPersistedScopes.length === 0 &&
    missingPersistedRoleScopes.length === 0 &&
    unexpectedPersistedRoleScopes.length === 0;

  return {
    isAligned,
    missingPersistedRoles,
    unexpectedPersistedRoles,
    missingPersistedScopes,
    unexpectedPersistedScopes,
    missingPersistedRoleScopes,
    unexpectedPersistedRoleScopes,
  };
}
