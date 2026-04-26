import type { DeniedRuntimeActionSummary } from '../../domain/runtime/denied-runtime-action-summary.js';
import type { DeniedRuntimeAction } from '../../domain/runtime/denied-runtime-action.js';
import type {
  RuntimeActorKind,
  RuntimeActorRole,
} from '../../domain/runtime/runtime-actor-context.js';
import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';
import { isWorkflowRuntimeProtectedAction } from '../../domain/workflows/workflow-runtime-protected-action.js';
import type { WorkflowRuntimeProtectionLevel } from '../../domain/workflows/workflow-runtime-protection-diagnostics.js';

function isRuntimeActorKind(value: string): value is RuntimeActorKind {
  return value === 'human' || value === 'system';
}

function isRuntimeActorRole(value: string): value is RuntimeActorRole {
  return (
    value === 'operator' || value === 'admin' || value === 'approval_decider' || value === 'system'
  );
}

function isWorkflowRuntimeProtectionLevel(value: string): value is WorkflowRuntimeProtectionLevel {
  return (
    value === 'operator' || value === 'admin' || value === 'system' || value === 'approval_decider'
  );
}

function readStringPayloadValue(
  payload: WorkflowRuntimeEvent['payload'],
  key: string,
): string | null {
  const value = payload[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  return value;
}

function projectDeniedRuntimeAction(event: WorkflowRuntimeEvent): DeniedRuntimeAction | null {
  if (event.eventType !== 'runtime_authorization_denied') {
    return null;
  }

  const actorId = readStringPayloadValue(event.payload, 'actorId');
  const actorKindRaw = readStringPayloadValue(event.payload, 'actorKind');
  const actorRoleRaw = readStringPayloadValue(event.payload, 'actorRole');
  const actionRaw = readStringPayloadValue(event.payload, 'action');
  const requiredProtectionLevelRaw = readStringPayloadValue(
    event.payload,
    'requiredProtectionLevel',
  );
  const reason = readStringPayloadValue(event.payload, 'reason');

  if (
    actorId === null ||
    actorKindRaw === null ||
    actorRoleRaw === null ||
    actionRaw === null ||
    requiredProtectionLevelRaw === null ||
    reason === null
  ) {
    return null;
  }

  if (!isRuntimeActorKind(actorKindRaw)) {
    return null;
  }

  if (!isRuntimeActorRole(actorRoleRaw)) {
    return null;
  }

  if (!isWorkflowRuntimeProtectedAction(actionRaw)) {
    return null;
  }

  if (!isWorkflowRuntimeProtectionLevel(requiredProtectionLevelRaw)) {
    return null;
  }

  return {
    eventId: event.id,
    workflowRunId: event.workflowRunId,
    workspaceId: event.workspaceId,
    occurredAtIso: event.occurredAtIso,
    actorId,
    actorKind: actorKindRaw,
    actorRole: actorRoleRaw,
    action: actionRaw,
    requiredProtectionLevel: requiredProtectionLevelRaw,
    reason,
  };
}

export function projectDeniedRuntimeActions(input: {
  readonly workflowRunId: string;
  readonly events: WorkflowRuntimeEvent[];
}): DeniedRuntimeActionSummary {
  const deniedActions = input.events
    .map((event) => projectDeniedRuntimeAction(event))
    .filter((action): action is DeniedRuntimeAction => action !== null);

  const deniedActorIds = new Set<string>(deniedActions.map((deniedAction) => deniedAction.actorId));

  return {
    workflowRunId: input.workflowRunId,
    deniedActionCount: deniedActions.length,
    deniedActorCount: deniedActorIds.size,
    deniedActions,
  };
}
