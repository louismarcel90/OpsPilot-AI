import type { WorkflowEngineDiagnostics } from '../../domain/workflows/workflow-engine-diagnostics.js';
import type { WorkflowRuntimeCommandPreview } from '../../domain/workflows/workflow-runtime-command-preview.js';

function resolveEquivalentRuntimeEndpoint(
  diagnostics: WorkflowEngineDiagnostics,
): string | undefined {
  const command = diagnostics.nextCommand;

  if (command.commandType === 'start_workflow_run') {
    return `/workflow-runs/start?runId=${command.workflowRunId}`;
  }

  if (
    command.commandType === 'start_workflow_run_step' &&
    command.workflowRunStepId !== undefined
  ) {
    return `/workflow-runs/steps/start?runStepId=${command.workflowRunStepId}`;
  }

  if (
    command.commandType === 'complete_workflow_run_step' &&
    command.workflowRunStepId !== undefined
  ) {
    return `/workflow-runs/steps/complete?runStepId=${command.workflowRunStepId}`;
  }

  return undefined;
}

function resolveOperatorMessage(diagnostics: WorkflowEngineDiagnostics): string {
  const commandType = diagnostics.nextCommand.commandType;

  if (!diagnostics.isExecutable) {
    if (commandType === 'wait_for_approval') {
      return 'The workflow run is waiting for an approval decision before it can advance.';
    }

    if (commandType === 'no_op') {
      return 'The workflow engine has no executable command for the current run state.';
    }

    return 'The workflow engine command is not executable because runtime safeguards failed.';
  }

  if (commandType === 'start_workflow_run') {
    return 'The workflow engine would start the workflow run.';
  }

  if (commandType === 'start_workflow_run_step') {
    return 'The workflow engine would start the next ready workflow run step.';
  }

  if (commandType === 'complete_workflow_run_step') {
    return 'The workflow engine would complete the currently running workflow run step.';
  }

  return 'The workflow engine would not execute a state-changing command.';
}

export function projectWorkflowRuntimeCommandPreview(
  diagnostics: WorkflowEngineDiagnostics,
): WorkflowRuntimeCommandPreview {
  const equivalentRuntimeEndpoint = resolveEquivalentRuntimeEndpoint(diagnostics);

  const preview: WorkflowRuntimeCommandPreview = {
    workflowRunId: diagnostics.workflowRunId,
    executionMode: 'dry_run',
    command: diagnostics.nextCommand,
    wouldExecute: diagnostics.isExecutable,
    wouldMutateState: diagnostics.isExecutable,
    reasons: diagnostics.reasons,
    operatorMessage: resolveOperatorMessage(diagnostics),
  };

  if (equivalentRuntimeEndpoint !== undefined) {
    return {
      ...preview,
      equivalentRuntimeEndpoint,
    };
  }

  return preview;
}
