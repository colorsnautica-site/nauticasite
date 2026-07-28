"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createPartnerBrand, deletePartnerBrand } from "@/db/mutations";
import { BRANDS_TAG } from "@/db/queries/brands";
import { actionErrorResult, type ActionResult, validationResult } from "@/lib/action-result";
import { brandFormSchema, idSchema } from "@/lib/admin-validation";
import { deleteImageBestEffort, uploadImage } from "@/lib/blob";
import { requireAdminSession } from "@/lib/require-admin-session";

function revalidateBrands() {
  revalidateTag(BRANDS_TAG);
  revalidatePath("/");
  revalidatePath("/admin/marcas");
}

export async function createBrandAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Envie o logo da marca.", fieldErrors: { logo: ["O logo é obrigatório."] } };
  }

  let logoUrl: string | null = null;
  try {
    logoUrl = await uploadImage(file, "marcas");
    const parsed = brandFormSchema.safeParse({ name: String(formData.get("name") ?? ""), logoUrl });
    if (!parsed.success) {
      await deleteImageBestEffort(logoUrl);
      return validationResult(parsed.error);
    }
    await createPartnerBrand(parsed.data.name, parsed.data.logoUrl);
    revalidateBrands();
    return { status: "success", message: "Marca adicionada." };
  } catch (error) {
    await deleteImageBestEffort(logoUrl);
    return actionErrorResult(error);
  }
}

export async function deleteBrandAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return validationResult(parsedId.error);
  try {
    await deletePartnerBrand(parsedId.data);
    revalidateBrands();
    return { status: "success", message: "Marca removida. O logo foi mantido para permitir desfazer." };
  } catch (error) {
    return actionErrorResult(error);
  }
}
