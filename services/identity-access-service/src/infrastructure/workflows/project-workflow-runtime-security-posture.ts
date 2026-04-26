import type { RuntimeAuthorizationActivitySummary } from '../../domain/runtime/runtime-authorization-activity-summary.js';
import type { WorkflowRunDiagnostics } from '../../domain/workflows/workflow-run-diagnostics.js';
import type {
  WorkflowRuntimeSecurityPosture,
  WorkflowRuntimeSecurityPostureIndicator,
  WorkflowRuntimeSecurityRiskLevel,
} from '../../domain/workflows/workflow-runtime-security-posture.js';

function resolveHighestRiskLevel(
  indicators: WorkflowRuntimeSecurityPostureIndicator[],
): WorkflowRuntimeSecurityRiskLevel {
  if (indicators.some((indicator) => indicator.severity === 'high')) {
    return 'high';
  }

  if (indicators.some((indicator) => indicator.severity === 'medium')) {
    return 'medium';
  }

  return 'low';
}

export function projectWorkflowRuntimeSecurityPosture(input: {
  readonly workflowRunId: string;
  readonly authorizationActivity: RuntimeAuthorizationActivitySummary;
  readonly diagnostics: WorkflowRunDiagnostics;
}): WorkflowRuntimeSecurityPosture {
  const indicators: WorkflowRuntimeSecurityPostureIndicator[] = [];

  if (input.authorizationActivity.deniedActionCount > 0) {
    indicators.push({
      code: 'denied_runtime_actions_detected',
      message: 'One or more protected runtime actions were denied.',
      severity: 'medium',
    });
  }

  if (input.authorizationActivity.actorCount > 1) {
    indicators.push({
      code: 'multiple_runtime_actors_detected',
      message: 'More than one actor interacted with protected runtime operations.',
      severity: 'medium',
    });
  }

  if (input.diagnostics.summary.rejectedApprovalCount > 0) {
    indicators.push({
      code: 'rejected_approval_detected',
      message: 'At least one approval request was rejected.',
      severity: 'high',
    });
  }

  if (input.diagnostics.summary.failedStepCount > 0) {
    indicators.push({
      code: 'failed_step_detected',
      message: 'At least one workflow run step failed.',
      severity: 'high',
    });
  }

  if (input.diagnostics.violationCount > 0) {
    indicators.push({
      code: 'runtime_invariant_violations_detected',
      message: 'Runtime invariant violations were detected.',
      severity: 'high',
    });
  }

  if (indicators.length === 0) {
    indicators.push({
      code: 'no_security_risk_detected',
      message: 'No runtime security posture risk indicators were detected.',
      severity: 'low',
    });
  }

  return {
    workflowRunId: input.workflowRunId,
    riskLevel: resolveHighestRiskLevel(indicators),
    deniedActionCount: input.authorizationActivity.deniedActionCount,
    allowedActionCount: input.authorizationActivity.allowedActionCount,
    authorizationDecisionCount: input.authorizationActivity.totalAuthorizationDecisionCount,
    authorizationActorCount: input.authorizationActivity.actorCount,
    rejectedApprovalCount: input.diagnostics.summary.rejectedApprovalCount,
    failedStepCount: input.diagnostics.summary.failedStepCount,
    invariantViolationCount: input.diagnostics.violationCount,
    indicators,
  };
}
