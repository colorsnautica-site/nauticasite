"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { undoChange } from "@/db/undo";
import { BRANDS_TAG } from "@/db/queries/brands";
import { CONTENT_TAG } from "@/db/queries/content";
import { PRODUCTS_TAG } from "@/db/queries/products";
import { actionErrorResult, type ActionResult, validationResult } from "@/lib/action-result";
import { idSchema } from "@/lib/admin-validation";
import { requireAdminSession } from "@/lib/require-admin-session";

export async function undoAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formData.get("logId"));
  if (!parsedId.success) return validationResult(parsedId.error);
  try {
    await undoChange(parsedId.data);
    revalidateTag(PRODUCTS_TAG);
    revalidateTag(BRANDS_TAG);
    revalidateTag(CONTENT_TAG);
    revalidatePath("/");
    revalidatePath("/produtos");
    revalidatePath("/admin");
    return { status: "success", message: "Alteração desfeita. Use a nova entrada para refazer." };
  } catch (error) {
    return actionErrorResult(error);
  }
}
