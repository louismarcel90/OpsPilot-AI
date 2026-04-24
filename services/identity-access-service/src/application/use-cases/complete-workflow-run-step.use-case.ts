import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canCompleteWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import { findNextWorkflowRunStep } from '../../infrastructure/workflows/find-next-workflow-run-step.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';

export class CompleteWorkflowRunStepUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
  ) {}

  public async execute(runStepId: string): Promise<WorkflowRunStep> {
    const workflowRunStep = await this.workflowRunStepReadRepository.findById(runStepId);

    if (workflowRunStep === null) {
      throw new Error('Workflow run step was not found.');
    }

    if (!canCompleteWorkflowRunStep(workflowRunStep.status)) {
      throw new Error(
        `Workflow run step cannot transition from "${workflowRunStep.status}" to "completed".`,
      );
    }

    const updatedRunStep = await this.workflowRunStepWriteRepository.completeRunStep(runStepId);

    if (updatedRunStep === null) {
      throw new Error('Workflow run step could not be completed.');
    }

    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during completion progression.');
    }

    const allRunSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(
      updatedRunStep.workflowRunId,
    );

    const nextRunStep = findNextWorkflowRunStep(updatedRunStep, allRunSteps);

    if (nextRunStep === null) {
      await this.completeWorkflowRunAfterFinalStep(updatedRunStep);
      return updatedRunStep;
    }

    if (nextRunStep.status !== 'pending') {
      return updatedRunStep;
    }

    await this.activateNextWorkflowRunStep({
      workflowRun,
      nextRunStep,
    });

    return updatedRunStep;
  }

  private async activateNextWorkflowRunStep(input: {
    readonly workflowRun: WorkflowRun;
    readonly nextRunStep: WorkflowRunStep;
  }): Promise<void> {
    const stepDefinitions = await this.workflowStepReadRepository.listByWorkflowVersionId(
      input.workflowRun.workflowVersionId,
    );

    const nextStepDefinition = stepDefinitions.find(
      (stepDefinition) => stepDefinition.id === input.nextRunStep.workflowStepDefinitionId,
    );

    if (nextStepDefinition === undefined) {
      throw new Error('Next workflow step definition was not found.');
    }

    if (nextStepDefinition.stepType === 'approval_gate') {
      const blockedRunStep = await this.workflowRunStepWriteRepository.markRunStepBlocked(
        input.nextRunStep.id,
      );

      if (blockedRunStep === null) {
        throw new Error('Approval-gate workflow run step could not be blocked.');
      }

      await this.approvalRequestWriteRepository.create({
        workflowRunId: input.workflowRun.id,
        workflowRunStepId: blockedRunStep.id,
        workspaceId: input.workflowRun.workspaceId,
      });

      return;
    }

    const markedReady = await this.workflowRunStepWriteRepository.markRunStepReady(
      input.nextRunStep.id,
    );

    if (markedReady === null) {
      throw new Error('Next workflow run step could not be marked ready.');
    }
  }

  private async completeWorkflowRunAfterFinalStep(updatedRunStep: WorkflowRunStep): Promise<void> {
    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during final completion.');
    }

    const completedRun = await this.workflowRunWriteRepository.completeRun(
      updatedRunStep.workflowRunId,
    );

    if (completedRun === null) {
      throw new Error('Workflow run could not be completed after final step completion.');
    }
  }
}
