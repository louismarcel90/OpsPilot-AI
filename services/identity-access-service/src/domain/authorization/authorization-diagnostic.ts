import type { WorkspaceScope } from './workspace-scope-catalog.js';

export type AuthorizationReasonCode =
  | 'ACCESS_GRANTED'
  | 'USER_NOT_FOUND'
  | 'TENANT_NOT_FOUND'
  | 'WORKSPACE_NOT_FOUND'
  | 'MEMBERSHIP_NOT_FOUND'
  | 'INVALID_ROLE_CODE'
  | 'INSUFFICIENT_ROLE'
  | 'MISSING_REQUIRED_SCOPE';

export interface AuthorizationDiagnostic {
  readonly reasonCode: AuthorizationReasonCode;
  readonly reasonMessage: string;
  readonly requiredRole?: string;
  readonly requiredScope?: WorkspaceScope;
  readonly actualRole?: string;
  readonly grantedScopes?: WorkspaceScope[];
}
