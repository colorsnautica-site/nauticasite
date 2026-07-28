import { z } from "zod";
import { CATEGORY_SLUGS } from "@/db/schema";
import { MAX_PRICE_CENTS, parseReaisToCents } from "@/lib/money";
import { normalizeBrazilPhone, normalizeInstagram } from "@/lib/phone";

export const idSchema = z.coerce.number().int().positive("Identificador inválido.");

const priceSchema = z.string().transform((value, context) => {
  const cents = parseReaisToCents(value);
  if (cents === null || cents > MAX_PRICE_CENTS) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um preço no formato brasileiro." });
    return z.NEVER;
  }
  return cents;
});

const phoneSchema = z.string().trim().transform((value, context) => {
  const normalized = normalizeBrazilPhone(value);
  if (!normalized) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um telefone brasileiro válido." });
    return z.NEVER;
  }
  return normalized;
});

const instagramSchema = z.string().trim().transform((value, context) => {
  const normalized = normalizeInstagram(value);
  if (!normalized) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um perfil do Instagram válido." });
    return z.NEVER;
  }
  return normalized;
});

export const productFormSchema = z.object({
  sku: z.string().trim().max(80, "Use no máximo 80 caracteres."),
  name: z.string().trim().min(1, "Informe o nome.").max(255, "Use no máximo 255 caracteres."),
  brandName: z.string().trim().max(120, "Use no máximo 120 caracteres."),
  categorySlug: z.enum(CATEGORY_SLUGS, { errorMap: () => ({ message: "Categoria inválida." }) }),
  stockStatus: z.enum(["available", "on_request"], { errorMap: () => ({ message: "Status inválido." }) }),
  unit: z.string().trim().min(1, "Informe a unidade.").max(16, "Use no máximo 16 caracteres.")
    .regex(/^[\p{L}\p{N} ._/-]+$/u, "Unidade inválida."),
  precoReais: priceSchema
});

export const contentFormSchema = z.object({
  company_name: z.string().trim().min(1, "Informe o nome da empresa.").max(120),
  location: z.string().trim().min(1, "Informe o endereço.").max(300),
  phone: phoneSchema,
  whatsapp_1: phoneSchema,
  whatsapp_2: phoneSchema,
  instagram: instagramSchema,
  hero_title: z.string().trim().min(1, "Informe o título.").max(160),
  hero_description: z.string().trim().min(1, "Informe a descrição.").max(600)
});

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(120),
  logoUrl: z.string().trim().max(2048).refine(
    (value) => /^https:\/\//i.test(value) || value.startsWith("/"),
    "Envie um logo válido."
  )
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ContentFormValues = z.infer<typeof contentFormSchema>;
