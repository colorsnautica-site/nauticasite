import { describe, it, expect } from "vitest";
import { rowToProduct } from "./mappers";
import type { ProductRow } from "./schema";

const row: ProductRow = {
  id: 42, sku: "00865", name: "3M Adesivo", categorySlug: "adesivos-e-selantes",
  brandName: "3M", priceCents: 0, unit: "UN", stockStatus: "available",
  imageUrl: "/x.png", sortOrder: 0, createdAt: new Date(), updatedAt: new Date()
};

describe("rowToProduct", () => {
  it("converte id numérico para string e preserva campos", () => {
    const p = rowToProduct(row);
    expect(p.id).toBe("42");
    expect(p.sku).toBe("00865");
    expect(p.stockStatus).toBe("available");
  });
});
