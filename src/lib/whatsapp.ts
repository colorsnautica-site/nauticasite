import { phoneToDigits } from "@/lib/phone";

// Número padrão; pode ser sobrescrito pela env NEXT_PUBLIC_WHATSAPP_NUMBER no
// projeto Vercel da landing.
const fallbackNumber = "5524998447844";

export function resolveWhatsappNumber(contentValue?: string) {
  return phoneToDigits(contentValue ?? "")
    ?? phoneToDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "")
    ?? fallbackNumber;
}

export function buildSupportMessage() {
  return "Olá, equipe Náutica Color! Vi a página de produtos e gostaria de ajuda para escolher o item certo para a minha embarcação.";
}

export function whatsappUrl(message: string, number = fallbackNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
