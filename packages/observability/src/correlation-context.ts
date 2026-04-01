import type { TraceContext } from './trace-context.js';

export interface CorrelationContext {
  readonly correlationId: string;
  readonly trace?: TraceContext;
}
