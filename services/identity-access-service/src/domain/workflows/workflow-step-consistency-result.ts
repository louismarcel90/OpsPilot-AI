import type { WorkflowStepConsistencyIssue } from './workflow-step-consistency-issue.js';
import type { WorkflowTemplateSummary } from './workflow-template-summary.js';
import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowStepConsistencyResult {
  readonly workflowTemplate: WorkflowTemplateSummary;
  readonly workflowVersion: WorkflowVersionSummary;
  readonly isConsistent: boolean;
  readonly issueCount: number;
  readonly issues: WorkflowStepConsistencyIssue[];
}
