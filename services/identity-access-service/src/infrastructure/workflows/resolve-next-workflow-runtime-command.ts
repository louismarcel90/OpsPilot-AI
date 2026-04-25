import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import type { WorkflowRuntimeCommand } from '../../domain/workflows/workflow-runtime-command.js';

function findFirstStepByStatus(
  runSteps: WorkflowRunStep[],
  status: WorkflowRunStep['status'],
): WorkflowRunStep | null {
  const sortedSteps = runSteps
    .slice()
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber);

  return sortedSteps.find((runStep) => runStep.status === status) ?? null;
}

export function resolveNextWorkflowRuntimeCommand(input: {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
}): WorkflowRuntimeCommand {
  if (input.workflowRun.status === 'pending') {
    return {
      commandType: 'start_workflow_run',
      workflowRunId: input.workflowRun.id,
      reason: 'Workflow run is pending and must be started before step execution.',
    };
  }

  if (input.workflowRun.status === 'completed') {
    return {
      commandType: 'no_op',
      workflowRunId: input.workflowRun.id,
      reason: 'Workflow run is already completed.',
    };
  }

  if (input.workflowRun.status === 'failed') {
    return {
      commandType: 'no_op',
      workflowRunId: input.workflowRun.id,
      reason: 'Workflow run has failed and cannot advance.',
    };
  }

  const blockedStep = findFirstStepByStatus(input.runSteps, 'blocked');

  if (blockedStep !== null) {
    return {
      commandType: 'wait_for_approval',
      workflowRunId: input.workflowRun.id,
      workflowRunStepId: blockedStep.id,
      reason: 'Workflow run is waiting for approval before it can advance.',
    };
  }

  const runningStep = findFirstStepByStatus(input.runSteps, 'running');

  if (runningStep !== null) {
    return {
      commandType: 'complete_workflow_run_step',
      workflowRunId: input.workflowRun.id,
      workflowRunStepId: runningStep.id,
      reason: 'A workflow run step is running and can be completed by the engine.',
    };
  }

  const readyStep = findFirstStepByStatus(input.runSteps, 'ready');

  if (readyStep !== null) {
    return {
      commandType: 'start_workflow_run_step',
      workflowRunId: input.workflowRun.id,
      workflowRunStepId: readyStep.id,
      reason: 'A workflow run step is ready and can be started by the engine.',
    };
  }

  return {
    commandType: 'no_op',
    workflowRunId: input.workflowRun.id,
    reason: 'No actionable runtime command was found.',
  };
}
