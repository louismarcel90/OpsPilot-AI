import type { RealtimeEventTopic } from './realtime-event-topic.js';

export interface RealtimeEventEnvelope<
  TPayload extends Record<string, string | number | boolean | null>,
> {
  readonly id: string;
  readonly topic: RealtimeEventTopic;
  readonly eventType: string;
  readonly occurredAtIso: string;
  readonly payload: TPayload;
}
