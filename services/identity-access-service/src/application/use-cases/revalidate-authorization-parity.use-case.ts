import { randomUUID } from 'node:crypto';

import type { AuthorizationParityDiagnostic } from '../../domain/authorization/authorization-parity-diagnostic.js';
import { createAuthorizationRuntimeCatalog } from '../../domain/authorization/authorization-runtime-catalog.js';
import { compareAuthorizationCatalogParity } from '../../domain/authorization/authorization-runtime-parity.js';
import type { AuthorizationCatalogReadRepository } from '../repositories/authorization-catalog-read-repository.js';
import type { AuthorizationAuditEventRepository } from '../repositories/authorization-audit-event-repository.js';
import type { AuthorizationBootstrapValidationStore } from '../../infrastructure/authorization/authorization-bootstrap-validation-store.js';
import type { AuthorizationDiagnosticsHistoryStore } from '../../infrastructure/authorization/authorization-diagnostics-history-store.js';
import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';

export class RevalidateAuthorizationParityUseCase {
  public constructor(
    private readonly authorizationCatalogReadRepository: AuthorizationCatalogReadRepository,
    private readonly authorizationBootstrapValidationStore: AuthorizationBootstrapValidationStore,
    private readonly authorizationDiagnosticsHistoryStore: AuthorizationDiagnosticsHistoryStore,
    private readonly authorizationAuditEventRepository: AuthorizationAuditEventRepository,
  ) {}

  public async execute(): Promise<AuthorizationParityDiagnostic> {
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
      isAligned: diagnostic.isAligned,
      parityReport: diagnostic.parityReport,
    };

    this.authorizationDiagnosticsHistoryStore.append(diagnostic);
    await this.authorizationAuditEventRepository.append(auditEvent);

    return diagnostic;
  }
}
