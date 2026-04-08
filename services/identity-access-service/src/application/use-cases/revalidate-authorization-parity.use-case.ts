import { randomUUID } from 'node:crypto';

import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';
import { createAuthorizationRuntimeCatalog } from '../../domain/authorization/authorization-runtime-catalog.js';
import { compareAuthorizationCatalogParity } from '../../domain/authorization/authorization-runtime-parity.js';
import type { AuthorizationAuditEventRepository } from '../repositories/authorization-audit-event-repository.js';
import type { AuthorizationCatalogReadRepository } from '../repositories/authorization-catalog-read-repository.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';
import type { AuthorizationDiagnosticsHistoryStore } from '../../infrastructure/authorization/authorization-diagnostics-history-store.js';

export interface RevalidateAuthorizationParityInput {
  readonly correlationId: string;
  readonly requestId?: string;
}

export class RevalidateAuthorizationParityUseCase {
  public constructor(
    private readonly authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
    private readonly authorizationDiagnosticsHistoryStore: AuthorizationDiagnosticsHistoryStore,
    private readonly authorizationAuditEventRepository: AuthorizationAuditEventRepository,
  ) {}

  public async execute(
    input: RevalidateAuthorizationParityInput,
  ): Promise<AuthorizationParityDiagnostic> {
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
      diagnosticId: randomUUID(),
      checkedAtIso: new Date().toISOString(),
      isAligned: parityReport.isAligned,
      source: 'manual_revalidation',
      parityReport,
    };

    this.authorizationBootstrapValidationStore.setDiagnostic(diagnostic);

    const auditEvent: AuthorizationAuditEvent = {
      eventId: randomUUID(),
      eventType: 'manual_revalidation_completed',
      createdAt: new Date(diagnostic.checkedAtIso),
      source: 'manual_revalidation',
      correlationId: input.correlationId,
      ...(input.requestId !== undefined ? { requestId: input.requestId } : {}),
      diagnosticId: diagnostic.diagnosticId,
      isAligned: diagnostic.isAligned,
      parityReport: diagnostic.parityReport,
    };

    this.authorizationDiagnosticsHistoryStore.append(diagnostic);
    await this.authorizationAuditEventRepository.append(auditEvent);

    return diagnostic;
  }
}
