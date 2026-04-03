import type { PostgresConnection } from '@opspilot/db';

export async function checkDatabaseHealth(connection: PostgresConnection): Promise<boolean> {
  const result = await connection.pool.query('select 1 as is_alive');
  return result.rowCount === 1;
}
