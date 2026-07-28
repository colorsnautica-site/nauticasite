import { eq, notInArray } from "drizzle-orm";
import { db } from "@/db/client";
import { getUndoEligibility, recordChange, type UndoEligibility } from "@/db/changelog";
import { changeLog, partnerBrands, products, siteContent, type ChangeLogRow } from "@/db/schema";
import { PublicActionError } from "@/lib/action-result";

function asDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return fallback;
}

async function readCurrentSnapshot(client: any, entry: ChangeLogRow, lock = false): Promise<unknown | null> {
  if (entry.entityType === "product") {
    let query = client.select().from(products).where(eq(products.id, Number(entry.entityId)));
    if (lock) query = query.for("update");
    const [row] = await query;
    return row ?? null;
  }
  if (entry.entityType === "partner_brand") {
    let query = client.select().from(partnerBrands).where(eq(partnerBrands.id, Number(entry.entityId)));
    if (lock) query = query.for("update");
    const [row] = await query;
    return row ?? null;
  }
  if (entry.entityType === "site_content") {
    let query = client.select().from(siteContent);
    if (lock) query = query.for("update");
    const rows = await query;
    return Object.fromEntries(rows.map((row: { key: string; value: string }) => [row.key, row.value]));
  }
  return null;
}

export async function getEntryUndoEligibility(entry: ChangeLogRow): Promise<UndoEligibility> {
  if (entry.archivedAt || entry.revertedAt) return getUndoEligibility(entry, null);
  return getUndoEligibility(entry, await readCurrentSnapshot(db, entry));
}

async function replaceContent(client: any, snapshot: Record<string, string>): Promise<Record<string, string>> {
  const keys = Object.keys(snapshot);
  if (keys.length === 0) await client.delete(siteContent);
  else await client.delete(siteContent).where(notInArray(siteContent.key, keys));
  for (const [key, value] of Object.entries(snapshot)) {
    await client.insert(siteContent).values({ key, value })
      .onConflictDoUpdate({ target: siteContent.key, set: { value } });
  }
  const rows = await client.select().from(siteContent);
  return Object.fromEntries(rows.map((row: { key: string; value: string }) => [row.key, row.value]));
}

export async function undoChange(logId: number): Promise<void> {
  await db.transaction(async (tx) => {
    const [entry] = await tx.select().from(changeLog).where(eq(changeLog.id, logId)).for("update");
    if (!entry) throw new PublicActionError("Alteração não encontrada.");

    const current = await readCurrentSnapshot(tx, entry, true);
    const eligibility = getUndoEligibility(entry, current);
    if (eligibility.status !== "undoable") {
      throw new PublicActionError(eligibility.reason ?? "Esta alteração não pode mais ser desfeita.");
    }

    let reversal: {
      entityType: "product" | "site_content" | "partner_brand";
      entityId: string;
      action: "create" | "update" | "delete";
      before: unknown;
      after: unknown;
    };

    if (entry.entityType === "product") {
      const id = Number(entry.entityId);
      if (entry.action === "update") {
        const snapshot = entry.snapshotBefore as any;
        const { id: _id, ...fields } = snapshot;
        const [after] = await tx.update(products).set({
          ...fields,
          createdAt: asDate(fields.createdAt),
          updatedAt: asDate(fields.updatedAt)
        }).where(eq(products.id, id)).returning();
        reversal = { entityType: "product", entityId: String(id), action: "update", before: current, after };
      } else if (entry.action === "delete") {
        const snapshot = entry.snapshotBefore as any;
        const { id: _id, ...fields } = snapshot;
        const [after] = await tx.insert(products).values({
          ...fields,
          createdAt: asDate(fields.createdAt),
          updatedAt: asDate(fields.updatedAt)
        }).returning();
        reversal = { entityType: "product", entityId: String(after.id), action: "create", before: null, after };
      } else {
        const [before] = await tx.delete(products).where(eq(products.id, id)).returning();
        reversal = { entityType: "product", entityId: String(id), action: "delete", before, after: null };
      }
    } else if (entry.entityType === "partner_brand") {
      const id = Number(entry.entityId);
      if (entry.action === "update") {
        const snapshot = entry.snapshotBefore as any;
        const { id: _id, ...fields } = snapshot;
        const [after] = await tx.update(partnerBrands).set(fields).where(eq(partnerBrands.id, id)).returning();
        reversal = { entityType: "partner_brand", entityId: String(id), action: "update", before: current, after };
      } else if (entry.action === "delete") {
        const snapshot = entry.snapshotBefore as any;
        const { id: _id, ...fields } = snapshot;
        const [after] = await tx.insert(partnerBrands).values(fields).returning();
        reversal = { entityType: "partner_brand", entityId: String(after.id), action: "create", before: null, after };
      } else {
        const [before] = await tx.delete(partnerBrands).where(eq(partnerBrands.id, id)).returning();
        reversal = { entityType: "partner_brand", entityId: String(id), action: "delete", before, after: null };
      }
    } else if (entry.entityType === "site_content" && entry.action === "update") {
      const after = await replaceContent(tx, entry.snapshotBefore as Record<string, string>);
      reversal = { entityType: "site_content", entityId: "site", action: "update", before: current, after };
    } else {
      throw new PublicActionError("Tipo de alteração inválido.");
    }

    await tx.update(changeLog).set({ revertedAt: new Date() }).where(eq(changeLog.id, entry.id));
    await recordChange({ ...reversal, reversalOfId: entry.id }, tx);
  });
}
