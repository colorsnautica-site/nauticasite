import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { partnerBrands } from "@/db/schema";
import type { PartnerBrandRow } from "@/db/schema";

export const BRANDS_TAG = "brands";

export const getBrands = unstable_cache(
  async (): Promise<PartnerBrandRow[]> => db.select().from(partnerBrands).orderBy(asc(partnerBrands.sortOrder)),
  ["brands"], { tags: [BRANDS_TAG] }
);
