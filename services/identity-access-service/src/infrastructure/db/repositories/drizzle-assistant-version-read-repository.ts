import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { assistantVersionsTable } from '@opspilot/db';

import type { AssistantVersionReadRepository } from '../../../application/repositories/assistant-version-read-repository.js';
import type { AssistantVersionSummary } from '../../../domain/assistants/assistant-version-summary.js';

export class DrizzleAssistantVersionReadRepository implements AssistantVersionReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listByAssistantId(assistantId: string): Promise<AssistantVersionSummary[]> {
    return this.connection.db
      .select({
        id: assistantVersionsTable.id,
        assistantId: assistantVersionsTable.assistantId,
        versionNumber: assistantVersionsTable.versionNumber,
        lifecycleStatus: assistantVersionsTable.lifecycleStatus,
        modelKey: assistantVersionsTable.modelKey,
        systemInstructions: assistantVersionsTable.systemInstructions,
        temperature: assistantVersionsTable.temperature,
        maxOutputTokens: assistantVersionsTable.maxOutputTokens,
        changeSummary: assistantVersionsTable.changeSummary,
      })
      .from(assistantVersionsTable)
      .where(eq(assistantVersionsTable.assistantId, assistantId))
      .orderBy(asc(assistantVersionsTable.versionNumber));
  }
}
