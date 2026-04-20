import { randomUUID } from 'node:crypto';

import { createAppConfig } from '@opspilot/config';
import { createPostgresConnection } from '@opspilot/db';

import type { AuthorizationAuditEvent } from './domain/authorization/authorization-audit-event.js';
import type { AuthorizationParityDiagnostic } from './domain/authorization/authorization-parity-diagnostic.js';

import { DrizzleAssistantDefinitionReadRepository } from './infrastructure/db/repositories/drizzle-assistant-definition-read-repository.js';
import { DrizzleAssistantPublicationEventRepository } from './infrastructure/db/repositories/drizzle-assistant-publication-event-repository.js';
import { DrizzleAssistantVersionReadRepository } from './infrastructure/db/repositories/drizzle-assistant-version-read-repository.js';
import { DrizzleAssistantVersionWriteRepository } from './infrastructure/db/repositories/drizzle-assistant-version-write-repository.js';
import { DrizzleAuthorizationAuditEventRepository } from './infrastructure/db/repositories/drizzle-authorization-audit-event-repository.js';
import { DrizzleAuthorizationCatalogReadRepository } from './application/repositories/drizzle-authorization-catalog-read-repository.js';
import { DrizzleTenantReadRepository } from './infrastructure/db/repositories/drizzle-tenant-read-repository.js';
import { DrizzleUserReadRepository } from './infrastructure/db/repositories/drizzle-user-read-repository.js';
import { DrizzleWorkflowPublicationEventRepository } from './infrastructure/db/repositories/drizzle-workflow-publication-event-repository.js';
import { DrizzleWorkflowStepReadRepository } from './infrastructure/db/repositories/drizzle-workflow-step-read-repository.js';
import { DrizzleWorkflowTemplateReadRepository } from './infrastructure/db/repositories/drizzle-workflow-template-read-repository.js';
import { DrizzleWorkflowVersionReadRepository } from './infrastructure/db/repositories/drizzle-workflow-version-read-repository.js';
import { DrizzleWorkflowVersionWriteRepository } from './infrastructure/db/repositories/drizzle-workflow-version-write-repository.js';
import { DrizzleWorkspaceMembershipReadRepository } from './infrastructure/db/repositories/drizzle-workspace-membership-read-repository.js';
import { DrizzleWorkspaceReadRepository } from './infrastructure/db/repositories/drizzle-workspace-read-repository.js';
import { createHttpServer } from './infrastructure/http/server/create-http-server.js';
import { registerProcessSignalHandlers } from './infrastructure/http/server/register-process-signal-handlers.js';
import { createServiceDependencies } from './infrastructure/http/runtime/service-dependencies.js';
import { IdentityAccessServiceRuntime } from './infrastructure/http/runtime/service-runtime.js';
import { createServiceLogger } from './infrastructure/logging/create-service-logger.js';
import { DrizzleWorkflowRunReadRepository } from './infrastructure/db/repositories/drizzle-workflow-run-read-repository.js';
import { DrizzleWorkflowRunWriteRepository } from './infrastructure/db/repositories/drizzle-workflow-run-write-repository.js';

function buildBootstrapParityErrorMessage(details: {
  readonly missingPersistedRoles: string[];
  readonly unexpectedPersistedRoles: string[];
  readonly missingPersistedScopes: string[];
  readonly unexpectedPersistedScopes: string[];
  readonly missingPersistedRoleScopes: string[];
  readonly unexpectedPersistedRoleScopes: string[];
}): string {
  return [
    'Workspace authorization catalog parity check failed.',
    `missingPersistedRoles=${details.missingPersistedRoles.join(',') || 'none'}`,
    `unexpectedPersistedRoles=${details.unexpectedPersistedRoles.join(',') || 'none'}`,
    `missingPersistedScopes=${details.missingPersistedScopes.join(',') || 'none'}`,
    `unexpectedPersistedScopes=${details.unexpectedPersistedScopes.join(',') || 'none'}`,
    `missingPersistedRoleScopes=${details.missingPersistedRoleScopes.join(',') || 'none'}`,
    `unexpectedPersistedRoleScopes=${details.unexpectedPersistedRoleScopes.join(',') || 'none'}`,
  ].join(' ');
}

