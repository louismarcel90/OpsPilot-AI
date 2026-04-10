import type { AuthorizationParityTimelineEntry } from './authorization-parity-timeline-entry.js';

export interface AuthorizationParityTimelineByCorrelationView {
  readonly correlationId: string;
  readonly entryCount: number;
  readonly diagnosticIds: string[];
  readonly timeline: AuthorizationParityTimelineEntry[];
}
