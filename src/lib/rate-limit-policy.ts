export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_BLOCK_MS = 15 * 60 * 1000;

export type LoginAttemptState = {
  windowStartedAt: Date;
  attemptCount: number;
  blockedUntil: Date | null;
};

export function isLoginBlocked(state: LoginAttemptState | null, now: Date): boolean {
  return Boolean(state?.blockedUntil && state.blockedUntil.getTime() > now.getTime());
}

export function nextFailedLoginState(state: LoginAttemptState | null, now: Date): LoginAttemptState {
  const windowExpired = !state || now.getTime() - state.windowStartedAt.getTime() >= LOGIN_WINDOW_MS;
  const attemptCount = windowExpired ? 1 : Math.min(LOGIN_MAX_FAILURES, state.attemptCount + 1);
  return {
    windowStartedAt: windowExpired ? now : state.windowStartedAt,
    attemptCount,
    blockedUntil: attemptCount >= LOGIN_MAX_FAILURES
      ? new Date(now.getTime() + LOGIN_BLOCK_MS)
      : (windowExpired ? null : state.blockedUntil)
  };
}
