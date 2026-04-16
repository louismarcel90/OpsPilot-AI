import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

export interface AssistantVersionReadRepository {
  listByAssistantId(assistantId: string): Promise<AssistantVersionSummary[]>;

  findByAssistantIdAndVersionNumber(
    assistantId: string,
    versionNumber: number,
  ): Promise<AssistantVersionSummary | null>;

  findLatestPublishedByAssistantId(assistantId: string): Promise<AssistantVersionSummary | null>;
}
