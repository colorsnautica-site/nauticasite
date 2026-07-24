import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";

export const CONTENT_TAG = "site-content";

export const getSiteContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await db.select().from(siteContent);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["site-content"], { tags: [CONTENT_TAG] }
);
