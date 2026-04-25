import type { RuntimeActorContext } from '../../domain/runtime/runtime-actor-context.js';

export interface RuntimeActorContextResolver {
  resolve(input: {
    readonly actorId: string;
    readonly workspaceId: string;
  }): Promise<RuntimeActorContext | null>;
}
