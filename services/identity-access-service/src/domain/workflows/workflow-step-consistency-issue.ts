import type { WorkflowStepConsistencyIssueCode } from './workflow-step-consistency-issue-code.js';
import type { WorkflowStepType } from './workflow-step-type.js';

export interface WorkflowStepConsistencyIssue {
  readonly stepId: string;
  readonly stepKey: string;
  readonly stepType: WorkflowStepType;
  readonly code: WorkflowStepConsistencyIssueCode;
  readonly message: string;
}
