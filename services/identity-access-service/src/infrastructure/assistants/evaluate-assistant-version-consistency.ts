import type { AssistantVersionConsistencyCheck } from '../../domain/assistants/assistant-version-consistency-check.js';
import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

export function evaluateAssistantVersionConsistency(input: {
  readonly assistantId: string;
  readonly assistantSlug: string;
  readonly versions: AssistantVersionSummary[];
}): AssistantVersionConsistencyCheck {
  const publishedVersions = input.versions.filter(
    (version) => version.lifecycleStatus === 'published',
  );

  if (publishedVersions.length === 0) {
    return {
      assistantId: input.assistantId,
      assistantSlug: input.assistantSlug,
      status: 'no_published_version',
      isConsistent: true,
      publishedVersionCount: 0,
      publishedVersions,
      allVersions: input.versions,
    };
  }

  if (publishedVersions.length > 1) {
    return {
      assistantId: input.assistantId,
      assistantSlug: input.assistantSlug,
      status: 'multiple_published_versions',
      isConsistent: false,
      publishedVersionCount: publishedVersions.length,
      publishedVersions,
      allVersions: input.versions,
    };
  }

  return {
    assistantId: input.assistantId,
    assistantSlug: input.assistantSlug,
    status: 'consistent',
    isConsistent: true,
    publishedVersionCount: 1,
    publishedVersions,
    allVersions: input.versions,
  };
}
