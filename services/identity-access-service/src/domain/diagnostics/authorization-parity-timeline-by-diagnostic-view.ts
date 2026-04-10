import type { AuthorizationParityTimelineEntry } from './authorization-parity-timeline-entry.js';
import type { AuthorizationParityRuntimeState } from './authorization-parity-runtime-state.js';

export interface AuthorizationParityTimelineByDiagnosticView {
  readonly diagnosticId: string;
  readonly entryCount: number;
  readonly currentRuntimeMatch: boolean;
  readonly runtimeState?: AuthorizationParityRuntimeState;
  readonly timeline: AuthorizationParityTimelineEntry[];
}
