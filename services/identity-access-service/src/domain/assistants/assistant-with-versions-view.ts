import type { AssistantDefinitionSummary } from './assistant-definition-summary.js';
import type { AssistantVersionSummary } from './assistant-version-summary.js';

export interface AssistantWithVersionsView {
  readonly assistant: AssistantDefinitionSummary;
  readonly versions: AssistantVersionSummary[];
}
