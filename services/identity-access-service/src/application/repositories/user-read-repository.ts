import type { UserSummary } from '../../domain/identity/user-summary.js';

export interface UserReadRepository {
  findByEmail(email: string): Promise<UserSummary | null>;
  findById(userId: string): Promise<UserSummary | null>;
}
