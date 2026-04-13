export interface AssistantPublicationEvent {
  readonly id: string;
  readonly assistantId: string;
  readonly assistantSlug: string;
  readonly publishedVersionId: string;
  readonly publishedVersionNumber: number;
  readonly deprecatedVersionId?: string;
  readonly deprecatedVersionNumber?: number;
  readonly occurredAtIso: string;
}
