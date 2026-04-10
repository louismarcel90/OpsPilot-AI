import type { AuthorizationCatalogReadRepository } from '../../../application/repositories/authorization-catalog-read-repository.js';
import type { AuthorizationAuditEventRepository } from '../../../application/repositories/authorization-audit-event-repository.js';
import type { TenantReadRepository } from '../../../application/repositories/tenant-read-repository.js';
import type { UserReadRepository } from '../../../application/repositories/user-read-repository.js';
import type { WorkspaceMembershipReadRepository } from '../../../application/repositories/workspace-membership-read-repository.js';
import type { WorkspaceReadRepository } from '../../../application/repositories/workspace-read-repository.js';
import { CheckWorkspaceAccessUseCase } from '../../../application/use-cases/check-workspace-access.use-case.js';
import { CheckWorkspaceCapabilityUseCase } from '../../../application/use-cases/check-workspace-capability.use-case.js';
import { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import { GetAuthorizationParityByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-by-correlation-id.use-case.js';
import { GetAuthorizationParityByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-by-diagnostic-id.use-case.js';
import { GetAuthorizationParityDiagnosticUseCase } from '../../../application/use-cases/get-authorization-parity-diagnostic.use-case.js';
import { GetAuthorizationParityHistoryUseCase } from '../../../application/use-cases/get-authorization-parity-history.use-case.js';
import { GetAuthorizationParityInvestigationByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-investigation-by-correlation-id.use-case.js';
import { GetAuthorizationParityInvestigationByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-investigation-by-diagnostic-id.use-case.js';
import { GetAuthorizationParityRuntimeStateUseCase } from '../../../application/use-cases/get-authorization-parity-runtime-state.use-case.js';
import { GetWorkspaceAuthorizationCatalogUseCase } from '../../../application/use-cases/get-workspace-authorization-catalog.use-case.js';
import { RevalidateAuthorizationParityUseCase } from '../../../application/use-cases/revalidate-authorization-parity.use-case.js';
import { ResolveAccessContextUseCase } from '../../../application/use-cases/resolve-access-context.use-case.js';
import { ResolveTenantBySlugUseCase } from '../../../application/use-cases/resolve-tenant-by-slug.use-case.js';
import { ResolveUserByEmailUseCase } from '../../../application/use-cases/resolve-user-by-email.use-case.js';
import { ResolveWorkspaceMembershipUseCase } from '../../../application/use-cases/resolve-workspace-membership.use-case.js';
import { ValidateWorkspaceAuthorizationBootstrapUseCase } from '../../../application/use-cases/validate-workspace-authorization-bootstrap.use-case.js';
import type { AuthorizationBootstrapValidationStore } from '../../authorization/authorization-bootstrap-validation-store.js';
import { InMemoryAuthorizationBootstrapValidationStore } from '../../authorization/authorization-bootstrap-validation-store.js';
import type { AuthorizationDiagnosticsHistoryStore } from '../../authorization/authorization-diagnostics-history-store.js';
import { InMemoryAuthorizationDiagnosticsHistoryStore } from '../../authorization/authorization-diagnostics-history-store.js';

export interface ServiceDependencies {
  readonly resolveUserByEmailUseCase: ResolveUserByEmailUseCase;
  readonly resolveTenantBySlugUseCase: ResolveTenantBySlugUseCase;
  readonly resolveWorkspaceMembershipUseCase: ResolveWorkspaceMembershipUseCase;
  readonly resolveAccessContextUseCase: ResolveAccessContextUseCase;
  readonly checkWorkspaceAccessUseCase: CheckWorkspaceAccessUseCase;
  readonly checkWorkspaceCapabilityUseCase: CheckWorkspaceCapabilityUseCase;
  readonly enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase;
  readonly getWorkspaceAuthorizationCatalogUseCase: GetWorkspaceAuthorizationCatalogUseCase;
  readonly validateWorkspaceAuthorizationBootstrapUseCase: ValidateWorkspaceAuthorizationBootstrapUseCase;
  readonly getAuthorizationParityDiagnosticUseCase: GetAuthorizationParityDiagnosticUseCase;
  readonly getAuthorizationParityRuntimeStateUseCase: GetAuthorizationParityRuntimeStateUseCase;
  readonly getAuthorizationParityHistoryUseCase: GetAuthorizationParityHistoryUseCase;
  readonly getAuthorizationParityByDiagnosticIdUseCase: GetAuthorizationParityByDiagnosticIdUseCase;
  readonly getAuthorizationParityByCorrelationIdUseCase: GetAuthorizationParityByCorrelationIdUseCase;
  readonly getAuthorizationParityInvestigationByDiagnosticIdUseCase: GetAuthorizationParityInvestigationByDiagnosticIdUseCase;
  readonly getAuthorizationParityInvestigationByCorrelationIdUseCase: GetAuthorizationParityInvestigationByCorrelationIdUseCase;
  readonly revalidateAuthorizationParityUseCase: RevalidateAuthorizationParityUseCase;
  readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore;
  readonly authorizationDiagnosticsHistoryStore: AuthorizationDiagnosticsHistoryStore;
}

export function createServiceDependencies(
  userReadRepository: UserReadRepository,
  tenantReadRepository: TenantReadRepository,
  workspaceReadRepository: WorkspaceReadRepository,
  workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
  authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
  authorizationAuditEventRepository: AuthorizationAuditEventRepository,
): ServiceDependencies {
  const authorizationBootstrapValidationStore = new InMemoryAuthorizationBootstrapValidationStore();
  const authorizationDiagnosticsHistoryStore = new InMemoryAuthorizationDiagnosticsHistoryStore();

  const resolveAccessContextUseCase = new ResolveAccessContextUseCase(
    userReadRepository,
    tenantReadRepository,
    workspaceReadRepository,
    workspaceMembershipReadRepository,
  );

  const checkWorkspaceCapabilityUseCase = new CheckWorkspaceCapabilityUseCase(
    resolveAccessContextUseCase,
  );

  const getAuthorizationParityRuntimeStateUseCase = new GetAuthorizationParityRuntimeStateUseCase(
    authorizationBootstrapValidationStore,
  );

  const getAuthorizationParityByDiagnosticIdUseCase =
    new GetAuthorizationParityByDiagnosticIdUseCase(authorizationAuditEventRepository);

  const getAuthorizationParityByCorrelationIdUseCase =
    new GetAuthorizationParityByCorrelationIdUseCase(authorizationAuditEventRepository);

  return {
    resolveUserByEmailUseCase: new ResolveUserByEmailUseCase(userReadRepository),
    resolveTenantBySlugUseCase: new ResolveTenantBySlugUseCase(tenantReadRepository),
    resolveWorkspaceMembershipUseCase: new ResolveWorkspaceMembershipUseCase(
      workspaceMembershipReadRepository,
    ),
    resolveAccessContextUseCase,
    checkWorkspaceAccessUseCase: new CheckWorkspaceAccessUseCase(resolveAccessContextUseCase),
    checkWorkspaceCapabilityUseCase,
    enforceProtectedWorkspaceRequestUseCase: new EnforceProtectedWorkspaceRequestUseCase(
      checkWorkspaceCapabilityUseCase,
    ),
    getWorkspaceAuthorizationCatalogUseCase: new GetWorkspaceAuthorizationCatalogUseCase(
      authorizationCatalogReadRepository,
    ),
    validateWorkspaceAuthorizationBootstrapUseCase:
      new ValidateWorkspaceAuthorizationBootstrapUseCase(authorizationCatalogReadRepository),
    getAuthorizationParityDiagnosticUseCase: new GetAuthorizationParityDiagnosticUseCase(
      authorizationBootstrapValidationStore,
    ),
    getAuthorizationParityRuntimeStateUseCase,
    getAuthorizationParityHistoryUseCase: new GetAuthorizationParityHistoryUseCase(
      authorizationDiagnosticsHistoryStore,
    ),
    getAuthorizationParityByDiagnosticIdUseCase,
    getAuthorizationParityByCorrelationIdUseCase,
    getAuthorizationParityInvestigationByDiagnosticIdUseCase:
      new GetAuthorizationParityInvestigationByDiagnosticIdUseCase(
        getAuthorizationParityByDiagnosticIdUseCase,
        getAuthorizationParityRuntimeStateUseCase,
        authorizationBootstrapValidationStore,
      ),
    getAuthorizationParityInvestigationByCorrelationIdUseCase:
      new GetAuthorizationParityInvestigationByCorrelationIdUseCase(
        getAuthorizationParityByCorrelationIdUseCase,
      ),
    revalidateAuthorizationParityUseCase: new RevalidateAuthorizationParityUseCase(
      authorizationCatalogReadRepository,
      authorizationBootstrapValidationStore,
      authorizationDiagnosticsHistoryStore,
      authorizationAuditEventRepository,
    ),
    authorizationBootstrapValidationStore,
    authorizationDiagnosticsHistoryStore,
  };
}
