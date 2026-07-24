import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { rowToProduct } from "@/db/mappers";
import type { Product } from "@/data/catalog";

export const PRODUCTS_TAG = "products";

export const getAllProductsDb = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
    return rows.map(rowToProduct);
  },
  ["all-products"], { tags: [PRODUCTS_TAG] }
);

export const getProductsByCategoryDb = unstable_cache(
  async (slug: string): Promise<Product[]> => {
    const rows = await db.select().from(products).where(eq(products.categorySlug, slug))
      .orderBy(asc(products.sortOrder), asc(products.id));
    return rows.map(rowToProduct);
  },
  ["products-by-category"], { tags: [PRODUCTS_TAG] }
);
