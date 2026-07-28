import { describe, expect, it } from "vitest";
import { centsToReaisInput, parseReaisToCents } from "./money";

describe("parseReaisToCents", () => {
  it.each([
    ["1234", 123400],
    ["1.234", 123400],
    ["1234,56", 123456],
    ["1.234,56", 123456],
    ["R$ 1.234,5", 123450],
    ["", 0]
  ])("converte %s", (input, expected) => {
    expect(parseReaisToCents(input)).toBe(expected);
  });

  it.each(["12.50", "1,234.56", "1.23", "-10", "abc", "10,999", "10 00", "10.000.000,00"])(
    "rejeita formato ambíguo ou fora do limite: %s",
    (input) => expect(parseReaisToCents(input)).toBeNull()
  );
});

describe("centsToReaisInput", () => {
  it("formata para input", () => {
    expect(centsToReaisInput(1250)).toBe("12,50");
    expect(centsToReaisInput(0)).toBe("");
  });
});
