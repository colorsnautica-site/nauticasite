import { describe, expect, it } from "vitest";
import { contentFormSchema, productFormSchema } from "./admin-validation";

describe("validação administrativa", () => {
  it("transforma preço e contatos válidos", () => {
    const product = productFormSchema.parse({ sku: "ABC", name: "Produto", brandName: "Marca", categorySlug: "linha-nautica", stockStatus: "available", unit: "UN", precoReais: "1.234,56" });
    expect(product.precoReais).toBe(123456);
    const content = contentFormSchema.parse({ company_name: "Náutica Color", location: "Marina", phone: "24 2404-4606", whatsapp_1: "24 99844-7844", whatsapp_2: "24 99303-7332", instagram: "@nauticacolor", hero_title: "Título", hero_description: "Descrição" });
    expect(content.whatsapp_1).toBe("+5524998447844");
  });

  it("rejeita categoria, telefone e textos inválidos", () => {
    expect(productFormSchema.safeParse({ sku: "", name: "", brandName: "", categorySlug: "x", stockStatus: "x", unit: "", precoReais: "12.50" }).success).toBe(false);
    expect(contentFormSchema.safeParse({ company_name: "", location: "", phone: "1", whatsapp_1: "2", whatsapp_2: "3", instagram: "!!!", hero_title: "", hero_description: "" }).success).toBe(false);
  });
});
