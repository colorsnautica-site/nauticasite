"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { CONTENT_TAG } from "@/db/queries/content";
import { requireAdminSession } from "@/lib/require-admin-session";

const TEXT_KEYS = ["company_name","location","phone","whatsapp_1","whatsapp_2","instagram","hero_title","hero_description"];

async function snapshot(): Promise<Record<string, string>> {
  return Object.fromEntries((await db.select().from(siteContent)).map((r) => [r.key, r.value]));
}

export async function updateContentAction(formData: FormData) {
  await requireAdminSession();
  const before = await snapshot();
  for (const key of TEXT_KEYS) {
    const value = String(formData.get(key) ?? "");
    await db.insert(siteContent).values({ key, value })
      .onConflictDoUpdate({ target: siteContent.key, set: { value } });
  }
  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    const url = await uploadImage(heroFile, "hero");
    await db.insert(siteContent).values({ key: "hero_image", value: url })
      .onConflictDoUpdate({ target: siteContent.key, set: { value: url } });
  }
  const after = await snapshot();
  await recordChange({ entityType: "site_content", entityId: "site", action: "update", before, after });
  revalidateTag(CONTENT_TAG);
  revalidatePath("/");
}
