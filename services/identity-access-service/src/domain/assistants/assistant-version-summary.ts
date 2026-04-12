import type { AssistantVersionLifecycleStatus } from './assistant-version-lifecycle.js';

export interface AssistantVersionSummary {
  readonly id: string;
  readonly assistantId: string;
  readonly versionNumber: number;
  readonly lifecycleStatus: AssistantVersionLifecycleStatus;
  readonly modelKey: string;
  readonly systemInstructions: string;
  readonly temperature: string;
  readonly maxOutputTokens: number;
  readonly changeSummary: string;
}
