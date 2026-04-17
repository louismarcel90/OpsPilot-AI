import type { WorkflowVersionLifecycleStatus } from '../../domain/workflows/workflow-version-lifecycle.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

export interface WorkflowVersionWriteRepository {
  updateLifecycleStatus(input: {
    readonly versionId: string;
    readonly lifecycleStatus: WorkflowVersionLifecycleStatus;
  }): Promise<void>;

  publishVersionTransition(input: {
    readonly targetVersionId: string;
    readonly previousPublishedVersionId?: string;
  }): Promise<void>;

  findById(versionId: string): Promise<WorkflowVersionSummary | null>;
}
