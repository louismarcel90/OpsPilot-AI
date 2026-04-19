import type { AssistantDefinitionReadRepository } from '../repositories/assistant-definition-read-repository.js';
import type { WorkflowStepConsistencyResult } from '../../domain/workflows/workflow-step-consistency-result.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { ToolRegistry } from '../services/tool-registry.js';
import { evaluateWorkflowStepConsistency } from '../../infrastructure/workflows/evaluate-workflow-step-consistency.js';
import { evaluateWorkflowStepRegistryAlignment } from '../../infrastructure/workflows/evaluate-workflow-step-registry-alignment.js';

export class GetWorkflowStepRegistryAlignmentUseCase {
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
  }): Promise<WorkflowStepConsistencyResult | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    if (workflowTemplate === null) {
      return null;
    }

    const workflowVersion =
      await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
        workflowTemplateId: workflowTemplate.id,
        versionNumber: input.versionNumber,
      });

    if (workflowVersion === null) {
      return null;
    }

    const steps = await this.workflowStepReadRepository.listByWorkflowVersionId(workflowVersion.id);

    const structuralResult = evaluateWorkflowStepConsistency({
      workflowTemplate,
      workflowVersion,
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
      workflowTemplate,
      workflowVersion,
      isConsistent: issues.length === 0,
      issueCount: issues.length,
      issues,
    };
  }
}
