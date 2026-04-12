import type { AssistantPublishReadinessCheck } from '../../domain/assistants/assistant-publish-readiness-check.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';
import { evaluateAssistantPublishReadiness } from '../../infrastructure/assistants/evaluate-assistant-publish-readiness.js';

export class GetAssistantPublishReadinessUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<AssistantPublishReadinessCheck> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(input.slug);

    const allVersions =
      assistant === null
        ? []
        : await this.assistantVersionReadRepository.listByAssistantId(assistant.id);

    return evaluateAssistantPublishReadiness({
      assistantSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      assistant,
      allVersions,
    });
  }
}
