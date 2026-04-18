import type { WorkflowStepDefinitionSummary } from '../../domain/workflows/workflow-step-definition-summary.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';

export class GetWorkflowVersionStepsUseCase {
  public constructor(private readonly workflowStepReadRepository: WorkflowStepReadRepository) {}

  public async execute(workflowVersionId: string): Promise<WorkflowStepDefinitionSummary[]> {
    return this.workflowStepReadRepository.listByWorkflowVersionId(workflowVersionId);
  }
}
