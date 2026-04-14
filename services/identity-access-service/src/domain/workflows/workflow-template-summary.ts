export interface WorkflowTemplateSummary {
  readonly id: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly description: string;
  readonly isActive: boolean;
}
