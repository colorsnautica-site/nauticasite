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

const STALE_UNDO_ERROR = "Este item não existe mais; não é possível desfazer.";

export async function undoAction(formData: FormData) {
  await requireAdminSession();
  const logId = Number(formData.get("logId"));
  const [entry] = await db.select().from(changeLog).where(eq(changeLog.id, logId));
  if (!entry) return;
  const { op, data } = computeUndo(entry);

  // Reflete o que REALMENTE aconteceu na reversão (não um "update" genérico):
  // - recreate gera um id novo (serial nunca reaproveita id) => a reversão é um "create" com o id real inserido.
  // - restore é um update de verdade, sem troca de id.
  // - delete é uma remoção de verdade.
  let reversal: { action: "create" | "update" | "delete"; entityId: string; before: unknown; after: unknown };

  if (entry.entityType === "product") {
    const id = Number(entry.entityId);
    if (op === "restore") {
      const { id: _i, createdAt, updatedAt, ...rest } = data as any;
      const updated = await db.update(products).set({ ...rest, updatedAt: new Date() }).where(eq(products.id, id)).returning();
      if (updated.length === 0) throw new Error(STALE_UNDO_ERROR);
      reversal = { action: "update", entityId: entry.entityId, before: entry.snapshotAfter, after: entry.snapshotBefore };
    } else if (op === "recreate") {
      const { id: _i, ...rest } = data as any;
      const [inserted] = await db.insert(products).values(rest).returning();
      reversal = { action: "create", entityId: String(inserted.id), before: null, after: inserted };
    } else {
      const deleted = await db.delete(products).where(eq(products.id, id)).returning();
      if (deleted.length === 0) throw new Error(STALE_UNDO_ERROR);
      reversal = { action: "delete", entityId: entry.entityId, before: entry.snapshotAfter, after: null };
    }
    revalidateTag(PRODUCTS_TAG);
    revalidatePath("/produtos");
  } else if (entry.entityType === "partner_brand") {
    const id = Number(entry.entityId);
    if (op === "restore") {
      const { id: _i, ...rest } = data as any;
      const updated = await db.update(partnerBrands).set(rest).where(eq(partnerBrands.id, id)).returning();
      if (updated.length === 0) throw new Error(STALE_UNDO_ERROR);
      reversal = { action: "update", entityId: entry.entityId, before: entry.snapshotAfter, after: entry.snapshotBefore };
    } else if (op === "recreate") {
      const { id: _i, ...rest } = data as any;
      const [inserted] = await db.insert(partnerBrands).values(rest).returning();
      reversal = { action: "create", entityId: String(inserted.id), before: null, after: inserted };
    } else {
      const deleted = await db.delete(partnerBrands).where(eq(partnerBrands.id, id)).returning();
      if (deleted.length === 0) throw new Error(STALE_UNDO_ERROR);
      reversal = { action: "delete", entityId: entry.entityId, before: entry.snapshotAfter, after: null };
    }
    revalidateTag(BRANDS_TAG);
  } else if (entry.entityType === "site_content") {
    const map = data as Record<string, string>;
    for (const [key, value] of Object.entries(map)) {
      await db.insert(siteContent).values({ key, value }).onConflictDoUpdate({ target: siteContent.key, set: { value } });
    }
    reversal = { action: "update", entityId: entry.entityId, before: entry.snapshotAfter, after: entry.snapshotBefore };
    revalidateTag(CONTENT_TAG);
  } else {
    return;
  }

  // Registra a própria reversão como nova entrada (permite refazer).
  await recordChange({ entityType: entry.entityType, entityId: reversal.entityId, action: reversal.action, before: reversal.before, after: reversal.after });
  revalidatePath("/");
}
