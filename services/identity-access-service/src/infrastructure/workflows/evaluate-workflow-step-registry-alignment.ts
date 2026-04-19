import type { WorkflowStepConsistencyIssue } from '../../domain/workflows/workflow-step-consistency-issue.js';
import type { WorkflowStepDefinitionView } from '../../domain/workflows/workflow-step-definition-view.js';

export interface WorkflowStepRegistryAlignmentInput {
  readonly steps: WorkflowStepDefinitionView[];
  readonly assistantsSlugSet: ReadonlySet<string>;
  readonly toolRegistry: {
    hasTool(toolKey: string): boolean;
  };
}

function hasNonEmptyValue(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readAssistantBinding(step: WorkflowStepDefinitionView): string | undefined {
  if (!('assistantBinding' in step)) {
    return undefined;
  }

  const value = step.assistantBinding;

  return typeof value === 'string' ? value : undefined;
}

function readToolBinding(step: WorkflowStepDefinitionView): string | undefined {
  if (!('toolBinding' in step)) {
    return undefined;
  }

  const value = step.toolBinding;

  return typeof value === 'string' ? value : undefined;
}

export function evaluateWorkflowStepRegistryAlignment(
  input: WorkflowStepRegistryAlignmentInput,
): WorkflowStepConsistencyIssue[] {
  const issues: WorkflowStepConsistencyIssue[] = [];

  for (const step of input.steps) {
    const assistantBinding = readAssistantBinding(step);

    if (hasNonEmptyValue(assistantBinding) && !input.assistantsSlugSet.has(assistantBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unknown_assistant_binding',
        message: `Assistant binding "${assistantBinding}" does not match a known assistant slug.`,
      });
    }

    const toolBinding = readToolBinding(step);

    if (hasNonEmptyValue(toolBinding) && !input.toolRegistry.hasTool(toolBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unknown_tool_binding',
        message: `Tool binding "${toolBinding}" does not match a known tool key.`,
      });
    }
  }

  return issues;
}
