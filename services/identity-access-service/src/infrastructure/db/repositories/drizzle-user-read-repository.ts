import { usersTable, type PostgresConnection } from '@opspilot/db';
import { eq } from 'drizzle-orm';
import type { UserReadRepository } from '../../../application/repositories/user-read-repository.js';
import type { UserSummary } from '../../../domain/identity/user-summary.js';

export class DrizzleUserReadRepository implements UserReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findByEmail(email: string): Promise<UserSummary | null> {
    const rows = await this.connection.db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        displayName: usersTable.displayName,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findById(userId: string): Promise<UserSummary | null> {
    const rows = await this.connection.db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        displayName: usersTable.displayName,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return rows[0] ?? null;
  }
}
