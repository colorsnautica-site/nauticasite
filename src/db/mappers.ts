import type { Product } from "@/data/catalog";
import type { ProductRow } from "./schema";

export function rowToProduct(row: ProductRow): Product {
  return {
    id: String(row.id), sku: row.sku, name: row.name, categorySlug: row.categorySlug,
    brandName: row.brandName, priceCents: row.priceCents, unit: row.unit,
    stockStatus: row.stockStatus === "on_request" ? "on_request" : "available",
    imageUrl: row.imageUrl
  };
}
