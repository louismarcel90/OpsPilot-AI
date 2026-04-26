import type { AllowedRuntimeAction } from './allowed-runtime-action.js';
import type { DeniedRuntimeAction } from './denied-runtime-action.js';

export interface RuntimeAuthorizationActivitySummary {
  readonly workflowRunId: string;
  readonly allowedActionCount: number;
  readonly deniedActionCount: number;
  readonly totalAuthorizationDecisionCount: number;
  readonly actorCount: number;
  readonly allowedActions: AllowedRuntimeAction[];
  readonly deniedActions: DeniedRuntimeAction[];
}
