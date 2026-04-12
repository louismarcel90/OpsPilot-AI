import type { AssistantVersionConsistencyCheck } from '../../domain/assistants/assistant-version-consistency-check.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';
import { evaluateAssistantVersionConsistency } from '../../infrastructure/assistants/evaluate-assistant-version-consistency.js';

export class GetAssistantVersionConsistencyUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<AssistantVersionConsistencyCheck | null> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(slug);

    if (assistant === null) {
      return null;
    }

    const versions = await this.assistantVersionReadRepository.listByAssistantId(assistant.id);

    return evaluateAssistantVersionConsistency({
      assistantId: assistant.id,
      assistantSlug: assistant.slug,
      versions,
    });
  }
}
