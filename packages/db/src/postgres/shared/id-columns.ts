import { text } from 'drizzle-orm/pg-core';

export function createPrimaryIdColumn(columnName: string = 'id') {
  return text(columnName).primaryKey();
}
