export const WORKFLOW_VERSION_LIFECYCLE_VALUES = ['draft', 'published', 'deprecated'] as const;

export type WorkflowVersionLifecycleStatus = (typeof WORKFLOW_VERSION_LIFECYCLE_VALUES)[number];

export function isWorkflowVersionLifecycleStatus(
  value: string,
): value is WorkflowVersionLifecycleStatus {
  return WORKFLOW_VERSION_LIFECYCLE_VALUES.includes(value as WorkflowVersionLifecycleStatus);
}

export function isPublishedWorkflowVersionLifecycleStatus(
  value: WorkflowVersionLifecycleStatus,
): boolean {
  return value === 'published';
}
