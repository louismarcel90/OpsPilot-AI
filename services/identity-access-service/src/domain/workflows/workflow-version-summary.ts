export interface WorkflowVersionSummary {
  readonly id: string;
  readonly workflowTemplateId: string;
  readonly versionNumber: number;
  readonly lifecycleStatus: string;
  readonly triggerMode: string;
  readonly definitionSummary: string;
  readonly changeSummary: string;
}
