import type { ServerResponse } from 'node:http';

import type { RealtimeEventPublisher } from '../../application/services/realtime-event-publisher.js';
import type { RealtimeChannelDiagnostics } from '../../domain/realtime/realtime-channel-diagnostics.js';
import type { RealtimeEventEnvelope } from '../../domain/realtime/realtime-event-envelope.js';
import {
  serializeRealtimeEventTopic,
  type RealtimeEventTopic,
} from '../../domain/realtime/realtime-event-topic.js';

interface RealtimeSubscriber {
  readonly id: string;
  readonly response: ServerResponse;
}

function writeSseEvent(input: {
  readonly response: ServerResponse;
  readonly eventName: string;
  readonly data:
    | Record<string, string | number | boolean | null>
    | RealtimeEventEnvelope<Record<string, string | number | boolean | null>>;
}): void {
  input.response.write(`event: ${input.eventName}\n`);
  input.response.write(`data: ${JSON.stringify(input.data)}\n\n`);
}

export class InMemoryRealtimeEventHub implements RealtimeEventPublisher {
  private readonly subscribersByTopic = new Map<string, RealtimeSubscriber[]>();

  public subscribe(input: {
    readonly subscriberId: string;
    readonly topic: RealtimeEventTopic;
    readonly response: ServerResponse;
  }): void {
    const topicKey = serializeRealtimeEventTopic(input.topic);
    const currentSubscribers = this.subscribersByTopic.get(topicKey) ?? [];

    this.subscribersByTopic.set(topicKey, [
      ...currentSubscribers,
      {
        id: input.subscriberId,
        response: input.response,
      },
    ]);

    writeSseEvent({
      response: input.response,
      eventName: 'connected',
      data: {
        subscriberId: input.subscriberId,
        topic: topicKey,
      },
    });
  }

  public unsubscribe(input: {
    readonly subscriberId: string;
    readonly topic: RealtimeEventTopic;
  }): void {
    const topicKey = serializeRealtimeEventTopic(input.topic);
    const currentSubscribers = this.subscribersByTopic.get(topicKey) ?? [];

    const nextSubscribers = currentSubscribers.filter(
      (subscriber) => subscriber.id !== input.subscriberId,
    );

    if (nextSubscribers.length === 0) {
      this.subscribersByTopic.delete(topicKey);
      return;
    }

    this.subscribersByTopic.set(topicKey, nextSubscribers);
  }

  public async publish(
    envelope: RealtimeEventEnvelope<Record<string, string | number | boolean | null>>,
  ): Promise<void> {
    const topicKey = serializeRealtimeEventTopic(envelope.topic);
    const subscribers = this.subscribersByTopic.get(topicKey) ?? [];

    for (const subscriber of subscribers) {
      writeSseEvent({
        response: subscriber.response,
        eventName: envelope.eventType,
        data: envelope,
      });
    }
  }

  public getSubscriberCount(topic: RealtimeEventTopic): number {
    const topicKey = serializeRealtimeEventTopic(topic);
    return this.subscribersByTopic.get(topicKey)?.length ?? 0;
  }

  public getTopicDiagnostics(topic: RealtimeEventTopic): RealtimeChannelDiagnostics {
    return {
      topic,
      serializedTopic: serializeRealtimeEventTopic(topic),
      subscriberCount: this.getSubscriberCount(topic),
      healthStatus: 'healthy',
      transport: 'sse',
      isInMemory: true,
      generatedAtIso: new Date().toISOString(),
    };
  }
}
