import type { AssistantVersionSummary } from './assistant-version-summary.js';

export interface AssistantPublicationResult {
  readonly assistantSlug: string;
  readonly publishedVersion: AssistantVersionSummary;
  readonly deprecatedPreviousPublishedVersion?: AssistantVersionSummary;
}
