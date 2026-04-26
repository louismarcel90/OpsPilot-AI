import type { DeniedRuntimeAction } from './denied-runtime-action.js';

export interface DeniedRuntimeActionSummary {
  readonly workflowRunId: string;
  readonly deniedActionCount: number;
  readonly deniedActorCount: number;
  readonly deniedActions: DeniedRuntimeAction[];
}
