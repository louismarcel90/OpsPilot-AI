import type { UserReadRepository } from '../repositories/user-read-repository.js';
import type { UserSummary } from '../../domain/identity/user-summary.js';

export interface ResolveUserByEmailInput {
  readonly email: string;
}

export class ResolveUserByEmailUseCase {
  public constructor(private readonly userReadRepository: UserReadRepository) {}

  public async execute(input: ResolveUserByEmailInput): Promise<UserSummary | null> {
    return this.userReadRepository.findByEmail(input.email);
  }
}
