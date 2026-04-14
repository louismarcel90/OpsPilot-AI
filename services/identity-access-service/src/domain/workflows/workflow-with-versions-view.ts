import type { WorkflowTemplateSummary } from './workflow-template-summary.js';
import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowWithVersionsView {
  readonly workflowTemplate: WorkflowTemplateSummary;
  readonly versions: WorkflowVersionSummary[];
}
