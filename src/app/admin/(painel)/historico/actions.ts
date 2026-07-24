"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog, products, partnerBrands, siteContent } from "@/db/schema";
import { computeUndo, recordChange } from "@/db/changelog";
import { PRODUCTS_TAG } from "@/db/queries/products";
import { BRANDS_TAG } from "@/db/queries/brands";
import { CONTENT_TAG } from "@/db/queries/content";
import { requireAdminSession } from "@/lib/require-admin-session";

export async function undoAction(formData: FormData) {
  await requireAdminSession();
  const logId = Number(formData.get("logId"));
  const [entry] = await db.select().from(changeLog).where(eq(changeLog.id, logId));
  if (!entry) return;
  const { op, data } = computeUndo(entry);

  if (entry.entityType === "product") {
    const id = Number(entry.entityId);
    if (op === "restore") { const { id: _i, createdAt, updatedAt, ...rest } = data as any; await db.update(products).set({ ...rest, updatedAt: new Date() }).where(eq(products.id, id)); }
    if (op === "recreate") { const { id: _i, ...rest } = data as any; await db.insert(products).values(rest); }
    if (op === "delete") await db.delete(products).where(eq(products.id, id));
    revalidateTag(PRODUCTS_TAG);
    revalidatePath("/produtos");
  } else if (entry.entityType === "partner_brand") {
    const id = Number(entry.entityId);
    if (op === "restore") { const { id: _i, ...rest } = data as any; await db.update(partnerBrands).set(rest).where(eq(partnerBrands.id, id)); }
    if (op === "recreate") { const { id: _i, ...rest } = data as any; await db.insert(partnerBrands).values(rest); }
    if (op === "delete") await db.delete(partnerBrands).where(eq(partnerBrands.id, id));
    revalidateTag(BRANDS_TAG);
  } else if (entry.entityType === "site_content") {
    const map = data as Record<string, string>;
    for (const [key, value] of Object.entries(map)) {
      await db.insert(siteContent).values({ key, value }).onConflictDoUpdate({ target: siteContent.key, set: { value } });
    }
    revalidateTag(CONTENT_TAG);
  }

  // Registra a própria reversão como nova entrada (permite refazer).
  await recordChange({ entityType: entry.entityType, entityId: entry.entityId, action: "update", before: entry.snapshotAfter, after: entry.snapshotBefore });
  revalidatePath("/");
}
