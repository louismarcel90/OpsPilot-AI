import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

export function findNextWorkflowRunStep(
  currentRunStep: WorkflowRunStep,
  allRunSteps: WorkflowRunStep[],
): WorkflowRunStep | null {
  const sortedSteps = allRunSteps
    .slice()
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber);

  const currentIndex = sortedSteps.findIndex((step) => step.id === currentRunStep.id);

  if (currentIndex === -1) {
    throw new Error('Current workflow run step is not part of the provided workflow run steps.');
  }

  const nextStep = sortedSteps[currentIndex + 1];

  return nextStep ?? null;
}
