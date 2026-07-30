import { del, put } from "@vercel/blob";
import { PublicActionError } from "@/lib/action-result";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 20_000;
const MIME_BY_SIGNATURE = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif"
} as const;

export type SupportedImageType = keyof typeof MIME_BY_SIGNATURE;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])) return "png";
  if (startsWith(bytes, [0x52,0x49,0x46,0x46]) && startsWith(bytes, [0x57,0x45,0x42,0x50], 8)) return "webp";

  if (startsWith(bytes, [0x66,0x74,0x79,0x70], 4)) {
    const ascii = new TextDecoder("ascii").decode(bytes.slice(8, Math.min(bytes.length, 64)));
    if (/(avif|avis)/.test(ascii)) return "avif";
  }
  return null;
}

export async function uploadImage(file: File, prefix: string): Promise<string> {
  if (file.size === 0) throw new PublicActionError("Selecione uma imagem.");
  if (file.size > MAX_IMAGE_BYTES) throw new PublicActionError("Imagem muito grande (máx. 5 MB).");

  const declared = file.type.toLowerCase();
  if (!Object.values(MIME_BY_SIGNATURE).includes(declared as (typeof MIME_BY_SIGNATURE)[SupportedImageType])) {
    throw new PublicActionError("Formato inválido. Envie JPG, PNG, WebP ou AVIF.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected || MIME_BY_SIGNATURE[detected] !== declared) {
    throw new PublicActionError("O conteúdo do arquivo não corresponde a uma imagem válida.");
  }

  const safePrefix = prefix.replace(/[^a-z0-9-]/gi, "-");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || `imagem.${detected}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const blob = await put(`${safePrefix}/${Date.now()}-${crypto.randomUUID()}-${safeName}`, file, {
      access: "public",
      abortSignal: controller.signal
    });
    return blob.url;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new PublicActionError("O envio da imagem demorou demais. Tente novamente com um arquivo menor.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function deleteImageBestEffort(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    await del(url);
  } catch (error) {
    console.warn("Não foi possível remover o Blob órfão", { url, error });
  }
}
