import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { assistantVersionsTable } from '@opspilot/db';

import type { AssistantVersionWriteRepository } from '../../../application/repositories/assistant-version-write-repository.js';
import type { AssistantVersionLifecycleStatus } from '../../../domain/assistants/assistant-version-lifecycle.js';
import type { AssistantVersionSummary } from '../../../domain/assistants/assistant-version-summary.js';
import { isAssistantVersionLifecycleStatus } from '../../../domain/assistants/assistant-version-lifecycle.js';

function mapLifecycleStatus(value: string): AssistantVersionLifecycleStatus {
  if (!isAssistantVersionLifecycleStatus(value)) {
    throw new Error(`Unknown assistant version lifecycle status: ${value}`);
  }

  return value;
}

export class DrizzleAssistantVersionWriteRepository implements AssistantVersionWriteRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async updateLifecycleStatus(input: {
    readonly versionId: string;
    readonly lifecycleStatus: AssistantVersionLifecycleStatus;
  }): Promise<void> {
    await this.connection.db
      .update(assistantVersionsTable)
      .set({
        lifecycleStatus: input.lifecycleStatus,
      })
      .where(eq(assistantVersionsTable.id, input.versionId));
  }

  public async publishVersionTransition(input: {
    readonly targetVersionId: string;
    readonly previousPublishedVersionId?: string;
  }): Promise<void> {
    await this.connection.db.transaction(async (transaction) => {
      if (input.previousPublishedVersionId !== undefined) {
        await transaction
          .update(assistantVersionsTable)
          .set({
            lifecycleStatus: 'deprecated',
          })
          .where(eq(assistantVersionsTable.id, input.previousPublishedVersionId));
      }

      await transaction
        .update(assistantVersionsTable)
        .set({
          lifecycleStatus: 'published',
        })
        .where(eq(assistantVersionsTable.id, input.targetVersionId));
    });
  }

  public async findById(versionId: string): Promise<AssistantVersionSummary | null> {
    const rows = await this.connection.db
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
      .where(eq(assistantVersionsTable.id, versionId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      assistantId: row.assistantId,
      versionNumber: row.versionNumber,
      lifecycleStatus: mapLifecycleStatus(row.lifecycleStatus),
      modelKey: row.modelKey,
      systemInstructions: row.systemInstructions,
      temperature: row.temperature,
      maxOutputTokens: row.maxOutputTokens,
      changeSummary: row.changeSummary,
    };
  }
}
