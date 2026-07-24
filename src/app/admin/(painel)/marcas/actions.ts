"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { partnerBrands } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { BRANDS_TAG } from "@/db/queries/brands";
import { requireAdminSession } from "@/lib/require-admin-session";

function revalidate() { revalidateTag(BRANDS_TAG); revalidatePath("/"); }

export async function createBrandAction(formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("logo");
  const logoUrl = file instanceof File && file.size > 0 ? await uploadImage(file, "marcas") : "";
  const [after] = await db.insert(partnerBrands).values({ name, logoUrl, sortOrder: 999 }).returning();
  await recordChange({ entityType: "partner_brand", entityId: String(after.id), action: "create", before: null, after });
  revalidate();
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(partnerBrands).where(eq(partnerBrands.id, id));
  if (!before) return;
  await db.delete(partnerBrands).where(eq(partnerBrands.id, id));
  await recordChange({ entityType: "partner_brand", entityId: String(id), action: "delete", before, after: null });
  revalidate();
}
