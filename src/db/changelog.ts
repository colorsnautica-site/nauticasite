import { changeLog } from "./schema";

type ChangeLogWriter = Pick<typeof import("./client").db, "insert">;

export async function recordChange(input: {
  entityType: "product" | "site_content" | "partner_brand";
  entityId: string;
  action: "create" | "update" | "delete";
  before: unknown;
  after: unknown;
  reversalOfId?: number | null;
}, client?: ChangeLogWriter): Promise<void> {
  const writer = client ?? (await import("./client")).db;
  await writer.insert(changeLog).values({
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    snapshotBefore: input.before as object | null,
    snapshotAfter: input.after as object | null,
    reversalOfId: input.reversalOfId ?? null
  });
}

export function computeUndo(entry: { action: string; snapshotBefore: unknown; snapshotAfter: unknown }):
  { op: "restore" | "recreate" | "delete"; data: unknown } {
  if (entry.action === "update") return { op: "restore", data: entry.snapshotBefore };
  if (entry.action === "delete") return { op: "recreate", data: entry.snapshotBefore };
  return { op: "delete", data: entry.snapshotAfter };
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function snapshotsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

export type UndoState = "undoable" | "reverted" | "stale";
export type UndoEligibility = { status: UndoState; reason?: string };

export function getUndoEligibility(
  entry: { action: string; snapshotAfter: unknown; archivedAt?: Date | string | null; revertedAt?: Date | string | null },
  currentSnapshot: unknown | null
): UndoEligibility {
  if (entry.archivedAt) return { status: "stale", reason: "Esta alteração foi arquivada." };
  if (entry.revertedAt) return { status: "reverted", reason: "Esta alteração já foi desfeita." };

  if (entry.action === "delete") {
    return currentSnapshot === null
      ? { status: "undoable" }
      : { status: "stale", reason: "O registro foi recriado ou alterado depois desta exclusão." };
  }

  return snapshotsEqual(currentSnapshot, entry.snapshotAfter)
    ? { status: "undoable" }
    : { status: "stale", reason: "O registro mudou depois desta alteração." };
}
