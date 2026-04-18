import type { WorkflowPublicationEvent } from '../../domain/workflows/workflow-publication-event.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowPublicationEventRepository } from './workflow-publication-event-repository.js';

export class GetWorkflowLatestPublicationUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowPublicationEventRepository: WorkflowPublicationEventRepository,
  ) {}

  public async execute(slug: string): Promise<WorkflowPublicationEvent | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(slug);

    if (workflowTemplate === null) {
      return null;
    }

    return this.workflowPublicationEventRepository.findLatestByWorkflowTemplateId(
      workflowTemplate.id,
    );
  }
}
