import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantDefinitionSummary } from '../../domain/assistants/assistant-definition-summary.js';

export class GetAssistantBySlugUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
  ) {}

  public async execute(slug: string): Promise<AssistantDefinitionSummary | null> {
    return this.assistantDefinitionReadRepository.findBySlug(slug);
  }
}
