import type { RealtimeEventTopic } from './realtime-event-topic.js';

export type RealtimeStreamStalenessStatus = 'fresh' | 'stale' | 'inactive';

export interface RealtimeStreamStaleness {
  readonly topic: RealtimeEventTopic;
  readonly serializedTopic: string;
  readonly status: RealtimeStreamStalenessStatus;
  readonly subscriberCount: number;
  readonly lastPublishedEventAtIso?: string;
  readonly ageMs?: number;
  readonly staleThresholdMs: number;
  readonly shouldReconnect: boolean;
  readonly recommendation: string;
  readonly generatedAtIso: string;
}
