import { describe, it, expect } from "vitest";
import { parseReaisToCents, centsToReaisInput } from "./money";

describe("parseReaisToCents", () => {
  it("aceita virgula, ponto e prefixo R$", () => {
    expect(parseReaisToCents("12,50")).toBe(1250);
    expect(parseReaisToCents("12.50")).toBe(1250);
    expect(parseReaisToCents("R$ 12,50")).toBe(1250);
    expect(parseReaisToCents("100")).toBe(10000);
  });
  it("vazio vira 0 (Sob consulta)", () => { expect(parseReaisToCents("")).toBe(0); });
  it("invalido vira null", () => { expect(parseReaisToCents("abc")).toBeNull(); });
});

describe("centsToReaisInput", () => {
  it("formata para input", () => {
    expect(centsToReaisInput(1250)).toBe("12,50");
    expect(centsToReaisInput(0)).toBe("");
  });
});
