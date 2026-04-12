import type { AssistantDefinitionSummary } from './assistant-definition-summary.js';
import type { AssistantVersionSummary } from './assistant-version-summary.js';
import type { AssistantPublishReadinessReason } from './assistant-publish-readiness-reason.js';
import type { AssistantPublishReadinessStatus } from './assistant-publish-readiness-status.js';

export interface AssistantPublishReadinessCheck {
  readonly assistantSlug: string;
  readonly requestedVersionNumber: number;
  readonly status: AssistantPublishReadinessStatus;
  readonly isEligible: boolean;
  readonly reasons: AssistantPublishReadinessReason[];
  readonly assistant?: AssistantDefinitionSummary;
  readonly targetVersion?: AssistantVersionSummary;
  readonly currentPublishedVersion?: AssistantVersionSummary;
}