async function bootstrap(): Promise<void> {
  const config = createAppConfig({
    SERVICE_NAME: 'identity-access-service',
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    PORT: process.env['PORT'] ?? '3001',
    LOG_LEVEL: process.env['LOG_LEVEL'] ?? 'info',
    ...(process.env['DATABASE_URL'] !== undefined
      ? { DATABASE_URL: process.env['DATABASE_URL'] }
      : {}),
  });

  const logger = createServiceLogger();

  logger.info('Bootstrapping service', {
    serviceName: config.serviceName,
    operationName: 'bootstrap',
  });

  const databaseConnection = createPostgresConnection(config.database);

  const userReadRepository = new DrizzleUserReadRepository(databaseConnection);
  const tenantReadRepository = new DrizzleTenantReadRepository(databaseConnection);
  const workspaceReadRepository = new DrizzleWorkspaceReadRepository(databaseConnection);
  const workspaceMembershipReadRepository = new DrizzleWorkspaceMembershipReadRepository(
    databaseConnection,
  );
  const authorizationCatalogReadRepository = new DrizzleAuthorizationCatalogReadRepository(
    databaseConnection,
  );
  const authorizationAuditEventRepository = new DrizzleAuthorizationAuditEventRepository(
    databaseConnection,
  );
  const assistantDefinitionReadRepository = new DrizzleAssistantDefinitionReadRepository(
    databaseConnection,
  );
  const assistantVersionReadRepository = new DrizzleAssistantVersionReadRepository(
    databaseConnection,
  );
  const assistantVersionWriteRepository = new DrizzleAssistantVersionWriteRepository(
    databaseConnection,
  );
  const assistantPublicationEventRepository = new DrizzleAssistantPublicationEventRepository(
    databaseConnection,
  );
  const workflowTemplateReadRepository = new DrizzleWorkflowTemplateReadRepository(
    databaseConnection,
  );
  const workflowVersionReadRepository = new DrizzleWorkflowVersionReadRepository(
    databaseConnection,
  );
  const workflowVersionWriteRepository = new DrizzleWorkflowVersionWriteRepository(
    databaseConnection,
  );
  const workflowPublicationEventRepository = new DrizzleWorkflowPublicationEventRepository(
    databaseConnection,
  );
  const workflowStepReadRepository = new DrizzleWorkflowStepReadRepository(databaseConnection);
  const workflowRunReadRepository = new DrizzleWorkflowRunReadRepository(databaseConnection);
  const workflowRunWriteRepository = new DrizzleWorkflowRunWriteRepository(databaseConnection);

  const dependencies = createServiceDependencies(
    userReadRepository,
    tenantReadRepository,
    workspaceReadRepository,
    workspaceMembershipReadRepository,
    authorizationCatalogReadRepository,
    authorizationAuditEventRepository,
    assistantDefinitionReadRepository,
    assistantVersionReadRepository,
    assistantVersionWriteRepository,
    assistantPublicationEventRepository,
    workflowTemplateReadRepository,
    workflowVersionReadRepository,
    workflowVersionWriteRepository,
    workflowPublicationEventRepository,
    workflowStepReadRepository,
    workflowRunReadRepository,
    workflowRunWriteRepository,
  );

  const bootstrapValidationResult =
    await dependencies.validateWorkspaceAuthorizationBootstrapUseCase.execute();

  if (!bootstrapValidationResult.parityReport.isAligned) {
    await databaseConnection.close();

    throw new Error(buildBootstrapParityErrorMessage(bootstrapValidationResult.parityReport));
  }

  const bootstrapCheckedAtIso = new Date().toISOString();
  const bootstrapCorrelationId = randomUUID();
  const bootstrapDiagnosticId = randomUUID();

  dependencies.authorizationBootstrapValidationStore.setDiagnostic({
    diagnosticId: bootstrapDiagnosticId,
    checkedAtIso: bootstrapCheckedAtIso,
    isAligned: bootstrapValidationResult.parityReport.isAligned,
    source: 'bootstrap',
    parityReport: bootstrapValidationResult.parityReport,
  });

  const bootstrapDiagnostic: AuthorizationParityDiagnostic = {
    diagnosticId: bootstrapDiagnosticId,
    checkedAtIso: bootstrapCheckedAtIso,
    isAligned: bootstrapValidationResult.parityReport.isAligned,
    source: 'bootstrap',
    parityReport: bootstrapValidationResult.parityReport,
  };

  const bootstrapAuditEvent: AuthorizationAuditEvent = {
    eventId: randomUUID(),
    eventType: 'bootstrap_validation_completed',
    createdAt: new Date(bootstrapCheckedAtIso),
    source: 'bootstrap',
    correlationId: bootstrapCorrelationId,
    diagnosticId: bootstrapDiagnostic.diagnosticId,
    isAligned: bootstrapValidationResult.parityReport.isAligned,
    parityReport: bootstrapValidationResult.parityReport,
  };

  dependencies.authorizationDiagnosticsHistoryStore.append(bootstrapDiagnostic);
  await authorizationAuditEventRepository.append(bootstrapAuditEvent);

  logger.info('Workspace authorization catalog parity check passed', {
    serviceName: config.serviceName,
    operationName: 'bootstrap',
    correlationId: bootstrapCorrelationId,
    diagnosticId: bootstrapDiagnostic.diagnosticId,
  });

  const server = createHttpServer(config, logger, databaseConnection, dependencies);
  const runtime = new IdentityAccessServiceRuntime(server, databaseConnection, config, logger);

  registerProcessSignalHandlers(runtime, config, logger);

  await runtime.start();
}

void bootstrap().catch((error: Error) => {
  const logger = createServiceLogger();

  logger.error('Service bootstrap failed', {
    serviceName: 'identity-access-service',
    operationName: 'bootstrap',
    errorMessage: error.message,
  });

  process.exitCode = 1;
});
