import { randomUUID } from 'node:crypto';

import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { WorkflowPublicationEventRepository } from './workflow-publication-event-repository.js';
import type { WorkflowPublicationResult } from '../../domain/workflows/workflow-publication-result.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowVersionWriteRepository } from '../repositories/workflow-version-write-repository.js';
import type { ToolRegistry } from '../services/tool-registry.js';
import { evaluateWorkflowPublishReadiness } from '../../infrastructure/workflows/evaluate-workflow-publish-readiness.js';
import { evaluateWorkflowStepConsistency } from '../../infrastructure/workflows/evaluate-workflow-step-consistency.js';
import { evaluateWorkflowStepRegistryAlignment } from '../../infrastructure/workflows/evaluate-workflow-step-registry-alignment.js';

export class PublishWorkflowVersionUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowVersionWriteRepository: WorkflowVersionWriteRepository,
    private readonly workflowPublicationEventRepository: WorkflowPublicationEventRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly toolRegistry: ToolRegistry,
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

    const targetVersion =
      workflowTemplate === null
        ? null
        : await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
            workflowTemplateId: workflowTemplate.id,
            versionNumber: input.versionNumber,
          });

    let stepConsistencyResult: ReturnType<typeof evaluateWorkflowStepConsistency> | undefined;

    if (workflowTemplate !== null && targetVersion !== null) {
      const steps = await this.workflowStepReadRepository.listByWorkflowVersionId(targetVersion.id);

      const structuralResult = evaluateWorkflowStepConsistency({
        workflowTemplate,
        workflowVersion: targetVersion,
        steps,
      });

      const assistants = await this.assistantDefinitionReadRepository.listAll();

      const assistantsSlugSet = new Set<string>(assistants.map((assistant) => assistant.slug));

      const registryIssues = evaluateWorkflowStepRegistryAlignment({
        steps,
        assistantsSlugSet,
        toolRegistry: this.toolRegistry,
      });

      stepConsistencyResult = {
        workflowTemplate,
        workflowVersion: targetVersion,
        isConsistent: structuralResult.issues.length + registryIssues.length === 0,
        issueCount: structuralResult.issues.length + registryIssues.length,
        issues: [...structuralResult.issues, ...registryIssues],
      };
    }

    const readiness = evaluateWorkflowPublishReadiness({
      workflowSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      workflowTemplate,
      allVersions,
      ...(stepConsistencyResult !== undefined ? { stepConsistencyResult } : {}),
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
    const resolvedTargetVersion = readiness.targetVersion;

    const previousPublishedVersion =
      allVersions.find(
        (version) =>
          version.lifecycleStatus === 'published' && version.id !== resolvedTargetVersion.id,
      ) ?? null;

    await this.workflowVersionWriteRepository.publishVersionTransition({
      targetVersionId: resolvedTargetVersion.id,
      ...(previousPublishedVersion !== null
        ? { previousPublishedVersionId: previousPublishedVersion.id }
        : {}),
    });

    const publishedVersion = await this.workflowVersionWriteRepository.findById(
      resolvedTargetVersion.id,
    );

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
