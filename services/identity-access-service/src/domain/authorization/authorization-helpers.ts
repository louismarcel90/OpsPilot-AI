import type { AuthorizationDiagnostic } from './authorization-diagnostic.js';
import type { WorkspaceRoleCode } from './role-catalog.js';
import { isWorkspaceRoleCode } from './role-catalog.js';
import type { WorkspaceScope } from './workspace-scope-catalog.js';
import { getWorkspaceRoleScopes, hasWorkspaceScope } from './workspace-scope-mapping.js';

export interface RoleResolutionResult {
  readonly isValid: boolean;
  readonly actualRole: string;
  readonly grantedScopes: WorkspaceScope[];
}

export function resolveRoleCapabilities(roleCode: string): RoleResolutionResult {
  if (!isWorkspaceRoleCode(roleCode)) {
    return {
      isValid: false,
      actualRole: roleCode,
      grantedScopes: [],
    };
  }

  return {
    isValid: true,
    actualRole: roleCode,
    grantedScopes: getWorkspaceRoleScopes(roleCode),
  };
}

export function canRoleAccessScope(
  roleCode: WorkspaceRoleCode,
  requiredScope: WorkspaceScope,
): boolean {
  return hasWorkspaceScope(roleCode, requiredScope);
}

export function createAllowedAuthorizationDiagnostic(
  actualRole: string,
  grantedScopes: WorkspaceScope[],
  requiredScope?: WorkspaceScope,
  requiredRole?: string,
): AuthorizationDiagnostic {
  return {
    reasonCode: 'ACCESS_GRANTED',
    reasonMessage: 'The actor satisfies the required authorization constraints.',
    ...(requiredRole !== undefined ? { requiredRole } : {}),
    ...(requiredScope !== undefined ? { requiredScope } : {}),
    actualRole,
    grantedScopes,
  };
}

export function createDeniedAuthorizationDiagnostic(
  reasonCode: AuthorizationDiagnostic['reasonCode'],
  reasonMessage: string,
  options?: {
    readonly requiredRole?: string;
    readonly requiredScope?: WorkspaceScope;
    readonly actualRole?: string;
    readonly grantedScopes?: WorkspaceScope[];
  },
): AuthorizationDiagnostic {
  return {
    reasonCode,
    reasonMessage,
    ...(options?.requiredRole !== undefined ? { requiredRole: options.requiredRole } : {}),
    ...(options?.requiredScope !== undefined ? { requiredScope: options.requiredScope } : {}),
    ...(options?.actualRole !== undefined ? { actualRole: options.actualRole } : {}),
    ...(options?.grantedScopes !== undefined ? { grantedScopes: options.grantedScopes } : {}),
  };
}
