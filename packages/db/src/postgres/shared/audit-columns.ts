import { text } from 'drizzle-orm/pg-core';

export function createActorAuditColumns() {
  return {
    createdByActorId: text('created_by_actor_id'),
    updatedByActorId: text('updated_by_actor_id'),
  };
}
