"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createProduct, deleteProduct, updateProduct, type ProductMutationInput } from "@/db/mutations";
import { PRODUCTS_TAG } from "@/db/queries/products";
import { actionErrorResult, type ActionResult, validationResult } from "@/lib/action-result";
import { idSchema, productFormSchema } from "@/lib/admin-validation";
import { deleteImageBestEffort, uploadImage } from "@/lib/blob";
import { requireAdminSession } from "@/lib/require-admin-session";

function revalidateProducts() {
  revalidateTag(PRODUCTS_TAG);
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
}

function productInput(formData: FormData) {
  return productFormSchema.safeParse({
    sku: String(formData.get("sku") ?? ""),
    name: String(formData.get("name") ?? ""),
    brandName: String(formData.get("brandName") ?? ""),
    categorySlug: String(formData.get("categorySlug") ?? ""),
    stockStatus: String(formData.get("stockStatus") ?? "available"),
    unit: String(formData.get("unit") ?? "UN"),
    precoReais: String(formData.get("precoReais") ?? "")
  });
}

function toMutationInput(value: ReturnType<typeof productFormSchema.parse>): ProductMutationInput {
  return {
    sku: value.sku,
    name: value.name,
    brandName: value.brandName,
    categorySlug: value.categorySlug,
    stockStatus: value.stockStatus,
    unit: value.unit,
    priceCents: value.precoReais
  };
}

async function uploadedImage(formData: FormData): Promise<string | null> {
  const file = formData.get("imagem");
  return file instanceof File && file.size > 0 ? uploadImage(file, "produtos") : null;
}

export async function updateProductAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formData.get("id"));
  const parsed = productInput(formData);
  if (!parsedId.success) return validationResult(parsedId.error);
  if (!parsed.success) return validationResult(parsed.error);

  let newImage: string | null = null;
  try {
    newImage = await uploadedImage(formData);
    const result = await updateProduct(parsedId.data, toMutationInput(parsed.data), newImage);
    if (result.changed) revalidateProducts();
    return {
      status: "success",
      message: result.changed ? "Produto salvo." : "Nenhuma alteração para salvar."
    };
  } catch (error) {
    await deleteImageBestEffort(newImage);
    return actionErrorResult(error);
  }
}

export async function createProductAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsed = productInput(formData);
  if (!parsed.success) return validationResult(parsed.error);

  let newImage: string | null = null;
  try {
    newImage = await uploadedImage(formData);
    await createProduct(toMutationInput(parsed.data), newImage ?? "");
    revalidateProducts();
    return { status: "success", message: "Produto adicionado." };
  } catch (error) {
    await deleteImageBestEffort(newImage);
    return actionErrorResult(error);
  }
}

export async function deleteProductAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return validationResult(parsedId.error);
  try {
    await deleteProduct(parsedId.data);
    revalidateProducts();
    return { status: "success", message: "Produto removido. A imagem foi mantida para permitir desfazer." };
  } catch (error) {
    return actionErrorResult(error);
  }
}
