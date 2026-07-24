"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { parseReaisToCents } from "@/lib/money";
import { PRODUCTS_TAG } from "@/db/queries/products";

function revalidate() {
  revalidateTag(PRODUCTS_TAG);
  revalidatePath("/");
  revalidatePath("/produtos");
}

async function readImage(formData: FormData, prefix: string): Promise<string | null> {
  const file = formData.get("imagem");
  if (file instanceof File && file.size > 0) return uploadImage(file, prefix);
  return null;
}

function readCommonFields(formData: FormData) {
  const priceCents = parseReaisToCents(String(formData.get("precoReais") ?? ""));
  if (priceCents === null) throw new Error("Preço inválido.");
  return {
    name: String(formData.get("name") ?? "").trim(),
    brandName: String(formData.get("brandName") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    stockStatus: String(formData.get("stockStatus") ?? "available"),
    priceCents
  };
}

export async function updateProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) throw new Error("Produto não encontrado.");
  const fields = readCommonFields(formData);
  const newImage = await readImage(formData, "produtos");
  const [after] = await db.update(products)
    .set({ ...fields, imageUrl: newImage ?? before.imageUrl, updatedAt: new Date() })
    .where(eq(products.id, id)).returning();
  await recordChange({ entityType: "product", entityId: String(id), action: "update", before, after });
  revalidate();
}

export async function createProductAction(formData: FormData) {
  const fields = readCommonFields(formData);
  const newImage = await readImage(formData, "produtos");
  const [after] = await db.insert(products).values({
    sku: String(formData.get("sku") ?? "").trim(),
    ...fields, unit: String(formData.get("unit") ?? "UN"), imageUrl: newImage ?? ""
  }).returning();
  await recordChange({ entityType: "product", entityId: String(after.id), action: "create", before: null, after });
  revalidate();
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) return;
  await db.delete(products).where(eq(products.id, id));
  await recordChange({ entityType: "product", entityId: String(id), action: "delete", before, after: null });
  revalidate();
}
