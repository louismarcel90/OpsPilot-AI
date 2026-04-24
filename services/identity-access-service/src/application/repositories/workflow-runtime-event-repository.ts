import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';

export interface WorkflowRuntimeEventRepository {
  append(event: WorkflowRuntimeEvent): Promise<void>;
  listByWorkflowRunId(workflowRunId: string): Promise<WorkflowRuntimeEvent[]>;
}
