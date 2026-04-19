import type { AssistantDefinitionReadRepository } from '../../../application/repositories/assistant-definition-read-repository.js';
import type { AssistantPublicationEventRepository } from '../../../application/repositories/assistant-publication-event-repository.js';
import type { AssistantVersionReadRepository } from '../../../application/repositories/assistant-version-read-repository.js';
import type { AssistantVersionWriteRepository } from '../../../application/repositories/assistant-version-write-repository.js';
import type { AuthorizationCatalogReadRepository } from '../../../application/repositories/authorization-catalog-read-repository.js';
import type { AuthorizationAuditEventRepository } from '../../../application/repositories/authorization-audit-event-repository.js';
import type { TenantReadRepository } from '../../../application/repositories/tenant-read-repository.js';
import type { UserReadRepository } from '../../../application/repositories/user-read-repository.js';
import type { WorkflowPublicationEventRepository } from '../../../application/use-cases/workflow-publication-event-repository.js';
import type { WorkflowStepReadRepository } from '../../../application/repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../../../application/repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../../../application/repositories/workflow-version-read-repository.js';
import type { WorkflowVersionWriteRepository } from '../../../application/repositories/workflow-version-write-repository.js';
import type { WorkspaceMembershipReadRepository } from '../../../application/repositories/workspace-membership-read-repository.js';
import type { WorkspaceReadRepository } from '../../../application/repositories/workspace-read-repository.js';
import { CheckWorkspaceAccessUseCase } from '../../../application/use-cases/check-workspace-access.use-case.js';
import { CheckWorkspaceCapabilityUseCase } from '../../../application/use-cases/check-workspace-capability.use-case.js';
import { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import { GetAssistantBySlugUseCase } from '../../../application/use-cases/get-assistant-by-slug.use-case.js';
import { GetAssistantLatestPublicationUseCase } from '../../../application/use-cases/get-assistant-latest-publication.use-case.js';
import { GetAssistantPublicationHistoryUseCase } from '../../../application/use-cases/get-assistant-publication-history.use-case.js';
import { GetAssistantPublishReadinessUseCase } from '../../../application/use-cases/get-assistant-publish-readiness.use-case.js';
import { GetAssistantVersionConsistencyUseCase } from '../../../application/use-cases/get-assistant-version-consistency.use-case.js';
import { GetAssistantVersionsUseCase } from '../../../application/use-cases/get-assistant-versions.use-case.js';
import { GetAssistantWithVersionsUseCase } from '../../../application/use-cases/get-assistant-with-versions.use-case.js';
import { GetAuthorizationParityByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-by-correlation-id.use-case.js';
import { GetAuthorizationParityByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-by-diagnostic-id.use-case.js';
import { GetAuthorizationParityDiagnosticUseCase } from '../../../application/use-cases/get-authorization-parity-diagnostic.use-case.js';
import { GetAuthorizationParityHistoryUseCase } from '../../../application/use-cases/get-authorization-parity-history.use-case.js';
import { GetAuthorizationParityInvestigationByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-investigation-by-correlation-id.use-case.js';
import { GetAuthorizationParityInvestigationByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-investigation-by-diagnostic-id.use-case.js';
import { GetAuthorizationParityRuntimeStateUseCase } from '../../../application/use-cases/get-authorization-parity-runtime-state.use-case.js';
import { GetAuthorizationParityTimelineByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-timeline-by-correlation-id.use-case.js';
import { GetAuthorizationParityTimelineByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-timeline-by-diagnostic-id.use-case.js';
import { GetPublishedAssistantVersionUseCase } from '../../../application/use-cases/get-published-assistant-version.use-case.js';
import { GetPublishedWorkflowVersionUseCase } from '../../../application/use-cases/get-published-workflow-version.use-case.js';
import { GetWorkflowBySlugUseCase } from '../../../application/use-cases/get-workflow-by-slug.use-case.js';
import { GetWorkflowLatestPublicationUseCase } from '../../../application/use-cases/get-workflow-latest-publication.use-case.js';
import { GetWorkflowPublicationHistoryUseCase } from '../../../application/use-cases/get-workflow-publication-history.use-case.js';
import { GetWorkflowPublishReadinessUseCase } from '../../../application/use-cases/get-workflow-publish-readiness.use-case.js';
import { GetWorkflowVersionConsistencyUseCase } from '../../../application/use-cases/get-workflow-version-consistency.use-case.js';
import { GetWorkflowVersionsUseCase } from '../../../application/use-cases/get-workflow-versions.use-case.js';
import { GetWorkflowVersionStepsUseCase } from '../../../application/use-cases/get-workflow-version-steps.use-case.js';
import { GetWorkflowVersionStructureUseCase } from '../../../application/use-cases/get-workflow-version-structure.use-case.js';
import { GetWorkflowWithVersionsUseCase } from '../../../application/use-cases/get-workflow-with-versions.use-case.js';
import { GetWorkspaceAuthorizationCatalogUseCase } from '../../../application/use-cases/get-workspace-authorization-catalog.use-case.js';
import { ListAssistantsUseCase } from '../../../application/use-cases/list-assistants.use-case.js';
import { ListWorkflowsUseCase } from '../../../application/use-cases/list-workflows.use-case.js';
import { PublishAssistantVersionUseCase } from '../../../application/use-cases/publish-assistant-version.use-case.js';
import { PublishWorkflowVersionUseCase } from '../../../application/use-cases/publish-workflow-version.use-case.js';
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
import { GetWorkflowStepConsistencyUseCase } from '../../../application/use-cases/get-workflow-step-consistency.use-case.js';
export interface ServiceDependencies {
  readonly resolveUserByEmailUseCase: ResolveUserByEmailUseCase;
  readonly resolveTenantBySlugUseCase: ResolveTenantBySlugUseCase;
  readonly resolveWorkspaceMembershipUseCase: ResolveWorkspaceMembershipUseCase;
  readonly resolveAccessContextUseCase: ResolveAccessContextUseCase;
  readonly checkWorkspaceAccessUseCase: CheckWorkspaceAccessUseCase;
  readonly checkWorkspaceCapabilityUseCase: CheckWorkspaceCapabilityUseCase;
  readonly enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase;
  readonly listAssistantsUseCase: ListAssistantsUseCase;
  readonly getAssistantBySlugUseCase: GetAssistantBySlugUseCase;
  readonly getAssistantVersionsUseCase: GetAssistantVersionsUseCase;
  readonly getAssistantWithVersionsUseCase: GetAssistantWithVersionsUseCase;
  readonly getPublishedAssistantVersionUseCase: GetPublishedAssistantVersionUseCase;
  readonly getAssistantVersionConsistencyUseCase: GetAssistantVersionConsistencyUseCase;
  readonly getAssistantPublishReadinessUseCase: GetAssistantPublishReadinessUseCase;
  readonly publishAssistantVersionUseCase: PublishAssistantVersionUseCase;
  readonly getAssistantPublicationHistoryUseCase: GetAssistantPublicationHistoryUseCase;
  readonly getAssistantLatestPublicationUseCase: GetAssistantLatestPublicationUseCase;
  readonly listWorkflowsUseCase: ListWorkflowsUseCase;
  readonly getWorkflowBySlugUseCase: GetWorkflowBySlugUseCase;
  readonly getWorkflowVersionsUseCase: GetWorkflowVersionsUseCase;
  readonly getWorkflowWithVersionsUseCase: GetWorkflowWithVersionsUseCase;
  readonly getPublishedWorkflowVersionUseCase: GetPublishedWorkflowVersionUseCase;
  readonly getWorkflowVersionConsistencyUseCase: GetWorkflowVersionConsistencyUseCase;
  readonly getWorkflowPublishReadinessUseCase: GetWorkflowPublishReadinessUseCase;
  readonly publishWorkflowVersionUseCase: PublishWorkflowVersionUseCase;
  readonly getWorkflowPublicationHistoryUseCase: GetWorkflowPublicationHistoryUseCase;
  readonly getWorkflowLatestPublicationUseCase: GetWorkflowLatestPublicationUseCase;
  readonly getWorkflowVersionStepsUseCase: GetWorkflowVersionStepsUseCase;
  readonly getWorkflowVersionStructureUseCase: GetWorkflowVersionStructureUseCase;
  readonly getWorkspaceAuthorizationCatalogUseCase: GetWorkspaceAuthorizationCatalogUseCase;
  readonly validateWorkspaceAuthorizationBootstrapUseCase: ValidateWorkspaceAuthorizationBootstrapUseCase;
  readonly getAuthorizationParityDiagnosticUseCase: GetAuthorizationParityDiagnosticUseCase;
  readonly getAuthorizationParityRuntimeStateUseCase: GetAuthorizationParityRuntimeStateUseCase;
  readonly getAuthorizationParityHistoryUseCase: GetAuthorizationParityHistoryUseCase;
  readonly getAuthorizationParityByDiagnosticIdUseCase: GetAuthorizationParityByDiagnosticIdUseCase;
  readonly getAuthorizationParityByCorrelationIdUseCase: GetAuthorizationParityByCorrelationIdUseCase;
  readonly getAuthorizationParityInvestigationByDiagnosticIdUseCase: GetAuthorizationParityInvestigationByDiagnosticIdUseCase;
  readonly getAuthorizationParityInvestigationByCorrelationIdUseCase: GetAuthorizationParityInvestigationByCorrelationIdUseCase;
  readonly getAuthorizationParityTimelineByDiagnosticIdUseCase: GetAuthorizationParityTimelineByDiagnosticIdUseCase;
  readonly getAuthorizationParityTimelineByCorrelationIdUseCase: GetAuthorizationParityTimelineByCorrelationIdUseCase;
  readonly revalidateAuthorizationParityUseCase: RevalidateAuthorizationParityUseCase;
  readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore;
  readonly authorizationDiagnosticsHistoryStore: AuthorizationDiagnosticsHistoryStore;
  readonly getWorkflowStepConsistencyUseCase: GetWorkflowStepConsistencyUseCase;
}

export function createServiceDependencies(
  userReadRepository: UserReadRepository,
  tenantReadRepository: TenantReadRepository,
  workspaceReadRepository: WorkspaceReadRepository,
  workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
  authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
  authorizationAuditEventRepository: AuthorizationAuditEventRepository,
  assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
  assistantVersionReadRepository: AssistantVersionReadRepository,
  assistantVersionWriteRepository: AssistantVersionWriteRepository,
  assistantPublicationEventRepository: AssistantPublicationEventRepository,
  workflowTemplateReadRepository: WorkflowTemplateReadRepository,
  workflowVersionReadRepository: WorkflowVersionReadRepository,
  workflowVersionWriteRepository: WorkflowVersionWriteRepository,
  workflowPublicationEventRepository: WorkflowPublicationEventRepository,
  workflowStepReadRepository: WorkflowStepReadRepository,
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
    listAssistantsUseCase: new ListAssistantsUseCase(assistantDefinitionReadRepository),
    getAssistantBySlugUseCase: new GetAssistantBySlugUseCase(assistantDefinitionReadRepository),
    getAssistantVersionsUseCase: new GetAssistantVersionsUseCase(assistantVersionReadRepository),
    getAssistantWithVersionsUseCase: new GetAssistantWithVersionsUseCase(
      assistantDefinitionReadRepository,
      assistantVersionReadRepository,
    ),
    getPublishedAssistantVersionUseCase: new GetPublishedAssistantVersionUseCase(
      assistantDefinitionReadRepository,
      assistantVersionReadRepository,
    ),
    getAssistantVersionConsistencyUseCase: new GetAssistantVersionConsistencyUseCase(
      assistantDefinitionReadRepository,
      assistantVersionReadRepository,
    ),
    getAssistantPublishReadinessUseCase: new GetAssistantPublishReadinessUseCase(
      assistantDefinitionReadRepository,
      assistantVersionReadRepository,
    ),
    publishAssistantVersionUseCase: new PublishAssistantVersionUseCase(
      assistantDefinitionReadRepository,
      assistantVersionReadRepository,
      assistantVersionWriteRepository,
      assistantPublicationEventRepository,
    ),
    getAssistantPublicationHistoryUseCase: new GetAssistantPublicationHistoryUseCase(
      assistantDefinitionReadRepository,
      assistantPublicationEventRepository,
    ),
    getAssistantLatestPublicationUseCase: new GetAssistantLatestPublicationUseCase(
      assistantDefinitionReadRepository,
      assistantPublicationEventRepository,
    ),
    listWorkflowsUseCase: new ListWorkflowsUseCase(workflowTemplateReadRepository),
    getWorkflowBySlugUseCase: new GetWorkflowBySlugUseCase(workflowTemplateReadRepository),
    getWorkflowVersionsUseCase: new GetWorkflowVersionsUseCase(workflowVersionReadRepository),
    getWorkflowWithVersionsUseCase: new GetWorkflowWithVersionsUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
    ),
    getPublishedWorkflowVersionUseCase: new GetPublishedWorkflowVersionUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
    ),
    getWorkflowVersionConsistencyUseCase: new GetWorkflowVersionConsistencyUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
    ),
    getWorkflowPublishReadinessUseCase: new GetWorkflowPublishReadinessUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
      workflowStepReadRepository,
    ),
    publishWorkflowVersionUseCase: new PublishWorkflowVersionUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
      workflowVersionWriteRepository,
      workflowPublicationEventRepository,
      workflowStepReadRepository,
    ),
    getWorkflowPublicationHistoryUseCase: new GetWorkflowPublicationHistoryUseCase(
      workflowTemplateReadRepository,
      workflowPublicationEventRepository,
    ),
    getWorkflowLatestPublicationUseCase: new GetWorkflowLatestPublicationUseCase(
      workflowTemplateReadRepository,
      workflowPublicationEventRepository,
    ),
    getWorkflowVersionStepsUseCase: new GetWorkflowVersionStepsUseCase(workflowStepReadRepository),
    getWorkflowVersionStructureUseCase: new GetWorkflowVersionStructureUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
      workflowStepReadRepository,
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
    getAuthorizationParityTimelineByDiagnosticIdUseCase:
      new GetAuthorizationParityTimelineByDiagnosticIdUseCase(
        getAuthorizationParityByDiagnosticIdUseCase,
        getAuthorizationParityRuntimeStateUseCase,
        authorizationBootstrapValidationStore,
      ),
    getAuthorizationParityTimelineByCorrelationIdUseCase:
      new GetAuthorizationParityTimelineByCorrelationIdUseCase(
        getAuthorizationParityByCorrelationIdUseCase,
      ),
    revalidateAuthorizationParityUseCase: new RevalidateAuthorizationParityUseCase(
      authorizationCatalogReadRepository,
      authorizationBootstrapValidationStore,
      authorizationDiagnosticsHistoryStore,
      authorizationAuditEventRepository,
    ),
    getWorkflowStepConsistencyUseCase: new GetWorkflowStepConsistencyUseCase(
      workflowTemplateReadRepository,
      workflowVersionReadRepository,
      workflowStepReadRepository,
    ),
    authorizationBootstrapValidationStore,
    authorizationDiagnosticsHistoryStore,
  };
}
