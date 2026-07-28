import { and, desc, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog, type ChangeLogRow } from "@/db/schema";
import { getEntryUndoEligibility } from "@/db/undo";
import type { UndoState } from "@/db/changelog";

export type HistoryItem = ChangeLogRow & {
  status: UndoState;
  statusReason?: string;
};

export async function getRecentChanges(limit = 100): Promise<HistoryItem[]> {
  const rows = await db.select().from(changeLog)
    .where(and(isNull(changeLog.archivedAt)))
    .orderBy(desc(changeLog.changedAt), desc(changeLog.id))
    .limit(limit);
  return Promise.all(rows.map(async (row) => {
    const eligibility = await getEntryUndoEligibility(row);
    return { ...row, status: eligibility.status, statusReason: eligibility.reason };
  }));
}
