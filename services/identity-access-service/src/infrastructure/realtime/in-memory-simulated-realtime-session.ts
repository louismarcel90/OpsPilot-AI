import type {
  SimulatedRealtimeEvent,
  SimulatedRealtimeSession,
} from '../../domain/realtime/simulated-realtime-session.js';

export class InMemorySimulatedRealtimeSession {
  private readonly events: SimulatedRealtimeEvent[] = [];

  public constructor(private readonly workflowRunId: string) {}

  public connect(): SimulatedRealtimeSession {
    return {
      workflowRunId: this.workflowRunId,
      connectedAt: new Date().toISOString(),
      receivedEvents: [...this.events],
    };
  }

  public emit(eventType: string): void {
    this.events.push({
      eventType,
      emittedAt: new Date().toISOString(),
    });
  }

  public snapshot(): SimulatedRealtimeSession {
    return {
      workflowRunId: this.workflowRunId,
      connectedAt: new Date().toISOString(),
      receivedEvents: [...this.events],
    };
  }
}
