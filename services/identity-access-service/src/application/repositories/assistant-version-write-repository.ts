import type { AssistantVersionLifecycleStatus } from '../../domain/assistants/assistant-version-lifecycle.js';
import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

export interface AssistantVersionWriteRepository {
  updateLifecycleStatus(input: {
    readonly versionId: string;
    readonly lifecycleStatus: AssistantVersionLifecycleStatus;
  }): Promise<void>;

  publishVersionTransition(input: {
    readonly targetVersionId: string;
    readonly previousPublishedVersionId?: string;
  }): Promise<void>;

  findById(versionId: string): Promise<AssistantVersionSummary | null>;
}
