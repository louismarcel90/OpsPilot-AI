export type RealtimeEventTopicKind = 'workflow_run';

export interface RealtimeEventTopic {
  readonly kind: RealtimeEventTopicKind;
  readonly resourceId: string;
}

export function serializeRealtimeEventTopic(topic: RealtimeEventTopic): string {
  return `${topic.kind}:${topic.resourceId}`;
}

export function createWorkflowRunRealtimeTopic(workflowRunId: string): RealtimeEventTopic {
  return {
    kind: 'workflow_run',
    resourceId: workflowRunId,
  };
}
