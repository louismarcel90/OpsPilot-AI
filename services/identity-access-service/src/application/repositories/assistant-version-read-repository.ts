import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

export interface AssistantVersionReadRepository {
  listByAssistantId(assistantId: string): Promise<AssistantVersionSummary[]>;
}
