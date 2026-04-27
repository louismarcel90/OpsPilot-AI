import type { RealtimeEventEnvelope } from '../../domain/realtime/realtime-event-envelope.js';

export interface RealtimeEventPublisher {
  publish(
    envelope: RealtimeEventEnvelope<Record<string, string | number | boolean | null>>,
  ): Promise<void>;
}
