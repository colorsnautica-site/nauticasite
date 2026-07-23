import { formatPriceLabel } from "@/lib/currency";
import type { Product } from "@/data/catalog";

// Número padrão; pode ser sobrescrito pela env NEXT_PUBLIC_WHATSAPP_NUMBER no
// projeto Vercel da landing.
const fallbackNumber = "5524998447844";

export function resolveWhatsappNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || fallbackNumber;
}

export function buildSupportMessage() {
  return "Olá, equipe Náutica Color! Vi a página de produtos e gostaria de ajuda para escolher o item certo para a minha embarcação.";
}

// Mensagem do botão "Falar no WhatsApp" de um produto da vitrine — já chega no
// atendimento com nome, código e preço de referência preenchidos.
export function buildProductMessage(product: Product) {
  const brand = product.brandName ? ` (${product.brandName})` : "";
  return `Olá, equipe Náutica Color! Tenho interesse neste produto e gostaria de confirmar disponibilidade, valor e indicação de uso:

• ${product.name}${brand}
Código: ${product.sku}
Preço de referência: ${formatPriceLabel(product.priceCents)}

Os valores do site são apenas referência. Aguardo a confirmação pelo WhatsApp. Obrigado!`;
}

export function whatsappUrl(message: string, number = fallbackNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappUrl(product: Product) {
  return whatsappUrl(buildProductMessage(product), resolveWhatsappNumber());
}
