import type { WorkflowRunStepStatus } from './workflow-run-step-status.js';

export function canStartWorkflowRunStep(status: WorkflowRunStepStatus): boolean {
  return status === 'ready';
}

export function canCompleteWorkflowRunStep(status: WorkflowRunStepStatus): boolean {
  return status === 'running';
}

export function canFailWorkflowRunStep(status: WorkflowRunStepStatus): boolean {
  return status === 'running';
}
