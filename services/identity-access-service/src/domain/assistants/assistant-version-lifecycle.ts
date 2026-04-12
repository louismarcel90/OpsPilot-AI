export const ASSISTANT_VERSION_LIFECYCLE_VALUES = ['draft', 'published', 'deprecated'] as const;

export type AssistantVersionLifecycleStatus = (typeof ASSISTANT_VERSION_LIFECYCLE_VALUES)[number];

export function isAssistantVersionLifecycleStatus(
  value: string,
): value is AssistantVersionLifecycleStatus {
  return ASSISTANT_VERSION_LIFECYCLE_VALUES.includes(value as AssistantVersionLifecycleStatus);
}

export function isPublishedAssistantVersionLifecycleStatus(
  value: AssistantVersionLifecycleStatus,
): boolean {
  return value === 'published';
}
