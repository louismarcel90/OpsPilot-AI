import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

export interface WorkflowRunStepWriteRepository {
  createInitialRunSteps(input: {
    readonly workflowRunId: string;
    readonly stepDefinitions: Array<{
      readonly workflowStepDefinitionId: string;
      readonly sequenceNumber: number;
    }>;
  }): Promise<WorkflowRunStep[]>;
}
