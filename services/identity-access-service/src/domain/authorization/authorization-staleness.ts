export type AuthorizationDiagnosticState = 'fresh' | 'stale';

export const AUTHORIZATION_DIAGNOSTIC_STALE_AFTER_MILLISECONDS = 5 * 60 * 1000;

export function resolveAuthorizationDiagnosticState(
  checkedAtIso: string,
  now: Date = new Date(),
): AuthorizationDiagnosticState {
  const checkedAtMilliseconds = Date.parse(checkedAtIso);

  if (Number.isNaN(checkedAtMilliseconds)) {
    return 'stale';
  }

  const ageMilliseconds = now.getTime() - checkedAtMilliseconds;

  return ageMilliseconds > AUTHORIZATION_DIAGNOSTIC_STALE_AFTER_MILLISECONDS ? 'stale' : 'fresh';
}
