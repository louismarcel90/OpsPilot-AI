import type { WorkflowRuntimeEventType } from './workflow-runtime-event-type.js';

export const WORKFLOW_RUNTIME_EVENT_CATEGORY_VALUES = [
  'workflow_run',
  'workflow_step',
  'approval',
  'authorization',
  'unknown',
] as const;

export type WorkflowRuntimeEventCategory = (typeof WORKFLOW_RUNTIME_EVENT_CATEGORY_VALUES)[number];

export function resolveWorkflowRuntimeEventCategory(
  eventType: WorkflowRuntimeEventType,
): WorkflowRuntimeEventCategory {
  if (
    eventType === 'workflow_run_created' ||
    eventType === 'workflow_run_started' ||
    eventType === 'workflow_run_completed' ||
    eventType === 'workflow_run_failed'
  ) {
    return 'workflow_run';
  }

  if (
    eventType === 'workflow_run_step_started' ||
    eventType === 'workflow_run_step_completed' ||
    eventType === 'workflow_run_step_failed' ||
    eventType === 'workflow_run_step_blocked' ||
    eventType === 'workflow_run_step_ready'
  ) {
    return 'workflow_step';
  }

  if (
    eventType === 'approval_request_created' ||
    eventType === 'approval_request_approved' ||
    eventType === 'approval_request_rejected'
  ) {
    return 'approval';
  }

  if (
    eventType === 'runtime_authorization_allowed' ||
    eventType === 'runtime_authorization_denied'
  ) {
    return 'authorization';
  }

  return 'unknown';
}
