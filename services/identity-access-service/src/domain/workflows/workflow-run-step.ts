import type { WorkflowRunStepStatus } from './workflow-run-step-status.js';

export interface WorkflowRunStep {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workflowStepDefinitionId: string;
  readonly sequenceNumber: number;
  readonly status: WorkflowRunStepStatus;
  readonly startedAtIso?: string;
  readonly completedAtIso?: string;
}
