import type { RuntimeAuthorizationDecision } from '../../domain/runtime/runtime-authorization-decision.js';
import { canRuntimeRoleSatisfyProtectionLevel } from '../../domain/runtime/runtime-protection-capability.js';
import type { WorkflowRuntimeProtectedAction } from '../../domain/workflows/workflow-runtime-protected-action.js';
import { evaluateWorkflowRuntimeProtection } from '../../infrastructure/workflows/evaluate-workflow-runtime-protection.js';
import type { RuntimeActorContextResolver } from './runtime-actor-context-resolver.js';

export class RuntimeProtectedActionGuard {
  public constructor(private readonly runtimeActorContextResolver: RuntimeActorContextResolver) {}

  public async evaluate(input: {
    readonly actorId: string;
    readonly workspaceId: string;
    readonly workflowRunId: string;
    readonly action: WorkflowRuntimeProtectedAction;
  }): Promise<RuntimeAuthorizationDecision | null> {
    const actor = await this.runtimeActorContextResolver.resolve({
      actorId: input.actorId,
      workspaceId: input.workspaceId,
    });

    if (actor === null) {
      return null;
    }

    const protection = evaluateWorkflowRuntimeProtection({
      action: input.action,
      workflowRunId: input.workflowRunId,
    });

    const isAllowed = canRuntimeRoleSatisfyProtectionLevel({
      actorRole: actor.role,
      protectionLevel: protection.protectionLevel,
    });

    return {
      status: isAllowed ? 'allow' : 'deny',
      actor,
      action: input.action,
      requiredProtectionLevel: protection.protectionLevel,
      reason: isAllowed
        ? 'Actor role satisfies runtime protection level.'
        : 'Actor role does not satisfy runtime protection level.',
    };
  }

  public async assertAllowed(input: {
    readonly actorId: string;
    readonly workspaceId: string;
    readonly workflowRunId: string;
    readonly action: WorkflowRuntimeProtectedAction;
  }): Promise<RuntimeAuthorizationDecision> {
    const decision = await this.evaluate(input);

    if (decision === null) {
      throw new Error('Runtime actor context could not be resolved.');
    }

    if (decision.status === 'deny') {
      throw new Error(
        `Runtime action denied: ${decision.reason} Required=${decision.requiredProtectionLevel}, ActorRole=${decision.actor.role}.`,
      );
    }

    return decision;
  }
}
