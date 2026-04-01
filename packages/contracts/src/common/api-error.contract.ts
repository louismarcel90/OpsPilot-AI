export interface ApiErrorContract {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly details?: string[];
}
