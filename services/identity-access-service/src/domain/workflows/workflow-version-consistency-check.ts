import type { WorkflowVersionConsistencyStatus } from './workflow-version-consistency-status.js';
import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowVersionConsistencyCheck {
  readonly workflowTemplateId: string;
  readonly workflowSlug: string;
  readonly status: WorkflowVersionConsistencyStatus;
  readonly isConsistent: boolean;
  readonly publishedVersionCount: number;
  readonly publishedVersions: WorkflowVersionSummary[];
  readonly allVersions: WorkflowVersionSummary[];
}
