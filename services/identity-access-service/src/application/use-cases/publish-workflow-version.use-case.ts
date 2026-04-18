import { randomUUID } from 'node:crypto';

import type { WorkflowPublicationEventRepository } from './workflow-publication-event-repository.js';
import type { WorkflowPublicationResult } from '../../domain/workflows/workflow-publication-result.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowVersionWriteRepository } from '../repositories/workflow-version-write-repository.js';
import { evaluateWorkflowPublishReadiness } from '../../infrastructure/workflows/evaluate-workflow-publish-readiness.js';

export class PublishWorkflowVersionUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowVersionWriteRepository: WorkflowVersionWriteRepository,
    private readonly workflowPublicationEventRepository: WorkflowPublicationEventRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<WorkflowPublicationResult> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    const allVersions =
      workflowTemplate === null
        ? []
        : await this.workflowVersionReadRepository.listByWorkflowTemplateId(workflowTemplate.id);

    const readiness = evaluateWorkflowPublishReadiness({
      workflowSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      workflowTemplate,
      allVersions,
    });

    if (
      !readiness.isEligible ||
      readiness.workflowTemplate === undefined ||
      readiness.targetVersion === undefined
    ) {
      throw new Error(
        `Workflow version is not publishable: ${readiness.reasons.join(',') || 'unknown_reason'}`,
      );
    }

    const resolvedWorkflowTemplate = readiness.workflowTemplate;
    const targetVersion = readiness.targetVersion;

    const previousPublishedVersion =
      allVersions.find(
        (version) => version.lifecycleStatus === 'published' && version.id !== targetVersion.id,
      ) ?? null;

    await this.workflowVersionWriteRepository.publishVersionTransition({
      targetVersionId: targetVersion.id,
      ...(previousPublishedVersion !== null
        ? { previousPublishedVersionId: previousPublishedVersion.id }
        : {}),
    });

    const publishedVersion = await this.workflowVersionWriteRepository.findById(targetVersion.id);

    if (publishedVersion === null) {
      throw new Error('Published workflow version could not be reloaded after transition.');
    }

    let deprecatedPreviousPublishedVersion: WorkflowVersionSummary | undefined;

    if (previousPublishedVersion !== null) {
      const reloadedPreviousPublishedVersion = await this.workflowVersionWriteRepository.findById(
        previousPublishedVersion.id,
      );

      if (reloadedPreviousPublishedVersion === null) {
        throw new Error(
          'Previous published workflow version could not be reloaded after transition.',
        );
      }

      deprecatedPreviousPublishedVersion = reloadedPreviousPublishedVersion;
    }

    await this.workflowPublicationEventRepository.append({
      id: randomUUID(),
      workflowTemplateId: resolvedWorkflowTemplate.id,
      workflowSlug: resolvedWorkflowTemplate.slug,
      publishedVersionId: publishedVersion.id,
      publishedVersionNumber: publishedVersion.versionNumber,
      ...(deprecatedPreviousPublishedVersion !== undefined
        ? { deprecatedVersionId: deprecatedPreviousPublishedVersion.id }
        : {}),
      ...(deprecatedPreviousPublishedVersion !== undefined
        ? { deprecatedVersionNumber: deprecatedPreviousPublishedVersion.versionNumber }
        : {}),
      occurredAtIso: new Date().toISOString(),
    });

    return {
      workflowSlug: resolvedWorkflowTemplate.slug,
      publishedVersion,
      ...(deprecatedPreviousPublishedVersion !== undefined
        ? { deprecatedPreviousPublishedVersion }
        : {}),
    };
  }
}
