import { describe, expect, it } from "vitest";
import { instagramUrl, normalizeBrazilPhone, normalizeInstagram, phoneToDigits } from "./phone";

describe("telefones brasileiros", () => {
  it.each([
    ["(24) 99844-7844", "+5524998447844"],
    ["24 2404-4606", "+552424044606"],
    ["+55 (24) 99303-7332", "+5524993037332"],
    ["005524998447844", "+5524998447844"]
  ])("normaliza %s", (input, expected) => expect(normalizeBrazilPhone(input)).toBe(expected));

  it.each(["", "123", "(00) 99999-9999", "(24) 89999-9999", "(24) 1111-1111"])(
    "rejeita %s", (input) => expect(normalizeBrazilPhone(input)).toBeNull()
  );

  it("gera os dígitos usados no wa.me", () => {
    expect(phoneToDigits("+55 24 99844-7844")).toBe("5524998447844");
  });
});

describe("Instagram", () => {
  it("normaliza handle e gera link", () => {
    expect(normalizeInstagram("https://instagram.com/nauticacolor/ ")).toBe("@nauticacolor");
    expect(instagramUrl("@nauticacolor")).toBe("https://www.instagram.com/nauticacolor/");
  });
});
