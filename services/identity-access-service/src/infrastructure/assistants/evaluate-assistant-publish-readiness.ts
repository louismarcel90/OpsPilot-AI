import type { AssistantDefinitionSummary } from '../../domain/assistants/assistant-definition-summary.js';
import type { AssistantPublishReadinessCheck } from '../../domain/assistants/assistant-publish-readiness-check.js';
import type { AssistantPublishReadinessReason } from '../../domain/assistants/assistant-publish-readiness-reason.js';
import type { AssistantVersionSummary } from '../../domain/assistants/assistant-version-summary.js';

function parseTemperature(value: string): number {
  return Number(value);
}

export function evaluateAssistantPublishReadiness(input: {
  readonly assistantSlug: string;
  readonly requestedVersionNumber: number;
  readonly assistant: AssistantDefinitionSummary | null;
  readonly allVersions: AssistantVersionSummary[];
}): AssistantPublishReadinessCheck {
  if (input.assistant === null) {
    return {
      assistantSlug: input.assistantSlug,
      requestedVersionNumber: input.requestedVersionNumber,
      status: 'not_eligible',
      isEligible: false,
      reasons: ['assistant_not_found'],
    };
  }

  const targetVersion =
    input.allVersions.find((version) => version.versionNumber === input.requestedVersionNumber) ??
    null;

  if (targetVersion === null) {
    return {
      assistantSlug: input.assistantSlug,
      requestedVersionNumber: input.requestedVersionNumber,
      status: 'not_eligible',
      isEligible: false,
      reasons: ['version_not_found'],
      assistant: input.assistant,
    };
  }

  const reasons: AssistantPublishReadinessReason[] = [];

  if (!input.assistant.isActive) {
    reasons.push('assistant_inactive');
  }

  if (targetVersion.lifecycleStatus === 'published') {
    reasons.push('version_already_published');
  }

  if (targetVersion.lifecycleStatus === 'deprecated') {
    reasons.push('version_deprecated');
  }

  if (targetVersion.modelKey.trim().length === 0) {
    reasons.push('missing_model_key');
  }

  if (targetVersion.systemInstructions.trim().length === 0) {
    reasons.push('missing_system_instructions');
  }

  if (targetVersion.maxOutputTokens <= 0) {
    reasons.push('invalid_max_output_tokens');
  }

  const parsedTemperature = parseTemperature(targetVersion.temperature);

  if (Number.isNaN(parsedTemperature) || parsedTemperature < 0) {
    reasons.push('invalid_temperature');
  }

  const currentPublishedVersion =
    input.allVersions.find(
      (version) => version.lifecycleStatus === 'published' && version.id !== targetVersion.id,
    ) ?? null;

  if (currentPublishedVersion !== null) {
    reasons.push('another_published_version_exists');
  }

  return {
    assistantSlug: input.assistant.slug,
    requestedVersionNumber: input.requestedVersionNumber,
    status: reasons.length === 0 ? 'eligible' : 'not_eligible',
    isEligible: reasons.length === 0,
    reasons,
    assistant: input.assistant,
    targetVersion,
    ...(currentPublishedVersion !== null ? { currentPublishedVersion } : {}),
  };
}
