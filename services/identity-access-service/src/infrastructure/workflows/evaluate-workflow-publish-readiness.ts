import type { WorkflowTemplateSummary } from '../../domain/workflows/workflow-template-summary.js';
import type { WorkflowPublishReadinessCheck } from '../../domain/workflows/workflow-publish-readiness-check.js';
import type { WorkflowPublishReadinessReason } from '../../domain/workflows/workflow-publish-readiness-reason.js';
import type { WorkflowStepConsistencyResult } from '../../domain/workflows/workflow-step-consistency-result.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

export function evaluateWorkflowPublishReadiness(input: {
  readonly workflowSlug: string;
  readonly requestedVersionNumber: number;
  readonly workflowTemplate: WorkflowTemplateSummary | null;
  readonly allVersions: WorkflowVersionSummary[];
  readonly stepConsistencyResult?: WorkflowStepConsistencyResult;
}): WorkflowPublishReadinessCheck {
  if (input.workflowTemplate === null) {
    return {
      workflowSlug: input.workflowSlug,
      requestedVersionNumber: input.requestedVersionNumber,
      status: 'not_eligible',
      isEligible: false,
      reasons: ['workflow_not_found'],
    };
  }

  const targetVersion =
    input.allVersions.find((version) => version.versionNumber === input.requestedVersionNumber) ??
    null;

  if (targetVersion === null) {
    return {
      workflowSlug: input.workflowSlug,
      requestedVersionNumber: input.requestedVersionNumber,
      status: 'not_eligible',
      isEligible: false,
      reasons: ['version_not_found'],
      workflowTemplate: input.workflowTemplate,
    };
  }

  const reasons: WorkflowPublishReadinessReason[] = [];

  if (!input.workflowTemplate.isActive) {
    reasons.push('workflow_inactive');
  }

  if (targetVersion.lifecycleStatus === 'published') {
    reasons.push('version_already_published');
  }

  if (targetVersion.lifecycleStatus === 'deprecated') {
    reasons.push('version_deprecated');
  }

  if (targetVersion.triggerMode.trim().length === 0) {
    reasons.push('missing_trigger_mode');
  }

  if (targetVersion.definitionSummary.trim().length === 0) {
    reasons.push('missing_definition_summary');
  }

  const currentPublishedVersion =
    input.allVersions.find(
      (version) => version.lifecycleStatus === 'published' && version.id !== targetVersion.id,
    ) ?? null;

  if (currentPublishedVersion !== null) {
    reasons.push('another_published_version_exists');
  }

  if (input.stepConsistencyResult !== undefined && !input.stepConsistencyResult.isConsistent) {
    reasons.push('step_structure_inconsistent');
  }

  return {
    workflowSlug: input.workflowTemplate.slug,
    requestedVersionNumber: input.requestedVersionNumber,
    status: reasons.length === 0 ? 'eligible' : 'not_eligible',
    isEligible: reasons.length === 0,
    reasons,
    workflowTemplate: input.workflowTemplate,
    targetVersion,
    ...(currentPublishedVersion !== null ? { currentPublishedVersion } : {}),
  };
}
