"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { updateSiteContent } from "@/db/mutations";
import { CONTENT_TAG } from "@/db/queries/content";
import { actionErrorResult, type ActionResult, validationResult } from "@/lib/action-result";
import { contentFormSchema } from "@/lib/admin-validation";
import { deleteImageBestEffort, uploadImage } from "@/lib/blob";
import { requireAdminSession } from "@/lib/require-admin-session";

export async function updateContentAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsed = contentFormSchema.safeParse(Object.fromEntries(
    ["company_name","location","phone","whatsapp_1","whatsapp_2","instagram","hero_title","hero_description"]
      .map((key) => [key, String(formData.get(key) ?? "")])
  ));
  if (!parsed.success) return validationResult(parsed.error);

  let newImage: string | null = null;
  try {
    const heroFile = formData.get("hero_image");
    if (heroFile instanceof File && heroFile.size > 0) newImage = await uploadImage(heroFile, "hero");
    const changed = await updateSiteContent({ ...parsed.data, ...(newImage ? { hero_image: newImage } : {}) });
    if (changed) {
      revalidateTag(CONTENT_TAG);
      revalidatePath("/");
      revalidatePath("/admin/conteudo");
    }
    return { status: "success", message: changed ? "Conteúdo salvo." : "Nenhuma alteração para salvar." };
  } catch (error) {
    await deleteImageBestEffort(newImage);
    return actionErrorResult(error);
  }
}
