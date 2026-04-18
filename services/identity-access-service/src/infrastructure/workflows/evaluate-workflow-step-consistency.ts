import type { WorkflowStepConsistencyIssue } from '../../domain/workflows/workflow-step-consistency-issue.js';
import type { WorkflowStepConsistencyResult } from '../../domain/workflows/workflow-step-consistency-result.js';
import type { WorkflowStepDefinitionSummary } from '../../domain/workflows/workflow-step-definition-summary.js';
import type { WorkflowTemplateSummary } from '../../domain/workflows/workflow-template-summary.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

function hasNonEmptyValue(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

function evaluateStepIssues(step: WorkflowStepDefinitionSummary): WorkflowStepConsistencyIssue[] {
  const issues: WorkflowStepConsistencyIssue[] = [];

  if (step.stepType === 'ai_task') {
    if (!hasNonEmptyValue(step.assistantBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'missing_assistant_binding',
        message: 'AI task steps must define an assistant binding.',
      });
    }

    if (hasNonEmptyValue(step.toolBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unexpected_tool_binding',
        message: 'AI task steps must not define a tool binding.',
      });
    }
  }

  if (step.stepType === 'tool_task') {
    if (!hasNonEmptyValue(step.toolBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'missing_tool_binding',
        message: 'Tool task steps must define a tool binding.',
      });
    }

    if (hasNonEmptyValue(step.assistantBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unexpected_assistant_binding',
        message: 'Tool task steps must not define an assistant binding.',
      });
    }
  }

  if (step.stepType === 'approval_gate') {
    if (!step.approvalRequired) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'approval_gate_requires_approval',
        message: 'Approval gate steps must require approval.',
      });
    }
  }

  if (step.stepType === 'human_task') {
    if (hasNonEmptyValue(step.assistantBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unexpected_assistant_binding',
        message: 'Human task steps must not define an assistant binding.',
      });
    }

    if (hasNonEmptyValue(step.toolBinding)) {
      issues.push({
        stepId: step.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        code: 'unexpected_tool_binding',
        message: 'Human task steps must not define a tool binding.',
      });
    }
  }

  return issues;
}

export function evaluateWorkflowStepConsistency(input: {
  readonly workflowTemplate: WorkflowTemplateSummary;
  readonly workflowVersion: WorkflowVersionSummary;
  readonly steps: WorkflowStepDefinitionSummary[];
}): WorkflowStepConsistencyResult {
  const issues = input.steps.flatMap((step) => evaluateStepIssues(step));

  return {
    workflowTemplate: input.workflowTemplate,
    workflowVersion: input.workflowVersion,
    isConsistent: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
