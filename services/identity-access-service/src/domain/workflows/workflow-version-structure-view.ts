import type { WorkflowStepDefinitionSummary } from './workflow-step-definition-summary.js';
import type { WorkflowTemplateSummary } from './workflow-template-summary.js';
import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowVersionStructureView {
  readonly workflowTemplate: WorkflowTemplateSummary;
  readonly workflowVersion: WorkflowVersionSummary;
  readonly steps: WorkflowStepDefinitionSummary[];
}
