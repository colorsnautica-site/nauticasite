import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadImage(file: File, prefix: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Formato inválido. Envie JPG, PNG, WEBP ou AVIF.");
  if (file.size > MAX_BYTES) throw new Error("Imagem muito grande (máx. 5 MB).");
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const blob = await put(`${prefix}/${Date.now()}-${safeName}`, file, { access: "public" });
  return blob.url;
}
