import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { WorkflowPublishReadinessCheck } from '../../domain/workflows/workflow-publish-readiness-check.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { ToolRegistry } from '../services/tool-registry.js';
import { evaluateWorkflowPublishReadiness } from '../../infrastructure/workflows/evaluate-workflow-publish-readiness.js';
import { evaluateWorkflowStepConsistency } from '../../infrastructure/workflows/evaluate-workflow-step-consistency.js';
import { evaluateWorkflowStepRegistryAlignment } from '../../infrastructure/workflows/evaluate-workflow-step-registry-alignment.js';

export class GetWorkflowPublishReadinessUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly assistantDefinitionReadRepository: AssistantDefinitionReadRepository,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<WorkflowPublishReadinessCheck> {
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

    const stepConsistencyResult =
      workflowTemplate === null || targetVersion === null
        ? undefined
        : await this.buildStepConsistencyResult({
            workflowTemplate,
            workflowVersion: targetVersion,
          });

    return evaluateWorkflowPublishReadiness({
      workflowSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      workflowTemplate,
      allVersions,
      ...(stepConsistencyResult !== undefined ? { stepConsistencyResult } : {}),
    });
  }

  private async buildStepConsistencyResult(input: {
    readonly workflowTemplate: Awaited<
      ReturnType<WorkflowTemplateReadRepository['findBySlug']>
    > extends infer T
      ? Exclude<T, null>
      : never;
    readonly workflowVersion: Awaited<
      ReturnType<WorkflowVersionReadRepository['findByWorkflowTemplateIdAndVersionNumber']>
    > extends infer T
      ? Exclude<T, null>
      : never;
  }) {
    const steps = await this.workflowStepReadRepository.listByWorkflowVersionId(
      input.workflowVersion.id,
    );

    const structuralResult = evaluateWorkflowStepConsistency({
      workflowTemplate: input.workflowTemplate,
      workflowVersion: input.workflowVersion,
      steps,
    });

    const assistants = await this.assistantDefinitionReadRepository.listAll();

    const assistantsSlugSet = new Set<string>(assistants.map((assistant) => assistant.slug));

    const registryIssues = evaluateWorkflowStepRegistryAlignment({
      steps,
      assistantsSlugSet,
      toolRegistry: this.toolRegistry,
    });

    const issues = [...structuralResult.issues, ...registryIssues];

    return {
      workflowTemplate: input.workflowTemplate,
      workflowVersion: input.workflowVersion,
      isConsistent: issues.length === 0,
      issueCount: issues.length,
      issues,
    };
  }
}
