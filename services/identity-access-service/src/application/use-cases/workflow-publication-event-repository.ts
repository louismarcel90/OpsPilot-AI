import type { WorkflowPublicationEvent } from '../../domain/workflows/workflow-publication-event.js';

export interface WorkflowPublicationEventRepository {
  append(event: WorkflowPublicationEvent): Promise<void>;
  listByWorkflowTemplateId(workflowTemplateId: string): Promise<WorkflowPublicationEvent[]>;
  findLatestByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowPublicationEvent | null>;
}
