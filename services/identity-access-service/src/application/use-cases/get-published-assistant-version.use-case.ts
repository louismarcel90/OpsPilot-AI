import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';

export interface PublishedAssistantVersionView {
  readonly assistantId: string;
  readonly assistantSlug: string;
  readonly publishedVersion: AssistantVersionSummary | null;
}

export class GetPublishedAssistantVersionUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<PublishedAssistantVersionView | null> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(slug);

    if (assistant === null) {
      return null;
    }

    const publishedVersion =
      await this.assistantVersionReadRepository.findLatestPublishedByAssistantId(assistant.id);

    return {
      assistantId: assistant.id,
      assistantSlug: assistant.slug,
      publishedVersion,
    };
  }
}
