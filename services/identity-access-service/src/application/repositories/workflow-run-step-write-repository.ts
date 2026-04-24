import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

export interface WorkflowRunStepWriteRepository {
  createInitialRunSteps(input: {
    readonly workflowRunId: string;
    readonly stepDefinitions: Array<{
      readonly workflowStepDefinitionId: string;
      readonly sequenceNumber: number;
    }>;
  }): Promise<WorkflowRunStep[]>;

  startRunStep(runStepId: string): Promise<WorkflowRunStep | null>;

  completeRunStep(runStepId: string): Promise<WorkflowRunStep | null>;

  failRunStep(runStepId: string): Promise<WorkflowRunStep | null>;

  markRunStepReady(runStepId: string): Promise<WorkflowRunStep | null>;

  markRunStepBlocked(runStepId: string): Promise<WorkflowRunStep | null>;
}
