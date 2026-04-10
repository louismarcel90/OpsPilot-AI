import type { AuthorizationParityInvestigationByCorrelationView } from '../../domain/diagnostics/authorization-parity-investigation-by-correlation-view.js';
import type { GetAuthorizationParityByCorrelationIdUseCase } from './get-authorization-parity-by-correlation-id.use-case.js';

export class GetAuthorizationParityInvestigationByCorrelationIdUseCase {
  public constructor(
    private readonly getAuthorizationParityByCorrelationIdUseCase: GetAuthorizationParityByCorrelationIdUseCase,
  ) {}

  public async execute(
    correlationId: string,
  ): Promise<AuthorizationParityInvestigationByCorrelationView> {
    const events = await this.getAuthorizationParityByCorrelationIdUseCase.execute(correlationId);

    const diagnosticIds = [...new Set(events.map((event) => event.diagnosticId))];

    return {
      correlationId,
      eventCount: events.length,
      diagnosticIds,
      events,
    };
  }
}
