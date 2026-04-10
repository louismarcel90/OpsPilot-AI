import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { assistantDefinitionsTable } from '@opspilot/db';

import type { AssistantDefinitionReadRepository } from '../../../application/repositories/assistant-definition-read-repository.js';
import type { AssistantDefinitionSummary } from '../../../domain/assistants/assistant-definition-summary.js';

export class DrizzleAssistantDefinitionReadRepository implements AssistantDefinitionReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listAll(): Promise<AssistantDefinitionSummary[]> {
    return this.connection.db
      .select({
        id: assistantDefinitionsTable.id,
        tenantId: assistantDefinitionsTable.tenantId,
        workspaceId: assistantDefinitionsTable.workspaceId,
        slug: assistantDefinitionsTable.slug,
        displayName: assistantDefinitionsTable.displayName,
        description: assistantDefinitionsTable.description,
        isActive: assistantDefinitionsTable.isActive,
      })
      .from(assistantDefinitionsTable)
      .orderBy(asc(assistantDefinitionsTable.displayName));
  }

  public async findBySlug(slug: string): Promise<AssistantDefinitionSummary | null> {
    const rows = await this.connection.db
      .select({
        id: assistantDefinitionsTable.id,
        tenantId: assistantDefinitionsTable.tenantId,
        workspaceId: assistantDefinitionsTable.workspaceId,
        slug: assistantDefinitionsTable.slug,
        displayName: assistantDefinitionsTable.displayName,
        description: assistantDefinitionsTable.description,
        isActive: assistantDefinitionsTable.isActive,
      })
      .from(assistantDefinitionsTable)
      .where(eq(assistantDefinitionsTable.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findById(assistantId: string): Promise<AssistantDefinitionSummary | null> {
    const rows = await this.connection.db
      .select({
        id: assistantDefinitionsTable.id,
        tenantId: assistantDefinitionsTable.tenantId,
        workspaceId: assistantDefinitionsTable.workspaceId,
        slug: assistantDefinitionsTable.slug,
        displayName: assistantDefinitionsTable.displayName,
        description: assistantDefinitionsTable.description,
        isActive: assistantDefinitionsTable.isActive,
      })
      .from(assistantDefinitionsTable)
      .where(eq(assistantDefinitionsTable.id, assistantId))
      .limit(1);

    return rows[0] ?? null;
  }
}
