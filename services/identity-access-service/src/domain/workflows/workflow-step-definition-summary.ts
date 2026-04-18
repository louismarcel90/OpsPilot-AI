import type { WorkflowStepType } from './workflow-step-type.js';

export interface WorkflowStepDefinitionSummary {
  readonly id: string;
  readonly workflowVersionId: string;
  readonly stepKey: string;
  readonly displayName: string;
  readonly description: string;
  readonly stepType: WorkflowStepType;
  readonly sequenceNumber: number;
  readonly isRequired: boolean;
}
