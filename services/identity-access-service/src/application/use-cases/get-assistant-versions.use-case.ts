import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';
import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

export class GetAssistantVersionsUseCase {
  public constructor(
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
  ) {}

  public async execute(assistantId: string): Promise<AssistantVersionSummary[]> {
    return this.assistantVersionReadRepository.listByAssistantId(assistantId);
  }
}
