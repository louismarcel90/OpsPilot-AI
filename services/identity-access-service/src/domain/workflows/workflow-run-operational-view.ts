import type { ApprovalRequest } from '../approvals/approval-request.js';
import type { WorkflowRunStep } from './workflow-run-step.js';
import type { WorkflowRun } from './workflow-run.js';
import type { WorkflowRunOperationalSummary } from './workflow-run-operational-summary.js';

export interface WorkflowRunOperationalView {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
  readonly summary: WorkflowRunOperationalSummary;
}
