import type { WorkflowRuntimeCommandResult } from '../../domain/workflows/workflow-runtime-command-result.js';
import { resolveNextWorkflowRuntimeCommand } from '../../infrastructure/workflows/resolve-next-workflow-runtime-command.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { CompleteWorkflowRunStepUseCase } from './complete-workflow-run-step.use-case.js';
import type { StartWorkflowRunStepUseCase } from './start-workflow-run-step.use-case.js';
import type { StartWorkflowRunUseCase } from './start-workflow-run.use-case.js';

export class AdvanceWorkflowRunUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly startWorkflowRunUseCase: StartWorkflowRunUseCase,
    private readonly startWorkflowRunStepUseCase: StartWorkflowRunStepUseCase,
    private readonly completeWorkflowRunStepUseCase: CompleteWorkflowRunStepUseCase,
  ) {}

  public async execute(runId: string): Promise<WorkflowRuntimeCommandResult> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(runId);

    const command = resolveNextWorkflowRuntimeCommand({
      workflowRun,
      runSteps,
    });

    if (command.commandType === 'start_workflow_run') {
      await this.startWorkflowRunUseCase.execute(command.workflowRunId);

      return {
        command,
        executed: true,
        message: 'Workflow run was started.',
      };
    }

    if (command.commandType === 'start_workflow_run_step') {
      if (command.workflowRunStepId === undefined) {
        throw new Error('Runtime command is missing workflowRunStepId.');
      }

      await this.startWorkflowRunStepUseCase.execute(command.workflowRunStepId);

      return {
        command,
        executed: true,
        message: 'Workflow run step was started.',
      };
    }

    if (command.commandType === 'complete_workflow_run_step') {
      if (command.workflowRunStepId === undefined) {
        throw new Error('Runtime command is missing workflowRunStepId.');
      }

      await this.completeWorkflowRunStepUseCase.execute(command.workflowRunStepId);

      return {
        command,
        executed: true,
        message: 'Workflow run step was completed.',
      };
    }

    if (command.commandType === 'wait_for_approval') {
      return {
        command,
        executed: false,
        message: 'Workflow run is blocked and waiting for approval.',
      };
    }

    return {
      command,
      executed: false,
      message: 'No workflow runtime action was executed.',
    };
  }
}
