import type { WorkflowRunStatus } from './workflow-run-status.js';

export function canStartWorkflowRun(status: WorkflowRunStatus): boolean {
  return status === 'pending';
}

export function canCompleteWorkflowRun(status: WorkflowRunStatus): boolean {
  return status === 'running';
}

export function canFailWorkflowRun(status: WorkflowRunStatus): boolean {
  return status === 'running';
}
