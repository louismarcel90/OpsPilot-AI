import type { AssistantPublicationEvent } from '../../domain/assistants/assistant-publication-event.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantPublicationEventRepository } from '../repositories/assistant-publication-event-repository.js';

export class GetAssistantPublicationHistoryUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantPublicationEventRepository: AssistantPublicationEventRepository,
  ) {}

  public async execute(slug: string): Promise<AssistantPublicationEvent[] | null> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(slug);

    if (assistant === null) {
      return null;
    }

    return this.assistantPublicationEventRepository.listByAssistantId(assistant.id);
  }
}
