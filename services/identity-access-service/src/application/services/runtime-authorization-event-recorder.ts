import type { RuntimeAuthorizationDecision } from '../../domain/runtime/runtime-authorization-decision.js';
import type { WorkflowRuntimeEventRecorder } from './workflow-runtime-event-recorder.js';

export class RuntimeAuthorizationEventRecorder {
  public constructor(private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder) {}

  public async recordDecision(input: {
    readonly workflowRunId: string;
    readonly workspaceId: string;
    readonly decision: RuntimeAuthorizationDecision;
  }): Promise<void> {
    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: input.workflowRunId,
      workspaceId: input.workspaceId,
      eventType:
        input.decision.status === 'allow'
          ? 'runtime_authorization_allowed'
          : 'runtime_authorization_denied',
      payload: {
        workflowRunId: input.workflowRunId,
        workspaceId: input.workspaceId,
        actorId: input.decision.actor.actorId,
        actorKind: input.decision.actor.actorKind,
        actorRole: input.decision.actor.role,
        action: input.decision.action,
        requiredProtectionLevel: input.decision.requiredProtectionLevel,
        decisionStatus: input.decision.status,
        reason: input.decision.reason,
      },
    });
  }
}
