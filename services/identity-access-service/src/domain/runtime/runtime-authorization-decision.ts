import type { WorkflowRuntimeProtectedAction } from '../workflows/workflow-runtime-protected-action.js';
import type { WorkflowRuntimeProtectionLevel } from '../workflows/workflow-runtime-protection-diagnostics.js';
import type { RuntimeActorContext } from './runtime-actor-context.js';

export type RuntimeAuthorizationDecisionStatus = 'allow' | 'deny';

export interface RuntimeAuthorizationDecision {
  readonly status: RuntimeAuthorizationDecisionStatus;
  readonly actor: RuntimeActorContext;
  readonly action: WorkflowRuntimeProtectedAction;
  readonly requiredProtectionLevel: WorkflowRuntimeProtectionLevel;
  readonly reason: string;
}
