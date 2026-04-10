import type { AuthorizationParityTimelineByCorrelationView } from '../../domain/diagnostics/authorization-parity-timeline-by-correlation-view.js';
import { mapAuthorizationAuditEventToTimelineEntry } from '../../infrastructure/diagnostics/map-authorization-audit-event-to-timeline-entry.js';
import type { GetAuthorizationParityByCorrelationIdUseCase } from './get-authorization-parity-by-correlation-id.use-case.js';

export class GetAuthorizationParityTimelineByCorrelationIdUseCase {
  public constructor(
    private readonly getAuthorizationParityByCorrelationIdUseCase: GetAuthorizationParityByCorrelationIdUseCase,
  ) {}

  public async execute(
    correlationId: string,
  ): Promise<AuthorizationParityTimelineByCorrelationView> {
    const events = await this.getAuthorizationParityByCorrelationIdUseCase.execute(correlationId);
    const timeline = events.map(mapAuthorizationAuditEventToTimelineEntry);
    const diagnosticIds = [...new Set(events.map((event) => event.diagnosticId))];

    return {
      correlationId,
      entryCount: timeline.length,
      diagnosticIds,
      timeline,
    };
  }
}
