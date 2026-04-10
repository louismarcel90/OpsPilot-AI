import type { AssistantDefinitionSummary } from '../../domain/assistants/assistant-definition-summary.js';

export interface AssistantDefinitionReadRepository {
  listAll(): Promise<AssistantDefinitionSummary[]>;
  findBySlug(slug: string): Promise<AssistantDefinitionSummary | null>;
  findById(assistantId: string): Promise<AssistantDefinitionSummary | null>;
}
