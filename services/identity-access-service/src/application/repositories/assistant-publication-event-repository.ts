import type { AssistantPublicationEvent } from '../../domain/assistants/assistant-publication-event.js';

export interface AssistantPublicationEventRepository {
  append(event: AssistantPublicationEvent): Promise<void>;
  listByAssistantId(assistantId: string): Promise<AssistantPublicationEvent[]>;
  findLatestByAssistantId(assistantId: string): Promise<AssistantPublicationEvent | null>;
}
