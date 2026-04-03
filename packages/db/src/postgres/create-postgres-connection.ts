import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { DatabaseConfig } from '@opspilot/config';

import { databaseSchema } from './database-schema.js';

export interface PostgresConnection {
  readonly pool: Pool;
  readonly db: NodePgDatabase<typeof databaseSchema>;
  close(): Promise<void>;
}

export function createPostgresConnection(config: DatabaseConfig): PostgresConnection {
  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  const db = drizzle(pool, {
    schema: databaseSchema,
  });

  return {
    pool,
    db,
    async close(): Promise<void> {
      await pool.end();
    },
  };
}
