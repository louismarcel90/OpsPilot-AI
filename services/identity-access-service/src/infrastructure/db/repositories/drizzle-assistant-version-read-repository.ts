import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { assistantVersionsTable } from '@opspilot/db';

import type { AssistantVersionReadRepository } from '../../../application/repositories/assistant-version-read-repository.js';
import type { AssistantVersionSummary } from '../../../domain/assistants/assistant-version-summary.js';
import {
  isAssistantVersionLifecycleStatus,
  type AssistantVersionLifecycleStatus,
} from '../../../domain/assistants/assistant-version-lifecycle.js';

function mapLifecycleStatus(value: string): AssistantVersionLifecycleStatus {
  if (!isAssistantVersionLifecycleStatus(value)) {
    throw new Error(`Unknown assistant version lifecycle status: ${value}`);
  }

  return value;
}

export class DrizzleAssistantVersionReadRepository implements AssistantVersionReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listByAssistantId(assistantId: string): Promise<AssistantVersionSummary[]> {
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
      .where(eq(assistantVersionsTable.assistantId, assistantId))
      .orderBy(asc(assistantVersionsTable.versionNumber));

    return rows.map((row) => ({
      id: row.id,
      assistantId: row.assistantId,
      versionNumber: row.versionNumber,
      lifecycleStatus: mapLifecycleStatus(row.lifecycleStatus),
      modelKey: row.modelKey,
      systemInstructions: row.systemInstructions,
      temperature: row.temperature,
      maxOutputTokens: row.maxOutputTokens,
      changeSummary: row.changeSummary,
    }));
  }

  public async findPublishedByAssistantId(
    assistantId: string,
  ): Promise<AssistantVersionSummary | null> {
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
      .where(eq(assistantVersionsTable.assistantId, assistantId))
      .orderBy(asc(assistantVersionsTable.versionNumber));

    const publishedRows = rows.filter(
      (row) => mapLifecycleStatus(row.lifecycleStatus) === 'published',
    );

    const publishedRow = publishedRows.at(-1);

    if (!publishedRow) {
      return null;
    }

    return {
      id: publishedRow.id,
      assistantId: publishedRow.assistantId,
      versionNumber: publishedRow.versionNumber,
      lifecycleStatus: mapLifecycleStatus(publishedRow.lifecycleStatus),
      modelKey: publishedRow.modelKey,
      systemInstructions: publishedRow.systemInstructions,
      temperature: publishedRow.temperature,
      maxOutputTokens: publishedRow.maxOutputTokens,
      changeSummary: publishedRow.changeSummary,
    };
  }
}
