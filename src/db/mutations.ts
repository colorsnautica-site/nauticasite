import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { recordChange, snapshotsEqual } from "@/db/changelog";
import { partnerBrands, products, siteContent, type ProductRow } from "@/db/schema";
import { PublicActionError } from "@/lib/action-result";

export type ProductMutationInput = {
  sku: string;
  name: string;
  brandName: string;
  categorySlug: string;
  stockStatus: "available" | "on_request";
  unit: string;
  priceCents: number;
};

function productComparable(row: ProductRow | ProductMutationInput & { imageUrl: string }) {
  return {
    sku: row.sku,
    name: row.name,
    brandName: row.brandName,
    categorySlug: row.categorySlug,
    stockStatus: row.stockStatus,
    unit: row.unit,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl
  };
}

export async function updateProduct(
  id: number,
  input: ProductMutationInput,
  newImageUrl?: string | null
): Promise<{ row: ProductRow; changed: boolean }> {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(products).where(eq(products.id, id)).for("update");
    if (!before) throw new PublicActionError("Produto não encontrado.");
    const desired = { ...input, imageUrl: newImageUrl ?? before.imageUrl };
    if (snapshotsEqual(productComparable(before), desired)) return { row: before, changed: false };

    const [after] = await tx.update(products)
      .set({ ...desired, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    await recordChange({
      entityType: "product", entityId: String(id), action: "update", before, after
    }, tx);
    return { row: after, changed: true };
  });
}

export async function createProduct(input: ProductMutationInput, imageUrl: string): Promise<ProductRow> {
  return db.transaction(async (tx) => {
    const [after] = await tx.insert(products).values({ ...input, imageUrl }).returning();
    await recordChange({
      entityType: "product", entityId: String(after.id), action: "create", before: null, after
    }, tx);
    return after;
  });
}

export async function deleteProduct(id: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(products).where(eq(products.id, id)).for("update");
    if (!before) throw new PublicActionError("Produto não encontrado.");
    await tx.delete(products).where(eq(products.id, id));
    await recordChange({
      entityType: "product", entityId: String(id), action: "delete", before, after: null
    }, tx);
    return true;
  });
}

async function contentSnapshot(client: any): Promise<Record<string, string>> {
  return Object.fromEntries((await client.select().from(siteContent)).map((row: { key: string; value: string }) => [row.key, row.value]));
}

export async function updateSiteContent(values: Record<string, string>): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(siteContent).for("update");
    const before = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const desired = { ...before, ...values };
    if (snapshotsEqual(before, desired)) return false;

    for (const [key, value] of Object.entries(values)) {
      await tx.insert(siteContent).values({ key, value })
        .onConflictDoUpdate({ target: siteContent.key, set: { value } });
    }
    const after = await contentSnapshot(tx);
    await recordChange({
      entityType: "site_content", entityId: "site", action: "update", before, after
    }, tx);
    return true;
  });
}

export async function createPartnerBrand(name: string, logoUrl: string) {
  return db.transaction(async (tx) => {
    const [last] = await tx.select({ sortOrder: partnerBrands.sortOrder }).from(partnerBrands)
      .orderBy(desc(partnerBrands.sortOrder)).for("update");
    const [after] = await tx.insert(partnerBrands)
      .values({ name, logoUrl, sortOrder: (last?.sortOrder ?? -1) + 1 })
      .returning();
    await recordChange({
      entityType: "partner_brand", entityId: String(after.id), action: "create", before: null, after
    }, tx);
    return after;
  });
}

export async function deletePartnerBrand(id: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(partnerBrands).where(eq(partnerBrands.id, id)).for("update");
    if (!before) throw new PublicActionError("Marca não encontrada.");
    await tx.delete(partnerBrands).where(eq(partnerBrands.id, id));
    await recordChange({
      entityType: "partner_brand", entityId: String(id), action: "delete", before, after: null
    }, tx);
    return true;
  });
}
