import type { AssistantWithVersionsView } from '../../domain/assistants/assistant-with-versions-view.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';

export class GetAssistantWithVersionsUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<AssistantWithVersionsView | null> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(slug);

    if (assistant === null) {
      return null;
    }

    const versions = await this.assistantVersionReadRepository.listByAssistantId(assistant.id);

    return {
      assistant,
      versions,
    };
  }
}
