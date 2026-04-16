import type { WorkflowVersionLifecycleStatus } from './workflow-version-lifecycle.js';

export interface WorkflowVersionSummary {
  readonly id: string;
  readonly workflowTemplateId: string;
  readonly versionNumber: number;
  readonly lifecycleStatus: WorkflowVersionLifecycleStatus;
  readonly triggerMode: string;
  readonly definitionSummary: string;
  readonly changeSummary: string;
}
