import type { RealtimeEventTopic } from './realtime-event-topic.js';

export type RealtimeChannelHealthStatus = 'healthy';

export interface RealtimeChannelDiagnostics {
  readonly topic: RealtimeEventTopic;
  readonly serializedTopic: string;
  readonly subscriberCount: number;
  readonly healthStatus: RealtimeChannelHealthStatus;
  readonly transport: 'sse';
  readonly isInMemory: boolean;
  readonly generatedAtIso: string;
}
