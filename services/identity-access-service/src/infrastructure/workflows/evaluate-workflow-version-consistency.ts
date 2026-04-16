import type { WorkflowVersionConsistencyCheck } from '../../domain/workflows/workflow-version-consistency-check.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

export function evaluateWorkflowVersionConsistency(input: {
  readonly workflowTemplateId: string;
  readonly workflowSlug: string;
  readonly versions: WorkflowVersionSummary[];
}): WorkflowVersionConsistencyCheck {
  const publishedVersions = input.versions.filter(
    (version) => version.lifecycleStatus === 'published',
  );

  if (publishedVersions.length === 0) {
    return {
      workflowTemplateId: input.workflowTemplateId,
      workflowSlug: input.workflowSlug,
      status: 'no_published_version',
      isConsistent: true,
      publishedVersionCount: 0,
      publishedVersions,
      allVersions: input.versions,
    };
  }

  if (publishedVersions.length > 1) {
    return {
      workflowTemplateId: input.workflowTemplateId,
      workflowSlug: input.workflowSlug,
      status: 'multiple_published_versions',
      isConsistent: false,
      publishedVersionCount: publishedVersions.length,
      publishedVersions,
      allVersions: input.versions,
    };
  }

  return {
    workflowTemplateId: input.workflowTemplateId,
    workflowSlug: input.workflowSlug,
    status: 'consistent',
    isConsistent: true,
    publishedVersionCount: 1,
    publishedVersions,
    allVersions: input.versions,
  };
}
