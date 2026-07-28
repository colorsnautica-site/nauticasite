import { beforeEach, describe, expect, it } from "vitest";
import { createSessionToken, getSessionSecret, verifySessionToken } from "./auth";
import { checkPassword } from "./admin-password";

beforeEach(() => {
  process.env.SESSION_SECRET = "teste-secreto-bem-longo-para-o-jose-assinar-ok";
  process.env.ADMIN_PASSWORD = "senha-administrativa-forte";
});

describe("sessão", () => {
  it("aceita token válido e rejeita lixo", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
    expect(await verifySessionToken("lixo")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });

  it("exige segredo com pelo menos 32 caracteres", () => {
    process.env.SESSION_SECRET = "curto";
    expect(() => getSessionSecret()).toThrow(/32/);
  });
});

describe("senha", () => {
  it("compara a senha sem depender do tamanho", () => {
    expect(checkPassword("senha-administrativa-forte")).toBe(true);
    expect(checkPassword("errada")).toBe(false);
  });

  it("recusa configuração com senha curta", () => {
    process.env.ADMIN_PASSWORD = "senha123";
    expect(() => checkPassword("senha123")).toThrow(/14/);
  });
});
