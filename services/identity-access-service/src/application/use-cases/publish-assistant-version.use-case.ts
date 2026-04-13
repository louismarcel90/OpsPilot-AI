import type { AssistantPublicationResult } from '../../domain/assistants/assistant-publication-result.js';
import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';
import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { AssistantVersionReadRepository } from '../repositories/assistant-version-read-repository.js';
import type { AssistantVersionWriteRepository } from '../repositories/assistant-version-write-repository.js';
import { evaluateAssistantPublishReadiness } from '../../infrastructure/assistants/evaluate-assistant-publish-readiness.js';

export class PublishAssistantVersionUseCase {
  public constructor(
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly assistantVersionReadRepository: AssistantVersionReadRepository,
    private readonly assistantVersionWriteRepository: AssistantVersionWriteRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<AssistantPublicationResult> {
    const assistant = await this.assistantDefinitionReadRepository.findBySlug(input.slug);

    const allVersions =
      assistant === null
        ? []
        : await this.assistantVersionReadRepository.listByAssistantId(assistant.id);

    const readiness = evaluateAssistantPublishReadiness({
      assistantSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      assistant,
      allVersions,
    });

    if (
      !readiness.isEligible ||
      readiness.assistant === undefined ||
      readiness.targetVersion === undefined
    ) {
      throw new Error(
        `Assistant version is not publishable: ${readiness.reasons.join(',') || 'unknown_reason'}`,
      );
    }

    const previousPublishedVersion =
      allVersions.find(
        (version) =>
          version.lifecycleStatus === 'published' && version.id !== readiness.targetVersion?.id,
      ) ?? null;

    await this.assistantVersionWriteRepository.publishVersionTransition({
      targetVersionId: readiness.targetVersion.id,
      ...(previousPublishedVersion !== null
        ? { previousPublishedVersionId: previousPublishedVersion.id }
        : {}),
    });

    const publishedVersion = await this.assistantVersionWriteRepository.findById(
      readiness.targetVersion.id,
    );

    if (publishedVersion === null) {
      throw new Error('Published assistant version could not be reloaded after transition.');
    }

    let deprecatedPreviousPublishedVersion: AssistantVersionSummary | undefined;

    if (previousPublishedVersion !== null) {
      const reloadedPreviousPublishedVersion = await this.assistantVersionWriteRepository.findById(
        previousPublishedVersion.id,
      );

      if (reloadedPreviousPublishedVersion === null) {
        throw new Error(
          'Previous published assistant version could not be reloaded after transition.',
        );
      }

      deprecatedPreviousPublishedVersion = reloadedPreviousPublishedVersion;
    }

    return {
      assistantSlug: readiness.assistant.slug,
      publishedVersion,
      ...(deprecatedPreviousPublishedVersion !== undefined
        ? { deprecatedPreviousPublishedVersion }
        : {}),
    };
  }
}
