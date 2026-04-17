import type { WorkflowVersionSummary } from './workflow-version-summary.js';

export interface WorkflowPublicationResult {
  readonly workflowSlug: string;
  readonly publishedVersion: WorkflowVersionSummary;
  readonly deprecatedPreviousPublishedVersion?: WorkflowVersionSummary;
}
