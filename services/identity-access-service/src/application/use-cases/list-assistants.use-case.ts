import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantDefinitionSummary } from '../../domain/assistants/assistant-definition-summary.js';

export class ListAssistantsUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
  ) {}

  public async execute(): Promise<AssistantDefinitionSummary[]> {
    return this.assistantDefinitionReadRepository.listAll();
  }
}
