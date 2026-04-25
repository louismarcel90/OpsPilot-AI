import type { RuntimeActorRole } from './runtime-actor-context.js';
import type { WorkflowRuntimeProtectionLevel } from '../workflows/workflow-runtime-protection-diagnostics.js';

export function canRuntimeRoleSatisfyProtectionLevel(input: {
  readonly actorRole: RuntimeActorRole;
  readonly protectionLevel: WorkflowRuntimeProtectionLevel;
}): boolean {
  if (input.actorRole === 'system') {
    return true;
  }

  if (input.protectionLevel === 'system') {
    return false;
  }

  if (input.protectionLevel === 'operator') {
    return input.actorRole === 'operator' || input.actorRole === 'admin';
  }

  if (input.protectionLevel === 'admin') {
    return input.actorRole === 'admin';
  }

  if (input.protectionLevel === 'approval_decider') {
    return input.actorRole === 'approval_decider';
  }

  return false;
}
