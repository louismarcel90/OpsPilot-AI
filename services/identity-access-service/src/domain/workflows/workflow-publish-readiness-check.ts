import type { WorkflowTemplateSummary } from './workflow-template-summary.js';
import type { WorkflowPublishReadinessReason } from './workflow-publish-readiness-reason.js';
import type { WorkflowPublishReadinessStatus } from './workflow-publish-readiness-status.js';
import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowPublishReadinessCheck {
  readonly workflowSlug: string;
  readonly requestedVersionNumber: number;
  readonly status: WorkflowPublishReadinessStatus;
  readonly isEligible: boolean;
  readonly reasons: WorkflowPublishReadinessReason[];
  readonly workflowTemplate?: WorkflowTemplateSummary;
  readonly targetVersion?: WorkflowVersionSummary;
  readonly currentPublishedVersion?: WorkflowVersionSummary;
}
