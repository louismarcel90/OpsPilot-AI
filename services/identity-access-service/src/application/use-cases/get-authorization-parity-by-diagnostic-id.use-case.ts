import type { AuthorizationAuditEvent } from '../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationAuditEventRepository } from '../repositories/authorization-audit-event-repository.js';

export class GetAuthorizationParityByDiagnosticIdUseCase {
  public constructor(
    private readonly authorizationAuditEventRepository: AuthorizationAuditEventRepository,
  ) {}

  public async execute(diagnosticId: string): Promise<AuthorizationAuditEvent[]> {
    return this.authorizationAuditEventRepository.listRecent({
      limit: 100,
      diagnosticId,
    });
  }
}
