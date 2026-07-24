import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog } from "@/db/schema";
import type { ChangeLogRow } from "@/db/schema";

export async function getRecentChanges(limit = 100): Promise<ChangeLogRow[]> {
  return db.select().from(changeLog).orderBy(desc(changeLog.changedAt)).limit(limit);
}
