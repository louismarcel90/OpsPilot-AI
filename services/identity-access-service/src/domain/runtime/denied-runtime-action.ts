import type { WorkflowRuntimeProtectedAction } from '../workflows/workflow-runtime-protected-action.js';
import type { WorkflowRuntimeProtectionLevel } from '../workflows/workflow-runtime-protection-diagnostics.js';
import type { RuntimeActorKind, RuntimeActorRole } from './runtime-actor-context.js';

export interface DeniedRuntimeAction {
  readonly eventId: string;
  readonly workflowRunId: string;
  readonly workspaceId: string;
  readonly occurredAtIso: string;
  readonly actorId: string;
  readonly actorKind: RuntimeActorKind;
  readonly actorRole: RuntimeActorRole;
  readonly action: WorkflowRuntimeProtectedAction;
  readonly requiredProtectionLevel: WorkflowRuntimeProtectionLevel;
  readonly reason: string;
}
