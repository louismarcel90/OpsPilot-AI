export interface SimulatedRealtimeEvent {
  readonly eventType: string;
  readonly emittedAt: string;
}

export interface SimulatedRealtimeSession {
  readonly workflowRunId: string;
  readonly connectedAt: string;
  readonly receivedEvents: SimulatedRealtimeEvent[];
}
