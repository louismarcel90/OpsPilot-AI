import type { AssistantVersionConsistencyStatus } from './assistant-version-consistency-status.js';
import type { AssistantVersionSummary } from './assistant-version-summary.js';

export interface AssistantVersionConsistencyCheck {
  readonly assistantId: string;
  readonly assistantSlug: string;
  readonly status: AssistantVersionConsistencyStatus;
  readonly isConsistent: boolean;
  readonly publishedVersionCount: number;
  readonly publishedVersions: AssistantVersionSummary[];
  readonly allVersions: AssistantVersionSummary[];
}
