import type { WorkflowRuntimeCommandResult } from '../../domain/workflows/workflow-runtime-command-result.js';
import type {
  WorkflowRuntimeDrainResult,
  WorkflowRuntimeDrainStopReason,
} from '../../domain/workflows/workflow-runtime-drain-result.js';
import type { AdvanceWorkflowRunUseCase } from './advance-workflow-run.use-case.js';

function resolveStopReason(
  commandResult: WorkflowRuntimeCommandResult,
): WorkflowRuntimeDrainStopReason | null {
  if (commandResult.command.commandType === 'wait_for_approval') {
    return 'waiting_for_approval';
  }

  if (
    commandResult.command.commandType === 'no_op' &&
    commandResult.command.reason.includes('completed')
  ) {
    return 'terminal_state_reached';
  }

  if (
    commandResult.command.commandType === 'no_op' &&
    commandResult.command.reason.includes('failed')
  ) {
    return 'terminal_state_reached';
  }

  if (commandResult.command.commandType === 'no_op') {
    return 'no_action_available';
  }

  return null;
}

export class DrainWorkflowRunUseCase {
  public constructor(private readonly advanceWorkflowRunUseCase: AdvanceWorkflowRunUseCase) {}

  public async execute(input: {
    readonly runId: string;
    readonly maxCommands: number;
  }): Promise<WorkflowRuntimeDrainResult> {
    const commandResults: WorkflowRuntimeCommandResult[] = [];

    let stopReason: WorkflowRuntimeDrainStopReason = 'max_commands_reached';

    for (let commandIndex = 0; commandIndex < input.maxCommands; commandIndex += 1) {
      const commandResult = await this.advanceWorkflowRunUseCase.execute(input.runId);

      commandResults.push(commandResult);

      const resolvedStopReason = resolveStopReason(commandResult);

      if (resolvedStopReason !== null) {
        stopReason = resolvedStopReason;
        break;
      }
    }

    const executedCommandCount = commandResults.filter(
      (commandResult) => commandResult.executed,
    ).length;

    return {
      workflowRunId: input.runId,
      executedCommandCount,
      attemptedCommandCount: commandResults.length,
      maxCommands: input.maxCommands,
      stopReason,
      commandResults,
    };
  }
}
