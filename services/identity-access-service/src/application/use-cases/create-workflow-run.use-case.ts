import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';

export class CreateWorkflowRunUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly workspaceId: string;
  }): Promise<WorkflowRun> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    if (workflowTemplate === null) {
      throw new Error('Workflow template was not found.');
    }

    const publishedVersion =
      await this.workflowVersionReadRepository.findPublishedByWorkflowTemplateId(
        workflowTemplate.id,
      );

    if (publishedVersion === null) {
      throw new Error('Workflow template has no published version.');
    }

    return this.workflowRunWriteRepository.create({
      workflowVersionId: publishedVersion.id,
      workspaceId: input.workspaceId,
    });
  }
}
