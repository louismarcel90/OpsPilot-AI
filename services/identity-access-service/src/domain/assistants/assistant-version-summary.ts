export interface AssistantVersionSummary {
  readonly id: string;
  readonly assistantId: string;
  readonly versionNumber: number;
  readonly lifecycleStatus: string;
  readonly modelKey: string;
  readonly systemInstructions: string;
  readonly temperature: string;
  readonly maxOutputTokens: number;
  readonly changeSummary: string;
}
