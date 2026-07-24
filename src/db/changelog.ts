import { db } from "./client";
import { changeLog } from "./schema";

export async function recordChange(input: {
  entityType: string; entityId: string;
  action: "create" | "update" | "delete";
  before: unknown; after: unknown;
}): Promise<void> {
  await db.insert(changeLog).values({
    entityType: input.entityType, entityId: input.entityId, action: input.action,
    snapshotBefore: input.before as object | null, snapshotAfter: input.after as object | null
  });
}

// Lógica pura: dada uma entrada do log, o que fazer para desfazer.
export function computeUndo(entry: { action: string; snapshotBefore: unknown; snapshotAfter: unknown }):
  { op: "restore" | "recreate" | "delete"; data: unknown } {
  if (entry.action === "update") return { op: "restore", data: entry.snapshotBefore };
  if (entry.action === "delete") return { op: "recreate", data: entry.snapshotBefore };
  return { op: "delete", data: entry.snapshotAfter };
}
