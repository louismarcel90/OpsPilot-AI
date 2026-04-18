export interface WorkflowPublicationEvent {
  readonly id: string;
  readonly workflowTemplateId: string;
  readonly workflowSlug: string;
  readonly publishedVersionId: string;
  readonly publishedVersionNumber: number;
  readonly deprecatedVersionId?: string;
  readonly deprecatedVersionNumber?: number;
  readonly occurredAtIso: string;
}
