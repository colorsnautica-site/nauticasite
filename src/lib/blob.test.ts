import { describe, expect, it } from "vitest";
import { detectImageType } from "./blob";

describe("assinatura de imagem", () => {
  it("reconhece JPEG, PNG, WebP e AVIF", () => {
    expect(detectImageType(new Uint8Array([0xff,0xd8,0xff,0x00]))).toBe("jpeg");
    expect(detectImageType(new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toBe("png");
    expect(detectImageType(new Uint8Array([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50]))).toBe("webp");
    expect(detectImageType(new Uint8Array([0,0,0,0,0x66,0x74,0x79,0x70,0x61,0x76,0x69,0x66]))).toBe("avif");
  });
  it("rejeita arquivo disfarçado", () => expect(detectImageType(new TextEncoder().encode("não é uma foto"))).toBeNull());
});
