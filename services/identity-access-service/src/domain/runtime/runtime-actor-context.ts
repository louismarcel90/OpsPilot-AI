export type RuntimeActorKind = 'human' | 'system';

export type RuntimeActorRole = 'operator' | 'admin' | 'approval_decider' | 'system';

export interface RuntimeActorContext {
  readonly actorId: string;
  readonly workspaceId: string;
  readonly actorKind: RuntimeActorKind;
  readonly role: RuntimeActorRole;
}
