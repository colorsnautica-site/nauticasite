import { describe, it, expect, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken, checkPassword } from "./auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "teste-secreto-bem-longo-para-o-jose-assinar-ok";
  process.env.ADMIN_PASSWORD = "senha123";
});

describe("sessão", () => {
  it("token válido verifica true; lixo verifica false", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
    expect(await verifySessionToken("lixo")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });
});

describe("senha", () => {
  it("compara com a env", () => {
    expect(checkPassword("senha123")).toBe(true);
    expect(checkPassword("errada")).toBe(false);
  });
});
