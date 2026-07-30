import { describe, expect, it } from "vitest";
import { isLoginBlocked, LOGIN_BLOCK_MS, LOGIN_WINDOW_MS, nextFailedLoginState } from "./rate-limit-policy";

describe("rate limit de login", () => {
  it("bloqueia na quinta falha por quinze minutos", () => {
    const now = new Date("2026-07-28T12:00:00.000Z");
    let state = null;
    for (let attempt = 0; attempt < 5; attempt++) state = nextFailedLoginState(state, now);
    expect(state!.attemptCount).toBe(5);
    expect(state!.blockedUntil?.getTime()).toBe(now.getTime() + LOGIN_BLOCK_MS);
    expect(isLoginBlocked(state, now)).toBe(true);
  });

  it("reinicia o contador depois da janela", () => {
    const started = new Date("2026-07-28T12:00:00.000Z");
    const state = nextFailedLoginState({ windowStartedAt: started, attemptCount: 4, blockedUntil: null }, new Date(started.getTime() + LOGIN_WINDOW_MS));
    expect(state.attemptCount).toBe(1);
  });
});
